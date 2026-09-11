import mongoose, { Document, Schema } from 'mongoose';

export interface ICropAdvisory extends Document {
  cropType: string;
  stageName: string;
  daysAfterSowingStart: number;
  daysAfterSowingEnd: number;
  pesticideName: string;
  dosagePerAcre: number;
  purpose: string;
  messageTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropAdvisorySchema: Schema = new Schema(
  {
    cropType: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    stageName: {
      type: String,
      required: true,
      trim: true,
    },
    daysAfterSowingStart: {
      type: Number,
      required: true,
      min: 0,
    },
    daysAfterSowingEnd: {
      type: Number,
      required: true,
      min: 0,
    },
    pesticideName: {
      type: String,
      required: true,
      trim: true,
    },
    dosagePerAcre: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    messageTemplate: {
      type: String, // E.g., "Your {{crop}} is in {{stage}}. Spray {{dosage}} ml {{pesticide}} to prevent pests."
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that start is not after end using a schema-level custom validator
CropAdvisorySchema.path('daysAfterSowingEnd').validate(function(value: number) {
  return value >= (this as any).daysAfterSowingStart;
}, 'daysAfterSowingStart cannot be greater than daysAfterSowingEnd');


export const CropAdvisory =
  mongoose.models.CropAdvisory || mongoose.model<ICropAdvisory>('CropAdvisory', CropAdvisorySchema);
