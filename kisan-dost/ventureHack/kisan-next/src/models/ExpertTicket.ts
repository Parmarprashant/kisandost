import mongoose, { Document, Schema } from 'mongoose';

export type ExpertTicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_REVIEW'
  | 'NEEDS_MORE_EVIDENCE'
  | 'VERIFIED'
  | 'CANCELLED';

export type ExpertTicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ExpertTicketTriggerType =
  | 'LOW_CONFIDENCE'
  | 'INCONCLUSIVE'
  | 'FARMER_REQUEST'
  | 'REVIEWER_REQUEST'
  | 'ADMIN_REQUEST'
  | 'DISPUTED_RESULT'
  | 'RISK_ESCALATION';

export interface IEvidenceRequestDetails {
  requestedEvidence?: string;
  requestedPlantPart?: string;
  requestedPhotoAngle?: string;
  requestedSymptoms?: string;
  requestedContext?: string;
  requestedAt?: Date | null;
  fulfilledAt?: Date | null;
  additionalScanId?: mongoose.Types.ObjectId | null;
  additionalImageUrl?: string | null;
  farmerNotes?: string | null;
}

export interface IExpertTicket extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  cropCycleId: mongoose.Types.ObjectId;
  scanId: mongoose.Types.ObjectId;
  riskEventId?: mongoose.Types.ObjectId | null;
  status: ExpertTicketStatus;
  priority: ExpertTicketPriority;
  triggerType: ExpertTicketTriggerType;
  requestedReason: string;
  cropName: string;
  aiPredictedDisease: string;
  aiConfidenceScore: number;
  aiScreeningResult?: string | null;
  imageUrl: string;
  assignedExpertId?: mongoose.Types.ObjectId | null;
  assignedUserId?: mongoose.Types.ObjectId | null;
  assignedBy?: string | null;
  assignedAt?: Date | null;
  inReviewAt?: Date | null;
  evidenceRequest?: IEvidenceRequestDetails;
  completedReviewId?: mongoose.Types.ObjectId | null;
  completedAt?: Date | null;
  cancellationReason?: string | null;
  cancelledAt?: Date | null;
  cancelledBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceRequestSchema = new Schema(
  {
    requestedEvidence: { type: String, default: null },
    requestedPlantPart: { type: String, default: null },
    requestedPhotoAngle: { type: String, default: null },
    requestedSymptoms: { type: String, default: null },
    requestedContext: { type: String, default: null },
    requestedAt: { type: Date, default: null },
    fulfilledAt: { type: Date, default: null },
    additionalScanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      default: null,
    },
    additionalImageUrl: { type: String, default: null },
    farmerNotes: { type: String, default: null },
  },
  { _id: false }
);

const ExpertTicketSchema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmZone',
      default: null,
      index: true,
    },
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      required: true,
      index: true,
    },
    riskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'ASSIGNED',
        'IN_REVIEW',
        'NEEDS_MORE_EVIDENCE',
        'VERIFIED',
        'CANCELLED',
      ],
      required: true,
      default: 'OPEN',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'MEDIUM',
      index: true,
    },
    triggerType: {
      type: String,
      enum: [
        'LOW_CONFIDENCE',
        'INCONCLUSIVE',
        'FARMER_REQUEST',
        'REVIEWER_REQUEST',
        'ADMIN_REQUEST',
        'DISPUTED_RESULT',
        'RISK_ESCALATION',
      ],
      required: true,
      index: true,
    },
    requestedReason: {
      type: String,
      required: true,
      trim: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    aiPredictedDisease: {
      type: String,
      required: true,
      trim: true,
    },
    aiConfidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    aiScreeningResult: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    assignedExpertId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertProfile',
      default: null,
      index: true,
    },
    assignedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedBy: {
      type: String,
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    inReviewAt: {
      type: Date,
      default: null,
    },
    evidenceRequest: {
      type: EvidenceRequestSchema,
      default: null,
    },
    completedReviewId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertReview',
      default: null,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'expert_tickets',
  }
);

// Indexes for tenant isolation and queries
ExpertTicketSchema.index({ farmerId: 1, createdAt: -1 });
ExpertTicketSchema.index({ assignedUserId: 1, status: 1 });
ExpertTicketSchema.index({ assignedExpertId: 1, status: 1 });
ExpertTicketSchema.index({ scanId: 1, status: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.ExpertTicket) {
  delete mongoose.models.ExpertTicket;
}

export const ExpertTicket =
  mongoose.models.ExpertTicket ||
  mongoose.model<IExpertTicket>('ExpertTicket', ExpertTicketSchema);

export default ExpertTicket;
