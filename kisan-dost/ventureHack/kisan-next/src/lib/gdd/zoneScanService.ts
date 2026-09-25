import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { ScanSession, IScanSession, ScanSessionStatus, ScanSessionResult } from '@/models/ScanSession';
import { CropDiseaseScan, ICropDiseaseScan } from '@/models/CropDiseaseScan';
import { analyzeWithAgriVision, AgriVisionDiseaseResult } from '@/lib/agriVisionService';
import { saveScanImage, StoredImageInfo } from '@/lib/imageStorage';
import { calculateCurrentDas } from './cropCycleEngine';

export const DEFAULT_MAX_ADDITIONAL_IMAGES = 3;

export interface ProcessScanImageOptions {
  cropId: string;
  fieldId?: string;
  zoneId: string;
  userId: string;
  file: File | Blob & { name?: string; type?: string; size: number };
  viewAngle?: string;
  sessionId?: string;
  customAnalyzer?: (file: any) => Promise<AgriVisionDiseaseResult>;
}

export interface ZoneScanResultPayload {
  sessionId: string;
  zoneId: string;
  cropId: string;
  fieldId: string;
  status: ScanSessionStatus;
  result: ScanSessionResult;
  requiresAdditionalImages: boolean;
  scanCount: number;
  maxAdditionalImages: number;
  currentStep: number;
  message: string;
  guidanceMessage: string;
  currentScan: {
    scanId: string;
    imageUrl: string;
    viewAngle: string;
    diseaseName: string;
    confidence: number;
    description: string;
    screeningResult: string;
  };
  evidenceSummary?: {
    diagnoses: string[];
    confidences: number[];
    repeatedDiagnosis: string | null;
    isConsistent: boolean;
  };
}

/**
 * Validates ownership and spatial relationships:
 * Farmer -> Crop -> Field -> Zone
 */
export async function validateZoneScoutingContext(
  cropId: string,
  zoneId: string,
  userId: string
) {
  await connectDB();

  const crop = await Crop.findOne({ _id: cropId, farmerId: userId });
  if (!crop) {
    throw new Error('Crop not found or access denied');
  }

  const field = await Field.findOne({ _id: crop.fieldId, farmerId: userId });
  if (!field) {
    throw new Error('Associated field not found or access denied');
  }

  const zone = await FarmZone.findOne({
    _id: zoneId,
    fieldId: crop.fieldId,
    farmerId: userId,
  });

  if (!zone) {
    throw new Error('Selected zone does not belong to this field or access denied');
  }

  return { crop, field, zone };
}

/**
 * Interprets AgriVision diagnostic result into standardized Phase 4 screening semantics.
 * Strictly adheres to 0-hallucination policy (never invents severity or confidence thresholds).
 */
