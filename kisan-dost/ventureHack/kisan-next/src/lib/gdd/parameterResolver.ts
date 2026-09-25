import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import { GddParameterSet, IGddParameterSet } from '@/models/GddParameterSet';

export interface CropContext {
  cropName: string;
  icarCropId?: string;
  variety?: string;
  varietyId?: string;
  state?: string;
  district?: string;
  agroclimaticZone?: string;
  season?: string;
  sowingDate?: Date | string;
  sowingWindow?: string;
}

export type ProgressionMode = 'DYNAMIC_GDD' | 'HYBRID_DAS' | 'DAS_ONLY';

export type ResolutionStatus =
  | 'GDD_AVAILABLE'
  | 'GDD_AMBIGUOUS'
  | 'GDD_PARAMETER_CONFLICTED'
  | 'GDD_PARAMETER_PARTIAL'
  | 'NO_GDD_RECORD'
  | 'DAS_FALLBACK';

export interface ResolutionResult {
  status: ResolutionStatus;
  progressionMode: ProgressionMode;
  parameterSet: IGddParameterSet | any | null;
  parameterSetId: string | null;
  baseTemperature: number | null;
  maturityGdd: number | null;
  upperThreshold: number | null;
  reason: string;
  matchPriority: 1 | 2 | 3 | 4 | null;
  matchedCount: number;
}

// In-memory cache for fallback or offline test execution
let cachedParameterSets: any[] | null = null;

function loadLocalParameterSets(): any[] {
  if (cachedParameterSets) return cachedParameterSets;
  const candidatePaths = [
    path.resolve(process.cwd(), 'dataSet/gdd/validated/gdd_parameter_sets.json'),
    path.resolve(process.cwd(), '../dataSet/gdd/validated/gdd_parameter_sets.json'),
    path.resolve(process.cwd(), '../../dataSet/gdd/validated/gdd_parameter_sets.json'),
    path.resolve(process.cwd(), '../../../dataSet/gdd/validated/gdd_parameter_sets.json'),
    path.resolve(process.cwd(), '../../../../dataSet/gdd/validated/gdd_parameter_sets.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        cachedParameterSets = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return cachedParameterSets!;
      } catch (e) {
        console.error('Error parsing parameter sets file:', e);
      }
    }
  }
  return [];
}

// Crop name normalization helper
function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text.toLowerCase().trim().replace(/[-_.]/g, ' ').replace(/\s+/g, ' ');
}

// Standard Indian season derivation from sowing date
export function inferSeasonFromDate(dateInput?: Date | string | null): string | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1; // 1-12
  // June to October: Kharif
  if (month >= 6 && month <= 10) return 'Kharif';
  // November to February: Rabi
  if (month === 11 || month === 12 || month === 1 || month === 2) return 'Rabi';
  // March to May: Summer
  return 'Summer';
}

// Region relevance helper
export function inferRegionRelevance(state?: string | null, district?: string | null): 'GUJARAT' | 'MAHARASHTRA' | 'OTHER_INDIAN' | null {
  const normState = normalizeText(state);
  const normDistrict = normalizeText(district);

  if (normState.includes('gujarat') || normDistrict.includes('rajkot') || normDistrict.includes('junagadh') || normDistrict.includes('anand') || normDistrict.includes('jamnagar')) {
    return 'GUJARAT';
  }
  if (normState.includes('maharashtra') || normDistrict.includes('parbhani') || normDistrict.includes('solapur') || normDistrict.includes('rahuri') || normDistrict.includes('pune') || normDistrict.includes('ahmednagar')) {
    return 'MAHARASHTRA';
  }
  if (state) {
    return 'OTHER_INDIAN';
  }
  return null;
}

/**
 * Resolves the optimal GddParameterSet according to scientific priorities:
 * 1. Crop + Variety + Region + Season
 * 2. Crop + Variety + Region
 * 3. Crop + Variety (if uniquely identifiable)
 * 4. Crop + Region + Season (if representative cultivar exists)
 *
 * Strictly prevents silent choice when multiple conflicting base temperatures exist.
 */
