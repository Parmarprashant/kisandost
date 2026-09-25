import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { GddLog, IGddLog } from '@/models/GddLog';

export interface DailyWeatherInput {
  date: Date | string;
  tMin: number;
  tMax: number;
  weatherSource?: 'OpenMeteo' | 'WeatherAPI' | 'WeatherObservation' | 'SimulatedObservation';
}

export interface DailyGddCalculationResult {
  logDate: Date;
  tMin: number;
  tMax: number;
  tAvg: number;
  baseTemp: number;
  dailyGdd: number;
  cumulativeGdd: number;
  weatherSource: 'OpenMeteo' | 'WeatherAPI' | 'WeatherObservation' | 'SimulatedObservation';
}

/**
 * Calculates daily Growing Degree Days (thermal time):
 * Formula: max(0, ((Tmax + Tmin) / 2) - Tb)
 * If an upper threshold is explicitly provided by the source methodology,
 * effective temperatures are capped at the threshold.
 * 
 * Strict constraints:
 * - Returns clean, finite numeric value rounded to 2 decimal places.
 * - Never returns NaN or Infinity.
 * - Clamps at 0 if daily mean temperature <= baseTemp.
 */
export function calculateDailyGdd(
  tMin: number,
  tMax: number,
  baseTemp: number,
  upperThreshold?: number | null
): number {
  if (
    !Number.isFinite(tMin) ||
    !Number.isFinite(tMax) ||
    !Number.isFinite(baseTemp)
  ) {
    throw new Error(
      `Invalid temperature input for GDD calculation: tMin=${tMin}, tMax=${tMax}, baseTemp=${baseTemp}`
    );
  }

  // Handle inverted min/max defensively if raw sensor provided out of order
  const actualMin = Math.min(tMin, tMax);
  const actualMax = Math.max(tMin, tMax);

  let effMin = actualMin;
  let effMax = actualMax;

  if (upperThreshold !== null && upperThreshold !== undefined && Number.isFinite(upperThreshold)) {
    effMin = Math.min(effMin, upperThreshold);
    effMax = Math.min(effMax, upperThreshold);
  }

  const tAvg = (effMax + effMin) / 2;
  const rawGdd = tAvg - baseTemp;
  const clampedGdd = Math.max(0, rawGdd);

  // Round to 2 decimal places
  return Math.round(clampedGdd * 100) / 100;
}

/**
 * Normalizes a date to UTC midnight (00:00:00.000Z) to ensure consistent date indexing
 */
export function normalizeDateToUtcMidnight(input: Date | string): Date {
  const d = new Date(input);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided to normalizeDateToUtcMidnight: ${input}`);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export interface AccumulationParams {
  cropCycleId: mongoose.Types.ObjectId | string;
  fieldId: mongoose.Types.ObjectId | string;
  zoneId?: mongoose.Types.ObjectId | string | null;
  parameterSetId?: string | null;
  baseTemp: number;
  upperThreshold?: number | null;
  weatherRecords: DailyWeatherInput[];
  persistToDb?: boolean;
}

export interface AccumulationSummary {
  cropCycleId: string;
  totalDaysEvaluated: number;
  recordsPersisted: number;
  finalCumulativeGdd: number;
  dailyResults: DailyGddCalculationResult[];
}

/**
 * Computes running cumulative GDD over sequential weather records and idempotently
 * updates GddLog entries preventing duplicate date accumulation.
 */
export async function accumulateThermalUnits(
  params: AccumulationParams
): Promise<AccumulationSummary> {
  const {
    cropCycleId,
    fieldId,
    zoneId = null,
    parameterSetId = null,
    baseTemp,
    upperThreshold = null,
    weatherRecords,
    persistToDb = true,
  } = params;

  if (!Number.isFinite(baseTemp)) {
    throw new Error(`Cannot accumulate GDD without valid base temperature: ${baseTemp}`);
  }

  // Deduplicate and sort weather records chronologically by date
  const dateMap = new Map<string, DailyWeatherInput>();
  for (const record of weatherRecords) {
    const normDate = normalizeDateToUtcMidnight(record.date);
    const key = normDate.toISOString().slice(0, 10);
    dateMap.set(key, { ...record, date: normDate });
  }

  const sortedRecords = Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningCumulative = 0;
  const dailyResults: DailyGddCalculationResult[] = [];

  for (const rec of sortedRecords) {
    const normDate = normalizeDateToUtcMidnight(rec.date);
    const dailyGdd = calculateDailyGdd(rec.tMin, rec.tMax, baseTemp, upperThreshold);
    runningCumulative = Math.round((runningCumulative + dailyGdd) * 100) / 100;

    dailyResults.push({
      logDate: normDate,
      tMin: rec.tMin,
      tMax: rec.tMax,
      tAvg: Math.round(((rec.tMax + rec.tMin) / 2) * 100) / 100,
      baseTemp,
      dailyGdd,
      cumulativeGdd: runningCumulative,
      weatherSource: rec.weatherSource || 'WeatherObservation',
    });
  }

  let recordsPersisted = 0;

  if (persistToDb && dailyResults.length > 0) {
    await connectDB();
    const cycleObjId = new mongoose.Types.ObjectId(cropCycleId.toString());
    const fieldObjId = new mongoose.Types.ObjectId(fieldId.toString());
    const zoneObjId = zoneId ? new mongoose.Types.ObjectId(zoneId.toString()) : null;

    const bulkOps = dailyResults.map((item) => ({
      updateOne: {
        filter: {
          cropCycleId: cycleObjId,
          logDate: item.logDate,
        },
        update: {
          $set: {
            cropCycleId: cycleObjId,
            fieldId: fieldObjId,
            zoneId: zoneObjId,
            parameterSetId,
            logDate: item.logDate,
            tMinC: item.tMin,
            tMaxC: item.tMax,
            tAvgC: item.tAvg,
            baseTemperatureC: item.baseTemp,
            dailyGDD: item.dailyGdd,
            cumulativeGDD: item.cumulativeGdd,
            progressionMode: 'DYNAMIC_GDD',
            calculationMethod: 'Simple Remainder: max(0, ((Tmax + Tmin)/2) - Tb)',
            weatherSource: item.weatherSource,
          },
        },
        upsert: true,
      },
    }));

    const result = await GddLog.bulkWrite(bulkOps);
    recordsPersisted = (result.upsertedCount || 0) + (result.modifiedCount || 0);
  }

  return {
    cropCycleId: cropCycleId.toString(),
    totalDaysEvaluated: dailyResults.length,
    recordsPersisted,
    finalCumulativeGdd: runningCumulative,
    dailyResults,
  };
}