export function interpretAgriVisionDiagnosis(agriResult: AgriVisionDiseaseResult): {
  screeningResult: 'NO_CONCERN_DETECTED' | 'POTENTIAL_CONCERN' | 'INCONCLUSIVE';
  message: string;
  guidanceMessage: string;
  requiresAdditionalImages: boolean;
} {
  const raw = agriResult.rawPayload;

  // 1. Explicit Insufficient Evidence / Undetermined by model
  const isUndetermined =
    raw?.diagnosis?.status === 'INSUFFICIENT_EVIDENCE' ||
    raw?.diagnosis?.type === 'unknown' ||
    agriResult.diseaseName.toLowerCase().includes('unable to determine') ||
    agriResult.diseaseName.toLowerCase().includes('insufficient evidence') ||
    agriResult.diseaseName.toLowerCase() === 'unknown';

  if (isUndetermined) {
    return {
      screeningResult: 'INCONCLUSIVE',
      message: 'Inconclusive scan. Leaf details or lesion margins could not be resolved by AgriVision.',
      guidanceMessage: 'Please capture a clear close-up photograph of an individual affected leaf in good daylight.',
      requiresAdditionalImages: true,
    };
  }

  // 2. Explicit Healthy classification by model
  const isHealthy =
    raw?.diagnosis?.type === 'healthy' ||
    raw?.diagnosis?.name?.toLowerCase().includes('healthy') ||
    agriResult.diseaseName.toLowerCase() === 'healthy crop' ||
    agriResult.diseaseName.toLowerCase().includes('healthy');

  if (isHealthy) {
    return {
      screeningResult: 'NO_CONCERN_DETECTED',
      message: 'No concerning signs detected in this scan.',
      guidanceMessage: 'Continue to the next zone.',
      requiresAdditionalImages: false,
    };
  }

  // 3. Known foliar pathogen / disease diagnosed
  if (
    agriResult.diseaseName &&
    agriResult.diseaseName.trim().length > 0 &&
    agriResult.diseaseName.toLowerCase() !== 'unknown crop'
  ) {
    return {
      screeningResult: 'POTENTIAL_CONCERN',
      message: 'Potential issue detected. Please capture additional views from this zone.',
      guidanceMessage: 'Suggested views: 1. Wider plant view, 2. Side view, 3. Close-up of affected leaf/fruit/stem.',
      requiresAdditionalImages: true,
    };
  }

  // 4. Default safe fallback: prefer INCONCLUSIVE over invented certainty
  return {
    screeningResult: 'INCONCLUSIVE',
    message: 'AgriVision response could not be definitively categorized.',
    guidanceMessage: 'Please capture supplementary views of the crop zone.',
    requiresAdditionalImages: true,
  };
}

/**
 * Processes an initial screening image or supplementary zone image.
 */
