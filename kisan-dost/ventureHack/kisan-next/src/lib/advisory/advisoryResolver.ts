import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { RiskEvent, IRiskEvent } from '@/models/RiskEvent';
import { Crop, ICrop } from '@/models/Crop';
import { FarmZone } from '@/models/FarmZone';
import { Field } from '@/models/Field';
import { AgriIpmRule, IAgriIpmRule } from '@/models/AgriIpmRule';
import { AgriAdvisory, IAgriAdvisory, IAdvisoryChemicalAction, IAdvisorySourceReference } from '@/models/AgriAdvisory';
import { validateChemicalSafety } from '@/lib/governance/regulatoryService';

export interface ResolveAdvisoryOptions {
  riskEventId: string;
  farmerId: string;
}

/**
 * AgriShield 360° — Phase 7 Advisory Resolver
 *
 * Implements deterministic, explainable, zero-hallucination agronomic advisory.
 * Consumes Phase 6 RiskEvent evidence and maps against VALIDATED agricultural IPM rules.
 * Enforces the Strict Chemical Recommendation Gate.
 */
export async function resolveAdvisoryForRiskEvent(options: ResolveAdvisoryOptions): Promise<IAgriAdvisory> {
  const { riskEventId, farmerId } = options;

  await connectDB();

  // 1. Multi-Tenant Ownership & RiskEvent Retrieval
  const riskEvent = await RiskEvent.findOne({ _id: riskEventId, farmerId });
  if (!riskEvent) {
    throw new Error('RiskEvent not found or access denied');
  }

  // 2. Crop & Spatial Hierarchy Validation
  const crop = await Crop.findOne({ _id: riskEvent.cropCycleId, farmerId });
  if (!crop) {
    throw new Error('Crop cycle not found or access denied');
  }

  // 3. Extract Agronomic Context
  const cropName = crop.cropName;
  const threatName = riskEvent.threatName || 'General Agronomic Stress';
  const riskStatus = riskEvent.riskStatus;
  const riskLevel = riskEvent.riskLevel || 'INSUFFICIENT_DATA';
  const growthStage = crop.currentStageId || 'Vegetative';
  const das = crop.currentDas ?? Math.max(0, Math.floor((Date.now() - new Date(crop.sowingDate).getTime()) / (1000 * 60 * 60 * 24)));

  // 4. Retrieve CURRENT & VALIDATED IPM Knowledge Rules (Phase 8 Governance)
  // Search by cropName and targetThreatName (case-insensitive substring)
  // Strictly EXCLUDE: UNREVIEWED, VALIDATION_REQUIRED, REJECTED, SUPERSEDED, CONFLICTING_SOURCES
  const escapedThreat = threatName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matchedRules = await AgriIpmRule.find({
    cropName: { $regex: new RegExp(`^${cropName}$`, 'i') },
    targetThreatName: { $regex: new RegExp(escapedThreat, 'i') },
    validationStatus: 'VALIDATED',
    $or: [{ isCurrent: true }, { isCurrent: { $exists: false } }],
    $and: [{ supersededBy: null }],
  }).sort({ ruleVersion: -1, createdAt: -1 }).lean() as IAgriIpmRule[];

  // Fallback: If no exact threat match, try broader crop-level validated rules
  let effectiveRules = matchedRules;
  if (effectiveRules.length === 0) {
    const partialMatch = await AgriIpmRule.find({
      cropName: { $regex: new RegExp(`^${cropName}$`, 'i') },
      validationStatus: 'VALIDATED',
      $or: [{ isCurrent: true }, { isCurrent: { $exists: false } }],
      $and: [{ supersededBy: null }],
    }).sort({ ruleVersion: -1, createdAt: -1 }).limit(2).lean() as IAgriIpmRule[];
    effectiveRules = partialMatch;
  }

  // 5. Build Structured Action Lists & Source Provenance
  const monitoringAdvice: string[] = [];
  const culturalActions: string[] = [];
  const mechanicalActions: string[] = [];
  const biologicalActions: string[] = [];
  const sourceCitations: IAdvisorySourceReference[] = [];
  const matchedRuleIds: mongoose.Types.ObjectId[] = [];

  for (const rule of effectiveRules) {
    matchedRuleIds.push(rule._id as mongoose.Types.ObjectId);
    if (rule.monitoringMethod && !monitoringAdvice.includes(rule.monitoringMethod)) {
      monitoringAdvice.push(rule.monitoringMethod);
    }
    if (rule.economicThreshold && !monitoringAdvice.includes(`ETL: ${rule.economicThreshold}`)) {
      monitoringAdvice.push(`ETL: ${rule.economicThreshold}`);
    }
    for (const c of rule.culturalControl || []) {
      if (!culturalActions.includes(c)) culturalActions.push(c);
    }
    for (const m of rule.mechanicalControl || []) {
      if (!mechanicalActions.includes(m)) mechanicalActions.push(m);
    }
    for (const b of rule.biologicalControl || []) {
      if (!biologicalActions.includes(b)) biologicalActions.push(b);
    }
    if (rule.source) {
      sourceCitations.push({
        organization: rule.source.organization,
        title: rule.source.title,
        page: rule.source.page,
      });
    }
  }

  // 6. Strict Chemical Recommendation Gate (Section 9)
  let chemicalAction: IAdvisoryChemicalAction = {
    offered: false,
    unavailabilityReason: 'No chemical treatment indicated for current risk status.',
  };

  const isHighOrCritical =
    riskStatus === 'HIGH_RISK' ||
    riskLevel === 'HIGH' ||
    riskLevel === 'CRITICAL';

  if (isHighOrCritical) {
    // Inspect candidate chemical option from validated rules
    const ruleWithChemical = effectiveRules.find((r) => r.chemicalOption && r.chemicalOption.activeIngredient);

    if (ruleWithChemical && ruleWithChemical.chemicalOption) {
      const chem = ruleWithChemical.chemicalOption;
      
      // Phase 8 Statutory Regulatory & Safety Verification (CIB&RC MUP & Banned Registry)
      const safetyCheck = validateChemicalSafety(chem, cropName, threatName);

      if (safetyCheck.isApprovedForUse && chem.dosage && chem.waitingPeriodDays && chem.activeIngredient) {
        chemicalAction = {
          offered: true,
          activeIngredient: chem.activeIngredient,
          formulation: chem.formulation || 'Standard formulation',
          dosage: chem.dosage,
          unit: chem.unit || 'g/ha',
          dilution: chem.dilution || '500 litres of water/ha',
          applicationMethod: chem.applicationMethod || 'Foliar spray',
          phiDays: chem.waitingPeriodDays,
          reiHours: chem.reEntryIntervalHours ?? 24,
          safetyPrecaution: chem.safetyPrecaution || 'Wear personal protective equipment (PPE). Avoid spray drift into water bodies.',
          unavailabilityReason: null,
        };
      } else {
        // Gated: Missing mandatory chemical safety metrics or banned/restricted
        chemicalAction = {
          offered: false,
          unavailabilityReason: safetyCheck.failureReason || 'Chemical recommendation unavailable because source data lacks verified dosage and Pre-Harvest Interval (PHI). Follow non-chemical biological and cultural measures.',
        };
      }
    } else {
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'Chemical recommendation unavailable because the source information is incomplete or has not been validated.',
      };
    }
  }

  // 7. Handle Specific Risk States (Section 12)
  let headline = '';
  let summary = '';

  switch (riskStatus) {
    case 'LOW':
    case 'NO_CONCERN':
    case 'STABLE':
      headline = `Crop Conditions Stable for ${cropName}`;
      summary = `No active pathogenic or environmental threats detected. Normal agronomic practices and routine monitoring recommended for ${growthStage} stage.`;
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'No chemical intervention warranted for stable, healthy crop conditions.',
      };
      if (monitoringAdvice.length === 0) {
        monitoringAdvice.push('Continue standard weekly field scouting during morning hours.');
      }
      break;

    case 'MODERATE':
    case 'ATTENTION':
      headline = `Preventive Attention Advised for ${threatName}`;
      summary = `Environmental conditions or crop phenology moderately favor ${threatName} development. Preventive cultural, mechanical, and biological measures recommended to prevent threshold breach.`;
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'Economic Threshold Level (ETL) not breached. Preventive non-chemical management prioritized.',
      };
      break;

    case 'HIGH_RISK':
      headline = `Action Required: Severe Risk of ${threatName}`;
      summary = `Critical threshold breached for ${threatName} during ${growthStage} stage (${das} DAS). Implement recommended interventions immediately to protect crop yield.`;
      break;

    case 'POTENTIAL_CONCERN':
      headline = `Potential Concern: Supplementary Observation Advised`;
      summary = `Initial diagnostic indicators or weather alerts suggest possible early presence of ${threatName}. Capture supplementary multi-view zone scans and inspect leaf symptoms closely before applying treatments.`;
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'Diagnosis requires confirmation through supplementary zone scouting prior to any chemical intervention.',
      };
      monitoringAdvice.unshift('Conduct targeted zone scouting; inspect 20 plants across field diagonals.');
      break;

    case 'INCONCLUSIVE':
      headline = `Inconclusive Visual Diagnosis: Rescan or Expert Review Required`;
      summary = `Diagnostic scan returned ambiguous or conflicting results. Zero-hallucination policy forbids automated treatment recommendations for unconfirmed diagnoses. Please perform a fresh multi-view scan or request agronomist review.`;
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'Automated chemical advice strictly prohibited for inconclusive diagnostic scans.',
      };
      monitoringAdvice.unshift('Perform fresh close-up foliar scans with clear daylight focus on leaf lesions.');
      break;

    case 'INSUFFICIENT_DATA':
    default:
      headline = `Insufficient Evidence for Definite Advisory`;
      const missingList = riskEvent.missingEvidence && riskEvent.missingEvidence.length > 0
        ? riskEvent.missingEvidence.join(', ')
        : 'field sensor or observation parameters';
      summary = `Advisory engine cannot evaluate complete agronomic risk due to missing evidence (${missingList}). System will not fabricate recommendations without verified inputs.`;
      chemicalAction = {
        offered: false,
        unavailabilityReason: 'Cannot prescribe chemical control when primary diagnostic or environmental evidence is missing.',
      };
      monitoringAdvice.unshift('Provide missing observation readings or submit high-resolution foliar photograph.');
      break;
  }

  // 8. Supercede Previous Active Advisories for this Crop & Threat
  await AgriAdvisory.updateMany(
    {
      cropCycleId: crop._id,
      threatName,
      isSuperseded: false,
    },
    { $set: { isSuperseded: true } }
  );

  // 9. Persist Time-Bounded AgriAdvisory
  const validFrom = new Date();
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day validity window

  const advisory = await AgriAdvisory.create({
    farmerId,
    cropCycleId: crop._id,
    fieldId: crop.fieldId,
    zoneId: riskEvent.zoneId || null,
    riskEventId: riskEvent._id,
    threatName,
    riskStatus,
    riskLevel,
    growthStage,
    das,
    advisoryHeadline: headline,
    advisorySummary: summary,
    monitoringAdvice,
    culturalActions,
    mechanicalActions,
    biologicalActions,
    chemicalAction,
    matchedRuleIds,
    sourceCitations,
    validFrom,
    validUntil,
    isSuperseded: false,
  });

  return advisory;
}
