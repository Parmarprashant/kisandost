import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMembership extends Document {
  userId: string;
  planType: 'free' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserMembershipSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const UserMembership =
  mongoose.models.UserMembership ||
  mongoose.model<IUserMembership>('UserMembership', UserMembershipSchema);
