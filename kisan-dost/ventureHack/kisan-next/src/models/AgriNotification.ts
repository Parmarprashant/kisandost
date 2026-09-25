import mongoose, { Document, Schema } from 'mongoose';

export type AgriNotificationType =
  | 'HIGH_RISK_ALERT'
  | 'ATTENTION_ALERT'
  | 'INTERVENTION_REMINDER'
  | 'INCONCLUSIVE_RESCAN'
  | 'INSUFFICIENT_DATA_REQUEST';

export type DeliveryStatus =
  | 'SENT'
  | 'UNAVAILABLE'
  | 'SKIPPED'
  | 'FAILED';

export interface IAgriNotification extends Document {
  farmerId: string;
  cropCycleId: mongoose.Types.ObjectId;
  advisoryId?: mongoose.Types.ObjectId | null;
  riskEventId?: mongoose.Types.ObjectId | null;
  notificationType: AgriNotificationType;
  dedupKey: string;
  title: string;
  body: string;
  deliveryStatus: DeliveryStatus;
  failureReason?: string | null;
  deliveredTokenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgriNotificationSchema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    advisoryId: {
      type: Schema.Types.ObjectId,
      ref: 'AgriAdvisory',
      default: null,
      index: true,
    },
    riskEventId: {
      type: Schema.Types.ObjectId,
      ref: 'RiskEvent',
      default: null,
      index: true,
    },
    notificationType: {
      type: String,
      enum: [
        'HIGH_RISK_ALERT',
        'ATTENTION_ALERT',
        'INTERVENTION_REMINDER',
        'INCONCLUSIVE_RESCAN',
        'INSUFFICIENT_DATA_REQUEST',
      ],
      required: true,
    },
    dedupKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['SENT', 'UNAVAILABLE', 'SKIPPED', 'FAILED'],
      required: true,
      default: 'UNAVAILABLE',
    },
    failureReason: {
      type: String,
      default: null,
    },
    deliveredTokenCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'agri_notifications',
  }
);

AgriNotificationSchema.index({ farmerId: 1, createdAt: -1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AgriNotification) {
  delete mongoose.models.AgriNotification;
}

export const AgriNotification =
  mongoose.models.AgriNotification ||
  mongoose.model<IAgriNotification>('AgriNotification', AgriNotificationSchema);
