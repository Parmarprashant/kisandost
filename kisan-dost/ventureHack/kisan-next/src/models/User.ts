import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
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
