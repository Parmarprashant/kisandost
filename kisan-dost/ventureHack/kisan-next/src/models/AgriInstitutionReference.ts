import mongoose, { Document, Schema } from 'mongoose';

export type InstitutionSourceType = 'ICAR_KVK' | 'ICAR_DIRECTORY';

export interface IAgriInstitutionReference extends Document {
  name: string;
  institutionType: string; // 'KVK' | 'ICAR_INSTITUTE' | 'SAU' | 'DU' | 'NGO' | 'OTHER'
  state: string;
  district: string;
  address: string;
  hostOrganization?: string | null;
  hostType?: string | null;
  sanctionYear?: string | null;
  officialPhone?: string | null;
  officialEmail?: string | null;
  officials?: Array<{
    name: string;
    designation?: string;
    phone?: string;
    email?: string;
  }>;
  sourceName: string;
  sourceType: InstitutionSourceType;
  sourceFile: string;
  sourceLocation: string;
  rawTextSnippet?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AgriInstitutionReferenceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    institutionType: {
      type: String,
      required: true,
      default: 'KVK',
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    hostOrganization: {
      type: String,
      default: null,
    },
    hostType: {
      type: String,
      default: null,
    },
    sanctionYear: {
      type: String,
      default: null,
    },
    officialPhone: {
      type: String,
      default: null,
    },
    officialEmail: {
      type: String,
      default: null,
    },
    officials: {
      type: [
        {
          name: { type: String, required: true },
          designation: { type: String, default: null },
          phone: { type: String, default: null },
          email: { type: String, default: null },
        },
      ],
      default: [],
    },
    sourceName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ['ICAR_KVK', 'ICAR_DIRECTORY'],
      required: true,
      index: true,
    },
    sourceFile: {
      type: String,
      required: true,
    },
    sourceLocation: {
      type: String,
      required: true,
    },
    rawTextSnippet: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'agri_institution_references',
  }
);

AgriInstitutionReferenceSchema.index({ state: 1, district: 1 });
AgriInstitutionReferenceSchema.index({ sourceType: 1, sourceFile: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models.AgriInstitutionReference) {
  delete mongoose.models.AgriInstitutionReference;
}

export const AgriInstitutionReference =
  mongoose.models.AgriInstitutionReference ||
  mongoose.model<IAgriInstitutionReference>(
    'AgriInstitutionReference',
    AgriInstitutionReferenceSchema
  );

export default AgriInstitutionReference;
