/**
 * Historical Weather Service — Phase 5 Weather Module Extension
 *
 * Cache-first historical daily weather retrieval:
 *   1. Validate request parameters
 *   2. Check DB for already-stored observations in range
 *   3. Identify missing dates
 *   4. Fetch ONLY missing dates from provider
 *   5. Validate each observation
 *   6. Upsert via deterministic rounded-coordinate key
 *   7. Return sorted observations + coverage metadata
 *
 * Missing values remain null — never interpolated, averaged, or fabricated.
 * Date timezone: Asia/Kolkata calendar dates are persisted as UTC midnight.
 */

import connectDB from '@/lib/mongodb';
import { WeatherObservation } from '@/models/WeatherObservation';
import {
  IWeatherProvider,
  NormalizedDailyWeather,
  HistoricalWeatherResult,
  WeatherCoverageReport,
  validateCoordinates,
  validateDateString,
  validateTemperature,
  validateRainfall,
  generateDateRange,
  computeCoverage,
  roundCoordinate,
} from '@/lib/weather/weatherProvider';
import { OpenMeteoHistoricalProvider } from '@/lib/weather/providers/openMeteoHistorical';
import mongoose from 'mongoose';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface HistoricalWeatherRequest {
  latitude: number;
  longitude: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  fieldId?: string | null;
  zoneId?: string | null;
}

