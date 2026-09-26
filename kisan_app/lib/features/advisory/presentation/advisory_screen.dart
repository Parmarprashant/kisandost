import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_models.dart';
import '../data/advisory_models.dart';
import '../data/advisory_repository.dart';

/// What to do for each crop, and when.
/// Rebuilt in the Warm Earth Editorial language matching Advisory.dc.html.
class AdvisoryScreen extends ConsumerStatefulWidget {
  const AdvisoryScreen({super.key});

  @override
  ConsumerState<AdvisoryScreen> createState() => _AdvisoryScreenState();
}

class _AdvisoryScreenState extends ConsumerState<AdvisoryScreen> {
  int _selectedCropIndex = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final timelines = ref.watch(cropTimelinesProvider);
    final loading = ref.watch(advisoriesProvider).isLoading;

    if (loading) {
      return Scaffold(
        body: const Center(
          child: CircularProgressIndicator(color: AppColors.forest),
        ),
      );
    }

    if (timelines.isEmpty) {
      return Scaffold(
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(
                context,
                title: l10n.advisoryTitle,
                subtitle: l10n.advisorySubtitle,
              ),
              Expanded(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: KdCard(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.calendar_today_outlined,
                            size: 36,
                            color: AppColors.muted,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            l10n.advisoryNoCrops,
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyLarge,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final safeIndex = _selectedCropIndex.clamp(0, timelines.length - 1);
    final currentEntry = timelines[safeIndex];
    final crop = currentEntry.crop;
    final timeline = currentEntry.timeline;

    final headerSubtitle =
        '${crop.cropName} · ${l10n.farmDayCount('${timeline.daysAfterSowing}')}';

    final now = DateTime.now();
    final todayHeading =
        '${l10n.advisoryToday}, ${DateFormat('EEEE d').format(now)}';

    final upcomingStages = timeline.stages
        .where((s) => s.startDay > timeline.daysAfterSowing)
        .toList(growable: false);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar
            _buildHeader(
              context,
              title: l10n.advisorySubtitle,
              subtitle: headerSubtitle,
            ),

            // Multi-crop selector chips (if more than one crop exists)
            if (timelines.length > 1)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 2),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      for (var i = 0; i < timelines.length; i++) ...[
                        if (i > 0) const SizedBox(width: 8),
                        _CropChip(
                          label:
                              '${timelines[i].crop.cropName} (${timelines[i].field.name})',
                          isSelected: i == safeIndex,
                          onTap: () => setState(() => _selectedCropIndex = i),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

            // Main Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Week Days Strip (7 days centered around current week)
                    const _WeekStrip(),
                    const SizedBox(height: 8),

                    if (!timeline.hasAnything) ...[
                      const SizedBox(height: 16),
                      KdCard(
                        child: Text(
                          l10n.advisoryNoneForCrop,
                          style: theme.textTheme.bodyLarge,
                        ),
                      ),
                    ] else ...[
                      // Section: TODAY
                      Padding(
                        padding: const EdgeInsets.only(top: 18, bottom: 10),
                        child: Text(
                          todayHeading.toUpperCase(),
                          style: AppTheme.eyebrow(context),
                        ),
                      ),

                      if (timeline.current != null)
                        _ActiveStageCard(
                          advisory: timeline.current!,
                          acres: crop.cultivatedArea,
                          isDark: isDark,
                        )
                      else
                        KdCard(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.check_circle_outline,
                                size: 20,
                                color: AppColors.forest,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  l10n.advisoryNothingDue,
                                  style: theme.textTheme.bodyMedium,
                                ),
                              ),
                            ],
                          ),
                        ),

                      if (timeline.past.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Text(
                            l10n.advisoryDone('${timeline.past.length}'),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.muted,
                            ),
                          ),
                        ),
                      ],

                      // Section: COMING UP
                      Padding(
                        padding: const EdgeInsets.only(top: 20, bottom: 10),
                        child: Text(
                          l10n.advisoryComingUp.toUpperCase(),
                          style: AppTheme.eyebrow(context),
                        ),
                      ),

