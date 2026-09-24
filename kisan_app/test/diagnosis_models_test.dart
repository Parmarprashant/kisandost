import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/diagnosis/data/diagnosis_models.dart';

/// Shaped after what `/api/detect-disease` returns once it has normalised the
/// AgriVision payload and matched marketplace products.
const _infected = '''
{
  "cropName": "Cotton",
  "diseaseName": "Bacterial Blight",
  "confidence": 94,
  "description": "A bacterial infection spread by rain splash and warm humid weather.",
  "symptoms": ["Angular water-soaked spots", "Dark brown lesions with yellow halos"],
  "causes": ["Xanthomonas infection", "High humidity above 85%"],
  "precautions": ["Remove and burn infected leaves", "Avoid overhead irrigation"],
  "recommendedPesticides": [
    { "name": "Blitox 50", "productId": "AGP-001", "price": 340, "brand": "Tata" }
  ],
  "recommendedFertilizers": [
    { "name": "Potash", "productId": null, "price": null, "brand": null }
  ],
  "requiresExpertVerification": false,
  "focusRegion": {
    "isFocused": true,
    "boxNormalized": [0.2, 0.1, 0.8, 0.6],
    "message": "Focused on the primary diseased cluster."
  }
}
''';

/// Captured verbatim from the deployed `/api/detect-disease` when given a
/// photo the engine could not read. It reports this through the disease name,
/// not a status field — which is exactly the trap this fixture guards.
const _inconclusive = '''
{
  "cropName": "Unknown Crop",
  "diseaseName": "Image Quality Insufficient",
  "confidence": 0,
  "description": "The image quality is insufficient for reliable analysis.",
  "symptoms": [
    "Wide-angle or distant plant photograph detected.",
    "Please upload a clear close-up photograph of an individual affected leaf."
  ],
  "causes": ["Camera distance too great for foliar diagnosis."],
  "precautions": [
    "Take a close-up photo focusing on a single diseased leaf in good daylight.",
    "Avoid applying chemical sprays until diagnosis is verified."
  ],
  "recommendedPesticides": [],
  "recommendedFertilizers": [],
  "requiresExpertVerification": true
}
''';

