import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/mandi/data/mandi_models.dart';

/// Real response for Wheat in Gujarat — a genuine government reading.
const _live = '''
{
  "crop": "Wheat",
  "mandi": "Meghraj APMC",
  "district": "Sabarkantha",
  "state": "Gujarat",
  "pricePerQuintal": 2600,
  "minPrice": 2400,
  "maxPrice": 2600,
  "arrivalDate": "24/09/2026",
  "source": "data.gov.in (Live APMC)",
  "variety": "Other"
}
''';

/// Real response for Dragonfruit in Nagaland — a crop and state the feed has
/// no data for. The route answers `success: true` with an invented figure and
/// says so only through `source`.
const _baseline = '''
{
  "crop": "Dragonfruit",
  "mandi": "Nagaland APMC Benchmark",
  "district": "",
  "state": "Nagaland",
  "pricePerQuintal": 2200,
  "minPrice": 2090,
  "maxPrice": 2310,
  "arrivalDate": "24/9/2026",
  "source": "Government MSP Baseline",
  "variety": "FAQ Standard"
}
''';

MandiPrice parse(String json) =>
    MandiPrice.fromJson(jsonDecode(json) as Map<String, dynamic>);

void main() {
  group('source classification', () {
    // The route emits five different source strings and nothing else to go on.
    // Getting any of these wrong misleads a farmer about a price they may
    // plan a harvest around.
    const cases = {
      'data.gov.in (Live APMC)': PriceConfidence.live,
      'data.gov.in (National APMC Average)': PriceConfidence.indicative,
      'Database Cache': PriceConfidence.indicative,
      'Government MSP Baseline': PriceConfidence.estimated,
      'CACP / APMC Baseline': PriceConfidence.estimated,
    };

    cases.forEach((source, expected) {
      test('"$source" is $expected', () {
        expect(MandiPrice.fromJson({'source': source}).confidence, expected);
      });
    });

    test('a cached government price is not called live', () {
      // Regression: "Database Cache" is real APMC data, so it must not be
      // labelled an estimate — but it is not today's local reading either,
      // so it must not be labelled live.
      final cached = MandiPrice.fromJson({'source': 'Database Cache'});
      expect(cached.isLive, isFalse);
      expect(cached.confidence, PriceConfidence.indicative);
    });

    test('an unknown source falls back to estimated', () {
      expect(
        MandiPrice.fromJson({'source': 'Some New Feed'}).confidence,
        PriceConfidence.estimated,
      );
    });

    test('a missing source falls back to estimated', () {
      expect(
        MandiPrice.fromJson(const {}).confidence,
        PriceConfidence.estimated,
      );
    });
  });

  group('live government price', () {
    late MandiPrice price;

    setUp(() => price = parse(_live));

    test('parses the real payload', () {
      expect(price.crop, 'Wheat');
      expect(price.mandi, 'Meghraj APMC');
      expect(price.district, 'Sabarkantha');
      expect(price.pricePerQuintal, 2600);
      expect(price.minPrice, 2400);
      expect(price.maxPrice, 2600);
      expect(price.arrivalDate, '24/09/2026');
    });

    test('is marked live', () {
      expect(price.isLive, isTrue);
    });

    test('builds a location from the mandi that actually reported', () {
      expect(price.location, 'Meghraj APMC · Sabarkantha · Gujarat');
    });
  });

  group('MSP baseline fallback', () {
    late MandiPrice price;

    setUp(() => price = parse(_baseline));

    test('is not marked live', () {
      // This is the whole point of the badge. The route returns
      // `success: true` either way, so without this check the app would show
      // an invented number as a real market rate and a farmer could plan a
      // harvest around a price nobody quoted.
      expect(price.isLive, isFalse);
    });

    test('still parses so the screen can explain itself', () {
      expect(price.pricePerQuintal, 2200);
      expect(price.mandi, 'Nagaland APMC Benchmark');
    });

    test('omits an empty district from the location', () {
      expect(price.location, 'Nagaland APMC Benchmark · Nagaland');
    });
  });

  group('price range', () {
    test('is shown when min and max differ', () {
      expect(parse(_baseline).hasRange, isTrue);
    });

    test('is hidden when max equals the headline price', () {
      // Wheat came back 2400–2600 with a modal of 2600, so a range exists.
      // A feed that reports the same number three times should not render
      // "Range ₹2600 – ₹2600".
      final flat = MandiPrice.fromJson({
        'pricePerQuintal': 2600,
        'minPrice': 2600,
        'maxPrice': 2600,
      });
      expect(flat.hasRange, isFalse);
    });

    test('is hidden when the feed omits the bounds', () {
      final noBounds = MandiPrice.fromJson({'pricePerQuintal': 2600});
      expect(noBounds.hasRange, isFalse);
    });
  });

  group('defensive parsing', () {
    test('survives an empty payload', () {
      final empty = MandiPrice.fromJson(const {});
      expect(empty.pricePerQuintal, 0);
      expect(empty.location, isEmpty);
      expect(empty.isLive, isFalse);
    });

    test('rounds a price sent as a decimal', () {
      expect(
        MandiPrice.fromJson({'pricePerQuintal': 2599.6}).pricePerQuintal,
        2600,
      );
    });

    test('accepts a price sent as a string', () {
      expect(
        MandiPrice.fromJson({'pricePerQuintal': '2450'}).pricePerQuintal,
        2450,
      );
    });

    test('treats an unknown source as not live', () {
      final unknown = MandiPrice.fromJson({'source': 'Some New Feed'});
      expect(unknown.isLive, isFalse);
    });
  });

  group('picker data', () {
    test('states are unique and sorted', () {
      final sorted = [...indianStates]..sort();
      expect(indianStates, sorted);
      expect(indianStates.toSet(), hasLength(indianStates.length));
    });

    test('the default crop and state are both selectable', () {
      // The dropdown asserts if its value is absent from its items.
      expect(fallbackCrops, contains('Wheat'));
      expect(indianStates, contains('Gujarat'));
    });
  });
}
