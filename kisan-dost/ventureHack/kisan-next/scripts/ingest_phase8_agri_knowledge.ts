import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import connectDB from '../src/lib/mongodb';
import { AgriIpmRule, IpmValidationStatus, IAgriIpmRule } from '../src/models/AgriIpmRule';
import { AgriSourceRegistry, AgriSourceType } from '../src/models/AgriSourceRegistry';
import { checkBannedPesticide, checkCropRestriction } from '../src/lib/governance/regulatoryService';

interface SourceSeed {
  sourceCode: string;
  organization: string;
  documentTitle: string;
  sourceType: AgriSourceType;
  publicationDate?: string | null;
  versionCutoff?: string | null;
  filename: string;
  pageCount?: number | null;
  isRegulatoryAuthority: boolean;
  notes?: string | null;
}

const SOURCES_TO_REGISTER: SourceSeed[] = [
  // Primary Agricultural Packages
  {
    sourceCode: 'SRC-DPPQS-WHEAT-2014',
    organization: 'DPPQS & NIPHM, Ministry of Agriculture & Farmers Welfare',
    documentTitle: 'AESA Based IPM Package - Wheat',
    sourceType: 'OFFICIAL_IPM_PACKAGE',
    publicationDate: '2014',
    filename: 'Wheat.pdf',
    pageCount: 83,
    isRegulatoryAuthority: false,
    notes: 'Primary national operating procedure for wheat IPM.',
  },
  {
    sourceCode: 'SRC-NCIPM-RICE-2014',
    organization: 'NCIPM & DPPQS, Ministry of Agriculture & Farmers Welfare',
    documentTitle: 'Integrated Pest Management Package for Rice',
    sourceType: 'OFFICIAL_IPM_PACKAGE',
    publicationDate: '2014',
    filename: 'Rice.pdf',
    pageCount: 53,
    isRegulatoryAuthority: false,
    notes: 'Primary national operating procedure for paddy/rice IPM.',
  },
  {
    sourceCode: 'SRC-NCIPM-MAIZE-2014',
    organization: 'NCIPM & DPPQS, Ministry of Agriculture & Farmers Welfare',
    documentTitle: 'Integrated Pest Management Package for Maize',
    sourceType: 'OFFICIAL_IPM_PACKAGE',
    publicationDate: '2014',
    filename: 'Maize.pdf',
    pageCount: 56,
    isRegulatoryAuthority: false,
    notes: 'Primary national operating procedure for maize IPM.',
  },
  {
    sourceCode: 'SRC-NIPHM-MUSTARD-2014',
    organization: 'NIPHM & DPPQS, Ministry of Agriculture & Farmers Welfare',
    documentTitle: 'AESA Based IPM Package - Mustard / Rapeseed',
    sourceType: 'OFFICIAL_IPM_PACKAGE',
    publicationDate: '2014',
    filename: 'Mustard.pdf',
    pageCount: 59,
    isRegulatoryAuthority: false,
    notes: 'Primary national operating procedure for mustard & rapeseed IPM.',
  },
  {
    sourceCode: 'SRC-NCIPM-CHICKPEA-2014',
    organization: 'NCIPM & DPPQS, Ministry of Agriculture & Farmers Welfare',
    documentTitle: 'Integrated Pest Management for Chickpea',
    sourceType: 'OFFICIAL_IPM_PACKAGE',
    publicationDate: '2014',
    filename: 'Chickpea.pdf',
    pageCount: 56,
    isRegulatoryAuthority: false,
    notes: 'Primary national operating procedure for chickpea/gram pulse IPM.',
  },
  {
    sourceCode: 'SRC-GIZ-MANAGE-FARMERBOOK-2014',
    organization: 'GIZ & MANAGE, Hyderabad',
    documentTitle: "Farmer's Handbook on Basic Agriculture",
    sourceType: 'EXTENSION_MANUAL',
    publicationDate: '2014',
    filename: 'farmerbook.pdf',
    pageCount: 154,
    isRegulatoryAuthority: false,
    notes: 'Extension training manual for basic agronomic principles.',
  },

  // Historical Literature
  {
    sourceCode: 'SRC-MUKERJI-HANDBOOK-1915',
    organization: 'Sibpur Agricultural College, Thacker Spink & Co, Calcutta',
    documentTitle: 'Handbook of Indian Agriculture (3rd Edition)',
    sourceType: 'HISTORICAL_TREATISE',
    publicationDate: '1915',
    filename: '353268719-Handbook-of-Indian-Agriculture-1000064340.txt',
    pageCount: null,
    isRegulatoryAuthority: false,
    notes: 'Historical Indian agriculture treatise by Nitya Gopal Mukerji. NON-REGULATORY.',
  },

  // Central Regulatory Registries (CIB&RC / DPPQS)
  {
    sourceCode: 'SRC-CIBRC-INSECTICIDE-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Approved Uses of Registered Insecticides (Major Uses of Pesticides)',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: 'updated_mup_insecticide_as_on_31.03.2026_c.pdf',
    pageCount: 109,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for agricultural insecticides.',
  },
  {
    sourceCode: 'SRC-CIBRC-FUNGICIDE-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Major Uses of Pesticides - Fungicides Single Product Formulations Use',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: '2._chemical_mup_fungicide_as_on_31.03.2026_0.pdf',
    pageCount: 83,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for agricultural fungicides.',
  },
  {
    sourceCode: 'SRC-CIBRC-BIOFUNGICIDE-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Major Uses of Bio-Pesticides - Major Uses of Bio-Fungicides',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: '3._bio_pesticide_mup_biofungicide_as_on_31.03.2026.pdf',
    pageCount: 20,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for bio-fungicides.',
  },
  {
    sourceCode: 'SRC-CIBRC-HERBICIDE-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Approved Uses of Registered Herbicides',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: '4._herbicides_mup_as_on_31.03.2026.pdf',
    pageCount: 76,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for weedicides/herbicides.',
  },
  {
    sourceCode: 'SRC-CIBRC-PGR-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Approved Uses of Registered Plant Growth Regulators (PGR)',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: '5._pgr_mup_as_on_31.03.2026.pdf',
    pageCount: 13,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for PGR formulations.',
  },
  {
    sourceCode: 'SRC-CIBRC-BIOINSECTICIDE-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Major Uses of Bio-Insecticides',
    sourceType: 'REGULATORY_MUP',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: '6._mup_bio_insecticide_31.03.2026.pdf',
    pageCount: 19,
    isRegulatoryAuthority: true,
    notes: 'Statutory label claims for bio-insecticides.',
  },
  {
    sourceCode: 'SRC-CIBRC-BANNED-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'List of Pesticides Which Are Banned, Refused Registration and Restricted in Use',
    sourceType: 'REGULATORY_STATUTE',
    publicationDate: '2026',
    versionCutoff: '31.07.2026',
    filename: 'list_of_pesticides_which_are_banned_refused_registration_and_restricted_in_use.pdf',
    pageCount: 6,
    isRegulatoryAuthority: true,
    notes: 'Statutory exclusion list: 49 banned, 18 refused, 14 restricted pesticides.',
  },
  {
    sourceCode: 'SRC-CIBRC-FORMULATIONS-2026',
    organization: 'Central Insecticide Board & Registration Committee (CIB&RC), DPPQS',
    documentTitle: 'Pesticide Formulations Registered for Use in the Country Under the Insecticides Act, 1968',
    sourceType: 'REGULATORY_STATUTE',
    publicationDate: '2026',
    versionCutoff: '31.03.2026',
    filename: 'list_pf_pesticide_formulations_registered_as_on_31.03.2026.pdf',
    pageCount: 28,
    isRegulatoryAuthority: true,
    notes: 'Registered formulation codes and concentrations.',
  },
  {
    sourceCode: 'SRC-CIBRC-RC476-2026',
    organization: 'Registration Committee, CIB&RC, DAC&FW',
    documentTitle: 'Minutes of 476th Registration Committee Meeting',
    sourceType: 'REGULATORY_STATUTE',
    publicationDate: '10.09.2026',
    versionCutoff: '10.09.2026',
    filename: '476th RC MOM.pdf',
    pageCount: 191,
    isRegulatoryAuthority: true,
    notes: 'Meeting minutes of 476th RC under Chairman Dr. P.K. Singh.',
  },
];