void main() {
  group('inconclusive results', () {
    late Diagnosis result;

    setUp(() {
      result = Diagnosis.fromJson(
        jsonDecode(_inconclusive) as Map<String, dynamic>,
      );
    });

    test('is flagged as inconclusive, not as a disease', () {
      // Without this the UI would tell a farmer their cotton has a disease
      // called "Image Quality Insufficient".
      expect(result.isInconclusive, isTrue);
      expect(result.isHealthy, isFalse);
    });

    test('carries photography guidance instead of treatments', () {
      expect(result.precautions, isNotEmpty);
      expect(result.hasProducts, isFalse);
    });

    test('a genuine diagnosis is not mistaken for inconclusive', () {
      final real = Diagnosis.fromJson({
        'diseaseName': 'Bacterial Blight',
        'confidence': 94,
        'requiresExpertVerification': false,
      });
      expect(real.isInconclusive, isFalse);
    });

    test('an uncertain but named diagnosis stays a diagnosis', () {
      // Low confidence plus an expert flag is still a real call, as long as
      // the engine actually named something and gave a non-zero score.
      final uncertain = Diagnosis.fromJson({
        'diseaseName': 'Leaf Spot',
        'confidence': 52,
        'requiresExpertVerification': true,
      });
      expect(uncertain.isInconclusive, isFalse);
      expect(uncertain.requiresExpertVerification, isTrue);
    });

    test('a healthy result is never inconclusive', () {
      final healthy = Diagnosis.fromJson({
        'diseaseName': 'Healthy Plant',
        'confidence': 88,
      });
      expect(healthy.isInconclusive, isFalse);
      expect(healthy.isHealthy, isTrue);
    });
  });

  group('Diagnosis', () {
    late Diagnosis diagnosis;

    setUp(() {
      diagnosis = Diagnosis.fromJson(
        jsonDecode(_infected) as Map<String, dynamic>,
      );
    });

    test('parses an infected result', () {
      expect(diagnosis.cropName, 'Cotton');
      expect(diagnosis.diseaseName, 'Bacterial Blight');
      expect(diagnosis.confidence, 94);
      expect(diagnosis.symptoms, hasLength(2));
      expect(diagnosis.causes, hasLength(2));
      expect(diagnosis.precautions, hasLength(2));
      expect(diagnosis.requiresExpertVerification, isFalse);
      expect(diagnosis.isHealthy, isFalse);
    });

    test('separates matched products from bare generic names', () {
      // The route's product lookup is allowed to fail silently, so an
      // unmatched recommendation arrives with nulls. It is still worth
      // showing — it just cannot be opened in the catalogue.
      expect(diagnosis.pesticides.single.isPurchasable, isTrue);
      expect(diagnosis.pesticides.single.price, 340);
      expect(diagnosis.fertilizers.single.name, 'Potash');
      expect(diagnosis.fertilizers.single.isPurchasable, isFalse);
      expect(diagnosis.hasProducts, isTrue);
    });

    group('healthy detection', () {
      // The API has no boolean for this — it signals health through the
      // disease name, and the engine has used more than one spelling.
      for (final name in [
        'Healthy Plant',
        'Healthy Crop',
        'healthy',
        'HEALTHY PLANT',
      ]) {
        test('"$name" counts as healthy', () {
          final healthy = Diagnosis.fromJson({'diseaseName': name});
          expect(healthy.isHealthy, isTrue);
        });
      }

      test('a real disease name does not', () {
        expect(
          Diagnosis.fromJson({'diseaseName': 'Leaf Spot'}).isHealthy,
          isFalse,
        );
      });
    });

    group('focus region', () {
      test('is drawable when the box is well formed', () {
        final box = diagnosis.focusRegion!;
        expect(box.isDrawable, isTrue);
        expect(box.top, 0.2);
        expect(box.left, 0.1);
        expect(box.height, closeTo(0.6, 1e-9));
        expect(box.width, closeTo(0.5, 1e-9));
      });

      test('is not drawn when the engine did not focus', () {
        final region = FocusRegion.fromJson({
          'isFocused': false,
          'boxNormalized': [0.1, 0.1, 0.9, 0.9],
        });
        expect(region.isDrawable, isFalse);
      });

      test('is not drawn when the box is malformed', () {
        // A zero-area or out-of-range box would paint a broken overlay on
        // the farmer's photo, so it is dropped instead.
        final zeroArea = FocusRegion.fromJson({
          'isFocused': true,
          'boxNormalized': [0.5, 0.5, 0.5, 0.5],
        });
        final outOfRange = FocusRegion.fromJson({
          'isFocused': true,
          'boxNormalized': [0.1, 0.1, 1.8, 0.9],
        });
        final truncated = FocusRegion.fromJson({
          'isFocused': true,
          'boxNormalized': [0.1, 0.2],
        });

        expect(zeroArea.isDrawable, isFalse);
        expect(outOfRange.isDrawable, isFalse);
        expect(truncated.isDrawable, isFalse);
      });
    });

    group('defensive parsing', () {
      test('survives an empty response', () {
        final empty = Diagnosis.fromJson(const {});
        expect(empty.diseaseName, isEmpty);
        expect(empty.confidence, 0);
        expect(empty.symptoms, isEmpty);
        expect(empty.hasProducts, isFalse);
        expect(empty.focusRegion, isNull);
      });

      test('drops blank list entries', () {
        final messy = Diagnosis.fromJson({
          'symptoms': ['Real symptom', '', '   ', 42, null],
        });
        expect(messy.symptoms, ['Real symptom']);
      });

      test('clamps a confidence outside 0-100', () {
        expect(Diagnosis.fromJson({'confidence': 140}).confidence, 100);
        expect(Diagnosis.fromJson({'confidence': -5}).confidence, 0);
      });

      test('accepts a confidence sent as a string', () {
        expect(Diagnosis.fromJson({'confidence': '78'}).confidence, 78);
      });

      test('ignores a product with no name', () {
        final result = Diagnosis.fromJson({
          'recommendedPesticides': [
            {'name': '', 'productId': 'X'},
            {'name': 'Real Product'},
          ],
        });
        expect(result.pesticides, hasLength(1));
        expect(result.pesticides.single.name, 'Real Product');
      });
    });
  });
}
