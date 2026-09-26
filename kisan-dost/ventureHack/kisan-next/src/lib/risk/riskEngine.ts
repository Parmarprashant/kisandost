/**
 * AgriShield 360° — Phase 6 Risk Evaluation Engine
 *
 * Orchestrates multi-source risk assessment:
 * 1. Crop & Field ownership verification
 * 2. FarmZone validation and isolation
 * 3. Crop cycle & phenology retrieval (Phase 3C)
 * 4. Weather observation retrieval (Phase 5)
 * 5. Diagnostic scan & session evidence retrieval (Phase 4)
 * 6. Reference catalog matching (ICAR Phase 1)
 * 7. Rule evaluation (Deterministic, Zero Hallucination)
 * 8. Idempotent RiskEvent persistence
 */

import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Crop } from '@/models/Crop';
import { Field } from '@/models/Field';
import { FarmZone } from '@/models/FarmZone';
import { CropDiseaseScan } from '@/models/CropDiseaseScan';
import { ScanSession } from '@/models/ScanSession';
import { WeatherObservation } from '@/models/WeatherObservation';
import { IcarVariety } from '@/models/IcarVariety';
import { RiskEvent } from '@/models/RiskEvent';
import { evaluateCropCycle } from '@/lib/gdd/cropCycleEngine';
import {
  RiskContext,
  CropRiskSummary,
  RiskEvaluation,
  RiskStatus,
  RiskLevel,
} from './riskTypes';
import { getRulesForCrop } from './riskRules';
import { evaluateRule } from './riskEvaluator';
import { utcMidnightToCalendarDate } from '@/lib/weather/historicalWeatherService';
import { createEvidence } from './riskEvidence';

/**
 * Computes overall status from a set of individual threat evaluations.
 */
function aggregateOverallStatus(evaluations: RiskEvaluation[]): {
  status: RiskStatus;
  level: RiskLevel;
} {
  const hasPotentialConcern = evaluations.some(
    (e) => e.status === 'POTENTIAL_CONCERN' || e.riskLevel === 'POTENTIAL_CONCERN'
  );
  if (hasPotentialConcern) {
    return { status: 'POTENTIAL_CONCERN', level: 'POTENTIAL_CONCERN' };
  }

  const hasInconclusive = evaluations.some((e) => e.status === 'INCONCLUSIVE');
  if (hasInconclusive) {
    return { status: 'INCONCLUSIVE', level: 'INCONCLUSIVE' };
  }

  const hasInsufficientData = evaluations.some((e) => e.status === 'INSUFFICIENT_DATA');
  if (hasInsufficientData) {
    return { status: 'INSUFFICIENT_DATA', level: 'INSUFFICIENT_DATA' };
  }

  return { status: 'NO_CONCERN', level: 'NO_CONCERN' };
}

/**
 * Main evaluation entry point for a crop or specific zone.
 */
