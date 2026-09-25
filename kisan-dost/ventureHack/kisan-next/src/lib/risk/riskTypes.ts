/**
 * AgriShield 360° — Phase 6 Risk Engine Types
 *
 * Strict TypeScript interfaces for agricultural risk assessment.
 * All types follow the ZERO HALLUCINATION policy:
 * - Categorical risk states (no manufactured percentages or scores)
 * - Required evidence specifications
 * - Full source provenance
 */

export type RiskLevel =
  | 'NO_CONCERN'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'POTENTIAL_CONCERN'
  | 'INSUFFICIENT_DATA'
  | 'INCONCLUSIVE';

export type RiskStatus =
  | 'STABLE'
  | 'ATTENTION'
  | 'HIGH_RISK'
  | 'NO_CONCERN'
  | 'POTENTIAL_CONCERN'
  | 'INSUFFICIENT_DATA'
  | 'INCONCLUSIVE';

export type EvidenceSourceType =
  | 'REFERENCE_CATALOG'
  | 'PHENOLOGY_STAGE'
  | 'WEATHER_OBSERVATION'
  | 'AGRIVISION_SCAN'
  | 'HISTORICAL_SCAN'
  | 'CULTIVAR_RESISTANCE';

export interface RiskEvidence {
  sourceType: EvidenceSourceType;
  sourceId: string;
  observationDate?: string | Date | null;
  cropId: string;
  fieldId: string;
  zoneId?: string | null;
  value: any;
  unit?: string | null;
  sourceDocument: string;
  confidence: number | null; // Strictly null unless directly provided by source/classifier
  isHistorical?: boolean;
}

export type ThreatCategory =
  | 'FUNGAL'
  | 'BACTERIAL'
  | 'VIRAL'
  | 'INSECT_PEST'
  | 'NEMATODE'
  | 'PHYSIOLOGICAL_STRESS'
  | 'OTHER';

export type RequiredEvidenceType =
  | 'PHENOLOGY_STAGE'
  | 'WEATHER_DATA'
  | 'WEATHER_THRESHOLD'
  | 'SCAN_RESULT'
  | 'CULTIVAR_RESISTANCE';

export interface RiskRule {
  ruleId: string;
  cropId: string; // e.g. "cotton", "rice", "wheat", "groundnut", "soybean"
  threatId: string;
  threatName: string;
  threatCategory: ThreatCategory;
  applicableStageNames?: string[];
  weatherConditionType?: string;
  weatherConditionDescription?: string;
  weatherThreshold?: {
    metric: 'tempMaxC' | 'tempMinC' | 'precipitationMm' | 'relativeHumidityPct';
    operator: '>' | '>=' | '<' | '<=' | '==';
    value: number;
    consecutiveDays?: number;
  } | null;
  geographicApplicability?: string[];
  sourceReference: string;
  sourceDocument: string;
  sourceEvidence: string;
  requiredEvidence: RequiredEvidenceType[];
  isComputable: boolean;
  uncomputableReason?: string;
}

export interface RiskEvaluation {
  ruleId: string;
  threatId: string;
  threatName: string;
  threatCategory: ThreatCategory;
  status: RiskStatus;
  riskLevel: RiskLevel;
  explanation: string;
  supportingEvidence: RiskEvidence[];
  missingEvidence: string[];
  mitigatingEvidence?: RiskEvidence[];
  evaluatedAt: string;
}

export interface RiskContext {
  crop: {
    _id: string;
    cropName: string;
    icarCropId?: string;
    variety?: string;
    varietyId?: string;
    sowingDate: Date | string;
    fieldId: string;
    zoneId?: string | null;
    farmerId: string;
  };
  field: {
    _id: string;
    name: string;
    farmerId: string;
    location?: {
      latitude?: number;
      longitude?: number;
      district?: string;
      state?: string;
    };
  };
  zone?: {
    _id: string;
    zoneName: string;
    zoneCode: string;
    active?: boolean;
  } | null;
  cycleState: {
    currentDas: number;
    progressionMode: string;
    cumulativeGdd: number | null;
    currentStage: {
      stageName: string;
      stageOrder: number;
      thresholdGdd?: number | null;
      dasStart?: number | null;
      dasEnd?: number | null;
    } | null;
    status: string;
  };
  weather: {
    observations: any[];
    coverage: {
      available: boolean;
      coveragePercent: number;
      missingDates?: string[];
    };
  };
  scans: {
    activeScans: any[];
    historicalScans: any[];
    latestSession?: any | null;
  };
  varietyReference?: any | null;
  pestReferences: any[];
  weatherReferences: any[];
}

export interface CropRiskSummary {
  success: boolean;
  cropId: string;
  fieldId: string;
  zoneId?: string | null;
  cropName: string;
  variety: string;
  overallStatus: RiskStatus;
  overallLevel: RiskLevel;
  growthStage: {
    name: string;
    currentDas: number;
    cumulativeGdd: number | null;
    progressionMode: string;
    source: string;
  };
  evaluatedThreats: RiskEvaluation[];
  evidenceCompleteness: {
    cropStageAvailable: boolean;
    weatherAvailable: boolean;
    weatherCoveragePercent: number;
    imageScanAvailable: boolean;
    varietyDataAvailable: boolean;
  };
  zoneRisks?: Array<{
    zoneId: string;
    zoneName: string;
    status: RiskStatus;
    level: RiskLevel;
    evaluations: RiskEvaluation[];
  }>;
  lastEvaluatedAt: string;
}
