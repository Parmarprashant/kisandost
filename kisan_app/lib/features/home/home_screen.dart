import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/locale_controller.dart';
import '../../app/shell/app_drawer.dart';
import '../../app/theme/app_colors.dart';
import '../../app/theme/app_theme.dart';
import '../../app/theme/kit.dart';
import '../../core/network/api_exception.dart';
import '../../core/widgets/home_widget_service.dart';
import '../../l10n/app_localizations.dart';
import '../advisory/data/advisory_models.dart';
import '../advisory/data/advisory_repository.dart';
import '../auth/data/auth_controller.dart';
import '../farm/data/farm_models.dart';
import '../farm/data/farm_repository.dart';
import '../mandi/data/mandi_models.dart';
import '../mandi/data/mandi_repository.dart';
import '../schemes/data/scheme_repository.dart';
import '../weather/data/farm_advice.dart';
import '../weather/data/weather_models.dart';
import '../weather/data/weather_repository.dart';

/// Default location until the farmer has a field with coordinates on record.
const _defaultLocation = 'Ahmedabad,India';

/// The home screen.
///
/// Every block answers a question a farmer actually has at 7 AM, in the order
/// they have them: can I work today, what do I have to do, how are my crops,
/// what is my crop worth, and is there money I am leaving on the table.
///
/// There is deliberately no empty space and no decorative block: if a section
/// has nothing to say it either shows the one action that would give it
/// something to say, or it is not built at all.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
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
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async {
            // Invalidate first, then await the refetch, so the spinner stays
            // up until the new data is actually in hand.
            ref.invalidate(fieldsProvider);
            ref.invalidate(weatherProvider(location));
            await ref.read(weatherProvider(location).future);
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
            children: [
              const _Header(),
              const SizedBox(height: 14),

              InkWell(
                onTap: () => context.go('/weather'),
                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                child: _WeatherCard(state: weather, location: location),
              ),

              SectionHeader(
                l10n.homeToday,
                actionLabel: l10n.advisoryTitle,
                onAction: () => context.go('/advisory'),
              ),
              const _TodayCard(),

              if (crops.isNotEmpty) ...[
                SectionHeader(
                  l10n.homeMyCrops,
                  actionLabel: l10n.navFarm,
                  onAction: () => context.go('/farm'),
                ),
                const _CropRail(),
              ],

              SectionHeader(
                l10n.homeRateToday,
                actionLabel: l10n.homeSeeAll,
                onAction: () => context.go('/insights'),
              ),
              const _RateStrip(),

              SectionHeader(
                l10n.homeSchemesForYou,
                actionLabel: l10n.homeSeeAll,
                onAction: () => context.go('/schemes'),
              ),
              const _SchemeRail(),
            ],
          ),
        ),
      ),
    );
  }
}

/// Greeting, where the farmer is, and the two things that are always reachable.
///
/// Replaces the app bar: an app bar spends 56dp on a title that repeats the
/// lit tab, and the drawer button has to live somewhere anyway.
class _Header extends ConsumerWidget {
  const _Header();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final crops = ref.watch(activeCropsProvider);
    final fields = ref.watch(fieldsProvider).value ?? const <Field>[];

