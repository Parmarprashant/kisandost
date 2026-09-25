#!/usr/bin/env tsx
/**
 * scripts/test_weather_provider.ts
 *
 * [LIVE PROVIDER TEST] — MANUAL USE ONLY
 *
 * Tests the Open-Meteo Historical Archive API with a real HTTP request.
 * NOT part of the automated test suite.
 * NOT required for the Phase 5 definition of done.
 *
 * Run manually to verify provider connectivity:
 *   npx tsx scripts/test_weather_provider.ts
 *
 * Expected: prints raw provider response + normalized output for a known coordinate.
 */

import 'dotenv/config';

console.log('\n[LIVE PROVIDER TEST] ══════════════════════════════════════════');
console.log('  Open-Meteo Historical Archive API — Live Provider Verification');
console.log('══════════════════════════════════════════════════════════════════\n');

async function runLiveTest() {
  const { OpenMeteoHistoricalProvider } = await import(
    '../src/lib/weather/providers/openMeteoHistorical'
  );
  const { roundCoordinate, computeCoverage, generateDateRange } = await import(
    '../src/lib/weather/weatherProvider'
  );

  // Known coordinates: Vadodara, Gujarat — ICAR research station area
  const latitude = 22.3072;
  const longitude = 73.1812;

  // Use a historical date range guaranteed to be in the archive
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 7); // 7 days ago (safely in archive)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 7-day range

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  console.log(`  Location    : Vadodara, Gujarat, India`);
  console.log(`  Latitude    : ${latitude} (rounded: ${roundCoordinate(latitude)})`);
  console.log(`  Longitude   : ${longitude} (rounded: ${roundCoordinate(longitude)})`);
  console.log(`  Date Range  : ${startDateStr} → ${endDateStr}`);
  console.log(`  Provider    : Open-Meteo Archive API (https://archive-api.open-meteo.com/v1/archive)`);
  console.log(`  API Key     : Not required (free tier)\n`);

  const provider = new OpenMeteoHistoricalProvider({ timeoutMs: 20000 });

  console.log('[LIVE PROVIDER TEST] Sending request to Open-Meteo Archive API...\n');

  let results;
  try {
    results = await provider.fetchHistoricalDaily(latitude, longitude, startDateStr, endDateStr);
  } catch (err: any) {
    console.error('[LIVE PROVIDER TEST] ❌ Provider request failed:', err.message);
    process.exit(1);
  }

  console.log(`[LIVE PROVIDER TEST] ✅ Received ${results.length} observation(s)\n`);

  const allDates = generateDateRange(startDateStr, endDateStr);
  const coverage = computeCoverage(startDateStr, endDateStr, results.map((r) => r.date));

  console.log('─'.repeat(65));
  console.log(
    `${'Date'.padEnd(12)} ${'Tmin°C'.padEnd(10)} ${'Tmax°C'.padEnd(10)} ${'Rain mm'.padEnd(10)} ${'Humidity%'.padEnd(12)} ${'Source'}`
  );
  console.log('─'.repeat(65));

  for (const obs of results) {
    const tMin = obs.minTemperatureC !== null ? obs.minTemperatureC.toFixed(1) : 'null';
    const tMax = obs.maxTemperatureC !== null ? obs.maxTemperatureC.toFixed(1) : 'null';
    const rain = obs.rainfallMm !== null ? obs.rainfallMm.toFixed(1) : 'null';
    const hum = obs.relativeHumidityPct !== null ? obs.relativeHumidityPct.toFixed(0) : 'null';
    console.log(
      `${obs.date.padEnd(12)} ${tMin.padEnd(10)} ${tMax.padEnd(10)} ${rain.padEnd(10)} ${hum.padEnd(12)} ${obs.source}`
    );
  }

  console.log('─'.repeat(65));
  console.log(`\n  Coverage     : ${coverage.coveragePercent}%`);
  console.log(`  Available    : ${coverage.availableDays}/${coverage.requestedDays} days`);

  if (coverage.missingDates.length > 0) {
    console.log(`  Missing      : ${coverage.missingDates.join(', ')}`);
    console.log('  (Open-Meteo archive has ~5 day lag; recent dates may not be available)');
  }

  // Validate all observations have non-null Tmin and Tmax (required for GDD)
  const gddReady = results.filter((r) => r.minTemperatureC !== null && r.maxTemperatureC !== null);
  console.log(`\n  GDD-ready    : ${gddReady.length}/${results.length} observations (have Tmin + Tmax)`);

  if (gddReady.length > 0) {
    const { calculateDailyGdd } = await import('../src/lib/gdd/gddCalculator');
    const baseTemp = 15.5; // Cotton, PS-001
    const firstGdd = calculateDailyGdd(
      gddReady[0].minTemperatureC!,
      gddReady[0].maxTemperatureC!,
      baseTemp
    );
    console.log(
      `  Sample GDD   : ${firstGdd.toFixed(2)} for ${gddReady[0].date} (Cotton base ${baseTemp}°C)`
    );
  }

  console.log('\n[LIVE PROVIDER TEST] Complete.\n');
  console.log('══════════════════════════════════════════════════════════════════\n');
}

runLiveTest().catch((err) => {
  console.error('[LIVE PROVIDER TEST] Fatal error:', err);
  process.exit(1);
});
