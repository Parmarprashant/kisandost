import {
  validateGeoPolygon,
  calculateGeodesicArea,
  convertArea,
  isPointInGeoPolygon,
  generateMonitoringZones,
  resolveGpsPoint,
  GeoPolygon,
} from '../src/lib/geoUtils';

// A realistic farm polygon in Gujarat (approx 200m x 200m, ~10 acres)
const sampleFarmPolygon: GeoPolygon = {
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

console.log('Testing GeoUtils...');

// 1. Validation Test
const validCheck = validateGeoPolygon(sampleFarmPolygon);
console.log('1. Validation Check:', validCheck.valid ? 'PASSED' : 'FAILED', validCheck.error || '');
if (!validCheck.valid) process.exit(1);

// 2. Area Calculation Test
const areaSqM = calculateGeodesicArea(sampleFarmPolygon.coordinates[0]);
const areaAcres = convertArea(areaSqM, 'Acre');
console.log(`2. Area Calculation: ${Math.round(areaSqM)} m² (${areaAcres} Acres)`);
if (areaAcres <= 0) {
  console.error('Failed: Area must be > 0');
  process.exit(1);
}

// 3. Point In Polygon Test
const insidePoint = { latitude: 23.216, longitude: 72.636 };
const outsidePoint = { latitude: 23.220, longitude: 72.640 };

const isInside = isPointInGeoPolygon(insidePoint, sampleFarmPolygon);
const isOutside = !isPointInGeoPolygon(outsidePoint, sampleFarmPolygon);
console.log('3. Inside Point Test:', isInside ? 'PASSED' : 'FAILED');
console.log('4. Outside Point Test:', isOutside ? 'PASSED' : 'FAILED');
if (!isInside || !isOutside) process.exit(1);

// 4. Monitoring Zone Generation Test
const zones = generateMonitoringZones(sampleFarmPolygon, 'Acre');
console.log(`5. Generated ${zones.length} Monitoring Zones:`);
zones.forEach((z) => {
  console.log(`   - ${z.zoneCode}: ${z.zoneName} (${z.area} Acres, ${z.polygon.coordinates[0].length} vertices)`);
});
if (zones.length < 2) {
  console.error('Failed: Expected at least 2 zones');
  process.exit(1);
}

// 5. Point Resolution Test
const mockZoneEntities = zones.map((z, idx) => ({
  _id: `zone_obj_id_${idx + 1}`,
  zoneCode: z.zoneCode,
  zoneName: z.zoneName,
  polygon: z.polygon,
}));

// Point in North-West (lat: 23.2165, lng: 72.6355)
const nwPoint = { latitude: 23.2165, longitude: 72.6355 };
const resNW = resolveGpsPoint(nwPoint, sampleFarmPolygon, mockZoneEntities);
console.log('6. NW Point Resolution:', resNW.insideFarm ? 'INSIDE' : 'OUTSIDE', `Zone: ${resNW.matchedZone?.zoneCode}`);

// Outside point resolution
const resOut = resolveGpsPoint(outsidePoint, sampleFarmPolygon, mockZoneEntities);
console.log('7. Outside Point Resolution:', resOut.insideFarm ? 'INSIDE' : 'OUTSIDE', resOut.message);

if (!resNW.insideFarm || resOut.insideFarm) {
  console.error('Failed: Resolution mismatch');
  process.exit(1);
}

console.log('All GeoUtils tests PASSED successfully!');
