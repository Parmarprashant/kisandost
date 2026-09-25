import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for Google OAuth users
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  mobile: {
    type: String,
  },
  village: {
    type: String,
  },
  district: {
    type: String,
  },
  mainCrop: {
    type: String,
  },
  role: {
    type: String,
    enum: ['farmer', 'reviewer', 'admin', 'expert'],
    default: 'farmer',
  },
  preferredLanguage: {
    type: String,
    enum: ['hi-IN', 'gu-IN', 'mr-IN', 'hi', 'gu', 'mr', 'en'],
    default: 'hi-IN',
  },
  notificationChannels: {
    type: [String],
    default: ['FCM', 'WHATSAPP'],
  },
  whatsappNumber: {
    type: String,
    default: null,
  },
  smsNumber: {
    type: String,
    default: null,
  },
  voiceEnabled: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export interface IUser extends mongoose.Document {
  googleId?: string;
  email?: string;
  username: string;
  password?: string;
  name: string;
  avatar?: string;
  mobile?: string;
  village?: string;
  district?: string;
  mainCrop?: string;
  role: 'farmer' | 'reviewer' | 'admin' | 'expert';
  preferredLanguage: string;
  notificationChannels: string[];
  whatsappNumber?: string | null;
  smsNumber?: string | null;
  voiceEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
