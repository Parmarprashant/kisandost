import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../app/shell/app_drawer.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../advisory/data/advisory_repository.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/farm_models.dart';
import '../../../core/offline/offline_banner.dart';
import '../data/farm_repository.dart';
import 'add_crop_sheet.dart';
import 'field_wizard.dart';

class FarmScreen extends ConsumerWidget {
  const FarmScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final fields = ref.watch(fieldsProvider);

    // The add button lives in the header rather than in a floating one: the
    // bar already raises the scan button over the middle, and a second
    // floating control beside it turns the most important action on the
    // screen into one of two competing circles.
    return Scaffold(
      drawer: const AppDrawer(),
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: () async => ref.refresh(fieldsProvider.future),
          child: fields.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, _) => _Error(error: error),
            data: (list) {
              if (list.isEmpty) return const _Empty();

              // Non-null only when the network failed and this came off disk.
              // A crop list from last week shown as today's would put someone
              // at the wrong stage of their own calendar.
              final cachedAt = ref.watch(fieldsCachedAtProvider);

              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
                children: [
                  _FarmHeader(fields: list),
                  const SizedBox(height: 14),
                  if (cachedAt != null) ...[
                    CachedNotice(savedAt: cachedAt),
                    const SizedBox(height: 12),
                  ],
                  for (final field in list) ...[
                    _FieldCard(field: field),
                    const SizedBox(height: 12),
                  ],
                  SectionHeader(l10n.farmNextUp),
                  const _NextUp(),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    // A scrollable so pull-to-refresh still works on an empty list.
    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 60),
        const Icon(Icons.grass_outlined, size: 64, color: AppColors.muted),
        const SizedBox(height: 20),
        Text(
          l10n.farmNoFields,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          l10n.farmNoFieldsHint,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 28),
        FilledButton.icon(
          onPressed: () => FieldWizard.open(context),
          icon: const Icon(Icons.add),
          label: Text(l10n.farmAddField),
        ),
      ],
    );
  }
}

class _FieldCard extends ConsumerWidget {
  const _FieldCard({required this.field});

  final Field field;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    final theme = Theme.of(context);

    return KdCard(
      clip: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 6, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  ),
                  child: Icon(
                    Icons.home_work_outlined,
                    size: 23,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(field.name, style: text.titleMedium),
                      const SizedBox(height: 1),
                      Text(
                        [
                          field.areaLabel,
                          if (field.location.label.isNotEmpty)
                            field.location.label,
                        ].join(' · '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: text.bodySmall,
                      ),
                      const SizedBox(height: 9),
                      // Soil and water are what every dose on every other
                      // screen is computed from, so they are stated here
                      // rather than buried in an edit form. A missing soil
                      // type says so, because a blank reads as "fine" when
                      // it actually means "nobody asked".
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _FieldChip(
                            label: field.soil.type ?? l10n.farmSoilUnknown,
                            known: field.soil.type != null,
                          ),
                          if (field.irrigation.method != null)
                            _FieldChip(
                              label: field.irrigation.method!,
                              known: true,
                              water: true,
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.polyline_outlined),
                      color: theme.colorScheme.primary,
                      tooltip: l10n.farmBoundary,
                      onPressed: () =>
                          context.push('/fields/${field.id}/boundary'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline),
                      color: theme.colorScheme.onSurfaceVariant,
                      tooltip: l10n.farmDelete,
                      onPressed: () => _confirmDelete(context, ref),
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (field.crops.isEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
              child: Text(l10n.farmNoCrops, style: text.bodySmall),
            )
          else
            for (final crop in field.crops) _CropRow(crop: crop),

          InkWell(
            onTap: () => AddCropSheet.open(context, field),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: theme.colorScheme.outline),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add, size: 19, color: theme.colorScheme.primary),
                  const SizedBox(width: 7),
                  Text(
                    l10n.farmAddCrop,
                    style: text.labelMedium?.copyWith(
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final l10n = L10n.of(context);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.farmDeleteField),
        // Says what else disappears. Deleting a field silently taking its
        // crops with it is the kind of surprise that loses trust.
        content: Text(l10n.farmDeleteFieldNote),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(l10n.farmCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(l10n.farmDelete),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(farmRepositoryProvider).deleteField(field.id);
    ref.invalidate(fieldsProvider);
  }
}

class _CropRow extends ConsumerWidget {
  const _CropRow({required this.crop});

  final Crop crop;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final text = theme.textTheme;
    final isDark = theme.brightness == Brightness.dark;
    final sown = DateFormat.yMMMd(Localizations.localeOf(context).toString())
        .format(crop.sowingDate);

    // The stage bar needs the advisory calendar, which is keyed by crop name
    // and days after sowing. Looked up here rather than passed down, so a row
    // rendered from any list still shows the right stage.
    final timelines = ref.watch(cropTimelinesProvider);
    final match = timelines.where((e) => e.crop.id == crop.id).toList();
    final timeline = match.isEmpty ? null : match.first.timeline;
    final stages = timeline?.stages.length ?? 0;
    final done = timeline?.past.length ?? 0;
    final current = timeline?.current;

    return InkWell(
      onTap: () => context.push('/crops/${crop.id}'),
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: theme.colorScheme.outline)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          crop.variety == null
                              ? crop.cropName
                              : '${crop.cropName} · ${crop.variety}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: text.titleSmall,
                        ),
                      ),
                      if (current != null) ...[
                        const SizedBox(width: 7),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.dangerTintDark
                                : AppColors.dangerTint,
                            borderRadius: BorderRadius.circular(
                              AppTheme.radiusChip,
                            ),
                            border: Border.all(
                              color: isDark
                                  ? AppColors.dangerLineDark
                                  : AppColors.dangerLine,
                            ),
                          ),
                          child: Text(
                            l10n.advisoryNow,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? AppColors.dangerDark
                                  : AppColors.danger,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$sown · ${crop.areaLabel} · ${l10n.farmDayCount('${crop.daysAfterSowing}')}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: text.bodySmall,
                  ),
                  if (stages > 0) ...[
                    const SizedBox(height: 9),
                    StageBar(
                      stageCount: stages,
                      currentStage: current == null ? done - 1 : done,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      current?.stageName ?? l10n.advisoryNothingDue,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: text.labelSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: current == null
                            ? theme.colorScheme.onSurfaceVariant
                            : (isDark
                                  ? AppColors.terracottaDark
                                  : AppColors.terracottaText),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(
              Icons.chevron_right,
              size: 20,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}

/// The header of the Farm tab.
class _FarmHeader extends StatelessWidget {
  const _FarmHeader({required this.fields});

  final List<Field> fields;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final crops = fields.fold<int>(0, (sum, f) => sum + f.crops.length);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _HeaderButton(
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
                Text(l10n.navFarm, style: theme.textTheme.headlineSmall),
                const SizedBox(height: 2),
                Text(
                  l10n.farmSummary('${fields.length}', '$crops'),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        OutlinedButton.icon(
          onPressed: () => FieldWizard.open(context),
          icon: const Icon(Icons.add, size: 18),
          label: Text(l10n.farmAddField),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 44),
            padding: const EdgeInsets.symmetric(horizontal: 13),
            textStyle: theme.textTheme.labelMedium,
          ),
        ),
      ],
    );
  }
}

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({required this.icon, required this.onTap, this.tooltip});

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

