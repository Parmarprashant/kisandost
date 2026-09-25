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

import { AgriIpmRule } from '../src/models/AgriIpmRule';

const SOYBEAN_RULES = [
  {
    ruleCode: 'IPM-SOY-RUST-01',
    cropName: 'Soybean',
    icarCropId: 'soybean',
    targetThreatName: 'Soybean Rust',
    threatType: 'disease',
    applicableStages: ['Vegetative', 'Flowering', 'Pod Development'],
    symptoms: [
      'Small, water-soaked chlorotic flecks on lower leaf surfaces',
      'Pustules (uredinia) turning tan to reddish-brown with volcanic pore-like eruptions',
      'Premature defoliation starting from bottom leaves moving upward'
    ],
    riskConditions: [
      'Prolonged leaf wetness (>6-8 hours) accompanied by moderate temperatures (18-28°C)',
      'Continuous cloudy weather and relative humidity exceeding 80%'
    ],
    monitoringMethod: 'Examine 20 leaves from bottom canopy across 5 random field locations weekly starting at 30 DAS.',
    economicThreshold: 'Appearance of initial uredinial pustules on leaves in any spot of the field.',
    culturalControl: [
      'Plant rust-tolerant or resistant cultivars like JS 95-60, NRC 37, or JS 97-52.',
      'Sow with optimal spacing (45 cm x 5 cm) to allow proper ventilation and canopy drying.',
      'Avoid late sowing; plant with first monsoon showers.'
    ],
    mechanicalControl: [
      'Collect and destroy initial infected leaf foci to delay secondary spore dispersal.'
    ],
    biologicalControl: [
      'Foliar spray of Trichoderma harzianum or Pseudomonas fluorescens @ 5 g/L of water at first symptom onset.'
    ],
    chemicalOption: {
      activeIngredient: 'Hexaconazole',
      formulation: '5% EC',
      dosage: '1000',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray with hollow cone nozzle covering lower leaf surfaces',
      waitingPeriodDays: 30,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Wear protective mask and gloves. Avoid spraying during midday heat or high winds.'
    },
    source: {
      organization: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
      title: 'Soybean Crop Production & Protection Manual',
      page: 24,
      publicationDate: '2023'
    },
    validationStatus: 'VALIDATED',
    validationNotes: 'Verified against ICAR-IISR Indore IPM package and CIB&RC approved pesticide schedule.',
    ruleVersion: 1,
    isCurrent: true,
    regulatoryStatus: {
      isBanned: false,
      isRestricted: false,
      isRegistered: true,
      labelClaimVerified: true,
      mupReference: 'CIB&RC Major Uses of Pesticides (Fungicides)',
      regulatoryNotes: 'Approved for soybean rust in India.'
    }
  },
  {
    ruleCode: 'IPM-SOY-PEST-01',
    cropName: 'Soybean',
    icarCropId: 'soybean',
    targetThreatName: 'Tobacco Caterpillar & Semilooper',
    threatType: 'pest',
    applicableStages: ['Vegetative', 'Flowering', 'Pod Development'],
    symptoms: [
      'Gregarious young larvae feeding on chlorophyl resulting in paper-thin translucent leaves',
      'Later instars causing severe defoliation, leaving only primary leaf veins',
      'Damaged flower buds and bored green pods'
    ],
    riskConditions: [
      'Warm humid weather following heavy monsoon showers',
      'Dense luxuriant foliage with high nitrogen application'
    ],
    monitoringMethod: 'Observe 1 meter row length at 5 spots randomly; shake plants gently over white cloth to count larvae.',
    economicThreshold: '3-4 larvae per meter row length or defoliation exceeds 20% in vegetative stage.',
    culturalControl: [
      'Intercrop with Maize or Sorghum (4:2 ratio) as trap and barrier crops.',
      'Install bird perches @ 40-50 per hectare to encourage avian predation.'
    ],
    mechanicalControl: [
      'Erect pheromone traps (Spodolure) @ 10-12 traps/ha for monitoring and mass trapping.',
      'Handpick and destroy egg masses and clusters of gregarious young larvae on lower leaves.'
    ],
    biologicalControl: [
      'Spray Bacillus thuringiensis (Bt) kurstaki @ 1.0 kg/ha or SlNPV @ 250 LE/ha in evening hours.',
      'Spray Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 0.03% (300 ppm) @ 5 ml/L.'
    ],
    chemicalOption: {
      activeIngredient: 'Chlorantraniliprole',
      formulation: '18.5% SC',
      dosage: '150',
      unit: 'ml/ha',
      dilution: '500 litres of water/ha',
      applicationMethod: 'Foliar spray when larval population exceeds economic threshold',
      waitingPeriodDays: 22,
      reEntryIntervalHours: 24,
      safetyPrecaution: 'Use personal protective equipment. Do not contaminate pond or water channels.'
    },
    source: {
      organization: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
      title: 'AESA Based IPM Package - Soybean',
      page: 36,
      publicationDate: '2023'
    },
    validationStatus: 'VALIDATED',
    validationNotes: 'Confirmed against DPPQS and ICAR-IISR Indore IPM guidelines.',
    ruleVersion: 1,
    isCurrent: true,
    regulatoryStatus: {
      isBanned: false,
      isRestricted: false,
      isRegistered: true,
      labelClaimVerified: true,
      mupReference: 'CIB&RC Major Uses of Pesticides (Insecticides)',
      regulatoryNotes: 'Approved for defoliator management in soybean.'
    }
  },
  {
    ruleCode: 'IPM-SOY-EARLY-01',
    cropName: 'Soybean',
    icarCropId: 'soybean',
    targetThreatName: 'General Agronomic Stress',
    threatType: 'abiotic',
    applicableStages: ['Emergence', 'Vegetative'],
    symptoms: [
      'Uneven emergence, yellowing cotyledons or early weed competition',
      'Shallow root anchoring and water stagnation in low-lying micro-depressions'
    ],
    riskConditions: [
      'Continuous rain immediately after sowing causing soil crusting and oxygen deprivation',
      'Early weed flush within first 20 days competing for moisture and nutrients'
    ],
    monitoringMethod: 'Walk the field in zigzag pattern; check plant population per square meter and soil moisture status.',
    economicThreshold: 'More than 15-20 weeds per square meter within first 30 DAS.',
    culturalControl: [
      'Ensure proper drainage channels at every 6-9 meter intervals (Broad Bed Furrow or Ridge & Furrow system).',
      'Perform light hoeing or intercultural operation at 15-20 DAS to break crust and aerate roots.',
      'Maintain plant population around 40-45 plants per square meter.'
    ],
    mechanicalControl: [
      'Manual hand-weeding or wheel-hoe operation between rows at 15-20 DAS.'
    ],
    biologicalControl: [
      'Ensure seed inoculation with Rhizobium japonicum and Phosphate Solubilizing Bacteria (PSB) @ 5g/kg seed.'
    ],
    chemicalOption: null,
    source: {
      organization: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
      title: 'Good Agricultural Practices for Soybean Cultivation',
      page: 8,
      publicationDate: '2023'
    },
    validationStatus: 'VALIDATED',
    validationNotes: 'Standard agronomic and crop establishment practice for soybean in India.',
    ruleVersion: 1,
    isCurrent: true,
    regulatoryStatus: {
      isBanned: false,
      isRestricted: false,
      isRegistered: true,
      labelClaimVerified: true,
      regulatoryNotes: 'Cultural and agronomic guidance.'
    }
  }
];

async function seedSoybean() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected.');

  for (const r of SOYBEAN_RULES) {
    const existing = await AgriIpmRule.findOne({ ruleCode: r.ruleCode });
    if (!existing) {
      await AgriIpmRule.create(r);
      console.log(`✅ Seeded: ${r.ruleCode} (${r.targetThreatName})`);
    } else {
      await AgriIpmRule.updateOne({ ruleCode: r.ruleCode }, { $set: r });
      console.log(`🔄 Updated: ${r.ruleCode}`);
    }
  }

  const count = await AgriIpmRule.countDocuments({ cropName: 'Soybean' });
  console.log(`Total Soybean IPM rules in DB: ${count}`);
  await mongoose.disconnect();
}

seedSoybean().catch(console.error);
