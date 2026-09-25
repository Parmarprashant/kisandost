import mongoose, { Document, Schema } from 'mongoose';

export type AgriSourceType =
  | 'OFFICIAL_IPM_PACKAGE'
  | 'REGULATORY_MUP'
  | 'REGULATORY_STATUTE'
  | 'HISTORICAL_TREATISE'
  | 'EXTENSION_MANUAL';

export interface IAgriSourceRegistry extends Document {
  sourceCode: string; // e.g. "SRC-DPPQS-WHEAT-2014", "SRC-CIBRC-INSECTICIDE-2026"
  organization: string; // "DPPQS", "NIPHM", "CIB&RC", "NCIPM", "GIZ / MANAGE"
  documentTitle: string; // "AESA Based IPM Package - Wheat"
  sourceType: AgriSourceType;
  publicationDate?: string | null;
  versionCutoff?: string | null; // e.g. "31.03.2026"
  filename: string; // "Wheat.pdf"
  filePath: string;
  fileSizeBytes: number;
  pageCount?: number | null; // null for TXT
  url?: string | null;
  isActive: boolean;
  isRegulatoryAuthority: boolean; // true for CIB&RC
  supersededAt?: Date | null;
  documentHash?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AgriSourceRegistrySchema = new Schema(
  {
    sourceCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    documentTitle: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: [
        'OFFICIAL_IPM_PACKAGE',
        'REGULATORY_MUP',
        'REGULATORY_STATUTE',
        'HISTORICAL_TREATISE',
        'EXTENSION_MANUAL',
      ],
      required: true,
      index: true,
    },
    publicationDate: {
      type: String,
      default: null,
    },
    versionCutoff: {
      type: String,
      default: null,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isRegulatoryAuthority: {
      type: Boolean,
      default: false,
    },
    supersededAt: {
      type: Date,
      default: null,
    },
    documentHash: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'agri_source_registries',
  }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models.AgriSourceRegistry) {
  delete mongoose.models.AgriSourceRegistry;
}

export const AgriSourceRegistry =
  mongoose.models.AgriSourceRegistry ||
  mongoose.model<IAgriSourceRegistry>('AgriSourceRegistry', AgriSourceRegistrySchema);
