import mongoose from 'mongoose';

const FarmCalculationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  crop: {
    type: String,
    required: true,
  },
  areaAcres: {
    type: Number,
    required: true,
  },
  soilType: {
    type: String,
    required: true,
  },
  npkDosings: {
    type: Object, // e.g. { n: 120, p: 60, k: 40 }
    required: true
  },
  totalBags: {
    type: Number,
  },
  costEstimate: {
    type: Number,
  }
}, { timestamps: true });

export default mongoose.models.FarmCalculation || mongoose.model('FarmCalculation', FarmCalculationSchema);
