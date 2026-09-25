/**
 * advisoryNarrative.ts
 * ============================================================================
 * Structured Advisory Narrative Model for KisanDost / AgriShield 360°.
 * Transforms structured internal agronomic and expert data into safe,
 * plain-language text before localization and TTS synthesis.
 * Raw unconstrained AI outputs are NEVER passed directly into messaging or TTS.
 * ============================================================================
 */

import { IAgriAdvisory, IAdvisoryChemicalAction } from '@/models/AgriAdvisory';

export interface StructuredChemicalRecommendation {
  offered: boolean;
  activeIngredient?: string | null;
  formulation?: string | null;
  dosage?: string | null;
  unit?: string | null;
  dilution?: string | null;
  applicationMethod?: string | null;
  phiDays?: number | null;
  reiHours?: number | null;
  safetyPrecaution?: string | null;
  unavailabilityReason?: string | null;
}

export interface StructuredAdvisoryPayload {
  crop: string;
  threat: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  verifiedStatus: 'VERIFIED' | 'NEEDS_MORE_EVIDENCE' | 'IN_REVIEW' | 'AI_ONLY' | string;
  expertVerified: boolean;
  whyAlert?: string;
  recommendedActions: string[];
  culturalActions?: string[];
  mechanicalActions?: string[];
  biologicalActions?: string[];
  chemicalAction?: StructuredChemicalRecommendation;
  nextCheck?: string;
  growthStage?: string;
}

/**
 * Extracts a normalized StructuredAdvisoryPayload from an existing Phase 7/8 IAgriAdvisory document.
 * Combines with Phase 9 expert verification metadata if provided.
 */
export function buildAdvisoryPayloadFromAdvisory(
  advisory: Partial<IAgriAdvisory> & { threatName?: string; riskLevel?: string },
  options?: {
    cropName?: string;
    expertStatus?: 'VERIFIED' | 'NEEDS_MORE_EVIDENCE' | 'IN_REVIEW' | 'AI_ONLY' | string;
    whyAlert?: string;
    nextCheckDays?: number;
  }
): StructuredAdvisoryPayload {
  const expertStatus = options?.expertStatus || 'AI_ONLY';
  const expertVerified = expertStatus === 'VERIFIED';

  const recommendedActions: string[] = [];
  if (advisory.monitoringAdvice && advisory.monitoringAdvice.length > 0) {
    recommendedActions.push(...advisory.monitoringAdvice);
  }
  if (advisory.culturalActions && advisory.culturalActions.length > 0) {
    recommendedActions.push(...advisory.culturalActions);
  }
  if (advisory.mechanicalActions && advisory.mechanicalActions.length > 0) {
    recommendedActions.push(...advisory.mechanicalActions);
  }
  if (advisory.biologicalActions && advisory.biologicalActions.length > 0) {
    recommendedActions.push(...advisory.biologicalActions);
  }

  let chemical: StructuredChemicalRecommendation | undefined = undefined;
  if (advisory.chemicalAction && advisory.chemicalAction.offered) {
    chemical = {
      offered: true,
      activeIngredient: advisory.chemicalAction.activeIngredient,
      formulation: advisory.chemicalAction.formulation,
      dosage: advisory.chemicalAction.dosage,
      unit: advisory.chemicalAction.unit,
      dilution: advisory.chemicalAction.dilution,
      applicationMethod: advisory.chemicalAction.applicationMethod,
      phiDays: advisory.chemicalAction.phiDays,
      reiHours: advisory.chemicalAction.reiHours,
      safetyPrecaution: advisory.chemicalAction.safetyPrecaution
    };
  }

  const nextCheckDays = options?.nextCheckDays || (advisory.riskLevel === 'HIGH' || advisory.riskLevel === 'CRITICAL' ? 3 : 7);

  return {
    crop: options?.cropName || 'Crop',
    threat: advisory.threatName || 'Agronomic Threat',
    riskLevel: (advisory.riskLevel || 'MEDIUM').toUpperCase(),
    verifiedStatus: expertStatus,
    expertVerified,
    whyAlert: options?.whyAlert || advisory.advisorySummary || 'Environmental and field conditions favor disease development.',
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : ['Inspect crop leaves regularly and remove infected plant parts.'],
    culturalActions: advisory.culturalActions || [],
    mechanicalActions: advisory.mechanicalActions || [],
    biologicalActions: advisory.biologicalActions || [],
    chemicalAction: chemical,
    nextCheck: `${nextCheckDays} days`,
    growthStage: advisory.growthStage
  };
}
