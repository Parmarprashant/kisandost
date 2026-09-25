/// Models for `GET /api/schemes`.
///
/// The route serves a hand-curated catalogue, not a live government feed —
/// myScheme's API rejects unauthenticated calls and the API Setu collection is
/// still marked "Coming Soon". It reports this in a `source` field, and the UI
/// says so rather than implying the list refreshes itself.
library;

class SchemeCatalogue {
  const SchemeCatalogue({
    required this.schemes,
    required this.categories,
    required this.source,
  });

  final List<GovScheme> schemes;
  final List<SchemeCategory> categories;

  /// `curated` today. If it ever becomes a live feed, this is what changes.
  final String source;

  bool get isCurated => source.toLowerCase().contains('curated');

  factory SchemeCatalogue.fromJson(Map<String, dynamic> json) {
    final rawSchemes = json['schemes'];
    final rawCategories = json['categories'];

    return SchemeCatalogue(
      schemes: rawSchemes is List
          ? rawSchemes
                .whereType<Map<String, dynamic>>()
                .map(GovScheme.fromJson)
                .where((s) => s.name.isNotEmpty)
                .toList(growable: false)
          : const [],
      categories: rawCategories is List
          ? rawCategories
                .whereType<Map<String, dynamic>>()
                .map(SchemeCategory.fromJson)
                .where((c) => c.id.isNotEmpty)
                .toList(growable: false)
          : const [],
      source: json['source'] as String? ?? '',
    );
  }
}

class GovScheme {
  const GovScheme({
    required this.id,
    required this.name,
    required this.shortName,
    required this.ministry,
    required this.category,
    required this.description,
    required this.benefits,
    required this.eligibility,
    required this.url,
    required this.icon,
    this.launched,
  });

  final String id;
  final String name;

  /// What a farmer will actually have heard of — "PM-KISAN", not the full
  /// Sanskrit-formal title. Shown first for that reason.
  final String shortName;

  final String ministry;
  final String category;
  final String description;
  final List<String> benefits;
  final List<String> eligibility;
  final String url;
  final String icon;
  final String? launched;

  String get displayName => shortName.isNotEmpty ? shortName : name;

  /// True when the short name is a real abbreviation rather than a repeat of
  /// the full title — decides whether showing both is useful or just noise.
  bool get hasDistinctFullName =>
      name.isNotEmpty && name.toLowerCase() != shortName.toLowerCase();

  /// Matches a free-text search against everything a farmer might type,
  /// including the ministry and the category.
  bool matches(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return true;

    return name.toLowerCase().contains(q) ||
        shortName.toLowerCase().contains(q) ||
        description.toLowerCase().contains(q) ||
        ministry.toLowerCase().contains(q) ||
        category.toLowerCase().contains(q);
  }

  factory GovScheme.fromJson(Map<String, dynamic> json) {
    return GovScheme(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      shortName: json['shortName'] as String? ?? '',
      ministry: json['ministry'] as String? ?? '',
      category: json['category'] as String? ?? '',
      description: json['description'] as String? ?? '',
      benefits: _strings(json['benefits']),
      eligibility: _strings(json['eligibility']),
      url: json['url'] as String? ?? '',
      icon: json['icon'] as String? ?? '',
      launched: _nonEmpty(json['launched']),
    );
  }
}

class SchemeCategory {
  const SchemeCategory({
    required this.id,
    required this.label,
    required this.icon,
  });

  final String id;
  final String label;
  final String icon;

  factory SchemeCategory.fromJson(Map<String, dynamic> json) {
    return SchemeCategory(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? '',
      icon: json['icon'] as String? ?? '',
    );
  }
}

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

List<String> _strings(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<String>()
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList(growable: false);
}
