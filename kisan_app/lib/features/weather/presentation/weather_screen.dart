import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/offline/offline_banner.dart';
import '../../../l10n/app_localizations.dart';
import '../data/farm_advice.dart';
import '../data/weather_models.dart';
import '../data/weather_repository.dart';

/// The place currently being shown. A plain string because the API takes
/// either a name or `lat,lon` and resolves both.
final weatherQueryProvider = NotifierProvider<WeatherQuery, String>(
  WeatherQuery.new,
);

class WeatherQuery extends Notifier<String> {
  @override
  String build() => 'Ahmedabad,India';

  void search(String place) {
    final trimmed = place.trim();
    if (trimmed.isNotEmpty) state = trimmed;
  }

  /// Switches to GPS coordinates.
  ///
  /// Reports what went wrong rather than a bare false: "turn on location",
  /// "you said no once" and "allow it in Settings" need different actions
  /// from the farmer, and one message for all three tells them nothing.
  Future<LocationOutcome> useCurrentLocation() async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return LocationOutcome.serviceOff;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.deniedForever) {
        return LocationOutcome.blocked;
      }
      if (permission == LocationPermission.denied) {
        return LocationOutcome.denied;
      }

      // A fix indoors or under cloud can take a very long time, and without
      // a limit the button spins until the farmer force-closes the app.
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 20),
        ),
      );

      // Village-level precision is plenty for weather, and fewer decimals
      // keeps the cache key stable as the phone's fix drifts by a few metres.
      state =
          '${position.latitude.toStringAsFixed(3)},'
          '${position.longitude.toStringAsFixed(3)}';
      return LocationOutcome.ok;
    } on TimeoutException {
      return LocationOutcome.timedOut;
    } catch (_) {
      // A platform exception here must not leave the caller waiting forever.
      return LocationOutcome.failed;
    }
  }
}

/// Why finding the farmer's location did or did not work.
enum LocationOutcome {
  ok,

  /// Location is switched off on the phone.
  serviceOff,

  /// Refused this time; asking again is allowed.
  denied,

  /// Refused permanently — only Settings can undo it.
  blocked,

  /// No fix within the time limit. Common indoors.
  timedOut,

  /// Anything else.
  failed,
}

class WeatherScreen extends ConsumerStatefulWidget {
  const WeatherScreen({super.key});

  @override
  ConsumerState<WeatherScreen> createState() => _WeatherScreenState();
}

class _WeatherScreenState extends ConsumerState<WeatherScreen> {
  final _searchController = TextEditingController();
  bool _locating = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _useLocation() async {
    setState(() => _locating = true);
    final outcome = await ref
        .read(weatherQueryProvider.notifier)
        .useCurrentLocation();
    if (!mounted) return;
    setState(() => _locating = false);

    if (outcome == LocationOutcome.ok) return;

    final l10n = L10n.of(context);
    final message = switch (outcome) {
      LocationOutcome.serviceOff => l10n.weatherLocationOff,
      LocationOutcome.blocked => l10n.weatherLocationBlocked,
      LocationOutcome.timedOut => l10n.weatherLocationSlow,
      _ => l10n.weatherLocationDenied,
    };

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final query = ref.watch(weatherQueryProvider);
    final weather = ref.watch(weatherProvider(query));

    return Scaffold(
      appBar: AppBar(title: Text(l10n.navigation_weather)),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(weatherProvider(query).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            TextField(
              controller: _searchController,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: l10n.weatherSearchHint,
                prefixIcon: const Icon(Icons.search),
              ),
              onSubmitted: (value) =>
                  ref.read(weatherQueryProvider.notifier).search(value),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _locating ? null : _useLocation,
              icon: _locating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
              label: Text(
                _locating ? l10n.weatherLocating : l10n.weatherUseLocation,
              ),
            ),
            const SizedBox(height: 24),
            weather.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 48),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (error, _) => _Error(error: error, query: query),
              data: (data) => _Content(weather: data),
            ),
          ],
        ),
      ),
    );
  }
}

class _Content extends StatelessWidget {
  const _Content({required this.weather});

  final WeatherSnapshot weather;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final advice = farmAdviceFor(weather, l10n);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _CurrentCard(weather: weather),

        // Advice comes before the forecast: what to do today outranks what
        // the sky looks like on Thursday.
        if (advice.isNotEmpty) ...[
          const SizedBox(height: 16),
          for (final item in advice) _AdviceCard(advice: item),
        ],

