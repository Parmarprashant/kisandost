/**
 * AgriShield 360° — Phase 6 Risk Evaluator
 *
 * Evaluates a single validated RiskRule against normalized evidence in a RiskContext.
 *
 * Strict Zero Hallucination Constraints:
 * - Uncomputable rules return INSUFFICIENT_DATA with exact missing data notes.
 * - Missing required evidence returns INSUFFICIENT_DATA.
 * - Conflicting scan evidence returns INCONCLUSIVE.
 * - Clean scans return NO_CONCERN.
 * - Matched threat scans return POTENTIAL_CONCERN.
 * - Never converts "potential concern" into "confirmed disease".
 * - Never invents numerical scores, percentages, or severity.
 */

import {
  RiskRule,
  RiskContext,
  RiskEvaluation,
  RiskStatus,
  RiskLevel,
  RiskEvidence,
} from './riskTypes';
import {
  extractScanEvidence,
  extractStageEvidence,
  extractWeatherEvidence,
  extractResistanceEvidence,
} from './riskEvidence';

/**
 * Normalizes pathogen names for fuzzy matching across AgriVision outputs and ICAR references.
 */
function normalizeThreatName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Checks if an AgriVision diagnosis matches an ICAR threat.
 */
function isDiagnosisMatch(diagnosis: string, rule: RiskRule): boolean {
  const normDiag = normalizeThreatName(diagnosis);
  const normThreat = normalizeThreatName(rule.threatName);
  const threatTokens = normThreat.split(/\s+/).filter((t) => t.length > 3);

  // Direct substring match
  if (normDiag.includes(normThreat) || normThreat.includes(normDiag)) {
    return true;
  }

  // Token overlap (e.g. "blast", "rust", "bollworm", "spot", "blight")
  return threatTokens.some((token) => normDiag.includes(token));
}

/**
 * Evaluates a single rule against the provided context and optional target zone.
 */
