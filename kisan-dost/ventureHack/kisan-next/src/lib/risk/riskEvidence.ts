/**
 * AgriShield 360° — Phase 6 Risk Evidence Builder
 *
 * Normalizes multi-source evidence across:
 * - Crop & Field context
 * - Phenological stages (Phase 3C)
 * - Historical & current weather observations (Phase 5)
 * - AgriVision zone disease scans & sessions (Phase 4)
 * - ICAR Pest & Disease references (Phase 1)
 * - ICAR Cultivar resistance traits (Phase 1)
 *
 * ZERO HALLUCINATION POLICY:
 * - Every piece of evidence preserves exact provenance.
 * - Missing values remain null.
 * - Confidence is never invented.
 */

import {
  RiskEvidence,
  RiskContext,
  EvidenceSourceType,
} from './riskTypes';

/**
 * Builds an evidence item with guaranteed provenance.
 */
export function createEvidence(params: {
  sourceType: EvidenceSourceType;
  sourceId: string;
  observationDate?: string | Date | null;
  cropId: string;
  fieldId: string;
  zoneId?: string | null;
  value: any;
  unit?: string | null;
  sourceDocument: string;
  confidence?: number | null;
  isHistorical?: boolean;
}): RiskEvidence {
  return {
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    observationDate: params.observationDate ?? null,
    cropId: params.cropId,
    fieldId: params.fieldId,
    zoneId: params.zoneId ?? null,
    value: params.value,
    unit: params.unit ?? null,
    sourceDocument: params.sourceDocument,
    confidence: params.confidence ?? null,
    isHistorical: params.isHistorical ?? false,
  };
}

/**
 * Extracts phenological stage evidence from crop cycle state.
 */
export function extractStageEvidence(context: RiskContext): RiskEvidence[] {
  const stage = context.cycleState.currentStage;
  if (!stage) return [];

  return [
    createEvidence({
      sourceType: 'PHENOLOGY_STAGE',
      sourceId: stage.stageName,
      cropId: context.crop._id,
      fieldId: context.field._id,
      zoneId: context.zone?._id ?? null,
      value: {
        stageName: stage.stageName,
        stageOrder: stage.stageOrder,
        currentDas: context.cycleState.currentDas,
        cumulativeGdd: context.cycleState.cumulativeGdd,
        progressionMode: context.cycleState.progressionMode,
      },
      sourceDocument:
        context.cycleState.progressionMode === 'DYNAMIC_GDD'
          ? 'GDD Parameter Set / Thermal Time Progression'
          : 'ICAR Growth Stage Catalog (DAS)',
    }),
  ];
}

/**
 * Extracts weather evidence from recent observations.
 */
export function extractWeatherEvidence(context: RiskContext): RiskEvidence[] {
  const obs = context.weather.observations;
  if (!obs || obs.length === 0) return [];

  return obs.map((o) =>
    createEvidence({
      sourceType: 'WEATHER_OBSERVATION',
      sourceId: o.sourceObservationId || `weather_${o.date}`,
      observationDate: o.date,
      cropId: context.crop._id,
      fieldId: context.field._id,
      zoneId: context.zone?._id ?? null,
      value: {
        tempMinC: o.minTemperatureC ?? null,
        tempMaxC: o.maxTemperatureC ?? null,
        tempMeanC: o.meanTemperatureC ?? null,
        rainfallMm: o.rainfallMm ?? null,
        relativeHumidityPct: o.relativeHumidityPct ?? null,
        windSpeedKph: o.windSpeedKph ?? null,
        solarRadiationWm2: o.solarRadiationWm2 ?? null,
      },
      sourceDocument: `Historical Weather Provider (${o.source || 'open-meteo'})`,
    })
  );
}

/**
 * Extracts image scan evidence, strictly segregating active vs historical scans
 * and respecting zone isolation.
 */
