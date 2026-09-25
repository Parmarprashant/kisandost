/**
 * Spatial and Geometric Utilities for AgriShield 360° / My Crop
 * Handles GeoJSON Polygon validation, point-in-polygon tests,
 * spherical area calculation, and deterministic monitoring zone partitioning.
 */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedPolygon?: GeoPolygon;
}

/**
 * Validates that a GeoJSON Polygon structure is compliant and non-degenerate.
 */
export function validateGeoPolygon(polygon: any): ValidationResult {
  if (!polygon || typeof polygon !== 'object') {
    return { valid: false, error: 'Polygon object is required' };
  }

  if (polygon.type !== 'Polygon') {
    return { valid: false, error: 'Geometry type must be "Polygon"' };
  }

  if (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0) {
    return { valid: false, error: 'Polygon coordinates must be a non-empty array' };
  }

  const exteriorRing = polygon.coordinates[0];
  if (!Array.isArray(exteriorRing) || exteriorRing.length < 3) {
    return { valid: false, error: 'Exterior ring must contain at least 3 distinct coordinates' };
  }

  const cleanRing: number[][] = [];

  for (let i = 0; i < exteriorRing.length; i++) {
    const pt = exteriorRing[i];
    if (!Array.isArray(pt) || pt.length < 2) {
      return { valid: false, error: `Invalid coordinate pair at index ${i}` };
    }

    const lng = Number(pt[0]);
    const lat = Number(pt[1]);

    if (isNaN(lng) || isNaN(lat)) {
      return { valid: false, error: `Non-numeric coordinate at index ${i}` };
    }

    if (lng < -180 || lng > 180) {
      return { valid: false, error: `Longitude ${lng} out of range (-180 to 180)` };
    }

    if (lat < -90 || lat > 90) {
      return { valid: false, error: `Latitude ${lat} out of range (-90 to 90)` };
    }

    cleanRing.push([lng, lat]);
  }

  // Ensure ring is closed (first coord === last coord)
  const first = cleanRing[0];
  const last = cleanRing[cleanRing.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    cleanRing.push([first[0], first[1]]);
  }

  if (cleanRing.length < 4) {
    return { valid: false, error: 'A closed polygon ring must contain at least 4 coordinates (3 vertices + closing vertex)' };
  }

  const normalized: GeoPolygon = {
    type: 'Polygon',
    coordinates: [cleanRing],
  };

  // Check that area is greater than 0
  const areaSqM = calculateGeodesicArea(cleanRing);
  if (areaSqM < 1) {
    return { valid: false, error: 'Polygon area is too small or self-collapsed' };
  }

  return {
    valid: true,
    normalizedPolygon: normalized,
  };
}

/**
 * Calculates geodesic surface area in square meters using Shoelace formula
 * with spherical projection correction for Earth curvature.
 */
export function calculateGeodesicArea(ring: number[][]): number {
  if (!ring || ring.length < 3) return 0;

  const EARTH_RADIUS = 6378137; // meters
  let total = 0;

  // Convert to radians
  const coordsRad = ring.map(([lng, lat]) => [
    (lng * Math.PI) / 180,
    (lat * Math.PI) / 180,
  ]);

  const len = coordsRad.length;
  for (let i = 0; i < len - 1; i++) {
    const p1 = coordsRad[i];
    const p2 = coordsRad[i + 1];
    total += (p2[0] - p1[0]) * (2 + Math.sin(p1[1]) + Math.sin(p2[1]));
  }

  let area = Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2);
  return area;
}

/**
 * Converts area in square meters to Acres or Hectares.
 */
export function convertArea(areaSqM: number, unit: 'Acre' | 'Hectare' = 'Acre'): number {
  if (unit === 'Hectare') {
    return Math.round((areaSqM / 10000) * 100) / 100;
  }
  // 1 Acre = 4046.8564224 square meters
  return Math.round((areaSqM / 4046.8564224) * 100) / 100;
}

/**
 * Standard Ray-Casting algorithm for Point-in-Polygon testing.
 * Point: [longitude, latitude]
 * Ring: Array of [longitude, latitude]
 */
export function isPointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Checks whether a GPS coordinate is inside a GeoJSON Polygon.
 */
export function isPointInGeoPolygon(point: { latitude: number; longitude: number }, polygon: GeoPolygon): boolean {
  if (!polygon || !polygon.coordinates || polygon.coordinates.length === 0) return false;
  const exterior = polygon.coordinates[0];
  return isPointInRing([point.longitude, point.latitude], exterior);
}

