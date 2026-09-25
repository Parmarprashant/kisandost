import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/diagnosis/data/diagnosis_models.dart';

/// Captured from `/api/detect-disease` for a photo the quality gate refused.
/// HTTP 200 — the rejection is in the body, which is why a green status line
/// in the model log said nothing about what the app would show.
const _rejectedJson = '''
{
  "cropName": "Unknown Crop",
  "diseaseName": "Image Quality Insufficient",
  "confidence": 0,
  "description": "The image quality is insufficient for reliable analysis.",
  "symptoms": [
    "Image is overexposed / washed out (brightness 245.4). Visual pathology unreliable.",
    "Take a close-up photo of one affected leaf in good daylight."
  ],
  "causes": [],
  "precautions": [],
  "diagnostics": {
    "gateStatus": "REJECTED",
    "cropStatus": "IMAGE_QUALITY_FAILURE",
    "rejectionReason": "Image quality gate failed: Image is overexposed / washed out (brightness 245.4). Visual pathology unreliable.",
    "rejectionReasons": [
      "Image quality gate failed: Image is overexposed / washed out (brightness 245.4). Visual pathology unreliable."
    ],
    "rawTopPrediction": "None",
    "rawConfidence": 0,
    "accepted": false,
    "endpoint": "https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run"
  }
}
''';

Diagnosis parse(String json) =>
    Diagnosis.fromJson(jsonDecode(json) as Map<String, dynamic>);

void main() {
  group('a rejected photo', () {
    late Diagnosis result;

    setUp(() => result = parse(_rejectedJson));

    test('is still inconclusive', () {
      expect(result.isInconclusive, isTrue);
    });

    test('carries the model\'s own verdict', () {
      final d = result.diagnostics!;
      expect(d.wasRejected, isTrue);
      expect(d.gateStatus, 'REJECTED');
      expect(d.cropStatus, 'IMAGE_QUALITY_FAILURE');
      expect(d.accepted, isFalse);
    });

    test('states the real reason, not a guess about distance', () {
      // The backend used to hardcode "wide-angle or distant plant
      // photograph" for every rejection, which sent farmers back to
      // photograph the same leaf the same wrong way.
      final reasons = result.diagnostics!.reasons;
      expect(reasons, hasLength(1));
      expect(reasons.single, contains('overexposed'));
      expect(reasons.single, isNot(contains('Image quality gate failed')));
    });

    test('names which service answered', () {
      expect(result.diagnostics!.endpoint, contains('modal.run'));
    });

    test('flattens to a readable panel', () {
      final lines = result.diagnostics!.asLines;
      expect(lines['gate'], 'REJECTED');
      expect(lines['accepted'], 'false');
      expect(lines['raw confidence'], '0.000');
      expect(lines['reason 1'], contains('overexposed'));
    });
  });

  group('reasons', () {
    test('does not repeat a reason listed twice', () {
      const d = ModelDiagnostics(
        rejectionReason: 'Too blurry.',
        rejectionReasons: ['Too blurry.'],
      );
      expect(d.reasons, ['Too blurry.']);
    });

    test('keeps two genuinely different reasons', () {
      const d = ModelDiagnostics(
        rejectionReasons: ['Too blurry.', 'Crop not supported.'],
      );
      expect(d.reasons, hasLength(2));
    });

    test('strips the boilerplate prefix whatever its case', () {
      const d = ModelDiagnostics(
        rejectionReason: 'IMAGE QUALITY GATE FAILED: Too dark.',
      );
      expect(d.reasons.single, 'Too dark.');
    });

    test('ignores blank reasons', () {
      const d = ModelDiagnostics(rejectionReasons: ['', '   ']);
      expect(d.reasons, isEmpty);
    });
  });

  group('an accepted diagnosis', () {
    test('is not marked as rejected', () {
      const d = ModelDiagnostics(
        gateStatus: 'ACCEPTED',
        accepted: true,
        rawTopPrediction: 'Tomato Early Blight',
        rawConfidence: 0.91,
      );
      expect(d.wasRejected, isFalse);
      expect(d.asLines['top prediction'], 'Tomato Early Blight');
      expect(d.asLines['raw confidence'], '0.910');
    });
  });

  group('an older backend', () {
    test('sends no diagnostics and nothing breaks', () {
      final result = parse(
        '{"diseaseName": "Image Quality Insufficient", "confidence": 0}',
      );
      expect(result.diagnostics, isNull);
      expect(result.isInconclusive, isTrue);
    });

    test('an empty diagnostics block produces no panel lines', () {
      final result = parse(
        '{"diseaseName": "X", "confidence": 0, "diagnostics": {}}',
      );
      expect(result.diagnostics, isNotNull);
      expect(result.diagnostics!.asLines, isEmpty);
    });
  });
}
