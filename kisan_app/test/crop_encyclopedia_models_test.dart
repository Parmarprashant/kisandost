import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/crop_encyclopedia_models.dart';

void main() {
  group('CropEncyclopediaItem', () {
    test('parses localized crop data with disease management', () {
      final json = {
        'id': 'cotton',
        'name': {'en': 'Cotton', 'hi': 'कपास', 'gu': 'કપાસ'},
        'image': 'https://example.test/cotton.png',
        'season': {'en': 'Kharif', 'hi': 'खरीफ', 'gu': 'ખરીફ'},
        'soilType': {'en': 'Black Soil', 'hi': 'काली मिट्टी', 'gu': 'કાળી માટી'},
        'waterNeed': {'en': 'Moderate', 'hi': 'मध्यम', 'gu': 'મધ્યમ'},
        'health': 'Healthy',
        'ndvi': 0.68,
        'precautions': {
          'en': 'Use pheromone traps',
          'hi': 'फेरोमोन जाल लगाएं',
          'gu': 'ફેરોમોન ટ્રેપ્સ લગાવો',
        },
        'diseases': [
          {
            'name': {'en': 'Pink Bollworm', 'hi': 'गुलाबी सुंडी', 'gu': 'ગુલાબી ઈયળ'},
            'symptoms': {'en': 'Rosetted flowers', 'hi': 'गुलाब जैसे फूल', 'gu': 'ગુલાબ જેવું ફૂલ'},
            'favorableConditions': {'en': 'High humidity', 'hi': 'उच्च आर्द्रता', 'gu': 'ઉચ્ચ ભેજ'},
            'management': {'en': 'Spray Profenophos 50 EC', 'hi': 'प्रोफेनोफोस 50 EC छिड़कें', 'gu': 'પ્રોફેનોફોસ છાંટો'},
            'icon': '🐛',
          }
        ],
      };

      final crop = CropEncyclopediaItem.fromJson(json);

      expect(crop.id, 'cotton');
      expect(crop.name.localized('en'), 'Cotton');
      expect(crop.name.localized('hi'), 'कपास');
      expect(crop.name.localized('gu'), 'કપાસ');
      expect(crop.season.localized('gu'), 'ખરીફ');
      expect(crop.soilType.localized('hi'), 'काली मिट्टी');
      expect(crop.diseases, hasLength(1));

      final disease = crop.diseases.first;
      expect(disease.name.localized('en'), 'Pink Bollworm');
      expect(disease.management.localized('en'), 'Spray Profenophos 50 EC');
      expect(disease.icon, '🐛');
    });

    test('bundled asset assets/crop_encyclopedia.json loads and parses', () {
      final file = File('assets/crop_encyclopedia.json');
      expect(file.existsSync(), isTrue);

      final raw = file.readAsStringSync();
      final decoded = jsonDecode(raw) as List;
      expect(decoded, isNotEmpty);

      final crops = decoded
          .whereType<Map<String, dynamic>>()
          .map(CropEncyclopediaItem.fromJson)
          .toList();

      expect(crops.length, greaterThanOrEqualTo(5));
      for (final crop in crops) {
        expect(crop.name.en, isNotEmpty);
        expect(crop.id, isNotEmpty);
      }
    });
  });
}
