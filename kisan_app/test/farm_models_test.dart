import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/farm_models.dart';

/// Captured verbatim from `POST /api/fields`. Note the nulls: the route fills
/// in every unsent nested key rather than omitting it.
const _fieldJson = '''
{
  "farmerId": "6ab55617d5be956e2fbf7294",
  "name": "North Plot",
  "area": 2.5,
  "areaUnit": "Acre",
  "location": {
    "village": "Anand", "taluka": "Anand", "district": "Anand",
    "state": "Gujarat", "latitude": null, "longitude": null
  },
  "soil": {
    "type": "Black Soil", "soilTestAvailable": false, "pH": null,
    "nitrogen": null, "phosphorus": null, "potassium": null,
    "organicCarbon": null
  },
  "irrigation": {
    "method": "Drip", "waterSource": "Borewell", "frequency": "Weekly"
  },
  "previousCrop": "Wheat",
  "_id": "6ab557e5d5be956e2fbf729c"
}
''';

/// Captured verbatim from `POST /api/fields/[id]/crops`.
const _cropJson = '''
{
  "farmerId": "6ab55617d5be956e2fbf7294",
  "fieldId": "6ab557e5d5be956e2fbf729c",
  "cropName": "Cotton",
  "cropMasterId": "",
  "variety": "Bt Cotton",
  "sowingDate": "2026-06-15T00:00:00.000Z",
  "cultivatedArea": 2,
  "cultivatedAreaUnit": "Acre",
  "cultivationMethod": "Direct Sowing",
  "status": "Active",
  "notes": "test",
  "_id": "6ab55800d5be956e2fbf72a3"
}
''';

void main() {
  group('Field', () {
    late Field field;

    setUp(() {
      field = Field.fromJson(jsonDecode(_fieldJson) as Map<String, dynamic>);
    });

    test('parses the real payload', () {
      expect(field.id, '6ab557e5d5be956e2fbf729c');
      expect(field.name, 'North Plot');
      expect(field.area, 2.5);
      expect(field.location.village, 'Anand');
      expect(field.soil.type, 'Black Soil');
      expect(field.irrigation.method, 'Drip');
      expect(field.previousCrop, 'Wheat');
    });

    test('treats the nulls the route sends as absent', () {
      // Everything unsent comes back as an explicit null, which must not
      // become the string "null" or a zero.
      expect(field.location.latitude, isNull);
      expect(field.soil.pH, isNull);
      expect(field.soil.hasTestValues, isFalse);
      expect(field.location.hasCoordinates, isFalse);
    });

    test('formats the area without a pointless decimal', () {
      // Farmers write whole acres far more often than not.
      expect(field.areaLabel, '2.5 Acre');
      expect(
        Field.fromJson({'area': 2.0, 'areaUnit': 'Acre'}).areaLabel,
        '2 Acre',
      );
    });

    test('builds a location label from village outwards', () {
      // The real record has village, taluka and district all named "Anand",
      // which is ordinary across much of India. Repeating it three times
      // reads as a bug, so consecutive repeats are collapsed.
      expect(field.location.label, 'Anand, Gujarat');
    });

    test('keeps distinct parts that merely look similar', () {
      final distinct = FieldLocation.fromJson({
        'village': 'Anand',
        'taluka': 'Petlad',
        'district': 'Anand',
        'state': 'Gujarat',
      });
      // Only *consecutive* repeats collapse — Anand/Petlad/Anand is real.
      expect(distinct.label, 'Anand, Petlad, Anand, Gujarat');
    });

    test('skips missing parts of the location label', () {
      final sparse = FieldLocation.fromJson({
        'village': 'Anand',
        'district': '',
        'state': 'Gujarat',
      });
      expect(sparse.label, 'Anand, Gujarat');
    });

    group('weather query', () {
      test('prefers coordinates when the field has them', () {
        final located = FieldLocation.fromJson({
          'latitude': 22.556789,
          'longitude': 72.951234,
          'district': 'Anand',
        });
        // Trimmed to village-level precision so the weather cache key stays
        // stable as the phone's GPS fix drifts.
        expect(located.weatherQuery, '22.557,72.951');
      });

      test('falls back to the district', () {
        expect(field.location.weatherQuery, 'Anand,India');
      });

      test('is null when there is nothing to go on', () {
        expect(FieldLocation.fromJson(const {}).weatherQuery, isNull);
      });
    });

    test('round-trips location through toJson', () {
      final json = field.location.toJson();
      expect(json['village'], 'Anand');
      // Nulls are omitted rather than sent, so the API keeps its own defaults.
      expect(json.containsKey('latitude'), isFalse);
    });

    test('survives an empty payload', () {
      final empty = Field.fromJson(const {});
      expect(empty.name, isEmpty);
      expect(empty.area, 0);
      expect(empty.areaUnit, 'Acre');
      expect(empty.crops, isEmpty);
    });
  });

  group('Crop', () {
    late Crop crop;

    setUp(() {
      crop = Crop.fromJson(jsonDecode(_cropJson) as Map<String, dynamic>);
    });

    test('parses the real payload', () {
      expect(crop.cropName, 'Cotton');
      expect(crop.variety, 'Bt Cotton');
      expect(crop.cultivatedArea, 2);
      expect(crop.status, 'Active');
      expect(crop.isActive, isTrue);
      expect(crop.sowingDate, DateTime.parse('2026-06-15T00:00:00.000Z'));
    });

    test('treats an empty string field as absent', () {
      // `cropMasterId` comes back as "" — the same pattern applies to variety.
      final blank = Crop.fromJson({'cropName': 'Wheat', 'variety': ''});
      expect(blank.variety, isNull);
    });

    test('counts days after sowing', () {
      final tenDaysAgo = DateTime.now().subtract(const Duration(days: 10));
      final sown = Crop.fromJson({
        'cropName': 'Wheat',
        'sowingDate': tenDaysAgo.toIso8601String(),
      });
      expect(sown.daysAfterSowing, 10);
    });

    test('never reports negative days for a future sowing date', () {
      // The picker forbids it, but a bad record should not render "Day -3".
      final future = DateTime.now().add(const Duration(days: 3));
      final sown = Crop.fromJson({
        'cropName': 'Wheat',
        'sowingDate': future.toIso8601String(),
      });
      expect(sown.daysAfterSowing, 0);
    });

    test('a harvested crop is not active', () {
      expect(
        Crop.fromJson({'cropName': 'Wheat', 'status': 'Harvested'}).isActive,
        isFalse,
      );
    });
  });

  group('wizard options', () {
    test('every choice offers a way out', () {
      // The web wizard silently defaults to Black Soil / Drip / Borewell, so a
      // farmer who taps through stores confident-looking data nobody entered —
      // and that data feeds the fertiliser calculator.
      expect(soilTypes, contains(dontKnow));
      expect(irrigationMethods, contains(dontKnow));
      expect(waterSources, contains(dontKnow));
      expect(irrigationFrequencies, contains(dontKnow));
    });

    test('options have no duplicates', () {
      for (final list in [
        soilTypes,
        irrigationMethods,
        waterSources,
        irrigationFrequencies,
        cultivationMethods,
        areaUnits,
      ]) {
        expect(list.toSet(), hasLength(list.length));
      }
    });
  });
}
