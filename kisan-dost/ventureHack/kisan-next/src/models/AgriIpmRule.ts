import mongoose, { Document, Schema } from 'mongoose';

export type IpmValidationStatus =
  | 'UNREVIEWED'
  | 'VALIDATION_REQUIRED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'CONFLICTING_SOURCES';

export interface IChemicalOption {
  activeIngredient: string | null;
  formulation: string | null;
  dosage: string | null;
  unit: string | null;
  dilution: string | null;
  applicationMethod: string | null;
  waitingPeriodDays: number | null; // Pre-Harvest Interval (PHI)
  reEntryIntervalHours: number | null; // Re-Entry Interval (REI)
  safetyPrecaution: string | null;
}

export interface ISourceCitation {
  organization: string;
  title: string;
  page: number;
  url?: string | null;
  publicationDate?: string | null;
  version?: string | null;
}

export interface IAgriIpmRule extends Document {
  ruleCode: string; // e.g. "IPM-WHEAT-RUST-01"
  cropName: string; // "Wheat", "Rice", "Maize", "Mustard", "Chickpea", "Cotton"
  icarCropId?: string; // "wheat", "rice", "maize", "mustard", "chickpea", "cotton"
  targetThreatName: string; // "Yellow Rust", "Rice Blast", "Gram Pod Borer", etc.
  threatType: 'pest' | 'disease' | 'weed' | 'abiotic';
  applicableStages: string[]; // ["Tillering", "Flowering", "All Stages"]
  symptoms: string[];
  riskConditions: string[];
  monitoringMethod?: string | null;
  economicThreshold?: string | null; // ETL description
  culturalControl: string[];
  mechanicalControl: string[];
  biologicalControl: string[];
  chemicalOption?: IChemicalOption | null;
  source: ISourceCitation;
  validationStatus: IpmValidationStatus;
  validationNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  // Phase 8 Governance & Versioning
  ruleVersion?: number;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  sourceVersion?: string | null;
  sourceRegistryCode?: string | null;
  supersededBy?: mongoose.Types.ObjectId | null;
  isCurrent?: boolean;
  conflictDetails?: string | null;
  regulatoryStatus?: {
    isBanned: boolean;
    isRestricted: boolean;
    isRegistered: boolean;
    labelClaimVerified: boolean;
    mupReference?: string | null;
    regulatoryNotes?: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const ChemicalOptionSchema = new Schema(
  {
    activeIngredient: { type: String, default: null, trim: true },
    formulation: { type: String, default: null, trim: true },
    dosage: { type: String, default: null, trim: true },
    unit: { type: String, default: null, trim: true },
    dilution: { type: String, default: null, trim: true },
    applicationMethod: { type: String, default: null, trim: true },
    waitingPeriodDays: { type: Number, default: null },
    reEntryIntervalHours: { type: Number, default: null },
    safetyPrecaution: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const SourceCitationSchema = new Schema(
  {
    organization: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    page: { type: Number, required: true, min: 1 },
    url: { type: String, default: null },
    publicationDate: { type: String, default: null },
    version: { type: String, default: null },
  },
  { _id: false }
);

const AgriIpmRuleSchema = new Schema(
  {
    ruleCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    icarCropId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    targetThreatName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    threatType: {
      type: String,
      enum: ['pest', 'disease', 'weed', 'abiotic'],
      required: true,
      default: 'disease',
    },
    applicableStages: {
      type: [String],
      default: ['All Stages'],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    riskConditions: {
      type: [String],
      default: [],
    },
    monitoringMethod: {
      type: String,
      default: null,
    },
    economicThreshold: {
      type: String,
      default: null,
    },
    culturalControl: {
      type: [String],
      default: [],
    },
    mechanicalControl: {
      type: [String],
      default: [],
    },
    biologicalControl: {
      type: [String],
      default: [],
    },
    chemicalOption: {
      type: ChemicalOptionSchema,
      default: null,
    },
    source: {
      type: SourceCitationSchema,
      required: true,
    },
    validationStatus: {
      type: String,
      enum: [
        'UNREVIEWED',
        'VALIDATION_REQUIRED',
        'VALIDATED',
        'REJECTED',
        'SUPERSEDED',
        'CONFLICTING_SOURCES',
      ],
      default: 'VALIDATION_REQUIRED',
      required: true,
      index: true,
    },
    validationNotes: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    // Phase 8 Governance & Versioning
    ruleVersion: {
      type: Number,
      default: 1,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    sourceVersion: {
      type: String,
      default: '2026-v1',
    },
    sourceRegistryCode: {
      type: String,
      default: null,
      index: true,
    },
    supersededBy: {
      type: Schema.Types.ObjectId,
      ref: 'AgriIpmRule',
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    conflictDetails: {
      type: String,
      default: null,
    },
    regulatoryStatus: {
      type: {
        isBanned: { type: Boolean, default: false },
        isRestricted: { type: Boolean, default: false },
        isRegistered: { type: Boolean, default: true },
        labelClaimVerified: { type: Boolean, default: false },
        mupReference: { type: String, default: null },
        regulatoryNotes: { type: String, default: null },
      },
      default: null,
      _id: false,
    },
  },
  {
    timestamps: true,
    collection: 'agri_ipm_rules',
  }
);

// Indexes for advisory matching
AgriIpmRuleSchema.index({ cropName: 1, targetThreatName: 1, validationStatus: 1, isCurrent: 1 });
AgriIpmRuleSchema.index({ icarCropId: 1, validationStatus: 1, isCurrent: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AgriIpmRule) {
  delete mongoose.models.AgriIpmRule;
}

export const AgriIpmRule =
  mongoose.models.AgriIpmRule || mongoose.model<IAgriIpmRule>('AgriIpmRule', AgriIpmRuleSchema);
