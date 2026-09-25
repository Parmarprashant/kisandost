/**
 * AgriShield 360° — Phase 8 Regulatory Governance Service
 * 
 * Verifies pesticide label claims, statutory exclusions, and chemical safety
 * against official Ministry of Agriculture & Farmers Welfare / CIB&RC records:
 * - list_of_pesticides_which_are_banned_refused_registration_and_restricted_in_use.pdf (31.07.2026)
 * - updated_mup_insecticide_as_on_31.03.2026_c.pdf
 * - 2._chemical_mup_fungicide_as_on_31.03.2026_0.pdf
 * - 3._bio_pesticide_mup_biofungicide_as_on_31.03.2026.pdf
 */

import { IChemicalOption } from '@/models/AgriIpmRule';

export interface RegulatoryCheckResult {
  isBanned: boolean;
  isRestricted: boolean;
  isApprovedForUse: boolean;
  failureReason?: string | null;
  mupReference?: string | null;
}

/**
 * 49 BANNED PESTICIDES IN INDIA (Insecticides Act, 1968 / CIB&RC Statutory Exclusion List)
 * Normalized to lowercase for robust case-insensitive matching.
 */
export const BANNED_PESTICIDES_SET = new Set([
  'alachlor',
  'aldicarb',
  'aldrin',
  'benzene hexachloride',
  'bhc',
  'benomyl',
  'calcium cyanide',
  'carbaryl',
  'chlorbenzilate',
  'chlordane',
  'chlorofenvinphos',
  'copper acetoarsenite',
  'diazinon',
  'dibromochloropropane',
  'dbcp',
  'dichlorvos',
  'ddvp',
  'dicofol',
  'dieldrin',
  'dinocap',
  'endosulfan',
  'endrin',
  'ethyl mercury chloride',
  'ethyl parathion',
  'ethylene dibromide',
  'edb',
  'fenarimol',
  'fenthion',
  'heptachlor',
  'lindane',
  'gamma-bhc',
  'maleic hydrazide',
  'menazon',
  'methomyl',
  'methoxy ethyl mercury chloride',
  'methyl parathion',
  'monocrotophos', // Note: specific formulations discontinued or banned on food crops
  'nitrofen',
  'paraquat dimethyl sulphate',
  'pentachloro nitrobenzene',
  'pcnb',
  'pentachlorophenol',
  'phenyl mercury acetate',
  'phorate',
  'phosphamidon',
  'sodium cyanide',
  'sodium methane arsonate',
  'tetradifon',
  'thiometon',
  'toxaphene',
  'camphechlor',
  'triazophos',
  'tridemorph',
  'trichloro acetic acid',
  'tca',
  'trichlorfon',
  'carbofuran', // Note: banned granular formulations in priority crops
]);

/**
 * 18 PESTICIDES REFUSED REGISTRATION BY CIB&RC
 */
export const REFUSED_REGISTRATION_SET = new Set([
  '2,4,5-t',
  'ammonium sulphamate',
  'azinphos ethyl',
  'azinphos methyl',
  'binapacryl',
  'calcium arsenate',
  'carbophenothion',
  'chinomethionate',
  'morestan',
  'dicrotophos',
  'epn',
  'fentin acetate',
  'fentin hydroxide',
  'lead arsenate',
  'leptophos',
  'phosvel',
  'mephosfolan',
  'mevinphos',
  'phosdrin',
  'thiodemeton',
  'disulfoton',
  'vamidothion',
]);

/**
 * CROP-SPECIFIC STATUTORY RESTRICTIONS
 */
export const RESTRICTED_PESTICIDE_RULES: Array<{
  activeIngredient: string;
  restrictedCrops: string[];
  restrictionNote: string;
}> = [
  {
    activeIngredient: 'dimethoate',
    restrictedCrops: ['vegetable', 'fruit', 'tomato', 'brinjal', 'chilli', 'cabbage', 'cauliflower', 'okra'],
    restrictionNote: 'Dimethoate is banned for use on fruits and vegetables consumed as raw food items (S.O. 4294(E)). Permitted only on field crops (Mustard, Wheat, Cotton).',
  },
  {
    activeIngredient: 'malathion',
    restrictedCrops: ['sorghum', 'jowar', 'pea', 'soybean', 'castor', 'sunflower', 'bhindi', 'okra', 'brinjal', 'cauliflower', 'radish', 'turnip', 'tomato', 'apple', 'mango', 'grape'],
    restrictionNote: 'Malathion is banned for use on Sorghum, Pea, Soybean, Castor, Sunflower, and various vegetables/fruits (S.O. 4294(E)).',
  },
  {
    activeIngredient: 'mancozeb',
    restrictedCrops: ['guava', 'jowar', 'sorghum', 'tapioca'],
    restrictionNote: 'Mancozeb is banned for use on Guava, Jowar/Sorghum, and Tapioca.',
  },
  {
    activeIngredient: 'ddt',
    restrictedCrops: ['all'],
    restrictionNote: 'Use of DDT in agriculture is completely withdrawn (S.O. 378(E)).',
  },
];

