import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Models & Services
import { GddParameterSet } from '../src/models/GddParameterSet';
import { GddLog } from '../src/models/GddLog';
import { Crop } from '../src/models/Crop';
import { Field } from '../src/models/Field';
import { CropGrowthStage } from '../src/models/CropGrowthStage';
import {
  resolveGddParameters,
  inferSeasonFromDate,
  inferRegionRelevance,
} from '../src/lib/gdd/parameterResolver';
import {
  calculateDailyGdd,
  accumulateThermalUnits,
  normalizeDateToUtcMidnight,
} from '../src/lib/gdd/gddCalculator';
import {
  calculateCurrentDas,
  determineGddStage,
  determineDasStage,
  evaluateCropCycle,
} from '../src/lib/gdd/cropCycleEngine';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${testName}`);
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${testName}`);
    if (failureDetail) console.error(`    Detail: ${failureDetail}`);
  }
}

async function runTestSuite() {
  console.log(`\n${CYAN}================================================================${RESET}`);
  console.log(`${CYAN}🧪 AGRISHIELD 360° / MY CROP — PHASE 3C CROP CYCLE ENGINE TESTS${RESET}`);
  console.log(`${CYAN}================================================================${RESET}\n`);

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisandost';
  await mongoose.connect(mongoUri);

  try {
    // -------------------------------------------------------------
    // Test 1: GddParameterSet Schema & Model Validation
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 1: Model Schema & Collection Verification${RESET}`);
    const sampleSet = await GddParameterSet.findOne({ parameter_set_id: 'PS-001' }).lean();
    assert(!!sampleSet, 'PS-001 Cotton parameter set exists in collection');
    assert(sampleSet?.crop?.crop_name === 'Cotton', 'PS-001 has valid crop.crop_name "Cotton"');
    assert(sampleSet?.region_relevance === 'GUJARAT', 'PS-001 has region_relevance "GUJARAT"');
    assert(
      sampleSet?.gdd_methodology?.base_temperature?.value === 15.5,
      'PS-001 has verified base temperature 15.5°C'
    );
    assert(
      Array.isArray(sampleSet?.growth_stages) && sampleSet.growth_stages.length === 6,
      'PS-001 has 6 growth stages with provenance'
    );

    // -------------------------------------------------------------
    // Test 2 & 3: Seed Count = 160 & Idempotency
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 2: Seed Verification & Idempotency${RESET}`);
    const totalCount = await GddParameterSet.countDocuments();
    assert(totalCount === 160, `Seeded collection contains exactly 160 parameter sets (got ${totalCount})`);

    const readyCount = await GddParameterSet.countDocuments({ engine_readiness: 'READY_FOR_GDD_ENGINE' });
    const partialCount = await GddParameterSet.countDocuments({ engine_readiness: 'PARTIAL_GDD_SUPPORT' });
    assert(readyCount === 117, `READY_FOR_GDD_ENGINE count is 117 (got ${readyCount})`);
    assert(partialCount === 43, `PARTIAL_GDD_SUPPORT count is 43 (got ${partialCount})`);

    // -------------------------------------------------------------
    // Test 4: Zero Invented Parameters Audit
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 3: Zero-Hallucination & Parameter Fidelity Audit${RESET}`);
    // Check wheat in DB: base temp must be strictly null
    const wheatSets = await GddParameterSet.find({ 'crop.crop_name': 'Wheat' }).lean();
    assert(wheatSets.length > 0, 'Wheat parameter sets exist in DB');
    const wheatTbNull = wheatSets.every((w) => w.gdd_methodology.base_temperature.value === null);
    assert(wheatTbNull, '100% of Wheat sets maintain null base temperature (0 invented temperatures)');

    // Check rice in DB: base temp must be strictly null
    const riceSets = await GddParameterSet.find({ 'crop.crop_name': 'Rice' }).lean();
    assert(riceSets.length > 0, 'Rice parameter sets exist in DB');
    const riceTbNull = riceSets.every((r) => r.gdd_methodology.base_temperature.value === null);
    assert(riceTbNull, '100% of Rice sets maintain null base temperature (0 invented temperatures)');

    // -------------------------------------------------------------
    // Test 5, 6, 7, 8, 9: Parameter Resolver Priorities & Ambiguities
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 4: Parameter Resolution Hierarchy & Conflict Handling${RESET}`);

    // Test 5: Cotton Gujarat exact contextual match
    const cottonRes = await resolveGddParameters({
      cropName: 'Cotton',
      variety: 'G.Cot Hybrid-8',
      state: 'Gujarat',
      season: 'Kharif',
    });
    assert(cottonRes.status === 'GDD_AVAILABLE', 'Cotton exact context returns GDD_AVAILABLE');
    assert(cottonRes.progressionMode === 'DYNAMIC_GDD', 'Cotton exact context selects DYNAMIC_GDD');
    assert(cottonRes.baseTemperature === 15.5, `Cotton exact context resolves Tb = 15.5°C (got ${cottonRes.baseTemperature})`);
    assert(cottonRes.matchPriority === 1, 'Cotton matched via Priority 1');

    // Test 6: Variety + Region resolution without explicit season
    const cottonVarReg = await resolveGddParameters({
      cropName: 'Cotton',
      variety: 'G.Cot Hybrid-8',
      state: 'Gujarat',
    });
    assert(cottonVarReg.status === 'GDD_AVAILABLE', 'Cotton Variety+Region returns GDD_AVAILABLE');
    assert(cottonVarReg.baseTemperature === 15.5, 'Cotton Variety+Region maintains Tb = 15.5°C');

    // Test 7: Pearl Millet ambiguity / conflict detection
    const bajraRes = await resolveGddParameters({
      cropName: 'Pearl Millet',
    });
    assert(
      bajraRes.status === 'GDD_AMBIGUOUS' || bajraRes.status === 'GDD_PARAMETER_CONFLICTED',
      'Pearl Millet with no regional/variety context returns GDD_AMBIGUOUS or GDD_PARAMETER_CONFLICTED'
    );
    assert(bajraRes.progressionMode === 'DAS_ONLY', 'Pearl Millet ambiguous context falls back to DAS_ONLY');
    assert(bajraRes.baseTemperature === null, 'Pearl Millet ambiguous context does not invent or select arbitrary Tb');

    // Test 8: Wheat partial / missing Tb handling
    const wheatRes = await resolveGddParameters({
      cropName: 'Wheat',
      variety: 'GW-496',
      state: 'Gujarat',
    });
    assert(wheatRes.status === 'GDD_PARAMETER_PARTIAL', 'Wheat returns GDD_PARAMETER_PARTIAL');
    assert(wheatRes.progressionMode === 'HYBRID_DAS', 'Wheat selects HYBRID_DAS progression mode');
    assert(wheatRes.baseTemperature === null, 'Wheat base temperature remains strictly null');

    // Test 9: Unknown crop DAS fallback
    const unknownRes = await resolveGddParameters({
      cropName: 'Dragon Fruit',
    });
    assert(unknownRes.status === 'NO_GDD_RECORD', 'Unknown crop returns NO_GDD_RECORD');
    assert(unknownRes.progressionMode === 'DAS_ONLY', 'Unknown crop defaults to DAS_ONLY');

    // -------------------------------------------------------------
    // Test 10, 11, 12: Daily GDD Calculation Logic
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 5: Daily GDD Mathematical Formulas${RESET}`);

    // Test 10: Standard daily formula: ((Tmax + Tmin) / 2) - Tb
    // Tmin = 18°C, Tmax = 32°C, Tb = 10°C => Tavg = 25°C => GDD = 15.0
    const gddStandard = calculateDailyGdd(18, 32, 10);
    assert(gddStandard === 15.0, `Standard daily GDD calculated correctly: got ${gddStandard}, expected 15.0`);

    // Test 11: Zero clamp when Tavg <= Tb
    // Tmin = 5°C, Tmax = 11°C, Tb = 10°C => Tavg = 8°C => GDD = 0
    const gddZero = calculateDailyGdd(5, 11, 10);
    assert(gddZero === 0, `Zero clamp applies when Tavg <= Tb: got ${gddZero}, expected 0`);

    // Test 12: Upper threshold capping if specified
    // Tmin = 20°C, Tmax = 42°C, Tb = 10°C, Upper = 35°C => effMax = 35 => Tavg = 27.5 => GDD = 17.5
    const gddUpper = calculateDailyGdd(20, 42, 10, 35);
    assert(gddUpper === 17.5, `Upper threshold cap calculated correctly: got ${gddUpper}, expected 17.5`);

    // -------------------------------------------------------------
    // Test 13 & 14: Cumulative GDD & Duplicate Date Prevention
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 6: Cumulative GDD & GddLog Persistence${RESET}`);
    const mockCropId = new mongoose.Types.ObjectId();
    const mockFieldId = new mongoose.Types.ObjectId();

    const sampleWeather = [
      { date: '2026-07-01', tMin: 22, tMax: 34 }, // Avg: 28, Tb: 15.5 => 12.5 GDD
      { date: '2026-07-02', tMin: 24, tMax: 36 }, // Avg: 30, Tb: 15.5 => 14.5 GDD (cum: 27.0)
      { date: '2026-07-03', tMin: 20, tMax: 30 }, // Avg: 25, Tb: 15.5 => 9.5 GDD  (cum: 36.5)
    ];

    const accResult = await accumulateThermalUnits({
      cropCycleId: mockCropId,
      fieldId: mockFieldId,
      parameterSetId: 'PS-001',
      baseTemp: 15.5,
      weatherRecords: sampleWeather,
      persistToDb: true,
    });

    assert(accResult.totalDaysEvaluated === 3, `Evaluated 3 sequential days (got ${accResult.totalDaysEvaluated})`);
    assert(accResult.finalCumulativeGdd === 36.5, `Cumulative GDD is 36.5 °C day (got ${accResult.finalCumulativeGdd})`);

    // Test 14: Duplicate date prevention: accumulate same dates again with duplicate entries
    const duplicateWeather = [
      { date: '2026-07-01', tMin: 22, tMax: 34 },
      { date: '2026-07-02', tMin: 24, tMax: 36 },
      { date: '2026-07-03', tMin: 20, tMax: 30 },
      { date: '2026-07-03', tMin: 20, tMax: 30 }, // duplicate
    ];

    await accumulateThermalUnits({
      cropCycleId: mockCropId,
      fieldId: mockFieldId,
      parameterSetId: 'PS-001',
      baseTemp: 15.5,
      weatherRecords: duplicateWeather,
      persistToDb: true,
    });

    const persistedLogsCount = await GddLog.countDocuments({ cropCycleId: mockCropId });
    assert(
      persistedLogsCount === 3,
      `Duplicate date prevented via unique index: exactly 3 logs in DB (got ${persistedLogsCount})`
    );

    // Cleanup mock logs
    await GddLog.deleteMany({ cropCycleId: mockCropId });

    // -------------------------------------------------------------
    // Test 15 & 16: Growth Stage Determination (GDD vs DAS)
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 7: Growth Stage Detection${RESET}`);
    // PS-001 Cotton stages:
    // Germination: 115, Branching: 808 (cum 923), Flowering: 1093 (cum 2016), Boll Formation: 722 (cum 2738), Maturity: 384 (cum 3122)
    const cottonStages = sampleSet?.growth_stages || [];

    const stageEarly = determineGddStage(cottonStages, 80);
    assert(stageEarly?.stageName === 'Germination', `80 GDD maps to "Germination" (got "${stageEarly?.stageName}")`);

    const stageMid = determineGddStage(cottonStages, 500);
    assert(stageMid?.stageName === 'Branching', `500 GDD maps to "Branching" (got "${stageMid?.stageName}")`);

    const stageLate = determineGddStage(cottonStages, 1500);
    assert(stageLate?.stageName === 'Flowering', `1500 GDD maps to "Flowering" (got "${stageLate?.stageName}")`);

    // Test 16: DAS stage detection
    const sampleDasStages = [
      { stageOrder: 1, stageName: 'Seedling / CRI', dasStart: 0, dasEnd: 25 },
      { stageOrder: 2, stageName: 'Tillering', dasStart: 26, dasEnd: 55 },
      { stageOrder: 3, stageName: 'Flowering & Grain Filling', dasStart: 56, dasEnd: 95 },
      { stageOrder: 4, stageName: 'Maturity', dasStart: 96, dasEnd: 125 },
    ];

    const dasStage1 = determineDasStage(sampleDasStages, 15);
    assert(dasStage1?.stageName === 'Seedling / CRI', `DAS 15 maps to "Seedling / CRI" (got "${dasStage1?.stageName}")`);

    const dasStage2 = determineDasStage(sampleDasStages, 40);
    assert(dasStage2?.stageName === 'Tillering', `DAS 40 maps to "Tillering" (got "${dasStage2?.stageName}")`);

    // Test 17: No DAS <-> GDD conversion
    const currentDasCalc = calculateCurrentDas('2026-06-01', new Date('2026-06-21'));
    assert(currentDasCalc === 20, `Calendar DAS is strictly date-difference: 20 days (got ${currentDasCalc})`);

    // -------------------------------------------------------------
    // Test 18, 19, 20, 21: Crop Cycle Engine Integration & Security
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 8: Crop Cycle Runtime Evaluation & Multi-Tenant Security${RESET}`);

    // Create a temporary field and crop in DB for end-to-end evaluation
    const testUserId = `test-farmer-${Date.now()}`;
    const testOtherUserId = `other-farmer-${Date.now()}`;

    const testField = await Field.create({
      farmerId: testUserId,
      name: 'North Plot Gujarat',
      area: 5,
      areaUnit: 'Acre',
      location: { state: 'Gujarat', district: 'Rajkot' },
      soil: { type: 'Black Soil' },
      irrigation: { method: 'Rainfed' },
    });

    const testCrop = await Crop.create({
      farmerId: testUserId,
      fieldId: testField._id,
      cropName: 'Cotton',
      variety: 'G.Cot Hybrid-8',
      sowingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      cultivatedArea: 4,
      cultivatedAreaUnit: 'Acre',
      status: 'Active',
    });

    // Test 19: Missing weather resilience (no weather records)
    const cycleStateNoWeather = await evaluateCropCycle(testCrop._id.toString(), testUserId);
    assert(
      cycleStateNoWeather.status === 'WEATHER_DATA_UNAVAILABLE',
      'Crop with no weather records returns WEATHER_DATA_UNAVAILABLE without crashing'
    );
    assert(
      cycleStateNoWeather.progressionMode === 'HYBRID_DAS',
      'Falls back to HYBRID_DAS when historical weather is unavailable'
    );
    assert(
      cycleStateNoWeather.currentDas === 30,
      `Calculated accurate DAS: 30 days (got ${cycleStateNoWeather.currentDas})`
    );

    // Test 18: Crop cycle update with provided weather records
    const simulatedWeather = [
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), tMin: 22, tMax: 35 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), tMin: 23, tMax: 36 },
    ];

    const cycleStateWithWeather = await evaluateCropCycle(testCrop._id.toString(), testUserId, {
      newWeatherRecords: simulatedWeather,
    });

    assert(cycleStateWithWeather.progressionMode === 'DYNAMIC_GDD', 'DYNAMIC_GDD becomes active when weather is provided');
    assert(
      cycleStateWithWeather.cumulativeGdd !== null && cycleStateWithWeather.cumulativeGdd > 0,
      `Accumulated valid GDD: ${cycleStateWithWeather.cumulativeGdd} °C day`
    );

    // Verify Crop document updated in DB
    const refreshedCrop = await Crop.findById(testCrop._id);
    assert(refreshedCrop?.currentDas === 30, 'Crop document currentDas updated in DB');
    assert(refreshedCrop?.progressionMode === 'DYNAMIC_GDD', 'Crop document progressionMode updated in DB');
    assert(refreshedCrop?.gddParameterSetId === 'PS-001', 'Crop document references PS-001');

    // Test 20: Unauthorized access rejection
    let rejectedUnauthorized = false;
    try {
      await evaluateCropCycle(testCrop._id.toString(), testOtherUserId);
    } catch (e: any) {
      if (e.message.includes('access denied') || e.message.includes('not found')) {
        rejectedUnauthorized = true;
      }
    }
    assert(rejectedUnauthorized, 'Accessing crop with different farmerId is rejected (unauthorized)');

    // Test 21: Existing legacy crop compatibility (crop with no variety, missing GDD parameters)
    const legacyCrop = await Crop.create({
      farmerId: testUserId,
      fieldId: testField._id,
      cropName: 'UnregisteredCrop',
      sowingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      cultivatedArea: 2,
      cultivatedAreaUnit: 'Acre',
      status: 'Active',
    });

    const legacyState = await evaluateCropCycle(legacyCrop._id.toString(), testUserId);
    assert(legacyState.progressionMode === 'DAS_ONLY', 'Legacy crop without GDD smoothly executes in DAS_ONLY mode');
    assert(legacyState.currentDas === 15, 'Legacy crop DAS calculates accurately');
    assert(!!legacyState.currentStage, 'Legacy crop receives fallback growth stage');

    // Cleanup test records
    await GddLog.deleteMany({ cropCycleId: testCrop._id });
    await Crop.deleteMany({ _id: { $in: [testCrop._id, legacyCrop._id] } });
    await Field.deleteOne({ _id: testField._id });

    console.log(`\n${CYAN}================================================================${RESET}`);
    console.log(`Total Tests Run: ${totalTests}`);
    console.log(`Tests Passed: ${passedTests}`);
    console.log(`Tests Failed: ${totalTests - passedTests}`);
    console.log(`${CYAN}================================================================${RESET}\n`);

    if (passedTests === totalTests) {
      console.log(`🎉 ${GREEN}ALL PHASE 3C CROP CYCLE TESTS PASSED PERFECTLY!${RESET}\n`);
    } else {
      throw new Error(`Test suite failed: ${totalTests - passedTests} failures.`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Auto-run when invoked via CLI
if (require.main === module) {
  runTestSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Test Suite Failed:', err);
      process.exit(1);
    });
}
