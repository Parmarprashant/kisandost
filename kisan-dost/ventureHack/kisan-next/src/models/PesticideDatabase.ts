import mongoose, { Document, Schema } from 'mongoose';

export interface IPesticideDatabase extends Document {
  productName: string;
  brandName: string;
  manufacturer: string;
  licenseNumber: string;
  qrCodeId: string;
  pesticideType: string;
  dosagePerAcre: string;
  usageInstructions: string;
  isAuthentic: boolean;
}

const PesticideDatabaseSchema: Schema = new Schema(
  {
    productName: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    qrCodeId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Fast lookup on scan
    },
    pesticideType: { type: String, required: true },
    dosagePerAcre: { type: String, required: true },
    usageInstructions: { type: String, required: true },
    isAuthentic: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const PesticideDatabase =
  mongoose.models.PesticideDatabase ||
  mongoose.model<IPesticideDatabase>('PesticideDatabase', PesticideDatabaseSchema);