export interface HistoricalWeatherServiceResult extends HistoricalWeatherResult {
  fetchedFromProvider: number;
  loadedFromCache: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const MAX_RANGE_DAYS = 365;

// Default provider — Open-Meteo Archive (free, no key, matches existing stack)
let _defaultProvider: IWeatherProvider | null = null;

function getDefaultProvider(): IWeatherProvider {
  if (!_defaultProvider) {
    _defaultProvider = new OpenMeteoHistoricalProvider({ timeoutMs: 20000 });
  }
  return _defaultProvider;
}

// ─── Validation ─────────────────────────────────────────────────────────────────

export interface RequestValidationResult {
  valid: boolean;
  error?: string;
  startDateObj?: Date;
  endDateObj?: Date;
  requestedDays?: number;
}

export function validateHistoricalRequest(req: HistoricalWeatherRequest): RequestValidationResult {
  const coordCheck = validateCoordinates(req.latitude, req.longitude);
  if (!coordCheck.valid) {
    return { valid: false, error: coordCheck.error };
  }

  const startCheck = validateDateString(req.startDate);
  if (!startCheck.valid) {
    return { valid: false, error: `startDate: ${startCheck.error}` };
  }

  const endCheck = validateDateString(req.endDate);
  if (!endCheck.valid) {
    return { valid: false, error: `endDate: ${endCheck.error}` };
  }

  const startDateObj = new Date(req.startDate + 'T00:00:00Z');
  const endDateObj = new Date(req.endDate + 'T00:00:00Z');

  if (endDateObj < startDateObj) {
    return { valid: false, error: 'endDate must be >= startDate' };
  }

  const diffMs = endDateObj.getTime() - startDateObj.getTime();
  const requestedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (requestedDays > MAX_RANGE_DAYS) {
    return {
      valid: false,
      error: `Requested range (${requestedDays} days) exceeds maximum of ${MAX_RANGE_DAYS} days`,
    };
  }

  return { valid: true, startDateObj, endDateObj, requestedDays };
}

// ─── DB Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts a "YYYY-MM-DD" calendar date string to UTC midnight Date.
 * This ensures calendar-date integrity regardless of server timezone.
 */
export function calendarDateToUtcMidnight(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z');
}

/**
 * Converts a UTC midnight Date back to "YYYY-MM-DD" local calendar string.
 * Uses UTC methods to avoid timezone drift.
 */
export function utcMidnightToCalendarDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Loads existing observations from DB for the given rounded coordinates and date range.
 */
async function loadFromDb(
  latRounded: number,
  lonRounded: number,
  startDate: string,
  endDate: string
): Promise<NormalizedDailyWeather[]> {
  const startUtc = calendarDateToUtcMidnight(startDate);
  const endUtc = calendarDateToUtcMidnight(endDate);

  const docs = await WeatherObservation.find({
    latitudeRounded: latRounded,
    longitudeRounded: lonRounded,
    observationDate: { $gte: startUtc, $lte: endUtc },
    isForecast: false,
    dataSource: 'OpenMeteo',
  })
    .sort({ observationDate: 1 })
    .lean();

  return docs.map((doc) => ({
    date: utcMidnightToCalendarDate(new Date(doc.observationDate)),
    latitude: doc.latitude,
    longitude: doc.longitude,
    minTemperatureC: doc.tempMinC ?? null,
    maxTemperatureC: doc.tempMaxC ?? null,
    meanTemperatureC: doc.tempC ?? null,
    rainfallMm: doc.precipitationMm ?? null,
    relativeHumidityPct: doc.relativeHumidityPct ?? null,
    windSpeedKph: doc.windSpeedKph ?? null,
    solarRadiationWm2: doc.solarRadiationWm2 ?? null,
    source: 'open-meteo' as const,
    sourceObservationId: doc.sourceObservationId ?? undefined,
  }));
}

/**
 * Identifies which dates from allDates are NOT in existingDates set.
 */
function findMissingDates(allDates: string[], existingDates: Set<string>): string[] {
  return allDates.filter((d) => !existingDates.has(d));
}

/**
 * Groups consecutive dates into contiguous ranges for efficient batched provider fetches.
 * e.g. ["2026-06-01","2026-06-02","2026-06-05"] → [["2026-06-01","2026-06-02"],["2026-06-05","2026-06-05"]]
 */
function groupIntoRanges(dates: string[]): Array<{ startDate: string; endDate: string }> {
  if (dates.length === 0) return [];

  const ranges: Array<{ startDate: string; endDate: string }> = [];
  let rangeStart = dates[0];
  let prev = dates[0];

  for (let i = 1; i < dates.length; i++) {
    const current = dates[i];
    const prevMs = new Date(prev + 'T00:00:00Z').getTime();
    const currMs = new Date(current + 'T00:00:00Z').getTime();

    if (currMs - prevMs > 86400000) {
      // Gap detected — close previous range
      ranges.push({ startDate: rangeStart, endDate: prev });
      rangeStart = current;
    }

    prev = current;
  }
  ranges.push({ startDate: rangeStart, endDate: prev });
  return ranges;
}

/**
 * Validates and persists a single NormalizedDailyWeather observation to the DB.
 * Uses upsert on the deterministic rounded-coordinate key.
 * Returns true if persisted, false if validation failed.
 */
async function persistObservation(
  obs: NormalizedDailyWeather,
  fieldId: string | null,
  zoneId: string | null,
  fetchedAt: Date
): Promise<boolean> {
  // Validate temperature
  const tempCheck = validateTemperature(obs.minTemperatureC, obs.maxTemperatureC);
  if (!tempCheck.valid) {
    console.warn(
      `[historicalWeatherService] Skipping ${obs.date} — temperature validation failed: ${tempCheck.error}`
    );
    return false;
  }
  if (tempCheck.warning) {
    console.warn(`[historicalWeatherService] ${obs.date}: ${tempCheck.warning}`);
  }

  // Validate rainfall
  const rainCheck = validateRainfall(obs.rainfallMm);
  if (!rainCheck.valid) {
    console.warn(
      `[historicalWeatherService] ${obs.date} — rainfall validation failed: ${rainCheck.error}. Setting to null.`
    );
  }

  const latRounded = roundCoordinate(obs.latitude);
  const lonRounded = roundCoordinate(obs.longitude);
  const observationDate = calendarDateToUtcMidnight(obs.date);

  const upsertData = {
    latitude: obs.latitude,
    longitude: obs.longitude,
    latitudeRounded: latRounded,
    longitudeRounded: lonRounded,
    fieldId: fieldId ? new mongoose.Types.ObjectId(fieldId) : null,
    zoneId: zoneId ? new mongoose.Types.ObjectId(zoneId) : null,
    observationDate,
    // Temperature
    tempC: obs.meanTemperatureC ?? null,
    tempMinC: obs.minTemperatureC ?? null,
    tempMaxC: obs.maxTemperatureC ?? null,
    // Precipitation (null if validation failed)
    precipitationMm: rainCheck.valid ? (obs.rainfallMm ?? null) : null,
    // Supplementary — preserve nulls, never zero-fill
    relativeHumidityPct: obs.relativeHumidityPct ?? null,
    windSpeedKph: obs.windSpeedKph ?? null,
    cloudCoverPct: null, // Open-Meteo archive does not provide cloud cover in daily summary
    solarRadiationWm2: obs.solarRadiationWm2 ?? null,
    conditionText: null,
    // Provenance
    isForecast: false,
    dataSource: 'OpenMeteo' as const,
    sourceObservationId: obs.sourceObservationId ?? null,
    fetchedAt,
  };

  await WeatherObservation.findOneAndUpdate(
    {
      latitudeRounded: latRounded,
      longitudeRounded: lonRounded,
      observationDate,
      dataSource: 'OpenMeteo',
    },
    { $set: upsertData },
    { upsert: true, new: true }
  );

  return true;
}

// ─── Main Service Function ─────────────────────────────────────────────────────

/**
 * Fetches historical daily weather for a location and date range.
 *
 * Cache-first: already-stored observations are returned from DB.
 * Only missing dates are fetched from the provider.
 * Missing values remain null — never interpolated or fabricated.
 *
 * @param req - Location + date range request
 * @param provider - Optional provider override (injectable for testing)
 */
export async function getHistoricalWeather(
  req: HistoricalWeatherRequest,
  provider?: IWeatherProvider
): Promise<HistoricalWeatherServiceResult> {
  // 1. Validate request
  const validation = validateHistoricalRequest(req);
  if (!validation.valid) {
    throw new Error(`[historicalWeatherService] Invalid request: ${validation.error}`);
  }

  await connectDB();

  const latRounded = roundCoordinate(req.latitude);
  const lonRounded = roundCoordinate(req.longitude);
  const allRequestedDates = generateDateRange(req.startDate, req.endDate);

  // 2. Load existing observations from DB
  const existingObs = await loadFromDb(latRounded, lonRounded, req.startDate, req.endDate);
  const existingDatesSet = new Set(existingObs.map((o) => o.date));
  let loadedFromCache = existingObs.length;

  // 3. Identify missing dates
  const missingDates = findMissingDates(allRequestedDates, existingDatesSet);
  let fetchedFromProvider = 0;

  if (missingDates.length > 0) {
    // 4. Group missing dates into contiguous ranges for batch fetching
    const ranges = groupIntoRanges(missingDates);
    const resolvedProvider = provider ?? getDefaultProvider();
    const fetchedAt = new Date();

    for (const range of ranges) {
      let providerObs: NormalizedDailyWeather[];
      try {
        providerObs = await resolvedProvider.fetchHistoricalDaily(
          req.latitude,
          req.longitude,
          range.startDate,
          range.endDate
        );
      } catch (err: any) {
        console.error(
          `[historicalWeatherService] Provider fetch failed for ${range.startDate}→${range.endDate}: ${err?.message}`
        );
        // Do NOT throw — partial results are acceptable; continue with other ranges
        continue;
      }

      // 5. Validate and persist each observation
      for (const obs of providerObs) {
        const persisted = await persistObservation(
          obs,
          req.fieldId ?? null,
          req.zoneId ?? null,
          fetchedAt
        );
        if (persisted) {
          fetchedFromProvider++;
        }
      }
    }

    // 6. Reload from DB to get all observations (including newly persisted)
    const reloaded = await loadFromDb(latRounded, lonRounded, req.startDate, req.endDate);
    loadedFromCache = reloaded.length - fetchedFromProvider;

    // Compute final coverage
    const finalDates = reloaded.map((o) => o.date);
    const coverage = computeCoverage(req.startDate, req.endDate, finalDates);

    return {
      observations: reloaded,
      coverage,
      fetchedFromProvider,
      loadedFromCache: Math.max(0, loadedFromCache),
    };
  }

  // All dates were in cache — return directly
  const finalDates = existingObs.map((o) => o.date);
  const coverage = computeCoverage(req.startDate, req.endDate, finalDates);

  return {
    observations: existingObs,
    coverage,
    fetchedFromProvider: 0,
    loadedFromCache,
  };
}

/**
 * Retrieves historical weather for a specific crop's field.
 * Loads field coordinates from DB and delegates to getHistoricalWeather.
 */
export async function getWeatherForCrop(
  cropId: string,
  farmerId: string,
  startDate: string,
  endDate: string,
  provider?: IWeatherProvider
): Promise<HistoricalWeatherServiceResult> {
  await connectDB();

  // Import inline to avoid circular deps
  const { Crop } = await import('@/models/Crop');
  const { Field } = await import('@/models/Field');

  const crop = await Crop.findOne({ _id: cropId, farmerId }).lean();
  if (!crop) {
    throw new Error(`Crop not found or access denied (cropId=${cropId})`);
  }

  const field = await Field.findById(crop.fieldId).lean();
  if (!field) {
    throw new Error(`Associated field not found for crop ${cropId}`);
  }

  const lat = field.location?.latitude;
  const lon = field.location?.longitude;

  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error(
      `Field ${field._id} does not have valid GPS coordinates. Please update field location first.`
    );
  }

  return getHistoricalWeather(
    {
      latitude: lat,
      longitude: lon,
      startDate,
      endDate,
      fieldId: crop.fieldId.toString(),
    },
    provider
  );
}
