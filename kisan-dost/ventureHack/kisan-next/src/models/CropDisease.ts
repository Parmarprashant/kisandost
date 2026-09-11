import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendedProduct {
  name: string;
  productId: string;
}

export interface ICropDisease extends Document {
  cropName: string;
  diseaseName: string;
  description: string;
  symptoms: string[];
  precautions: string[];
  recommendedPesticides: IRecommendedProduct[];
  recommendedFertilizers: IRecommendedProduct[];
}

const RecommendedProductSchema = new Schema<IRecommendedProduct>({
  name: { type: String, required: true },
  productId: { type: String, required: true },
}, { _id: false });

const CropDiseaseSchema = new Schema<ICropDisease>({
  cropName: { type: String, required: true, lowercase: true, trim: true, index: true },
  diseaseName: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  symptoms: [{ type: String }],
  precautions: [{ type: String }],
  recommendedPesticides: [RecommendedProductSchema],
  recommendedFertilizers: [RecommendedProductSchema],
}, { timestamps: true });

CropDiseaseSchema.index({ diseaseName: 'text', cropName: 1 });

export const CropDisease =
  mongoose.models.CropDisease ||
  mongoose.model<ICropDisease>('CropDisease', CropDiseaseSchema);
