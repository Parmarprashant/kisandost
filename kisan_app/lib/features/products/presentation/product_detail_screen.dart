import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../data/product_models.dart';
import '../data/product_repository.dart';

/// Product detail screen matching Warm Earth Editorial design system.
class ProductDetailScreen extends ConsumerWidget {
  const ProductDetailScreen({required this.productId, super.key});

  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final productAsync = ref.watch(singleProductProvider(productId));

    return Scaffold(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.paper,
      body: SafeArea(
        child: productAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 48,
                    color: isDark ? AppColors.dangerDark : AppColors.danger,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Could not load product details: $err',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),
                  const SizedBox(height: 14),
                  InkWell(
                    onTap: () => ref.refresh(singleProductProvider(productId)),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.forestDark : AppColors.forest,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        l10n.appRetry,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          data: (product) {
            if (product == null) {
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.inventory_2_outlined,
                      size: 48,
                      color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Product not found',
                      style: TextStyle(
                        fontSize: 16,
                        color: isDark ? AppColors.inkDark : AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 14),
                    InkWell(
                      onTap: () {
                        if (context.canPop()) {
                          context.pop();
                        } else {
                          context.go('/products');
                        }
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isDark ? AppColors.lineDark : AppColors.line,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Back to Catalogue',
                          style: TextStyle(
                            color: isDark ? AppColors.inkDark : AppColors.ink,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            return _ProductDetailBody(product: product);
          },
        ),
      ),
    );
  }
}

class _ProductDetailBody extends StatelessWidget {
  const _ProductDetailBody({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Column(
      children: [
        // Top Header
        Container(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isDark ? AppColors.lineDark : AppColors.line,
              ),
            ),
          ),
          child: Row(
            children: [
              InkWell(
                onTap: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/products');
                  }
                },
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.sunkDark : AppColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isDark ? AppColors.lineDark : AppColors.line,
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
                      product.name,
                      style: TextStyle(
                        fontFamily: AppTheme.displayFamily,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        height: 1.2,
                        color: isDark ? AppColors.inkDark : AppColors.ink,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.brand != null && product.brand!.isNotEmpty
                          ? 'by ${product.brand}'
                          : (product.tag ?? 'Agri-Input Formulation'),
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? AppColors.mutedDark : AppColors.muted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Scrollable Content
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
            children: [
              // Product Image (if available)
              if (product.imageUrl.isNotEmpty) ...[
                Container(
                  height: 200,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.sunkDark : AppColors.sunk,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? AppColors.lineDark : AppColors.line,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: CachedNetworkImage(
                    imageUrl: product.imageUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, _, _) => Center(
                      child: Icon(
                        Icons.science_outlined,
                        size: 48,
                        color: isDark
                            ? AppColors.ink3Dark
                            : const Color(0xFF9C8F7C),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Price & Indicative Rates Card
              Container(
                padding: const EdgeInsets.all(16),
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
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TYPICAL PRICE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.05,
                            color: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '₹${numbers.format(product.price)}',
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 26,
                                fontWeight: FontWeight.w700,
                                color: isDark
                                    ? AppColors.inkDark
                                    : AppColors.ink,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Indicative shop rate · bargain locally',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? AppColors.mutedDark
                                : AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.surfaceDark
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isDark
                              ? AppColors.lineDark
                              : AppColors.lineStrong,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle,
                            size: 14,
                            color: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            product.stock != null && product.stock! > 0
                                ? 'Available'
                                : 'Partner Stores',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.inkDark : AppColors.ink,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Description Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? AppColors.lineDark : AppColors.line,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Overview',
                      style: TextStyle(
                        fontFamily: AppTheme.displayFamily,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.inkDark : AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      product.longDescription.isNotEmpty
                          ? product.longDescription
                          : product.description,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.55,
                        color: isDark
                            ? AppColors.ink2Dark
                            : const Color(0xFF4C4640),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Key Benefits
              if (product.features.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceDark : AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? AppColors.lineDark : AppColors.line,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Key Benefits',
                        style: TextStyle(
                          fontFamily: AppTheme.displayFamily,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.inkDark : AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 12),
                      for (final feature in product.features) ...[
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 18,
                              color: isDark
                                  ? AppColors.forestDark
                                  : AppColors.forest,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                feature,
                                style: TextStyle(
                                  fontSize: 14,
                                  height: 1.45,
                                  color: isDark
                                      ? AppColors.ink2Dark
                                      : const Color(0xFF4C4640),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Recommended Usage & Dosages
              if (product.hasUsage) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceDark : AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isDark ? AppColors.lineDark : AppColors.line,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.productsUsage,
                        style: TextStyle(
                          fontFamily: AppTheme.displayFamily,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.inkDark : AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 12),
                      for (final entry in product.usage.entries) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: isDark
                                    ? AppColors.lineDark
                                    : AppColors.line,
                              ),
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                flex: 2,
                                child: Text(
                                  entry.key,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.inkDark
                                        : AppColors.ink,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                flex: 3,
                                child: Text(
                                  entry.value,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark
                                        ? AppColors.ink2Dark
                                        : const Color(0xFF4C4640),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // QR Verification Prompt
              InkWell(
                onTap: () => context.push('/scan'),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.all(15),
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
                        color: isDark ? AppColors.forestDark : AppColors.forest,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
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
                        color: isDark ? AppColors.forestDark : AppColors.forest,
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
                    color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
