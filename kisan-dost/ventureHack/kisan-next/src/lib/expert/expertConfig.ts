/**
 * AgriShield 360° — Phase 9 Expert Verification Configuration & Constants
 *
 * Defines deterministic thresholds, triggers, and decision rules.
 * Strictly adheres to Zero-Hallucination and safe human-in-the-loop governance.
 */

// Confidence score threshold below which automated AI scans trigger expert review recommendation
export const EXPERT_REVIEW_CONFIDENCE_THRESHOLD = 0.70;

export const EXPERT_TICKET_STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_REVIEW',
  'NEEDS_MORE_EVIDENCE',
  'VERIFIED',
  'CANCELLED',
] as const;

export const EXPERT_DECISIONS = [
  'CONFIRMED_AI',
  'CORRECTED',
  'ALTERNATIVE_DIAGNOSIS',
  'NO_DISEASE',
  'INCONCLUSIVE',
  'NEEDS_MORE_IMAGES',
] as const;

export const EXPERT_TRIGGER_TYPES = [
  'LOW_CONFIDENCE',
  'INCONCLUSIVE',
  'FARMER_REQUEST',
  'REVIEWER_REQUEST',
  'ADMIN_REQUEST',
  'DISPUTED_RESULT',
  'RISK_ESCALATION',
] as const;

export const EXPERT_PRIORITY_LEVELS = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const;

/**
 * Determines priority based on crop stage, risk severity, or trigger type.
 */
export function calculateTicketPriority(params: {
  triggerType: string;
  confidenceScore: number;
  screeningResult?: string | null;
  cropStage?: string | null;
}): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const { triggerType, confidenceScore, screeningResult } = params;

  if (confidenceScore < 0.40) {
    return 'CRITICAL';
  }

  if (triggerType === 'RISK_ESCALATION' || triggerType === 'DISPUTED_RESULT') {
    return 'HIGH';
  }

  if (screeningResult === 'INCONCLUSIVE' && confidenceScore < 0.50) {
    return 'HIGH';
  }

  if (confidenceScore < EXPERT_REVIEW_CONFIDENCE_THRESHOLD) {
    return 'MEDIUM';
  }

  return 'LOW';
}
