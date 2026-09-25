import mongoose, { Document, Schema } from 'mongoose';

export type TrainingSampleStatus =
  | 'CANDIDATE'
  | 'APPROVED'
  | 'EXCLUDED'
  | 'USED_FOR_TRAINING';

export interface IVerifiedTrainingSample extends Document {
  scanId: mongoose.Types.ObjectId;
  expertReviewId: mongoose.Types.ObjectId;
  imageReference: string;
  crop: string;
  aiDiagnosis: string;
  verifiedDiagnosis: string;
  verificationConfidence?: number | null;
  expertId: mongoose.Types.ObjectId;
  status: TrainingSampleStatus;
  inclusionNotes?: string | null;
  reviewedByAdmin?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VerifiedTrainingSampleSchema = new Schema(
  {
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'CropDiseaseScan',
      required: true,
      index: true,
    },
    expertReviewId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertReview',
      required: true,
      index: true,
    },
    imageReference: {
      type: String,
      required: true,
      trim: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    aiDiagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedDiagnosis: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    verificationConfidence: {
      type: Number,
      default: null,
    },
    expertId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpertProfile',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['CANDIDATE', 'APPROVED', 'EXCLUDED', 'USED_FOR_TRAINING'],
      required: true,
      default: 'CANDIDATE',
      index: true,
    },
    inclusionNotes: {
      type: String,
      default: null,
    },
    reviewedByAdmin: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'verified_training_samples',
  }
);

VerifiedTrainingSampleSchema.index({ crop: 1, status: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.VerifiedTrainingSample) {
  delete mongoose.models.VerifiedTrainingSample;
}

export const VerifiedTrainingSample =
  mongoose.models.VerifiedTrainingSample ||
  mongoose.model<IVerifiedTrainingSample>(
    'VerifiedTrainingSample',
    VerifiedTrainingSampleSchema
  );

export default VerifiedTrainingSample;
