import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/boundary_models.dart';
import 'package:latlong2/latlong.dart';

void main() {
  group('FieldBoundaryInfo', () {
    test('parses GeoJSON polygon boundary with center coordinates', () {
      final json = {
        'fieldId': 'fld_101',
        'fieldName': 'North Cotton Plot',
        'hasBoundary': true,
        'boundary': {
          'type': 'Polygon',
          'coordinates': [
            [
              [71.1924, 22.2587],
              [71.1950, 22.2587],
              [71.1950, 22.2610],
              [71.1924, 22.2610],
              [71.1924, 22.2587],
            ]
          ]
        },
        'area': 3.5,
        'areaUnit': 'Acres',
        'calculatedArea': 3.48,
        'zoneCount': 4,
        'location': {
          'latitude': 22.2598,
          'longitude': 71.1937,
        },
      };

      final info = FieldBoundaryInfo.fromJson(json);

      expect(info.fieldId, 'fld_101');
      expect(info.fieldName, 'North Cotton Plot');
      expect(info.hasBoundary, isTrue);
      expect(info.points, hasLength(5));
      expect(info.points.first.latitude, 22.2587);
      expect(info.points.first.longitude, 71.1924);
      expect(info.area, 3.5);
      expect(info.calculatedArea, 3.48);
      expect(info.zoneCount, 4);
      expect(info.centerLat, 22.2598);
      expect(info.centerLng, 71.1937);
    });

    test('toGeoJsonPolygon closes unclosed loops', () {
      const info = FieldBoundaryInfo(
        fieldId: 'f1',
        fieldName: 'P1',
        hasBoundary: true,
        points: [],
        area: 1.0,
        areaUnit: 'Acres',
        zoneCount: 0,
      );

      final pts = [
        const LatLng(20.0, 70.0),
        const LatLng(20.0, 71.0),
        const LatLng(21.0, 71.0),
      ];

      final geoJson = info.toGeoJsonPolygon(pts);
      final ring = (geoJson['coordinates'] as List).first as List;

      expect(ring, hasLength(4));
      expect(ring.first, ring.last);
      expect(ring.first, [70.0, 20.0]);
    });

    test('calculateAreaInAcres returns sensible positive area for valid polygon', () {
      final pts = [
        const LatLng(22.2587, 71.1924),
        const LatLng(22.2587, 71.1950),
        const LatLng(22.2610, 71.1950),
        const LatLng(22.2610, 71.1924),
      ];

      final area = FieldBoundaryInfo.calculateAreaInAcres(pts);
      expect(area, greaterThan(0.0));
      expect(area, lessThan(100.0)); // Small farm plot
    });

    test('calculateAreaInAcres returns 0 for fewer than 3 vertices', () {
      expect(FieldBoundaryInfo.calculateAreaInAcres([]), 0.0);
      expect(
        FieldBoundaryInfo.calculateAreaInAcres([const LatLng(22.0, 71.0)]),
        0.0,
      );
      expect(
        FieldBoundaryInfo.calculateAreaInAcres([
          const LatLng(22.0, 71.0),
          const LatLng(22.1, 71.1),
        ]),
        0.0,
      );
    });
  });

  group('ZoneItem', () {
    test('parses zone item with polygon and status', () {
      final json = {
        '_id': 'zn_01',
        'zoneCode': 'Z1',
        'zoneName': 'Zone 1 - High Moisture',
        'areaFraction': 0.25,
        'healthStatus': 'WARNING',
        'polygon': {
          'coordinates': [
            [
              [71.1, 22.1],
              [71.2, 22.1],
              [71.2, 22.2],
              [71.1, 22.2],
            ]
          ]
        }
      };

      final zone = ZoneItem.fromJson(json);
      expect(zone.id, 'zn_01');
      expect(zone.zoneCode, 'Z1');
      expect(zone.zoneName, 'Zone 1 - High Moisture');
      expect(zone.areaFraction, 0.25);
      expect(zone.healthStatus, 'WARNING');
      expect(zone.points, hasLength(4));
    });
  });
}
