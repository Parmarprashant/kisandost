import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Crop, ICrop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { GddLog } from '@/models/GddLog';
import { CropGrowthStage } from '@/models/CropGrowthStage';
import { WeatherObservation } from '@/models/WeatherObservation';
import {
  resolveGddParameters,
  CropContext,
  ProgressionMode,
  ResolutionStatus,
} from './parameterResolver';
import {
  accumulateThermalUnits,
  DailyWeatherInput,
  normalizeDateToUtcMidnight,
} from './gddCalculator';

export interface StageInfo {
  stageId?: string;
  stageName: string;
  standardizedStage?: string;
  stageOrder: number;
  thresholdGdd?: number | null;
  dasStart?: number | null;
  dasEnd?: number | null;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface CropCycleState {
  cropId: string;
  farmerId: string;
  fieldId: string;
  cropName: string;
  variety: string;
  sowingDate: string;
  expectedHarvestDate: string | null;
  currentDas: number;
  progressionMode: ProgressionMode;
  cumulativeGdd: number | null;
  baseTemperature: number | null;
  maturityGdd: number | null;
  progressPercentage: number | null;
  currentStage: StageInfo | null;
  stagesList: StageInfo[];
  parameterSetId: string | null;
  status: ResolutionStatus | 'WEATHER_DATA_UNAVAILABLE' | 'PROGRESSED';
  statusReason: string;
  lastUpdated: string;
}

/**
 * Calculates physiological Days After Sowing (DAS):
 * floor(currentDate - sowingDate)
 * Strictly >= 0.
 */
export function calculateCurrentDas(sowingDate: Date | string, referenceDate: Date = new Date()): number {
  const sowing = new Date(sowingDate);
  if (isNaN(sowing.getTime())) return 0;
  const diffMs = referenceDate.getTime() - sowing.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Normalizes stage progression thresholds from GddParameterSet
 */
function buildGddStagesList(growthStages: any[], cumulativeGdd: number): StageInfo[] {
  let runningThreshold = 0;
  return growthStages.map((st, idx) => {
    if (st.is_cumulative) {
      runningThreshold = st.gdd_value;
    } else {
      runningThreshold = Math.round((runningThreshold + st.gdd_value) * 100) / 100;
    }

    const isCurrent =
      idx === 0
        ? cumulativeGdd <= runningThreshold
        : cumulativeGdd > (st.is_cumulative ? (growthStages[idx - 1]?.gdd_value || 0) : runningThreshold - st.gdd_value) &&
          cumulativeGdd <= runningThreshold;

    return {
      stageId: st.record_id,
      stageName: st.stage_name,
      standardizedStage: st.standardized_stage,
      stageOrder: idx + 1,
      thresholdGdd: runningThreshold,
      isCompleted: cumulativeGdd > runningThreshold,
      isCurrent,
    };
  });
}

/**
 * Evaluates current phenological stage in GDD mode
 */
export function determineGddStage(growthStages: any[], cumulativeGdd: number): StageInfo | null {
  if (!growthStages || growthStages.length === 0) return null;
  const stages = buildGddStagesList(growthStages, cumulativeGdd);

  // Find first stage where cumulativeGdd <= thresholdGdd
  const activeStage = stages.find((s) => cumulativeGdd <= (s.thresholdGdd ?? 0));
  if (activeStage) {
    return { ...activeStage, isCurrent: true };
  }
  // Beyond all stages: at final maturity
  const lastStage = stages[stages.length - 1];
  return { ...lastStage, isCurrent: true, isCompleted: true };
}

/**
 * Evaluates current phenological stage in DAS mode
 */
export function determineDasStage(stages: any[], currentDas: number): StageInfo | null {
  if (!stages || stages.length === 0) return null;

  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const matched = sortedStages.find(
    (s) => currentDas >= s.dasStart && currentDas <= s.dasEnd
  );

  if (matched) {
    return {
      stageId: matched._id?.toString() || `DAS-${matched.stageOrder}`,
      stageName: matched.stageName,
      stageOrder: matched.stageOrder,
      dasStart: matched.dasStart,
      dasEnd: matched.dasEnd,
      isCurrent: true,
    };
  }

  // If before first stage
  if (currentDas < sortedStages[0].dasStart) {
    const first = sortedStages[0];
    return {
      stageId: first._id?.toString() || `DAS-${first.stageOrder}`,
      stageName: first.stageName,
      stageOrder: first.stageOrder,
      dasStart: first.dasStart,
      dasEnd: first.dasEnd,
      isCurrent: true,
    };
  }

  // If beyond last stage
  const last = sortedStages[sortedStages.length - 1];
  return {
    stageId: last._id?.toString() || `DAS-${last.stageOrder}`,
    stageName: last.stageName,
    stageOrder: last.stageOrder,
    dasStart: last.dasStart,
    dasEnd: last.dasEnd,
    isCurrent: true,
    isCompleted: true,
  };
}

/**
 * Evaluates and returns the current crop cycle progression state.
 */
export async function evaluateCropCycle(
  cropId: string,
  userId: string,
  options?: { autoUpdateDb?: boolean; newWeatherRecords?: DailyWeatherInput[] }
): Promise<CropCycleState> {
  await connectDB();

  // 1. Load Crop and verify ownership
  const crop = await Crop.findOne({ _id: cropId, farmerId: userId });
  if (!crop) {
    throw new Error('Crop not found or access denied');
  }

  // 2. Load associated Field
  const field = await Field.findById(crop.fieldId);
  if (!field) {
    throw new Error(`Associated field not found for crop ${cropId}`);
  }

  // 3. Compute Current DAS (Calendar Days after Sowing)
  const currentDas = calculateCurrentDas(crop.sowingDate);

  // 4. Resolve GDD Parameters
  const cropContext: CropContext = {
    cropName: crop.cropName,
    icarCropId: crop.icarCropId,
    variety: crop.variety,
    varietyId: crop.varietyId,
    state: field.location?.state,
    district: field.location?.district,
    sowingDate: crop.sowingDate,
  };

  const resolution = await resolveGddParameters(cropContext);

  let effectiveMode: ProgressionMode = resolution.progressionMode;
  let statusReason = resolution.reason;
  let cumulativeGdd: number | null = null;
  let baseTemperature = resolution.baseTemperature;
  let maturityGdd = resolution.maturityGdd;
  let currentStage: StageInfo | null = null;
  let stagesList: StageInfo[] = [];

  // 5. Thermal unit accumulation if DYNAMIC_GDD
  if (resolution.progressionMode === 'DYNAMIC_GDD' && baseTemperature !== null) {
    // If new weather records provided in options, accumulate them
    if (options?.newWeatherRecords && options.newWeatherRecords.length > 0) {
      await accumulateThermalUnits({
        cropCycleId: crop._id,
        fieldId: field._id,
        zoneId: crop.zoneId,
        parameterSetId: resolution.parameterSetId,
        baseTemp: baseTemperature,
        upperThreshold: resolution.upperThreshold,
        weatherRecords: options.newWeatherRecords,
        persistToDb: true,
      });
    }

    // Check existing GddLog records
    const gddLogs = await GddLog.find({ cropCycleId: crop._id }).sort({ logDate: 1 }).lean();

    if (gddLogs && gddLogs.length > 0) {
      cumulativeGdd = gddLogs[gddLogs.length - 1].cumulativeGDD ?? 0;
    } else {
      // Check WeatherObservation collection for field
      const observations = await WeatherObservation.find({
        fieldId: field._id,
        observationDate: { $gte: crop.sowingDate },
      })
        .sort({ observationDate: 1 })
        .lean();

      if (observations && observations.length > 0) {
        const weatherInputs: DailyWeatherInput[] = observations
          .filter((obs) => obs.tempMinC !== null && obs.tempMaxC !== null)
          .map((obs) => ({
            date: obs.observationDate,
            tMin: obs.tempMinC!,
            tMax: obs.tempMaxC!,
            weatherSource: 'WeatherObservation',
          }));

        if (weatherInputs.length > 0) {
          const accResult = await accumulateThermalUnits({
            cropCycleId: crop._id,
            fieldId: field._id,
            zoneId: crop.zoneId,
            parameterSetId: resolution.parameterSetId,
            baseTemp: baseTemperature,
            upperThreshold: resolution.upperThreshold,
            weatherRecords: weatherInputs,
            persistToDb: true,
          });
          cumulativeGdd = accResult.finalCumulativeGdd;
        }
      }
    }

    // If still no weather records available, do NOT fabricate!
    if (cumulativeGdd === null) {
      effectiveMode = 'HYBRID_DAS';
      statusReason =
        'WEATHER_DATA_UNAVAILABLE: No historical daily temperature observations recorded between sowing date and today. Phenology tracking via physiological DAS fallback.';
    }
  }

  // 6. Growth Stage Resolution
  if (effectiveMode === 'DYNAMIC_GDD' && cumulativeGdd !== null && resolution.parameterSet?.growth_stages) {
    stagesList = buildGddStagesList(resolution.parameterSet.growth_stages, cumulativeGdd);
    currentStage = determineGddStage(resolution.parameterSet.growth_stages, cumulativeGdd);
  } else {
    // DAS Mode Stage Resolution
    const dasStages = await CropGrowthStage.find({
      cropId: crop.icarCropId || crop.cropName.toLowerCase().trim(),
    })
      .sort({ stageOrder: 1 })
      .lean();

    if (dasStages && dasStages.length > 0) {
      currentStage = determineDasStage(dasStages, currentDas);
      stagesList = dasStages.map((s) => ({
        stageId: s._id?.toString(),
        stageName: s.stageName,
        stageOrder: s.stageOrder,
        dasStart: s.dasStart,
        dasEnd: s.dasEnd,
        isCompleted: currentDas > s.dasEnd,
        isCurrent: currentDas >= s.dasStart && currentDas <= s.dasEnd,
      }));
    } else {
      // Generic fallback stage if master stages not available for rare crop
      currentStage = {
        stageName: `Vegetative (Day ${currentDas})`,
        stageOrder: 1,
        dasStart: 0,
        dasEnd: 120,
        isCurrent: true,
      };
      stagesList = [currentStage];
    }
  }

  // 7. Calculate Progress Percentage (Do NOT convert DAS <-> GDD)
  let progressPercentage: number | null = null;
  if (effectiveMode === 'DYNAMIC_GDD' && cumulativeGdd !== null && maturityGdd) {
    progressPercentage = Math.min(100, Math.round((cumulativeGdd / maturityGdd) * 1000) / 10);
  } else if (stagesList.length > 0) {
    const lastStage = stagesList[stagesList.length - 1];
    if (lastStage.dasEnd && lastStage.dasEnd > 0) {
      progressPercentage = Math.min(100, Math.round((currentDas / lastStage.dasEnd) * 1000) / 10);
    }
  }

  // 8. Update Crop Document if requested
  const shouldSave = options?.autoUpdateDb !== false;
  if (shouldSave) {
    crop.currentDas = currentDas;
    crop.currentStageId = currentStage?.stageName || '';
    crop.gddParameterSetId = resolution.parameterSetId || undefined;
    crop.progressionMode = effectiveMode;
    crop.cumulativeGdd = cumulativeGdd ?? 0;

    // Do not invent harvest dates. If DAS maturity is explicitly specified and harvest date is null, set it:
    if (!crop.expectedHarvestDate && stagesList.length > 0) {
      const lastStage = stagesList[stagesList.length - 1];
      if (lastStage.dasEnd && lastStage.dasEnd > 0) {
        const sowingMs = new Date(crop.sowingDate).getTime();
        crop.expectedHarvestDate = new Date(sowingMs + lastStage.dasEnd * 24 * 60 * 60 * 1000);
      }
    }

    await crop.save();
  }

  return {
    cropId: crop._id.toString(),
    farmerId: crop.farmerId,
    fieldId: crop.fieldId.toString(),
    cropName: crop.cropName,
    variety: crop.variety || 'Unspecified',
    sowingDate: new Date(crop.sowingDate).toISOString(),
    expectedHarvestDate: crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toISOString() : null,
    currentDas,
    progressionMode: effectiveMode,
    cumulativeGdd,
    baseTemperature,
    maturityGdd,
    progressPercentage,
    currentStage,
    stagesList,
    parameterSetId: resolution.parameterSetId,
    status: resolution.status === 'GDD_AVAILABLE' && cumulativeGdd === null ? 'WEATHER_DATA_UNAVAILABLE' : resolution.status,
    statusReason,
    lastUpdated: new Date().toISOString(),
  };
}
