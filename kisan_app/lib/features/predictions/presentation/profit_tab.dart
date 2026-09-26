import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/auth_controller.dart';
import '../../farm/data/farm_repository.dart';
import '../data/prediction_models.dart';
import '../data/prediction_repository.dart';
import 'yield_tab.dart';

class ProfitTab extends ConsumerStatefulWidget {
  const ProfitTab({super.key});

  @override
  ConsumerState<ProfitTab> createState() => _ProfitTabState();
}

class _ProfitTabState extends ConsumerState<ProfitTab> {
  String _crop = 'Cotton';
  final _area = TextEditingController(text: '1');
  final _fertilizer = TextEditingController(text: '4000');
  final _pesticide = TextEditingController(text: '1500');
  final _irrigation = TextEditingController(text: '800');
  final _rainfall = TextEditingController(
    text: defaultRainfall.round().toString(),
  );
  double _ndvi = defaultNdvi;
  double _soilMoisture = defaultSoilMoisture;

  bool _running = false;
  String? _error;
  // Mirrors the kept provider, so the answer survives leaving the tab.
  ProfitPrediction? get _result => ref.watch(keptProfitProvider);

  @override
  void initState() {
    super.initState();
    final crops = ref.read(activeCropsProvider);
    if (crops.isNotEmpty) {
      _crop = crops.first.crop.cropName;
      _area.text = crops.first.crop.cultivatedArea.toString();
    }
  }

  @override
  void dispose() {
    for (final c in [_area, _fertilizer, _pesticide, _irrigation, _rainfall]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _running = true;
      _error = null;
    });

    // The farmer's own district gives a local mandi price rather than a
    // state-wide one, so it is sent when we have it.
    final user = ref.read(currentUserProvider);
    final crops = ref.read(activeCropsProvider);
    final location = crops.isNotEmpty ? crops.first.field.location : null;

    try {
      final result = await ref
          .read(predictionRepositoryProvider)
          .predictProfit(
            crop: _crop,
            landArea: double.tryParse(_area.text.trim()) ?? 1,
            fertilizerCost: double.tryParse(_fertilizer.text.trim()) ?? 0,
            pesticideCost: double.tryParse(_pesticide.text.trim()) ?? 0,
            irrigationCost: double.tryParse(_irrigation.text.trim()) ?? 0,
            rainfall: double.tryParse(_rainfall.text.trim()) ?? defaultRainfall,
            nitrogen: defaultNitrogen,
            phosphorus: defaultPhosphorus,
            potassium: defaultPotassium,
            ndvi: _ndvi,
            soilMoisture: _soilMoisture,
            state: location?.state,
            district: location?.district ?? user?.district,
          );
      ref.read(keptProfitProvider.notifier).set(result);
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      setState(() {
        _error = switch (error.kind) {
          ApiErrorKind.offline => l10n.appOffline,
          ApiErrorKind.timeout => l10n.appSlow,
          _ => l10n.appError,
        };
      });
    } finally {
      if (mounted) setState(() => _running = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final result = _result;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        PredictionFields.crop(
          value: _crop,
          onChanged: (v) => setState(() => _crop = v),
          label: l10n.predCrop,
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _area,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.predArea),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _fertilizer,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(labelText: l10n.predFertCost),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _pesticide,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(labelText: l10n.predPestCost),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _irrigation,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(labelText: l10n.predIrrigCost),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _rainfall,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(labelText: l10n.predRainfall),
        ),
        const SizedBox(height: 20),

        // The model will not answer without these two. They were previously
        // never sent, so every "prediction" on this tab came from the route's
        // hardcoded fallback table instead.
        PredictionFields.slider(
          label: l10n.predNdvi,
          help: l10n.predNdviHelp,
          value: _ndvi,
          min: 0.1,
          max: 0.95,
          display: _ndvi.toStringAsFixed(2),
          onChanged: (v) => setState(() => _ndvi = v),
        ),
        PredictionFields.slider(
          label: l10n.predSoilMoisture,
          value: _soilMoisture,
          min: 5,
          max: 90,
          display: '${_soilMoisture.round()}%',
          onChanged: (v) => setState(() => _soilMoisture = v),
        ),

        const SizedBox(height: 24),
        FilledButton(
          onPressed: _running ? null : _run,
          child: Text(_running ? l10n.predRunning : l10n.predRun),
        ),

        if (_error != null) ...[
          const SizedBox(height: 20),
          Text(
            _error!,
            style: Theme.of(context).textTheme.bodyLarge
                ?.copyWith(color: AppColors.danger),
          ),
        ],

        if (result != null) ...[
          const SizedBox(height: 28),
          _ProfitResult(result: result),
        ],
      ],
    );
  }
}

