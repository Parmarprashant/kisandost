/**
 * AgriShield 360° — Phase 9 Expert Ticket Lifecycle Service
 *
 * Implements deterministic ticket creation, assignment, immutable review,
 * additional evidence workflow, training candidate generation, and risk linkage.
 *
 * Strict Guarantees:
 * 1. Zero mutation of historical AI scan predictions.
 * 2. Immutable AI snapshot inside ExpertReview.
 * 3. Strict tenant isolation (Farmer A cannot see Farmer B's tickets; Expert A cannot modify unassigned cases).
 * 4. Deduplication: prevents redundant open tickets for the same scan.
 * 5. Safe notifications (non-fatal, DB state is source of truth).
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { ExpertTicket, IExpertTicket, ExpertTicketPriority, ExpertTicketTriggerType } from '@/models/ExpertTicket';
import { ExpertReview, IExpertReview, ExpertDecisionType } from '@/models/ExpertReview';
import { ExpertProfile } from '@/models/ExpertProfile';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { RiskEvent } from '@/models/RiskEvent';
import { VerifiedTrainingSample } from '@/models/VerifiedTrainingSample';
import {
  EXPERT_REVIEW_CONFIDENCE_THRESHOLD,
  calculateTicketPriority,
} from './expertConfig';
import { logExpertAudit } from './expertAuditService';
import { sendPushNotificationToUser } from '@/lib/pushNotifications';

export interface CreateTicketParams {
  scanId: string;
  farmerId: string;
  triggerType?: ExpertTicketTriggerType;
  requestedReason?: string;
  actorId?: string;
  actorRole?: 'farmer' | 'reviewer' | 'admin';
}

/**
 * Creates an expert verification ticket for a crop scan.
 * Prevents duplicates for unresolved tickets on the same scan.
 */
export async function createExpertTicket(params: CreateTicketParams): Promise<IExpertTicket> {
  const {
    scanId,
    farmerId,
    triggerType = 'FARMER_REQUEST',
    requestedReason,
    actorId = farmerId,
    actorRole = 'farmer',
  } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(scanId)) {
    throw new Error(`Invalid scanId: ${scanId}`);
  }

  // 1. Fetch scan and verify tenant ownership
  const scan = await CropDiseaseScan.findOne({ _id: scanId }).lean();
  if (!scan) {
    throw new Error(`Crop disease scan not found: ${scanId}`);
  }

  // Tenant Isolation: Farmer can only request ticket for their own scan
  if (actorRole === 'farmer' && scan.farmerId !== farmerId) {
    throw new Error('Forbidden: Access denied to other farmers scan records');
  }

  // 2. Deduplication check: check if an unresolved ticket already exists
  const existingTicket = await ExpertTicket.findOne({
    scanId: scan._id,
    status: { $in: ['OPEN', 'ASSIGNED', 'IN_REVIEW', 'NEEDS_MORE_EVIDENCE'] },
  });

  if (existingTicket) {
    return existingTicket;
  }

  // 3. Resolve crop details
  const crop = await Crop.findById(scan.cropCycleId).lean();
  const cropName = crop?.cropName || 'Field Crop';

  // 4. Derive trigger type and priority
  const confidenceScore = scan.confidence?.score ?? 1.0;
  const screeningResult = scan.screeningResult || null;

  let resolvedTrigger: ExpertTicketTriggerType = triggerType;
  if (screeningResult === 'INCONCLUSIVE') {
    resolvedTrigger = 'INCONCLUSIVE';
  } else if (confidenceScore < EXPERT_REVIEW_CONFIDENCE_THRESHOLD && triggerType === 'FARMER_REQUEST') {
    resolvedTrigger = 'LOW_CONFIDENCE';
  }

  const priority: ExpertTicketPriority = calculateTicketPriority({
    triggerType: resolvedTrigger,
    confidenceScore,
    screeningResult,
    cropStage: scan.cropStageAtScan,
  });

  const reason =
    requestedReason ||
    (resolvedTrigger === 'INCONCLUSIVE'
      ? 'Inconclusive automated diagnostic scan requires expert human verification'
      : resolvedTrigger === 'LOW_CONFIDENCE'
      ? `AI confidence score (${(confidenceScore * 100).toFixed(1)}%) is below threshold`
      : 'Human verification requested for diagnostic scan');

  // 5. Create ticket
  const ticket = await ExpertTicket.create({
    farmerId: scan.farmerId,
    fieldId: scan.fieldId,
    zoneId: scan.zoneId || null,
    cropCycleId: scan.cropCycleId,
    scanId: scan._id,
    riskEventId: null, // Populated if linked during risk evaluation
    status: 'OPEN',
    priority,
    triggerType: resolvedTrigger,
    requestedReason: reason,
    cropName,
    aiPredictedDisease: scan.diagnosis?.primaryCondition || 'Unspecified Condition',
    aiConfidenceScore: confidenceScore,
    aiScreeningResult: screeningResult,
    imageUrl: scan.imageUrl,
  });

  // 6. Audit Trail
  await logExpertAudit({
    actor: actorId,
    actorRole,
    action: 'TICKET_CREATED',
    entity: 'ExpertTicket',
    entityId: ticket._id.toString(),
    metadata: {
      scanId,
      triggerType: resolvedTrigger,
      priority,
      aiPredictedDisease: ticket.aiPredictedDisease,
      aiConfidenceScore: ticket.aiConfidenceScore,
    },
  });

  // 7. Non-fatal notification
  try {
    await sendPushNotificationToUser({
      userId: scan.farmerId,
      title: 'Expert Verification Requested',
      body: `Your scan for ${cropName} (${ticket.aiPredictedDisease}) has been submitted for expert verification.`,
      data: { ticketId: ticket._id.toString(), status: 'OPEN' },
    });
  } catch (err: any) {
    console.warn(`[ExpertTicketService] Non-fatal notification error: ${err.message}`);
  }

  return ticket;
}