export async function evaluateCropRisk(params: {
  cropId: string;
  farmerId: string;
  targetZoneId?: string | null;
  persistEvents?: boolean;
}): Promise<CropRiskSummary> {
  const { cropId, farmerId, targetZoneId, persistEvents = true } = params;

  await connectDB();

  // 1. Ownership & Crop Verification
  if (!mongoose.Types.ObjectId.isValid(cropId)) {
    throw new Error(`Invalid cropId format: ${cropId}`);
  }

  const crop = await Crop.findOne({ _id: cropId, farmerId }).lean();
  if (!crop) {
    throw new Error('Crop not found or access denied');
  }

  // 2. Associated Field Verification
  const field = await Field.findOne({ _id: crop.fieldId, farmerId }).lean();
  if (!field) {
    throw new Error('Associated field not found or access denied');
  }

  // 3. Zone Validation (if requested)
  let resolvedZone: any = null;
  if (targetZoneId) {
    if (!mongoose.Types.ObjectId.isValid(targetZoneId)) {
      throw new Error(`Invalid zoneId format: ${targetZoneId}`);
    }

    resolvedZone = await FarmZone.findOne({
      _id: targetZoneId,
      fieldId: field._id,
      farmerId,
    }).lean();

    if (!resolvedZone) {
      throw new Error('Zone not found, inactive, or does not belong to this field');
    }
  }

  // 4..7 Parallel Multi-Source Context Retrieval
  const [cycleState, recentWeatherDocs, allScans, latestSession, varietyRef, fieldZones] =
    await Promise.all([
      evaluateCropCycle(cropId, farmerId, { autoUpdateDb: false }),
      WeatherObservation.find({
        fieldId: field._id,
        isForecast: false,
      })
        .sort({ observationDate: -1 })
        .limit(30)
        .lean(),
      CropDiseaseScan.find({
        cropCycleId: { $in: [crop._id, crop._id.toString()] },
        farmerId,
      })
        .select(
          '_id farmerId fieldId zoneId cropCycleId scanSessionId viewAngle screeningResult capturedAt createdAt diagnosis confidence infectedAreaPct severity cropStageAtScan dasAtScan'
        )
        .sort({ capturedAt: -1, createdAt: -1 })
        .limit(50)
        .lean(),
      ScanSession.findOne({
        cropId: { $in: [crop._id, crop._id.toString()] },
        farmerId,
      })
        .sort({ createdAt: -1 })
        .lean(),
      crop.varietyId || crop.variety
        ? IcarVariety.findOne({
            $or: [
              { varietyId: crop.varietyId },
              { varietyName: new RegExp(`^${crop.variety}$`, 'i') },
            ],
          }).lean()
        : Promise.resolve(null),
      !targetZoneId
        ? FarmZone.find({ fieldId: field._id, farmerId }).lean()
        : Promise.resolve([]),
    ]);

  const normalizedWeatherObs = recentWeatherDocs.map((doc) => ({
    date: utcMidnightToCalendarDate(new Date(doc.observationDate)),
    minTemperatureC: doc.tempMinC ?? null,
    maxTemperatureC: doc.tempMaxC ?? null,
    meanTemperatureC: doc.tempC ?? null,
    rainfallMm: doc.precipitationMm ?? null,
    relativeHumidityPct: doc.relativeHumidityPct ?? null,
    windSpeedKph: doc.windSpeedKph ?? null,
    solarRadiationWm2: doc.solarRadiationWm2 ?? null,
    source: doc.dataSource === 'WeatherAPI' ? 'weatherapi' : 'open-meteo',
    sourceObservationId: doc.sourceObservationId ?? undefined,
  }));

  const weatherCoveragePercent =
    normalizedWeatherObs.length >= 7 ? 100 : Math.round((normalizedWeatherObs.length / 7) * 100);

  // Active scans (last 14 days) vs Historical scans
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const activeScans = allScans.filter(
    (s) => new Date(s.capturedAt || s.createdAt) >= fourteenDaysAgo
  );
  const historicalScans = allScans.filter(
    (s) => new Date(s.capturedAt || s.createdAt) < fourteenDaysAgo
  );

  // 8. Build Context
  const context: RiskContext = {
    crop: {
      _id: crop._id.toString(),
      cropName: crop.cropName,
      icarCropId: crop.icarCropId,
      variety: crop.variety,
      varietyId: crop.varietyId,
      sowingDate: crop.sowingDate,
      fieldId: field._id.toString(),
      zoneId: crop.zoneId ? crop.zoneId.toString() : null,
      farmerId,
    },
    field: {
      _id: field._id.toString(),
      name: field.name,
      farmerId,
      location: field.location,
    },
    zone: resolvedZone
      ? {
          _id: resolvedZone._id.toString(),
          zoneName: resolvedZone.zoneName,
          zoneCode: resolvedZone.zoneCode,
          active: resolvedZone.active,
        }
      : null,
    cycleState: {
      currentDas: cycleState.currentDas,
      progressionMode: cycleState.progressionMode,
      cumulativeGdd: cycleState.cumulativeGdd,
      currentStage: cycleState.currentStage,
      status: cycleState.status,
    },
    weather: {
      observations: normalizedWeatherObs,
      coverage: {
        available: normalizedWeatherObs.length > 0,
        coveragePercent: weatherCoveragePercent,
      },
    },
    scans: {
      activeScans,
      historicalScans,
      latestSession,
    },
    varietyReference: varietyRef,
    pestReferences: [],
    weatherReferences: [],
  };

  // 9. Load Applicable Validated Rules
  const applicableCropId = crop.icarCropId || crop.cropName;
  const rules = getRulesForCrop(applicableCropId);

  // 10. Evaluate Rules
  const evaluatedThreats: RiskEvaluation[] = rules.map((rule) =>
    evaluateRule(rule, context, targetZoneId)
  );

  // 10b. Synthesize evaluated threats from active scans with detected concerns
  for (const scan of activeScans) {
    const condition = scan.diagnosis?.primaryCondition;
    const isConcern =
      scan.screeningResult === 'POTENTIAL_CONCERN' ||
      (condition &&
        !condition.toLowerCase().includes('healthy') &&
        scan.diagnosis?.status !== 'healthy');

    if (condition && isConcern) {
      const alreadyCovered = evaluatedThreats.some(
        (t) =>
          t.threatName.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(t.threatName.toLowerCase())
      );

      if (!alreadyCovered) {
        evaluatedThreats.push({
          ruleId: `RULE-SCAN-${scan._id.toString().slice(-6)}`,
          threatId: condition.toLowerCase().replace(/[^\w]/g, '_'),
          threatName: condition,
          threatCategory: (scan.diagnosis?.pathogenType?.toUpperCase() || 'DISEASE') as any,
          status: 'POTENTIAL_CONCERN',
          riskLevel: 'POTENTIAL_CONCERN',
          explanation: `In-field visual scouting scan detected symptoms of ${condition} with ${Math.round(
            (scan.confidence?.score || 0.8) * 100
          )}% confidence.`,
          supportingEvidence: [
            createEvidence({
              sourceType: 'AGRIVISION_SCAN',
              sourceId: scan._id ? scan._id.toString() : 'scan',
              observationDate: scan.capturedAt || scan.createdAt,
              cropId: context.crop._id,
              fieldId: context.field._id,
              zoneId: scan.zoneId ? scan.zoneId.toString() : null,
              value: {
                condition,
                pathogenType: scan.diagnosis?.pathogenType || 'other',
                status: scan.diagnosis?.status || 'suspected',
                screeningResult: scan.screeningResult || null,
                scanSessionId: scan.scanSessionId ? scan.scanSessionId.toString() : null,
                viewAngle: scan.viewAngle || 'screening',
              },
              confidence: scan.confidence?.score ?? null,
              sourceDocument: 'AgriVision Diagnostic Service (In-Field Scan)',
              isHistorical: false,
            }),
          ],
          missingEvidence: [],
          evaluatedAt: new Date().toISOString(),
        });
      }
    }
  }

  const { status: overallStatus, level: overallLevel } =
    aggregateOverallStatus(evaluatedThreats);

  // 11. Idempotent RiskEvent Persistence in Background via bulkWrite
  if (persistEvents && evaluatedThreats.length > 0) {
    const evaluatedAtDate = new Date();
    const bulkOps = evaluatedThreats.map((evaluation) => {
      const scanRef =
        activeScans.find(
          (s) =>
            s.diagnosis?.primaryCondition?.toLowerCase() === evaluation.threatName.toLowerCase() ||
            (targetZoneId && s.zoneId?.toString() === targetZoneId.toString())
        ) || activeScans[0];
      const weatherRef = recentWeatherDocs[0]?._id;

      return {
        updateOne: {
          filter: {
            cropCycleId: crop._id,
            zoneId: targetZoneId ? new mongoose.Types.ObjectId(targetZoneId) : null,
            threatId: evaluation.threatId,
            ruleId: evaluation.ruleId,
          },
          update: {
            $set: {
              farmerId,
              fieldId: field._id,
              zoneId: targetZoneId ? new mongoose.Types.ObjectId(targetZoneId) : null,
              cropCycleId: crop._id,
              threatId: evaluation.threatId,
              threatName: evaluation.threatName,
              ruleId: evaluation.ruleId,
              scanId: scanRef?._id ?? null,
              weatherObservationId: weatherRef ?? null,
              growthStageId: cycleState.currentStage?.stageName ?? null,
              riskStatus: evaluation.status,
              riskLevel: evaluation.riskLevel,
              riskScore: null, // Strictly null under Zero Hallucination policy
              explanation: evaluation.explanation,
              missingEvidence: evaluation.missingEvidence,
              contributingFactors: {
                stageVulnerability: {
                  isVulnerable: Boolean(cycleState.currentStage),
                  stageName: cycleState.currentStage?.stageName,
                  vulnerablePests: [evaluation.threatName],
                },
                weatherStress: {
                  isTriggered: evaluation.status === 'POTENTIAL_CONCERN',
                  activeTriggers: evaluation.missingEvidence,
                },
                diseaseScanSignal: {
                  hasActiveDiagnosis: evaluation.supportingEvidence.some(
                    (e) => e.sourceType === 'AGRIVISION_SCAN'
                  ),
                  scanId: scanRef?._id,
                  conditionName: evaluation.threatName,
                },
                supportingEvidence: evaluation.supportingEvidence,
                missingEvidence: evaluation.missingEvidence,
                mitigatingEvidence: evaluation.mitigatingEvidence,
              },
              recommendedActions: [], // Phase 6 does not generate treatment plans
              evaluatedAt: evaluatedAtDate,
            },
          },
          upsert: true,
        },
      };
    });

    try {
      await RiskEvent.bulkWrite(bulkOps, { ordered: false });
    } catch (err: any) {
      console.warn('[evaluateCropRisk] RiskEvent persistence notice:', err?.message);
    }
  }

  // 12. Zone-by-Zone Breakdown (if evaluating at field/crop level)
  let zoneRisks: CropRiskSummary['zoneRisks'] = undefined;
  if (!targetZoneId && fieldZones && fieldZones.length > 0) {
    zoneRisks = fieldZones.map((z: any) => {
      const zoneEvaluations = rules.map((rule) =>
        evaluateRule(rule, context, z._id.toString())
      );
      const { status, level } = aggregateOverallStatus(zoneEvaluations);
      return {
        zoneId: z._id.toString(),
        zoneName: z.zoneName,
        status,
        level,
        evaluations: zoneEvaluations,
      };
    });
  }

  return {
    success: true,
    cropId: crop._id.toString(),
    fieldId: field._id.toString(),
    zoneId: targetZoneId ?? null,
    cropName: crop.cropName,
    variety: crop.variety || 'Unspecified',
    overallStatus,
    overallLevel,
    growthStage: {
      name: cycleState.currentStage?.stageName || `Vegetative (DAS ${cycleState.currentDas})`,
      currentDas: cycleState.currentDas,
      cumulativeGdd: cycleState.cumulativeGdd,
      progressionMode: cycleState.progressionMode,
      source:
        cycleState.progressionMode === 'DYNAMIC_GDD'
          ? 'Thermal Time Accumulation'
          : 'Physiological DAS Fallback',
    },
    evaluatedThreats,
    evidenceCompleteness: {
      cropStageAvailable: Boolean(cycleState.currentStage),
      weatherAvailable: normalizedWeatherObs.length > 0,
      weatherCoveragePercent,
      imageScanAvailable: activeScans.length > 0,
      varietyDataAvailable: Boolean(varietyRef),
    },
    zoneRisks,
    lastEvaluatedAt: new Date().toISOString(),
  };
}
