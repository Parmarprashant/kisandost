import mongoose, { Document, Schema } from 'mongoose';

export interface IFieldLocation {
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface ISoilInfo {
  type?: string; // Black Soil, Loamy Soil, Sandy Soil, Clay Soil, Alluvial Soil, Other, Don't Know
  soilTestAvailable?: boolean;
  pH?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organicCarbon?: number;
}

export interface IIrrigationInfo {
  method?: string; // Drip, Sprinkler, Flood, Rainfed, Other
  waterSource?: string; // Borewell, Canal, River, Farm Pond, Rainwater, Other, Don't Know
  frequency?: string; // Daily, Every 2–3 days, Weekly, As required, Rain-dependent, Other
}

export interface IField extends Document {
  farmerId: string;
  name: string;
  area: number;
  areaUnit: 'Acre' | 'Hectare';
  location: IFieldLocation;
  soil: ISoilInfo;
  irrigation: IIrrigationInfo;
  previousCrop?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema(
  {
    village: { type: String, default: '' },
    taluka: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const SoilSchema = new Schema(
  {
    type: { type: String, default: "Don't Know" },
    soilTestAvailable: { type: Boolean, default: false },
    pH: { type: Number, default: null },
    nitrogen: { type: Number, default: null },
    phosphorus: { type: Number, default: null },
    potassium: { type: Number, default: null },
    organicCarbon: { type: Number, default: null },
  },
  { _id: false }
);

const IrrigationSchema = new Schema(
  {
    method: { type: String, default: 'Rainfed' },
    waterSource: { type: String, default: "Don't Know" },
    frequency: { type: String, default: 'As required' },
  },
  { _id: false }
);

const FieldSchema: Schema = new Schema(
  {
    farmerId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: Number,
      required: true,
      min: 0.01,
    },
    areaUnit: {
      type: String,
      enum: ['Acre', 'Hectare'],
      default: 'Acre',
      required: true,
    },
    location: {
      type: LocationSchema,
      default: () => ({}),
    },
    soil: {
      type: SoilSchema,
      default: () => ({}),
    },
    irrigation: {
      type: IrrigationSchema,
      default: () => ({}),
    },
    previousCrop: {
      type: String,
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing compiled model if present to avoid schema caching bugs
if (mongoose.models.Field) {
  delete mongoose.models.Field;
}

export const Field = mongoose.model<IField>('Field', FieldSchema);
