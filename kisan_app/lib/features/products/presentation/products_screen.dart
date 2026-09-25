import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
        onTap: () => context.push('/products/${product.id}'),
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