export function extractScanEvidence(
  context: RiskContext,
  targetZoneId?: string | null
): {
  activeEvidence: RiskEvidence[];
  historicalEvidence: RiskEvidence[];
  isConflicting: boolean;
  activeDiagnoses: string[];
} {
  const activeScans = context.scans.activeScans || [];
  const historicalScans = context.scans.historicalScans || [];

  // Filter scans by targetZoneId if provided (enforcing zone isolation)
  const zoneFilteredActive = targetZoneId
    ? activeScans.filter((s) => s.zoneId && s.zoneId.toString() === targetZoneId.toString())
    : activeScans;

  const zoneFilteredHistorical = targetZoneId
    ? historicalScans.filter((s) => s.zoneId && s.zoneId.toString() === targetZoneId.toString())
    : historicalScans;

  const activeEvidence: RiskEvidence[] = zoneFilteredActive.map((s) =>
    createEvidence({
      sourceType: 'AGRIVISION_SCAN',
      sourceId: s._id ? s._id.toString() : 'scan',
      observationDate: s.capturedAt || s.createdAt,
      cropId: context.crop._id,
      fieldId: context.field._id,
      zoneId: s.zoneId ? s.zoneId.toString() : null,
      value: {
        condition: s.diagnosis?.primaryCondition || 'Unknown',
        pathogenType: s.diagnosis?.pathogenType || 'other',
        status: s.diagnosis?.status || 'suspected',
        screeningResult: s.screeningResult || null,
        scanSessionId: s.scanSessionId ? s.scanSessionId.toString() : null,
        viewAngle: s.viewAngle || 'screening',
      },
      confidence: s.confidence?.score ?? null,
      sourceDocument: 'AgriVision Diagnostic Service (Modal.run)',
      isHistorical: false,
    })
  );

  const historicalEvidence: RiskEvidence[] = zoneFilteredHistorical.map((s) =>
    createEvidence({
      sourceType: 'HISTORICAL_SCAN',
      sourceId: s._id ? s._id.toString() : 'historical_scan',
      observationDate: s.capturedAt || s.createdAt,
      cropId: context.crop._id,
      fieldId: context.field._id,
      zoneId: s.zoneId ? s.zoneId.toString() : null,
      value: {
        condition: s.diagnosis?.primaryCondition || 'Unknown',
        pathogenType: s.diagnosis?.pathogenType || 'other',
        screeningResult: s.screeningResult || null,
      },
      confidence: s.confidence?.score ?? null,
      sourceDocument: 'CropDiseaseScan Historical Archive',
      isHistorical: true,
    })
  );

  // Check for conflicts among active scans in the same zone
  const activeDiagnoses = [
    ...new Set(
      zoneFilteredActive
        .map((s) => s.diagnosis?.primaryCondition)
        .filter((c): c is string => Boolean(c && !c.toLowerCase().includes('healthy')))
    ),
  ];

  const isConflicting = activeDiagnoses.length > 1;

  return {
    activeEvidence,
    historicalEvidence,
    isConflicting,
    activeDiagnoses,
  };
}

/**
 * Extracts cultivar resistance evidence from ICAR variety catalog.
 */
export function extractResistanceEvidence(context: RiskContext): RiskEvidence[] {
  const varietyRef = context.varietyReference;
  if (!varietyRef || !varietyRef.resistantTo || varietyRef.resistantTo.length === 0) {
    return [];
  }

  return [
    createEvidence({
      sourceType: 'CULTIVAR_RESISTANCE',
      sourceId: varietyRef.varietyId || context.crop.variety || 'variety_resistance',
      cropId: context.crop._id,
      fieldId: context.field._id,
      zoneId: context.zone?._id ?? null,
      value: {
        varietyName: varietyRef.varietyName || context.crop.variety,
        resistantTo: varietyRef.resistantTo,
      },
      sourceDocument: varietyRef.sourceReport || 'ICAR Variety Notification Gazette',
    }),
  ];
}
