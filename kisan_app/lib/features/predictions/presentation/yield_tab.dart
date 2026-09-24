import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../../fertilizer/data/fertilizer_calculator.dart';
import '../data/prediction_models.dart';
import '../data/prediction_repository.dart';

class YieldTab extends ConsumerStatefulWidget {
  const YieldTab({super.key});

  @override
  ConsumerState<YieldTab> createState() => _YieldTabState();
}

class _YieldTabState extends ConsumerState<YieldTab> {
  String _crop = 'Cotton';
  final _area = TextEditingController(text: '1');
  double _ndvi = defaultNdvi;
  double _soilMoisture = defaultSoilMoisture;
  final _rainfall = TextEditingController(
    text: defaultRainfall.round().toString(),
  );

  bool _running = false;
  String? _error;
  YieldPrediction? _result;

  @override
  void initState() {
    super.initState();
    // Start from the farmer's own crop when there is one.
    final crops = ref.read(activeCropsProvider);
    if (crops.isNotEmpty) {
      _crop = crops.first.crop.cropName;
      _area.text = crops.first.crop.cultivatedArea.toString();
    }
  }

  @override
  void dispose() {
    _area.dispose();
    _rainfall.dispose();
    super.dispose();
  }

  Future<void> _run() async {
    setState(() {
      _running = true;
      _error = null;
    });

    try {
      final result = await ref
          .read(predictionRepositoryProvider)
          .predictYield(
            crop: _crop,
            areaAcres: double.tryParse(_area.text.trim()) ?? 1,
            ndvi: _ndvi,
            soilMoisture: _soilMoisture,
            rainfall: double.tryParse(_rainfall.text.trim()) ?? defaultRainfall,
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
        _CropField(
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
        const SizedBox(height: 20),

        // NDVI is user-entered by decision: there is no satellite source
        // wired up, and the web dashboard's 0.78 is hardcoded. A slider with
        // a plain-language label beats asking a farmer to type an index they
        // have never heard of.
        _Slider(
          label: l10n.predNdvi,
          help: l10n.predNdviHelp,
          value: _ndvi,
          min: 0.1,
          max: 0.95,
          display: _ndvi.toStringAsFixed(2),
          onChanged: (v) => setState(() => _ndvi = v),
        ),
        _Slider(
          label: l10n.predSoilMoisture,
          value: _soilMoisture,
          min: 5,
          max: 90,
          display: '${_soilMoisture.round()}%',
          onChanged: (v) => setState(() => _soilMoisture = v),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: _rainfall,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.predRainfall),
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
          _YieldResult(result: result),
        ],
      ],
    );
  }
}

class _YieldResult extends StatelessWidget {
  const _YieldResult({required this.result});

  final YieldPrediction result;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    final better = result.isAboveAverage;
    final accent = better ? AppColors.success : AppColors.warning;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.predYieldResult, style: text.titleMedium),
        const SizedBox(height: 12),

        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: AppColors.primaryContainer,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.predTonnes(numbers.format(result.totalYield)),
                style: text.displaySmall?.copyWith(color: AppColors.primary),
              ),
              Text(
                l10n.predPerAcre(result.yieldPerAcre.toStringAsFixed(2)),
                style: text.bodyLarge,
              ),
            ],
          ),
        ),

        // The comparison is the point: a number on its own tells a farmer
        // nothing, but "12% below what your district manages" is actionable.
        if (result.hasBaseline) ...[
          const SizedBox(height: 14),
          Row(
            children: [
              Icon(
                better ? Icons.trending_up : Icons.trending_down,
                color: accent,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  better
                      ? l10n.predAbove(
                          result.percentDifference.abs().toStringAsFixed(1),
                        )
                      : l10n.predBelow(
                          result.percentDifference.abs().toStringAsFixed(1),
                        ),
                  style: text.bodyLarge?.copyWith(color: accent),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            l10n.predVsRegion(result.regionalPerAcre.toStringAsFixed(2)),
            style: text.bodySmall,
          ),
        ],

        if (result.insights.isNotEmpty) ...[
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppColors.sky.withValues(alpha: 0.10),
              border: Border.all(color: AppColors.sky.withValues(alpha: 0.35)),
            ),
            child: Text(result.insights, style: text.bodyLarge),
          ),
        ],
      ],
    );
  }
}

/// Crop picker shared by both prediction tabs.
class _CropField extends StatelessWidget {
  const _CropField({
    required this.value,
    required this.onChanged,
    required this.label,
  });

  final String value;
  final ValueChanged<String> onChanged;
  final String label;

  @override
  Widget build(BuildContext context) {
    final options = cropFormulas.keys.toList();
    // A crop the farmer entered that is not in our list must still show,
    // or the dropdown asserts.
    final items = options.contains(value) ? options : [value, ...options];

    return DropdownButtonFormField<String>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(labelText: label),
      items: [
        for (final crop in items)
          DropdownMenuItem(value: crop, child: Text(crop)),
      ],
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }
}

class _Slider extends StatelessWidget {
  const _Slider({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.display,
    required this.onChanged,
    this.help,
  });

  final String label;
  final String? help;
  final double value;
  final double min;
  final double max;
  final String display;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: text.bodyLarge)),
            Text(display, style: text.titleMedium),
          ],
        ),
        if (help != null) Text(help!, style: text.bodySmall),
        Slider(value: value, min: min, max: max, onChanged: onChanged),
      ],
    );
  }
}

/// Exposed so the profit tab can reuse the same picker and slider.
class PredictionFields {
  const PredictionFields._();

  static Widget crop({
    required String value,
    required ValueChanged<String> onChanged,
    required String label,
  }) => _CropField(value: value, onChanged: onChanged, label: label);
}
