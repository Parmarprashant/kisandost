import mongoose, { Schema, Document } from "mongoose";

export interface IMarketPrice extends Document {
  crop: string;
  mandi: string;
  pricePerQuintal: number;
  lastUpdated: Date;
}

const MarketPriceSchema: Schema = new Schema({
  crop: { type: String, required: true },
  mandi: { type: String, required: true },
  pricePerQuintal: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Compound index for faster searches
MarketPriceSchema.index({ crop: 1, mandi: 1 }, { unique: true });

export default mongoose.models.MarketPrice || mongoose.model<IMarketPrice>("MarketPrice", MarketPriceSchema);
