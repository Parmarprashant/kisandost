/**
 * Open-Meteo Historical Archive Provider Adapter
 *
 * Uses: https://archive-api.open-meteo.com/v1/archive
 * - Free, no API key required
 * - Provides daily observations from 1940 to approximately current date - 5 days
 * - Supports Gujarat/Maharashtra coordinates
 * - Same provider family as existing /api/weather route (no new dependency)
 *
 * Timezone handling:
 * Open-Meteo returns daily data with a "time" array of "YYYY-MM-DD" local calendar dates
 * when timezone=auto is set. These are the actual local calendar dates at the requested
 * location — NOT UTC-shifted. We store them as UTC midnight (YYYY-MM-DDT00:00:00.000Z)
 * to maintain calendar date integrity.
 */

import {
  IWeatherProvider,
  NormalizedDailyWeather,
  validateCoordinates,
  validateTemperature,
  validateRainfall,
} from '@/lib/weather/weatherProvider';

const ARCHIVE_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Raw shape of the Open-Meteo Archive API daily response.
 */
interface OpenMeteoArchiveResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  daily_units?: Record<string, string>;
  daily: {
    time: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_mean?: (number | null)[];
    precipitation_sum?: (number | null)[];
    relative_humidity_2m_mean?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
    shortwave_radiation_sum?: (number | null)[];
  };
}

/**
 * Open-Meteo Historical Archive Provider
 * Implements IWeatherProvider.
 */
export class OpenMeteoHistoricalProvider implements IWeatherProvider {
  private readonly timeoutMs: number;

  constructor(options: { timeoutMs?: number } = {}) {
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  /**
   * Fetches daily historical weather from Open-Meteo Archive API.
   * Returns normalized observations — missing days are absent (NOT zero-filled).
   */
  async fetchHistoricalDaily(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): Promise<NormalizedDailyWeather[]> {
    // Validate inputs
    const coordCheck = validateCoordinates(latitude, longitude);
    if (!coordCheck.valid) {
      throw new Error(`[OpenMeteoHistoricalProvider] Invalid coordinates: ${coordCheck.error}`);
    }

    const url = new URL(ARCHIVE_BASE_URL);
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);
    url.searchParams.set(
      'daily',
      [
        'temperature_2m_max',
        'temperature_2m_min',
        'temperature_2m_mean',
        'precipitation_sum',
        'relative_humidity_2m_mean',
        'wind_speed_10m_max',
        'shortwave_radiation_sum',
      ].join(',')
    );
    url.searchParams.set('timezone', 'Asia/Kolkata'); // IST — ensures local calendar dates for India
    url.searchParams.set('wind_speed_unit', 'kmh');
    url.searchParams.set('precipitation_unit', 'mm');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url.toString(), { signal: controller.signal });
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err?.name === 'AbortError' || (err?.message || '').includes('aborted')) {
        throw new Error(
          `[OpenMeteoHistoricalProvider] Request timed out after ${this.timeoutMs}ms for ${startDate} → ${endDate}`
        );
      }
      throw new Error(
        `[OpenMeteoHistoricalProvider] Network error: ${err?.message || String(err)}`
      );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        if (errBody?.reason) errorDetail += `: ${errBody.reason}`;
      } catch {
        // ignore parse error
      }
      throw new Error(`[OpenMeteoHistoricalProvider] Provider returned ${errorDetail}`);
    }

    let raw: OpenMeteoArchiveResponse;
    try {
      raw = await response.json();
    } catch {
      throw new Error('[OpenMeteoHistoricalProvider] Malformed JSON response from provider');
    }

    if (!raw?.daily?.time || !Array.isArray(raw.daily.time)) {
      throw new Error(
        '[OpenMeteoHistoricalProvider] Provider response missing expected daily.time array'
      );
    }

    const providerLat = Number(raw.latitude);
    const providerLon = Number(raw.longitude);

    return this._normalizeDailyResponse(raw, providerLat, providerLon);
  }

  /**
   * Normalizes the raw Open-Meteo daily arrays into NormalizedDailyWeather records.
   * Invalid individual observations are logged and skipped — not silently zeroed.
   */
  private _normalizeDailyResponse(
    raw: OpenMeteoArchiveResponse,
    providerLat: number,
    providerLon: number
  ): NormalizedDailyWeather[] {
    const results: NormalizedDailyWeather[] = [];
    const daily = raw.daily;

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        console.warn(`[OpenMeteoHistoricalProvider] Skipping invalid date at index ${i}: "${dateStr}"`);
        continue;
      }

      const tMin = this._safeNull(daily.temperature_2m_min?.[i]);
      const tMax = this._safeNull(daily.temperature_2m_max?.[i]);
      const tMean = this._safeNull(daily.temperature_2m_mean?.[i]);
      const rainfall = this._safeNull(daily.precipitation_sum?.[i]);
      const humidity = this._safeNull(daily.relative_humidity_2m_mean?.[i]);
      const windSpeed = this._safeNull(daily.wind_speed_10m_max?.[i]);
      const solar = this._safeNull(daily.shortwave_radiation_sum?.[i]);

      // Validate temperature
      const tempCheck = validateTemperature(tMin, tMax);
      if (!tempCheck.valid) {
        console.warn(
          `[OpenMeteoHistoricalProvider] Skipping ${dateStr} — invalid temperature: ${tempCheck.error}`
        );
        continue;
      }
      if (tempCheck.warning) {
        console.warn(`[OpenMeteoHistoricalProvider] ${dateStr}: ${tempCheck.warning}`);
      }

      // Validate rainfall
      const rainCheck = validateRainfall(rainfall);
      if (!rainCheck.valid) {
        console.warn(
          `[OpenMeteoHistoricalProvider] ${dateStr} — invalid rainfall (${rainfall}): ${rainCheck.error}. Setting to null.`
        );
        // Reject the bad value; don't fabricate
      }

      results.push({
        date: dateStr,
        latitude: providerLat,
        longitude: providerLon,
        minTemperatureC: tMin,
        maxTemperatureC: tMax,
        meanTemperatureC: tMean,
        rainfallMm: rainCheck.valid ? rainfall : null,
        relativeHumidityPct: this._clampOrNull(humidity, 0, 100),
        windSpeedKph: windSpeed !== null && windSpeed < 0 ? null : windSpeed,
        solarRadiationWm2: solar !== null && solar < 0 ? null : solar,
        source: 'open-meteo',
        sourceObservationId: `open-meteo::${dateStr}::${providerLat}::${providerLon}`,
      });
    }

    return results;
  }

  /**
   * Returns null for undefined, null, or non-finite values.
   * NEVER substitutes zero for a missing observation.
   */
  private _safeNull(value: number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    if (!Number.isFinite(value)) return null;
    return value;
  }

  /**
   * Returns null if value is null or out of bounds; otherwise returns value.
   */
  private _clampOrNull(
    value: number | null,
    min: number,
    max: number
  ): number | null {
    if (value === null) return null;
    if (value < min || value > max) {
      console.warn(
        `[OpenMeteoHistoricalProvider] Value ${value} out of expected range [${min}, ${max}] — setting to null`
      );
      return null;
    }
    return value;
  }
}