export async function processZoneImage(
  options: ProcessScanImageOptions
): Promise<ZoneScanResultPayload> {
  const { cropId, zoneId, userId, file, viewAngle = 'screening', sessionId, customAnalyzer } = options;

  // 1. Validate Context & Multi-tenant Authorization
  const { crop, field, zone } = await validateZoneScoutingContext(cropId, zoneId, userId);

  // 2. Validate & Store Image
  const storedImage: StoredImageInfo = await saveScanImage(file);

  // 3. Execute AgriVision AI Diagnosis
  const analyzer = customAnalyzer || analyzeWithAgriVision;
  const agriResult: AgriVisionDiseaseResult = await analyzer(file);

  // 4. Map AgriVision result to standardized screening semantics
  const interpretation = interpretAgriVisionDiagnosis(agriResult);

  // Calculate current DAS & Stage for audit logging
  const currentDas = calculateCurrentDas(crop.sowingDate);
  const currentStage = crop.currentStageId || 'Initial Growth';

  let session: IScanSession;

  if (sessionId) {
    // Supplementary Image Attached to Existing Session
    const existingSession = await ScanSession.findOne({
      _id: sessionId,
      farmerId: userId,
      cropId: crop._id,
      zoneId: zone._id,
    });

    if (!existingSession) {
      throw new Error(`Scan session ${sessionId} not found or access denied`);
    }

    if (existingSession.status === 'COMPLETED' || existingSession.status === 'CANCELLED') {
      throw new Error(`Scan session ${sessionId} is already ${existingSession.status}`);
    }

    const currentAdditional = existingSession.scanCount - 1;
    if (currentAdditional >= existingSession.maxAdditionalImages) {
      throw new Error(
        `Maximum additional images limit (${existingSession.maxAdditionalImages}) reached for this scan session.`
      );
    }

    session = existingSession;
  } else {
    // New Initial Screening Session
    session = new ScanSession({
      farmerId: userId,
      cropId: crop._id,
      fieldId: field._id,
      zoneId: zone._id,
      status: 'INITIAL_SCAN',
      result: interpretation.screeningResult,
      scanCount: 1,
      maxAdditionalImages: DEFAULT_MAX_ADDITIONAL_IMAGES,
      requiresAdditionalImages: interpretation.requiresAdditionalImages,
      currentStep: 1,
      scanIds: [],
      evidenceSummary: {
        diagnoses: [agriResult.diseaseName],
        confidences: [agriResult.confidence],
        repeatedDiagnosis: agriResult.diseaseName,
        isConsistent: true,
        requiresExpertVerification: agriResult.requiresExpertVerification,
      },
      startedAt: new Date(),
    });
  }

  const normalizedConfidence =
    typeof agriResult.confidence === 'number'
      ? agriResult.confidence > 1
        ? Math.min(1, agriResult.confidence / 100)
        : Math.max(0, Math.min(1, agriResult.confidence))
      : 0.8;

  // 5. Create Individual CropDiseaseScan Document
  const scanDoc = await CropDiseaseScan.create({
    farmerId: userId,
    fieldId: field._id,
    zoneId: zone._id,
    cropCycleId: crop._id,
    scanSessionId: session._id,
    viewAngle,
    screeningResult: interpretation.screeningResult,
    imageUrl: storedImage.url,
    capturedAt: new Date(),
    diagnosis: {
      primaryCondition: agriResult.diseaseName,
      pathogenType: agriResult.diseaseName.toLowerCase().includes('healthy') ? 'healthy' : 'suspected',
      affectedPlantPart: 'leaf',
      status: agriResult.diseaseName.toLowerCase().includes('healthy') ? 'healthy' : 'suspected',
    },
    confidence: {
      level: normalizedConfidence >= 0.75 ? 'High' : normalizedConfidence >= 0.45 ? 'Medium' : 'Low',
      score: Number(normalizedConfidence.toFixed(4)),
    },
    severity: null, // Strictly null - AgriVision does not provide clinical severity
    cropStageAtScan: currentStage,
    dasAtScan: currentDas,
    serviceName: 'AgriVision Diagnostic Engine',
    serviceEndpoint: process.env.AGRIVISION_API_URL || 'https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/api/v1/diagnose',
    rawResponsePayload: agriResult.rawPayload || agriResult,
    remediationStatus: 'PENDING',
  });

  // 6. Update Session State
  if (!sessionId) {
    // Initial Scan Path
    session.initialScanId = scanDoc._id as any;
    session.scanIds = [scanDoc._id as any];

    if (interpretation.screeningResult === 'NO_CONCERN_DETECTED') {
      session.status = 'COMPLETED';
      session.result = 'NO_CONCERN_DETECTED';
      session.requiresAdditionalImages = false;
      session.completedAt = new Date();
    } else {
      session.status = 'ADDITIONAL_IMAGES_REQUIRED';
      session.result = interpretation.screeningResult;
      session.requiresAdditionalImages = true;
      session.currentStep = 2;
    }
  } else {
    // Supplementary Scan Path
    session.scanIds.push(scanDoc._id as any);
    session.scanCount += 1;
    session.currentStep += 1;

    // Update evidence summary
    const updatedDiagnoses = [...(session.evidenceSummary.diagnoses || []), agriResult.diseaseName];
    const updatedConfidences = [...(session.evidenceSummary.confidences || []), agriResult.confidence];
    const isConsistent = updatedDiagnoses.every(
      (d) => d.toLowerCase().trim() === updatedDiagnoses[0].toLowerCase().trim()
    );

    session.evidenceSummary = {
      diagnoses: updatedDiagnoses,
      confidences: updatedConfidences,
      repeatedDiagnosis: isConsistent ? updatedDiagnoses[0] : null,
      isConsistent,
      requiresExpertVerification:
        session.evidenceSummary.requiresExpertVerification || agriResult.requiresExpertVerification,
    };

    // If max additional images reached, set status to ANALYZING ready for completion
    if (session.scanCount >= 1 + session.maxAdditionalImages) {
      session.status = 'ANALYZING';
    }
  }

  await session.save();

  return {
    sessionId: session._id.toString(),
    zoneId: zone._id.toString(),
    cropId: crop._id.toString(),
    fieldId: field._id.toString(),
    status: session.status,
    result: session.result || interpretation.screeningResult,
    requiresAdditionalImages: session.requiresAdditionalImages,
    scanCount: session.scanCount,
    maxAdditionalImages: session.maxAdditionalImages,
    currentStep: session.currentStep,
    message: interpretation.message,
    guidanceMessage: interpretation.guidanceMessage,
    currentScan: {
      scanId: scanDoc._id.toString(),
      imageUrl: storedImage.url,
      viewAngle,
      diseaseName: agriResult.diseaseName,
      confidence: agriResult.confidence,
      description: agriResult.description,
      screeningResult: interpretation.screeningResult,
    },
    evidenceSummary: session.evidenceSummary,
  };
}

