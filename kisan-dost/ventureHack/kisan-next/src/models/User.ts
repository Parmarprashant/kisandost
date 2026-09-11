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
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