/**
 * Resolves a GPS coordinate against a Field boundary and its monitoring zones.
 */
export function resolveGpsPoint(
  point: { latitude: number; longitude: number },
  fieldBoundary?: GeoPolygon,
  zones: Array<{ _id: any; zoneCode: string; zoneName: string; polygon?: GeoPolygon }> = []
): {
  insideFarm: boolean;
  matchedZone: { zoneId: string; zoneCode: string; zoneName: string } | null;
  message: string;
} {
  if (!fieldBoundary || !fieldBoundary.coordinates || fieldBoundary.coordinates.length === 0) {
    return {
      insideFarm: false,
      matchedZone: null,
      message: 'Field does not have a saved boundary polygon.',
    };
  }

  const insideFarm = isPointInGeoPolygon(point, fieldBoundary);
  if (!insideFarm) {
    return {
      insideFarm: false,
      matchedZone: null,
      message: 'Point is outside farm boundary.',
    };
  }

  // Find matching zone
  for (const z of zones) {
    if (z.polygon && isPointInGeoPolygon(point, z.polygon)) {
      return {
        insideFarm: true,
        matchedZone: {
          zoneId: z._id?.toString() || '',
          zoneCode: z.zoneCode,
          zoneName: z.zoneName,
        },
        message: `Coordinate is inside monitoring zone ${z.zoneCode} (${z.zoneName}).`,
      };
    }
  }

  return {
    insideFarm: true,
    matchedZone: null,
    message: 'Coordinate is inside the farm boundary, but does not match a designated monitoring zone.',
  };
}

/**
 * Sutherland-Hodgman Polygon Clipping algorithm against an axis-aligned box [minX, minY, maxX, maxY].
 */
function clipPolygonAgainstBox(
  subjectPolygon: number[][],
  box: [number, number, number, number]
): number[][] {
  const [minX, minY, maxX, maxY] = box;

  type Edge = {
    inside: (p: number[]) => boolean;
    intersection: (cp1: number[], cp2: number[]) => number[];
  };

  const edges: Edge[] = [
    // Left edge (x = minX)
    {
      inside: (p) => p[0] >= minX,
      intersection: (cp1, cp2) => [
        minX,
        cp1[1] + ((cp2[1] - cp1[1]) * (minX - cp1[0])) / (cp2[0] - cp1[0]),
      ],
    },
    // Right edge (x = maxX)
    {
      inside: (p) => p[0] <= maxX,
      intersection: (cp1, cp2) => [
        maxX,
        cp1[1] + ((cp2[1] - cp1[1]) * (maxX - cp1[0])) / (cp2[0] - cp1[0]),
      ],
    },
    // Bottom edge (y = minY)
    {
      inside: (p) => p[1] >= minY,
      intersection: (cp1, cp2) => [
        cp1[0] + ((cp2[0] - cp1[0]) * (minY - cp1[1])) / (cp2[1] - cp1[1]),
        minY,
      ],
    },
    // Top edge (y = maxY)
    {
      inside: (p) => p[1] <= maxY,
      intersection: (cp1, cp2) => [
        cp1[0] + ((cp2[0] - cp1[0]) * (maxY - cp1[1])) / (cp2[1] - cp1[1]),
        maxY,
      ],
    },
  ];

  let outputList = subjectPolygon.slice();

  for (const edge of edges) {
    if (outputList.length === 0) break;
    const inputList = outputList.slice();
    outputList = [];

    // Ensure input list is not circularly closed for the loop
    const closedInput = inputList[0][0] === inputList[inputList.length - 1][0] &&
      inputList[0][1] === inputList[inputList.length - 1][1]
        ? inputList
        : [...inputList, inputList[0]];

    let s = closedInput[closedInput.length - 2];

    for (let i = 0; i < closedInput.length - 1; i++) {
      const e = closedInput[i];
      if (edge.inside(e)) {
        if (edge.inside(s)) {
          outputList.push(e);
        } else {
          outputList.push(edge.intersection(s, e));
          outputList.push(e);
        }
      } else if (edge.inside(s)) {
        outputList.push(edge.intersection(s, e));
      }
      s = e;
    }
  }

  // Re-close the ring if it has at least 3 vertices
  if (outputList.length >= 3) {
    const first = outputList[0];
    const last = outputList[outputList.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      outputList.push([first[0], first[1]]);
    }
  }

  return outputList;
}

export interface GeneratedZoneDescriptor {
  zoneCode: string;
  zoneName: string;
  polygon: GeoPolygon;
  area: number;
}

