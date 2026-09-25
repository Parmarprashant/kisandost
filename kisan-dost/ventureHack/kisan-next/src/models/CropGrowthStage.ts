import mongoose, { Document, Schema } from 'mongoose';

export interface ICropGrowthStage extends Document {
  cropId: string;              // Foreign key to IcarCrop.cropId, e.g. "wheat"
  varietyId?: string | null;   // Nullable - present only if variety-specific
  stageOrder: number;          // 1, 2, 3, 4 (sequential progression)
  stageName: string;           // e.g. "Crown Root Initiation & Tillering"
  dasStart: number;            // Days After Sowing start
  dasEnd: number;              // Days After Sowing end
  gddStart: number | null;     // Strictly null - no BBCH / GDD invented
  gddEnd: number | null;       // Strictly null - no BBCH / GDD invented
  phenologicalSigns: string[]; // Characteristic botanical markers
  waterStressSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vulnerablePests: string[];   // Pests that typically target this stage
  sourceReferences: string[];  // ICAR agronomy trial citations
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CropGrowthStageSchema: Schema = new Schema(
  {
    cropId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    varietyId: {
      type: String,
      default: null,
      trim: true,
    },
    stageOrder: {
      type: Number,
      required: true,
      min: 1,
    },
    stageName: {
      type: String,
      required: true,
      trim: true,
    },
    dasStart: {
      type: Number,
      required: true,
      min: 0,
    },
    dasEnd: {
      type: Number,
      required: true,
      min: 0,
    },
    gddStart: {
      type: Number,
      default: null, // Strictly null - do not invent GDD
    },
    gddEnd: {
      type: Number,
      default: null, // Strictly null - do not invent GDD
    },
    phenologicalSigns: {
      type: [String],
      default: [],
    },
    waterStressSensitivity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    vulnerablePests: {
      type: [String],
      default: [],
    },
    sourceReferences: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'crop_growth_stages',
  }
);

// Compound index for querying stages in chronological order for a crop
CropGrowthStageSchema.index({ cropId: 1, stageOrder: 1 });
CropGrowthStageSchema.index({ cropId: 1, dasStart: 1, dasEnd: 1 });

export const CropGrowthStage =
  mongoose.models.CropGrowthStage ||
  mongoose.model<ICropGrowthStage>('CropGrowthStage', CropGrowthStageSchema);
