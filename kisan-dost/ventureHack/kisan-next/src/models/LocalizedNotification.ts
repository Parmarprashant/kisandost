/**
 * LocalizedNotification.ts
 * ============================================================================
 * Multi-channel, multi-lingual delivery log and audit record for Phase 10.
 * Tracks delivery across FCM, WhatsApp, SMS, and Voice channels.
 * ============================================================================
 */

import mongoose, { Document, Schema } from 'mongoose';

export type DeliveryChannel = 'FCM' | 'WHATSAPP' | 'SMS' | 'VOICE';

export type LocalizedDeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'SKIPPED'
  | 'UNAVAILABLE';

export interface ILocalizedNotification extends Document {
  farmerId: string;
  sourceType: 'RISK_EVENT' | 'ADVISORY' | 'EXPERT_TICKET' | 'MANUAL';
  sourceId: string;
  language: string;
  channel: DeliveryChannel;
  title: string;
  body: string;
  audioAssetId?: string | null;
  templateId?: string | null;
  provider: 'fcm' | 'twilio_whatsapp' | 'twilio_sms' | 'vexyl_tts' | string;
  providerMessageId?: string | null;
  deliveryStatus: LocalizedDeliveryStatus;
  failureReason?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedNotificationSchema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true
    },
    sourceType: {
      type: String,
      enum: ['RISK_EVENT', 'ADVISORY', 'EXPERT_TICKET', 'MANUAL'],
      required: true,
      index: true
    },
    sourceId: {
      type: String,
      required: true,
      index: true
    },
    language: {
      type: String,
      required: true,
      default: 'hi-IN'
    },
    channel: {
      type: String,
      enum: ['FCM', 'WHATSAPP', 'SMS', 'VOICE'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    audioAssetId: {
      type: String,
      default: null
    },
    templateId: {
      type: String,
      default: null
    },
    provider: {
      type: String,
      required: true
    },
    providerMessageId: {
      type: String,
      default: null
    },
    deliveryStatus: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED', 'UNAVAILABLE'],
      required: true,
      default: 'QUEUED',
      index: true
    },
    failureReason: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for audit history and duplicate checks
LocalizedNotificationSchema.index({ farmerId: 1, sourceId: 1, channel: 1, createdAt: -1 });

export const LocalizedNotification =
  mongoose.models.LocalizedNotification ||
  mongoose.model<ILocalizedNotification>('LocalizedNotification', LocalizedNotificationSchema);

export default LocalizedNotification;
