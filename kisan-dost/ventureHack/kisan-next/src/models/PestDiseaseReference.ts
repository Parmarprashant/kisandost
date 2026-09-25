import mongoose, { Document, Schema } from 'mongoose';

export interface IPestDiseaseReference extends Document {
  referenceId: string;         // Unique slug, e.g. "wheat_leaf_rust"
  cropId: string;              // Foreign key to IcarCrop.cropId, e.g. "wheat"
  cropName: string;            // e.g. "Wheat"
  commonName: string;          // e.g. "Leaf Rust / Brown Rust"
  scientificName?: string | null; // e.g. "Puccinia triticina"
  category: 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'INSECT_PEST' | 'NEMATODE' | 'OTHER';
  symptoms: string[];          // Verified visual symptom patterns
  susceptibleStageNames: string[]; // Phenological stages vulnerable to this pest/disease
  resistantCultivars: string[];    // Certified cultivars with demonstrated resistance
  culturalManagement: string[];    // ICAR-recommended cultural/sanitation control practices
  sourceReports: string[];     // Source ICAR reports
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PestDiseaseReferenceSchema: Schema = new Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cropId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    commonName: {
      type: String,
      required: true,
      trim: true,
    },
    scientificName: {
      type: String,
      default: null,
      trim: true,
    },
    category: {
      type: String,
      enum: ['FUNGAL', 'BACTERIAL', 'VIRAL', 'INSECT_PEST', 'NEMATODE', 'OTHER'],
      default: 'OTHER',
      required: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    susceptibleStageNames: {
      type: [String],
      default: [],
    },
    resistantCultivars: {
      type: [String],
      default: [],
    },
    culturalManagement: {
      type: [String],
      default: [],
    },
    sourceReports: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'pest_disease_references',
  }
);

PestDiseaseReferenceSchema.index({ cropId: 1, commonName: 1 });
PestDiseaseReferenceSchema.index({ cropId: 1, category: 1 });

export const PestDiseaseReference =
  mongoose.models.PestDiseaseReference ||
  mongoose.model<IPestDiseaseReference>('PestDiseaseReference', PestDiseaseReferenceSchema);
