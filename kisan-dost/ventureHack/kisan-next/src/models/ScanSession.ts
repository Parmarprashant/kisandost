import mongoose, { Document, Schema } from 'mongoose';

export type ScanSessionStatus =
  | 'INITIAL_SCAN'
  | 'ADDITIONAL_IMAGES_REQUIRED'
  | 'ANALYZING'
  | 'COMPLETED'
  | 'INCONCLUSIVE'
  | 'CANCELLED';

export type ScanSessionResult =
  | 'NO_CONCERN_DETECTED'
  | 'POTENTIAL_CONCERN'
  | 'INCONCLUSIVE';

export interface IEvidenceSummary {
  diagnoses: string[];
  confidences: number[];
  repeatedDiagnosis: string | null;
  isConsistent: boolean;
  requiresExpertVerification?: boolean;
}

export interface IScanSession extends Document {
  farmerId: string;
  cropId: mongoose.Types.ObjectId;
  fieldId: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  status: ScanSessionStatus;
  result: ScanSessionResult | null;
  scanCount: number;
  maxAdditionalImages: number;
  requiresAdditionalImages: boolean;
  currentStep: number;
  initialScanId?: mongoose.Types.ObjectId | null;
  scanIds: mongoose.Types.ObjectId[];
  evidenceSummary: IEvidenceSummary;
  notes?: string;
  startedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSummarySchema = new Schema(
  {
    diagnoses: { type: [String], default: [] },
    confidences: { type: [Number], default: [] },
    repeatedDiagnosis: { type: String, default: null },
    isConsistent: { type: Boolean, default: true },
    requiresExpertVerification: { type: Boolean, default: false },
  },
  { _id: false }
);

const ScanSessionSchema: Schema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    cropId: {
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
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'INITIAL_SCAN',
        'ADDITIONAL_IMAGES_REQUIRED',
        'ANALYZING',
        'COMPLETED',
        'INCONCLUSIVE',
        'CANCELLED',
      ],
      default: 'INITIAL_SCAN',
      index: true,
    },
    result: {
      type: String,
      enum: ['NO_CONCERN_DETECTED', 'POTENTIAL_CONCERN', 'INCONCLUSIVE', null],
      default: null,
    },
    scanCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxAdditionalImages: {
      type: Number,
      default: 3, // Configurable application limit
      min: 1,
    },
    requiresAdditionalImages: {
      type: Boolean,
      default: false,
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    initialScanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      default: null,
    },
    scanIds: {
      type: [Schema.Types.ObjectId],
      ref: 'CropDiseaseScan',
      default: [],
    },
    evidenceSummary: {
      type: EvidenceSummarySchema,
      default: () => ({}),
    },
    notes: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'scan_sessions',
  }
);

ScanSessionSchema.index({ cropId: 1, zoneId: 1, createdAt: -1 });
ScanSessionSchema.index({ farmerId: 1, createdAt: -1 });

export const ScanSession =
  mongoose.models.ScanSession ||
  mongoose.model<IScanSession>('ScanSession', ScanSessionSchema);
