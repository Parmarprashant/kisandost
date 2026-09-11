import mongoose, { Schema, Document } from "mongoose";

export interface IYieldPrediction extends Document {
  userId: string;
  crop_type: string;
  area_acres: number;
  ndvi: number;
  soil_moisture: number;
  rainfall: number;
  predicted_yield: number;
  yield_per_acre: number;
  backend: string;
  createdAt: Date;
}

const YieldPredictionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  crop_type: { type: String, required: true },
  area_acres: { type: Number, required: true },
  ndvi: { type: Number, required: true },
  soil_moisture: { type: Number, required: true },
  rainfall: { type: Number, required: true },
  predicted_yield: { type: Number, required: true },
  yield_per_acre: { type: Number, required: true },
  backend: { type: String, default: "local" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.YieldPrediction ||
  mongoose.model<IYieldPrediction>("YieldPrediction", YieldPredictionSchema);