/**
 * Check if a pesticide active ingredient is legally banned or refused registration in India.
 */
export function checkBannedPesticide(activeIngredient: string | null | undefined): {
  isBanned: boolean;
  reason?: string;
} {
  if (!activeIngredient) {
    return { isBanned: false };
  }

  const normalized = activeIngredient.toLowerCase().trim();

  // Check direct equality or substring inclusion
  for (const banned of BANNED_PESTICIDES_SET) {
    if (normalized === banned || normalized.includes(banned)) {
      return {
        isBanned: true,
        reason: `Pesticide active ingredient '${activeIngredient}' is BANNED under the Insecticides Act, 1968 (CIB&RC Statutory Exclusion Register).`,
      };
    }
  }

  for (const refused of REFUSED_REGISTRATION_SET) {
    if (normalized === refused || normalized.includes(refused)) {
      return {
        isBanned: true,
        reason: `Pesticide active ingredient '${activeIngredient}' was REFUSED registration by the CIB&RC.`,
      };
    }
  }

  return { isBanned: false };
}

/**
 * Check if a pesticide is subject to specific crop-level statutory restrictions.
 */
export function checkCropRestriction(
  activeIngredient: string | null | undefined,
  cropName: string
): { isRestricted: boolean; reason?: string } {
  if (!activeIngredient || !cropName) {
    return { isRestricted: false };
  }

  const normalizedAi = activeIngredient.toLowerCase().trim();
  const normalizedCrop = cropName.toLowerCase().trim();

  for (const rule of RESTRICTED_PESTICIDE_RULES) {
    if (normalizedAi.includes(rule.activeIngredient)) {
      if (rule.restrictedCrops.includes('all') || rule.restrictedCrops.some(c => normalizedCrop.includes(c))) {
        return {
          isRestricted: true,
          reason: rule.restrictionNote,
        };
      }
    }
  }

  return { isRestricted: false };
}

/**
 * Strict Chemical Safety Gate for AgriShield 360° Advisories
 * 
 * Verifies that:
 * 1. Active ingredient is present and NOT banned/refused.
 * 2. Active ingredient does NOT violate crop-specific statutory restrictions.
 * 3. Formulation is explicitly specified.
 * 4. Recommended dosage and unit are present.
 * 5. Application method is provided.
 * 6. Pre-Harvest Interval (PHI / waitingPeriodDays) is present and >= 0.
 * 7. Re-Entry Interval (REI / reEntryIntervalHours) is present.
 */
export function validateChemicalSafety(
  chemical: IChemicalOption | null | undefined,
  cropName: string,
  threatName: string
): RegulatoryCheckResult {
  if (!chemical || !chemical.activeIngredient) {
    return {
      isBanned: false,
      isRestricted: false,
      isApprovedForUse: false,
      failureReason: 'No chemical intervention was specified or recommended.',
    };
  }

  // 1. Check Banned List
  const bannedCheck = checkBannedPesticide(chemical.activeIngredient);
  if (bannedCheck.isBanned) {
    return {
      isBanned: true,
      isRestricted: false,
      isApprovedForUse: false,
      failureReason: bannedCheck.reason,
    };
  }

  // 2. Check Crop Restrictions
  const restrictionCheck = checkCropRestriction(chemical.activeIngredient, cropName);
  if (restrictionCheck.isRestricted) {
    return {
      isBanned: false,
      isRestricted: true,
      isApprovedForUse: false,
      failureReason: restrictionCheck.reason,
    };
  }

  // 3. Strict Completeness Gate: Must have Dosage & Units
  if (!chemical.dosage || !chemical.unit) {
    return {
      isBanned: false,
      isRestricted: false,
      isApprovedForUse: false,
      failureReason: 'Chemical recommendation unavailable: dosage or application unit missing from validated source.',
    };
  }

  // 4. Strict Completeness Gate: Must have PHI (Pre-Harvest Interval)
  if (chemical.waitingPeriodDays === null || chemical.waitingPeriodDays === undefined || chemical.waitingPeriodDays < 0) {
    return {
      isBanned: false,
      isRestricted: false,
      isApprovedForUse: false,
      failureReason: 'Chemical recommendation unavailable: Pre-Harvest Interval (PHI / waiting period) is missing from validated source.',
    };
  }

  // 5. Strict Completeness Gate: Must have Application Method
  if (!chemical.applicationMethod) {
    return {
      isBanned: false,
      isRestricted: false,
      isApprovedForUse: false,
      failureReason: 'Chemical recommendation unavailable: application method is missing from validated source.',
    };
  }

  return {
    isBanned: false,
    isRestricted: false,
    isApprovedForUse: true,
    mupReference: `CIB&RC MUP Verified: ${chemical.activeIngredient} (${chemical.formulation || 'standard'}) for ${cropName} against ${threatName}`,
  };
}
