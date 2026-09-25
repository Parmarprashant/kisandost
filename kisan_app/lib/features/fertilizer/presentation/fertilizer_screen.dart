import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../data/fertilizer_calculator.dart';

/// Fertiliser dosing calculator.
/// Rebuilt in the Warm Earth Editorial language matching Fertilizer.dc.html.
class FertilizerScreen extends ConsumerStatefulWidget {
  const FertilizerScreen({super.key});

  @override
  ConsumerState<FertilizerScreen> createState() => _FertilizerScreenState();
}

class _FertilizerScreenState extends ConsumerState<FertilizerScreen> {
  String _crop = 'Cotton';
  String _soil = 'Loamy';
  final _area = TextEditingController(text: '2.5');
  bool _hasSoilTest = false;
  final _n = TextEditingController();
  final _p = TextEditingController();
  final _k = TextEditingController();

  late FertilizerResult _result;

  @override
  void initState() {
    super.initState();
    final crops = ref.read(activeCropsProvider);
    if (crops.isNotEmpty) {
      final entry = crops.first;
      if (cropFormulas.containsKey(entry.crop.cropName)) {
        _crop = entry.crop.cropName;
      }
      _area.text = entry.crop.cultivatedArea > 0
          ? entry.crop.cultivatedArea.toString()
          : '2.5';
    }
    _runCalculation();
  }

  @override
  void dispose() {
    for (final c in [_area, _n, _p, _k]) {
      c.dispose();
    }
    super.dispose();
  }

  void _runCalculation() {
    final acres = double.tryParse(_area.text.trim()) ?? 0;
    _result = calculateFertilizer(
      crop: _crop,
      acres: acres,
      soilType: _soil,
      existingN: _hasSoilTest ? (double.tryParse(_n.text.trim()) ?? 0) : 0,
      existingP: _hasSoilTest ? (double.tryParse(_p.text.trim()) ?? 0) : 0,
      existingK: _hasSoilTest ? (double.tryParse(_k.text.trim()) ?? 0) : 0,
    );
  }

