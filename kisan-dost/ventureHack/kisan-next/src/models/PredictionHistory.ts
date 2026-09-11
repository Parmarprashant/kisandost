import mongoose, { Schema, Document } from "mongoose";

export interface IPredictionHistory extends Document {
  userId: string;
  cropType: string;
  landArea: number;
  soilNitrogen: number;
  soilPhosphorus: number;
  soilPotassium: number;
  rainfall: number;
  predictedYield: number;
  mandiPrice: number;
  estimatedRevenue: number;
  fertilizerCost: number;
  pesticideCost: number;
  irrigationCost: number;
  netProfit: number;
  recommendation: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
}

const PredictionHistorySchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  cropType: { type: String, required: true },
  landArea: { type: Number, required: true },
  soilNitrogen: { type: Number, required: true },
  soilPhosphorus: { type: Number, required: true },
  soilPotassium: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  predictedYield: { type: Number, required: true },
  mandiPrice: { type: Number, required: true },
  estimatedRevenue: { type: Number, required: true },
  fertilizerCost: { type: Number, required: true },
  pesticideCost: { type: Number, required: true },
  irrigationCost: { type: Number, default: 0 },
  netProfit: { type: Number, required: true },
  recommendation: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

// Clear the model from cache to ensure schema updates are applied in development
if (mongoose.models.PredictionHistory) {
  delete (mongoose as any).models.PredictionHistory;
}

export default mongoose.model<IPredictionHistory>("PredictionHistory", PredictionHistorySchema);

