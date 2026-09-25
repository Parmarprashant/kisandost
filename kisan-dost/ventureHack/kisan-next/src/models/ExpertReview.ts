import mongoose, { Document, Schema } from 'mongoose';

export type ExpertDecisionType =
  | 'CONFIRMED_AI'
  | 'CORRECTED'
  | 'ALTERNATIVE_DIAGNOSIS'
  | 'NO_DISEASE'
  | 'INCONCLUSIVE'
  | 'NEEDS_MORE_IMAGES';

export interface IAiPredictionSnapshot {
  diseaseName: string;
  pathogenType?: string;
  affectedPlantPart?: string;
  status?: string;
  serviceName?: string;
}

export interface IAiConfidenceSnapshot {
  level: string;
  score: number;
}

export interface IAdditionalEvidenceRequest {
  requestedEvidence?: string;
  requestedPlantPart?: string;
  requestedPhotoAngle?: string;
  requestedSymptoms?: string;
  requestedContext?: string;
}

export interface IExpertReview extends Document {
  ticketId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  expertUserId: mongoose.Types.ObjectId;
  scanId: mongoose.Types.ObjectId;
  aiPredictionSnapshot: IAiPredictionSnapshot;
  aiConfidenceSnapshot: IAiConfidenceSnapshot;
  aiScreeningSnapshot?: string | null;
  expertDecision: ExpertDecisionType;
  finalDiagnosis: string;
  expertNotes: string;
  evidenceReviewed: string[];
  additionalEvidenceRequested?: IAdditionalEvidenceRequest | null;
  verifiedTrainingSampleId?: mongoose.Types.ObjectId | null;
  linkedRiskEventId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AiPredictionSnapshotSchema = new Schema(
  {
    diseaseName: { type: String, required: true },
    pathogenType: { type: String, default: 'other' },
    affectedPlantPart: { type: String, default: 'leaf' },
    status: { type: String, default: 'confirmed' },
    serviceName: { type: String, default: 'AgriVision Diagnostic Engine' },
  },
  { _id: false }
);

const AiConfidenceSnapshotSchema = new Schema(
  {
    level: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const AdditionalEvidenceRequestSchema = new Schema(
  {
    requestedEvidence: { type: String, default: null },
    requestedPlantPart: { type: String, default: null },
    requestedPhotoAngle: { type: String, default: null },
    requestedSymptoms: { type: String, default: null },
    requestedContext: { type: String, default: null },
  },
  { _id: false }
);

const ExpertReviewSchema = new Schema(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertTicket',
      required: true,
      index: true,
    },
    expertId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertProfile',
      required: true,
      index: true,
    },
    expertUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      required: true,
      index: true,
    },
    aiPredictionSnapshot: {
      type: AiPredictionSnapshotSchema,
      required: true,
    },
    aiConfidenceSnapshot: {
      type: AiConfidenceSnapshotSchema,
      required: true,
    },
    aiScreeningSnapshot: {
      type: String,
      default: null,
    },
    expertDecision: {
      type: String,
      enum: [
        'CONFIRMED_AI',
        'CORRECTED',
        'ALTERNATIVE_DIAGNOSIS',
        'NO_DISEASE',
        'INCONCLUSIVE',
        'NEEDS_MORE_IMAGES',
      ],
      required: true,
      index: true,
    },
    finalDiagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    expertNotes: {
      type: String,
      required: true,
      trim: true,
    },
    evidenceReviewed: {
      type: [String],
      default: [],
    },
    additionalEvidenceRequested: {
      type: AdditionalEvidenceRequestSchema,
      default: null,
    },
    verifiedTrainingSampleId: {
      type: Schema.Types.ObjectId,
      ref: 'VerifiedTrainingSample',
      default: null,
    },
    linkedRiskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'expert_reviews',
  }
);

ExpertReviewSchema.index({ expertId: 1, createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.ExpertReview) {
  delete mongoose.models.ExpertReview;
}

export const ExpertReview =
  mongoose.models.ExpertReview ||
  mongoose.model<IExpertReview>('ExpertReview', ExpertReviewSchema);

export default ExpertReview;
