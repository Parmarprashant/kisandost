import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneId?: mongoose.Types.ObjectId;
  cropName: string;
  cropMasterId?: string;
  icarCropId?: string;        // Normalized foreign key to IcarCrop.cropId, e.g. "wheat"
  variety?: string;
  varietyId?: string;          // Normalized foreign key to IcarVariety.varietyId, e.g. "wheat_hd-3298"
  sowingDate: Date;
  expectedHarvestDate?: Date;
  cultivatedArea: number;
  cultivatedAreaUnit: 'Acre' | 'Hectare';
  cultivationMethod?: 'Direct Sowing' | 'Transplanting' | 'Nursery → Transplanting' | 'Other';
  currentDas?: number;         // Days After Sowing calculated at runtime
  currentStageId?: string;     // Active phenological milestone ID
  gddParameterSetId?: string;  // Reference to GddParameterSet.parameter_set_id
  progressionMode?: 'DYNAMIC_GDD' | 'HYBRID_DAS' | 'DAS_ONLY';
  cumulativeGdd?: number;      // Current accumulated thermal units
  healthStatus?: 'STABLE' | 'ATTENTION' | 'HIGH_RISK';
  status: 'Active' | 'Harvested' | 'Removed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema: Schema = new Schema(
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
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    cropMasterId: {
      type: String,
      default: '',
    },
    icarCropId: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
      index: true,
    },
    variety: {
      type: String,
      default: '',
      trim: true,
    },
    varietyId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    sowingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      default: null,
    },
    cultivatedArea: {
      type: Number,
      required: true,
      min: 0.01,
    },
    cultivatedAreaUnit: {
      type: String,
      enum: ['Acre', 'Hectare'],
      default: 'Acre',
      required: true,
    },
    cultivationMethod: {
      type: String,
      default: 'Direct Sowing',
    },
    currentDas: {
      type: Number,
      default: 0,
    },
    currentStageId: {
      type: String,
      default: '',
    },
    gddParameterSetId: {
      type: String,
      default: null,
      index: true,
    },
    progressionMode: {
      type: String,
      enum: ['DYNAMIC_GDD', 'HYBRID_DAS', 'DAS_ONLY'],
      default: 'DAS_ONLY',
    },
    cumulativeGdd: {
      type: Number,
      default: 0,
    },
    healthStatus: {
      type: String,
      enum: ['STABLE', 'ATTENTION', 'HIGH_RISK'],
      default: 'STABLE',
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Harvested', 'Removed'],
      default: 'Active',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Crop = mongoose.models.Crop || mongoose.model<ICrop>('Crop', CropSchema);

// Export CropCycle as an alias to Crop to represent the runtime planted crop instance
export const CropCycle = Crop;
export type ICropCycle = ICrop;