class _ProfitResult extends StatelessWidget {
  const _ProfitResult({required this.result});

  final ProfitPrediction result;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final text = theme.textTheme;
    final isDark = theme.brightness == Brightness.dark;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    String rupees(double value) => '₹${numbers.format(value.round())}';

    final positive = result.isProfitable;
    final accent =
        positive
            ? (isDark ? AppColors.forestDark : AppColors.forest)
            : (isDark ? AppColors.dangerDark : AppColors.danger);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(l10n.predMargin),
        KdCard(
          background:
              positive
                  ? (isDark
                      ? AppColors.forestDark.withAlpha(35)
                      : AppColors.forestTint)
                  : (isDark
                      ? AppColors.dangerDark.withAlpha(35)
                      : AppColors.dangerTint),
          outline:
              positive
                  ? (isDark
                      ? AppColors.forestDark.withAlpha(80)
                      : AppColors.forestLine)
                  : (isDark
                      ? AppColors.dangerDark.withAlpha(80)
                      : AppColors.dangerLine),
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.predMargin.toUpperCase(),
                style: AppTheme.eyebrow(context),
              ),
              const SizedBox(height: 6),
              Figure(value: rupees(result.margin), color: accent),
              if (!positive) ...[
                const SizedBox(height: 4),
                Text(
                  l10n.predLoss,
                  style: text.bodyLarge?.copyWith(color: AppColors.danger),
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 12),
        // Costs breakdown card
        KdCard(
          clip: true,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              _CostRow(
                label: l10n.predQuintals(
                  result.predictedYield.toStringAsFixed(1),
                ),
                icon: Icons.grass_outlined,
              ),
              Divider(height: 1, color: theme.colorScheme.outline),
              _CostRow(
                label: l10n.predPrice(
                  numbers.format(result.pricePerQuintal.round()),
                ),
                icon: Icons.sell_outlined,
              ),
              Divider(height: 1, color: theme.colorScheme.outline),
              _CostRow(
                label: '${l10n.predRevenue}: ${rupees(result.expectedRevenue)}',
                icon: Icons.trending_up,
              ),
              Divider(height: 1, color: theme.colorScheme.outline),
              _CostRow(
                label: '${l10n.predCosts}: ${rupees(result.totalCost)}',
                icon: Icons.receipt_long_outlined,
              ),
              if (result.usedModel) ...[
                Divider(height: 1, color: theme.colorScheme.outline),
                _CostRow(
                  label: l10n.predConfidence('${result.confidencePercent}'),
                  icon: Icons.insights,
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 12),
        // Land rent note
        KdCard(
          background:
              isDark
                  ? AppColors.amberDark.withAlpha(30)
                  : AppColors.amberTint,
          outline:
              isDark
                  ? AppColors.amberDark.withAlpha(70)
                  : AppColors.amberLine,
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.info_outline,
                size: 20,
                color: isDark ? AppColors.amberDark : AppColors.amberText,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Land rent is not in this',
                      style: text.titleSmall?.copyWith(
                        color:
                            isDark
                                ? AppColors.amberDark
                                : AppColors.amberText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'If you lease this field, subtract the rent yourself. Everything else you spend is above.',
                      style: text.bodySmall?.copyWith(
                        color:
                            isDark
                                ? AppColors.amberDark
                                : AppColors.amberText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // A confidence score belongs to the model. When the route answered
        // from its fallback table there is no model behind the number, so the
        // score is withheld and the estimate is labelled instead.
        if (!result.usedModel) ...[
          const SizedBox(height: 12),
          KdCard(
            background:
                isDark
                    ? AppColors.amberDark.withAlpha(25)
                    : AppColors.amberTint,
            outline:
                isDark
                    ? AppColors.amberDark.withAlpha(60)
                    : AppColors.amberLine,
            padding: const EdgeInsets.all(12),
            child: Text(
              l10n.predFallbackNote,
              style: text.bodyMedium?.copyWith(
                color:
                    isDark ? AppColors.amberDark : AppColors.amberText,
              ),
            ),
          ),
        ],

        if (result.mandi != null) ...[
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    result.mandi!.location,
                    style: text.bodySmall,
                  ),
                ),
                ProvenanceChip(
                  result.mandi!.isLive
                      ? Provenance.live
                      : Provenance.estimated,
                  label:
                      result.mandi!.isLive
                          ? 'Live'
                          : l10n.predEstimatedPrice,
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 14),
        Text(
          l10n.predMarginNote,
          style: text.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}

class _CostRow extends StatelessWidget {
  const _CostRow({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}

