import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
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

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 20),
        ),
      );

      state =
          '${position.latitude.toStringAsFixed(3)},'
          '${position.longitude.toStringAsFixed(3)}';
      return LocationOutcome.ok;
    } on TimeoutException {
      return LocationOutcome.timedOut;
    } catch (_) {
      return LocationOutcome.failed;
    }
  }
}

/// Why finding the farmer's location did or did not work.
enum LocationOutcome { ok, serviceOff, denied, blocked, timedOut, failed }

/// Weather for the farmer's field and surrounding district.
/// Rebuilt in the Warm Earth Editorial language matching Weather.dc.html.
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

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final query = ref.watch(weatherQueryProvider);
    final weatherAsync = ref.watch(weatherProvider(query));

    final weatherData = weatherAsync.value;
    final locationSubtitle = weatherData != null
        ? '${weatherData.displayLocation} · ${l10n.weatherGpsPoint}'
        : query;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar
            Container(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? AppColors.lineDark
                        : const Color(0xFFEFE6D7),
                  ),
                ),
              ),
              child: Row(
                children: [
                  InkWell(
                    onTap: () {
                      if (Navigator.of(context).canPop()) {
                        Navigator.of(context).pop();
                      } else {
                        context.go('/home');
                      }
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: scheme.outline),
                        color: scheme.surface,
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 24,
                        color: scheme.onSurface,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          l10n.navigation_weather,
                          style: TextStyle(
                            fontFamily: AppTheme.displayFamily,
                            fontSize: 21,
                            fontWeight: FontWeight.w600,
                            height: 1.15,
                            color: scheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          locationSubtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.muted,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Search & GPS Location Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 10, 18, 6),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 42,
                      decoration: BoxDecoration(
                        color: scheme.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: scheme.outline),
                      ),
                      child: TextField(
                        controller: _searchController,
                        textInputAction: TextInputAction.search,
                        style: const TextStyle(fontSize: 14),
                        decoration: InputDecoration(
                          hintText: l10n.weatherSearchHint,
                          hintStyle: const TextStyle(
                            fontSize: 13,
                            color: AppColors.muted,
                          ),
                          prefixIcon: const Icon(
                            Icons.search,
                            size: 20,
                            color: AppColors.muted,
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 10,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                        onSubmitted: (value) {
                          ref.read(weatherQueryProvider.notifier).search(value);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _locating ? null : _useLocation,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: scheme.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: scheme.outline),
                      ),
                      alignment: Alignment.center,
                      child: _locating
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.forest,
                              ),
                            )
                          : const Icon(
                              Icons.my_location_rounded,
                              size: 20,
                              color: AppColors.forest,
                            ),
                    ),
                  ),
                ],
              ),
            ),

            // Main Content Area
            Expanded(
              child: RefreshIndicator(
                color: AppColors.forest,
                onRefresh: () async {
                  ref.invalidate(weatherProvider(query));
                  await ref.read(weatherProvider(query).future);
                },
                child: weatherAsync.when(
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.forest),
                  ),
                  error: (error, _) => _ErrorView(error: error, query: query),
                  data: (weather) => _WeatherContent(weather: weather),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WeatherContent extends StatelessWidget {
  const _WeatherContent({required this.weather});

  final WeatherSnapshot weather;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final advice = farmAdviceFor(weather, l10n);

    final rainChance = weather.forecast.isNotEmpty
        ? weather.forecast.first.chanceOfRain
        : 0;

    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Current Weather Big Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: isDark ? AppColors.skyTintDark : AppColors.skyTint,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? AppColors.skyLineDark : AppColors.skyLine,
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
                            '${weather.tempC.round()}°',
                            style: TextStyle(
                              fontFamily: AppTheme.displayFamily,
                              fontSize: 56,
                              fontWeight: FontWeight.w600,
                              height: 0.95,
                              letterSpacing: -1.4,
                              color: isDark ? AppColors.inkDark : AppColors.ink,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${weather.condition} · ${l10n.weatherFeels('${weather.tempC.round()}')}',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                              color: isDark ? AppColors.skyDark : AppColors.sky,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (weather.iconUrl.isNotEmpty)
                      CachedNetworkImage(
                        imageUrl: weather.iconUrl,
                        width: 62,
                        height: 62,
                        fit: BoxFit.contain,
                        errorWidget: (_, _, _) => const Icon(
                          Icons.wb_sunny_rounded,
                          size: 54,
                          color: AppColors.amber,
                        ),
                      )
                    else
                      const Icon(
                        Icons.wb_sunny_rounded,
                        size: 54,
                        color: AppColors.amber,
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                // 4-Column Metric Strip
                Row(
                  children: [
                    Expanded(
                      child: _MetricCard(
                        label: l10n.weatherHumidity,
                        value: '${weather.humidity}%',
                        isDark: isDark,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _MetricCard(
                        label: l10n.weatherWind,
                        value: '${weather.windKph.round()}',
                        isDark: isDark,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _MetricCard(
                        label: l10n.weatherPage_rain,
                        value: '$rainChance%',
                        isDark: isDark,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _MetricCard(
                        label: l10n.weatherPage_uvIndex,
                        value: weather.isDay ? 'Day' : 'Night',
                        isDark: isDark,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Section: WHAT THIS MEANS FOR THE FIELD
          Padding(
            padding: const EdgeInsets.only(top: 20, bottom: 10),
            child: Text(
              l10n.weatherFieldImpact.toUpperCase(),
              style: AppTheme.eyebrow(context),
            ),
          ),

          if (advice.isNotEmpty) ...[
            for (final item in advice) ...[
              _AdviceItemCard(advice: item, isDark: isDark),
              const SizedBox(height: 10),
            ],
          ] else ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? AppColors.forestTintDark : AppColors.forestTint,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark
                      ? AppColors.forestLineDark
                      : AppColors.forestLine,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.check_circle_outline_rounded,
                    size: 22,
                    color: AppColors.forest,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.weatherWorkOk,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Wind and rain conditions are suitable for routine field spraying and irrigation.',
                          style: TextStyle(
                            fontSize: 13,
                            height: 1.55,
                            color: isDark
                                ? AppColors.ink2Dark
                                : const Color(0xFF4C4640),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          // 3. Section: NEXT SEVEN DAYS
          if (weather.forecast.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.only(top: 18, bottom: 10),
              child: Text(
                l10n.weatherNext7Days.toUpperCase(),
                style: AppTheme.eyebrow(context),
              ),
            ),
            KdCard(
              clip: true,
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  for (var i = 0; i < weather.forecast.length; i++) ...[
                    if (i > 0)
                      Divider(
                        height: 1,
                        thickness: 1,
                        color: isDark ? AppColors.sunkDark : AppColors.sunk,
                      ),
                    _ForecastDayRow(day: weather.forecast[i], isFirst: i == 0),
                  ],
                ],
              ),
            ),
          ],

          const SizedBox(height: 14),

          // 4. Source & Provenance Footnote
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const ProvenanceChip.always(
                Provenance.live,
                label: 'Live · WeatherAPI',
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${DateFormat('h:mm a').format(weather.fetchedAt)}. ${l10n.weatherSourceNotice}',
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.label,
    required this.value,
    required this.isDark,
  });

  final String label;
  final String value;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        border: Border.all(
          color: isDark ? AppColors.skyLineDark : AppColors.skyLine,
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? AppColors.ink2Dark : AppColors.ink2,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.inkDark : AppColors.ink,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _AdviceItemCard extends StatelessWidget {
  const _AdviceItemCard({required this.advice, required this.isDark});

  final FarmAdvice advice;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final (bg, line, iconColor, iconData, title) = switch (advice.kind) {
      FarmAdviceKind.wind => (
        isDark ? AppColors.amberTintDark : AppColors.amberTint,
        isDark ? AppColors.amberLineDark : AppColors.amberLine,
        isDark ? AppColors.amberDark : AppColors.amberText,
        Icons.air_rounded,
        'High wind speed warning',
      ),
      FarmAdviceKind.rain => (
        isDark ? AppColors.skyTintDark : AppColors.skyTint,
        isDark ? AppColors.skyLineDark : AppColors.skyLine,
        isDark ? AppColors.skyDark : AppColors.sky,
        Icons.umbrella_outlined,
        'Rain wash-off risk',
      ),
      FarmAdviceKind.heat => (
        isDark ? AppColors.dangerTintDark : AppColors.dangerTint,
        isDark ? AppColors.dangerLineDark : AppColors.dangerLine,
        isDark ? AppColors.dangerDark : AppColors.danger,
        Icons.thermostat_rounded,
        'Extreme temperature alert',
      ),
    };

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: line),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(iconData, size: 22, color: iconColor),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.inkDark : AppColors.ink,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  advice.message,
                  style: TextStyle(
                    fontSize: 13,
                    height: 1.55,
                    color: isDark
                        ? AppColors.ink2Dark
                        : const Color(0xFF4C4640),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ForecastDayRow extends StatelessWidget {
  const _ForecastDayRow({required this.day, required this.isFirst});

  final ForecastDay day;
  final bool isFirst;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final dayLabel = isFirst
        ? l10n.advisoryToday
        : DateFormat('EEE').format(day.date);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
      child: Row(
        children: [
          SizedBox(
            width: 44,
            child: Text(
              dayLabel,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 8),
          if (day.iconUrl.isNotEmpty)
            CachedNetworkImage(
              imageUrl: day.iconUrl,
              width: 22,
              height: 22,
              errorWidget: (_, _, _) => const Icon(
                Icons.wb_cloudy_outlined,
                size: 20,
                color: AppColors.muted,
              ),
            )
          else
            const Icon(
              Icons.wb_cloudy_outlined,
              size: 20,
              color: AppColors.muted,
            ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '${day.condition}${day.chanceOfRain > 0 ? ', ${day.chanceOfRain}% rain' : ''}',
              style: const TextStyle(fontSize: 13, color: AppColors.muted),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: '${day.maxTempC.round()}° ',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextSpan(
                  text: '${day.minTempC.round()}°',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 14,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorView extends ConsumerWidget {
  const _ErrorView({required this.error, required this.query});

  final Object error;
  final String query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    final cached = ref.read(weatherRepositoryProvider).lastKnown(query);
    if (cached != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CachedNotice(savedAt: cached.savedAt),
          _WeatherContent(weather: cached.value),
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

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
      ),
    );
  }
}
