import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'product_models.dart';

/// Where the catalogue comes from.
///
/// Deliberately an interface with one implementation: an API is coming later,
/// and when it does only the provider binding below changes. No screen, model
/// or widget touches the source directly.
abstract interface class ProductRepository {
  Future<List<Product>> all();
  Future<Product?> byId(String id);
}

/// Reads the catalogue bundled with the app.
class StaticProductRepository implements ProductRepository {
  List<Product>? _cache;

  @override
  Future<List<Product>> all() async {
    final cached = _cache;
    if (cached != null) return cached;

    final raw = await rootBundle.loadString('assets/products.json');
    final decoded = jsonDecode(raw);

    final products = decoded is List
        ? decoded
              .whereType<Map<String, dynamic>>()
              .map(Product.fromJson)
              .where((p) => p.name.isNotEmpty)
              .toList(growable: false)
        : const <Product>[];

    return _cache = products;
  }

  @override
  Future<Product?> byId(String id) async {
    final products = await all();
    for (final product in products) {
      if (product.id == id) return product;
    }
    return null;
  }
}

/// Swap this binding for an `ApiProductRepository` when the endpoint exists.
final productRepositoryProvider = Provider<ProductRepository>(
  (ref) => StaticProductRepository(),
);

final productsProvider = FutureProvider<List<Product>>(
  (ref) => ref.read(productRepositoryProvider).all(),
);

final productSearchProvider = NotifierProvider<ProductSearch, String>(
  ProductSearch.new,
);

class ProductSearch extends Notifier<String> {
  @override
  String build() => '';

  void update(String query) => state = query;
}

final filteredProductsProvider = Provider<List<Product>>((ref) {
  final products = ref.watch(productsProvider).value ?? const [];
  final query = ref.watch(productSearchProvider);
  return products.where((p) => p.matches(query)).toList(growable: false);
});
