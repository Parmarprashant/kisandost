import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/voice/voice_input_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../data/product_models.dart';
import '../data/product_repository.dart';

/// Agri-inputs and supplies catalogue matching Products.dc.html.
class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchController = TextEditingController();
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      ref.read(productSearchProvider.notifier).update(_searchController.text);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final allProducts = ref.watch(filteredProductsProvider);
    final loading = ref.watch(productsProvider).isLoading;
    final activeCrops = ref.watch(activeCropsProvider);

    // Apply category filter
    final products = allProducts.where((p) {
      if (_selectedFilter == 'all') return true;
      if (_selectedFilter == 'crops') {
        if (activeCrops.isEmpty) return true;
        final cropNames = activeCrops
            .map((c) => c.crop.cropName.toLowerCase())
            .toSet();
        return cropNames.any((name) => p.matches(name));
      }
      final cat = (p.category ?? p.tag ?? '').toLowerCase();
      if (_selectedFilter == 'pesticide') {
        return cat.contains('pesticide') ||
            cat.contains('insecticide') ||
            cat.contains('fungicide') ||
            cat.contains('miticide');
      }
      if (_selectedFilter == 'fertilizer') {
        return cat.contains('fertiliser') ||
            cat.contains('fertilizer') ||
            cat.contains('manure') ||
            cat.contains('nutrient') ||
            cat.contains('urea');
      }
      if (_selectedFilter == 'seed') {
        return cat.contains('seed') ||
            cat.contains('trap') ||
            cat.contains('growth') ||
            cat.contains('regulator');
      }
      return true;
    }).toList();

    final filterOptions = [
      ('crops', l10n.productsFilterMyCrops),
      ('pesticide', l10n.productsFilterPesticide),
      ('fertilizer', l10n.productsFilterFertilizer),
      ('seed', l10n.productsFilterSeed),
    ];

    return Scaffold(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.paper,
      body: SafeArea(
        child: Column(
          children: [
            // Top Section: Back button + Title + Search + Filter Chips
            Container(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 12),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.lineDark : AppColors.line,
                  ),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      InkWell(
                        onTap: () => Navigator.of(context).maybePop(),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.sunkDark
                                : AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isDark
                                  ? AppColors.lineDark
                                  : AppColors.line,
                            ),
                          ),
                          child: Icon(
                            Icons.arrow_back,
                            size: 20,
                            color: isDark ? AppColors.inkDark : AppColors.ink,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.productsTitle,
                              style: TextStyle(
                                fontFamily: AppTheme.displayFamily,
                                fontSize: 21,
                                fontWeight: FontWeight.w600,
                                height: 1.15,
                                color: isDark
                                    ? AppColors.inkDark
                                    : AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              l10n.productsSubtitle,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? AppColors.mutedDark
                                    : AppColors.muted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Search Bar with Voice Input
                  Container(
                    height: 46,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.sunkDark : AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isDark
                            ? AppColors.lineDark
                            : AppColors.lineStrong,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search,
                          size: 20,
                          color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            style: TextStyle(
                              fontSize: 14,
                              color: isDark ? AppColors.inkDark : AppColors.ink,
                            ),
                            decoration: InputDecoration(
                              hintText: l10n.productsSearchHint,
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: isDark
                                    ? AppColors.ink3Dark
                                    : AppColors.ink3,
                              ),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                        VoiceInputButton(controller: _searchController),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final (key, label) in filterOptions) ...[
                          _FilterChip(
                            label: label,
                            selected: _selectedFilter == key,
                            onTap: () {
                              setState(() {
                                _selectedFilter = _selectedFilter == key
                                    ? 'all'
                                    : key;
                              });
                            },
                          ),
                          const SizedBox(width: 7),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Products Body
            Expanded(
              child: loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
                      children: [
                        // Active Context Banner
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 11,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.forestTintDark
                                : AppColors.forestTint,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark
                                  ? AppColors.forestLineDark
                                  : AppColors.forestLine,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.spa_outlined,
                                size: 19,
                                color: isDark
                                    ? AppColors.forestDark
                                    : AppColors.forest,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  activeCrops.isNotEmpty
                                      ? 'Sorted for ${activeCrops.first.crop.cropName} and your recent scans'
                                      : 'Recommended formulations and verified inputs',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.forestDark
                                        : AppColors.forest,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        if (products.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 40),
                            child: Center(
                              child: Text(
                                l10n.productsNone,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: isDark
                                      ? AppColors.ink3Dark
                                      : AppColors.ink3,
                                ),
                              ),
                            ),
                          )
                        else
                          for (final product in products) ...[
                            _ProductCard(product: product),
                            const SizedBox(height: 10),
                          ],

                        // QR Verify Banner Callout (Matches Products.dc.html)
                        InkWell(
                          onTap: () => context.push('/scan'),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 15,
                              vertical: 13,
                            ),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.forestTintDark
                                  : AppColors.forestTint,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isDark
                                    ? AppColors.forestLineDark
                                    : AppColors.forestLine,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.qr_code_scanner,
                                  size: 24,
                                  color: isDark
                                      ? AppColors.forestDark
                                      : AppColors.forest,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        l10n.productsScanBeforePay,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: isDark
                                              ? AppColors.inkDark
                                              : AppColors.ink,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        l10n.productsScanBeforePaySub,
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isDark
                                              ? AppColors.ink2Dark
                                              : AppColors.ink2,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Icon(
                                  Icons.chevron_right,
                                  size: 20,
                                  color: isDark
                                      ? AppColors.forestDark
                                      : AppColors.forest,
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Reference Note Footnote
                        Padding(
                          padding: const EdgeInsets.only(top: 16, bottom: 8),
                          child: Text(
                            l10n.productsReferenceNote,
                            style: TextStyle(
                              fontSize: 12,
                              height: 1.55,
                              color: isDark
                                  ? AppColors.ink3Dark
                                  : AppColors.ink3,
                            ),
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        height: 34,
        padding: const EdgeInsets.symmetric(horizontal: 13),
        decoration: BoxDecoration(
          color: selected
              ? (isDark ? AppColors.forestDark : AppColors.forest)
              : (isDark ? AppColors.sunkDark : AppColors.surface),
          borderRadius: BorderRadius.circular(4),
          border: selected
              ? null
              : Border.all(
                  color: isDark ? AppColors.lineDark : AppColors.lineStrong,
                ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
            color: selected
                ? Colors.white
                : (isDark ? AppColors.ink2Dark : AppColors.ink2),
          ),
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    // Contextual badge logic
    final tagLower = (product.tag ?? product.category ?? '').toLowerCase();
    final isScanTreatment =
        tagLower.contains('fungicide') ||
        tagLower.contains('leaf') ||
        product.name.toLowerCase().contains('mancozeb');
    final isDueToday =
        tagLower.contains('insecticide') ||
        product.name.toLowerCase().contains('imidacloprid');

    return InkWell(
      onTap: () => context.push('/products/${product.id}'),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceDark : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? AppColors.lineDark : AppColors.line,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image box (72x72dp)
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isDark ? AppColors.sunkDark : AppColors.sunk,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: isDark ? AppColors.lineDark : AppColors.line,
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: product.imageUrl.isEmpty
                  ? Icon(
                      Icons.science_outlined,
                      size: 30,
                      color: isDark
                          ? AppColors.ink3Dark
                          : const Color(0xFF9C8F7C),
                    )
                  : CachedNetworkImage(
                      imageUrl: product.imageUrl,
                      fit: BoxFit.cover,
                      errorWidget: (_, _, _) => Icon(
                        Icons.science_outlined,
                        size: 30,
                        color: isDark
                            ? AppColors.ink3Dark
                            : const Color(0xFF9C8F7C),
                      ),
                    ),
            ),
            const SizedBox(width: 13),

            // Info column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isScanTreatment)
                    Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.terracottaTintDark
                            : const Color(0xFFFAE7E4),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFE8BFBA)),
                      ),
                      child: Text(
                        'TREATS YOUR SCAN',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.06,
                          color: isDark
                              ? AppColors.dangerDark
                              : const Color(0xFF991B1B),
                        ),
                      ),
                    )
                  else if (isDueToday)
                    Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFBF1DC),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: const Color(0xFFEBD7AE)),
                      ),
                      child: const Text(
                        'DUE TODAY',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.06,
                          color: Color(0xFF92400E),
                        ),
                      ),
                    ),
                  Text(
                    product.name,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product.tag ?? product.category ?? 'Agricultural Input',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '₹${numbers.format(product.price)}',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.inkDark : AppColors.ink,
                        ),
                      ),
                      if (product.brand != null &&
                          product.brand!.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Text(
                          '· ${product.brand}',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