    final place = crops.isNotEmpty
        ? crops.first.field.location.label
        : null;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SquareButton(
          icon: Icons.menu,
          tooltip: MaterialLocalizations.of(context).openAppDrawerTooltip,
          onTap: () => Scaffold.of(context).openDrawer(),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user == null
                      ? l10n.navigation_home
                      : l10n.homeGreeting(user.name.split(' ').first),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.headlineSmall,
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(
                      Icons.place_outlined,
                      size: 14,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        [
                          if (place != null && place.isNotEmpty) place,
                          if (fields.isNotEmpty)
                            '${fields.length} ${l10n.farmFields}',
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        _SquareButton(
          icon: Icons.language,
          tooltip: l10n.appLanguage,
          onTap: () => _showLanguageSheet(context, ref),
        ),
      ],
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
                      ? Icon(
                          Icons.check,
                          color: Theme.of(context).colorScheme.primary,
                        )
                      : null,
                  onTap: () {
                    ref.read(localeProvider.notifier).change(locale);
                    Navigator.of(sheetContext).pop();
                  },
                ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }
}

class _SquareButton extends StatelessWidget {
  const _SquareButton({
    required this.icon,
    required this.onTap,
    this.tooltip,
  });

  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            border: Border.all(color: theme.colorScheme.outline),
          ),
          child: Icon(icon, size: 21, color: theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

class _WeatherCard extends StatelessWidget {
  const _WeatherCard({required this.state, required this.location});

  final AsyncValue<WeatherSnapshot> state;
  final String location;

  @override
  Widget build(BuildContext context) {
    return state.when(
      loading: () => const _WeatherPlaceholder(),
      error: (error, _) => _WeatherError(error: error, location: location),
      data: (weather) => _WeatherContent(weather: weather),
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

    // Warm sand by day, deep ink by night. The card is the one place the
    // page changes character, because the time of day is the first thing a
    // farmer is orienting by.
    final background = weather.isDay
        ? (isDark ? AppColors.sunkDark : const Color(0xFFF6EEDF))
        : (isDark ? const Color(0xFF14202B) : const Color(0xFF1B2A38));
    final outline = weather.isDay
        ? (isDark ? AppColors.lineStrongDark : const Color(0xFFD9CDBA))
        : const Color(0xFF2C4256);
    final ink = weather.isDay
        ? (isDark ? AppColors.inkDark : AppColors.ink)
        : Colors.white;
    final ink2 = ink.withValues(alpha: 0.72);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 15, 16, 14),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
        border: Border.all(color: outline),
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
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '${weather.tempC.round()}°',
                          style: theme.textTheme.displayLarge?.copyWith(
                            color: ink,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            weather.condition,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: ink2,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 14,
                      runSpacing: 6,
                      children: [
                        _Metric(
                          icon: Icons.water_drop_outlined,
                          label: '${weather.humidity}%',
                          color: ink2,
                        ),
                        _Metric(
                          icon: Icons.air,
                          label: '${weather.windKph.round()} km/h',
                          color: ink2,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              if (weather.iconUrl.isNotEmpty)
                CachedNetworkImage(
                  imageUrl: weather.iconUrl,
                  width: 58,
                  height: 58,
                  errorWidget: (_, _, _) => const SizedBox.shrink(),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, color: outline),
          ),
          // The one line that makes this a farming app rather than a
          // weather app: not the temperature, but whether today is worth
          // spending chemical on. Same thresholds the weather screen uses.
          Builder(
            builder: (context) {
              final advice = farmAdviceFor(weather, l10n);
              final clear = advice.isEmpty;
              final accent = weather.isDay && !isDark
                  ? (clear ? AppColors.forest : AppColors.amberText)
                  : (clear ? AppColors.forestDark : AppColors.amberDark);

              return Row(
                children: [
                  Icon(
                    clear ? Icons.check_circle_outline : Icons.error_outline,
                    size: 16,
                    color: accent,
                  ),
                  const SizedBox(width: 7),
                  Expanded(
                    child: Text(
                      clear ? l10n.weatherWorkOk : advice.first.message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: ink,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              );
            },
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
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 5),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(color: color),
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
      height: 150,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}

class _WeatherError extends ConsumerWidget {
  const _WeatherError({required this.error, required this.location});

  final Object error;
  final String location;

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

    return KdCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Icon(
            Icons.cloud_off,
            size: 30,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 10),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => ref.invalidate(weatherProvider(location)),
            icon: const Icon(Icons.refresh),
            label: Text(l10n.appRetry),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Today
// ---------------------------------------------------------------------------

/// The one thing to do today, or an honest statement that there is nothing.
///
/// Reads the same bundled advisory calendar the SMS cron does, so the card and
/// the 6 AM message can never disagree.
class _TodayCard extends ConsumerWidget {
  const _TodayCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final timelines = ref.watch(cropTimelinesProvider);
    final crops = ref.watch(activeCropsProvider);

    // Nothing set up at all: the one action that turns the whole app on.
    if (crops.isEmpty) {
      return KdCard(
        onTap: () => context.go('/farm'),
        background: isDark ? AppColors.forestTintDark : AppColors.forestTint,
        outline: isDark ? AppColors.forestLineDark : AppColors.forestLine,
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Icon(
              Icons.add_location_alt_outlined,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.suggestAddField, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 3),
                  Text(l10n.suggestAddFieldWhy, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      );
    }

    ({Field field, Crop crop, AdvisoryTimeline timeline})? due;
    for (final entry in timelines) {
      if (entry.timeline.current != null) {
        due = entry;
        break;
      }
    }

    if (due == null) {
      // A gap between stages is a real answer. Inventing an advisory to fill
      // one would put a spray recommendation in a farmer's hands for a week
      // when nobody said to spray.
      return KdCard(
        padding: const EdgeInsets.all(18),
        child: Row(
          children: [
            Icon(
              Icons.check_circle_outline,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.homeNothingDue, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 3),
                  Text(
                    l10n.homeNothingDueBody,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    final stage = due.timeline.current!;

    return KdCard(
      onTap: () => context.go('/advisory'),
      background: isDark ? AppColors.dangerTintDark : AppColors.dangerTint,
      outline: isDark ? AppColors.dangerLineDark : AppColors.dangerLine,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 6,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(AppTheme.radiusChip),
                  border: Border.all(
                    color: isDark
                        ? AppColors.dangerLineDark
                        : AppColors.dangerLine,
                  ),
                ),
                child: Text(
                  '${l10n.farmDayCount('${due.crop.daysAfterSowing}')} · ${stage.stageName}'
                      .toUpperCase(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.dangerDark : AppColors.danger,
                  ),
                ),
              ),
              Text(
                '${due.crop.cropName} · ${due.field.name}',
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 9),
          Text(stage.pesticideName, style: theme.textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            '${l10n.advisoryDose('${stage.dosagePerAcre}')} · ${stage.purpose}',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton(
                  onPressed: () => context.go('/advisory'),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(44),
                  ),
                  child: Text(l10n.homeMarkDone),
                ),
              ),
              const SizedBox(width: 8),
              _SquareButton(
                icon: Icons.storefront_outlined,
                tooltip: l10n.productsTitle,
                onTap: () => context.go('/products'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Crops
// ---------------------------------------------------------------------------

class _CropRail extends ConsumerWidget {
  const _CropRail();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timelines = ref.watch(cropTimelinesProvider);

    return SizedBox(
      height: 118,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.zero,
        itemCount: timelines.length,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (context, i) => _CropCard(entry: timelines[i]),
      ),
    );
  }
}

/// One active crop: what it is, where, how far in, and what it is waiting for.
class _CropCard extends StatelessWidget {
  const _CropCard({required this.entry});

  final ({Field field, Crop crop, AdvisoryTimeline timeline}) entry;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final stages = entry.timeline.stages.length;
    final done = entry.timeline.past.length;
    final current = entry.timeline.current;

    return SizedBox(
      width: 172,
      child: KdCard(
        onTap: () => context.go('/farm'),
        padding: const EdgeInsets.fromLTRB(13, 12, 13, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    entry.crop.cropName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.titleSmall,
                  ),
                ),
                Text(entry.crop.areaLabel, style: theme.textTheme.labelSmall),
              ],
            ),
            const SizedBox(height: 1),
            Text(
              '${entry.field.name} · ${l10n.farmDayCount('${entry.crop.daysAfterSowing}')}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall,
            ),
            const Spacer(),
            if (stages > 0)
              StageBar(
                stageCount: stages,
                currentStage: current == null ? done - 1 : done,
              ),
            const SizedBox(height: 7),
            Text(
              current?.stageName ?? l10n.homeNothingDue,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: current == null
                    ? theme.colorScheme.onSurfaceVariant
                    : (isDark
                          ? AppColors.terracottaDark
                          : AppColors.terracottaText),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Rate
// ---------------------------------------------------------------------------

/// Today's rate for the crop the farmer actually grows.
///
/// The provenance chip is not decoration: the route behind this never fails,
/// it substitutes a national average or an MSP baseline and still returns
/// success, so the only way a farmer can tell a real local rate from a
/// calculated one is if the card says which it is.
class _RateStrip extends ConsumerWidget {
  const _RateStrip();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final crops = ref.watch(activeCropsProvider);

    final query = (
      crop: crops.isNotEmpty ? crops.first.crop.cropName : 'Wheat',
      state: ref.watch(mandiQueryProvider).state,
    );
    final price = ref.watch(mandiPriceProvider(query));

    return price.when(
      loading: () => const KdCard(
        padding: EdgeInsets.symmetric(vertical: 28),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, _) => KdCard(
        onTap: () => context.go('/insights'),
        child: Row(
          children: [
            Icon(
              Icons.storefront_outlined,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 12),
            Expanded(child: Text(l10n.mandiTitle)),
            Icon(
              Icons.chevron_right,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
      data: (value) => KdCard(
        onTap: () => context.go('/insights'),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${value.crop} · ${value.location}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                  const SizedBox(height: 1),
                  Figure(
                    value: '₹${value.pricePerQuintal.round()}',
                    size: 27,
                  ),
                  const SizedBox(height: 7),
                  _PriceChip(value.confidence, source: value.source),
                ],
              ),
            ),
            const SizedBox(width: 12),
            if (value.hasRange)
              SizedBox(
                width: 76,
                child: MiniBars(
                  values: [
                    value.minPrice.toDouble(),
                    value.pricePerQuintal.toDouble(),
                    value.maxPrice.toDouble(),
                  ],
                  height: 34,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PriceChip extends StatelessWidget {
  const _PriceChip(this.confidence, {required this.source});

  final PriceConfidence confidence;
  final String source;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return switch (confidence) {
      PriceConfidence.live => ProvenanceChip.always(
        Provenance.live,
        label: l10n.mandiLive,
      ),
      PriceConfidence.indicative => ProvenanceChip(
        Provenance.indicative,
        label: l10n.mandiIndicative,
      ),
      PriceConfidence.estimated => ProvenanceChip(
        Provenance.estimated,
        label: l10n.mandiEstimate,
      ),
    };
  }
}

// ---------------------------------------------------------------------------
// Schemes
// ---------------------------------------------------------------------------

class _SchemeRail extends ConsumerWidget {
  const _SchemeRail();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final catalogue = ref.watch(schemesProvider);

    return catalogue.when(
      loading: () => const SizedBox(
        height: 104,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (_, _) => const SizedBox.shrink(),
      data: (value) {
        final schemes = value.schemes.take(4).toList(growable: false);
        if (schemes.isEmpty) return const SizedBox.shrink();

        return SizedBox(
          height: 104,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.zero,
            itemCount: schemes.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (context, i) {
              final scheme = schemes[i];
              // The first is styled as the match; the rest are the list. The
              // catalogue has no eligibility engine behind it yet, so this
              // says "look at this one" rather than "you qualify".
              final lead = i == 0;
              return SizedBox(
                width: 186,
                child: KdCard(
                  onTap: () => context.go('/schemes'),
                  background: lead
                      ? (isDark
                            ? AppColors.forestTintDark
                            : AppColors.forestTint)
                      : null,
                  outline: lead
                      ? (isDark
                            ? AppColors.forestLineDark
                            : AppColors.forestLine)
                      : null,
                  padding: const EdgeInsets.all(13),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        scheme.category.toUpperCase(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                          color: lead
                              ? theme.colorScheme.primary
                              : theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Expanded(
                        child: Text(
                          scheme.shortName.isNotEmpty
                              ? scheme.shortName
                              : scheme.name,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleSmall,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
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
