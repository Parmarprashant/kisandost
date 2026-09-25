import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherConditionReference extends Document {
  triggerId: string;           // Unique slug, e.g. "rice_high_humidity_blast"
  cropId: string;              // Foreign key to IcarCrop.cropId, e.g. "rice"
  cropName: string;            // e.g. "Rice"
  conditionType:
    | 'HIGH_HUMIDITY'
    | 'HEAT_STRESS'
    | 'INTERMITTENT_RAIN'
    | 'DROUGHT'
    | 'SUBMERGENCE'
    | 'COOL_NIGHTS'
    | 'CLOUDY_OVERCAST'
    | 'OTHER';
  conditionDescription: string; // Qualitative environmental trigger description from ICAR
  triggerCategory: 'DISEASE_OUTBREAK' | 'PEST_RESURGENCE' | 'PHYSIOLOGICAL_DISORDER' | 'OTHER';
  associatedPestDisease?: string | null; // e.g. "Rice Blast (Magnaporthe oryzae)"
  susceptibleStageName?: string | null;  // e.g. "Panicle Initiation & Flowering"
  numericThresholdNote: string | null;   // Nullable - strictly null unless verbatim in ICAR source
  sourceReport: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WeatherConditionReferenceSchema: Schema = new Schema(
  {
    triggerId: {
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
    conditionType: {
      type: String,
      enum: [
        'HIGH_HUMIDITY',
        'HEAT_STRESS',
        'INTERMITTENT_RAIN',
        'DROUGHT',
        'SUBMERGENCE',
        'COOL_NIGHTS',
        'CLOUDY_OVERCAST',
        'OTHER',
      ],
      default: 'OTHER',
      required: true,
    },
    conditionDescription: {
      type: String,
      required: true,
      trim: true,
    },
    triggerCategory: {
      type: String,
      enum: ['DISEASE_OUTBREAK', 'PEST_RESURGENCE', 'PHYSIOLOGICAL_DISORDER', 'OTHER'],
      default: 'OTHER',
      required: true,
    },
    associatedPestDisease: {
      type: String,
      default: null,
      trim: true,
    },
    susceptibleStageName: {
      type: String,
      default: null,
      trim: true,
    },
    numericThresholdNote: {
      type: String,
      default: null, // Strictly null - do not invent numeric cutoffs like RH > 85%
    },
    sourceReport: {
      type: String,
      required: true,
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
    collection: 'weather_condition_references',
  }
);

WeatherConditionReferenceSchema.index({ cropId: 1, conditionType: 1 });
WeatherConditionReferenceSchema.index({ cropId: 1, triggerCategory: 1 });

export const WeatherConditionReference =
  mongoose.models.WeatherConditionReference ||
  mongoose.model<IWeatherConditionReference>(
    'WeatherConditionReference',
    WeatherConditionReferenceSchema
  );
