import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmerCrop extends Document {
  farmerId: string;
  cropType: string;
  plantationDate: Date;
  landArea: number; // in acres
  location: string;
  phoneNumber: string;
  lastAdvisorySent?: string;
  initialAdvisorySent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerCropSchema: Schema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true, // For fast querying by Clerk user ID
    },
    cropType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    plantationDate: {
      type: Date,
      required: true,
    },
    landArea: {
      type: Number,
      required: true,
      min: 0.1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    lastAdvisorySent: {
      type: String,
      default: null,
    },
    initialAdvisorySent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent re-compilation of Next.js models in dev 
export const FarmerCrop =
  mongoose.models.FarmerCrop || mongoose.model<IFarmerCrop>('FarmerCrop', FarmerCropSchema);
