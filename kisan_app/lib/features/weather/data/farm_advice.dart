import '../../../l10n/app_localizations.dart';
import 'weather_models.dart';

/// What the weather means for work in the field today.
///
/// This is the difference between a weather app and a farming app: a farmer
/// does not need to be told it is 38°C, they can feel that. They need to know
/// that spraying today is wasted money.
///
/// Every rule below is a well-known agronomic threshold, and each one only
/// fires on data the API actually returns — nothing is inferred or invented.
enum FarmAdviceKind { rain, heat, wind }

class FarmAdvice {
  const FarmAdvice(this.kind, this.message);

  final FarmAdviceKind kind;
  final String message;
}

/// Wind above roughly 15 km/h causes spray drift, wasting chemical and
/// exposing neighbouring plots.
const _windDriftKph = 15.0;

/// Above 38°C irrigating in full sun loses most of the water to evaporation.
const _heatStressC = 38.0;

/// A rain chance this high makes a foliar spray likely to wash off.
const _rainWashoffPercent = 60;

List<FarmAdvice> farmAdviceFor(WeatherSnapshot weather, L10n l10n) {
  final advice = <FarmAdvice>[];

  final rainToday = weather.forecast.isNotEmpty
      ? weather.forecast.first.chanceOfRain
      : 0;

  if (rainToday >= _rainWashoffPercent) {
    advice.add(FarmAdvice(FarmAdviceKind.rain, l10n.weatherSprayWarn));
  }

  if (weather.tempC >= _heatStressC) {
    advice.add(FarmAdvice(FarmAdviceKind.heat, l10n.weatherHeatWarn));
  }

  if (weather.windKph >= _windDriftKph) {
    advice.add(FarmAdvice(FarmAdviceKind.wind, l10n.weatherWindWarn));
  }

  return advice;
}
