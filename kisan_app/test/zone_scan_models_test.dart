import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/zone_scan_models.dart';

void main() {
  group('ZoneEvidenceSummary', () {
    test('parses JSON correctly with multi-angle diagnoses', () {
      final json = {
        'diagnoses': ['Early Blight', 'Early Blight'],
        'confidences': [0.85, 0.90],
        'repeatedDiagnosis': 'Early Blight',
        'isConsistent': true,
        'requiresExpertVerification': false,
      };

      final summary = ZoneEvidenceSummary.fromJson(json);

      expect(summary.diagnoses.length, 2);
      expect(summary.confidences.length, 2);
      expect(summary.repeatedDiagnosis, 'Early Blight');
      expect(summary.isConsistent, isTrue);
      expect(summary.requiresExpertVerification, isFalse);
      expect(summary.averageConfidence, closeTo(0.875, 0.001));
      expect(summary.averageConfidencePercent, 88);
    });

    test('handles empty or missing evidence gracefully', () {
      final summary = ZoneEvidenceSummary.fromJson({});

      expect(summary.diagnoses, isEmpty);
      expect(summary.confidences, isEmpty);
      expect(summary.repeatedDiagnosis, isNull);
      expect(summary.averageConfidence, 0.0);
      expect(summary.averageConfidencePercent, 0);
    });
  });

  group('ZoneScanEvidenceItem', () {
    test('parses scan item with primary condition and confidence', () {
      final json = {
        'scanId': 'scan_001',
        'imageUrl': 'https://res.cloudinary.com/farm/image/upload/v1/scan1.jpg',
        'viewAngle': 'underside',
        'diseaseName': 'Powdery Mildew',
        'confidence': 0.88,
        'description': 'White fungal patches on underside of leaves',
        'screeningResult': 'POTENTIAL_CONCERN',
        'capturedAt': '2026-09-25T10:30:00.000Z',
      };

      final item = ZoneScanEvidenceItem.fromJson(json);

      expect(item.scanId, 'scan_001');
      expect(item.imageUrl, contains('cloudinary'));
      expect(item.viewAngle, 'underside');
      expect(item.viewAngleLabel, 'Foliar Underside');
      expect(item.diseaseName, 'Powdery Mildew');
      expect(item.confidence, 0.88);
      expect(item.confidencePercent, 88);
      expect(item.isHealthy, isFalse);
      expect(item.capturedAt, isNotNull);
    });

    test('correctly identifies healthy scan items', () {
      final json = {
        'scanId': 'scan_002',
        'imageUrl': 'https://res.cloudinary.com/farm/image/upload/v1/scan2.jpg',
        'viewAngle': 'screening',
        'diseaseName': 'Healthy Crop',
        'confidence': 0.96,
        'screeningResult': 'NO_CONCERN_DETECTED',
      };

      final item = ZoneScanEvidenceItem.fromJson(json);

      expect(item.viewAngleLabel, 'Primary Screening');
      expect(item.diseaseName, 'Healthy Crop');
      expect(item.isHealthy, isTrue);
    });
  });

  group('ZoneScanResult', () {
    test(
      'parses initial screening response with additional views required',
      () {
        final json = {
          'sessionId': 'sess_123',
          'zoneId': 'zone_456',
          'cropId': 'crop_789',
          'fieldId': 'field_101',
          'status': 'ADDITIONAL_IMAGES_REQUIRED',
          'result': 'POTENTIAL_CONCERN',
          'requiresAdditionalImages': true,
          'scanCount': 1,
          'maxAdditionalImages': 3,
          'currentStep': 2,
          'message':
              'Potential issue detected. Please capture additional views.',
          'guidanceMessage':
              'Suggested views: 1. Upper Canopy, 2. Foliar Underside',
          'currentScan': {
            'scanId': 'scan_001',
            'imageUrl': 'https://example.com/leaf.jpg',
            'viewAngle': 'screening',
            'diseaseName': 'Late Blight',
            'confidence': 0.82,
          },
          'evidenceSummary': {
            'diagnoses': ['Late Blight'],
            'confidences': [0.82],
            'repeatedDiagnosis': 'Late Blight',
            'isConsistent': true,
          },
        };

        final result = ZoneScanResult.fromJson(json);

        expect(result.sessionId, 'sess_123');
        expect(result.zoneId, 'zone_456');
        expect(result.isPotentialConcern, isTrue);
        expect(result.isHealthy, isFalse);
        expect(result.requiresAdditionalImages, isTrue);
        expect(result.remainingAnglesNeeded, 3);
        expect(result.currentScan?.diseaseName, 'Late Blight');
        expect(result.evidenceSummary?.isConsistent, isTrue);
      },
    );

    test('parses completed healthy session without additional images', () {
      final json = {
        'sessionId': 'sess_healthy',
        'zoneId': 'zone_456',
        'cropId': 'crop_789',
        'status': 'COMPLETED',
        'result': 'NO_CONCERN_DETECTED',
        'requiresAdditionalImages': false,
        'scanCount': 1,
        'maxAdditionalImages': 3,
        'currentStep': 1,
        'message': 'No concerning signs detected in this scan.',
        'guidanceMessage': 'Continue to next zone.',
      };

      final result = ZoneScanResult.fromJson(json);

      expect(result.isHealthy, isTrue);
      expect(result.isCompleted, isTrue);
      expect(result.requiresAdditionalImages, isFalse);
    });
  });

  group('ZoneScanCompletionSummary', () {
    test('parses finalized session summary payload', () {
      final json = {
        'message': 'Scan session completed successfully',
        'summary': {
          'sessionId': 'sess_final',
          'zoneId': 'zone_999',
          'status': 'COMPLETED',
          'result': 'POTENTIAL_CONCERN',
          'scanCount': 3,
          'completedAt': '2026-09-25T11:00:00.000Z',
          'evidenceSummary': {
            'diagnoses': ['Early Blight', 'Early Blight', 'Early Blight'],
            'confidences': [0.85, 0.90, 0.88],
            'repeatedDiagnosis': 'Early Blight',
            'isConsistent': true,
          },
          'scans': [
            {
              'scanId': 's1',
              'imageUrl': 'https://example.com/s1.jpg',
              'viewAngle': 'screening',
              'diseaseName': 'Early Blight',
              'confidence': 0.85,
            },
            {
              'scanId': 's2',
              'imageUrl': 'https://example.com/s2.jpg',
              'viewAngle': 'underside',
              'diseaseName': 'Early Blight',
              'confidence': 0.90,
            },
          ],
        },
      };

      final summary = ZoneScanCompletionSummary.fromJson(json);

      expect(summary.sessionId, 'sess_final');
      expect(summary.status, 'COMPLETED');
      expect(summary.isPotentialConcern, isTrue);
      expect(summary.scanCount, 3);
      expect(summary.scans.length, 2);
      expect(summary.evidenceSummary?.repeatedDiagnosis, 'Early Blight');
      expect(summary.evidenceSummary?.isConsistent, isTrue);
    });
  });

  group('ZoneScoutAngle enum', () {
    test('resolves from valid and invalid string codes', () {
      expect(ZoneScoutAngle.fromCode('screening'), ZoneScoutAngle.screening);
      expect(ZoneScoutAngle.fromCode('CANOPY'), ZoneScoutAngle.canopy);
      expect(ZoneScoutAngle.fromCode('underside'), ZoneScoutAngle.underside);
      expect(ZoneScoutAngle.fromCode('Stem'), ZoneScoutAngle.stem);
      expect(ZoneScoutAngle.fromCode('fruit'), ZoneScoutAngle.fruit);
      // Fallback
      expect(ZoneScoutAngle.fromCode('unknown_code'), ZoneScoutAngle.screening);
    });
  });
}
