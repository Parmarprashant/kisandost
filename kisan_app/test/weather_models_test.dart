import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/weather/data/weather_models.dart';

/// Trimmed from a real `GET /api/weather?q=Ahmedabad,India` response against
/// the deployed app. Kept verbatim in shape so a change to the route's payload
/// breaks this test rather than the home screen.
const _liveResponse = '''
{
  "location": { "name": "Ahmedabad", "region": "Gujarat", "country": "India" },
  "current": {
    "temp_c": 30.4,
    "is_day": 1,
    "condition": {
      "text": "Cloudy",
      "icon": "//cdn.weatherapi.com/weather/64x64/day/119.png",
      "code": 1006
    },
    "wind_kph": 14.8,
    "humidity": 54
  },
  "forecast": {
    "forecastday": [
      {
        "date": "2026-09-24",
        "day": {
          "maxtemp_c": 33.1,
          "mintemp_c": 25.6,
          "daily_chance_of_rain": 82,
          "condition": {
            "text": "Patchy rain nearby",
            "icon": "//cdn.weatherapi.com/weather/64x64/day/176.png"
          }
        }
      }
    ]
  }
}
''';

void main() {
  group('WeatherSnapshot', () {
    late WeatherSnapshot weather;

    setUp(() {
      weather = WeatherSnapshot.fromJson(
        jsonDecode(_liveResponse) as Map<String, dynamic>,
      );
    });

    test('parses the live payload', () {
      expect(weather.locationName, 'Ahmedabad');
      expect(weather.region, 'Gujarat');
      expect(weather.tempC, 30.4);
      expect(weather.condition, 'Cloudy');
      expect(weather.humidity, 54);
      expect(weather.windKph, 14.8);
      expect(weather.isDay, isTrue);
    });

    test('makes the protocol-relative icon URL fetchable', () {
      // WeatherAPI returns `//cdn...`, which a browser resolves and an HTTP
      // client does not. Getting this wrong shows a broken image on Home.
      expect(weather.iconUrl, startsWith('https://'));
      expect(weather.iconUrl, isNot(startsWith('https:////')));
    });

    test('joins location and region for display', () {
      expect(weather.displayLocation, 'Ahmedabad, Gujarat');
    });

    test('omits the separator when there is no region', () {
      final noRegion = WeatherSnapshot.fromJson({
        'location': {'name': 'Anand', 'region': ''},
        'current': <String, dynamic>{},
      });
      expect(noRegion.displayLocation, 'Anand');
    });

    test('parses the forecast', () {
      expect(weather.forecast, hasLength(1));
      final day = weather.forecast.single;
      expect(day.maxTempC, 33.1);
      expect(day.minTempC, 25.6);
      expect(day.chanceOfRain, 82);
      expect(day.condition, 'Patchy rain nearby');
      expect(day.iconUrl, startsWith('https://'));
    });

    test('survives a response with missing fields', () {
      // The route falls back to Open-Meteo, which fills fewer fields, and it
      // can return `forecastError` with no forecast at all. A farmer should
      // still see a temperature rather than a crash.
      final sparse = WeatherSnapshot.fromJson({
        'location': {'name': 'Rajkot'},
        'current': {'temp_c': 28},
      });

      expect(sparse.locationName, 'Rajkot');
      expect(sparse.tempC, 28);
      expect(sparse.region, isEmpty);
      expect(sparse.condition, isEmpty);
      expect(sparse.iconUrl, isEmpty);
      expect(sparse.forecast, isEmpty);
    });

    test('handles an entirely empty response', () {
      final empty = WeatherSnapshot.fromJson(const {});
      expect(empty.tempC, 0);
      expect(empty.forecast, isEmpty);
    });

    test('coerces numbers arriving as strings', () {
      final stringy = WeatherSnapshot.fromJson({
        'location': {'name': 'Surat'},
        'current': {'temp_c': '27.5', 'humidity': '61'},
      });

      expect(stringy.tempC, 27.5);
      expect(stringy.humidity, 61);
    });
  });
}
