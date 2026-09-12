import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmerPost extends Document {
  authorId?: mongoose.Types.ObjectId;
  authorName: string;
  postType: 'Farmer Experience' | 'Crop Problem' | 'Ask Farmers' | 'Success Story' | 'Prevention Tip';
  crop: string;
  cropStage?: string;
  location: {
    state: string;
    district: string;
  };
  title: string;
  problem: string;
  symptoms?: string[];
  whatIDid?: string;
  result?: string;
  precautions?: string;
  images: string[];
  helpfulCount: number;
  helpfulUsers: string[];
  savedByUsers: string[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerPostSchema: Schema = new Schema(
  {
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
    postType: {
      type: String,
      enum: ['Farmer Experience', 'Crop Problem', 'Ask Farmers', 'Success Story', 'Prevention Tip'],
      default: 'Farmer Experience',
      required: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    cropStage: {
      type: String,
      trim: true,
    },
    location: {
      state: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    whatIDid: {
      type: String,
      default: '',
    },
    result: {
      type: String,
      default: '',
    },
    precautions: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulUsers: {
      type: [String],
      default: [],
    },
    savedByUsers: {
      type: [String],
      default: [],
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Search index on text fields
FarmerPostSchema.index({
  title: 'text',
  problem: 'text',
  whatIDid: 'text',
  crop: 'text',
  symptoms: 'text',
});

// Compound indexes for fast filtering
FarmerPostSchema.index({ crop: 1, postType: 1 });
FarmerPostSchema.index({ 'location.state': 1 });
FarmerPostSchema.index({ createdAt: -1 });

export default mongoose.models.FarmerPost || mongoose.model<IFarmerPost>('FarmerPost', FarmerPostSchema);
