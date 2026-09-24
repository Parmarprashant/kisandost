import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/fertilizer/data/fertilizer_calculator.dart';

void main() {
  group('fertilizer calculation', () {
    test('matches the web app for one acre of cotton on loamy soil', () {
      // Cotton needs 150-75-75. Loamy multiplier is 1.0.
      //   DAP  = 75 / 0.46            = 163.0 kg
      //   N from DAP = 163.0 * 0.18   =  29.3 kg
      //   Urea = (150 - 29.3) / 0.46  = 262.3 kg
      //   MOP  = 75 / 0.60            = 125.0 kg
      final result = calculateFertilizer(
        crop: 'Cotton',
        acres: 1,
        soilType: 'Loamy',
      );

      expect(result.dapKg, 163);
      expect(result.ureaKg, 262);
      expect(result.mopKg, 125);
    });

    test('scales linearly with area', () {
      final one = calculateFertilizer(
        crop: 'Wheat',
        acres: 1,
        soilType: 'Loamy',
      );
      final three = calculateFertilizer(
        crop: 'Wheat',
        acres: 3,
        soilType: 'Loamy',
      );

      expect(three.ureaKg, closeTo(one.ureaKg * 3, 1));
      expect(three.dapKg, closeTo(one.dapKg * 3, 1));
    });

    test('credits the nitrogen that DAP already supplies', () {
      // DAP is 18% nitrogen. Ignoring that over-applies urea, which burns the
      // crop and wastes money — so urea must come out lower than the naive
      // "total N / 0.46".
      final result = calculateFertilizer(
        crop: 'Cotton',
        acres: 1,
        soilType: 'Loamy',
      );

      final naiveUrea = 150 / 0.46;
      expect(result.ureaKg, lessThan(naiveUrea));
    });

    group('soil type', () {
      test('sandy soil needs more', () {
        final loamy = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Loamy',
        );
        final sandy = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Sandy',
        );
        expect(sandy.ureaKg, greaterThan(loamy.ureaKg));
      });

      test('clay soil needs less', () {
        final loamy = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Loamy',
        );
        final clay = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Clay',
        );
        expect(clay.ureaKg, lessThan(loamy.ureaKg));
      });

      test('an unknown soil type falls back to no adjustment', () {
        final unknown = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Martian Regolith',
        );
        final loamy = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Loamy',
        );
        expect(unknown.ureaKg, loamy.ureaKg);
      });
    });

    group('soil test credits', () {
      test('reduce the dose', () {
        final without = calculateFertilizer(
          crop: 'Cotton',
          acres: 1,
          soilType: 'Loamy',
        );
        final with_ = calculateFertilizer(
          crop: 'Cotton',
          acres: 1,
          soilType: 'Loamy',
          existingN: 50,
          existingP: 25,
        );

        expect(with_.ureaKg, lessThan(without.ureaKg));
        expect(with_.dapKg, lessThan(without.dapKg));
        expect(with_.reducedBySoilTest, isTrue);
      });

      test('never produce a negative quantity', () {
        // A soil already rich in phosphorus means buy none — not "-40 kg",
        // and not a nonsense cost.
        final rich = calculateFertilizer(
          crop: 'Chickpea',
          acres: 1,
          soilType: 'Loamy',
          existingN: 500,
          existingP: 500,
          existingK: 500,
        );

        expect(rich.ureaKg, 0);
        expect(rich.dapKg, 0);
        expect(rich.mopKg, 0);
        expect(rich.estimatedCost, 0);
        expect(rich.isEmpty, isTrue);
      });

      test('are not flagged when no test was entered', () {
        final plain = calculateFertilizer(
          crop: 'Wheat',
          acres: 1,
          soilType: 'Loamy',
        );
        expect(plain.reducedBySoilTest, isFalse);
      });
    });

    group('bags and cost', () {
      test('rounds bags up — you cannot buy part of a sack', () {
        final result = calculateFertilizer(
          crop: 'Chickpea',
          acres: 0.1,
          soilType: 'Loamy',
        );
        expect(result.totalBags, greaterThanOrEqualTo(1));
      });

      test('cost rises with area', () {
        final small = calculateFertilizer(
          crop: 'Rice',
          acres: 1,
          soilType: 'Loamy',
        );
        final large = calculateFertilizer(
          crop: 'Rice',
          acres: 5,
          soilType: 'Loamy',
        );
        expect(large.estimatedCost, greaterThan(small.estimatedCost));
      });
    });

    group('bad input', () {
      test('zero area returns nothing rather than a divide-by-zero', () {
        final none = calculateFertilizer(
          crop: 'Wheat',
          acres: 0,
          soilType: 'Loamy',
        );
        expect(none.isEmpty, isTrue);
      });

      test('negative area returns nothing', () {
        final none = calculateFertilizer(
          crop: 'Wheat',
          acres: -3,
          soilType: 'Loamy',
        );
        expect(none.isEmpty, isTrue);
      });

      test('an unknown crop returns nothing rather than guessing', () {
        // Inventing a dose for a crop we have no formula for could have a
        // farmer buy the wrong thing entirely.
        final none = calculateFertilizer(
          crop: 'Dragonfruit',
          acres: 2,
          soilType: 'Loamy',
        );
        expect(none.isEmpty, isTrue);
      });
    });

    test('every crop in the picker produces a usable result', () {
      for (final crop in cropFormulas.keys) {
        final result = calculateFertilizer(
          crop: crop,
          acres: 1,
          soilType: 'Loamy',
        );
        expect(
          result.isEmpty,
          isFalse,
          reason: '$crop produced no recommendation',
        );
        expect(result.totalBags, greaterThan(0), reason: crop);
      }
    });
  });
}