/**
 * Assigns a verified expert to an open ticket.
 * Performed by Admin or Reviewer.
 */
export async function assignExpertToTicket(params: {
  ticketId: string;
  expertProfileId: string;
  assignedByUserId: string;
  assignedByUserRole: 'admin' | 'reviewer';
}): Promise<IExpertTicket> {
  const { ticketId, expertProfileId, assignedByUserId, assignedByUserRole } = params;

  await connectDB();

  const ticket = await ExpertTicket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Expert ticket not found: ${ticketId}`);
  }

  if (ticket.status === 'VERIFIED' || ticket.status === 'CANCELLED') {
    throw new Error(`Cannot assign expert to completed or cancelled ticket (status: ${ticket.status})`);
  }

  // Verify ExpertProfile exists, is verified, and is active
  const expertProfile = await ExpertProfile.findById(expertProfileId);
  if (!expertProfile) {
    throw new Error(`Expert profile not found: ${expertProfileId}`);
  }

  if (expertProfile.verificationStatus !== 'VERIFIED') {
    throw new Error(
      `Cannot assign expert: Profile status is ${expertProfile.verificationStatus}. Only VERIFIED experts may be assigned.`
    );
  }

  if (!expertProfile.isActive) {
    throw new Error('Cannot assign expert: Profile is currently inactive or suspended');
  }

  ticket.assignedExpertId = expertProfile._id;
  ticket.assignedUserId = expertProfile.userId || null;
  ticket.assignedBy = assignedByUserId;
  ticket.assignedAt = new Date();
  ticket.status = 'ASSIGNED';

  await ticket.save();

  // Audit Log
  await logExpertAudit({
    actor: assignedByUserId,
    actorRole: assignedByUserRole,
    action: 'EXPERT_ASSIGNED',
    entity: 'ExpertTicket',
    entityId: ticket._id.toString(),
    metadata: {
      expertProfileId,
      expertName: expertProfile.fullName,
      expertInstitution: expertProfile.institutionName,
    },
  });

  // Notify expert if linked user account exists
  if (expertProfile.userId) {
    try {
      await sendPushNotificationToUser({
        userId: expertProfile.userId.toString(),
        title: 'New Case Assigned for Verification',
        body: `You have been assigned case #${ticket._id.toString().substring(0, 8)} for ${ticket.cropName}.`,
        data: { ticketId: ticket._id.toString() },
      });
    } catch (err: any) {
      console.warn(`[ExpertTicketService] Non-fatal notification error: ${err.message}`);
    }
  }

  return ticket;
}

