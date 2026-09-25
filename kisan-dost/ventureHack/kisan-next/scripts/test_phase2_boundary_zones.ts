import fs from 'fs';
import path from 'path';
import {
  validateGeoPolygon,
  calculateGeodesicArea,
  convertArea,
  isPointInGeoPolygon,
  generateMonitoringZones,
  resolveGpsPoint,
  GeoPolygon,
} from '../src/lib/geoUtils';

// Colors for terminal output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';

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

async function runTests() {
  console.log(`\n${CYAN}================================================================${RESET}`);
  console.log(`${CYAN}🧪 PHASE 2 — FARM BOUNDARY & MONITORING ZONES TEST SUITE${RESET}`);
  console.log(`${CYAN}================================================================${RESET}\n`);

  // Sample Gujarati farm polygon (approx 10 acres near Gandhinagar)
  const sampleValidPolygon: GeoPolygon = {
    type: 'Polygon',
    coordinates: [
      [
        [72.635, 23.215],
        [72.637, 23.215],
        [72.637, 23.217],
        [72.635, 23.217],
        [72.635, 23.215],
      ],
    ],
  };

  // -------------------------------------------------------------
  // Test Group 1: Polygon Validation
  // -------------------------------------------------------------
  console.log('Test Group 1: Polygon Validation');
  const validRes = validateGeoPolygon(sampleValidPolygon);
  assert(validRes.valid === true, 'Valid 5-vertex closed polygon passes validation');
  assert(validRes.normalizedPolygon !== undefined, 'Normalized polygon is returned');

  // Unclosed polygon (4 points) should be auto-closed
  const unclosedPolygon: GeoPolygon = {
    type: 'Polygon',
    coordinates: [
      [
        [72.635, 23.215],
        [72.637, 23.215],
        [72.637, 23.217],
        [72.635, 23.217],
      ],
    ],
  };
  const unclosedRes = validateGeoPolygon(unclosedPolygon);
  assert(unclosedRes.valid === true, 'Unclosed 4-vertex polygon is auto-closed into a valid ring');
  assert(unclosedRes.normalizedPolygon?.coordinates[0].length === 5, 'Auto-closed ring has 5 coordinates');

  // Invalid: Collapsed/single-point polygon
  const collapsedPolygon: any = {
    type: 'Polygon',
    coordinates: [[[72.635, 23.215], [72.635, 23.215], [72.635, 23.215]]],
  };
  const collapsedRes = validateGeoPolygon(collapsedPolygon);
  assert(collapsedRes.valid === false, 'Collapsed zero-area polygon is rejected');

  // Invalid: Out-of-range coordinates
  const outOfRangePolygon: any = {
    type: 'Polygon',
    coordinates: [[[195.0, 23.215], [72.637, 23.215], [72.637, 23.217], [195.0, 23.215]]],
  };
  const outOfRangeRes = validateGeoPolygon(outOfRangePolygon);
  assert(outOfRangeRes.valid === false, 'Out-of-range longitude coordinate is rejected');

  // Invalid: Wrong geometry type
  const wrongType: any = {
    type: 'Point',
    coordinates: [72.635, 23.215],
  };
  const wrongTypeRes = validateGeoPolygon(wrongType);
  assert(wrongTypeRes.valid === false, 'Non-Polygon geometry type is rejected');

  // -------------------------------------------------------------
  // Test Group 2: Geodesic Area Calculation
  // -------------------------------------------------------------
  console.log('\nTest Group 2: Geodesic Area Calculation');
  const areaSqM = calculateGeodesicArea(sampleValidPolygon.coordinates[0]);
  const areaAcres = convertArea(areaSqM, 'Acre');
  const areaHectares = convertArea(areaSqM, 'Hectare');
  assert(areaSqM > 40000 && areaSqM < 50000, `Area calculation produces realistic ~45,500 m² (got ${Math.round(areaSqM)} m²)`);
  assert(areaAcres > 10 && areaAcres < 12, `Area in Acres converts accurately to ~11.26 Acres (got ${areaAcres})`);
  assert(areaHectares > 4 && areaHectares < 5, `Area in Hectares converts accurately to ~4.55 Ha (got ${areaHectares})`);

  // -------------------------------------------------------------
  // Test Group 3: Point-in-Polygon Tests
  // -------------------------------------------------------------
  console.log('\nTest Group 3: Point-in-Polygon Tests');
  const insideCenter = { latitude: 23.216, longitude: 72.636 };
  const insideEdge = { latitude: 23.2151, longitude: 72.6351 };
  const outsideNorth = { latitude: 23.225, longitude: 72.636 };
  const outsideEast = { latitude: 23.216, longitude: 72.650 };

  assert(isPointInGeoPolygon(insideCenter, sampleValidPolygon) === true, 'Center point inside farm evaluates to TRUE');
  assert(isPointInGeoPolygon(insideEdge, sampleValidPolygon) === true, 'Near-boundary point inside farm evaluates to TRUE');
  assert(isPointInGeoPolygon(outsideNorth, sampleValidPolygon) === false, 'Point north of farm boundary evaluates to FALSE');
  assert(isPointInGeoPolygon(outsideEast, sampleValidPolygon) === false, 'Point east of farm boundary evaluates to FALSE');

  // -------------------------------------------------------------
  // Test Group 4: Monitoring Zone Generation & Enclosure
  // -------------------------------------------------------------
  console.log('\nTest Group 4: Monitoring Zone Generation');
  const zones = generateMonitoringZones(sampleValidPolygon, 'Acre');
  assert(zones.length === 4, `Deterministic quadrant partitioning yields exactly 4 monitoring zones (got ${zones.length})`);

  const zoneCodes = zones.map((z) => z.zoneCode);
  assert(
    zoneCodes.includes('Z01') &&
    zoneCodes.includes('Z02') &&
    zoneCodes.includes('Z03') &&
    zoneCodes.includes('Z04'),
    'All zones have standard codes Z01, Z02, Z03, Z04'
  );

  // Verify that every vertex of every generated zone is inside or on the farm boundary
  let allVerticesInside = true;
  for (const z of zones) {
    for (const [lng, lat] of z.polygon.coordinates[0]) {
      // allow small floating point margin (0.00001 deg ~ 1 meter)
      const isInside = isPointInGeoPolygon({ latitude: lat, longitude: lng }, sampleValidPolygon) ||
        (lng >= 72.63499 && lng <= 72.63701 && lat >= 23.21499 && lat <= 23.21701);
      if (!isInside) {
        allVerticesInside = false;
        break;
      }
    }
  }
  assert(allVerticesInside === true, 'All generated monitoring zone vertices remain strictly within the farm boundary');

  // Verify sum of zone areas approximates field area
  const sumZoneArea = zones.reduce((s, z) => s + z.area, 0);
  assert(
    Math.abs(sumZoneArea - areaAcres) < 0.5,
    `Sum of zone areas (${sumZoneArea.toFixed(2)}) matches field area (${areaAcres}) within 0.5 Acre tolerance`
  );

  // -------------------------------------------------------------
  // Test Group 5: GPS Coordinate Resolution to Zones
  // -------------------------------------------------------------
  console.log('\nTest Group 5: GPS Coordinate Resolution');
  const mockZoneEntities = zones.map((z, idx) => ({
    _id: `zone_mock_id_${idx + 1}`,
    zoneCode: z.zoneCode,
    zoneName: z.zoneName,
    polygon: z.polygon,
  }));

  // NW Sector Point (lat: 23.2165, lng: 72.6355)
  const nwRes = resolveGpsPoint(
    { latitude: 23.2165, longitude: 72.6355 },
    sampleValidPolygon,
    mockZoneEntities
  );
  assert(nwRes.insideFarm === true, 'NW coordinate is inside farm');
  assert(nwRes.matchedZone?.zoneCode === 'Z01', `NW coordinate correctly resolves to Zone Z01 (got ${nwRes.matchedZone?.zoneCode})`);

  // NE Sector Point (lat: 23.2165, lng: 72.6365)
  const neRes = resolveGpsPoint(
    { latitude: 23.2165, longitude: 72.6365 },
    sampleValidPolygon,
    mockZoneEntities
  );
  assert(neRes.insideFarm === true, 'NE coordinate is inside farm');
  assert(neRes.matchedZone?.zoneCode === 'Z02', `NE coordinate correctly resolves to Zone Z02 (got ${neRes.matchedZone?.zoneCode})`);

  // SW Sector Point (lat: 23.2155, longitude: 72.6355)
  const swRes = resolveGpsPoint(
    { latitude: 23.2155, longitude: 72.6355 },
    sampleValidPolygon,
    mockZoneEntities
  );
  assert(swRes.insideFarm === true, 'SW coordinate is inside farm');
  assert(swRes.matchedZone?.zoneCode === 'Z03', `SW coordinate correctly resolves to Zone Z03 (got ${swRes.matchedZone?.zoneCode})`);

  // SE Sector Point (lat: 23.2155, longitude: 72.6365)
  const seRes = resolveGpsPoint(
    { latitude: 23.2155, longitude: 72.6365 },
    sampleValidPolygon,
    mockZoneEntities
  );
  assert(seRes.insideFarm === true, 'SE coordinate is inside farm');
  assert(seRes.matchedZone?.zoneCode === 'Z04', `SE coordinate correctly resolves to Zone Z04 (got ${seRes.matchedZone?.zoneCode})`);

  // Outside Farm Point
  const outRes = resolveGpsPoint(outsideNorth, sampleValidPolygon, mockZoneEntities);
  assert(outRes.insideFarm === false, 'Outside coordinate returns insideFarm === false');
  assert(outRes.matchedZone === null, 'Outside coordinate has matchedZone === null');

  // Field with no boundary
  const noBoundaryRes = resolveGpsPoint(insideCenter, undefined, mockZoneEntities);
  assert(noBoundaryRes.insideFarm === false, 'Field with undefined boundary safely returns insideFarm === false');

  // -------------------------------------------------------------
  // Test Group 6: Backward Compatibility & File System Audit
  // -------------------------------------------------------------
  console.log('\nTest Group 6: Backward Compatibility & File Integrity');
  const fieldModelPath = path.resolve(__dirname, '../src/models/Field.ts');
  const cropModelPath = path.resolve(__dirname, '../src/models/Crop.ts');
  const farmZonePath = path.resolve(__dirname, '../src/models/FarmZone.ts');

  assert(fs.existsSync(fieldModelPath), 'Field.ts model exists');
  assert(fs.existsSync(cropModelPath), 'Crop.ts model exists');
  assert(fs.existsSync(farmZonePath), 'FarmZone.ts model exists');

  const fieldContent = fs.readFileSync(fieldModelPath, 'utf-8');
  assert(fieldContent.includes('boundary?: IGeoPolygon'), 'Field.ts preserves optional boundary');
  assert(fieldContent.includes('location: IFieldLocation'), 'Field.ts preserves centroid location');
  assert(fieldContent.includes('soil: ISoilInfo'), 'Field.ts preserves soil info');
  assert(fieldContent.includes('irrigation: IIrrigationInfo'), 'Field.ts preserves irrigation info');

  const cropContent = fs.readFileSync(cropModelPath, 'utf-8');
  assert(cropContent.includes('export const CropCycle = Crop;'), 'Crop.ts exports CropCycle alias without duplicate models');

  // -------------------------------------------------------------
  // Test Summary
  // -------------------------------------------------------------
  console.log(`\n${CYAN}================================================================${RESET}`);
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Tests Passed: ${GREEN}${passedTests}${RESET}`);
  console.log(`Tests Failed: ${passedTests === totalTests ? GREEN + '0' : RED + (totalTests - passedTests)}${RESET}`);
  console.log(`${CYAN}================================================================${RESET}\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