                      if (upcomingStages.isNotEmpty)
                        KdCard(
                          clip: true,
                          padding: EdgeInsets.zero,
                          child: Column(
                            children: [
                              for (
                                var i = 0;
                                i < upcomingStages.length;
                                i++
                              ) ...[
                                if (i > 0)
                                  Divider(
                                    height: 1,
                                    thickness: 1,
                                    color: isDark
                                        ? AppColors.sunkDark
                                        : AppColors.sunk,
                                  ),
                                _UpcomingStageRow(
                                  stage: upcomingStages[i],
                                  crop: crop,
                                  isLast: i == upcomingStages.length - 1,
                                ),
                              ],
                            ],
                          ),
                        )
                      else
                        KdCard(
                          child: Text(
                            l10n.advisoryNothingDue,
                            style: theme.textTheme.bodyMedium,
                          ),
                        ),
                    ],

                    const SizedBox(height: 16),

                    // SMS Notice Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.forestTintDark
                            : AppColors.forestTint,
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
                            Icons.chat_bubble_outline_rounded,
                            size: 22,
                            color: AppColors.forest,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l10n.advisorySmsNoticeTitle,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.forestDark
                                        : AppColors.forest,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  l10n.advisorySmsNoticeBody,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDark
                                        ? AppColors.ink2Dark
                                        : AppColors.ink2,
                                    height: 1.35,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Footnote explaining the schedule calculation
                    Text(
                      l10n.advisoryGeneralNote,
                      style: const TextStyle(
                        fontSize: 12,
                        height: 1.55,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context, {
    required String title,
    required String subtitle,
  }) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.lineDark : const Color(0xFFEFE6D7),
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
                  title,
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
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CropChip extends StatelessWidget {
  const _CropChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: isSelected
              ? (isDark ? AppColors.forestDark : AppColors.forest)
              : scheme.surface,
          border: Border.all(
            color: isSelected
                ? (isDark ? AppColors.forestDark : AppColors.forest)
                : scheme.outline,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.inkDark : AppColors.ink),
          ),
        ),
      ),
    );
  }
}

class _WeekStrip extends StatelessWidget {
  const _WeekStrip();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final now = DateTime.now();
    // Monday of current week
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final days = List.generate(7, (i) => monday.add(Duration(days: i)));

    return Row(
      children: [
        for (var i = 0; i < days.length; i++) ...[
          if (i > 0) const SizedBox(width: 6),
          Expanded(
            child: _DayPill(
              date: days[i],
              isToday:
                  days[i].year == now.year &&
                  days[i].month == now.month &&
                  days[i].day == now.day,
              isDark: isDark,
            ),
          ),
        ],
      ],
    );
  }
}

class _DayPill extends StatelessWidget {
  const _DayPill({
    required this.date,
    required this.isToday,
    required this.isDark,
  });

  final DateTime date;
  final bool isToday;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final dayName = DateFormat('E').format(date).toUpperCase();
    final dayNum = DateFormat('d').format(date);

    if (isToday) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: isDark ? AppColors.forestDark : AppColors.forest,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              dayName,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: Color(0xFFC8DCC4),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              dayNum,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 3),
            Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.amber,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: scheme.outline),
        color: scheme.surface,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            dayName,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.muted,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            dayNum,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: scheme.onSurface,
            ),
          ),
          const SizedBox(height: 8), // Balances height with today pill
        ],
      ),
    );
  }
}

class _ActiveStageCard extends StatelessWidget {
  const _ActiveStageCard({
    required this.advisory,
    required this.acres,
    required this.isDark,
  });

  final CropAdvisory advisory;
  final double acres;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.terracottaTintDark : AppColors.terracottaTint,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.dangerLineDark : AppColors.dangerLine,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : Colors.white,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: isDark
                        ? AppColors.dangerLineDark
                        : AppColors.dangerLine,
                  ),
                ),
                child: Text(
                  l10n.advisoryNow.toUpperCase(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.dangerDark : AppColors.danger,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  advisory.stageName,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.ink2Dark : AppColors.ink2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${advisory.pesticideName}, ${l10n.advisoryDose('${advisory.dosageFor(acres)}')}',
            style: TextStyle(
              fontFamily: AppTheme.displayFamily,
              fontSize: 19,
              fontWeight: FontWeight.w600,
              height: 1.3,
              color: isDark ? AppColors.inkDark : AppColors.ink,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            advisory.purpose,
            style: TextStyle(
              fontSize: 13,
              height: 1.5,
              color: isDark ? AppColors.ink2Dark : AppColors.ink2,
            ),
          ),
        ],
      ),
    );
  }
}

class _UpcomingStageRow extends StatelessWidget {
  const _UpcomingStageRow({
    required this.stage,
    required this.crop,
    required this.isLast,
  });

  final CropAdvisory stage;
  final Crop crop;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final targetDate = crop.sowingDate.add(Duration(days: stage.startDay));
    final dateStr = DateFormat('d MMM').format(targetDate);
    final l10n = L10n.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 13),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 52,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dateStr,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'DAY ${stage.startDay}',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stage.stageName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${stage.purpose} · ${stage.pesticideName} (${l10n.advisoryDose('${stage.dosageFor(crop.cultivatedArea)}')})',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.muted,
                    height: 1.35,
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
