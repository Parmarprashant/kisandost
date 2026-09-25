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
import { ScanSession } from '../src/models/ScanSession';
import { CropDiseaseScan } from '../src/models/CropDiseaseScan';
import { Crop } from '../src/models/Crop';
import { Field } from '../src/models/Field';
import { FarmZone } from '../src/models/FarmZone';
import { validateImageFile, saveScanImage } from '../src/lib/imageStorage';
import {
  interpretAgriVisionDiagnosis,
  validateZoneScoutingContext,
  processZoneImage,
  finalizeZoneScanSession,
  DEFAULT_MAX_ADDITIONAL_IMAGES,
} from '../src/lib/gdd/zoneScanService';
import { AgriVisionDiseaseResult } from '../src/lib/agriVisionService';

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

// Helper to create mock File/Blob objects for testing
function createMockFile(name: string, type: string, sizeBytes: number): any {
  const buffer = Buffer.alloc(Math.min(sizeBytes, 1024), 'a');
  return {
    name,
    type,
    size: sizeBytes,
    arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  };
}

// Helper to create mock AgriVisionDiseaseResult objects
function createMockAgriResult(overrides: Partial<AgriVisionDiseaseResult> = {}): AgriVisionDiseaseResult {
  return {
    cropName: 'Cotton',
    diseaseName: 'Healthy Crop',
    confidence: 0.95,
    description: 'No pathogen signs visible',
    symptoms: [],
    causes: [],
    precautions: [],
    recommendedPesticides: [],
    recommendedFertilizers: [],
    requiresExpertVerification: false,
    ...overrides,
  };
}

