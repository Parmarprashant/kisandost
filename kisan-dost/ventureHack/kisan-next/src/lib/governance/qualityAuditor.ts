/**
 * AgriShield 360° — Phase 8 Automated Knowledge Quality Auditor & Coverage Metrics
 */

import { AgriIpmRule, IAgriIpmRule } from '@/models/AgriIpmRule';
import { AgriSourceRegistry } from '@/models/AgriSourceRegistry';
import { checkBannedPesticide, checkCropRestriction } from './regulatoryService';

export interface QualityFinding {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  ruleCode?: string;
  sourceCode?: string;
  issue: string;
  recommendation: string;
}

export interface CropCoverageMetric {
  cropName: string;
  totalRules: number;
  diseaseRules: number;
  pestRules: number;
  etlCoveredRules: number;
  chemicalRules: number;
  phiCoveredRules: number;
  validatedRules: number;
  pendingReviewRules: number;
  conflictingRules: number;
}

export interface QualityAuditReport {
  timestamp: Date;
  totalRulesScanned: number;
  totalSourcesRegistered: number;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  findings: QualityFinding[];
  cropMetrics: Record<string, CropCoverageMetric>;
  isProductionReady: boolean;
}

export async function runKnowledgeQualityAudit(): Promise<QualityAuditReport> {
  const rules = await AgriIpmRule.find({}).lean() as IAgriIpmRule[];
  const sources = await AgriSourceRegistry.find({}).lean();

  const findings: QualityFinding[] = [];
  const ruleCodesSeen = new Set<string>();
  const cropMetrics: Record<string, CropCoverageMetric> = {};

  const priorityCrops = ['Wheat', 'Rice', 'Maize', 'Mustard', 'Chickpea', 'Cotton'];
  for (const crop of priorityCrops) {
    cropMetrics[crop] = {
      cropName: crop,
      totalRules: 0,
      diseaseRules: 0,
      pestRules: 0,
      etlCoveredRules: 0,
      chemicalRules: 0,
      phiCoveredRules: 0,
      validatedRules: 0,
      pendingReviewRules: 0,
      conflictingRules: 0,
    };
  }

  for (const rule of rules) {
    // 1. Duplicate Rule Code Check
    if (ruleCodesSeen.has(rule.ruleCode)) {
      findings.push({
        severity: 'CRITICAL',
        ruleCode: rule.ruleCode,
        issue: `Duplicate ruleCode detected in database: ${rule.ruleCode}`,
        recommendation: 'Enforce unique indexes and remove duplicate rule definitions.',
      });
    }
    ruleCodesSeen.add(rule.ruleCode);

    // 2. Missing Core Identification
    if (!rule.cropName || !rule.targetThreatName) {
      findings.push({
        severity: 'CRITICAL',
        ruleCode: rule.ruleCode,
        issue: 'Rule is missing required cropName or targetThreatName.',
        recommendation: 'Populate mandatory agronomic identifiers.',
      });
    }

    // 3. Missing Source Provenance or Page
    if (!rule.source || !rule.source.title || !rule.source.organization) {
      findings.push({
        severity: 'CRITICAL',
        ruleCode: rule.ruleCode,
        issue: 'Rule lacks verifiable source organization or title.',
        recommendation: 'Attach verified citation from ICAR, NIPHM, or CIB&RC documentation.',
      });
    } else if (!rule.source.page || rule.source.page < 1) {
      findings.push({
        severity: 'WARNING',
        ruleCode: rule.ruleCode,
        issue: 'Rule source citation lacks exact page reference number.',
        recommendation: 'Verify document page in primary source PDF/TXT.',
      });
    }

    // 4. Chemical Safety & Regulatory Exclusion Audit
    if (rule.chemicalOption && rule.chemicalOption.activeIngredient) {
      const ai = rule.chemicalOption.activeIngredient;
      const banned = checkBannedPesticide(ai);
      if (banned.isBanned) {
        if (rule.validationStatus === 'VALIDATED' || rule.isCurrent) {
          findings.push({
            severity: 'CRITICAL',
            ruleCode: rule.ruleCode,
            issue: `Validated/Active rule recommends BANNED active ingredient '${ai}': ${banned.reason}`,
            recommendation: 'Immediately revoke validation status, transition to REJECTED, and notify advisory safety gate.',
          });
        } else {
          findings.push({
            severity: 'INFO',
            ruleCode: rule.ruleCode,
            issue: `Quarantined rule (${rule.validationStatus}) correctly flags banned substance '${ai}'.`,
            recommendation: 'Maintain in REJECTED status with isCurrent=false.',
          });
        }
      }

      const cropRestricted = checkCropRestriction(ai, rule.cropName);
      if (cropRestricted.isRestricted) {
        if (rule.validationStatus === 'VALIDATED' || rule.isCurrent) {
          findings.push({
            severity: 'CRITICAL',
            ruleCode: rule.ruleCode,
            issue: `Validated/Active rule recommends chemically restricted active ingredient '${ai}' on ${rule.cropName}: ${cropRestricted.reason}`,
            recommendation: 'Transition rule to REJECTED or CONFLICTING_SOURCES.',
          });
        } else {
          findings.push({
            severity: 'INFO',
            ruleCode: rule.ruleCode,
            issue: `Quarantined rule correctly flags restricted substance '${ai}' on ${rule.cropName}.`,
            recommendation: 'Maintain in quarantine.',
          });
        }
      }

      // Check for missing PHI
      if (
        (rule.chemicalOption.waitingPeriodDays === null || rule.chemicalOption.waitingPeriodDays === undefined) &&
        rule.validationStatus === 'VALIDATED'
      ) {
        findings.push({
          severity: 'CRITICAL',
          ruleCode: rule.ruleCode,
          issue: `Validated rule has active chemical ingredient '${ai}' but lacks mandatory Pre-Harvest Interval (PHI).`,
          recommendation: 'Demote rule from VALIDATED to VALIDATION_REQUIRED until PHI is extracted from MUP.',
        });
      }
    }

    // 5. Expired or Superseded Rule Still Active
    if (rule.supersededBy && rule.isCurrent) {
      findings.push({
        severity: 'WARNING',
        ruleCode: rule.ruleCode,
        issue: 'Rule is marked supersededBy but isCurrent remains true.',
        recommendation: 'Set isCurrent to false for superseded historical versions.',
      });
    }

    // 6. Accumulate Metrics
    const matchedCropKey = priorityCrops.find(c => c.toLowerCase() === (rule.cropName || '').toLowerCase());
    if (matchedCropKey && cropMetrics[matchedCropKey]) {
      const m = cropMetrics[matchedCropKey];
      m.totalRules++;
      if (rule.threatType === 'disease') m.diseaseRules++;
      if (rule.threatType === 'pest') m.pestRules++;
      if (rule.economicThreshold) m.etlCoveredRules++;
      if (rule.chemicalOption?.activeIngredient) {
        m.chemicalRules++;
        if (rule.chemicalOption.waitingPeriodDays !== null && rule.chemicalOption.waitingPeriodDays !== undefined) {
          m.phiCoveredRules++;
        }
      }
      if (rule.validationStatus === 'VALIDATED') m.validatedRules++;
      if (rule.validationStatus === 'VALIDATION_REQUIRED') m.pendingReviewRules++;
      if (rule.validationStatus === 'CONFLICTING_SOURCES') m.conflictingRules++;
    }
  }

  const criticalIssuesCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const warningIssuesCount = findings.filter(f => f.severity === 'WARNING').length;

  return {
    timestamp: new Date(),
    totalRulesScanned: rules.length,
    totalSourcesRegistered: sources.length,
    criticalIssuesCount,
    warningIssuesCount,
    findings,
    cropMetrics,
    isProductionReady: criticalIssuesCount === 0,
  };
}
