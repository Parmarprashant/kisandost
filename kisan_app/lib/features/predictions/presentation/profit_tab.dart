import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
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
  ProfitPrediction? _result;

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
      setState(() => _result = result);
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
    final text = Theme.of(context).textTheme;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    String rupees(double value) => '₹${numbers.format(value.round())}';

    final positive = result.isProfitable;
    final accent = positive ? AppColors.success : AppColors.danger;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: accent.withValues(alpha: 0.10),
            border: Border.all(color: accent.withValues(alpha: 0.30)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(l10n.predMargin, style: text.bodyLarge),
              const SizedBox(height: 4),
              Text(
                rupees(result.margin),
                style: text.displaySmall?.copyWith(color: accent),
              ),
              if (!positive) ...[
                const SizedBox(height: 4),
                Text(l10n.predLoss, style: text.bodyLarge),
              ],
            ],
          ),
        ),

        const SizedBox(height: 12),
        // The API calls this "profit", but it subtracts only the three input
        // costs the farmer typed. Seed, labour, land rent and transport are
        // missing, and those are most of what a smallholder actually spends.
        // Presenting it as profit would overstate take-home badly enough to
        // change a planting decision.
        Text(l10n.predMarginNote, style: text.bodySmall),

        const SizedBox(height: 20),
        _Row(
          label: l10n.predQuintals(result.predictedYield.toStringAsFixed(1)),
          icon: Icons.grass_outlined,
        ),
        _Row(
          label: l10n.predPrice(numbers.format(result.pricePerQuintal.round())),
          icon: Icons.sell_outlined,
        ),
        _Row(
          label: '${l10n.predRevenue}: ${rupees(result.expectedRevenue)}',
          icon: Icons.trending_up,
        ),
        _Row(
          label: '${l10n.predCosts}: ${rupees(result.totalCost)}',
          icon: Icons.receipt_long_outlined,
        ),
        if (result.usedModel)
          _Row(
            label: l10n.predConfidence('${result.confidencePercent}'),
            icon: Icons.insights,
          ),

        // A confidence score belongs to the model. When the route answered
        // from its fallback table there is no model behind the number, so the
        // score is withheld and the estimate is labelled instead.
        if (!result.usedModel) ...[
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppColors.secondary.withValues(alpha: 0.12),
            ),
            child: Text(l10n.predFallbackNote, style: text.bodyLarge),
          ),
          const SizedBox(height: 12),
        ],

        if (result.mandi != null) ...[
          const SizedBox(height: 12),
          Text(result.mandi!.location, style: text.bodySmall),
          // Same honesty rule as the mandi screen: a margin built on an
          // invented baseline price is a guess, and must say so.
          if (!result.mandi!.isLive) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: AppColors.secondary.withValues(alpha: 0.12),
              ),
              child: Text(l10n.predEstimatedPrice, style: text.bodyLarge),
            ),
          ],
        ],
      ],
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.icon});

  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.muted),
          const SizedBox(width: 10),
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
