import mongoose from "mongoose";

const NotificationTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  fcmToken: {
    type: String,
    required: true,
    unique: true,
  },
  platform: {
    type: String,
    default: "web",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.models.NotificationToken || mongoose.model("NotificationToken", NotificationTokenSchema);
