import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/locale_controller.dart';
import '../../app/theme/app_colors.dart';
import '../../core/network/api_exception.dart';
import '../../l10n/app_localizations.dart';
import '../weather/data/weather_models.dart';
import '../weather/data/weather_repository.dart';

/// Default location until fields and GPS land in P0-5/P0-7.
const _defaultLocation = 'Ahmedabad,India';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final weather = ref.watch(weatherProvider(_defaultLocation));

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.navigation_home),
        actions: [
          IconButton(
            icon: const Icon(Icons.language),
            tooltip: l10n.appLanguage,
            onPressed: () => _showLanguageSheet(context, ref),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async =>
            ref.refresh(weatherProvider(_defaultLocation).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            _WeatherCard(state: weather, location: _defaultLocation),
            const SizedBox(height: 24),
            Text(
              l10n.dashboard_chooseCrop,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            const _QuickActions(),
          ],
        ),
      ),
    );
  }

  void _showLanguageSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) {
        final current = ref.read(localeProvider);
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              for (final locale in supportedLocales)
                ListTile(
                  title: Text(
                    localeNames[locale.languageCode] ?? locale.languageCode,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  trailing: locale == current
                      ? const Icon(Icons.check, color: AppColors.primary)
                      : null,
                  onTap: () {
                    ref.read(localeProvider.notifier).change(locale);
                    Navigator.of(sheetContext).pop();
                  },
                ),
            ],
          ),
        );
      },
    );
  }
}

class _WeatherCard extends StatelessWidget {
  const _WeatherCard({required this.state, required this.location});

  final AsyncValue<WeatherSnapshot> state;
  final String location;

  @override
  Widget build(BuildContext context) {
    return state.when(
      loading: () => const _WeatherPlaceholder(),
      error: (error, _) => _WeatherError(error: error),
      data: (weather) => _WeatherContent(weather: weather),
    );
  }
}

class _WeatherContent extends StatelessWidget {
  const _WeatherContent({required this.weather});

  final WeatherSnapshot weather;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    // Day and night get different treatments so a glance tells you which,
    // without reading anything.
    final gradient = weather.isDay
        ? const [Color(0xFFFDF0D5), Color(0xFFBFE3F5)]
        : const [Color(0xFF1E293B), Color(0xFF1E1B4B)];
    final foreground = weather.isDay ? const Color(0xFF1A2733) : Colors.white;

    return Container(
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
                      style: text.bodySmall?.copyWith(
                        color: foreground.withValues(alpha: 0.8),
                      ),
                    ),
                    const SizedBox(height: 4),
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
                  width: 64,
                  height: 64,
                  errorWidget: (_, _, _) => const SizedBox.shrink(),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _Metric(
                icon: Icons.water_drop_outlined,
                label: '${weather.humidity}%',
                color: foreground,
              ),
              const SizedBox(width: 20),
              _Metric(
                icon: Icons.air,
                label: '${weather.windKph.round()} km/h',
                color: foreground,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.icon, required this.label, required this.color});

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: color.withValues(alpha: 0.85)),
        const SizedBox(width: 6),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall
              ?.copyWith(color: color.withValues(alpha: 0.85)),
        ),
      ],
    );
  }
}

class _WeatherPlaceholder extends StatelessWidget {
  const _WeatherPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 168,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}

class _WeatherError extends ConsumerWidget {
  const _WeatherError({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    // Plain language, never a status code. The distinction that matters to a
    // farmer is "your phone is offline" vs "our side is busy".
    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      child: Column(
        children: [
          const Icon(Icons.cloud_off, size: 32, color: AppColors.muted),
          const SizedBox(height: 12),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => ref.invalidate(weatherProvider(_defaultLocation)),
            icon: const Icon(Icons.refresh),
            label: Text(l10n.appRetry),
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions();

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    final actions = [
      (Icons.camera_alt_outlined, l10n.navigation_diseases, '/diagnose'),
      (Icons.trending_up, l10n.navigation_ai, '/insights'),
      (Icons.science_outlined, l10n.navigation_calculator, '/insights'),
    ];

    return Row(
      children: [
        for (final (icon, label, route) in actions) ...[
          Expanded(
            child: InkWell(
              onTap: () => context.go(route),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                child: Column(
                  children: [
                    Icon(icon, size: 28, color: AppColors.primary),
                    const SizedBox(height: 8),
                    Text(
                      label,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.labelMedium,
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (label != actions.last.$2) const SizedBox(width: 12),
        ],
      ],
    );
  }
}
