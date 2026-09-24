import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/weather/data/farm_advice.dart';
import 'package:kisan_app/features/weather/data/weather_models.dart';
import 'package:kisan_app/l10n/app_localizations.dart';

WeatherSnapshot snapshot({
  double tempC = 28,
  double windKph = 5,
  int chanceOfRain = 0,
  bool withForecast = true,
}) {
  return WeatherSnapshot(
    locationName: 'Anand',
    region: 'Gujarat',
    tempC: tempC,
    condition: 'Clear',
    iconUrl: '',
    humidity: 50,
    windKph: windKph,
    isDay: true,
    fetchedAt: DateTime(2026, 9, 24),
    forecast: withForecast
        ? [
            ForecastDay(
              date: DateTime(2026, 9, 24),
              maxTempC: tempC,
              minTempC: tempC - 8,
              condition: 'Clear',
              iconUrl: '',
              chanceOfRain: chanceOfRain,
            ),
          ]
        : const [],
  );
}

Set<FarmAdviceKind> kindsFor(WeatherSnapshot weather, L10n l10n) =>
    farmAdviceFor(weather, l10n).map((a) => a.kind).toSet();

void main() {
  late L10n en;

  setUpAll(() async {
    en = await L10n.delegate.load(const Locale('en'));
  });

  group('spray advice', () {
    test('warns when rain is likely', () {
      // A foliar spray washes off, so this is wasted chemical and wasted money.
      expect(
        kindsFor(snapshot(chanceOfRain: 80), en),
        contains(FarmAdviceKind.rain),
      );
    });

    test('stays quiet on a low rain chance', () {
      expect(
        kindsFor(snapshot(chanceOfRain: 20), en),
        isNot(contains(FarmAdviceKind.rain)),
      );
    });

    test('fires exactly at the threshold, not just above it', () {
      expect(
        kindsFor(snapshot(chanceOfRain: 60), en),
        contains(FarmAdviceKind.rain),
      );
      expect(
        kindsFor(snapshot(chanceOfRain: 59), en),
        isNot(contains(FarmAdviceKind.rain)),
      );
    });
  });

  group('wind advice', () {
    test('warns about spray drift in strong wind', () {
      expect(
        kindsFor(snapshot(windKph: 22), en),
        contains(FarmAdviceKind.wind),
      );
    });

    test('stays quiet in calm air', () {
      expect(
        kindsFor(snapshot(windKph: 6), en),
        isNot(contains(FarmAdviceKind.wind)),
      );
    });
  });

  group('heat advice', () {
    test('warns about irrigating in extreme heat', () {
      expect(kindsFor(snapshot(tempC: 41), en), contains(FarmAdviceKind.heat));
    });

    test('stays quiet at an ordinary temperature', () {
      expect(
        kindsFor(snapshot(tempC: 31), en),
        isNot(contains(FarmAdviceKind.heat)),
      );
    });
  });

  group('overall behaviour', () {
    test('says nothing on a good working day', () {
      // Silence is the correct output most of the time. Advice that fires
      // every day is advice nobody reads.
      expect(farmAdviceFor(snapshot(), en), isEmpty);
    });

    test('can raise several warnings at once', () {
      final kinds = kindsFor(
        snapshot(tempC: 40, windKph: 25, chanceOfRain: 75),
        en,
      );
      expect(kinds, hasLength(3));
    });

    test('does not invent rain advice when there is no forecast', () {
      // The Open-Meteo fallback path can return current conditions with no
      // forecast at all.
      expect(
        kindsFor(snapshot(withForecast: false), en),
        isNot(contains(FarmAdviceKind.rain)),
      );
    });

    test('messages come from the active locale', () async {
      final hi = await L10n.delegate.load(const Locale('hi'));
      final english = farmAdviceFor(snapshot(chanceOfRain: 80), en).single;
      final hindi = farmAdviceFor(snapshot(chanceOfRain: 80), hi).single;

      expect(hindi.kind, english.kind);
      expect(hindi.message, isNot(equals(english.message)));
    });
  });
}