async function runTestSuite() {
  console.log(`\n${CYAN}================================================================${RESET}`);
  console.log(`${CYAN}🧪 AGRISHIELD 360° / MY CROP — PHASE 4 IMAGE PIPELINE TESTS${RESET}`);
  console.log(`${CYAN}================================================================${RESET}\n`);

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisandost';
  await mongoose.connect(mongoUri);

  try {
    // -------------------------------------------------------------
    // Group 1: Model Schema & Index Verification
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 1: ScanSession & CropDiseaseScan Mongoose Model Verification${RESET}`);

    // Scenario 1: ScanSession Schema verification
    const sessionPaths = (ScanSession.schema as any).paths;
    assert(!!sessionPaths.farmerId, 'Scenario 1: ScanSession has farmerId field');
    assert(!!sessionPaths.cropId, 'Scenario 1: ScanSession has cropId field');
    assert(!!sessionPaths.zoneId, 'Scenario 1: ScanSession has zoneId field');
    assert(!!sessionPaths.status, 'Scenario 1: ScanSession has status field with enum');
    assert(!!sessionPaths.result, 'Scenario 1: ScanSession has result field with enum');
    assert(sessionPaths.maxAdditionalImages.defaultValue === DEFAULT_MAX_ADDITIONAL_IMAGES,
      `Scenario 1: ScanSession default maxAdditionalImages is ${DEFAULT_MAX_ADDITIONAL_IMAGES}`);

    // Scenario 2: ScanSession Compound Indexes
    const sessionIndexes = ScanSession.schema.indexes();
    const hasCropZoneIndex = sessionIndexes.some((idx: any) => {
      const keys = idx[0];
      return keys.cropId === 1 && keys.zoneId === 1 && keys.createdAt === -1;
    });
    const hasFarmerIndex = sessionIndexes.some((idx: any) => {
      const keys = idx[0];
      return keys.farmerId === 1 && keys.createdAt === -1;
    });
    assert(hasCropZoneIndex, 'Scenario 2: ScanSession has compound index { cropId: 1, zoneId: 1, createdAt: -1 }');
    assert(hasFarmerIndex, 'Scenario 2: ScanSession has compound index { farmerId: 1, createdAt: -1 }');

    // Scenario 3: CropDiseaseScan extended fields
    const scanPaths = (CropDiseaseScan.schema as any).paths;
    assert(!!scanPaths.scanSessionId, 'Scenario 3: CropDiseaseScan has scanSessionId reference field');
    assert(!!scanPaths.viewAngle, 'Scenario 3: CropDiseaseScan has viewAngle field');
    assert(!!scanPaths.screeningResult, 'Scenario 3: CropDiseaseScan has screeningResult field');

    // -------------------------------------------------------------
    // Group 2: Storage Service Validation
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 2: Image Storage & Validation Service${RESET}`);

    // Scenario 4: Valid image MIME types accepted
    const validJpeg = createMockFile('test.jpg', 'image/jpeg', 1024 * 500); // 500 KB
    const validPng = createMockFile('test.png', 'image/png', 1024 * 800);  // 800 KB
    const validWebp = createMockFile('test.webp', 'image/webp', 1024 * 300); // 300 KB
    assert(validateImageFile(validJpeg).valid, 'Scenario 4: Valid image/jpeg accepted');
    assert(validateImageFile(validPng).valid, 'Scenario 4: Valid image/png accepted');
    assert(validateImageFile(validWebp).valid, 'Scenario 4: Valid image/webp accepted');

    // Scenario 5: Invalid MIME types rejected
    const invalidPdf = createMockFile('doc.pdf', 'application/pdf', 1024 * 100);
    const invalidGif = createMockFile('anim.gif', 'image/gif', 1024 * 200);
    assert(!validateImageFile(invalidPdf).valid, 'Scenario 5: application/pdf rejected');
    assert(!validateImageFile(invalidGif).valid, 'Scenario 5: image/gif rejected');

    // Scenario 6: File size limits (<= 5MB accepted, > 5MB rejected)
    const overSize = createMockFile('huge.jpg', 'image/jpeg', 6 * 1024 * 1024); // 6MB
    const sizeCheck = validateImageFile(overSize);
    assert(!sizeCheck.valid && Boolean(sizeCheck.error?.includes('5MB')), 'Scenario 6: Files > 5MB are rejected');

    // -------------------------------------------------------------
    // Group 3: AgriVision Contract Adherence & Zero Hallucination
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 3: AgriVision Interpretation & Contract Semantics${RESET}`);

    // Scenario 7: Healthy response -> NO_CONCERN_DETECTED
    const healthyMock = createMockAgriResult({
      diseaseName: 'Healthy Crop',
      confidence: 0.95,
      description: 'No pathogen signs visible',
      rawPayload: {
        crop: { name: 'Cotton', confidence: 0.9, status: 'MATCHED' },
        diagnosis: {
          name: 'healthy',
          type: 'healthy',
          confidence: 'high',
          status: 'CONFIRMED',
          farmer_headline: 'Healthy Crop',
          farmer_subheading: 'No active disease detected',
        },
      } as any,
    });
    const healthyInterp = interpretAgriVisionDiagnosis(healthyMock);
    assert(healthyInterp.screeningResult === 'NO_CONCERN_DETECTED',
      'Scenario 7: AgriVision healthy diagnosis maps to NO_CONCERN_DETECTED');
    assert(!healthyInterp.requiresAdditionalImages,
      'Scenario 7: NO_CONCERN_DETECTED does not require additional images');

    // Scenario 8: Undetermined / Insufficient Evidence -> INCONCLUSIVE
    const unknownMock = createMockAgriResult({
      diseaseName: 'Unable to determine disease',
      confidence: 0.3,
      description: 'Insufficient resolution',
      rawPayload: {
        diagnosis: {
          name: 'unknown',
          type: 'unknown',
          confidence: 'low',
          status: 'INSUFFICIENT_EVIDENCE',
          farmer_headline: 'Undetermined',
          farmer_subheading: 'Need clearer view',
        },
      } as any,
    });
    const unknownInterp = interpretAgriVisionDiagnosis(unknownMock);
    assert(unknownInterp.screeningResult === 'INCONCLUSIVE',
      'Scenario 8: Insufficient evidence response maps to INCONCLUSIVE');
    assert(unknownInterp.requiresAdditionalImages,
      'Scenario 8: INCONCLUSIVE prompts for supplementary views');

    // Scenario 9: Foliar pathogen diagnosed -> POTENTIAL_CONCERN
    const pathogenMock = createMockAgriResult({
      diseaseName: 'Bacterial Blight',
      confidence: 0.88,
      description: 'Water-soaked angular lesions observed',
      rawPayload: {
        crop: { name: 'Cotton', confidence: 0.85, status: 'MATCHED' },
        diagnosis: {
          name: 'Bacterial Blight',
          type: 'bacterial',
          confidence: 'high',
          status: 'CONFIRMED',
          farmer_headline: 'Bacterial Blight Detected',
          farmer_subheading: 'Foliar infection',
        },
      } as any,
    });
    const pathogenInterp = interpretAgriVisionDiagnosis(pathogenMock);
    assert(pathogenInterp.screeningResult === 'POTENTIAL_CONCERN',
      'Scenario 9: Pathogen diagnosis maps to POTENTIAL_CONCERN');
    assert(pathogenInterp.requiresAdditionalImages,
      'Scenario 9: POTENTIAL_CONCERN requires additional views');

    // Scenario 10: Zero-Hallucination Policy check: severity is strictly null in persisted scans
    console.log(`\n${YELLOW}Test Group 4: Progressive Zone Scouting Lifecycle${RESET}`);

    // Create temporary test fixtures (Farmer, Field, Zone, Crop)
    const testFarmerId = new mongoose.Types.ObjectId().toString();
    const testField = await Field.create({
      farmerId: testFarmerId,
      name: 'Phase 4 Test Field',
      area: 5,
      areaUnit: 'Acre',
      location: { village: 'Sanand', district: 'Ahmedabad', state: 'Gujarat' },
    });

    const testZone = await FarmZone.create({
      farmerId: testFarmerId,
      fieldId: testField._id,
      zoneCode: 'Z01',
      zoneName: 'North Zone',
      area: 2.5,
      active: true,
    });

    const testCrop = await Crop.create({
      farmerId: testFarmerId,
      fieldId: testField._id,
      cropName: 'Cotton',
      variety: 'G.Cot.Hy-12',
      sowingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 DAS
      cultivatedArea: 2.5,
      status: 'Active',
      currentStageId: 'Vegetative',
    });

    // Scenario 11: Initial Screening Scan creates ScanSession
    const screeningFile = createMockFile('screening.jpg', 'image/jpeg', 1024 * 200);
    const initialHealthyResult = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone._id.toString(),
      userId: testFarmerId,
      file: screeningFile,
      viewAngle: 'screening',
      customAnalyzer: async () => healthyMock,
    });

    assert(!!initialHealthyResult.sessionId, 'Scenario 11: Initial scan generates a persistent ScanSession ID');
    assert(initialHealthyResult.scanCount === 1, 'Scenario 11: ScanSession count starts at 1');

    // Scenario 12: No Concern path semantics: exact prompt
    assert(initialHealthyResult.message === 'No concerning signs detected in this scan.',
      'Scenario 12: Prompt exactly equals "No concerning signs detected in this scan."');
    assert(initialHealthyResult.guidanceMessage === 'Continue to the next zone.',
      'Scenario 12: Guidance message exactly equals "Continue to the next zone."');

    // Scenario 13: Strict negative check: NEVER displays "Zone is healthy" or "Disease-free"
    assert(!initialHealthyResult.message.includes('Zone is healthy'),
      'Scenario 13: Strictly does NOT state "Zone is healthy"');
    assert(!initialHealthyResult.message.includes('Disease-free'),
      'Scenario 13: Strictly does NOT state "Disease-free"');

    // Scenario 10 check on persisted CropDiseaseScan document
    const healthyScanDoc = await CropDiseaseScan.findById(initialHealthyResult.currentScan.scanId);
    assert(healthyScanDoc?.severity === null, 'Scenario 10: Persisted scan severity is strictly null (zero hallucination)');

    // Scenario 14: Potential Concern path on new Zone
    const testZone2 = await FarmZone.create({
      farmerId: testFarmerId,
      fieldId: testField._id,
      zoneCode: 'Z02',
      zoneName: 'South Zone',
      area: 2.5,
      active: true,
    });

    const initialConcernResult = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone2._id.toString(),
      userId: testFarmerId,
      file: screeningFile,
      viewAngle: 'screening',
      customAnalyzer: async () => pathogenMock,
    });

    assert(initialConcernResult.result === 'POTENTIAL_CONCERN',
      'Scenario 14: Pathogen scan yields POTENTIAL_CONCERN result');
    assert(initialConcernResult.status === 'ADDITIONAL_IMAGES_REQUIRED',
      'Scenario 14: Session status is ADDITIONAL_IMAGES_REQUIRED');
    assert(initialConcernResult.message === 'Potential issue detected. Please capture additional views from this zone.',
      'Scenario 14: Message matches "Potential issue detected. Please capture additional views from this zone."');

    // Scenario 15: Supplementary Image Upload attached to SAME ScanSession
    const view2File = createMockFile('view2_closeup.jpg', 'image/jpeg', 1024 * 250);
    const view2Result = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone2._id.toString(),
      userId: testFarmerId,
      file: view2File,
      viewAngle: 'close-up',
      sessionId: initialConcernResult.sessionId,
      customAnalyzer: async () => pathogenMock,
    });

    assert(view2Result.sessionId === initialConcernResult.sessionId,
      'Scenario 15: Supplementary Image 2 remains attached to the SAME ScanSession ID');
    assert(view2Result.scanCount === 2, 'Scenario 15: Scan count incremented to 2');

    // Scenario 17: Multi-image persistence: Both scans point to the same scanSessionId
    const session2Scans = await CropDiseaseScan.find({ scanSessionId: initialConcernResult.sessionId });
    assert(session2Scans.length === 2, 'Scenario 17: Database holds 2 scans linked to the same session ID');
    assert(session2Scans.every((s) => s.scanSessionId?.toString() === initialConcernResult.sessionId),
      'Scenario 17: All scan documents have matching scanSessionId foreign key');

    // Attach View 3 (Canopy) and View 4 (Stem)
    const view3File = createMockFile('view3_canopy.jpg', 'image/jpeg', 1024 * 250);
    const view3Result = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone2._id.toString(),
      userId: testFarmerId,
      file: view3File,
      viewAngle: 'canopy',
      sessionId: initialConcernResult.sessionId,
      customAnalyzer: async () => pathogenMock,
    });
    assert(view3Result.scanCount === 3, 'Scenario 15b: Image 3 successfully attached (count = 3)');

    const view4File = createMockFile('view4_stem.jpg', 'image/jpeg', 1024 * 250);
    const view4Result = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone2._id.toString(),
      userId: testFarmerId,
      file: view4File,
      viewAngle: 'stem',
      sessionId: initialConcernResult.sessionId,
      customAnalyzer: async () => pathogenMock,
    });
    assert(view4Result.scanCount === 4, 'Scenario 15c: Image 4 successfully attached (count = 4)');

    // Scenario 16: Maximum additional images limit enforcement (Max 3 additional = total 4 images)
    let maxLimitExceeded = false;
    try {
      const view5File = createMockFile('view5_extra.jpg', 'image/jpeg', 1024 * 250);
      await processZoneImage({
        cropId: testCrop._id.toString(),
        zoneId: testZone2._id.toString(),
        userId: testFarmerId,
        file: view5File,
        viewAngle: 'side',
        sessionId: initialConcernResult.sessionId,
        customAnalyzer: async () => pathogenMock,
      });
    } catch (err: any) {
      if (err.message.includes('limit (3) reached') || err.message.includes('Maximum additional images')) {
        maxLimitExceeded = true;
      }
    }
    assert(maxLimitExceeded, 'Scenario 16: Attempting a 4th additional image (> max 3) throws limit error');

    // -------------------------------------------------------------
    // Group 5: Evidence Aggregation & Finalization
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 5: Evidence Aggregation & Session Finalization${RESET}`);

    // Scenario 18: Consistent diagnoses across views -> Confirmed POTENTIAL_CONCERN
    const finalSession2 = await finalizeZoneScanSession(initialConcernResult.sessionId, testFarmerId, 'Routine zone scout');
    assert(finalSession2.status === 'COMPLETED', 'Scenario 18: Session with consistent views completes with status COMPLETED');
    assert(finalSession2.result === 'POTENTIAL_CONCERN', 'Scenario 18: Result is confirmed POTENTIAL_CONCERN');
    assert(finalSession2.evidenceSummary.isConsistent === true, 'Scenario 18: evidenceSummary.isConsistent is true');
    assert(finalSession2.evidenceSummary.repeatedDiagnosis === 'Bacterial Blight',
      'Scenario 18: Repeated diagnosis is preserved in evidence summary');

    // Scenario 19: Conflicting diagnoses across views -> INCONCLUSIVE
    const testZone3 = await FarmZone.create({
      farmerId: testFarmerId,
      fieldId: testField._id,
      zoneCode: 'Z03',
      zoneName: 'East Zone',
      area: 2.5,
      active: true,
    });

    const conflict1Result = await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone3._id.toString(),
      userId: testFarmerId,
      file: screeningFile,
      viewAngle: 'screening',
      customAnalyzer: async () => createMockAgriResult({
        diseaseName: 'Early Blight',
        confidence: 0.85,
        description: 'Concentric ring spots',
        rawPayload: { diagnosis: { name: 'Early Blight', type: 'fungal' } } as any,
      }),
    });

    await processZoneImage({
      cropId: testCrop._id.toString(),
      zoneId: testZone3._id.toString(),
      userId: testFarmerId,
      file: view2File,
      viewAngle: 'close-up',
      sessionId: conflict1Result.sessionId,
      customAnalyzer: async () => createMockAgriResult({
        diseaseName: 'Powdery Mildew',
        confidence: 0.82,
        description: 'White talcum-like powder',
        rawPayload: { diagnosis: { name: 'Powdery Mildew', type: 'fungal' } } as any,
      }),
    });

    const finalConflictSession = await finalizeZoneScanSession(conflict1Result.sessionId, testFarmerId);
    assert(finalConflictSession.status === 'INCONCLUSIVE',
      'Scenario 19: Conflicting diagnoses result in session status INCONCLUSIVE');
    assert(finalConflictSession.result === 'INCONCLUSIVE',
      'Scenario 19: Result is INCONCLUSIVE');
    assert(finalConflictSession.evidenceSummary.isConsistent === false,
      'Scenario 19: evidenceSummary.isConsistent is false for conflicting diagnoses');

    // -------------------------------------------------------------
    // Group 6: Security & Legacy Backward Compatibility
    // -------------------------------------------------------------
    console.log(`\n${YELLOW}Test Group 6: Multi-tenant Security & Legacy Compatibility${RESET}`);

    // Scenario 20: Unauthorized tenant rejection
    const unauthorizedFarmerId = new mongoose.Types.ObjectId().toString();
    let accessDenied = false;
    try {
      await validateZoneScoutingContext(testCrop._id.toString(), testZone._id.toString(), unauthorizedFarmerId);
    } catch (err: any) {
      if (err.message.includes('access denied') || err.message.includes('not found')) {
        accessDenied = true;
      }
    }
    assert(accessDenied, 'Scenario 20a: Unauthorized farmer access to another farmer zone is rejected');

    // Scenario 20b: Legacy CropDiseaseScan compatibility (scan without scanSessionId)
    const legacyScan = await CropDiseaseScan.create({
      farmerId: testFarmerId,
      fieldId: testField._id,
      cropCycleId: testCrop._id,
      imageUrl: '/uploads/legacy.jpg',
      diagnosis: {
        primaryCondition: 'Leaf Curl',
        pathogenType: 'viral',
      },
      confidence: { score: 0.8, level: 'High' },
      remediationStatus: 'PENDING',
    });
    assert(!!legacyScan._id, 'Scenario 20b: Legacy single-image scan without session creates successfully');
    assert(legacyScan.scanSessionId == null, 'Scenario 20b: Legacy scan has null/undefined scanSessionId without breaking schema');

    // Cleanup test documents
    await CropDiseaseScan.deleteMany({ farmerId: testFarmerId });
    await ScanSession.deleteMany({ farmerId: testFarmerId });
    await FarmZone.deleteMany({ farmerId: testFarmerId });
    await Crop.deleteMany({ farmerId: testFarmerId });
    await Field.deleteMany({ farmerId: testFarmerId });
    await CropDiseaseScan.deleteOne({ _id: legacyScan._id });

    console.log(`\n${CYAN}================================================================${RESET}`);
    console.log(`${CYAN}🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED${RESET}`);
    console.log(`${CYAN}================================================================${RESET}\n`);

    if (passedTests === totalTests) {
      console.log(`${GREEN}✅ ALL 20 PHASE 4 TEST SCENARIOS PASSED WITH ZERO ERRORS.${RESET}\n`);
    } else {
      console.error(`${RED}❌ SOME TESTS FAILED. PLEASE REVIEW OUTPUT.${RESET}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${RED}Unhandled error during test execution:${RESET}`, error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTestSuite();
