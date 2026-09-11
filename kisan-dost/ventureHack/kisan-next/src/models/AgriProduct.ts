import mongoose, { Document, Schema } from 'mongoose';

export interface IAgriProduct extends Document {
  productId: string;
  productName: string;
  category: 'pesticide' | 'fertilizer';
  price: number;
  brand: string;
  description: string;
  usage: string;
  stock: number;
  imageUrl?: string;
}

const AgriProductSchema = new Schema<IAgriProduct>({
  productId: { type: String, required: true, unique: true, index: true },
  productName: { type: String, required: true, trim: true },
  category: { type: String, enum: ['pesticide', 'fertilizer'], required: true },
  price: { type: Number, required: true, min: 0 },
  brand: { type: String, required: true },
  description: { type: String, required: true },
  usage: { type: String, required: true },
  stock: { type: Number, default: 100 },
  imageUrl: { type: String },
}, { timestamps: true });

export const AgriProduct =
  mongoose.models.AgriProduct ||
  mongoose.model<IAgriProduct>('AgriProduct', AgriProductSchema);
