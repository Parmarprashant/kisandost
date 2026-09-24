/// Models for `GET /api/weather?q=`.
///
/// The route normalises WeatherAPI.com and its Open-Meteo fallback into one
/// WeatherAPI-shaped payload, so only that shape is parsed here.
///
/// Hand-written rather than freezed: the payload is small, and keeping it
/// generator-free means the weather screen builds before `build_runner` has
/// ever run.
library;

class WeatherSnapshot {
  const WeatherSnapshot({
    required this.locationName,
    required this.region,
    required this.tempC,
    required this.condition,
    required this.iconUrl,
    required this.humidity,
    required this.windKph,
    required this.isDay,
    required this.fetchedAt,
    this.forecast = const [],
  });

  final String locationName;
  final String region;
  final double tempC;
  final String condition;
  final String iconUrl;
  final int humidity;
  final double windKph;
  final bool isDay;

  /// When this was retrieved, so cached data can be labelled honestly rather
  /// than passed off as live.
  final DateTime fetchedAt;

  final List<ForecastDay> forecast;

  String get displayLocation =>
      region.isEmpty ? locationName : '$locationName, $region';

  factory WeatherSnapshot.fromJson(Map<String, dynamic> json) {
    final location = json['location'] as Map<String, dynamic>? ?? const {};
    final current = json['current'] as Map<String, dynamic>? ?? const {};
    final condition = current['condition'] as Map<String, dynamic>? ?? const {};

    final rawDays =
        (json['forecast'] as Map<String, dynamic>?)?['forecastday']
            as List<dynamic>? ??
        const [];

    return WeatherSnapshot(
      locationName: location['name'] as String? ?? '',
      region: location['region'] as String? ?? '',
      tempC: _toDouble(current['temp_c']),
      condition: condition['text'] as String? ?? '',
      iconUrl: _normaliseIcon(condition['icon'] as String?),
      humidity: _toInt(current['humidity']),
      windKph: _toDouble(current['wind_kph']),
      isDay: _toInt(current['is_day']) == 1,
      fetchedAt: DateTime.now(),
      forecast: rawDays
          .whereType<Map<String, dynamic>>()
          .map(ForecastDay.fromJson)
          .toList(growable: false),
    );
  }

  /// WeatherAPI returns protocol-relative icon URLs (`//cdn...`), which are
  /// fine in a browser and useless to an HTTP client.
  static String _normaliseIcon(String? icon) {
    if (icon == null || icon.isEmpty) return '';
    if (icon.startsWith('//')) return 'https:$icon';
    return icon;
  }
}

class ForecastDay {
  const ForecastDay({
    required this.date,
    required this.maxTempC,
    required this.minTempC,
    required this.condition,
    required this.iconUrl,
    required this.chanceOfRain,
  });

  final DateTime date;
  final double maxTempC;
  final double minTempC;
  final String condition;
  final String iconUrl;
  final int chanceOfRain;

  factory ForecastDay.fromJson(Map<String, dynamic> json) {
    final day = json['day'] as Map<String, dynamic>? ?? const {};
    final condition = day['condition'] as Map<String, dynamic>? ?? const {};

    return ForecastDay(
      date: DateTime.tryParse(json['date'] as String? ?? '') ?? DateTime.now(),
      maxTempC: _toDouble(day['maxtemp_c']),
      minTempC: _toDouble(day['mintemp_c']),
      condition: condition['text'] as String? ?? '',
      iconUrl: WeatherSnapshot._normaliseIcon(condition['icon'] as String?),
      chanceOfRain: _toInt(day['daily_chance_of_rain']),
    );
  }
}

double _toDouble(Object? value) => switch (value) {
  final num n => n.toDouble(),
  final String s => double.tryParse(s) ?? 0,
  _ => 0,
};

int _toInt(Object? value) => switch (value) {
  final num n => n.toInt(),
  final String s => int.tryParse(s) ?? 0,
  _ => 0,
};
