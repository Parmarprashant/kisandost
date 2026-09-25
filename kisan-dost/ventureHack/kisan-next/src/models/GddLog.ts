import mongoose, { Document, Schema } from 'mongoose';

export interface IGddLog extends Document {
  cropCycleId: mongoose.Types.ObjectId; // References Crop._id (runtime crop instance)
  fieldId: mongoose.Types.ObjectId;     // References Field._id
  zoneId?: mongoose.Types.ObjectId | null;
  parameterSetId?: string | null;
  logDate: Date;
  tMinC: number;
  tMaxC: number;
  tAvgC: number;
  baseTemperatureC: number | null;
  dailyGDD: number | null;
  cumulativeGDD: number | null;
  progressionMode?: 'DYNAMIC_GDD' | 'HYBRID_DAS' | 'DAS_ONLY';
  calculationMethod?: string;
  weatherSource: 'OpenMeteo' | 'WeatherAPI' | 'WeatherObservation' | 'SimulatedObservation';
  createdAt: Date;
  updatedAt: Date;
}

const GddLogSchema: Schema = new Schema(
  {
    cropCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmZone',
      default: null,
      index: true,
    },
    parameterSetId: {
      type: String,
      default: null,
      index: true,
    },
    logDate: {
      type: Date,
      required: true,
      index: true,
    },
    tMinC: {
      type: Number,
      required: true,
    },
    tMaxC: {
      type: Number,
      required: true,
    },
    tAvgC: {
      type: Number,
      required: true,
    },
    baseTemperatureC: {
      type: Number,
      default: null,
    },
    dailyGDD: {
      type: Number,
      default: null,
    },
    cumulativeGDD: {
      type: Number,
      default: null,
    },
    progressionMode: {
      type: String,
      enum: ['DYNAMIC_GDD', 'HYBRID_DAS', 'DAS_ONLY'],
      default: 'DAS_ONLY',
    },
    calculationMethod: {
      type: String,
      default: 'Simple Remainder: max(0, ((Tmax + Tmin)/2) - Tb)',
    },
    weatherSource: {
      type: String,
      enum: ['OpenMeteo', 'WeatherAPI', 'WeatherObservation', 'SimulatedObservation'],
      default: 'OpenMeteo',
    },
  },
  {
    timestamps: true,
    collection: 'gdd_logs',
  }
);

// Unique compound index: prevents duplicate calculations or double-accumulation for the same date
GddLogSchema.index({ cropCycleId: 1, logDate: 1 }, { unique: true });
GddLogSchema.index({ cropCycleId: 1, logDate: -1 });

export const GddLog =
  mongoose.models.GddLog || mongoose.model<IGddLog>('GddLog', GddLogSchema);
