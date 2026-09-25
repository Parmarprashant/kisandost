import mongoose, { Document, Schema } from 'mongoose';

export interface IIcarVariety extends Document {
  varietyId: string;           // Compound slug, e.g. "wheat_hd-3298"
  cropId: string;              // Foreign key to IcarCrop.cropId, e.g. "wheat"
  varietyName: string;         // Official cultivar name, e.g. "HD 3298"
  releaseYear?: number | null; // Year mentioned in report
  notificationNumber?: string | null;
  maturityDaysMin: number | null; // Nullable - only populated from ICAR text
  maturityDaysMax: number | null; // Nullable - only populated from ICAR text
  recommendedZones: string[];  // e.g. ["NWPZ", "NEPZ", "Punjab", "Haryana"]
  breedingInstitute?: string | null; // e.g. "ICAR-IARI, New Delhi"
  adaptationEcology?: string | null; // e.g. "Timely Sown Irrigated (TS-IR)"
  keyTraits: string[];         // Special agronomic characteristics
  resistantTo: string[];       // Pests/diseases with confirmed resistance
  baseTemperatureC: number | null; // Strictly null - 0 agronomic mentions in ICAR reports
  gddToMaturity: number | null;    // Strictly null - 0 agronomic mentions in ICAR reports
  sourceReport: string;        // Source report filename
  sourcePage?: number | null;
  sourceLineRange?: string | null;
  conflictStatus?: 'NONE' | 'RESOLVED_RANGE' | 'REQUIRES_REVIEW';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IcarVarietySchema: Schema = new Schema(
  {
    varietyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cropId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    varietyName: {
      type: String,
      required: true,
      trim: true,
    },
    releaseYear: {
      type: Number,
      default: null,
    },
    notificationNumber: {
      type: String,
      default: null,
      trim: true,
    },
    maturityDaysMin: {
      type: Number,
      default: null, // Nullable when not specified in ICAR text
    },
    maturityDaysMax: {
      type: Number,
      default: null, // Nullable when not specified in ICAR text
    },
    recommendedZones: {
      type: [String],
      default: [],
    },
    breedingInstitute: {
      type: String,
      default: null,
      trim: true,
    },
    adaptationEcology: {
      type: String,
      default: null,
      trim: true,
    },
    keyTraits: {
      type: [String],
      default: [],
    },
    resistantTo: {
      type: [String],
      default: [],
    },
    baseTemperatureC: {
      type: Number,
      default: null, // Strictly null - do not invent GDD
    },
    gddToMaturity: {
      type: Number,
      default: null, // Strictly null - do not invent GDD
    },
    sourceReport: {
      type: String,
      required: true,
      trim: true,
    },
    sourcePage: {
      type: Number,
      default: null,
    },
    sourceLineRange: {
      type: String,
      default: null,
    },
    conflictStatus: {
      type: String,
      enum: ['NONE', 'RESOLVED_RANGE', 'REQUIRES_REVIEW'],
      default: 'NONE',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'icar_varieties',
  }
);

// Compound index for fast lookup by crop and variety name
IcarVarietySchema.index({ cropId: 1, varietyName: 1 });

export const IcarVariety =
  mongoose.models.IcarVariety || mongoose.model<IIcarVariety>('IcarVariety', IcarVarietySchema);
