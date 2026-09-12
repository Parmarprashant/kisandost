import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityReport extends Document {
  postId: mongoose.Types.ObjectId;
  reportedBy?: mongoose.Types.ObjectId;
  reporterName?: string;
  reason: string;
  details?: string;
  createdAt: Date;
}

const CommunityReportSchema: Schema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerPost',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reporterName: {
      type: String,
      default: 'Anonymous Farmer',
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.CommunityReport || mongoose.model<ICommunityReport>('CommunityReport', CommunityReportSchema);
