import mongoose, { Document, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: string;
  qrCodeId: string;
  productName?: string;
  result: 'genuine' | 'fake' | 'notfound';
  scanTime: Date;
}

const ScanHistorySchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    qrCodeId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      default: null,
    },
    result: {
      type: String,
      enum: ['genuine', 'fake', 'notfound'],
      required: true,
    },
    scanTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const ScanHistory =
  mongoose.models.ScanHistory ||
  mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);
