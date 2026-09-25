import mongoose, { Document, Schema } from 'mongoose';

export type ExpertVerificationStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

export type ExpertSourceType =
  | 'ICAR_KVK'
  | 'ICAR_DIRECTORY'
  | 'ADMIN_VERIFIED'
  | 'MANUAL_ENTRY';

export interface IExpertProfile extends Document {
  userId?: mongoose.Types.ObjectId | null;
  fullName: string;
  institutionName: string;
  institutionType: string;
  designation?: string | null;
  specialization: string[];
  crops: string[];
  districts: string[];
  states: string[];
  officialEmail?: string | null;
  officialPhone?: string | null;
  sourceType: ExpertSourceType;
  sourceReference: string;
  verificationStatus: ExpertVerificationStatus;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  suspensionReason?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpertProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    institutionName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    institutionType: {
      type: String,
      required: true,
      default: 'KVK',
    },
    designation: {
      type: String,
      default: null,
      trim: true,
    },
    specialization: {
      type: [String],
      default: [],
    },
    crops: {
      type: [String],
      default: [],
      index: true,
    },
    districts: {
      type: [String],
      default: [],
      index: true,
    },
    states: {
      type: [String],
      default: [],
      index: true,
    },
    officialEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    officialPhone: {
      type: String,
      default: null,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['ICAR_KVK', 'ICAR_DIRECTORY', 'ADMIN_VERIFIED', 'MANUAL_ENTRY'],
      required: true,
      default: 'MANUAL_ENTRY',
      index: true,
    },
    sourceReference: {
      type: String,
      required: true,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      required: true,
      default: 'PENDING',
      index: true,
    },
    verifiedBy: {
      type: String,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'expert_profiles',
  }
);

ExpertProfileSchema.index({ verificationStatus: 1, isActive: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.ExpertProfile) {
  delete mongoose.models.ExpertProfile;
}

export const ExpertProfile =
  mongoose.models.ExpertProfile ||
  mongoose.model<IExpertProfile>('ExpertProfile', ExpertProfileSchema);

export default ExpertProfile;