/**
 * Completes a progressive zone scan session by evaluating all accumulated evidence.
 * If diagnoses agree -> POTENTIAL_CONCERN (repeated evidence).
 * If diagnoses disagree -> INCONCLUSIVE.
 */
export async function finalizeZoneScanSession(
  sessionId: string,
  userId: string,
  notes?: string
) {
  await connectDB();

  const session = await ScanSession.findOne({ _id: sessionId, farmerId: userId });
  if (!session) {
    throw new Error(`Scan session ${sessionId} not found or access denied`);
  }

  const scans = await CropDiseaseScan.find({ _id: { $in: session.scanIds } }).lean();

  if (scans.length === 0) {
    throw new Error('No scans found in this session');
  }

  // Clean diagnoses list
  const diagnoses = scans.map((s) => s.diagnosis?.primaryCondition || 'Unknown');
  const confidences = scans.map((s) => s.confidence?.score || 0);

  // Check agreement across non-healthy diagnoses
  const nonHealthy = diagnoses.filter(
    (d) => !d.toLowerCase().includes('healthy') && !d.toLowerCase().includes('unable to determine')
  );

  let finalResult: ScanSessionResult;
  let finalStatus: ScanSessionStatus;
  let isConsistent = true;
  let repeatedDiagnosis: string | null = null;

  if (nonHealthy.length === 0) {
    // All scans were healthy/no concern
    finalResult = 'NO_CONCERN_DETECTED';
    finalStatus = 'COMPLETED';
    repeatedDiagnosis = 'Healthy Crop';
  } else {
    // Check if all non-healthy diagnoses match
    const firstDiagnosis = nonHealthy[0].toLowerCase().trim();
    const allMatch = nonHealthy.every((d) => d.toLowerCase().trim() === firstDiagnosis);

    if (allMatch) {
      finalResult = 'POTENTIAL_CONCERN';
      finalStatus = 'COMPLETED';
      isConsistent = true;
      repeatedDiagnosis = nonHealthy[0];
    } else {
      // Disagreeing diagnoses across angles
      finalResult = 'INCONCLUSIVE';
      finalStatus = 'INCONCLUSIVE';
      isConsistent = false;
      repeatedDiagnosis = null;
    }
  }

  session.status = finalStatus;
  session.result = finalResult;
  session.requiresAdditionalImages = false;
  session.completedAt = new Date();
  if (notes) session.notes = notes;

  session.evidenceSummary = {
    diagnoses,
    confidences,
    repeatedDiagnosis,
    isConsistent,
    requiresExpertVerification: scans.some(
      (s) => s.rawResponsePayload?.requires_expert_verification === true
    ),
  };

  await session.save();

  return {
    sessionId: session._id.toString(),
    zoneId: session.zoneId.toString(),
    status: session.status,
    result: session.result,
    scanCount: session.scanCount,
    evidenceSummary: session.evidenceSummary,
    completedAt: session.completedAt.toISOString(),
    scans: scans.map((s) => ({
      scanId: s._id.toString(),
      imageUrl: s.imageUrl,
      viewAngle: s.viewAngle || 'screening',
      diseaseName: s.diagnosis?.primaryCondition,
      confidence: s.confidence?.score,
    })),
  };
}
