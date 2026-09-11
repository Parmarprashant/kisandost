import mongoose, { Document, Schema } from 'mongoose';

export interface ISmsLog extends Document {
  farmerCropId: mongoose.Types.ObjectId;
  advisoryId: mongoose.Types.ObjectId;
  phoneNumber: string;
  sentAt: Date;
  status: string;
  messageBody: string;
}

const SmsLogSchema: Schema = new Schema(
  {
    farmerCropId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerCrop',
      required: true,
    },
    advisoryId: {
      type: Schema.Types.ObjectId,
      ref: 'CropAdvisory',
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    messageBody: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index so we don't spam the same advisory for the same crop lifecycle
SmsLogSchema.index({ farmerCropId: 1, advisoryId: 1 }, { unique: true });

export const SmsLog = mongoose.models.SmsLog || mongoose.model<ISmsLog>('SmsLog', SmsLogSchema);
