import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import 'product_models.dart';

/// Where the catalogue comes from.
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

/// Fetches live product details from `/api/marketplace/:productId` with
/// seamless fallback to local bundled assets.
class HybridProductRepository implements ProductRepository {
  HybridProductRepository(this._dio, this._fallback);

  final Dio _dio;
  final StaticProductRepository _fallback;

  @override
  Future<List<Product>> all() => _fallback.all();

  @override
  Future<Product?> byId(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/api/marketplace/$id');
      final data = res.data;
      if (data != null && data['error'] == null) {
        return Product.fromJson(data);
      }
    } catch (_) {
      // Offline, not found, or network error — fall back to static product
    }
    return _fallback.byId(id);
  }
}

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return HybridProductRepository(
    ref.watch(dioProvider),
    StaticProductRepository(),
  );
});

final productsProvider = FutureProvider<List<Product>>(
  (ref) => ref.read(productRepositoryProvider).all(),
);

final singleProductProvider = FutureProvider.family<Product?, String>((
  ref,
  id,
) {
  return ref.read(productRepositoryProvider).byId(id);
});

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
