import mongoose, { Document, Schema } from 'mongoose';
import './AgriIpmRule';

export interface IAdvisoryChemicalAction {
  offered: boolean;
  activeIngredient?: string | null;
  formulation?: string | null;
  dosage?: string | null;
  unit?: string | null;
  dilution?: string | null;
  applicationMethod?: string | null;
  phiDays?: number | null;
  reiHours?: number | null;
  safetyPrecaution?: string | null;
  unavailabilityReason?: string | null;
}

export interface IAdvisorySourceReference {
  organization: string;
  title: string;
  page: number;
}

export interface IAgriAdvisory extends Document {
  farmerId: string;
  cropCycleId: mongoose.Types.ObjectId;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId | null;
  riskEventId: mongoose.Types.ObjectId;
  threatName: string;
  riskStatus: string;
  riskLevel: string;
  growthStage: string;
  das: number;
  advisoryHeadline: string;
  advisorySummary: string;
  monitoringAdvice: string[];
  culturalActions: string[];
  mechanicalActions: string[];
  biologicalActions: string[];
  chemicalAction: IAdvisoryChemicalAction;
  matchedRuleIds: mongoose.Types.ObjectId[];
  sourceCitations: IAdvisorySourceReference[];
  validFrom: Date;
  validUntil: Date;
  isSuperseded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdvisoryChemicalActionSchema = new Schema(
  {
    offered: { type: Boolean, required: true, default: false },
    activeIngredient: { type: String, default: null },
    formulation: { type: String, default: null },
    dosage: { type: String, default: null },
    unit: { type: String, default: null },
    dilution: { type: String, default: null },
    applicationMethod: { type: String, default: null },
    phiDays: { type: Number, default: null },
    reiHours: { type: Number, default: null },
    safetyPrecaution: { type: String, default: null },
    unavailabilityReason: { type: String, default: null },
  },
  { _id: false }
);

const AdvisorySourceReferenceSchema = new Schema(
  {
    organization: { type: String, required: true },
    title: { type: String, required: true },
    page: { type: Number, required: true },
  },
  { _id: false }
);

const AgriAdvisorySchema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
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
    riskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      required: true,
      index: true,
    },
    threatName: {
      type: String,
      required: true,
      trim: true,
    },
    riskStatus: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      required: true,
    },
    growthStage: {
      type: String,
      required: true,
    },
    das: {
      type: Number,
      required: true,
    },
    advisoryHeadline: {
      type: String,
      required: true,
    },
    advisorySummary: {
      type: String,
      required: true,
    },
    monitoringAdvice: {
      type: [String],
      default: [],
    },
    culturalActions: {
      type: [String],
      default: [],
    },
    mechanicalActions: {
      type: [String],
      default: [],
    },
    biologicalActions: {
      type: [String],
      default: [],
    },
    chemicalAction: {
      type: AdvisoryChemicalActionSchema,
      required: true,
      default: () => ({ offered: false }),
    },
    matchedRuleIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'AgriIpmRule' }],
      default: [],
    },
    sourceCitations: {
      type: [AdvisorySourceReferenceSchema],
      default: [],
    },
    validFrom: {
      type: Date,
      default: () => new Date(),
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isSuperseded: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'agri_advisories',
  }
);

AgriAdvisorySchema.index({ cropCycleId: 1, createdAt: -1 });
AgriAdvisorySchema.index({ farmerId: 1, riskEventId: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AgriAdvisory) {
  delete mongoose.models.AgriAdvisory;
}

export const AgriAdvisory =
  mongoose.models.AgriAdvisory || mongoose.model<IAgriAdvisory>('AgriAdvisory', AgriAdvisorySchema);
