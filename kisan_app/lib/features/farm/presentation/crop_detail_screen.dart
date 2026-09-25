import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/crop_detail_models.dart';
import '../data/farm_repository.dart';
import 'zone_inspection_sheet.dart';

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
            backgroundColor: Color(0xFF2E7D32),
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
      appBar: AppBar(
        title: cropAsync.maybeWhen(
          data: (crop) => Text(crop.cropName),
          orElse: () => const Text('Crop Profile'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Telemetry',
            onPressed: () {
              ref.invalidate(cropDetailProvider(widget.cropId));
              ref.invalidate(cropRiskProvider(widget.cropId));
              ref.invalidate(cropScansProvider(widget.cropId));
            },
          ),
        ],
      ),
      body: cropAsync.when(
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
    );
  }
}

// ----------------------------------------------------------------- Header Card

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.crop});

  final CropDetail crop;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Card(
      elevation: 0,
      color: isDark ? const Color(0xFF1E2A20) : const Color(0xFFE8F5E9),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: const Color(0xFF2E7D32).withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2E7D32).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.eco,
                    size: 32,
                    color: Color(0xFF2E7D32),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        crop.cropName,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Variety: ${crop.variety ?? "Standard"} • ${crop.areaLabel}',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.textTheme.bodyMedium?.color?.withValues(
                            alpha: 0.8,
                          ),
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
                        ? const Color(0xFF2E7D32)
                        : Colors.grey.shade600,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    crop.status,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 28),
            Row(
              children: [
                _HeaderStat(
                  label: 'Sowing Date',
                  value:
                      '${crop.sowingDate.day}/${crop.sowingDate.month}/${crop.sowingDate.year}',
                  icon: Icons.calendar_today_outlined,
                ),
                const SizedBox(width: 16),
                _HeaderStat(
                  label: 'Elapsed DAS',
                  value: '${crop.currentDas} Days',
                  icon: Icons.timelapse_outlined,
                  highlight: true,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeaderStat extends StatelessWidget {
  const _HeaderStat({
    required this.label,
    required this.value,
    required this.icon,
    this.highlight = false,
  });

  final String label;
  final String value;
  final IconData icon;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF2E7D32)),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.textTheme.bodySmall?.color?.withValues(
                    alpha: 0.7,
                  ),
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: highlight ? const Color(0xFF2E7D32) : null,
                ),
              ),
            ],
          ),
        ],
      ),
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

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.explore_outlined,
                  color: Color(0xFF2E7D32),
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
                  backgroundColor: const Color(0xFF2E7D32)
                      .withValues(alpha: 0.12),
                  foregroundColor: const Color(0xFF2E7D32),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
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
        Icon(icon, size: 16, color: Colors.grey.shade600),
        const SizedBox(width: 8),
        Text(
          '$label:',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.textTheme.bodySmall?.color?.withValues(alpha: 0.7),
          ),
        ),
        const Spacer(),
        if (badge)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF2E7D32).withValues(alpha: 0.3),
              ),
            ),
            child: Text(
              value,
              style: const TextStyle(
                color: Color(0xFF2E7D32),
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

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: const Color(0xFFE65100).withValues(alpha: 0.3)),
      ),
      color: theme.brightness == Brightness.dark
          ? const Color(0xFF2D2319)
          : const Color(0xFFFFF8E1),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.shield_outlined,
                  color: Color(0xFFE65100),
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
                  style: const TextStyle(fontSize: 12, color: Colors.orange),
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
                          color: Color(0xFF2E7D32),
                          size: 18,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'No critical agronomic threats detected.',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF2E7D32),
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
        bg = const Color(0xFFE8F5E9);
        fg = const Color(0xFF2E7D32);
        label = 'No Concern';
      case 'POTENTIAL_CONCERN':
      case 'ATTENTION':
        bg = const Color(0xFFFFF3E0);
        fg = const Color(0xFFE65100);
        label = 'Attention Required';
      case 'HIGH_RISK':
        bg = const Color(0xFFFFEBEE);
        fg = const Color(0xFFC62828);
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
        borderRadius: BorderRadius.circular(8),
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
        border: Border.all(color: Colors.grey.shade400),
        borderRadius: BorderRadius.circular(8),
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

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isWarning
              ? const Color(0xFFE65100).withValues(alpha: 0.4)
              : theme.dividerColor.withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isWarning ? Icons.warning_amber_rounded : Icons.info_outline,
                size: 16,
                color: isWarning
                    ? const Color(0xFFE65100)
                    : Colors.grey.shade600,
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
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  threat.threatCategory,
                  style: TextStyle(fontSize: 10, color: Colors.grey.shade700),
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

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.thermostat_outlined,
                  color: Color(0xFF2E7D32),
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
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    crop.progressionMode,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                    ),
                  ),
                ),
              ],
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
                    color: Color(0xFF2E7D32),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Accumulated GDD:', style: theme.textTheme.bodySmall),
                Text(
                  gdd != null
                      ? '${gdd.toStringAsFixed(1)} °C-days'
                      : '— (Pending weather backfill)',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            if (ratio != null) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: ratio,
                  minHeight: 8,
                  backgroundColor: Colors.grey.shade200,
                  color: const Color(0xFF2E7D32),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Thermal Maturity: ${(ratio * 100).toStringAsFixed(0)}% of target ${maturity!.toStringAsFixed(0)} °C-days',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
            ],
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
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

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.4)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.camera_alt_outlined,
                  color: Color(0xFF2E7D32),
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
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              data: (scans) {
                if (scans.isEmpty) {
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.photo_library_outlined,
                          size: 36,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'No disease scans recorded for this crop yet.',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade700,
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
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: scan.imageUrl!,
              width: 54,
              height: 54,
              fit: BoxFit.cover,
              errorWidget: (_, _, _) => Container(
                width: 54,
                height: 54,
                color: Colors.grey.shade200,
                child: const Icon(
                  Icons.broken_image,
                  size: 20,
                  color: Colors.grey,
                ),
              ),
            ),
          )
        else
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.document_scanner, color: Color(0xFF2E7D32)),
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
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                  ),
                ],
              ),
              if (scan.zoneLabel != null) ...[
                const SizedBox(height: 2),
                Text(
                  'Zone: ${scan.zoneLabel}',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
              ],
            ],
          ),
        ),
        Text(
          dateStr,
          style: theme.textTheme.bodySmall?.copyWith(
            fontSize: 11,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Color _severityColor(String severity) {
    switch (severity.toUpperCase()) {
      case 'SEVERE':
      case 'HIGH':
        return Colors.red.shade700;
      case 'MODERATE':
        return Colors.orange.shade800;
      case 'MILD':
      case 'LOW':
        return Colors.green.shade700;
      default:
        return Colors.blueGrey;
    }
  }
}
