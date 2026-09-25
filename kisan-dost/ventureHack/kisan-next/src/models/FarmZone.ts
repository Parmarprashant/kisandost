import mongoose, { Document, Schema } from 'mongoose';
import { IGeoPolygon } from './Field';

export interface IFarmZone extends Document {
  farmerId: string;
  fieldId: mongoose.Types.ObjectId;
  zoneName: string;
  zoneCode: string;
  polygon?: IGeoPolygon;
  area?: number;
  areaUnit?: 'Acre' | 'Hectare';
  soilVariance?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ZonePolygonSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon',
    },
    coordinates: {
      type: [[[Number]]],
      default: undefined,
    },
  },
  { _id: false }
);

const FarmZoneSchema: Schema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    zoneName: {
      type: String,
      required: true,
      trim: true,
    },
    zoneCode: {
      type: String,
      required: true,
      trim: true,
    },
    polygon: {
      type: ZonePolygonSchema,
      default: undefined,
    },
    area: {
      type: Number,
      min: 0.01,
      default: null,
    },
    areaUnit: {
      type: String,
      enum: ['Acre', 'Hectare'],
      default: 'Acre',
    },
    soilVariance: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'farm_zones',
  }
);

FarmZoneSchema.index({ fieldId: 1, zoneCode: 1 });

export const FarmZone =
  mongoose.models.FarmZone || mongoose.model<IFarmZone>('FarmZone', FarmZoneSchema);
