import mongoose, { Document, Schema } from 'mongoose';

export interface ICropMaster extends Document {
  cropName: string;
  varieties: string[];
  active: boolean;
}

const CropMasterSchema: Schema = new Schema(
  {
    cropName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    varieties: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const CropMaster =
  mongoose.models.CropMaster || mongoose.model<ICropMaster>('CropMaster', CropMasterSchema);
