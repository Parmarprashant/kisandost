import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/crop_detail_models.dart';
import '../data/farm_repository.dart';
import 'zone_inspection_sheet.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';

class CropDetailScreen extends ConsumerStatefulWidget {
  const CropDetailScreen({required this.cropId, super.key});

  final String cropId;

  @override
  ConsumerState<CropDetailScreen> createState() => _CropDetailScreenState();
}

class _CropDetailScreenState extends ConsumerState<CropDetailScreen> {
  bool _isUpdatingCycle = false;

  Future<void> _handleUpdateCycle() async {
    setState(() => _isUpdatingCycle = true);
    try {
      final repo = ref.read(farmRepositoryProvider);
      await repo.updateCropCycle(widget.cropId);
      ref.invalidate(cropDetailProvider(widget.cropId));
      ref.invalidate(cropRiskProvider(widget.cropId));
      ref.invalidate(cropCycleProvider(widget.cropId));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Crop cycle and thermal GDD updated successfully.'),
            backgroundColor: AppColors.forest,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not update cycle: $e'),
            backgroundColor: Colors.red.shade700,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdatingCycle = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cropAsync = ref.watch(cropDetailProvider(widget.cropId));
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
              child: Row(
                children: [
                  _HeaderButton(
                    icon: Icons.arrow_back,
                    tooltip:
                        MaterialLocalizations.of(context).backButtonTooltip,
                    onTap: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/farm');
                      }
                    },
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        cropAsync.maybeWhen(
                          data: (crop) => Text(
                            crop.cropName,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          orElse: () => Text(
                            'Crop Profile',
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        cropAsync.maybeWhen(
                          data: (crop) => Text(
                            crop.field?.name ?? 'Assigned Field',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          orElse: () => Text(
                            'Field Telemetry',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  _HeaderButton(
                    icon: Icons.refresh,
                    tooltip: 'Refresh Telemetry',
                    onTap: () {
                      ref.invalidate(cropDetailProvider(widget.cropId));
                      ref.invalidate(cropRiskProvider(widget.cropId));
                      ref.invalidate(cropScansProvider(widget.cropId));
                      ref.invalidate(cropCycleProvider(widget.cropId));
                    },
                  ),
                ],
              ),
            ),
            Expanded(
              child: cropAsync.when(
                loading: () => const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Loading crop telemetry & AgriShield...'),
                    ],
                  ),
                ),
                error: (error, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 48,
                          color: theme.colorScheme.error,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Failed to load crop details',
                          style: theme.textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$error',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodySmall,
                        ),
                        const SizedBox(height: 16),
                        FilledButton.tonal(
                          onPressed: () =>
                              ref.invalidate(cropDetailProvider(widget.cropId)),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (crop) => RefreshIndicator(
                  onRefresh: () async {
                    ref.invalidate(cropDetailProvider(widget.cropId));
                    ref.invalidate(cropRiskProvider(widget.cropId));
                    ref.invalidate(cropScansProvider(widget.cropId));
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      _HeaderCard(crop: crop),
                      const SizedBox(height: 16),
                      _SpatialLineageCard(crop: crop),
                      const SizedBox(height: 16),
                      _AgriShieldRiskCard(cropId: widget.cropId),
                      const SizedBox(height: 16),
                      _CropCycleCard(
                        crop: crop,
                        isUpdating: _isUpdatingCycle,
                        onUpdate: _handleUpdateCycle,
                      ),
                      const SizedBox(height: 16),
                      _CropScansCard(cropId: widget.cropId),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ----------------------------------------------------------------- Header Card

// ----------------------------------------------------------------- Header Card

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.crop});

  final CropDetail crop;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return KdCard(
      background: isDark ? AppColors.surfaceDark : AppColors.forestTint,
      outline: isDark ? AppColors.forestDark : AppColors.forestLine,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.forest.withValues(alpha: 0.25)
                      : AppColors.forestTint,
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  border: Border.all(color: AppColors.forestLine),
                ),
                child: const Icon(
                  Icons.eco,
                  size: 26,
                  color: AppColors.forest,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      crop.cropName,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Variety: ${crop.variety ?? "Standard"} · ${crop.areaLabel}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: crop.isActive
                      ? AppColors.forest
                      : theme.colorScheme.outline,
                  borderRadius: BorderRadius.circular(AppTheme.radiusChip),
                ),
                child: Text(
                  crop.status,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            children: [
              Expanded(
                child: _HeaderStat(
                  label: 'Sowing Date',
                  value:
                      '${crop.sowingDate.day}/${crop.sowingDate.month}/${crop.sowingDate.year}',
                  icon: Icons.calendar_today_outlined,
                ),
              ),
              const SizedBox(width: 16),
              Figure(
                value: '${crop.currentDas}',
                unit: 'days',
                caption: 'Elapsed DAS',
                color: AppColors.forest,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderStat extends StatelessWidget {
  const _HeaderStat({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.forest),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// --------------------------------------------------------- Spatial Lineage Card

class _SpatialLineageCard extends StatelessWidget {
  const _SpatialLineageCard({required this.crop});

  final CropDetail crop;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final field = crop.field;
    final zone = crop.zone;

    final locationStr = field?.location.label ?? 'Location unavailable';
    final coordsStr = field != null && field.location.hasCoordinates
        ? '${field.location.latitude!.toStringAsFixed(4)}°N, ${field.location.longitude!.toStringAsFixed(4)}°E'
        : 'GPS not recorded';

    return KdCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.explore_outlined,
                color: AppColors.forest,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Spatial & Location Hierarchy',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _LineageRow(
            icon: Icons.terrain_outlined,
            label: 'Field Name',
            value: field?.name ?? 'Assigned Field',
          ),
          const Divider(height: 16),
          _LineageRow(
            icon: Icons.place_outlined,
            label: 'Location',
            value: locationStr,
          ),
          const Divider(height: 16),
          _LineageRow(
            icon: Icons.gps_fixed,
            label: 'Coordinates',
            value: coordsStr,
            monospace: true,
          ),
          const Divider(height: 16),
          _LineageRow(
            icon: Icons.crop_square_outlined,
            label: 'Monitoring Zone',
            value: zone != null ? zone.displayName : 'Not assigned',
            badge: zone != null,
          ),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.tonalIcon(
              onPressed: () => ZoneInspectionSheet.show(
                context,
                crop: crop,
                initialZone: zone,
              ),
              icon: const Icon(Icons.camera_alt_outlined, size: 18),
              label: Text(
                zone != null
                    ? 'Inspect Zone (${zone.zoneCode})'
                    : 'Multi-Angle Zone Inspection',
              ),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.forestTint,
                foregroundColor: AppColors.forest,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LineageRow extends StatelessWidget {
  const _LineageRow({
    required this.icon,
    required this.label,
    required this.value,
    this.monospace = false,
    this.badge = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool monospace;
  final bool badge;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.onSurfaceVariant),
        const SizedBox(width: 8),
        Text(
          '$label:',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const Spacer(),
        if (badge)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.forestTint,
              borderRadius: BorderRadius.circular(AppTheme.radiusChip),
              border: Border.all(color: AppColors.forestLine),
            ),
            child: Text(
              value,
              style: const TextStyle(
                color: AppColors.forest,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          )
        else
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                fontFamily: monospace ? 'monospace' : null,
              ),
            ),
          ),
      ],
    );
  }
}

// ---------------------------------------------------- AgriShield 360° Risk Card

class _AgriShieldRiskCard extends ConsumerWidget {
  const _AgriShieldRiskCard({required this.cropId});

  final String cropId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final riskAsync = ref.watch(cropRiskProvider(cropId));
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return KdCard(
      background: isDark ? AppColors.surfaceDark : AppColors.amberTint,
      outline: AppColors.amberLine,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.shield_outlined,
                color: AppColors.terracottaText,
                size: 22,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'AgriShield 360° Risk Evaluation',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh, size: 18),
                tooltip: 'Re-evaluate Risk',
                onPressed: () => ref.refresh(cropRiskProvider(cropId)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          riskAsync.when(
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 20.0),
              child: Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(strokeWidth: 2),
                    SizedBox(height: 8),
                    Text(
                      'Evaluating 26 agronomic rules...',
                      style: TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            error: (err, _) => Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                'Risk evaluation currently unavailable: $err',
                style: const TextStyle(fontSize: 12, color: AppColors.danger),
              ),
            ),
            data: (risk) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _RiskStatusBadge(status: risk.overallStatus),
                    const SizedBox(width: 8),
                    _RiskLevelPill(level: risk.overallLevel),
                  ],
                ),
                if (risk.evaluatedThreats.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Text(
                    'Evaluated Threat Windows:',
                    style: theme.textTheme.labelMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...risk.evaluatedThreats.map(
                    (threat) => _ThreatTile(threat: threat),
                  ),
                ] else ...[
                  const SizedBox(height: 12),
                  const Row(
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        color: AppColors.forest,
                        size: 18,
                      ),
                      SizedBox(width: 6),
                      Text(
                        'No critical agronomic threats detected.',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.forest,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RiskStatusBadge extends StatelessWidget {
  const _RiskStatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'NO_CONCERN':
        bg = AppColors.forestTint;
        fg = AppColors.forest;
        label = 'No Concern';
      case 'POTENTIAL_CONCERN':
      case 'ATTENTION':
        bg = AppColors.amberTint;
        fg = AppColors.terracottaText;
        label = 'Attention Required';
      case 'HIGH_RISK':
        bg = AppColors.dangerTint;
        fg = AppColors.danger;
        label = 'High Risk';
      default:
        bg = Colors.grey.shade200;
        fg = Colors.grey.shade800;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
      ),
      child: Text(
        label,
        style: TextStyle(color: fg, fontWeight: FontWeight.bold, fontSize: 12),
      ),
    );
  }
}

class _RiskLevelPill extends StatelessWidget {
  const _RiskLevelPill({required this.level});

  final String level;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).colorScheme.outline),
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
      ),
      child: Text(
        'Level: $level',
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class _ThreatTile extends StatelessWidget {
  const _ThreatTile({required this.threat});

  final RiskEvaluationItem threat;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isWarning = threat.isElevated;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: KdCard(
        outline: isWarning
            ? AppColors.terracotta
            : theme.colorScheme.outline,
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isWarning ? Icons.warning_amber_rounded : Icons.info_outline,
                  size: 16,
                  color: isWarning
                      ? AppColors.terracottaText
                      : theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    threat.threatName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(AppTheme.radiusChip),
                  ),
                  child: Text(
                    threat.threatCategory,
                    style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              threat.explanation,
              style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

// ------------------------------------------------------ Crop Lifecycle & GDD Card

class _CropCycleCard extends StatelessWidget {
  const _CropCycleCard({
    required this.crop,
    required this.isUpdating,
    required this.onUpdate,
  });

  final CropDetail crop;
  final bool isUpdating;
  final VoidCallback onUpdate;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final gdd = crop.cumulativeGdd;
    final maturity = crop.maturityGdd;
    final ratio = gdd != null && maturity != null && maturity > 0
        ? (gdd / maturity).clamp(0.0, 1.0)
        : null;

    const stageCount = 5;
    final currentStageIdx = ratio != null
        ? ((ratio * stageCount).floor()).clamp(0, stageCount - 1)
        : 1;

    return KdCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.thermostat_outlined,
                color: AppColors.forest,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Crop Lifecycle & Thermal Progress',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusChip),
                ),
                child: Text(
                  crop.progressionMode,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          StageBar(
            stageCount: stageCount,
            currentStage: currentStageIdx,
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Current Stage:', style: theme.textTheme.bodySmall),
              Text(
                crop.currentStageId ?? 'Vegetative / Active Growth',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.forest,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Accumulated GDD:', style: theme.textTheme.bodySmall),
                  const SizedBox(height: 2),
                  if (gdd != null)
                    Figure(
                      value: gdd.toStringAsFixed(1),
                      unit: '°C-days',
                      size: 22,
                    )
                  else
                    const Text(
                      '— (Pending weather backfill)',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                ],
              ),
              if (maturity != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Target GDD:', style: theme.textTheme.bodySmall),
                    const SizedBox(height: 2),
                    Figure(
                      value: maturity.toStringAsFixed(0),
                      unit: '°C-days',
                      size: 22,
                    ),
                  ],
                ),
            ],
          ),
          if (ratio != null) ...[
            const SizedBox(height: 10),
            Text(
              'Thermal Maturity: ${(ratio * 100).toStringAsFixed(0)}% of target ${maturity!.toStringAsFixed(0)} °C-days',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                ),
              ),
              onPressed: isUpdating ? null : onUpdate,
              icon: isUpdating
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.sync, size: 16),
              label: Text(
                isUpdating
                    ? 'Updating thermal cycle...'
                    : 'Update Stage Progression',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ------------------------------------------------------ Crop Disease Scans Card

class _CropScansCard extends ConsumerWidget {
  const _CropScansCard({required this.cropId});

  final String cropId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scansAsync = ref.watch(cropScansProvider(cropId));
    final theme = Theme.of(context);

    return KdCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.camera_alt_outlined,
                color: AppColors.forest,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Crop Disease Scans',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: () => context.push('/diagnose'),
                icon: const Icon(Icons.add_a_photo, size: 16),
                label: const Text('Scan Now'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          scansAsync.when(
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
            error: (err, _) => Text(
              'Could not load scans: $err',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            data: (scans) {
              if (scans.isEmpty) {
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.photo_library_outlined,
                        size: 36,
                        color: theme.colorScheme.outline,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'No disease scans recorded for this crop yet.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: scans.length,
                separatorBuilder: (_, _) => const Divider(height: 16),
                itemBuilder: (context, index) {
                  final scan = scans[index];
                  return _ScanItemTile(scan: scan);
                },
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ScanItemTile extends StatelessWidget {
  const _ScanItemTile({required this.scan});

  final CropScanItem scan;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateStr = scan.capturedAt != null
        ? '${scan.capturedAt!.day}/${scan.capturedAt!.month}/${scan.capturedAt!.year}'
        : 'Recent';

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (scan.imageUrl != null && scan.imageUrl!.isNotEmpty)
          ClipRRect(
            borderRadius: BorderRadius.circular(AppTheme.radiusChip),
            child: CachedNetworkImage(
              imageUrl: scan.imageUrl!,
              width: 54,
              height: 54,
              fit: BoxFit.cover,
              errorWidget: (_, _, _) => Container(
                width: 54,
                height: 54,
                color: theme.colorScheme.surfaceContainerHighest,
                child: Icon(
                  Icons.broken_image,
                  size: 20,
                  color: theme.colorScheme.outline,
                ),
              ),
            ),
          )
        else
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: AppColors.forestTint,
              borderRadius: BorderRadius.circular(AppTheme.radiusChip),
              border: Border.all(color: AppColors.forestLine),
            ),
            child: const Icon(Icons.document_scanner, color: AppColors.forest),
          ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                scan.diagnosis,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 1,
                    ),
                    decoration: BoxDecoration(
                      color: _severityColor(scan.severity)
                          .withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      scan.severity,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _severityColor(scan.severity),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Confidence: ${(scan.confidence * 100).toStringAsFixed(0)}%',
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              if (scan.zoneLabel != null) ...[
                const SizedBox(height: 2),
                Text(
                  'Zone: ${scan.zoneLabel}',
                  style: TextStyle(
                    fontSize: 11,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
        ),
        Text(
          dateStr,
          style: theme.textTheme.bodySmall?.copyWith(
            fontSize: 11,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Color _severityColor(String severity) {
    switch (severity.toUpperCase()) {
      case 'SEVERE':
      case 'HIGH':
        return AppColors.danger;
      case 'MODERATE':
        return AppColors.terracottaText;
      case 'MILD':
      case 'LOW':
        return AppColors.forest;
      default:
        return AppColors.muted;
    }
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
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            border: Border.all(color: theme.colorScheme.outline),
          ),
          child: Icon(icon, size: 22, color: theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}
