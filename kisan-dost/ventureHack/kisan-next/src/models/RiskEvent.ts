import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskContributingSignals {
  stageVulnerability?: {
    isVulnerable: boolean;
    stageName?: string;
    vulnerablePests?: string[];
  };
  weatherStress?: {
    isTriggered: boolean;
    activeTriggers?: string[];
  };
  diseaseScanSignal?: {
    hasActiveDiagnosis: boolean;
    scanId?: mongoose.Types.ObjectId;
    conditionName?: string;
    confidenceScore?: number;
  };
  supportingEvidence?: any[];
  missingEvidence?: string[];
  mitigatingEvidence?: any[];
}

export type RiskStatusType =
  | 'STABLE'
  | 'ATTENTION'
  | 'HIGH_RISK'
  | 'NO_CONCERN'
  | 'POTENTIAL_CONCERN'
  | 'INSUFFICIENT_DATA'
  | 'INCONCLUSIVE';

export type RiskLevelType =
  | 'NO_CONCERN'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'POTENTIAL_CONCERN'
  | 'INSUFFICIENT_DATA'
  | 'INCONCLUSIVE';

export interface IRiskEvent extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  cropCycleId: mongoose.Types.ObjectId; // References Crop._id
  threatId?: string | null;
  threatName?: string | null;
  ruleId?: string | null;
  scanId?: mongoose.Types.ObjectId | null; // References CropDiseaseScan._id
  originalRiskEventId?: mongoose.Types.ObjectId | null; // References superseded historical RiskEvent
  expertReviewId?: mongoose.Types.ObjectId | null; // References ExpertReview._id
  reEvaluationReason?: string | null; // e.g. 'EXPERT_VERIFICATION'
  weatherObservationId?: mongoose.Types.ObjectId | null;
  growthStageId?: string | null;
  riskStatus: RiskStatusType;
  riskLevel?: RiskLevelType | null;
  riskScore: number | null; // STRICTLY NULL - Algorithm implemented under Zero Hallucination policy
  explanation?: string | null;
  missingEvidence?: string[];
  contributingFactors: IRiskContributingSignals;
  recommendedActions: string[];
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskEventSchema: Schema = new Schema(
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
    threatId: {
      type: String,
      default: null,
      index: true,
    },
    threatName: {
      type: String,
      default: null,
    },
    ruleId: {
      type: String,
      default: null,
      index: true,
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      default: null,
    },
    originalRiskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      default: null,
      index: true,
    },
    expertReviewId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertReview',
      default: null,
      index: true,
    },
    reEvaluationReason: {
      type: String,
      default: null,
    },
    weatherObservationId: {
      type: Schema.Types.ObjectId,
      ref: 'WeatherObservation',
      default: null,
    },
    growthStageId: {
      type: String,
      default: null,
    },
    riskStatus: {
      type: String,
      enum: [
        'STABLE',
        'ATTENTION',
        'HIGH_RISK',
        'NO_CONCERN',
        'POTENTIAL_CONCERN',
        'INSUFFICIENT_DATA',
        'INCONCLUSIVE',
      ],
      default: 'STABLE',
      required: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: [
        'NO_CONCERN',
        'LOW',
        'MODERATE',
        'HIGH',
        'CRITICAL',
        'POTENTIAL_CONCERN',
        'INSUFFICIENT_DATA',
        'INCONCLUSIVE',
      ],
      default: null,
    },
    riskScore: {
      type: Number,
      default: null, // Strictly null - do not calculate fake scores
    },
    explanation: {
      type: String,
      default: null,
    },
    missingEvidence: {
      type: [String],
      default: [],
    },
    contributingFactors: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    recommendedActions: {
      type: [String],
      default: [],
    },
    evaluatedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'risk_events',
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Legacy indexes
RiskEventSchema.index({ cropCycleId: 1, createdAt: -1 });
RiskEventSchema.index({ fieldId: 1, createdAt: -1 });

// Deduplication compound index
RiskEventSchema.index(
  { cropCycleId: 1, zoneId: 1, threatId: 1, ruleId: 1 },
  { name: 'unique_risk_event_per_context' }
);

// Delete cached model in development to avoid schema caching bugs on hot reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.RiskEvent) {
  delete mongoose.models.RiskEvent;
}

export const RiskEvent =
  mongoose.models.RiskEvent || mongoose.model<IRiskEvent>('RiskEvent', RiskEventSchema);
