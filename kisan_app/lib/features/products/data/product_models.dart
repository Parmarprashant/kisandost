/// The agri-input catalogue.
///
/// Ported from the web app's `data/products.ts` into a bundled JSON asset,
/// while supporting live enrichment from `/api/marketplace/:productId`.
library;

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.description,
    required this.longDescription,
    required this.features,
    required this.usage,
    required this.imageUrl,
    this.tag,
    this.brand,
    this.stock,
    this.category,
  });

  final String id;
  final String name;

  /// Indicative rupees. The web app hardcodes these and they do move, so the
  /// screen labels them rather than presenting them as a dealer's quote.
  final num price;

  final String description;
  final String longDescription;
  final List<String> features;

  /// Crop or situation -> dose. Free-form, as written in the source data.
  final Map<String, String> usage;

  final String imageUrl;

  /// "Plant Growth Regulator", "Insecticide", and so on.
  final String? tag;

  /// Manufacturer or chemical distributor brand (e.g. "Bayer", "Syngenta", "UPL").
  final String? brand;

  /// Available units in inventory.
  final int? stock;

  /// 'pesticide', 'fertilizer', 'biostimulant', etc.
  final String? category;

  bool get hasUsage => usage.isNotEmpty;

  bool matches(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return true;

    return name.toLowerCase().contains(q) ||
        description.toLowerCase().contains(q) ||
        (tag?.toLowerCase().contains(q) ?? false) ||
        (brand?.toLowerCase().contains(q) ?? false) ||
        usage.keys.any((crop) => crop.toLowerCase().contains(q));
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final id = json['id']?.toString() ?? json['productId']?.toString() ?? '';
    final name =
        json['name'] as String? ?? json['productName'] as String? ?? '';
    final price = json['price'] is num ? json['price'] as num : 0;
    final description = json['description'] as String? ?? '';
    final longDescription = json['longDescription'] as String? ?? description;

    final rawFeatures = json['features'];
    final features = rawFeatures is List
        ? rawFeatures
              .whereType<String>()
              .where((s) => s.trim().isNotEmpty)
              .toList(growable: false)
        : const <String>[];

    final usage = json['usage'];
    final Map<String, String> parsedUsage;
    if (usage is Map) {
      parsedUsage = {
        for (final entry in usage.entries)
          if (entry.key is String && entry.value is String)
            entry.key as String: entry.value as String,
      };
    } else if (usage is String && usage.trim().isNotEmpty) {
      parsedUsage = {'General Application': usage.trim()};
    } else {
      parsedUsage = const {};
    }

    final imageUrl = json['imageUrl'] as String? ?? '';
    final tag = _nonEmpty(json['tag'] ?? json['category']);
    final brand = _nonEmpty(json['brand']);
    final stock = json['stock'] is num ? (json['stock'] as num).toInt() : null;
    final category = _nonEmpty(json['category']);

    return Product(
      id: id,
      name: name,
      price: price,
      description: description,
      longDescription: longDescription,
      features: features,
      usage: parsedUsage,
      imageUrl: imageUrl,
      tag: tag,
      brand: brand,
      stock: stock,
      category: category,
    );
  }
}

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}
