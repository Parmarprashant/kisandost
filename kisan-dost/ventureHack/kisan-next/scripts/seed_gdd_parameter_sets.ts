import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.local if present
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Candidates for validated dataset file
const candidatePaths = [
  path.resolve(__dirname, '../../../dataSet/gdd/validated/gdd_parameter_sets.json'),
  path.resolve(__dirname, '../../../../dataSet/gdd/validated/gdd_parameter_sets.json'),
  path.resolve(__dirname, '../../../gdd-research/validated/gdd_parameter_sets.json'),
  path.resolve(__dirname, '../../../../gdd-research/validated/gdd_parameter_sets.json'),
];

const resolvedSource = candidatePaths.find((p) => fs.existsSync(p));
const SOURCE_FILE: string =
  resolvedSource || path.resolve(process.cwd(), 'dataSet/gdd/validated/gdd_parameter_sets.json');

import { GddParameterSet, IGddParameterSet } from '../src/models/GddParameterSet';

interface SeedMetrics {
  totalSourceRecords: number;
  validRecords: number;
  readyForGddCount: number;
  partialSupportCount: number;
  explicitBaseTempCount: number;
  nullBaseTempCount: number;
  sourceCompleteCount: number;
  conflictedCount: number;
  partialQualityCount: number;
  upsertedCount: number;
  matchedCount: number;
}

export async function runSeed(options?: { isExecute?: boolean; isDryRun?: boolean }) {
  const args = process.argv.slice(2);
  const isExecute =
    options?.isExecute ?? (args.includes('--execute') || args.includes('--commit'));
  const isDryRun = options?.isDryRun ?? !isExecute;

  console.log('===============================================================');
  console.log('🌱 AGRISHIELD 360° / MY CROP — GDD PARAMETER SET SEED PIPELINE');
  console.log('===============================================================');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (Validation only - no DB writes)' : 'LIVE EXECUTION (Idempotent DB Upsert)'}`);
  console.log(`Source File: ${SOURCE_FILE}`);

  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Source parameter sets file not found at: ${SOURCE_FILE}`);
  }

  const rawData = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const records = JSON.parse(rawData);

  if (!Array.isArray(records)) {
    throw new Error(`Expected JSON array of parameter sets, received ${typeof records}`);
  }

  console.log(`\n📋 Loaded ${records.length} records from source JSON.`);

  const metrics: SeedMetrics = {
    totalSourceRecords: records.length,
    validRecords: 0,
    readyForGddCount: 0,
    partialSupportCount: 0,
    explicitBaseTempCount: 0,
    nullBaseTempCount: 0,
    sourceCompleteCount: 0,
    conflictedCount: 0,
    partialQualityCount: 0,
    upsertedCount: 0,
    matchedCount: 0,
  };

  const idSet = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    const id = item.parameter_set_id;

    if (!id || typeof id !== 'string') {
      throw new Error(`Record at index ${i} missing parameter_set_id`);
    }

    if (idSet.has(id)) {
      throw new Error(`Duplicate parameter_set_id detected in source: ${id}`);
    }
    idSet.add(id);

    if (!item.crop?.crop_name) {
      throw new Error(`Record ${id} missing crop.crop_name`);
    }

    if (!item.gdd_methodology?.base_temperature) {
      throw new Error(`Record ${id} missing gdd_methodology.base_temperature`);
    }

    const tbVal = item.gdd_methodology.base_temperature.value;
    if (tbVal !== null && (typeof tbVal !== 'number' || isNaN(tbVal))) {
      throw new Error(`Record ${id} has invalid base_temperature value: ${tbVal}`);
    }

    if (tbVal === null) {
      metrics.nullBaseTempCount++;
    } else {
      metrics.explicitBaseTempCount++;
    }

    if (item.engine_readiness === 'READY_FOR_GDD_ENGINE') {
      metrics.readyForGddCount++;
      if (tbVal === null) {
        throw new Error(`Record ${id} marked READY_FOR_GDD_ENGINE but base_temperature is null!`);
      }
    } else if (item.engine_readiness === 'PARTIAL_GDD_SUPPORT') {
      metrics.partialSupportCount++;
    } else {
      throw new Error(`Record ${id} has unrecognized engine_readiness: ${item.engine_readiness}`);
    }

    if (item.quality_classification === 'SOURCE_COMPLETE') metrics.sourceCompleteCount++;
    else if (item.quality_classification === 'CONFLICTED') metrics.conflictedCount++;
    else if (item.quality_classification === 'PARTIAL') metrics.partialQualityCount++;

    if (!Array.isArray(item.growth_stages) || item.growth_stages.length === 0) {
      throw new Error(`Record ${id} has empty growth_stages`);
    }

    if (!item.maturity_gdd || typeof item.maturity_gdd.value !== 'number') {
      throw new Error(`Record ${id} has invalid maturity_gdd`);
    }

    if (!item.source?.source_file) {
      throw new Error(`Record ${id} missing source provenance (source_file)`);
    }

    metrics.validRecords++;
  }

  console.log(`✓ Source Data Integrity Verified: ${metrics.validRecords}/${metrics.totalSourceRecords} valid parameter sets.`);
  console.log(`  - READY_FOR_GDD_ENGINE: ${metrics.readyForGddCount}`);
  console.log(`  - PARTIAL_GDD_SUPPORT: ${metrics.partialSupportCount}`);
  console.log(`  - Explicit Base Temp ($T_b$): ${metrics.explicitBaseTempCount}`);
  console.log(`  - Null Base Temp ($T_b$): ${metrics.nullBaseTempCount}`);
  console.log(`  - Quality: Complete=${metrics.sourceCompleteCount}, Conflicted=${metrics.conflictedCount}, Partial=${metrics.partialQualityCount}`);

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE] Zero database writes performed. Use --execute to commit to MongoDB.');
    return metrics;
  }

  // Live execution mode: Connect to DB and upsert idempotently
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kisandost';
  console.log(`\nConnecting to MongoDB: ${mongoUri.replace(/:[^:@]+@/, ':***@')}...`);
  await mongoose.connect(mongoUri);

  try {
    const bulkOps = records.map((record: any) => ({
      updateOne: {
        filter: { parameter_set_id: record.parameter_set_id },
        update: { $set: record },
        upsert: true,
      },
    }));

    console.log(`Executing idempotent bulkWrite for ${bulkOps.length} documents...`);
    const bulkResult = await GddParameterSet.bulkWrite(bulkOps);

    metrics.upsertedCount = bulkResult.upsertedCount;
    metrics.matchedCount = bulkResult.matchedCount;

    console.log(`✓ BulkWrite Succeeded!`);
    console.log(`  - Inserted/Upserted: ${bulkResult.upsertedCount}`);
    console.log(`  - Matched & Updated: ${bulkResult.matchedCount}`);
    console.log(`  - Modified: ${bulkResult.modifiedCount}`);

    // Verify final count in collection
    const count = await GddParameterSet.countDocuments();
    console.log(`  - Total gdd_parameter_sets in collection: ${count}`);

    if (count < 160) {
      throw new Error(`Database record count verification failed! Expected >= 160, found ${count}`);
    }

    console.log('\n✅ GDD Parameter Sets successfully seeded with 100% provenance preserved.');
    return metrics;
  } finally {
    await mongoose.disconnect();
  }
}

// Auto-run if executed directly via CLI
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed Pipeline Failed:', err);
      process.exit(1);
    });
}
