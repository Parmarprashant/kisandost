/// The agri-input catalogue.
///
/// Ported from the web app's `data/products.ts` into a bundled JSON asset, by
/// decision: the web `/products` page reads that static file while
/// `/marketplace` reads the `AgriProduct` collection, and the two disagree. A
/// real API is coming later, so this is read through [ProductRepository] and
/// swapping the source will not touch a single screen.
///
/// Bundling also means the catalogue works with no signal, which matters for
/// someone standing in a shop.
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

  bool get hasUsage => usage.isNotEmpty;

  bool matches(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return true;

    return name.toLowerCase().contains(q) ||
        description.toLowerCase().contains(q) ||
        (tag?.toLowerCase().contains(q) ?? false) ||
        usage.keys.any((crop) => crop.toLowerCase().contains(q));
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    final usage = json['usage'];

    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      price: json['price'] is num ? json['price'] as num : 0,
      description: json['description'] as String? ?? '',
      longDescription: json['longDescription'] as String? ?? '',
      features: json['features'] is List
          ? (json['features'] as List)
                .whereType<String>()
                .where((s) => s.trim().isNotEmpty)
                .toList(growable: false)
          : const [],
      usage: usage is Map
          ? {
              for (final entry in usage.entries)
                if (entry.key is String && entry.value is String)
                  entry.key as String: entry.value as String,
            }
          : const {},
      imageUrl: json['imageUrl'] as String? ?? '',
      tag: _nonEmpty(json['tag']),
    );
  }
}

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}
