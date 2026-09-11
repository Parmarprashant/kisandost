import mongoose, { Document, Schema } from 'mongoose';

export interface IPushLog extends Document {
  farmerCropId: string;
  advisoryId: string;
  userId: string;
  fcmToken: string;
  status: 'success' | 'failed';
  messageBody: string;
  errorDetail?: string;
  createdAt: Date;
}

const PushLogSchema: Schema = new Schema(
  {
    farmerCropId: {
      type: String,
      required: true,
      index: true,
    },
    advisoryId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    fcmToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    messageBody: {
      type: String,
      required: true,
    },
    errorDetail: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PushLog = mongoose.models.PushLog || mongoose.model<IPushLog>('PushLog', PushLogSchema);
