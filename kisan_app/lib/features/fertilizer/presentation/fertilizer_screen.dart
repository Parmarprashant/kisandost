import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../data/fertilizer_calculator.dart';

class FertilizerScreen extends ConsumerStatefulWidget {
  const FertilizerScreen({super.key});

  @override
  ConsumerState<FertilizerScreen> createState() => _FertilizerScreenState();
}

class _FertilizerScreenState extends ConsumerState<FertilizerScreen> {
  String _crop = 'Cotton';
  String _soil = 'Loamy';
  final _area = TextEditingController(text: '1');
  bool _hasSoilTest = false;
  final _n = TextEditingController();
  final _p = TextEditingController();
  final _k = TextEditingController();

  FertilizerResult? _result;

  @override
  void initState() {
    super.initState();
    // Pre-fill from the farmer's own first crop when they have one — most
    // people are calculating for the field they just told us about.
    final crops = ref.read(activeCropsProvider);
    if (crops.isNotEmpty) {
      final entry = crops.first;
      if (cropFormulas.containsKey(entry.crop.cropName)) {
        _crop = entry.crop.cropName;
      }
      _area.text = entry.crop.cultivatedArea.toString();
    }
  }

  @override
  void dispose() {
    for (final c in [_area, _n, _p, _k]) {
      c.dispose();
    }
    super.dispose();
  }

  void _calculate() {
    setState(() {
      _result = calculateFertilizer(
        crop: _crop,
        acres: double.tryParse(_area.text.trim()) ?? 0,
        soilType: _soil,
        existingN: _hasSoilTest ? (double.tryParse(_n.text.trim()) ?? 0) : 0,
        existingP: _hasSoilTest ? (double.tryParse(_p.text.trim()) ?? 0) : 0,
        existingK: _hasSoilTest ? (double.tryParse(_k.text.trim()) ?? 0) : 0,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final result = _result;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.fertTitle)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _crop,
            isExpanded: true,
            decoration: InputDecoration(labelText: l10n.fertCrop),
            items: [
              for (final crop in cropFormulas.keys)
                DropdownMenuItem(value: crop, child: Text(crop)),
            ],
            onChanged: (v) => setState(() => _crop = v ?? _crop),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _area,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: l10n.fertArea),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _soil,
            isExpanded: true,
            decoration: InputDecoration(labelText: l10n.fertSoil),
            items: [
              for (final soil in soilAdjustments.keys)
                DropdownMenuItem(value: soil, child: Text(soil)),
            ],
            onChanged: (v) => setState(() => _soil = v ?? _soil),
          ),

          const SizedBox(height: 8),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            value: _hasSoilTest,
            title: Text(l10n.fertSoilTest),
            onChanged: (v) => setState(() => _hasSoilTest = v),
          ),

          // Only shown when they say they have a card. Asking a farmer for
          // soil nitrogen they do not have is how forms get abandoned.
          if (_hasSoilTest) ...[
            TextField(
              controller: _n,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(labelText: l10n.fertExistingN),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _p,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(labelText: l10n.fertExistingP),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _k,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(labelText: l10n.fertExistingK),
            ),
          ],

          const SizedBox(height: 20),
          FilledButton(onPressed: _calculate, child: Text(l10n.fertCalculate)),

          if (result != null && !result.isEmpty) ...[
            const SizedBox(height: 28),
            _Results(result: result),
          ],
        ],
      ),
    );
  }
}

class _Results extends StatelessWidget {
  const _Results({required this.result});

  final FertilizerResult result;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.fertBuy, style: text.titleMedium),
        const SizedBox(height: 12),

        _Bag(label: l10n.fertUrea, kg: result.ureaKg, numbers: numbers),
        _Bag(label: l10n.fertDap, kg: result.dapKg, numbers: numbers),
        _Bag(label: l10n.fertMop, kg: result.mopKg, numbers: numbers),

        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: AppColors.primaryContainer,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.fertBags('${result.totalBags}'),
                style: text.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                l10n.fertCost(numbers.format(result.estimatedCost)),
                style: text.bodyLarge,
              ),
              const SizedBox(height: 6),
              // The prices behind this are hardcoded and do move, so the
              // number is labelled an estimate rather than passed off as a
              // quote a shop will honour.
              Text(l10n.fertCostNote, style: text.bodySmall),
            ],
          ),
        ),

        if (result.reducedBySoilTest) ...[
          const SizedBox(height: 12),
          _Note(
            icon: Icons.savings_outlined,
            color: AppColors.success,
            text: l10n.fertReduced,
          ),
        ],

        const SizedBox(height: 12),
        // Applying all the nitrogen at sowing is the single most common and
        // most expensive mistake this calculator can lead to.
        _Note(
          icon: Icons.schedule,
          color: AppColors.sky,
          text: l10n.fertSplitNote,
        ),
      ],
    );
  }
}

class _Bag extends StatelessWidget {
  const _Bag({required this.label, required this.kg, required this.numbers});

  final String label;
  final int kg;
  final NumberFormat numbers;

  @override
  Widget build(BuildContext context) {
    if (kg <= 0) return const SizedBox.shrink();

    final l10n = L10n.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryContainer,
            ),
            child: const Icon(
              Icons.inventory_2_outlined,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
          Text(
            l10n.fertKg(numbers.format(kg)),
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}

class _Note extends StatelessWidget {
  const _Note({required this.icon, required this.color, required this.text});

  final IconData icon;
  final Color color;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: color.withValues(alpha: 0.10),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
