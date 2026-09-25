import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/predictions/data/prediction_models.dart';

/// Captured from `POST /api/yield-prediction` for 2.5 acres of Cotton.
/// Field names are snake_case and the yield is in tonnes.
const _yieldJson = '''
{
  "predicted_yield": 2.2,
  "yield_per_acre": 0.89,
  "average_regional_yield": 2.35,
  "average_regional_per_acre": 0.95,
  "total_yield": 2.23,
  "area_acres": 2.5,
  "area_unit": "acres",
  "crop": "Cotton",
  "percent_difference": -6.3,
  "is_above_average": false,
  "insights": "Yield is projected at 6.3% below regional baseline."
}
''';

/// Captured from `POST /api/predict-yield` for the same field. Field names are
/// camelCase here and the yield is in QUINTALS — the two routes disagree on
/// both conventions, which is why they have separate models.
const _profitJson = '''
{
  "modelSource": "ml",
  "predictedProfit": 193379.68,
  "confidenceScore": 0.8973,
  "expectedRevenue": 199679.68,
  "totalCost": 6300,
  "fertilizerCost": 4000,
  "pesticideCost": 1500,
  "irrigationCost": 800,
  "recommendation": "Based on verified APMC Mandi rates...",
  "predictedYield": 26.18,
  "pricePerQuintal": 7625,
  "mandiDetails": {
    "market": "Visnagar APMC",
    "district": "Mehsana",
    "state": "Gujarat",
    "arrivalDate": "24/09/2026",
    "minPrice": 5500,
    "maxPrice": 9750,
    "source": "data.gov.in (Live APMC)",
    "variety": "Other"
  }
}
''';

