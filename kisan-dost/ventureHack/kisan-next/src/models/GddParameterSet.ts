import mongoose, { Document, Schema } from 'mongoose';

export interface IGddBaseTemperature {
  value: number | null;
  unit: string;
  explicitly_stated: boolean;
  citation: string;
}

export interface IGddMethodology {
  formula: string;
  base_temperature: IGddBaseTemperature;
  upper_threshold: number | null;
  method_description: string;
}

export interface IGddGrowthStage {
  record_id: string;
  stage_name: string;
  standardized_stage: string;
  gdd_value: number;
  unit: string;
  is_cumulative: boolean;
  uncertainty?: Record<string, any>;
}

export interface IGddMaturity {
  value: number;
  unit: string;
  stage_name: string;
  uncertainty?: Record<string, any>;
}

export interface IGddLocation {
  country: string;
  state: string;
  district: string;
  research_station: string;
  agroclimatic_zone: string;
  coordinates_elevation: string;
}

export interface IGddSource {
  source_file: string;
  title: string;
  authors: string;
  publication: string;
  publication_year: string;
  page_number: string;
  table_or_section: string;
}

export interface IGddParameterSet extends Document {
  parameter_set_id: string;
  crop: {
    crop_name: string;
    scientific_name: string;
  };
  variety: string;
  region_relevance: 'GUJARAT' | 'MAHARASHTRA' | 'OTHER_INDIAN';
  location: IGddLocation;
  season: string;
  sowing_window: string;
  experimental_design: string;
  gdd_methodology: IGddMethodology;
  growth_stages: IGddGrowthStage[];
  maturity_gdd: IGddMaturity;
  conditions: {
    water_regime: string;
    management_notes: string;
  };
  source: IGddSource;
  quality_classification: 'SOURCE_COMPLETE' | 'CONFLICTED' | 'PARTIAL';
  engine_readiness: 'READY_FOR_GDD_ENGINE' | 'PARTIAL_GDD_SUPPORT';
  conflict_group_id: string | null;
  flags: string[];
  traceable_record_ids: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GddBaseTemperatureSchema = new Schema(
  {
    value: { type: Number, default: null },
    unit: { type: String, default: '°C' },
    explicitly_stated: { type: Boolean, required: true },
    citation: { type: String, default: '' },
  },
  { _id: false }
);

const GddMethodologySchema = new Schema(
  {
    formula: { type: String, required: true },
    base_temperature: { type: GddBaseTemperatureSchema, required: true },
    upper_threshold: { type: Number, default: null },
    method_description: { type: String, default: '' },
  },
  { _id: false }
);

const GddGrowthStageSchema = new Schema(
  {
    record_id: { type: String, required: true },
    stage_name: { type: String, required: true },
    standardized_stage: { type: String, required: true },
    gdd_value: { type: Number, required: true },
    unit: { type: String, default: '°C day' },
    is_cumulative: { type: Boolean, default: false },
    uncertainty: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const GddMaturitySchema = new Schema(
  {
    value: { type: Number, required: true },
    unit: { type: String, default: '°C day' },
    stage_name: { type: String, default: 'Maturity' },
    uncertainty: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const GddLocationSchema = new Schema(
  {
    country: { type: String, default: 'India' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    research_station: { type: String, default: '' },
    agroclimatic_zone: { type: String, default: '' },
    coordinates_elevation: { type: String, default: '' },
  },
  { _id: false }
);

const GddSourceSchema = new Schema(
  {
    source_file: { type: String, required: true },
    title: { type: String, default: '' },
    authors: { type: String, default: '' },
    publication: { type: String, default: '' },
    publication_year: { type: String, default: '' },
    page_number: { type: String, default: '' },
    table_or_section: { type: String, default: '' },
  },
  { _id: false }
);

const GddParameterSetSchema: Schema = new Schema(
  {
    parameter_set_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    crop: {
      crop_name: { type: String, required: true, trim: true, index: true },
      scientific_name: { type: String, default: '', trim: true },
    },
    variety: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    region_relevance: {
      type: String,
      enum: ['GUJARAT', 'MAHARASHTRA', 'OTHER_INDIAN'],
      required: true,
      index: true,
    },
    location: {
      type: GddLocationSchema,
      required: true,
    },
    season: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    sowing_window: {
      type: String,
      default: '',
    },
    experimental_design: {
      type: String,
      default: '',
    },
    gdd_methodology: {
      type: GddMethodologySchema,
      required: true,
    },
    growth_stages: {
      type: [GddGrowthStageSchema],
      default: [],
    },
    maturity_gdd: {
      type: GddMaturitySchema,
      required: true,
    },
    conditions: {
      water_regime: { type: String, default: '' },
      management_notes: { type: String, default: '' },
    },
    source: {
      type: GddSourceSchema,
      required: true,
    },
    quality_classification: {
      type: String,
      enum: ['SOURCE_COMPLETE', 'CONFLICTED', 'PARTIAL'],
      required: true,
    },
    engine_readiness: {
      type: String,
      enum: ['READY_FOR_GDD_ENGINE', 'PARTIAL_GDD_SUPPORT'],
      required: true,
      index: true,
    },
    conflict_group_id: {
      type: String,
      default: null,
    },
    flags: {
      type: [String],
      default: [],
    },
    traceable_record_ids: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'gdd_parameter_sets',
  }
);

// Compound indexes for rapid contextual lookup
GddParameterSetSchema.index(
  { 'crop.crop_name': 1, variety: 1, region_relevance: 1, season: 1 },
  { name: 'idx_crop_variety_region_season' }
);
GddParameterSetSchema.index(
  { 'crop.crop_name': 1, region_relevance: 1 },
  { name: 'idx_crop_region' }
);

export const GddParameterSet =
  mongoose.models.GddParameterSet ||
  mongoose.model<IGddParameterSet>('GddParameterSet', GddParameterSetSchema);