/// One fact about a field, stated rather than hidden in an edit form.
class _FieldChip extends StatelessWidget {
  const _FieldChip({
    required this.label,
    required this.known,
    this.water = false,
  });

  final String label;

  /// False renders the "nobody answered this" treatment rather than a value.
  final bool known;
  final bool water;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final background = !known
        ? (isDark ? AppColors.amberTintDark : AppColors.amberTint)
        : water
        ? (isDark ? AppColors.skyTintDark : AppColors.skyTint)
        : (isDark ? AppColors.sunkDark : AppColors.sunk);
    final foreground = !known
        ? (isDark ? AppColors.amberDark : AppColors.amberText)
        : water
        ? (isDark ? AppColors.skyDark : AppColors.sky)
        : (isDark ? AppColors.ink2Dark : AppColors.ink2);
    final outline = !known
        ? (isDark ? AppColors.amberLineDark : AppColors.amberLine)
        : water
        ? (isDark ? AppColors.skyLineDark : AppColors.skyLine)
        : theme.colorScheme.outline;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
        border: Border.all(color: outline),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: foreground,
        ),
      ),
    );
  }
}

/// What would make the rest of the app more accurate, in the order it helps.
///
/// Every row here is a gap the farmer can close in one tap, and each says
/// what closing it buys them — an instruction with no reason behind it is
/// the kind a farmer correctly ignores.
class _NextUp extends ConsumerWidget {
  const _NextUp();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final fields = ref.watch(fieldsProvider).value ?? const <Field>[];

    final items = <Widget>[];

    for (final field in fields) {
      if (field.soil.type == null) {
        items.add(
          _NextUpRow(
            icon: Icons.terrain_outlined,
            title: '${field.name}: ${l10n.farmSoilUnknown}',
            body: l10n.farmSoilMissingWhy,
            onTap: () => FieldWizard.open(context),
          ),
        );
      }
      if (field.crops.isEmpty) {
        items.add(
          _NextUpRow(
            icon: Icons.eco_outlined,
            title: '${field.name}: ${l10n.farmNoCrops}',
            body: l10n.suggestAddFieldWhy,
            onTap: () => AddCropSheet.open(context, field),
          ),
        );
      }
      if (items.length >= 3) break;
    }

    if (items.isEmpty) {
      return KdCard(
        child: Row(
          children: [
            Icon(Icons.check_circle_outline, color: theme.colorScheme.primary),
            const SizedBox(width: 13),
            Expanded(
              child: Text(
                l10n.farmNothingNext,
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        for (var i = 0; i < items.length; i++) ...[
          items[i],
          if (i != items.length - 1) const SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _NextUpRow extends StatelessWidget {
  const _NextUpRow({
    required this.icon,
    required this.title,
    required this.body,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return KdCard(
      onTap: onTap,
      background: isDark ? AppColors.amberTintDark : AppColors.amberTint,
      outline: isDark ? AppColors.amberLineDark : AppColors.amberLine,
      child: Row(
        children: [
          Icon(
            icon,
            size: 22,
            color: isDark ? AppColors.amberDark : AppColors.amberText,
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(body, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            size: 20,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ],
      ),
    );
  }
}

class _Error extends ConsumerWidget {
  const _Error({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 60),
        const Icon(Icons.cloud_off, size: 48, color: AppColors.muted),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center),
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: () => ref.invalidate(fieldsProvider),
          icon: const Icon(Icons.refresh),
          label: Text(l10n.appRetry),
        ),
      ],
    );
  }
}
