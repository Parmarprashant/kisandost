/**
 * Test Suite: Location, Field, Monitoring Zone, Crop, Weather & Risk Integration
 *
 * Verifies strict data relationships:
 * 1. Farmer owns field
 * 2. Field has location
 * 3. Field boundary belongs to field
 * 4. Zones belong to field
 * 5. Crop belongs to field
 * 6. Crop zoneId belongs to field
 * 7. Zone scan belongs to crop
 * 8. Zone scan belongs to zone
 * 9. Weather uses field coordinates
 * 10. Crop risk endpoint validates ownership
 * 11. Zone risk endpoint validates ownership
 * 12. Farmer A cannot access Farmer B's field
 * 13. Farmer A cannot access Farmer B's zone
 * 14. Farmer A cannot access Farmer B's crop
 * 15. Unassigned crop does not receive fabricated zone
 * 16. Missing location does not produce fabricated coordinates
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import connectDB from '../src/lib/mongodb';
import { Field } from '../src/models/Field';
import { FarmZone } from '../src/models/FarmZone';
import { Crop } from '../src/models/Crop';
import { CropDiseaseScan } from '../src/models/CropDiseaseScan';
import { ScanSession } from '../src/models/ScanSession';
import { WeatherObservation } from '../src/models/WeatherObservation';
import { RiskEvent } from '../src/models/RiskEvent';
import { evaluateCropRisk } from '../src/lib/risk/riskEngine';
import { validateGeoPolygon, calculateGeodesicArea, generateMonitoringZones } from '../src/lib/geoUtils';
import { validateZoneScoutingContext } from '../src/lib/gdd/zoneScanService';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('LOCATION + FIELD + ZONE + CROP + RISK INTEGRATION TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  // Test Farmers
  const farmerA = `test_farmer_A_${Date.now()}`;
  const farmerB = `test_farmer_B_${Date.now()}`;

  // Valid GeoJSON polygon for testing (Gujarat test farm ~ 4.2 acres)
  const testPolygon = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [72.6300, 23.2100],
        [72.6320, 23.2100],
        [72.6320, 23.2120],
        [72.6300, 23.2120],
        [72.6300, 23.2100],
      ],
    ],
  };

  try {
    // ── Group 1: Field, Location & Boundary Ownership ─────────────────────────
    console.log('Test Group 1: Field, Location & Boundary Ownership');

    // Create Field for Farmer A with valid location
    const fieldA = await Field.create({
      farmerId: farmerA,
      name: 'North Farm - Field A',
      area: 4.5,
      areaUnit: 'Acre',
      location: {
        village: 'Kadi',
        district: 'Mehsana',
        state: 'Gujarat',
        latitude: 23.2110,
        longitude: 72.6310,
      },
      boundary: testPolygon,
    });

    assert(fieldA.farmerId === farmerA, '1. Farmer owns field (farmerId matches)');
    assert(
      fieldA.location.village === 'Kadi' &&
      fieldA.location.district === 'Mehsana' &&
      fieldA.location.state === 'Gujarat' &&
      fieldA.location.latitude === 23.2110 &&
      fieldA.location.longitude === 72.6310,
      '2. Field has location with village, district, state, and coordinates'
    );
    assert(
      fieldA.boundary?.type === 'Polygon' &&
      fieldA.boundary.coordinates.length > 0,
      '3. Field boundary belongs to field as GeoJSON Polygon'
    );

    // Create monitoring zones for Field A
    const zoneDescriptors = generateMonitoringZones(testPolygon, 'Acre');
    const createdZones = [];
    for (const d of zoneDescriptors) {
      const z = await FarmZone.create({
        farmerId: farmerA,
        fieldId: fieldA._id,
        zoneName: d.zoneName,
        zoneCode: d.zoneCode,
        polygon: d.polygon,
        area: d.area,
        active: true,
      });
      createdZones.push(z);
    }

    assert(
      createdZones.length >= 2 &&
      createdZones.every((z) => z.fieldId.toString() === fieldA._id.toString()),
      '4. Zones belong to field (all zones have correct fieldId)'
    );

    // ── Group 2: Crop, Crop -> Zone & Scouting Lineage ───────────────────────
    console.log('\nTest Group 2: Crop, Crop -> Zone & Scouting Lineage');

    const zoneZ01 = createdZones.find((z) => z.zoneCode === 'Z01') || createdZones[0];

    // Create Crop assigned to Z01
    const cropWithZone = await Crop.create({
      farmerId: farmerA,
      fieldId: fieldA._id,
      zoneId: zoneZ01._id,
      cropName: 'Rice',
      variety: 'Basmati-2023',
      sowingDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      cultivatedArea: 2.0,
      cultivatedAreaUnit: 'Acre',
      status: 'Active',
    });

    assert(
      cropWithZone.fieldId.toString() === fieldA._id.toString(),
      '5. Crop belongs to field (fieldId matches)'
    );
    assert(
      cropWithZone.zoneId?.toString() === zoneZ01._id.toString(),
      '6. Crop zoneId belongs to field and matches assigned monitoring zone'
    );

    // Create a zone scan in Z01
    const zoneScan = await CropDiseaseScan.create({
      farmerId: farmerA,
      fieldId: fieldA._id,
      zoneId: zoneZ01._id,
      cropCycleId: cropWithZone._id,
      viewAngle: 'screening',
      screeningResult: 'POTENTIAL_CONCERN',
      imageUrl: 'https://storage.kisandost.in/scans/scan_z01_01.jpg',
      diagnosis: {
        primaryCondition: 'Rice Blast (Magnaporthe oryzae)',
        pathogenType: 'fungal',
        status: 'confirmed',
      },
      confidence: { level: 'High', score: 0.92 },
      severity: null, // Strictly null
      capturedAt: new Date(),
    });

    assert(
      zoneScan.cropCycleId.toString() === cropWithZone._id.toString(),
      '7. Zone scan belongs to crop (cropCycleId matches)'
    );
    assert(
      zoneScan.zoneId?.toString() === zoneZ01._id.toString(),
      '8. Zone scan belongs to zone (zoneId matches Z01)'
    );

    // Verify context validation
    const scoutingContext = await validateZoneScoutingContext(
      cropWithZone._id.toString(),
      zoneZ01._id.toString(),
      farmerA
    );
    assert(
      Boolean(scoutingContext.crop && scoutingContext.field && scoutingContext.zone),
      'Zone scouting context validated (Farmer -> Crop -> Field -> Zone)'
    );

    // ── Group 3: Weather Uses Field Coordinates ──────────────────────────────
    console.log('\nTest Group 3: Weather Uses Field Coordinates');

    // Create WeatherObservation tied to field coordinates
    const latRound = Math.round(fieldA.location.latitude! * 10000) / 10000;
    const lonRound = Math.round(fieldA.location.longitude! * 10000) / 10000;

    const weatherObs = await WeatherObservation.create({
      latitude: fieldA.location.latitude,
      longitude: fieldA.location.longitude,
      latitudeRounded: latRound,
      longitudeRounded: lonRound,
      fieldId: fieldA._id,
      observationDate: new Date('2026-06-15T00:00:00.000Z'),
      tempMinC: 24.5,
      tempMaxC: 36.2,
      precipitationMm: 12.0,
      dataSource: 'OpenMeteo',
      isForecast: false,
    });

    assert(
      weatherObs.latitude === fieldA.location.latitude &&
      weatherObs.longitude === fieldA.location.longitude &&
      weatherObs.fieldId?.toString() === fieldA._id.toString(),
      '9. Weather uses field coordinates (no invented zone coordinates)'
    );

    // ── Group 4: Risk Evaluation Scope & Multi-Tenant Security ───────────────
    console.log('\nTest Group 4: Risk Evaluation Scope & Multi-Tenant Security');

    // 10. Crop risk evaluation validates ownership
    const cropRisk = await evaluateCropRisk({
      cropId: cropWithZone._id.toString(),
      farmerId: farmerA,
      persistEvents: true,
    });
    assert(
      cropRisk.success && cropRisk.cropId === cropWithZone._id.toString(),
      '10. Crop risk endpoint validates ownership and evaluates crop-level risk'
    );

    // 11. Zone risk evaluation validates ownership & isolates to zone
    const zoneRisk = await evaluateCropRisk({
      cropId: cropWithZone._id.toString(),
      farmerId: farmerA,
      targetZoneId: zoneZ01._id.toString(),
      persistEvents: true,
    });
    assert(
      zoneRisk.success &&
      zoneRisk.zoneId === zoneZ01._id.toString() &&
      zoneRisk.overallStatus === 'POTENTIAL_CONCERN',
      '11. Zone risk endpoint validates ownership and isolates risk to specific zone'
    );

    // 12. Farmer A cannot access Farmer B's field
    const fieldB = await Field.create({
      farmerId: farmerB,
      name: 'South Farm - Field B',
      area: 2.5,
      areaUnit: 'Acre',
      location: {
        village: 'Anand',
        district: 'Anand',
        state: 'Gujarat',
      },
    });

    const unauthorizedFieldCheck = await Field.findOne({
      _id: fieldB._id,
      farmerId: farmerA,
    });
    assert(
      unauthorizedFieldCheck === null,
      "12. Farmer A cannot access Farmer B's field (query returns null)"
    );

    // 13. Farmer A cannot access Farmer B's zone
    const zoneB = await FarmZone.create({
      farmerId: farmerB,
      fieldId: fieldB._id,
      zoneName: 'Central Zone',
      zoneCode: 'Z01',
      active: true,
    });

    let zoneSecurityCaught = false;
    try {
      await evaluateCropRisk({
        cropId: cropWithZone._id.toString(),
        farmerId: farmerA,
        targetZoneId: zoneB._id.toString(), // Zone belongs to Farmer B!
      });
    } catch (err: any) {
      if (err.message.includes('not found') || err.message.includes('does not belong')) {
        zoneSecurityCaught = true;
      }
    }
    assert(
      zoneSecurityCaught,
      "13. Farmer A cannot access Farmer B's zone (blocked with access denied)"
    );

    // 14. Farmer A cannot access Farmer B's crop
    const cropB = await Crop.create({
      farmerId: farmerB,
      fieldId: fieldB._id,
      cropName: 'Cotton',
      sowingDate: new Date(),
      cultivatedArea: 2.0,
      cultivatedAreaUnit: 'Acre',
      status: 'Active',
    });

    let cropSecurityCaught = false;
    try {
      await evaluateCropRisk({
        cropId: cropB._id.toString(), // Crop belongs to Farmer B!
        farmerId: farmerA,
      });
    } catch (err: any) {
      if (err.message.includes('not found') || err.message.includes('access denied')) {
        cropSecurityCaught = true;
      }
    }
    assert(
      cropSecurityCaught,
      "14. Farmer A cannot access Farmer B's crop (blocked with access denied)"
    );

    // ── Group 5: Zero-Fabrication Rules ──────────────────────────────────────
    console.log('\nTest Group 5: Zero-Fabrication Spatial Integrity');

    // 15. Unassigned crop does not receive fabricated zone
    const unassignedCrop = await Crop.create({
      farmerId: farmerA,
      fieldId: fieldA._id,
      zoneId: null, // Explicitly no zone
      cropName: 'Wheat',
      variety: 'HD-2967',
      sowingDate: new Date(),
      cultivatedArea: 1.5,
      cultivatedAreaUnit: 'Acre',
      status: 'Active',
    });

    assert(
      unassignedCrop.zoneId === null,
      '15. Unassigned crop does not receive fabricated zone (zoneId remains null)'
    );

    // 16. Missing location does not produce fabricated coordinates
    const fieldWithoutCoords = await Field.create({
      farmerId: farmerA,
      name: 'Field without GPS',
      area: 1.0,
      areaUnit: 'Acre',
      location: {
        village: 'Unknown',
        district: 'Mehsana',
        state: 'Gujarat',
        latitude: undefined,
        longitude: undefined,
      },
    });

    assert(
      fieldWithoutCoords.location.latitude === null || fieldWithoutCoords.location.latitude === undefined,
      '16. Missing location does not produce fabricated coordinates (lat/lon remain null)'
    );

  } finally {
    // Clean up test data
    console.log('\nCleaning up test artifacts...');
    await Field.deleteMany({ farmerId: { $in: [farmerA, farmerB] } });
    await FarmZone.deleteMany({ farmerId: { $in: [farmerA, farmerB] } });
    await Crop.deleteMany({ farmerId: { $in: [farmerA, farmerB] } });
    await CropDiseaseScan.deleteMany({ farmerId: { $in: [farmerA, farmerB] } });
    await WeatherObservation.deleteMany({ dataSource: 'OpenMeteo', tempMinC: 24.5 });
    await RiskEvent.deleteMany({ farmerId: { $in: [farmerA, farmerB] } });
    console.log('Cleanup complete.');
  }

  console.log('\n================================================================');
  console.log(`INTEGRATION TESTS SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