export async function resolveGddParameters(
  context: CropContext,
  providedParameterSets?: any[]
): Promise<ResolutionResult> {
  const normCrop = normalizeText(context.cropName || context.icarCropId);
  if (!normCrop) {
    return {
      status: 'NO_GDD_RECORD',
      progressionMode: 'DAS_ONLY',
      parameterSet: null,
      parameterSetId: null,
      baseTemperature: null,
      maturityGdd: null,
      upperThreshold: null,
      reason: 'No crop name or identifier provided for GDD parameter resolution',
      matchPriority: null,
      matchedCount: 0,
    };
  }

  // 1. Fetch all candidate parameter sets for this crop
  let allSets: any[] = [];
  if (providedParameterSets && providedParameterSets.length > 0) {
    allSets = providedParameterSets;
  } else {
    try {
      await connectDB();
      const docs = await GddParameterSet.find({}).lean();
      if (docs && docs.length > 0) {
        allSets = docs;
      } else {
        allSets = loadLocalParameterSets();
      }
    } catch {
      allSets = loadLocalParameterSets();
    }
  }

  const cropCandidates = allSets.filter((ps) => {
    const psCrop = normalizeText(ps.crop?.crop_name);
    const psSci = normalizeText(ps.crop?.scientific_name);
    return psCrop === normCrop || psCrop.includes(normCrop) || normCrop.includes(psCrop) || psSci.includes(normCrop);
  });

  if (cropCandidates.length === 0) {
    return {
      status: 'NO_GDD_RECORD',
      progressionMode: 'DAS_ONLY',
      parameterSet: null,
      parameterSetId: null,
      baseTemperature: null,
      maturityGdd: null,
      upperThreshold: null,
      reason: `No validated GDD parameter sets found for crop "${context.cropName}". Falling back to physiological DAS progression.`,
      matchPriority: null,
      matchedCount: 0,
    };
  }

  const normVariety = normalizeText(context.variety || context.varietyId);
  const targetRegion = inferRegionRelevance(context.state, context.district);
  const targetSeason = context.season || inferSeasonFromDate(context.sowingDate);

  // Helper to check base temperature convergence in a set of candidates
  function checkBaseTempConvergence(sets: any[]): { isConsistent: boolean; baseTemps: number[] } {
    const validTemps = sets
      .map((s) => s.gdd_methodology?.base_temperature?.value)
      .filter((v): v is number => v !== null && v !== undefined);
    const uniqueTemps = Array.from(new Set(validTemps));
    return {
      isConsistent: uniqueTemps.length <= 1,
      baseTemps: uniqueTemps,
    };
  }

  // Helper to create resolved result from an accepted set
  function buildResolvedResult(
    selectedSet: any,
    matchPriority: 1 | 2 | 3 | 4,
    matchedCount: number,
    extraReason?: string
  ): ResolutionResult {
    const tb = selectedSet.gdd_methodology?.base_temperature?.value ?? null;
    const isReady = selectedSet.engine_readiness === 'READY_FOR_GDD_ENGINE' && tb !== null;
    const upperThreshold = selectedSet.gdd_methodology?.upper_threshold ?? null;
    const maturityGdd = selectedSet.maturity_gdd?.value ?? null;

    if (!isReady || tb === null) {
      return {
        status: 'GDD_PARAMETER_PARTIAL',
        progressionMode: 'HYBRID_DAS',
        parameterSet: selectedSet,
        parameterSetId: selectedSet.parameter_set_id,
        baseTemperature: null,
        maturityGdd,
        upperThreshold,
        reason: extraReason || `Parameter set ${selectedSet.parameter_set_id} has validated GDD stages but base temperature is omitted in literature. Operating in HYBRID_DAS mode.`,
        matchPriority,
        matchedCount,
      };
    }

    return {
      status: 'GDD_AVAILABLE',
      progressionMode: 'DYNAMIC_GDD',
      parameterSet: selectedSet,
      parameterSetId: selectedSet.parameter_set_id,
      baseTemperature: tb,
      maturityGdd,
      upperThreshold,
      reason: extraReason || `Successfully resolved parameter set ${selectedSet.parameter_set_id} (Base Temp: ${tb}°C) via Priority ${matchPriority} context matching.`,
      matchPriority,
      matchedCount,
    };
  }

  // Priority 1: Crop + Variety + Region + Season
  if (normVariety && targetRegion && targetSeason) {
    const p1Matches = cropCandidates.filter((ps) => {
      const matchVar = normalizeText(ps.variety) === normVariety || normalizeText(ps.variety).includes(normVariety);
      const matchReg = ps.region_relevance === targetRegion;
      const matchSeason = normalizeText(ps.season) === normalizeText(targetSeason);
      return matchVar && matchReg && matchSeason;
    });

    if (p1Matches.length === 1) {
      return buildResolvedResult(p1Matches[0], 1, 1);
    } else if (p1Matches.length > 1) {
      const convergence = checkBaseTempConvergence(p1Matches);
      if (convergence.isConsistent) {
        // If differing sowing dates of same trial (e.g. Onset of monsoon vs +15d), pick the first/onset or closest
        return buildResolvedResult(p1Matches[0], 1, p1Matches.length, `Matched ${p1Matches.length} sowing-treatment variants with consistent base temperature ${convergence.baseTemps[0]}°C.`);
      } else {
        return {
          status: 'GDD_PARAMETER_CONFLICTED',
          progressionMode: 'DAS_ONLY',
          parameterSet: null,
          parameterSetId: null,
          baseTemperature: null,
          maturityGdd: null,
          upperThreshold: null,
          reason: `Multiple parameter sets matched Priority 1 with conflicting base temperatures (${convergence.baseTemps.join(', ')}°C). Falling back to DAS.`,
          matchPriority: 1,
          matchedCount: p1Matches.length,
        };
      }
    }
  }

  // Priority 2: Crop + Variety + Region
  if (normVariety && targetRegion) {
    const p2Matches = cropCandidates.filter((ps) => {
      const matchVar = normalizeText(ps.variety) === normVariety || normalizeText(ps.variety).includes(normVariety);
      const matchReg = ps.region_relevance === targetRegion;
      return matchVar && matchReg;
    });

    if (p2Matches.length > 0) {
      const convergence = checkBaseTempConvergence(p2Matches);
      if (convergence.isConsistent) {
        return buildResolvedResult(p2Matches[0], 2, p2Matches.length);
      } else {
        return {
          status: 'GDD_PARAMETER_CONFLICTED',
          progressionMode: 'DAS_ONLY',
          parameterSet: null,
          parameterSetId: null,
          baseTemperature: null,
          maturityGdd: null,
          upperThreshold: null,
          reason: `Multiple parameter sets matched Variety + Region with conflicting seasonal base temperatures (${convergence.baseTemps.join(', ')}°C). Season specification required.`,
          matchPriority: 2,
          matchedCount: p2Matches.length,
        };
      }
    }
  }

  // Priority 3: Crop + Variety (if uniquely identifiable or consistent)
  if (normVariety) {
    const p3Matches = cropCandidates.filter((ps) => {
      return normalizeText(ps.variety) === normVariety || normalizeText(ps.variety).includes(normVariety);
    });

    if (p3Matches.length > 0) {
      const convergence = checkBaseTempConvergence(p3Matches);
      if (convergence.isConsistent) {
        return buildResolvedResult(p3Matches[0], 3, p3Matches.length);
      } else {
        return {
          status: 'GDD_PARAMETER_CONFLICTED',
          progressionMode: 'DAS_ONLY',
          parameterSet: null,
          parameterSetId: null,
          baseTemperature: null,
          maturityGdd: null,
          upperThreshold: null,
          reason: `Variety "${context.variety}" is evaluated across multiple regions/seasons with conflicting base temperatures (${convergence.baseTemps.join(', ')}°C). Regional context required.`,
          matchPriority: 3,
          matchedCount: p3Matches.length,
        };
      }
    }
  }

  // Priority 4: Crop + Region + Season (Representative cultivar)
  if (targetRegion && targetSeason) {
    const p4Matches = cropCandidates.filter((ps) => {
      const matchReg = ps.region_relevance === targetRegion;
      const matchSeason = normalizeText(ps.season) === normalizeText(targetSeason);
      return matchReg && matchSeason;
    });

    if (p4Matches.length > 0) {
      const convergence = checkBaseTempConvergence(p4Matches);
      if (convergence.isConsistent) {
        return buildResolvedResult(p4Matches[0], 4, p4Matches.length, `Resolved regional/seasonal representative cultivar (${p4Matches[0].variety}) with consistent base temperature ${convergence.baseTemps[0]}°C.`);
      } else {
        return {
          status: 'GDD_AMBIGUOUS',
          progressionMode: 'DAS_ONLY',
          parameterSet: null,
          parameterSetId: null,
          baseTemperature: null,
          maturityGdd: null,
          upperThreshold: null,
          reason: `Multiple representative parameter sets exist for ${targetRegion} ${targetSeason} with divergent base temperatures (${convergence.baseTemps.join(', ')}°C). Specific variety required.`,
          matchPriority: 4,
          matchedCount: p4Matches.length,
        };
      }
    }
  }

  // General check across all candidates for this crop:
  // If the crop has multiple conflicting base temperatures (e.g. Pearl Millet: 7°C, 10°C, 12°C),
  // NEVER silently pick one!
  const overallConvergence = checkBaseTempConvergence(cropCandidates);
  if (!overallConvergence.isConsistent) {
    return {
      status: 'GDD_AMBIGUOUS',
      progressionMode: 'DAS_ONLY',
      parameterSet: null,
      parameterSetId: null,
      baseTemperature: null,
      maturityGdd: null,
      upperThreshold: null,
      reason: `Crop "${context.cropName}" has ${cropCandidates.length} parameter sets with conflicting base temperatures (${overallConvergence.baseTemps.join(', ')}°C). Insufficient context (variety/region/season) to safely resolve. Falling back to physiological DAS progression.`,
      matchPriority: null,
      matchedCount: cropCandidates.length,
    };
  }

  // If ALL candidates for this crop have null base temp (e.g. Wheat, Rice, Chickpea)
  const allNull = cropCandidates.every((s) => s.gdd_methodology?.base_temperature?.value === null);
  if (allNull) {
    return {
      status: 'GDD_PARAMETER_PARTIAL',
      progressionMode: 'HYBRID_DAS',
      parameterSet: cropCandidates[0],
      parameterSetId: cropCandidates[0].parameter_set_id,
      baseTemperature: null,
      maturityGdd: cropCandidates[0].maturity_gdd?.value ?? null,
      upperThreshold: null,
      reason: `Crop "${context.cropName}" has ${cropCandidates.length} validated parameter sets, but base temperature is omitted in agrometeorological sources. Operating in HYBRID_DAS mode.`,
      matchPriority: null,
      matchedCount: cropCandidates.length,
    };
  }

  // If all candidates for this crop share the EXACT SAME base temp (e.g. Cotton 15.5°C or Castor 10.0°C)
  if (overallConvergence.baseTemps.length === 1) {
    return buildResolvedResult(
      cropCandidates[0],
      4,
      cropCandidates.length,
      `Unanimous crop base temperature (${overallConvergence.baseTemps[0]}°C) across all ${cropCandidates.length} validated parameter sets.`
    );
  }

  // Default fallback
  return {
    status: 'DAS_FALLBACK',
    progressionMode: 'DAS_ONLY',
    parameterSet: null,
    parameterSetId: null,
    baseTemperature: null,
    maturityGdd: null,
    upperThreshold: null,
    reason: `Insufficient context to uniquely match GDD parameter sets for crop "${context.cropName}". Defaulting to DAS.`,
    matchPriority: null,
    matchedCount: cropCandidates.length,
  };
}
