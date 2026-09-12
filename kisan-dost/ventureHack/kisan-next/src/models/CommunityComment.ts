import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  authorName: string;
  authorLocation?: string;
  content: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema: Schema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmerPost',
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorLocation: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CommunityCommentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.models.CommunityComment || mongoose.model<ICommunityComment>('CommunityComment', CommunityCommentSchema);
