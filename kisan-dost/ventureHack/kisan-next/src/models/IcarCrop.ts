import mongoose, { Document, Schema } from 'mongoose';

export interface IIcarCrop extends Document {
  cropId: string;              // Primary slug, e.g. "wheat", "rice", "cotton", "groundnut", "soybean"
  commonName: string;          // e.g. "Wheat"
  botanicalName?: string;      // e.g. "Triticum aestivum"
  hindiName?: string;          // e.g. "गेहूं"
  cropType: 'Cereal' | 'Fiber' | 'Oilseed' | 'Pulse' | 'Horticulture' | 'Other';
  primarySeasons: string[];    // ["Kharif", "Rabi", "Zaid", "Summer", "Boro"]
  baseTemperatureC: number | null; // Strictly null - 0 agronomic mentions in ICAR reports
  targetGdd: number | null;        // Strictly null - 0 agronomic mentions in ICAR reports
  isPriorityCrop: boolean;     // true for the 5 MVP crops
  sourceReports: string[];     // ["ICAR-Annual-Report-2022-23", ...]
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IcarCropSchema: Schema = new Schema(
  {
    cropId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    commonName: {
      type: String,
      required: true,
      trim: true,
    },
    botanicalName: {
      type: String,
      default: '',
      trim: true,
    },
    hindiName: {
      type: String,
      default: '',
      trim: true,
    },
    cropType: {
      type: String,
      enum: ['Cereal', 'Fiber', 'Oilseed', 'Pulse', 'Horticulture', 'Other'],
      default: 'Other',
      required: true,
    },
    primarySeasons: {
      type: [String],
      default: [],
    },
    baseTemperatureC: {
      type: Number,
      default: null, // Strictly null - do not invent GDD/thermal thresholds
    },
    targetGdd: {
      type: Number,
      default: null, // Strictly null - do not invent GDD/thermal thresholds
    },
    isPriorityCrop: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceReports: {
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
    collection: 'icar_crops',
  }
);

export const IcarCrop =
  mongoose.models.IcarCrop || mongoose.model<IIcarCrop>('IcarCrop', IcarCropSchema);