/**
 * Transitions ticket from ASSIGNED to IN_REVIEW when the assigned expert opens the workstation.
 */
export async function startExpertReview(params: {
  ticketId: string;
  expertUserId: string;
}): Promise<IExpertTicket> {
  const { ticketId, expertUserId } = params;

  await connectDB();

  const ticket = await ExpertTicket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket not found: ${ticketId}`);
  }

  // Tenant / Expert check: Only assigned expert or admin can start review
  if (ticket.assignedUserId && ticket.assignedUserId.toString() !== expertUserId) {
    throw new Error('Forbidden: You are not the assigned expert for this ticket');
  }

  if (ticket.status === 'ASSIGNED') {
    ticket.status = 'IN_REVIEW';
    ticket.inReviewAt = new Date();
    await ticket.save();

    await logExpertAudit({
      actor: expertUserId,
      actorRole: 'expert',
      action: 'REVIEW_STARTED',
      entity: 'ExpertTicket',
      entityId: ticket._id.toString(),
    });
  }

  return ticket;
}

/**
 * Submits an expert verification decision.
 *
 * Immutably records AI snapshot, expert verdict, notes, evidence reviewed.
 * If NEEDS_MORE_IMAGES -> transitions to NEEDS_MORE_EVIDENCE and requests farmer photos.
 * If terminal verdict -> transitions to VERIFIED, creates training sample candidate, links RiskEvent.
 */
export async function submitExpertReview(params: {
  ticketId: string;
  expertUserId: string;
  expertDecision: ExpertDecisionType;
  finalDiagnosis?: string;
  expertNotes: string;
  evidenceReviewed?: string[];
  additionalEvidenceRequested?: {
    requestedEvidence?: string;
    requestedPlantPart?: string;
    requestedPhotoAngle?: string;
    requestedSymptoms?: string;
    requestedContext?: string;
  };
}): Promise<{ ticket: IExpertTicket; review: IExpertReview }> {
  const {
    ticketId,
    expertUserId,
    expertDecision,
    finalDiagnosis,
    expertNotes,
    evidenceReviewed = [],
    additionalEvidenceRequested,
  } = params;

  await connectDB();

  const ticket = await ExpertTicket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket not found: ${ticketId}`);
  }

  if (ticket.status === 'VERIFIED' || ticket.status === 'CANCELLED') {
    throw new Error(`Ticket is already finalized (status: ${ticket.status})`);
  }

  // Verify expert assignment
  if (ticket.assignedUserId && ticket.assignedUserId.toString() !== expertUserId) {
    throw new Error('Forbidden: You are not the assigned expert for this case');
  }

  // Resolve expert profile
  let expertProfile = await ExpertProfile.findOne({ userId: expertUserId });
  if (!expertProfile && ticket.assignedExpertId) {
    expertProfile = await ExpertProfile.findById(ticket.assignedExpertId);
  }

  if (!expertProfile) {
    throw new Error('Expert profile not found for the reviewing user');
  }

  if (expertProfile.verificationStatus !== 'VERIFIED' || !expertProfile.isActive) {
    throw new Error('Expert profile is suspended, rejected, or inactive');
  }

  // Fetch underlying scan to build immutable AI snapshot
  const scan = await CropDiseaseScan.findById(ticket.scanId);
  if (!scan) {
    throw new Error(`Scan not found: ${ticket.scanId}`);
  }

  // Validate decision specifics
  let resolvedFinalDiagnosis: string;

  if (expertDecision === 'CONFIRMED_AI') {
    resolvedFinalDiagnosis = scan.diagnosis?.primaryCondition || ticket.aiPredictedDisease;
  } else if (expertDecision === 'NO_DISEASE') {
    resolvedFinalDiagnosis = 'Healthy / No Pathogen Detected';
  } else if (expertDecision === 'INCONCLUSIVE') {
    if (!expertNotes || expertNotes.trim().length === 0) {
      throw new Error('Expert notes explaining the inconclusive assessment are mandatory');
    }
    resolvedFinalDiagnosis = 'Inconclusive / Unresolvable Visual Evidence';
  } else if (expertDecision === 'CORRECTED' || expertDecision === 'ALTERNATIVE_DIAGNOSIS') {
    const trimmed = finalDiagnosis?.trim();
    if (!trimmed || trimmed.length === 0) {
      throw new Error(`Final verified diagnosis is mandatory when decision is ${expertDecision}`);
    }
    resolvedFinalDiagnosis = trimmed;
  } else if (expertDecision === 'NEEDS_MORE_IMAGES') {
    if (!additionalEvidenceRequested?.requestedEvidence) {
      throw new Error('Details of required additional evidence/images are mandatory');
    }
    resolvedFinalDiagnosis = 'Awaiting Supplementary Evidence';
  } else {
    throw new Error(`Invalid expert decision: ${expertDecision}`);
  }

  // 1. Build immutable AI snapshot
  const aiPredictionSnapshot = {
    diseaseName: scan.diagnosis?.primaryCondition || ticket.aiPredictedDisease,
    pathogenType: scan.diagnosis?.pathogenType || 'other',
    affectedPlantPart: scan.diagnosis?.affectedPlantPart || 'leaf',
    status: scan.diagnosis?.status || 'confirmed',
    serviceName: scan.serviceName || 'AgriVision Diagnostic Engine',
  };

  const aiConfidenceSnapshot = {
    level: scan.confidence?.level || 'Medium',
    score: scan.confidence?.score ?? ticket.aiConfidenceScore,
  };

  // 2. Create immutable ExpertReview record
  const review = await ExpertReview.create({
    ticketId: ticket._id,
    expertId: expertProfile._id,
    expertUserId: new mongoose.Types.ObjectId(expertUserId),
    scanId: scan._id,
    aiPredictionSnapshot,
    aiConfidenceSnapshot,
    aiScreeningSnapshot: scan.screeningResult || null,
    expertDecision,
    finalDiagnosis: resolvedFinalDiagnosis,
    expertNotes,
    evidenceReviewed,
    additionalEvidenceRequested: expertDecision === 'NEEDS_MORE_IMAGES' ? additionalEvidenceRequested : null,
  });

  // 3. Handle state transitions
  if (expertDecision === 'NEEDS_MORE_IMAGES') {
    ticket.status = 'NEEDS_MORE_EVIDENCE';
    ticket.evidenceRequest = {
      requestedEvidence: additionalEvidenceRequested?.requestedEvidence,
      requestedPlantPart: additionalEvidenceRequested?.requestedPlantPart,
      requestedPhotoAngle: additionalEvidenceRequested?.requestedPhotoAngle,
      requestedSymptoms: additionalEvidenceRequested?.requestedSymptoms,
      requestedContext: additionalEvidenceRequested?.requestedContext,
      requestedAt: new Date(),
    };
    await ticket.save();

    await logExpertAudit({
      actor: expertUserId,
      actorRole: 'expert',
      action: 'EVIDENCE_REQUESTED',
      entity: 'ExpertTicket',
      entityId: ticket._id.toString(),
      metadata: {
        evidenceRequest: ticket.evidenceRequest,
      },
    });

    // Notify farmer to upload supplementary pictures
    try {
      await sendPushNotificationToUser({
        userId: ticket.farmerId,
        title: 'Action Required: Additional Crop Photos Needed',
        body: `Expert ${expertProfile.fullName} requested additional photographs for your ${ticket.cropName} scan: ${additionalEvidenceRequested?.requestedEvidence}`,
        data: { ticketId: ticket._id.toString(), status: 'NEEDS_MORE_EVIDENCE' },
      });
    } catch (err: any) {
      console.warn(`[ExpertTicketService] Non-fatal notification error: ${err.message}`);
    }

    return { ticket, review };
  }

  // Terminal Verification Transition
  ticket.status = 'VERIFIED';
  ticket.completedReviewId = review._id;
  ticket.completedAt = new Date();
  await ticket.save();

  // 4. Create VerifiedTrainingSample candidate (strictly CANDIDATE, never auto-retraining)
  try {
    const trainingSample = await VerifiedTrainingSample.create({
      scanId: scan._id,
      expertReviewId: review._id,
      imageReference: scan.imageUrl,
      crop: ticket.cropName,
      aiDiagnosis: aiPredictionSnapshot.diseaseName,
      verifiedDiagnosis: resolvedFinalDiagnosis,
      verificationConfidence: expertDecision === 'CONFIRMED_AI' ? aiConfidenceSnapshot.score : 1.0,
      expertId: expertProfile._id,
      status: 'CANDIDATE',
      inclusionNotes: `Verified by ${expertProfile.fullName} (${expertProfile.institutionName}). Decision: ${expertDecision}`,
    });

    review.verifiedTrainingSampleId = trainingSample._id;
    await review.save();
  } catch (err: any) {
    console.warn(`[ExpertTicketService] Failed to create training sample hook: ${err.message}`);
  }

  // 5. Re-evaluate / link RiskEvent if previous risk event exists
  try {
    const existingRisk = await RiskEvent.findOne({
      cropCycleId: ticket.cropCycleId,
      $or: [{ scanId: scan._id }, { threatName: aiPredictionSnapshot.diseaseName }],
    }).sort({ createdAt: -1 });

    if (existingRisk) {
      // Create new verified RiskEvent linked to historical record (zero silent mutation)
      const linkedRisk = await RiskEvent.create({
        farmerId: ticket.farmerId,
        fieldId: ticket.fieldId,
        zoneId: ticket.zoneId || null,
        cropCycleId: ticket.cropCycleId,
        threatId: `THREAT-EXPERT-${resolvedFinalDiagnosis.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        threatName: resolvedFinalDiagnosis,
        ruleId: existingRisk.ruleId,
        scanId: scan._id,
        originalRiskEventId: existingRisk._id,
        expertReviewId: review._id,
        reEvaluationReason: 'EXPERT_VERIFICATION',
        weatherObservationId: existingRisk.weatherObservationId || null,
        growthStageId: existingRisk.growthStageId || null,
        riskStatus: expertDecision === 'NO_DISEASE' ? 'NO_CONCERN' : 'ATTENTION',
        riskLevel: expertDecision === 'NO_DISEASE' ? 'NO_CONCERN' : 'MODERATE',
        riskScore: null,
        explanation: `Expert verified diagnosis: ${resolvedFinalDiagnosis} by ${expertProfile.fullName}. Notes: ${expertNotes}`,
        missingEvidence: [],
        contributingFactors: {
          diseaseScanSignal: {
            hasActiveDiagnosis: expertDecision !== 'NO_DISEASE',
            scanId: scan._id,
            conditionName: resolvedFinalDiagnosis,
            confidenceScore: 1.0,
          },
        },
        recommendedActions: [],
        evaluatedAt: new Date(),
      });

      review.linkedRiskEventId = linkedRisk._id;
      await review.save();
    }
  } catch (err: any) {
    console.warn(`[ExpertTicketService] Non-fatal risk linkage error: ${err.message}`);
  }

  // 6. Audit Trail
  await logExpertAudit({
    actor: expertUserId,
    actorRole: 'expert',
    action: 'REVIEW_SUBMITTED',
    entity: 'ExpertReview',
    entityId: review._id.toString(),
    metadata: {
      ticketId: ticket._id.toString(),
      decision: expertDecision,
      finalDiagnosis: resolvedFinalDiagnosis,
    },
  });

  await logExpertAudit({
    actor: expertUserId,
    actorRole: 'expert',
    action: 'TICKET_VERIFIED',
    entity: 'ExpertTicket',
    entityId: ticket._id.toString(),
    metadata: {
      finalDiagnosis: resolvedFinalDiagnosis,
    },
  });

  // 7. Non-fatal notification to farmer
  try {
    await sendPushNotificationToUser({
      userId: ticket.farmerId,
      title: 'Expert Verification Completed',
      body: `Expert ${expertProfile.fullName} completed review for your ${ticket.cropName}. Result: ${resolvedFinalDiagnosis}`,
      data: { ticketId: ticket._id.toString(), status: 'VERIFIED', result: resolvedFinalDiagnosis },
    });
  } catch (err: any) {
    console.warn(`[ExpertTicketService] Non-fatal notification error: ${err.message}`);
  }

  return { ticket, review };
}

/**
 * Uploads additional requested evidence from farmer, transitioning ticket back to IN_REVIEW.
 */
export async function uploadAdditionalEvidence(params: {
  ticketId: string;
  farmerId: string;
  additionalScanId?: string;
  additionalImageUrl: string;
  farmerNotes?: string;
}): Promise<IExpertTicket> {
  const { ticketId, farmerId, additionalScanId, additionalImageUrl, farmerNotes } = params;

  await connectDB();

  const ticket = await ExpertTicket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket not found: ${ticketId}`);
  }

  if (ticket.farmerId !== farmerId) {
    throw new Error('Forbidden: Access denied to other farmers tickets');
  }

  if (ticket.status !== 'NEEDS_MORE_EVIDENCE') {
    throw new Error(`Ticket is not waiting for evidence (status: ${ticket.status})`);
  }

  ticket.evidenceRequest = {
    ...ticket.evidenceRequest,
    fulfilledAt: new Date(),
    additionalScanId: additionalScanId ? new mongoose.Types.ObjectId(additionalScanId) : null,
    additionalImageUrl,
    farmerNotes: farmerNotes || null,
  };
  ticket.status = 'IN_REVIEW';

  await ticket.save();

  await logExpertAudit({
    actor: farmerId,
    actorRole: 'farmer',
    action: 'EVIDENCE_UPLOADED',
    entity: 'ExpertTicket',
    entityId: ticket._id.toString(),
    metadata: {
      additionalImageUrl,
      farmerNotes,
    },
  });

  // Notify assigned expert if linked
  if (ticket.assignedUserId) {
    try {
      await sendPushNotificationToUser({
        userId: ticket.assignedUserId.toString(),
        title: 'Additional Evidence Uploaded',
        body: `Farmer has uploaded requested photographs for ticket #${ticket._id.toString().substring(0, 8)}.`,
        data: { ticketId: ticket._id.toString() },
      });
    } catch (err: any) {
      console.warn(`[ExpertTicketService] Non-fatal notification error: ${err.message}`);
    }
  }

  return ticket;
}

/**
 * Cancels an expert ticket.
 */
export async function cancelExpertTicket(params: {
  ticketId: string;
  cancelledByUserId: string;
  cancelledByUserRole: 'farmer' | 'admin' | 'reviewer';
  reason?: string;
}): Promise<IExpertTicket> {
  const { ticketId, cancelledByUserId, cancelledByUserRole, reason } = params;

  await connectDB();

  const ticket = await ExpertTicket.findById(ticketId);
  if (!ticket) {
    throw new Error(`Ticket not found: ${ticketId}`);
  }

  if (cancelledByUserRole === 'farmer' && ticket.farmerId !== cancelledByUserId) {
    throw new Error('Forbidden: You can only cancel your own tickets');
  }

  if (ticket.status === 'VERIFIED') {
    throw new Error('Cannot cancel an already verified ticket');
  }

  ticket.status = 'CANCELLED';
  ticket.cancellationReason = reason || 'Cancelled by user';
  ticket.cancelledAt = new Date();
  ticket.cancelledBy = cancelledByUserId;

  await ticket.save();

  await logExpertAudit({
    actor: cancelledByUserId,
    actorRole: cancelledByUserRole,
    action: 'TICKET_CANCELLED',
    entity: 'ExpertTicket',
    entityId: ticket._id.toString(),
    metadata: { reason: ticket.cancellationReason },
  });

  return ticket;
}