  void _onInputsChanged() {
    setState(() {
      _runCalculation();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    final ureaBags = (_result.ureaKg / bagSizeKg).toStringAsFixed(1);
    final dapBags = (_result.dapKg / bagSizeKg).toStringAsFixed(1);
    final mopBags = (_result.mopKg / bagSizeKg).toStringAsFixed(1);

    final splitUrea1 = (_result.ureaKg / 3).round();
    final splitUrea2 = (_result.ureaKg / 3).round();
    final splitUrea3 = _result.ureaKg - splitUrea1 - splitUrea2;

    // Available crops list (Cotton, Wheat, Castor first as in artboard, followed by others)
    final quickCrops = [
      'Cotton',
      'Wheat',
      'Castor',
      'Rice',
      'Maize',
      'Sugarcane',
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar
            Container(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? AppColors.lineDark
                        : const Color(0xFFEFE6D7),
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
                          l10n.fertTitle,
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
                          l10n.fertilizerWorksOffline,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.skyTintDark : AppColors.skyTint,
                      border: Border.all(
                        color: isDark
                            ? AppColors.skyLineDark
                            : AppColors.skyLine,
                      ),
                      borderRadius: BorderRadius.circular(AppTheme.radiusChip),
                    ),
                    child: Text(
                      l10n.fertilizerOnDevice,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.skyDark : AppColors.sky,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Input Card
                    KdCard(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.fertCrop,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? AppColors.inkDark
                                  : AppColors.ink2,
                            ),
                          ),
                          const SizedBox(height: 9),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: [
                                for (final c in quickCrops) ...[
                                  _CropChip(
                                    label: c,
                                    isSelected: _crop == c,
                                    onTap: () {
                                      setState(() {
                                        _crop = c;
                                        _runCalculation();
                                      });
                                    },
                                  ),
                                  const SizedBox(width: 7),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              // Area Box
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      l10n.fertArea,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: isDark
                                            ? AppColors.inkDark
                                            : AppColors.ink2,
                                      ),
                                    ),
                                    const SizedBox(height: 7),
                                    Container(
                                      height: 50,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                      ),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: scheme.outline,
                                        ),
                                        color: scheme.surface,
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: TextField(
                                              controller: _area,
                                              keyboardType:
                                                  const TextInputType.numberWithOptions(
                                                    decimal: true,
                                                  ),
                                              style: const TextStyle(
                                                fontFamily: 'monospace',
                                                fontSize: 17,
                                                fontWeight: FontWeight.w600,
                                              ),
                                              decoration: const InputDecoration(
                                                border: InputBorder.none,
                                                isDense: true,
                                                contentPadding: EdgeInsets.zero,
                                              ),
                                              onChanged: (_) =>
                                                  _onInputsChanged(),
                                            ),
                                          ),
                                          const Text(
                                            'acres',
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: AppColors.muted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Soil Dropdown Box
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      l10n.fertSoil,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: isDark
                                            ? AppColors.inkDark
                                            : AppColors.ink2,
                                      ),
                                    ),
                                    const SizedBox(height: 7),
                                    Container(
                                      height: 50,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 14,
                                      ),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: scheme.outline,
                                        ),
                                        color: scheme.surface,
                                      ),
                                      child: DropdownButtonHideUnderline(
                                        child: DropdownButton<String>(
                                          value:
                                              soilAdjustments.containsKey(_soil)
                                              ? _soil
                                              : 'Loamy',
                                          isExpanded: true,
                                          icon: const Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            size: 20,
                                            color: AppColors.muted,
                                          ),
                                          items: [
                                            for (final s
                                                in soilAdjustments.keys)
                                              DropdownMenuItem(
                                                value: s,
                                                child: Text(
                                                  s,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                  ),
                                                ),
                                              ),
                                          ],
                                          onChanged: (v) {
                                            if (v != null) {
                                              setState(() {
                                                _soil = v;
                                                _runCalculation();
                                              });
                                            }
                                          },
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Optional Soil Test Switch
                          InkWell(
                            onTap: () {
                              setState(() {
                                _hasSoilTest = !_hasSoilTest;
                                _runCalculation();
                              });
                            },
                            child: Row(
                              children: [
                                SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: Checkbox(
                                    value: _hasSoilTest,
                                    activeColor: AppColors.forest,
                                    onChanged: (v) {
                                      setState(() {
                                        _hasSoilTest = v ?? false;
                                        _runCalculation();
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  l10n.fertSoilTest,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark
                                        ? AppColors.inkDark
                                        : AppColors.ink2,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (_hasSoilTest) ...[
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _n,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                          decimal: true,
                                        ),
                                    decoration: const InputDecoration(
                                      labelText: 'N (kg/ac)',
                                      isDense: true,
                                    ),
                                    onChanged: (_) => _onInputsChanged(),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _p,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                          decimal: true,
                                        ),
                                    decoration: const InputDecoration(
                                      labelText: 'P (kg/ac)',
                                      isDense: true,
                                    ),
                                    onChanged: (_) => _onInputsChanged(),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: TextField(
                                    controller: _k,
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                          decimal: true,
                                        ),
                                    decoration: const InputDecoration(
                                      labelText: 'K (kg/ac)',
                                      isDense: true,
                                    ),
                                    onChanged: (_) => _onInputsChanged(),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),

                    // Section: BUY THIS MUCH, IN TOTAL
                    Padding(
                      padding: const EdgeInsets.only(top: 20, bottom: 10),
                      child: Text(
                        l10n.fertilizerTotalBuy.toUpperCase(),
                        style: AppTheme.eyebrow(context),
                      ),
                    ),

                    Container(
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
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        children: [
                          _ChemicalRow(
                            name: l10n.fertUrea,
                            spec: '46% N · three splits',
                            kg: '${_result.ureaKg} kg',
                            bags: 'about $ureaBags bags',
                            showDivider: true,
                            isDark: isDark,
                          ),
                          _ChemicalRow(
                            name: l10n.fertDap,
                            spec: '18-46-0 · all at sowing',
                            kg: '${_result.dapKg} kg',
                            bags: 'about $dapBags bags',
                            showDivider: true,
                            isDark: isDark,
                          ),
                          _ChemicalRow(
                            name: l10n.fertMop,
                            spec: '60% K · at sowing',
                            kg: '${_result.mopKg} kg',
                            bags: 'about $mopBags bags',
                            showDivider: false,
                            isDark: isDark,
                          ),
                        ],
                      ),
                    ),

                    // Section: WHEN TO PUT IT ON
                    Padding(
                      padding: const EdgeInsets.only(top: 20, bottom: 10),
                      child: Text(
                        l10n.fertilizerWhenToApply.toUpperCase(),
                        style: AppTheme.eyebrow(context),
                      ),
                    ),

                    KdCard(
                      clip: true,
                      padding: EdgeInsets.zero,
                      child: Column(
                        children: [
                          _SplitRow(
                            splitNumber: '1',
                            numberColor: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                            timing: 'At sowing',
                            detail: 'All DAP and MOP, $splitUrea1 kg urea',
                            showDivider: true,
                            isDark: isDark,
                          ),
                          _SplitRow(
                            splitNumber: '2',
                            numberColor: isDark
                                ? AppColors.terracottaDark
                                : AppColors.terracotta,
                            timing: 'Day 30 to 35',
                            detail: '$splitUrea2 kg urea, soil moist',
                            showDivider: true,
                            isDark: isDark,
                          ),
                          _SplitRow(
                            splitNumber: '3',
                            numberColor: AppColors.muted,
                            timing: 'At flowering, day 60',
                            detail: 'Last $splitUrea3 kg urea',
                            showDivider: false,
                            isDark: isDark,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Actions
                    SizedBox(
                      height: 50,
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Fertiliser dosing saved for $_crop ($_soil soil)',
                              ),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        style: FilledButton.styleFrom(
                          backgroundColor: isDark
                              ? AppColors.forestDark
                              : AppColors.forest,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        icon: const Icon(
                          Icons.bookmark_added_outlined,
                          size: 20,
                        ),
                        label: Text(
                          l10n.fertilizer_save,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Footnote
                    Text(
                      l10n.fertilizerFootnote,
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
        height: 40,
        padding: const EdgeInsets.symmetric(horizontal: 15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          color: isSelected
              ? (isDark ? AppColors.forestDark : AppColors.forest)
              : scheme.surface,
          border: Border.all(
            color: isSelected
                ? (isDark ? AppColors.forestDark : AppColors.forest)
                : scheme.outline,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected
                ? Colors.white
                : (isDark ? AppColors.inkDark : AppColors.ink2),
          ),
        ),
      ),
    );
  }
}

class _ChemicalRow extends StatelessWidget {
  const _ChemicalRow({
    required this.name,
    required this.spec,
    required this.kg,
    required this.bags,
    required this.showDivider,
    required this.isDark,
  });

  final String name;
  final String spec;
  final String kg;
  final String bags;
  final bool showDivider;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 17, vertical: 15),
      decoration: BoxDecoration(
        border: showDivider
            ? Border(
                bottom: BorderSide(
                  color: isDark
                      ? AppColors.forestLineDark
                      : AppColors.forestLine,
                ),
              )
            : null,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                spec,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.ink2Dark : const Color(0xFF4C4640),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                kg,
                style: TextStyle(
                  fontFamily: AppTheme.displayFamily,
                  fontSize: 26,
                  fontWeight: FontWeight.w600,
                  height: 1,
                  color: isDark ? AppColors.inkDark : AppColors.ink,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                bags,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark ? AppColors.ink2Dark : const Color(0xFF4C4640),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SplitRow extends StatelessWidget {
  const _SplitRow({
    required this.splitNumber,
    required this.numberColor,
    required this.timing,
    required this.detail,
    required this.showDivider,
    required this.isDark,
  });

  final String splitNumber;
  final Color numberColor;
  final String timing;
  final String detail;
  final bool showDivider;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 13),
      decoration: BoxDecoration(
        border: showDivider
            ? Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.sunkDark : AppColors.sunk,
                ),
              )
            : null,
      ),
      child: Row(
        children: [
          SizedBox(
            width: 34,
            child: Column(
              children: [
                Text(
                  splitNumber,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: numberColor,
                  ),
                ),
                const Text(
                  'SPLIT',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  timing,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  detail,
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
