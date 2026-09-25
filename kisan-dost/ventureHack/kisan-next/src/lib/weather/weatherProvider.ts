/**
 * Weather provider interface for Phase 5 Weather Module Extension.
 * Defines the contract all weather data providers must implement.
 * Enables future provider swapping without modifying application logic.
 */

export interface NormalizedDailyWeather {
  /** Local calendar date string in "YYYY-MM-DD" format (NOT UTC-shifted) */
  date: string;
  /** Provider's returned latitude (may differ slightly from requested due to grid snapping) */
  latitude: number;
  /** Provider's returned longitude */
  longitude: number;

  /** Daily minimum temperature in °C — null if unavailable */
  minTemperatureC: number | null;
  /** Daily maximum temperature in °C — null if unavailable */
  maxTemperatureC: number | null;
  /** Daily mean temperature in °C — null if unavailable */
  meanTemperatureC: number | null;

  /** Total daily precipitation in mm — null if unavailable. 0 = explicitly zero rainfall. */
  rainfallMm: number | null;

  /** Mean relative humidity (%) — null if unavailable */
  relativeHumidityPct: number | null;
  /** Max or mean wind speed (km/h) — null if unavailable */
  windSpeedKph: number | null;
  /** Daily shortwave radiation sum (W/m²) — null if unavailable */
  solarRadiationWm2: number | null;

  /** Data source identifier */
  source: 'open-meteo' | 'weatherapi';
  /** Provider-side observation/reference ID if available */
  sourceObservationId?: string;
}

export interface WeatherCoverageReport {
  startDate: string;
  endDate: string;
  requestedDays: number;
  availableDays: number;
  missingDates: string[];
  coveragePercent: number;
}

export interface HistoricalWeatherResult {
  observations: NormalizedDailyWeather[];
  coverage: WeatherCoverageReport;
}

/**
 * Provider interface — any weather data adapter must implement this.
 */
export interface IWeatherProvider {
  /**
   * Fetch historical daily weather observations.
   * @param latitude - Decimal degrees (-90 to 90)
   * @param longitude - Decimal degrees (-180 to 180)
   * @param startDate - Inclusive start date "YYYY-MM-DD" (local calendar date)
   * @param endDate - Inclusive end date "YYYY-MM-DD" (local calendar date)
   * @returns Array of normalized daily observations; missing days are absent (NOT zero-filled)
   */
  fetchHistoricalDaily(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): Promise<NormalizedDailyWeather[]>;
}

/**
 * Validates that a coordinate pair is within legal bounds.
 */
export function validateCoordinates(
  latitude: number,
  longitude: number
): { valid: boolean; error?: string } {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { valid: false, error: 'Coordinates must be finite numbers' };
  }
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: `Latitude ${latitude} is out of range (-90 to 90)` };
  }
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: `Longitude ${longitude} is out of range (-180 to 180)` };
  }
  return { valid: true };
}

/**
 * Validates a temperature observation pair.
 * Returns errors for infinite/NaN values.
 * Returns a warning (not error) if Tmax < Tmin — some providers return them inverted;
 * the GDD calculator already handles this defensively.
 */
export function validateTemperature(
  tMin: number | null,
  tMax: number | null
): { valid: boolean; error?: string; warning?: string } {
  if (tMin !== null && !Number.isFinite(tMin)) {
    return { valid: false, error: `Tmin ${tMin} is not a finite number` };
  }
  if (tMax !== null && !Number.isFinite(tMax)) {
    return { valid: false, error: `Tmax ${tMax} is not a finite number` };
  }
  if (tMin !== null && tMax !== null && tMax < tMin) {
    return { valid: true, warning: `Tmax (${tMax}) < Tmin (${tMin}) — may be inverted by provider` };
  }
  return { valid: true };
}

/**
 * Validates a rainfall value.
 */
export function validateRainfall(rainfallMm: number | null): { valid: boolean; error?: string } {
  if (rainfallMm === null) return { valid: true };
  if (!Number.isFinite(rainfallMm)) {
    return { valid: false, error: `Rainfall ${rainfallMm} is not a finite number` };
  }
  if (rainfallMm < 0) {
    return { valid: false, error: `Rainfall cannot be negative (got ${rainfallMm})` };
  }
  return { valid: true };
}

/**
 * Validates a "YYYY-MM-DD" date string.
 */
export function validateDateString(dateStr: string): { valid: boolean; error?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, error: `Date "${dateStr}" must be in YYYY-MM-DD format` };
  }
  const d = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(d.getTime())) {
    return { valid: false, error: `Date "${dateStr}" is not a valid calendar date` };
  }
  return { valid: true };
}

/**
 * Generates all calendar date strings between startDate and endDate (inclusive).
 * Returns "YYYY-MM-DD" strings.
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');

  if (start > end) return dates;

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Computes coverage metadata for a set of observations over a requested date range.
 */
export function computeCoverage(
  startDate: string,
  endDate: string,
  availableDates: string[]
): WeatherCoverageReport {
  const allDates = generateDateRange(startDate, endDate);
  const availableSet = new Set(availableDates);
  const missingDates = allDates.filter((d) => !availableSet.has(d));
  const coveragePercent =
    allDates.length === 0
      ? 0
      : Math.round(((allDates.length - missingDates.length) / allDates.length) * 10000) / 100;

  return {
    startDate,
    endDate,
    requestedDays: allDates.length,
    availableDays: allDates.length - missingDates.length,
    missingDates,
    coveragePercent,
  };
}

/**
 * Rounds a coordinate to 4 decimal places (~11m precision) for deduplication.
 */
export function roundCoordinate(value: number): number {
  return Math.round(value * 10000) / 10000;
}