/**
 * Expanded IPM Knowledge Rules covering gaps across priority crops,
 * cross-referenced against CIB&RC MUP approved formulations, dosage, and PHI.
 */
const EXPANDED_RULES: any[] = [
  // ─── WHEAT EXTENSIONS ──────────────────────────────────────────────
  {
    ruleCode: 'IPM-WHEAT-LSMUT-01',
    cropName: 'Wheat',
    icarCropId: 'wheat',
    targetThreatName: 'Loose Smut',
    threatType: 'disease',
    applicableStages: ['Heading', 'Booting', 'Seedling'],
    symptoms: [
      'Entire spikelet converted into a loose dark black olive powder of chlamydospores',
      'Early flowering of infected ears protruding above the healthy canopy',
      'Awns and glumes completely destroyed leaving a bare rachis',
    ],
    riskConditions: [
      'Humid cloudy weather during anthesis of seed parent crop',
      'Temperatures between 16-22°C during heading',
    ],
    monitoringMethod: 'Inspect seed crop during ear emergence; look for premature black smutted heads.',
    economicThreshold: 'Presence of any smutted earhead in seed production plot.',
    culturalControl: [
      'Solar heat treatment of seed during hot summer months (May-June).',
      'Rogue out and carefully bag infected smutted heads before spore dispersion.',
      'Sow certified disease-free foundation seed.',
    ],
    mechanicalControl: [
      'Hand pull and burn infected spikes inside polyethylene bags to prevent airborne spore drift.',
    ],
    biologicalControl: [
      'Seed bio-priming with Trichoderma harzianum @ 10 g/kg seed.',
    ],
    chemicalOption: {
      activeIngredient: 'Carboxin',
      formulation: '75% WP',
      dosage: '2.5',
      unit: 'g/kg seed',
      dilution: 'Slurry with 10 ml water/kg seed',
      applicationMethod: 'Seed treatment prior to sowing',
      waitingPeriodDays: 90,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Treated seed must not be used for food, feed, or oil purposes.',
    },
    source: {
      organization: 'DPPQS & NIPHM',
      title: 'AESA Based IPM Package - Wheat',
      page: 33,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-DPPQS-WHEAT-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },
  {
    ruleCode: 'IPM-WHEAT-APHID-01',
    cropName: 'Wheat',
    icarCropId: 'wheat',
    targetThreatName: 'Wheat Aphid',
    threatType: 'pest',
    applicableStages: ['Booting', 'Heading', 'Grain Filling'],
    symptoms: [
      'Colonies of green-yellow aphids clustering on emerging earheads and flag leaves',
      'Sticky honeydew secretion on leaves encouraging black sooty mold growth',
      'Premature shriveling and yellowing of developing grains',
    ],
    riskConditions: [
      'Overcast cloudy weather with high relative humidity (>75%) during February-March',
      'Temperatures ranging from 15°C to 24°C',
    ],
    monitoringMethod: 'Count aphids on 20 randomly selected tillers/earheads across 5 field quadrants weekly.',
    economicThreshold: '5 aphids per earhead during booting/heading stage.',
    culturalControl: [
      'Timely sowing by third week of November to escape peak aphid migration.',
      'Balanced nitrogen fertilization; avoid luxury nitrogen application.',
      'Install yellow sticky traps @ 15-20 traps/ha.',
    ],
    mechanicalControl: [
      'Remove and destroy initial infested border plants.',
    ],
    biologicalControl: [
      'Conserve natural predators: ladybird beetle (Coccinella septempunctata) and Syrphid fly larvae.',
      'Spray Verticillium lecanii bio-formulation @ 1 kg/ha during high humidity.',
    ],
    chemicalOption: {
      activeIngredient: 'Dimethoate',
      formulation: '30% EC',
      dosage: '660',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray when aphids breach ETL of 5 aphids/earhead',
      waitingPeriodDays: 14,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Wear PPE. Do not spray during peak bee foraging hours.',
    },
    source: {
      organization: 'DPPQS & NIPHM',
      title: 'AESA Based IPM Package - Wheat',
      page: 25,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-DPPQS-WHEAT-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },

  // ─── RICE EXTENSIONS ───────────────────────────────────────────────
  {
    ruleCode: 'IPM-RICE-YSB-01',
    cropName: 'Rice',
    icarCropId: 'rice',
    targetThreatName: 'Yellow Stem Borer',
    threatType: 'pest',
    applicableStages: ['Tillering', 'Panicle Initiation', 'Flowering'],
    symptoms: [
      'Dead hearts (drying of central tiller shoot) in vegetative phase',
      'White earheads (empty, chaffy, erect panicles) in reproductive phase',
      'Tiny exit holes and brown frass at the base of the stem',
    ],
    riskConditions: [
      'Warm humid weather with temperatures between 25-32°C and RH >80%',
      'Stagnant water and excessive vegetative nitrogen application',
    ],
    monitoringMethod: 'Install sex pheromone traps @ 8 traps/ha; record daily moth catch.',
    economicThreshold: '1 egg mass/m² or 5% dead hearts at vegetative stage; 1 moth/trap/day.',
    culturalControl: [
      'Clip off the tips of rice seedlings before transplanting to eliminate egg masses.',
      'Avoid continuous deep ponding of water; practice alternate wetting and drying (AWD).',
      'Synchronize planting within a 15-day window across the farming cluster.',
    ],
    mechanicalControl: [
      'Collect and destroy egg masses and stubbles after harvest.',
    ],
    biologicalControl: [
      'Release Trichogramma japonicum egg parasitoids @ 1,00,000/ha weekly, 3 times from 30 DAT.',
      'Conserve dragonflies, damselflies, and wolf spiders in the paddy ecosystem.',
    ],
    chemicalOption: {
      activeIngredient: 'Chlorantraniliprole',
      formulation: '0.4% GR',
      dosage: '10',
      unit: 'kg/ha',
      dilution: 'Direct broadcast into standing water (2-3 cm)',
      applicationMethod: 'Soil broadcast with standing water layer',
      waitingPeriodDays: 21,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Do not drain field water for 48 hours after granule broadcast.',
    },
    source: {
      organization: 'NCIPM & DPPQS',
      title: 'Integrated Pest Management Package for Rice',
      page: 15,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-RICE-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },
  {
    ruleCode: 'IPM-RICE-SHBLIGHT-01',
    cropName: 'Rice',
    icarCropId: 'rice',
    targetThreatName: 'Sheath Blight',
    threatType: 'disease',
    applicableStages: ['Tillering', 'Panicle Initiation', 'Flowering'],
    symptoms: [
      'Greenish-gray oval water-soaked lesions on leaf sheaths near the waterline',
      'Lesions enlarge with bleached whitish centers and irregular brownish borders',
      'White cottony mycelial growth and small mustard seed-like dark brown sclerotia on infected tissue',
    ],
    riskConditions: [
      'High relative humidity (>85%) and temperature between 28-32°C',
      'Dense planting canopy and high nitrogen doses',
    ],
    monitoringMethod: 'Examine 20 hills along a zig-zag transect; assess lesions moving up from base.',
    economicThreshold: '5% of hills showing sheath blight lesions at tillering to panicle initiation.',
    culturalControl: [
      'Maintain wider spacing (20 x 15 cm) to improve light penetration and air aeration.',
      'Split nitrogen application into 3-4 splits; apply potash in 2 splits.',
      'Remove weed hosts (Echinochloa, Cyperus) along bunds and canals.',
    ],
    mechanicalControl: [
      'Skim off floating sclerotia from surface of flooded field during puddling.',
    ],
    biologicalControl: [
      'Foliar spray with Pseudomonas fluorescens @ 2.5 kg/ha in 500 L water.',
    ],
    chemicalOption: {
      activeIngredient: 'Hexaconazole',
      formulation: '5% SC',
      dosage: '1000',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Targeted spray directing nozzle at lower stem base and leaf sheaths',
      waitingPeriodDays: 30,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Ensure thorough coverage of lower leaf sheaths; wear protective goggles.',
    },
    source: {
      organization: 'NCIPM & DPPQS',
      title: 'Integrated Pest Management Package for Rice',
      page: 29,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-RICE-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },

  // ─── MAIZE EXTENSIONS ──────────────────────────────────────────────
  {
    ruleCode: 'IPM-MAIZE-STEMBORER-01',
    cropName: 'Maize',
    icarCropId: 'maize',
    targetThreatName: 'Maize Stem Borer',
    threatType: 'pest',
    applicableStages: ['Seedling', 'Knee High', 'Tasseling'],
    symptoms: [
      'Parallel shot holes or pinholes on unfolded whorl leaves',
      'Dead hearts formed by larva feeding inside the growing shoot apex',
      'Bore holes with brown coarse frass on the stalk and peduncle',
    ],
    riskConditions: [
      'Dry spells with temperatures 26-32°C during early crop establishment',
      'Monoculture of susceptible maize hybrids',
    ],
    monitoringMethod: 'Inspect 100 plants along field diagonals weekly from 10 days after germination.',
    economicThreshold: '10% of plants showing pinholes or dead heart symptoms.',
    culturalControl: [
      'Intercrop with cowpea or soybean (2:1 ratio) to divert oviposition.',
      'Sow clean, healthy seed immediately after monsoon onset.',
      'Uproot and destroy dead hearts to kill larvae inside.',
    ],
    mechanicalControl: [
      'Apply light pinch of dry fine sand into whorls to kill early instar larvae physically.',
    ],
    biologicalControl: [
      'Release Trichogramma chilonis @ 1,75,000/ha starting from 15 DAS, twice at 7-day intervals.',
    ],
    chemicalOption: {
      activeIngredient: 'Chlorantraniliprole',
      formulation: '18.5% SC',
      dosage: '200',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Directed whorl application using knapsack sprayer with nozzle directed downward',
      waitingPeriodDays: 14,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Banned granular chemicals (Phorate, Carbofuran) strictly prohibited. Apply safe liquid whorl spray.',
    },
    source: {
      organization: 'NCIPM & DMR, New Delhi',
      title: 'Integrated Pest Management Package for Maize',
      page: 21,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-MAIZE-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },
  {
    ruleCode: 'IPM-MAIZE-TLB-01',
    cropName: 'Maize',
    icarCropId: 'maize',
    targetThreatName: 'Turcicum Leaf Blight',
    threatType: 'disease',
    applicableStages: ['Knee High', 'Tasseling', 'Silking'],
    symptoms: [
      'Long elliptical spindle-shaped grayish-green to tan necrotic lesions (2.5 - 15 cm)',
      'Lesions showing dark concentric rings or olive-green velvety fungal sporulation in damp weather',
      'Lower leaves blight prematurely, advancing rapidly upward to ear leaves',
    ],
    riskConditions: [
      'Moderate temperatures (18-27°C) accompanied by heavy dew, fog, or frequent rain',
      'High relative humidity (>80%) during vegetative growth',
    ],
    monitoringMethod: 'Monitor lower leaves weekly; score percentage of leaf area affected.',
    economicThreshold: '1-2 distinct spindle lesions per leaf on lower leaves prior to silking.',
    culturalControl: [
      'Grow resistant or tolerant commercial hybrids.',
      'Practice crop rotation with non-host legumes or brassicas.',
      'Plough down infected crop residues deeply immediately after harvest.',
    ],
    mechanicalControl: [
      'Rogue out heavily blighted bottom leaves to prevent vertical spore climb.',
    ],
    biologicalControl: [
      'Seed bio-priming with Trichoderma viride @ 10 g/kg seed.',
    ],
    chemicalOption: {
      activeIngredient: 'Mancozeb',
      formulation: '75% WP',
      dosage: '1.5',
      unit: 'kg/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray upon first appearance of lower leaf lesions',
      waitingPeriodDays: 21,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Wear protective coverall. Do not spray during windy conditions.',
    },
    source: {
      organization: 'NCIPM & DMR, New Delhi',
      title: 'Integrated Pest Management Package for Maize',
      page: 31,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-MAIZE-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },

  // ─── MUSTARD EXTENSIONS ────────────────────────────────────────────
  {
    ruleCode: 'IPM-MUSTARD-ALT-01',
    cropName: 'Mustard',
    icarCropId: 'mustard',
    targetThreatName: 'Alternaria Blight',
    threatType: 'disease',
    applicableStages: ['Vegetative', 'Flowering', 'Pod Development'],
    symptoms: [
      'Small dark brown to black circular spots with concentric target-like rings on lower leaves',
      'Lesions coalesce causing leaf blighting, defoliation, and stem collapse',
      'Linear dark sunken spots on pods (siliquae), causing premature splitting and shriveled seed',
    ],
    riskConditions: [
      'Cool moist weather (15-25°C) with morning fog and relative humidity >75%',
      'Intermittent drizzle or overcast conditions in January-February',
    ],
    monitoringMethod: 'Observe 20 plants per acre weekly; inspect lower leaves and emerging siliquae.',
    economicThreshold: '2% pod area covered with Alternaria spots, or 5-10% leaf area infected.',
    culturalControl: [
      'Timely sowing by mid-October to complete pod-filling before peak January fog.',
      'Maintain wide row spacing (45 x 15 cm) to facilitate morning drying of foliage.',
      'Avoid excess flood irrigation during flowering and pod development.',
    ],
    mechanicalControl: [
      'Collect and destroy infected crop residues and weeds after harvest.',
    ],
    biologicalControl: [
      'Foliar spray with Trichoderma harzianum @ 2 kg/ha during early cloudy periods.',
    ],
    chemicalOption: {
      activeIngredient: 'Mancozeb',
      formulation: '75% WP',
      dosage: '1.5',
      unit: 'kg/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray at first appearance of target spots on leaves',
      waitingPeriodDays: 21,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Ensure uniform spray coverage including pods; repeat after 15 days if rain persists.',
    },
    source: {
      organization: 'NIPHM & DRMR, Bharatpur',
      title: 'AESA Based IPM Package - Mustard / Rapeseed',
      page: 28,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NIPHM-MUSTARD-2014',
    ruleVersion: 1,
    validationStatus: 'VALIDATED',
  },

  {
    ruleCode: 'IPM-MUSTARD-PBUG-01',
    cropName: 'Mustard',
    icarCropId: 'mustard',
    targetThreatName: 'Painted Bug',
    threatType: 'pest',
    applicableStages: ['Seedling', 'Pod Development'],
    symptoms: [
      'Adults and nymphs suck sap from leaves and pods, resulting in yellow spots and wilting',
      'Seedlings dry up and wither, giving a burnt appearance to patches of the field',
      'Pods show bleached spots with impoverished and shriveled grains',
    ],
    riskConditions: [
      'Warm and dry post-monsoon weather in October-November and March',
    ],
    monitoringMethod: 'Count nymphs and adults along 1 meter row length in morning hours.',
    economicThreshold: '2 bugs per meter row length or 1 bug per seedling.',
    culturalControl: [
      'Give light irrigation 3-4 weeks after sowing to minimize nymph survival.',
      'Maintain weed-free field borders to eliminate alternate hosts.',
    ],
    mechanicalControl: [
      'Hand pick and destroy bugs in water mixed with small quantity of kerosene in early morning.',
    ],
    biologicalControl: [
      'Conserve natural predators such as reduviid bugs and ground spiders.',
    ],
    chemicalOption: {
      activeIngredient: 'Dimethoate',
      formulation: '30% EC',
      dosage: '660',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray during afternoon hours when pollinators are absent',
      waitingPeriodDays: 20,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Statutory approved on mustard (banned on raw vegetables). Spray in afternoon to protect honeybees.',
    },
    source: {
      organization: 'NIPHM & DRMR, Bharatpur',
      title: 'AESA Based IPM Package - Mustard / Rapeseed',
      page: 19,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NIPHM-MUSTARD-2014',
    ruleVersion: 1,
    isCurrent: true,
    validationStatus: 'VALIDATED',
  },

  // ─── CHICKPEA EXTENSIONS ───────────────────────────────────────────
  {
    ruleCode: 'IPM-CHICKPEA-ASCO-01',
    cropName: 'Chickpea',
    icarCropId: 'chickpea',
    targetThreatName: 'Ascochyta Blight',
    threatType: 'disease',
    applicableStages: ['Vegetative', 'Flowering', 'Podding'],
    symptoms: [
      'Circular brown spots on leaves with concentric rings containing tiny black dots (pycnidia)',
      'Dark elongated sunken girdling lesions on stems causing terminal branches to snap',
      'Circular sunken dark lesions on pods leading to infected, shriveled, discolored seeds',
    ],
    riskConditions: [
      'Cool temperatures (15-20°C) with continuous wet rainy weather or high humidity (>85%)',
      'Dense canopy with prolonged leaf wetness',
    ],
    monitoringMethod: 'Examine field along diagonals after winter rain events; inspect stem joints.',
    economicThreshold: 'Appearance of initial blight lesion patches in the field during cool cloudy weather.',
    culturalControl: [
      'Use certified disease-free foundation seed.',
      'Intercrop with wheat, barley, or mustard in 4:2 ratio.',
      'Rotate crops for at least 3 years with non-legumes.',
    ],
    mechanicalControl: [
      'Rogue out and bury initial infected plant foci showing stem breakage.',
    ],
    biologicalControl: [
      'Seed treatment with Trichoderma viride @ 4 g/kg seed before sowing.',
    ],
    chemicalOption: {
      activeIngredient: 'Chlorothalonil',
      formulation: '75% WP',
      dosage: '1.5',
      unit: 'kg/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray immediately following unseasonal winter rainfall',
      waitingPeriodDays: 14,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Wear protective coveralls and face mask. Avoid spraying near apiaries.',
    },
    source: {
      organization: 'NCIPM & IIPR, Kanpur',
      title: 'Integrated Pest Management for Chickpea',
      page: 32,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-CHICKPEA-2014',
    ruleVersion: 1,
    isCurrent: true,
    validationStatus: 'VALIDATED',
  },
  {
    ruleCode: 'IPM-CHICKPEA-DRROT-01',
    cropName: 'Chickpea',
    icarCropId: 'chickpea',
    targetThreatName: 'Dry Root Rot',
    threatType: 'disease',
    applicableStages: ['Flowering', 'Podding'],
    symptoms: [
      'Sudden drying of plants in patches during reproductive growth; leaves turn straw colored without drooping',
      'Tap root becomes dark, brittle, and completely shredded with absence of lateral roots',
      'Minute dark sclerotial bodies visible under the shredded root bark',
    ],
    riskConditions: [
      'High ambient and soil temperatures (>30°C) coupled with severe moisture stress at podding',
    ],
    monitoringMethod: 'Observe patches of straw-colored dried plants; split roots vertically.',
    economicThreshold: 'Initial appearance of drying plant patches under moisture stress.',
    culturalControl: [
      'Timely sowing to ensure grain development completes before high temperatures in March.',
      'Maintain adequate soil moisture during flowering and pod development through light irrigation.',
      'Deep summer ploughing and 3-year crop rotation with cereals.',
    ],
    mechanicalControl: [
      'Uproot and burn dried plants to prevent sclerotial accumulation in soil.',
    ],
    biologicalControl: [
      'Seed treatment with Trichoderma viride @ 4 g/kg seed before sowing.',
    ],
    chemicalOption: null, // STRICT GATE: Standing crop foliar chemical cure does not exist for soil-borne root rot
    source: {
      organization: 'NCIPM & IIPR, Kanpur',
      title: 'Integrated Pest Management for Chickpea',
      page: 35,
      publicationDate: '2014',
    },
    sourceRegistryCode: 'SRC-NCIPM-CHICKPEA-2014',
    ruleVersion: 1,
    isCurrent: true,
    validationStatus: 'VALIDATED',
  },

  // ─── HISTORICAL KNOWLEDGE TREATISE (MUKERJI 1915) ───────────────────
  {
    ruleCode: 'IPM-HIST-RICE-CULT-01',
    cropName: 'Rice',
    icarCropId: 'rice',
    targetThreatName: 'Paddy Weed & Water Stress Management',
    threatType: 'abiotic',
    applicableStages: ['Tillering', 'Vegetative'],
    symptoms: [
      'Stunted yellowing tillers competing with aggressive sedges and grass weeds',
      'Algal scum clogging root aeration in stagnant poorly drained paddy basins',
    ],
    riskConditions: [
      'Stagnant uncirculated drainage water combined with heavy silting',
    ],
    monitoringMethod: 'Field inspection of water circulation and weed cover between rice hills.',
    economicThreshold: 'Weed cover exceeding 15% of inter-row surface.',
    culturalControl: [
      'Controlled periodic draining of standing water to aerate root zone (historical AWD principle).',
      'Inter-cultivation with hand hoes (bida / rake) during 3rd and 5th weeks after sowing.',
      'Careful preservation of bund contours to prevent unseasonal water rushing.',
    ],
    mechanicalControl: [
      'Hand weeding and pressing weeds into muddy soil layer to act as green manure.',
    ],
    biologicalControl: [
      'Green manuring with Sesbania (Dhaincha) prior to puddling.',
    ],
    chemicalOption: null, // Historical source: chemical option explicitly withheld
    source: {
      organization: 'Sibpur Agricultural College, Thacker Spink & Co',
      title: 'Handbook of Indian Agriculture (3rd Edition)',
      page: 164,
      publicationDate: '1915',
    },
    sourceRegistryCode: 'SRC-MUKERJI-HANDBOOK-1915',
    ruleVersion: 1,
    isCurrent: true,
    validationStatus: 'VALIDATED',
    validationNotes: 'Historical cultural baseline extracted from Chapter XXIV (Rice). Modern chemical recommendations superseded.',
  },

  // ─── GOVERNANCE QUARANTINE CANDIDATES (DEMONSTRATION & SAFETY) ─────
  {
    ruleCode: 'IPM-CANDIDATE-BANNED-01',
    cropName: 'Mustard',
    icarCropId: 'mustard',
    targetThreatName: 'Mustard Sawfly',
    threatType: 'pest',
    applicableStages: ['Seedling'],
    symptoms: [
      'Seedling leaves skeletonized with circular holes cut along margins by black cylindrical grubs',
    ],
    riskConditions: [
      'Dry warm post-monsoon weather in October',
    ],
    culturalControl: [
      'Summer deep ploughing to expose pupae to predatory birds.',
    ],
    mechanicalControl: [
      'Hand pick and destroy early morning grubs in kerosene-water.',
    ],
    biologicalControl: [
      'Conserve insectivorous birds.',
    ],
    chemicalOption: {
      activeIngredient: 'Endosulfan', // BANNED PESTICIDE
      formulation: '35% EC',
      dosage: '1000',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray',
      waitingPeriodDays: 21,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'BANNED SUBSTANCE.',
    },
    source: {
      organization: 'Archaic Historical Extract',
      title: 'Obsolete Field Guide',
      page: 12,
      publicationDate: '1998',
    },
    sourceRegistryCode: 'SRC-CIBRC-BANNED-2026',
    ruleVersion: 1,
    isCurrent: false,
    validationStatus: 'REJECTED',
    validationNotes: 'QUARANTINE TRIGGERED: Endosulfan is banned by the Supreme Court of India & CIB&RC. Must never be exposed to farmers.',
  },
  {
    ruleCode: 'IPM-CANDIDATE-CONFLICT-01',
    cropName: 'Wheat',
    icarCropId: 'wheat',
    targetThreatName: 'Powdery Mildew',
    threatType: 'disease',
    applicableStages: ['Tillering', 'Heading'],
    symptoms: [
      'White powdery superficial fungal patches on lower leaf surface and stems',
    ],
    riskConditions: [
      'Cool cloudy humid conditions with low sunlight intensity',
    ],
    culturalControl: [
      'Avoid high plant density and excessive nitrogen.',
    ],
    mechanicalControl: [
      'Clip infected lower leaves.',
    ],
    biologicalControl: [
      'Spray Ampelomyces quisqualis bio-fungicide.',
    ],
    chemicalOption: {
      activeIngredient: 'Sulfur',
      formulation: '80% WP',
      dosage: '3.0',
      unit: 'kg/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray',
      waitingPeriodDays: null, // MISSING PHI
      reEntryIntervalHours: null,
      safetyPrecaution: 'Conflicting dosage recommendations between historical text (5 kg) and CIB&RC (2.5 kg).',
    },
    source: {
      organization: 'Cross-Source Synthesis',
      title: 'Wheat Protection Compendium',
      page: 45,
      publicationDate: '2020',
    },
    sourceRegistryCode: 'SRC-DPPQS-WHEAT-2014',
    ruleVersion: 1,
    validationStatus: 'CONFLICTING_SOURCES',
    conflictDetails: 'Dosage discrepancy and missing verified Pre-Harvest Interval (PHI) under review.',
    validationNotes: 'Held at CONFLICTING_SOURCES until dosage harmonization by human agronomist.',
  },
];

async function ingestPhase8() {
  console.log('================================================================');
  console.log('🏛️  AGRISHIELD 360° — PHASE 8 KNOWLEDGE GOVERNANCE & ETL INGESTION');
  console.log('================================================================\n');

  await connectDB();

  // 1. Audit Files in Temp-data
  const tempDir = path.resolve(process.cwd(), '..', '..', '..', 'Temp-data');
  let duplicateCount = 0;
  let primaryCount = 0;

  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    console.log(`📁 Scanning Temp-data directory (${files.length} total files):`);
    
    for (const f of files) {
      if (f.endsWith('1.pdf')) {
        duplicateCount++;
        console.log(`   ⛔ EXCLUDED DUPLICATE: ${f} (ignored per Section 2 duplicate rule)`);
      } else if (f.endsWith('.pdf') || f.endsWith('.txt')) {
        primaryCount++;
        console.log(`   ✅ PRIMARY SOURCE:     ${f}`);
      }
    }
    console.log(`\n📊 Inventory Summary: ${primaryCount} primary sources processed, ${duplicateCount} duplicate files safely excluded.\n`);
  }

  // 2. Register Sources in AgriSourceRegistry
  console.log('📋 Registering Primary Agricultural & Regulatory Sources in DB...');
  let sourcesRegistered = 0;

  for (const src of SOURCES_TO_REGISTER) {
    const existing = await AgriSourceRegistry.findOne({ sourceCode: src.sourceCode });
    const payload = {
      ...src,
      filePath: path.join('Temp-data', src.filename),
      fileSizeBytes: 1000000, // standard placeholder for audit
      isActive: true,
    };

    if (existing) {
      await AgriSourceRegistry.updateOne({ sourceCode: src.sourceCode }, { $set: payload });
    } else {
      await AgriSourceRegistry.create(payload);
    }
    sourcesRegistered++;
  }
  console.log(`✅ Registered / Refreshed ${sourcesRegistered} official sources in AgriSourceRegistry.\n`);

  // 3. Ingest Expanded IPM Rules
  console.log('🌱 Ingesting / Synchronizing Expanded IPM Knowledge Rules...');
  let inserted = 0;
  let updated = 0;
  let validated = 0;
  let quarantined = 0;

  for (const rule of EXPANDED_RULES) {
    // Perform automated chemical safety verification before seeding
    if (rule.chemicalOption?.activeIngredient) {
      const banCheck = checkBannedPesticide(rule.chemicalOption.activeIngredient);
      if (banCheck.isBanned && rule.validationStatus !== 'REJECTED') {
        rule.validationStatus = 'REJECTED';
        rule.validationNotes = `AUTO-QUARANTINE: ${banCheck.reason}`;
      }
    }

    const existing = await AgriIpmRule.findOne({ ruleCode: rule.ruleCode });
    if (existing) {
      await AgriIpmRule.updateOne({ ruleCode: rule.ruleCode }, { $set: rule });
      updated++;
    } else {
      await AgriIpmRule.create(rule);
      inserted++;
    }

    if (rule.validationStatus === 'VALIDATED') {
      validated++;
    } else {
      quarantined++;
    }
  }

  const totalRules = await AgriIpmRule.countDocuments();
  const totalValidated = await AgriIpmRule.countDocuments({ validationStatus: 'VALIDATED' });
  const totalQuarantined = await AgriIpmRule.countDocuments({ validationStatus: { $ne: 'VALIDATED' } });

  console.log(`\n================================================================`);
  console.log(`🏁 PHASE 8 INGESTION COMPLETED SUCCESSFULLY:`);
  console.log(`   - Newly Inserted: ${inserted}`);
  console.log(`   - Updated / Refreshed: ${updated}`);
  console.log(`   - Total AgriIpmRule in DB: ${totalRules}`);
  console.log(`   - Validated & Active for Farmers: ${totalValidated}`);
  console.log(`   - In Governance Quarantine (Review/Conflict/Rejected): ${totalQuarantined}`);
  console.log(`================================================================\n`);

  await mongoose.disconnect();
}

ingestPhase8().catch((err) => {
  console.error('Fatal Ingestion Error:', err);
  process.exit(1);
});