void main() {
  group('YieldPrediction', () {
    late YieldPrediction result;

    setUp(() {
      result = YieldPrediction.fromJson(
        jsonDecode(_yieldJson) as Map<String, dynamic>,
      );
    });

    test('parses the snake_case payload', () {
      expect(result.crop, 'Cotton');
      expect(result.totalYield, 2.23);
      expect(result.yieldPerAcre, 0.89);
      expect(result.regionalPerAcre, 0.95);
      expect(result.areaAcres, 2.5);
    });

    test('keeps the sign on the regional difference', () {
      // The UI decides "above" vs "below" from the flag, but shows the
      // magnitude — losing the sign here would render "6.3% above" for a
      // result that is actually below average.
      expect(result.percentDifference, -6.3);
      expect(result.isAboveAverage, isFalse);
    });

    test('knows when there is a baseline to compare against', () {
      expect(result.hasBaseline, isTrue);

      final noBaseline = YieldPrediction.fromJson({
        'total_yield': 2.0,
        'average_regional_per_acre': 0,
      });
      // Without this the screen would show "0% vs regional average 0.00".
      expect(noBaseline.hasBaseline, isFalse);
    });

    test('survives an empty response', () {
      final empty = YieldPrediction.fromJson(const {});
      expect(empty.totalYield, 0);
      expect(empty.insights, isEmpty);
      expect(empty.hasBaseline, isFalse);
    });
  });

  group('ProfitPrediction', () {
    late ProfitPrediction result;

    setUp(() {
      result = ProfitPrediction.fromJson(
        jsonDecode(_profitJson) as Map<String, dynamic>,
      );
    });

    test('parses the camelCase payload', () {
      expect(result.predictedYield, 26.18);
      expect(result.pricePerQuintal, 7625);
      expect(result.expectedRevenue, 199679.68);
      expect(result.totalCost, 6300);
      expect(result.fertilizerCost, 4000);
    });

    test('reads predictedProfit as a margin, not profit', () {
      // The API's "predictedProfit" subtracts only the three input costs the
      // farmer typed — no seed, labour, land rent or transport. It is named
      // margin here so nothing downstream can present it as take-home pay.
      expect(result.margin, 193379.68);
      expect(result.isProfitable, isTrue);
    });

    test('the margin is revenue minus only the entered costs', () {
      // Confirms the API is doing what the caveat says it is: if this ever
      // started subtracting more, the label would need to change.
      expect(
        result.expectedRevenue - result.totalCost,
        closeTo(result.margin, 1),
      );
    });

    test('the three costs add up to the total', () {
      expect(
        result.fertilizerCost + result.pesticideCost + result.irrigationCost,
        result.totalCost,
      );
    });

    test('converts confidence to a whole percentage', () {
      expect(result.confidencePercent, 90);
    });

    test('clamps a confidence outside 0-1', () {
      expect(
        ProfitPrediction.fromJson({'confidenceScore': 1.4}).confidencePercent,
        100,
      );
      expect(
        ProfitPrediction.fromJson({'confidenceScore': -0.2}).confidencePercent,
        0,
      );
    });

    test('flags a loss', () {
      final loss = ProfitPrediction.fromJson({
        'predictedProfit': -4200,
        'expectedRevenue': 2000,
        'totalCost': 6200,
      });
      expect(loss.isProfitable, isFalse);
    });

    test('survives a response with no mandi details', () {
      final bare = ProfitPrediction.fromJson({'predictedProfit': 100});
      expect(bare.mandi, isNull);
    });

    group('model source', () {
      test('trusts the model only when the route says it ran', () {
        expect(result.usedModel, isTrue);
      });

      test('marks the arithmetic fallback as not a model result', () {
        // The route answers from hardcoded per-crop baselines when the model
        // is unreachable, in exactly the same response shape.
        final fallback = ProfitPrediction.fromJson({
          'modelSource': 'fallback',
          'predictedProfit': 5000,
          'confidenceScore': 0.85,
        });
        expect(fallback.usedModel, isFalse);
      });

      test('assumes a fallback when the flag is missing', () {
        // An older backend does not send it. Defaulting the other way would
        // let the screen show a confidence no model produced.
        final old = ProfitPrediction.fromJson({'predictedProfit': 5000});
        expect(old.usedModel, isFalse);
      });

      test('does not accept an unexpected value as a model result', () {
        final odd = ProfitPrediction.fromJson({'modelSource': 'ML'});
        expect(odd.usedModel, isFalse);
      });
    });
  });

  group('MandiDetails', () {
    test('parses the nested block', () {
      final result = ProfitPrediction.fromJson(
        jsonDecode(_profitJson) as Map<String, dynamic>,
      );
      final mandi = result.mandi!;

      expect(mandi.market, 'Visnagar APMC');
      expect(mandi.district, 'Mehsana');
      expect(mandi.location, 'Visnagar APMC · Mehsana · Gujarat');
      expect(mandi.hasRange, isTrue);
    });

    test('distinguishes a live rate from a calculated baseline', () {
      // A margin built on an invented price is a guess, and the screen says
      // so — the same rule the mandi tab follows.
      final live = MandiDetails.fromJson({'source': 'data.gov.in (Live APMC)'});
      final baseline = MandiDetails.fromJson({
        'source': 'Government MSP Baseline',
      });
      final cached = MandiDetails.fromJson({'source': 'Database Cache'});

      expect(live.isLive, isTrue);
      expect(baseline.isLive, isFalse);
      expect(cached.isLive, isFalse);
    });

    test('omits empty parts from the location', () {
      final sparse = MandiDetails.fromJson({
        'market': 'Some APMC',
        'district': '',
        'state': 'Gujarat',
      });
      expect(sparse.location, 'Some APMC · Gujarat');
    });
  });

  group('yield crop support', () {
    test('maize is sent as the name the route uses', () {
      // The route calls it "Corn". Sending "Maize" returned a 400, which
      // silently broke a major Indian crop for no reason but the name.
      expect(yieldCropApiName('Maize'), 'Corn');
    });

    test('leaves every other crop alone', () {
      expect(yieldCropApiName('Wheat'), 'Wheat');
      expect(yieldCropApiName('Cotton'), 'Cotton');
    });

    test('trims whatever the picker handed over', () {
      expect(yieldCropApiName('  Maize '), 'Corn');
      expect(yieldCropApiName(' Rice '), 'Rice');
    });

    test('knows the six crops the route can answer for', () {
      for (final crop in ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane']) {
        expect(yieldSupportsCrop(crop), isTrue, reason: '\$crop should work');
      }
    });

    test('knows the ones it cannot', () {
      // Verified against the deployed route: each of these returns a 400.
      for (final crop in [
        'Mango',
        'Groundnut',
        'Banana',
        'Tomato',
        'Potato',
        'Onion',
        'Chickpea',
      ]) {
        expect(
          yieldSupportsCrop(crop),
          isFalse,
          reason: '\$crop has no baseline',
        );
      }
    });

    test('matches regardless of case or padding', () {
      // Crop names arrive from saved field data, not only the picker.
      expect(yieldSupportsCrop('wheat'), isTrue);
      expect(yieldSupportsCrop('  COTTON  '), isTrue);
      expect(yieldSupportsCrop('mango'), isFalse);
    });

    test('an unknown crop is unsupported rather than an error', () {
      expect(yieldSupportsCrop('Dragonfruit'), isFalse);
      expect(yieldSupportsCrop(''), isFalse);
    });

    test('every supported crop survives the name mapping', () {
      // A crop in the set whose mapped name the route rejects would be worse
      // than one that was never offered.
      for (final crop in yieldSupportedCrops) {
        expect(yieldCropApiName(crop), isNotEmpty);
      }
    });
  });

  group('form defaults', () {
    test('NDVI sits inside the range the model accepts', () {
      // The route rejects values outside 0.1-0.95, and the slider is bounded
      // to match.
      expect(defaultNdvi, greaterThanOrEqualTo(0.1));
      expect(defaultNdvi, lessThanOrEqualTo(0.95));
    });

    test('soil moisture is a sane percentage', () {
      expect(defaultSoilMoisture, greaterThan(0));
      expect(defaultSoilMoisture, lessThanOrEqualTo(100));
    });
  });
}
