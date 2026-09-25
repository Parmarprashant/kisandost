import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/farm/data/crop_detail_models.dart';

void main() {
  group('CropDetail models', () {
    test('parses full CropDetail JSON with populated field and zone', () {
      final json = {
        '_id': 'crop_123',
        'cropName': 'Cotton',
        'variety': 'BT-Cotton-II',
        'sowingDate': '2026-06-15T00:00:00.000Z',
        'cultivatedArea': 2.5,
        'cultivatedAreaUnit': 'Acre',
        'status': 'Active',
        'currentDas': 102,
        'currentStageId': 'Boll Formation',
        'progressionMode': 'DYNAMIC_GDD',
        'cumulativeGdd': 1420.5,
        'baseTemperature': 12.0,
        'maturityGdd': 2100.0,
        'fieldId': {
          '_id': 'field_abc',
          'name': 'North Farm',
          'area': 5.0,
          'areaUnit': 'Acre',
          'location': {
            'village': 'Kadi',
            'district': 'Mehsana',
            'state': 'Gujarat',
            'latitude': 23.3,
            'longitude': 72.3,
          },
          'soil': {'type': 'Black Soil'},
          'irrigation': {'method': 'Drip'},
        },
        'zoneId': {
          '_id': 'zone_99',
          'zoneCode': 'Z-1',
          'zoneName': 'Canal Section',
        },
      };

      final crop = CropDetail.fromJson(json);

      expect(crop.id, 'crop_123');
      expect(crop.cropName, 'Cotton');
      expect(crop.variety, 'BT-Cotton-II');
      expect(crop.currentDas, 102);
      expect(crop.progressionMode, 'DYNAMIC_GDD');
      expect(crop.cumulativeGdd, 1420.5);
      expect(crop.maturityGdd, 2100.0);
      expect(crop.field?.name, 'North Farm');
      expect(crop.field?.location.district, 'Mehsana');
      expect(crop.zone?.displayName, 'Z-1 — Canal Section');
      expect(crop.isActive, isTrue);
    });

    test('handles defensive parsing with missing and null fields', () {
      final json = <String, dynamic>{'_id': 'crop_sparse'};

      final crop = CropDetail.fromJson(json);

      expect(crop.id, 'crop_sparse');
      expect(crop.cropName, '');
      expect(crop.variety, isNull);
      expect(crop.field, isNull);
      expect(crop.zone, isNull);
      expect(crop.progressionMode, 'DAS_ONLY');
      expect(crop.cumulativeGdd, isNull);
    });

    test('parses CropRiskSummary with deterministic threats', () {
      final json = {
        'cropId': 'crop_123',
        'fieldId': 'field_abc',
        'cropName': 'Cotton',
        'variety': 'BT-Cotton',
        'overallStatus': 'POTENTIAL_CONCERN',
        'overallLevel': 'MODERATE',
        'growthStage': {
          'name': 'Boll Formation',
          'currentDas': 102,
          'cumulativeGdd': 1420.5,
          'progressionMode': 'DYNAMIC_GDD',
        },
        'evaluatedThreats': [
          {
            'ruleId': 'COTTON_BOLLWORM_STAGE4',
            'threatId': 'cotton_bollworm',
            'threatName': 'Pink Bollworm Window',
            'threatCategory': 'INSECT_PEST',
            'status': 'ATTENTION',
            'riskLevel': 'HIGH',
            'explanation': 'Temperature between 25-32C and Boll stage trigger susceptibility.',
            'missingEvidence': <String>[],
          },
        ],
        'evidenceCompleteness': {
          'cropStageAvailable': true,
          'weatherAvailable': true,
          'weatherCoveragePercent': 95.0,
          'imageScanAvailable': false,
          'varietyDataAvailable': true,
        },
        'lastEvaluatedAt': '2026-09-25T18:00:00.000Z',
      };

      final risk = CropRiskSummary.fromJson(json);

      expect(risk.overallStatus, 'POTENTIAL_CONCERN');
      expect(risk.overallLevel, 'MODERATE');
      expect(risk.hasThreats, isTrue);
      expect(risk.evaluatedThreats.length, 1);
      final threat = risk.evaluatedThreats.first;
      expect(threat.threatName, 'Pink Bollworm Window');
      expect(threat.isElevated, isTrue);
      expect(risk.evidenceCompleteness.weatherCoveragePercent, 95.0);
    });

    test('parses CropScanItem and handles severity colors', () {
      final json = {
        '_id': 'scan_1',
        'cropCycleId': 'crop_123',
        'diagnosis': 'Bacterial Blight',
        'severity': 'MODERATE',
        'confidence': 0.88,
        'capturedAt': '2026-09-20T10:00:00.000Z',
        'zoneId': {'zoneCode': 'Z-1', 'zoneName': 'Canal Section'},
      };

      final scan = CropScanItem.fromJson(json);

      expect(scan.id, 'scan_1');
      expect(scan.diagnosis, 'Bacterial Blight');
      expect(scan.severity, 'MODERATE');
      expect(scan.confidence, 0.88);
      expect(scan.zoneLabel, 'Z-1 — Canal Section');
    });

    test('parses CropCycleState', () {
      final json = {
        'currentDas': 45,
        'progressionMode': 'DYNAMIC_GDD',
        'cumulativeGdd': 612.3,
        'currentStage': {'stageName': 'Square Formation'},
        'status': 'ACTIVE',
      };

      final cycle = CropCycleState.fromJson(json);

      expect(cycle.currentDas, 45);
      expect(cycle.progressionMode, 'DYNAMIC_GDD');
      expect(cycle.cumulativeGdd, 612.3);
      expect(cycle.currentStageName, 'Square Formation');
    });
  });
}
