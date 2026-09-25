import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/district_suggestion_repository.dart';

void main() {
  group('DistrictData', () {
    test('parses district data json', () {
      final json = {
        'district': 'Ahmedabad',
        'season': 'Kharif',
        'water_availability': 'Medium',
        'crops': ['Cotton', 'Groundnut', 'Maize'],
        'reason': 'These crops give good yield with moderate water.'
      };

      final data = DistrictData.fromJson(json);

      expect(data.district, 'Ahmedabad');
      expect(data.season, 'Kharif');
      expect(data.waterAvailability, 'Medium');
      expect(data.crops, ['Cotton', 'Groundnut', 'Maize']);
      expect(data.reason, contains('moderate water'));
    });

    test('bundled asset assets/districts_dataset.json loads all 33 Gujarat districts', () {
      final file = File('assets/districts_dataset.json');
      expect(file.existsSync(), isTrue);

      final raw = file.readAsStringSync();
      final decoded = jsonDecode(raw) as List;
      final districts = decoded
          .whereType<Map<String, dynamic>>()
          .map(DistrictData.fromJson)
          .toList();

      expect(districts.length, 33);
      expect(districts.any((d) => d.district == 'Rajkot'), isTrue);
      expect(districts.any((d) => d.district == 'Surat'), isTrue);
    });
  });
}