        if (weather.forecast.isNotEmpty) ...[
          const SizedBox(height: 24),
          Text(l10n.weatherForecast, style: text.titleMedium),
          const SizedBox(height: 12),
          for (final day in weather.forecast) _ForecastRow(day: day),
        ],
      ],
    );
  }
}

class _CurrentCard extends StatelessWidget {
  const _CurrentCard({required this.weather});

  final WeatherSnapshot weather;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    final gradient = weather.isDay
        ? const [Color(0xFFFDF0D5), Color(0xFFBFE3F5)]
        : const [Color(0xFF1E293B), Color(0xFF1E1B4B)];
    final foreground = weather.isDay ? const Color(0xFF1A2733) : Colors.white;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: gradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      weather.displayLocation,
                      style: text.bodyLarge?.copyWith(color: foreground),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${weather.tempC.round()}°C',
                      style: text.displaySmall?.copyWith(color: foreground),
                    ),
                    Text(
                      weather.condition,
                      style: text.bodyLarge?.copyWith(color: foreground),
                    ),
                  ],
                ),
              ),
              if (weather.iconUrl.isNotEmpty)
                CachedNetworkImage(
                  imageUrl: weather.iconUrl,
                  width: 72,
                  height: 72,
                  errorWidget: (_, _, _) => const SizedBox.shrink(),
                ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _Metric(
                  icon: Icons.water_drop_outlined,
                  label: l10n.weatherHumidity,
                  value: '${weather.humidity}%',
                  color: foreground,
                ),
              ),
              Expanded(
                child: _Metric(
                  icon: Icons.air,
                  label: l10n.weatherWind,
                  value: '${weather.windKph.round()} km/h',
                  color: foreground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Row(
      children: [
        Icon(icon, size: 22, color: color.withValues(alpha: 0.85)),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: text.labelSmall?.copyWith(
                color: color.withValues(alpha: 0.75),
              ),
            ),
            Text(value, style: text.bodyLarge?.copyWith(color: color)),
          ],
        ),
      ],
    );
  }
}

class _AdviceCard extends StatelessWidget {
  const _AdviceCard({required this.advice});

  final FarmAdvice advice;

  @override
  Widget build(BuildContext context) {
    final (icon, color) = switch (advice.kind) {
      FarmAdviceKind.rain => (Icons.umbrella_outlined, AppColors.sky),
      FarmAdviceKind.heat => (Icons.thermostat, AppColors.danger),
      FarmAdviceKind.wind => (Icons.air, AppColors.secondary),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: color.withValues(alpha: 0.10),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              advice.message,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ),
        ],
      ),
    );
  }
}

class _ForecastRow extends StatelessWidget {
  const _ForecastRow({required this.day});

  final ForecastDay day;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final locale = Localizations.localeOf(context).toString();
    final dayName = DateFormat.EEEE(locale).format(day.date);

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          if (day.iconUrl.isNotEmpty)
            CachedNetworkImage(
              imageUrl: day.iconUrl,
              width: 40,
              height: 40,
              errorWidget: (_, _, _) => const SizedBox(width: 40),
            )
          else
            const SizedBox(width: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dayName, style: text.bodyLarge),
                if (day.chanceOfRain > 0)
                  Text(
                    l10n.weatherRain('${day.chanceOfRain}'),
                    style: text.bodySmall,
                  ),
              ],
            ),
          ),
          Text(
            '${day.maxTempC.round()}° / ${day.minTempC.round()}°',
            style: text.bodyLarge,
          ),
        ],
      ),
    );
  }
}

class _Error extends ConsumerWidget {
  const _Error({required this.error, required this.query});

  final Object error;
  final String query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    // Standing in a field with no signal, the last forecast we saw is a far
    // better answer than an error. Shown with its age so nobody mistakes
    // yesterday's rain for today's.
    final cached = ref.read(weatherRepositoryProvider).lastKnown(query);
    if (cached != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CachedNotice(savedAt: cached.savedAt),
          _Content(weather: cached.value),
          const SizedBox(height: 16),
          Center(
            child: OutlinedButton.icon(
              onPressed: () => ref.invalidate(weatherProvider(query)),
              icon: const Icon(Icons.refresh),
              label: Text(l10n.appRetry),
            ),
          ),
        ],
      );
    }

    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          const Icon(Icons.cloud_off, size: 48, color: AppColors.muted),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () => ref.invalidate(weatherProvider(query)),
            icon: const Icon(Icons.refresh),
            label: Text(l10n.appRetry),
          ),
        ],
      ),
    );
  }
}
