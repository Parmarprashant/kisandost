import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherObservation extends Document {
  // Raw coordinates from provider/field
  latitude: number;
  longitude: number;

  // Deterministic rounded coordinates (4 decimal places ≈ 11m grid precision)
  // Used for the unique deduplication index — prevents floating-point drift.
  latitudeRounded: number;
  longitudeRounded: number;

  // Optional field association — backward compatible with cropCycleEngine.ts queries
  fieldId?: mongoose.Types.ObjectId | null;
  zoneId?: mongoose.Types.ObjectId | null;

  // Local calendar date stored as UTC midnight
  // e.g. "2026-06-15" → 2026-06-15T00:00:00.000Z (no timezone drift)
  observationDate: Date;

  // Temperature — ALL nullable; NEVER default to 0 or fabricate
  tempC?: number | null;         // Mean temperature (optional)
  tempMinC?: number | null;      // Daily minimum — required for GDD accumulation
  tempMaxC?: number | null;      // Daily maximum — required for GDD accumulation

  // Precipitation — nullable; 0 means explicitly-zero rainfall, null means unknown
  precipitationMm?: number | null;

  // Supplementary — all nullable; only populated when provider supplies them
  relativeHumidityPct?: number | null;  // 0–100 %
  windSpeedKph?: number | null;
  cloudCoverPct?: number | null;        // 0–100 %
  solarRadiationWm2?: number | null;    // Shortwave radiation W/m²
  conditionText?: string | null;        // Human-readable condition ("Sunny", "Rain", etc.)

  // Provenance
  isForecast: boolean;                  // false = historical observed, true = forecast
  dataSource: 'WeatherAPI' | 'OpenMeteo';
  sourceObservationId?: string | null;  // Provider-side reference/ID if available
  fetchedAt: Date;                      // Timestamp when this record was fetched from provider

  // Timestamps (Mongoose automatic)
  createdAt: Date;
  updatedAt: Date;
}

const WeatherObservationSchema: Schema = new Schema(
  {
    // Raw provider coordinates
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    // Deterministic rounded coordinates for unique deduplication index
    latitudeRounded: {
      type: Number,
      required: true,
      index: true,
    },
    longitudeRounded: {
      type: Number,
      required: true,
      index: true,
    },

    // Optional field/zone references (backward-compatible)
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      default: null,
      index: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmZone',
      default: null,
    },

    // Local calendar date stored as UTC midnight
    observationDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Temperature — nullable, NEVER zero-filled
    tempC: {
      type: Number,
      default: null,
    },
    tempMinC: {
      type: Number,
      default: null,
    },
    tempMaxC: {
      type: Number,
      default: null,
    },

    // Precipitation — nullable; 0 is explicit zero, null is unknown
    precipitationMm: {
      type: Number,
      default: null,
      min: 0,
    },

    // Supplementary — all nullable, no zero defaults
    relativeHumidityPct: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    windSpeedKph: {
      type: Number,
      default: null,
      min: 0,
    },
    cloudCoverPct: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    solarRadiationWm2: {
      type: Number,
      default: null,
      min: 0,
    },
    conditionText: {
      type: String,
      default: null,
      trim: true,
    },

    // Provenance
    isForecast: {
      type: Boolean,
      default: false,
      index: true,
    },
    dataSource: {
      type: String,
      enum: ['WeatherAPI', 'OpenMeteo'],
      default: 'OpenMeteo',
      required: true,
    },
    sourceObservationId: {
      type: String,
      default: null,
    },
    fetchedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: 'weather_observations',
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

// 1. Backward-compatible: cropCycleEngine.ts queries by fieldId + date
WeatherObservationSchema.index({ fieldId: 1, observationDate: -1 });

// 2. Geographic time-series for historicalWeatherService bulk queries
WeatherObservationSchema.index({ latitudeRounded: 1, longitudeRounded: 1, observationDate: -1 });

// 3. UNIQUE deduplication index using rounded coordinates.
//    One observation per (grid-cell, calendar-date, data-source).
//    Multiple fields near the same location share the same environmental record.
WeatherObservationSchema.index(
  { latitudeRounded: 1, longitudeRounded: 1, observationDate: 1, dataSource: 1 },
  { unique: true, name: 'unique_obs_per_grid_date_source' }
);

// ─── Model Export ──────────────────────────────────────────────────────────────

// Delete cached model in development to avoid schema-caching bugs on hot reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.WeatherObservation) {
  delete mongoose.models.WeatherObservation;
}

export const WeatherObservation =
  mongoose.models.WeatherObservation ||
  mongoose.model<IWeatherObservation>('WeatherObservation', WeatherObservationSchema);
