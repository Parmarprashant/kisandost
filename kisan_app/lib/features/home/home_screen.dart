import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/shell/app_drawer.dart';
import '../../app/shell/ask_fab.dart';
import '../../app/locale_controller.dart';
import '../../app/theme/app_colors.dart';
import '../../core/network/api_exception.dart';
import '../../core/widgets/home_widget_service.dart';
import '../../l10n/app_localizations.dart';
import '../advisory/data/advisory_repository.dart';
import '../auth/data/auth_controller.dart';
import '../farm/data/farm_models.dart';
import '../farm/data/farm_repository.dart';
import '../weather/data/weather_models.dart';
import '../weather/data/weather_repository.dart';

/// Default location until fields and GPS land in P0-5/P0-7.
const _defaultLocation = 'Ahmedabad,India';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final user = ref.watch(currentUserProvider);
    final crops = ref.watch(activeCropsProvider);

    // Weather for the farmer's own field when one is on record; the default
    // only covers a brand-new account with nothing entered yet.
    final location = crops.isNotEmpty
        ? (crops.first.field.location.weatherQuery ?? _defaultLocation)
        : _defaultLocation;
    final weather = ref.watch(weatherProvider(location));

    // Keep the home-screen widget in step with what is on this screen. Done
    // here rather than on a timer because this is the moment we know the
    // figures are fresh and which field they belong to.
    _syncHomeWidget(ref, l10n, weather.value, location);

    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(
        title: Text(
          user == null
              ? l10n.navigation_home
              : l10n.homeGreeting(user.name.split(' ').first),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language),
            tooltip: l10n.appLanguage,
            onPressed: () => _showLanguageSheet(context, ref),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // Invalidate first, then await the refetch, so the spinner stays
          // up until the new data is actually in hand.
          ref.invalidate(fieldsProvider);
          ref.invalidate(weatherProvider(location));
          await ref.read(weatherProvider(location).future);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          children: [
            InkWell(
              onTap: () => context.go('/weather'),
              borderRadius: BorderRadius.circular(16),
              child: _WeatherCard(state: weather, location: location),
            ),
            const SizedBox(height: 24),

            if (crops.isNotEmpty) ...[
              Text(
                l10n.homeMyCrops,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 116,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: crops.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 12),
                  itemBuilder: (context, i) => _CropChip(entry: crops[i]),
                ),
              ),
              const SizedBox(height: 24),
            ],

            Text(
              l10n.dashboard_chooseCrop,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            const _QuickActions(),

            const SizedBox(height: 28),
            const _Suggestions(),
            // Clear of the floating button.
            const SizedBox(height: 72),
          ],
        ),
      ),
      floatingActionButton: const AskFab(),
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

/// One active crop, with its days-after-sowing — the number the advisory
/// engine keys off and the one a farmer counts in.
class _CropChip extends StatelessWidget {
  const _CropChip({required this.entry});

  final ({Field field, Crop crop}) entry;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    return InkWell(
      onTap: () => context.go('/farm'),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 160,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).colorScheme.outline),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Icon(Icons.eco, color: AppColors.primary),
            Text(
              entry.crop.cropName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: text.bodyLarge,
            ),
            Text(
              '${entry.field.name} · ${entry.crop.areaLabel}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: text.labelSmall,
            ),
            Text(
              l10n.farmDayCount('${entry.crop.daysAfterSowing}'),
              style: text.labelMedium?.copyWith(color: AppColors.primary),
            ),
          ],
        ),
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
      (Icons.science_outlined, l10n.navigation_calculator, '/fertilizer'),
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

/// Pushes the current weather and today's advisory to the Android widget.
///
/// Fire and forget: the widget is a convenience, and nothing on this screen
/// should wait for it or fail because of it.
void _syncHomeWidget(
  WidgetRef ref,
  L10n l10n,
  WeatherSnapshot? weather,
  String location,
) {
  if (!homeWidgetSupported || weather == null) return;

  final timelines = ref.read(cropTimelinesProvider);

  // The first crop with something actually due. A crop between stages has
  // nothing to say, and filling the line with the previous stage would tell
  // a farmer to spray late.
  String advisory = '';
  for (final entry in timelines) {
    final current = entry.timeline.current;
    if (current != null) {
      advisory = '${entry.crop.cropName}: ${current.stageName}';
      break;
    }
  }

  const HomeWidgetService().update(
    HomeWidgetData(
      place: weather.displayLocation,
      temperature: '${weather.tempC.round()}°C',
      condition: weather.condition,
      advisory: advisory,
      updated: l10n.offlineJustNow,
    ),
  );
}

/// What to do next, from what this farmer actually has.
///
/// Nothing here is filler. Every card comes from real state — a stage that is
/// due, a field that does not exist yet — so an empty home screen fills with
/// work rather than decoration, and a farmer with nothing pending is not
/// handed invented tasks.
class _Suggestions extends ConsumerWidget {
  const _Suggestions();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final timelines = ref.watch(cropTimelinesProvider);
    final crops = ref.watch(activeCropsProvider);

    final cards = <_Suggestion>[];

    // Nothing set up yet: the one thing that unlocks everything else.
    if (crops.isEmpty) {
      cards.add(
        _Suggestion(
          icon: Icons.add_location_alt_outlined,
          title: l10n.suggestAddField,
          body: l10n.suggestAddFieldWhy,
          route: '/farm',
        ),
      );
    }

    // Something due today, on a real crop, from the bundled calendar.
    for (final entry in timelines) {
      final current = entry.timeline.current;
      if (current == null) continue;
      cards.add(
        _Suggestion(
          icon: Icons.event_available_outlined,
          title: '${entry.crop.cropName}: ${current.stageName}',
          body: current.purpose,
          route: '/advisory',
        ),
      );
      if (cards.length >= 2) break;
    }

    // Nothing due, but something close enough to plan for.
    if (cards.length < 2) {
      for (final entry in timelines) {
        final days = entry.timeline.daysUntilNext;
        final next = entry.timeline.next;
        if (next == null || days == null || days > 7) continue;
        cards.add(
          _Suggestion(
            icon: Icons.schedule_outlined,
            title: '${entry.crop.cropName}: ${next.stageName}',
            body: l10n.suggestInDays('$days'),
            route: '/advisory',
          ),
        );
        break;
      }
    }

    // Always last, and always available: ask in your own words.
    cards.add(
      _Suggestion(
        icon: Icons.forum_outlined,
        title: crops.isEmpty
            ? l10n.suggestAsk
            : l10n.suggestAskCrop(crops.first.crop.cropName),
        body: l10n.suggestAskWhy,
        route: '/ask',
      ),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.homeNextUp, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        for (final card in cards.take(3))
          Padding(padding: const EdgeInsets.only(bottom: 10), child: card),
      ],
    );
  }
}

class _Suggestion extends StatelessWidget {
  const _Suggestion({
    required this.icon,
    required this.title,
    required this.body,
    required this.route,
  });

  final IconData icon;
  final String title;
  final String body;
  final String route;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push(route),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: text.titleMedium),
                    const SizedBox(height: 2),
                    Text(
                      body,
                      style: text.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }
}
