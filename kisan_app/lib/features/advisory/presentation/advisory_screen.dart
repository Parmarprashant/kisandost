import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_models.dart';
import '../data/advisory_models.dart';
import '../data/advisory_repository.dart';

/// What to do for each crop, and when.
class AdvisoryScreen extends ConsumerWidget {
  const AdvisoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final timelines = ref.watch(cropTimelinesProvider);
    final loading = ref.watch(advisoriesProvider).isLoading;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.advisoryTitle)),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : timelines.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  l10n.advisoryNoCrops,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              itemCount: timelines.length + 1,
              separatorBuilder: (_, _) => const SizedBox(height: 20),
              itemBuilder: (context, i) {
                if (i == timelines.length) {
                  // Said once, at the end: these are general stage guides, not
                  // an inspection of this particular field.
                  return Text(
                    l10n.advisoryGeneralNote,
                    style: Theme.of(context).textTheme.bodySmall,
                  );
                }
                final entry = timelines[i];
                return _CropCard(
                  field: entry.field,
                  crop: entry.crop,
                  timeline: entry.timeline,
                );
              },
            ),
    );
  }
}

class _CropCard extends StatelessWidget {
  const _CropCard({
    required this.field,
    required this.crop,
    required this.timeline,
  });

  final Field field;
  final Crop crop;
  final AdvisoryTimeline timeline;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final current = timeline.current;
    final next = timeline.next;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(crop.cropName, style: text.titleMedium),
            Text(
              '${field.name} · ${l10n.farmDayCount('${timeline.daysAfterSowing}')}',
              style: text.bodySmall,
            ),

            if (!timeline.hasAnything) ...[
              const SizedBox(height: 12),
              // No advisories exist for this crop. Saying so is better than an
              // empty card that looks like a loading failure.
              Text(l10n.advisoryNoneForCrop, style: text.bodyLarge),
            ] else ...[
              const SizedBox(height: 16),

              if (current != null)
                _StageBlock(
                  advisory: current,
                  acres: crop.cultivatedArea,
                  heading: l10n.advisoryNow,
                  accent: AppColors.primary,
                  emphasised: true,
                )
              else ...[
                // Gaps between stages are real in this data. Nothing is due,
                // and inventing something to show would mean telling a farmer
                // to spray when no advisory says to.
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: AppColors.primaryContainer.withValues(alpha: 0.5),
                  ),
                  child: Text(l10n.advisoryNothingDue, style: text.bodyLarge),
                ),
              ],

              if (next != null) ...[
                const SizedBox(height: 14),
                _StageBlock(
                  advisory: next,
                  acres: crop.cultivatedArea,
                  heading: l10n.advisoryNextIn(
                    '${timeline.daysUntilNext ?? 0}',
                  ),
                  accent: AppColors.secondary,
                  emphasised: false,
                ),
              ],

              if (timeline.past.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  l10n.advisoryDone('${timeline.past.length}'),
                  style: text.bodySmall,
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _StageBlock extends StatelessWidget {
  const _StageBlock({
    required this.advisory,
    required this.acres,
    required this.heading,
    required this.accent,
    required this.emphasised,
  });

  final CropAdvisory advisory;
  final double acres;
  final String heading;
  final Color accent;
  final bool emphasised;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: accent.withValues(alpha: emphasised ? 0.12 : 0.07),
        border: Border.all(color: accent.withValues(alpha: 0.30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(heading, style: text.labelSmall?.copyWith(color: accent)),
          const SizedBox(height: 4),
          Text(advisory.stageName, style: text.titleMedium),
          const SizedBox(height: 8),
          Text(advisory.purpose, style: text.bodyLarge),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.science_outlined,
                size: 18,
                color: AppColors.muted,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(advisory.pesticideName, style: text.bodyLarge),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                Icons.straighten_outlined,
                size: 18,
                color: AppColors.muted,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.advisoryDose('${advisory.dosageFor(acres)}'),
                  style: text.bodyLarge,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