/**
 * Deterministic MVP Monitoring Zone Partitioning.
 * Divides the farm polygon into up to 4 quadrant monitoring zones (Z01 - NW, Z02 - NE, Z03 - SW, Z04 - SE).
 * Guaranteed to remain strictly inside the farm boundary.
 */
export function generateMonitoringZones(
  boundary: GeoPolygon,
  areaUnit: 'Acre' | 'Hectare' = 'Acre'
): GeneratedZoneDescriptor[] {
  if (!boundary || !boundary.coordinates || boundary.coordinates.length === 0) {
    return [];
  }

  const ring = boundary.coordinates[0];
  if (ring.length < 4) return [];

  // 1. Calculate bounding box
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const midLng = (minLng + maxLng) / 2;
  const midLat = (minLat + maxLat) / 2;

  // 2. Define 4 quadrant bounding boxes
  const quadrants: Array<{
    code: string;
    name: string;
    box: [number, number, number, number];
  }> = [
    {
      code: 'Z01',
      name: 'North-West Sector',
      box: [minLng, midLat, midLng, maxLat],
    },
    {
      code: 'Z02',
      name: 'North-East Sector',
      box: [midLng, midLat, maxLng, maxLat],
    },
    {
      code: 'Z03',
      name: 'South-West Sector',
      box: [minLng, minLat, midLng, midLat],
    },
    {
      code: 'Z04',
      name: 'South-East Sector',
      box: [midLng, minLat, maxLng, midLat],
    },
  ];

  const generatedZones: GeneratedZoneDescriptor[] = [];

  for (const q of quadrants) {
    const clippedRing = clipPolygonAgainstBox(ring, q.box);
    if (clippedRing.length >= 4) {
      const areaSqM = calculateGeodesicArea(clippedRing);
      // Only include zone if it has a non-trivial area (> 50 sq meters)
      if (areaSqM > 50) {
        generatedZones.push({
          zoneCode: q.code,
          zoneName: q.name,
          polygon: {
            type: 'Polygon',
            coordinates: [clippedRing],
          },
          area: convertArea(areaSqM, areaUnit),
        });
      }
    }
  }

  // Fallback: If clipping yielded fewer than 2 zones (e.g. narrow diagonal sliver),
  // split into 2 halves along the longest axis
  if (generatedZones.length < 2) {
    const lngSpan = maxLng - minLng;
    const latSpan = maxLat - minLat;

    let half1Box: [number, number, number, number];
    let half2Box: [number, number, number, number];

    let half1Name: string;
    let half2Name: string;

    if (lngSpan >= latSpan) {
      // Split West / East
      half1Box = [minLng, minLat, midLng, maxLat];
      half2Box = [midLng, minLat, maxLng, maxLat];
      half1Name = 'West Sector';
      half2Name = 'East Sector';
    } else {
      // Split South / North
      half1Box = [minLng, midLat, maxLng, maxLat];
      half2Box = [minLng, minLat, maxLng, midLat];
      half1Name = 'North Sector';
      half2Name = 'South Sector';
    }

    const z1Ring = clipPolygonAgainstBox(ring, half1Box);
    const z2Ring = clipPolygonAgainstBox(ring, half2Box);

    const fallbackZones: GeneratedZoneDescriptor[] = [];
    if (z1Ring.length >= 4) {
      const a1 = calculateGeodesicArea(z1Ring);
      if (a1 > 50) {
        fallbackZones.push({
          zoneCode: 'Z01',
          zoneName: half1Name,
          polygon: { type: 'Polygon', coordinates: [z1Ring] },
          area: convertArea(a1, areaUnit),
        });
      }
    }
    if (z2Ring.length >= 4) {
      const a2 = calculateGeodesicArea(z2Ring);
      if (a2 > 50) {
        fallbackZones.push({
          zoneCode: 'Z02',
          zoneName: half2Name,
          polygon: { type: 'Polygon', coordinates: [z2Ring] },
          area: convertArea(a2, areaUnit),
        });
      }
    }

    if (fallbackZones.length > 0) {
      return fallbackZones;
    }

    // Absolute fallback: Single zone encompassing the entire field
    const entireArea = calculateGeodesicArea(ring);
    return [
      {
        zoneCode: 'Z01',
        zoneName: 'Central Monitoring Zone',
        polygon: boundary,
        area: convertArea(entireArea, areaUnit),
      },
    ];
  }

  return generatedZones;
}