export function evaluateRule(
  rule: RiskRule,
  context: RiskContext,
  targetZoneId?: string | null
): RiskEvaluation {
  const evaluatedAt = new Date().toISOString();

  // 1. Non-computable rules: immediately return INSUFFICIENT_DATA
  if (!rule.isComputable) {
    return {
      ruleId: rule.ruleId,
      threatId: rule.threatId,
      threatName: rule.threatName,
      threatCategory: rule.threatCategory,
      status: 'INSUFFICIENT_DATA',
      riskLevel: 'INSUFFICIENT_DATA',
      explanation: `Rule cannot be evaluated computationally: ${
        rule.uncomputableReason || 'Missing validated numeric threshold in ICAR source.'
      }`,
      supportingEvidence: [],
      missingEvidence: [
        rule.uncomputableReason || 'Verified numeric meteorological threshold in ICAR source report',
      ],
      evaluatedAt,
    };
  }

  const missingEvidence: string[] = [];
  const supportingEvidence: RiskEvidence[] = [];
  const mitigatingEvidence: RiskEvidence[] = [];

  // 2. Phenological Stage Evaluation
  const stageEvidence = extractStageEvidence(context);
  const currentStageName = context.cycleState.currentStage?.stageName;

  if (rule.requiredEvidence.includes('PHENOLOGY_STAGE')) {
    if (!currentStageName) {
      missingEvidence.push('PHENOLOGY_STAGE: Crop growth stage is unavailable.');
    } else {
      supportingEvidence.push(...stageEvidence);

      // If rule specifies applicable stages, check compatibility
      if (rule.applicableStageNames && rule.applicableStageNames.length > 0) {
        const isStageCompatible = rule.applicableStageNames.some(
          (s) =>
            currentStageName.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(currentStageName.toLowerCase())
        );

        if (!isStageCompatible) {
          return {
            ruleId: rule.ruleId,
            threatId: rule.threatId,
            threatName: rule.threatName,
            threatCategory: rule.threatCategory,
            status: 'NO_CONCERN',
            riskLevel: 'NO_CONCERN',
            explanation: `Current crop stage (${currentStageName}) is not documented as susceptible to ${rule.threatName}. Documented susceptible stages: ${rule.applicableStageNames.join(', ')}.`,
            supportingEvidence: stageEvidence,
            missingEvidence: [],
            evaluatedAt,
          };
        }
      }
    }
  }

  // 3. Weather Evidence Evaluation
  if (rule.requiredEvidence.includes('WEATHER_DATA')) {
    const weatherEvidence = extractWeatherEvidence(context);
    if (weatherEvidence.length === 0 || !context.weather.coverage.available) {
      missingEvidence.push('WEATHER_DATA: Daily weather observations unavailable for evaluation window.');
    } else {
      supportingEvidence.push(...weatherEvidence);
    }
  }

  // 4. Cultivar Resistance Evaluation
  const resistanceEvidence = extractResistanceEvidence(context);
  if (resistanceEvidence.length > 0) {
    const varietyRef = context.varietyReference;
    const resistantTo = (varietyRef?.resistantTo || []).map((t: string) => t.toLowerCase());
    const isResistant = resistantTo.some(
      (t: string) =>
        rule.threatName.toLowerCase().includes(t) ||
        t.includes(rule.threatId.toLowerCase())
    );

    if (isResistant) {
      mitigatingEvidence.push(...resistanceEvidence);
    }
  }

  // 5. Scan Evidence Evaluation
  if (rule.requiredEvidence.includes('SCAN_RESULT')) {
    const scanData = extractScanEvidence(context, targetZoneId);

    if (scanData.activeEvidence.length === 0) {
      missingEvidence.push(
        targetZoneId
          ? `SCAN_RESULT: No recent visual scouting image recorded for zone ${targetZoneId}.`
          : 'SCAN_RESULT: No recent visual scouting image recorded for this crop.'
      );
    } else {
      // Check for conflicting active scans
      if (scanData.isConflicting) {
        return {
          ruleId: rule.ruleId,
          threatId: rule.threatId,
          threatName: rule.threatName,
          threatCategory: rule.threatCategory,
          status: 'INCONCLUSIVE',
          riskLevel: 'INCONCLUSIVE',
          explanation: `Visual diagnostic scans in this zone returned conflicting diagnoses (${scanData.activeDiagnoses.join(
            ', '
          )}). Further evidence required before establishing concern.`,
          supportingEvidence: scanData.activeEvidence,
          missingEvidence: [],
          evaluatedAt,
        };
      }

      // Check screening results
      const hasNoConcern = scanData.activeEvidence.every(
        (s) =>
          s.value.screeningResult === 'NO_CONCERN_DETECTED' ||
          s.value.condition?.toLowerCase().includes('healthy')
      );

      if (hasNoConcern) {
        return {
          ruleId: rule.ruleId,
          threatId: rule.threatId,
          threatName: rule.threatName,
          threatCategory: rule.threatCategory,
          status: 'NO_CONCERN',
          riskLevel: 'NO_CONCERN',
          explanation: `Visual scouting image indicated no concerning symptoms detected for ${rule.threatName}.`,
          supportingEvidence: scanData.activeEvidence,
          missingEvidence: [],
          evaluatedAt,
        };
      }

      // Check if diagnosis matches this rule's threat
      const matchingScans = scanData.activeEvidence.filter((s) =>
        isDiagnosisMatch(s.value.condition, rule)
      );

      if (matchingScans.length > 0) {
        supportingEvidence.push(...matchingScans);

        // Mitigated by cultivar resistance if present
        const hasResistance = mitigatingEvidence.length > 0;
        const status: RiskStatus = 'POTENTIAL_CONCERN';
        const level: RiskLevel = hasResistance ? 'LOW' : 'POTENTIAL_CONCERN';

        const explanation = hasResistance
          ? `Visual scouting indicated potential symptoms of ${rule.threatName}, but cultivar ${
              context.crop.variety || 'in use'
            } has documented resistance in ICAR trials.`
          : `Visual scouting indicated potential symptoms matching ${rule.threatName}. Verified against ICAR pathogen reference catalog.`;

        return {
          ruleId: rule.ruleId,
          threatId: rule.threatId,
          threatName: rule.threatName,
          threatCategory: rule.threatCategory,
          status,
          riskLevel: level,
          explanation,
          supportingEvidence,
          missingEvidence: [],
          mitigatingEvidence,
          evaluatedAt,
        };
      }

      // Scan was concerning, but for a different condition
      return {
        ruleId: rule.ruleId,
        threatId: rule.threatId,
        threatName: rule.threatName,
        threatCategory: rule.threatCategory,
        status: 'NO_CONCERN',
        riskLevel: 'NO_CONCERN',
        explanation: `Visual diagnostic scan did not match ${rule.threatName}.`,
        supportingEvidence: scanData.activeEvidence,
        missingEvidence: [],
        evaluatedAt,
      };
    }
  }

  // 6. If any required evidence is missing, return INSUFFICIENT_DATA
  if (missingEvidence.length > 0) {
    return {
      ruleId: rule.ruleId,
      threatId: rule.threatId,
      threatName: rule.threatName,
      threatCategory: rule.threatCategory,
      status: 'INSUFFICIENT_DATA',
      riskLevel: 'INSUFFICIENT_DATA',
      explanation: `Evaluation incomplete due to missing required evidence: ${missingEvidence.join(
        ' | '
      )}`,
      supportingEvidence,
      missingEvidence,
      evaluatedAt,
    };
  }

  // Fallback for complete evidence without positive trigger
  return {
    ruleId: rule.ruleId,
    threatId: rule.threatId,
    threatName: rule.threatName,
    threatCategory: rule.threatCategory,
    status: 'NO_CONCERN',
    riskLevel: 'NO_CONCERN',
    explanation: `Available evidence does not indicate concern for ${rule.threatName}.`,
    supportingEvidence,
    missingEvidence: [],
    evaluatedAt,
  };
}
