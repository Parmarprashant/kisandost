import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/voice/voice_search_field.dart';
import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../data/product_models.dart';
import '../data/product_repository.dart';

class ProductsScreen extends ConsumerWidget {
  const ProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final products = ref.watch(filteredProductsProvider);
    final loading = ref.watch(productsProvider).isLoading;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.productsTitle)),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: VoiceSearchField(
              hintText: l10n.productsSearch,
              onChanged: (v) =>
                  ref.read(productSearchProvider.notifier).update(v),
            ),
          ),
          Expanded(
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : products.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text(
                        l10n.productsNone,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                    itemCount: products.length + 1,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, i) {
                      if (i == products.length) {
                        // Prices are indicative and the list is a reference,
                        // not a shop. Said once, at the end.
                        return Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: Text(
                            l10n.productsStaticNote,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        );
                      }
                      return _ProductCard(product: products[i]);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _ProductDetail.open(context, product),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 64,
                  height: 64,
                  child: product.imageUrl.isEmpty
                      ? const ColoredBox(
                          color: AppColors.primaryContainer,
                          child: Icon(
                            Icons.science_outlined,
                            color: AppColors.primary,
                          ),
                        )
                      : CachedNetworkImage(
                          imageUrl: product.imageUrl,
                          fit: BoxFit.cover,
                          errorWidget: (_, _, _) => const ColoredBox(
                            color: AppColors.primaryContainer,
                            child: Icon(
                              Icons.science_outlined,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.name, style: text.titleMedium),
                    if (product.tag != null)
                      Text(product.tag!, style: text.labelSmall),
                    const SizedBox(height: 6),
                    Text(
                      l10n.productsPrice(numbers.format(product.price)),
                      style: text.bodyLarge?.copyWith(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductDetail extends StatelessWidget {
  const _ProductDetail({required this.product});

  final Product product;

  static Future<void> open(BuildContext context, Product product) {
    return Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => _ProductDetail(product: product)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final numbers = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Scaffold(
      appBar: AppBar(title: Text(product.name)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          if (product.imageUrl.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: product.imageUrl,
                  fit: BoxFit.cover,
                  errorWidget: (_, _, _) =>
                      const ColoredBox(color: AppColors.primaryContainer),
                ),
              ),
            ),
          const SizedBox(height: 16),
          if (product.tag != null) Text(product.tag!, style: text.labelSmall),
          Text(
            l10n.productsPrice(numbers.format(product.price)),
            style: text.headlineMedium?.copyWith(color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text(
            product.longDescription.isEmpty
                ? product.description
                : product.longDescription,
            style: text.bodyLarge,
          ),

          if (product.features.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text(l10n.productsFeatures, style: text.titleMedium),
            const SizedBox(height: 10),
            for (final feature in product.features)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 7, right: 10),
                      child: Icon(
                        Icons.circle,
                        size: 7,
                        color: AppColors.primary,
                      ),
                    ),
                    Expanded(child: Text(feature, style: text.bodyLarge)),
                  ],
                ),
              ),
          ],

          if (product.hasUsage) ...[
            const SizedBox(height: 24),
            Text(l10n.productsUsage, style: text.titleMedium),
            const SizedBox(height: 10),
            // Dose per crop is the part a farmer came for, so it gets rows
            // rather than a paragraph.
            for (final entry in product.usage.entries)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 110,
                      child: Text(entry.key, style: text.labelMedium),
                    ),
                    Expanded(child: Text(entry.value, style: text.bodyLarge)),
                  ],
                ),
              ),
          ],

          const SizedBox(height: 24),
          Text(l10n.productsStaticNote, style: text.bodySmall),
        ],
      ),
    );
  }
}
