#!/usr/bin/env tsx
/**
 * scripts/backfill_weather.ts
 *
 * Idempotent historical weather backfill for KisanDost / AgriShield 360°.
 *
 * Usage:
 *   npx tsx scripts/backfill_weather.ts --dry-run  --latitude=22.3 --longitude=72.6 --startDate=2026-07-01 --endDate=2026-07-10
 *   npx tsx scripts/backfill_weather.ts --execute   --fieldId=<FIELD_OBJECT_ID>    --startDate=2026-07-01 --endDate=2026-07-10
 *
 * Flags:
 *   --dry-run    Print what would be fetched WITHOUT writing to the database
 *   --execute    Perform idempotent upsert (safe to re-run)
 *
 * One of --dry-run or --execute is required.
 *
 * Parameters (one required: fieldId XOR latitude+longitude):
 *   --fieldId      MongoDB ObjectId of the field (reads coordinates from DB)
 *   --latitude     Decimal degrees (-90 to 90)
 *   --longitude    Decimal degrees (-180 to 180)
 *   --startDate    "YYYY-MM-DD"
 *   --endDate      "YYYY-MM-DD"
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function main() {
  // ─── Parse Arguments ────────────────────────────────────────────────────────
  const args = process.argv.slice(2);
  const flags = new Map<string, string | boolean>();

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      const value = valueParts.length > 0 ? valueParts.join('=') : true;
      flags.set(key, value);
    }
  }

  const isDryRun = flags.has('dry-run');
  const isExecute = flags.has('execute');

  if (!isDryRun && !isExecute) {
    console.error('ERROR: You must specify either --dry-run or --execute\n');
    printUsage();
    process.exit(1);
  }

  if (isDryRun && isExecute) {
    console.error('ERROR: Cannot specify both --dry-run and --execute\n');
    printUsage();
    process.exit(1);
  }

  const fieldIdArg = flags.get('fieldId') as string | undefined;
  const latArg = flags.get('latitude') as string | undefined;
  const lonArg = flags.get('longitude') as string | undefined;
  const startDate = flags.get('startDate') as string | undefined;
  const endDate = flags.get('endDate') as string | undefined;

  if (!startDate || !endDate) {
    console.error('ERROR: --startDate and --endDate are required\n');
    printUsage();
    process.exit(1);
  }

  if (!fieldIdArg && (!latArg || !lonArg)) {
    console.error('ERROR: Provide either --fieldId or both --latitude and --longitude\n');
    printUsage();
    process.exit(1);
  }

  // ─── Connect to MongoDB ──────────────────────────────────────────────────────
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('\n[backfill_weather] Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('[backfill_weather] Connected.\n');

  // Dynamic imports after tsconfig-paths resolution
  const { Field } = await import('../src/models/Field');
  const { generateDateRange, validateCoordinates, validateDateString, roundCoordinate } =
    await import('../src/lib/weather/weatherProvider');
  const { getHistoricalWeather, calendarDateToUtcMidnight, utcMidnightToCalendarDate } =
    await import('../src/lib/weather/historicalWeatherService');
  const { WeatherObservation } = await import('../src/models/WeatherObservation');
  const { OpenMeteoHistoricalProvider } = await import(
    '../src/lib/weather/providers/openMeteoHistorical'
  );

  // ─── Resolve Coordinates ─────────────────────────────────────────────────────
  let latitude: number;
  let longitude: number;
  let resolvedFieldId: string | null = null;

  if (fieldIdArg) {
    console.log(`[backfill_weather] Resolving field ${fieldIdArg}...`);
    const field = await Field.findById(fieldIdArg).lean();
    if (!field) {
      console.error(`ERROR: Field ${fieldIdArg} not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const lat = field.location?.latitude;
    const lon = field.location?.longitude;

    if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.error(`ERROR: Field ${fieldIdArg} does not have valid GPS coordinates`);
      await mongoose.disconnect();
      process.exit(1);
    }

    latitude = lat;
    longitude = lon;
    resolvedFieldId = (field._id as any).toString();
    console.log(
      `[backfill_weather] Field: ${field.name || fieldIdArg} | Coordinates: ${latitude}, ${longitude}\n`
    );
  } else {
    latitude = Number(latArg);
    longitude = Number(lonArg);

    const coordCheck = validateCoordinates(latitude, longitude);
    if (!coordCheck.valid) {
      console.error(`ERROR: ${coordCheck.error}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // ─── Validate Dates ──────────────────────────────────────────────────────────
  const startCheck = validateDateString(startDate);
  if (!startCheck.valid) {
    console.error(`ERROR: Invalid --startDate: ${startCheck.error}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const endCheck = validateDateString(endDate);
  if (!endCheck.valid) {
    console.error(`ERROR: Invalid --endDate: ${endCheck.error}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const allDates = generateDateRange(startDate, endDate);
  const latRounded = roundCoordinate(latitude);
  const lonRounded = roundCoordinate(longitude);

  console.log('─'.repeat(60));
  console.log(`  Mode        : ${isDryRun ? 'DRY RUN (no DB writes)' : 'EXECUTE (idempotent upsert)'}`);
  console.log(`  Latitude    : ${latitude} (rounded: ${latRounded})`);
  console.log(`  Longitude   : ${longitude} (rounded: ${lonRounded})`);
  console.log(`  Field ID    : ${resolvedFieldId || 'not linked'}`);
  console.log(`  Start Date  : ${startDate}`);
  console.log(`  End Date    : ${endDate}`);
  console.log(`  Total Days  : ${allDates.length}`);
  console.log('─'.repeat(60));

  // ─── Check Existing Records ──────────────────────────────────────────────────
  const startUtc = calendarDateToUtcMidnight(startDate);
  const endUtc = calendarDateToUtcMidnight(endDate);

  const existingDocs = await WeatherObservation.find({
    latitudeRounded: latRounded,
    longitudeRounded: lonRounded,
    observationDate: { $gte: startUtc, $lte: endUtc },
    isForecast: false,
  })
    .select('observationDate')
    .lean();

  const existingDatesSet = new Set(
    existingDocs.map((d) => utcMidnightToCalendarDate(new Date(d.observationDate)))
  );

  const missingDates = allDates.filter((d) => !existingDatesSet.has(d));

  console.log(`\n  Already in DB   : ${existingDatesSet.size} observation(s)`);
  console.log(`  Missing         : ${missingDates.length} date(s)`);

  if (missingDates.length === 0) {
    console.log('\n✅ No missing dates — nothing to fetch.\n');
    await mongoose.disconnect();
    return;
  }

  console.log(`\n  Missing dates:`);
  missingDates.forEach((d) => console.log(`    - ${d}`));
  console.log();

  if (isDryRun) {
    console.log(
      '🔍 DRY RUN — would fetch the above dates from Open-Meteo Archive API.'
    );
    console.log('   Re-run with --execute to perform the actual backfill.\n');
    await mongoose.disconnect();
    return;
  }

  // ─── Execute Backfill ────────────────────────────────────────────────────────
  console.log('[backfill_weather] Fetching from Open-Meteo Archive API...\n');

  const provider = new OpenMeteoHistoricalProvider({ timeoutMs: 30000 });
  const result = await getHistoricalWeather(
    {
      latitude,
      longitude,
      startDate,
      endDate,
      fieldId: resolvedFieldId,
    },
    provider
  );

  console.log('─'.repeat(60));
  console.log(`  Fetched from provider : ${result.fetchedFromProvider}`);
  console.log(`  Loaded from cache     : ${result.loadedFromCache}`);
  console.log(`  Total observations    : ${result.observations.length}`);
  console.log(`  Coverage              : ${result.coverage.coveragePercent}%`);

  if (result.coverage.missingDates.length > 0) {
    console.log(`\n  ⚠ Still missing (provider did not return data for):`);
    result.coverage.missingDates.forEach((d) => console.log(`    - ${d}`));
    console.log(
      '\n  Note: Missing values are null — Open-Meteo archive may have a lag of ~5 days.'
    );
  }

  console.log('\n✅ Backfill complete.\n');
  await mongoose.disconnect();
}

function printUsage() {
  console.log('Usage:');
  console.log(
    '  npx tsx scripts/backfill_weather.ts --dry-run  --latitude=22.3 --longitude=72.6 --startDate=2026-07-01 --endDate=2026-07-10'
  );
  console.log(
    '  npx tsx scripts/backfill_weather.ts --execute   --fieldId=<FIELD_ID>            --startDate=2026-07-01 --endDate=2026-07-10'
  );
}

main().catch((err) => {
  console.error('[backfill_weather] Fatal error:', err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
