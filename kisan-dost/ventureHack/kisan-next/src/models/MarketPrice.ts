import mongoose, { Schema, Document } from "mongoose";

export interface IMarketPrice extends Document {
  crop: string;
  mandi: string;
  pricePerQuintal: number;
  state?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  variety?: string;
  arrivalDate?: string;
  source?: string;
  lastUpdated: Date;
}

const MarketPriceSchema: Schema = new Schema({
  crop: { type: String, required: true },
  mandi: { type: String, required: true },
  pricePerQuintal: { type: Number, required: true },
  state: { type: String, default: "" },
  district: { type: String, default: "" },
  minPrice: { type: Number },
  maxPrice: { type: Number },
  variety: { type: String, default: "" },
  arrivalDate: { type: String, default: "" },
  source: { type: String, default: "data.gov.in" },
  lastUpdated: { type: Date, default: Date.now },
});

// Compound index for faster searches
MarketPriceSchema.index({ crop: 1, mandi: 1 }, { unique: true });
MarketPriceSchema.index({ crop: 1, state: 1 });

export default mongoose.models.MarketPrice || mongoose.model<IMarketPrice>("MarketPrice", MarketPriceSchema);
