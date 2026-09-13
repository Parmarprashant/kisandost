import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  cropName: string;
  cropMasterId?: string;
  variety?: string;
  sowingDate: Date;
  cultivatedArea: number;
  cultivatedAreaUnit: 'Acre' | 'Hectare';
  cultivationMethod?: 'Direct Sowing' | 'Transplanting' | 'Nursery → Transplanting' | 'Other';
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
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    cropMasterId: {
      type: String,
      default: '',
    },
    variety: {
      type: String,
      default: '',
      trim: true,
    },
    sowingDate: {
      type: Date,
      required: true,
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
