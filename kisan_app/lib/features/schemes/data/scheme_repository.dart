import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/cache_policy.dart';
import '../../../core/network/dio_client.dart';
import 'scheme_models.dart';

final schemeRepositoryProvider = Provider<SchemeRepository>(
  (ref) => SchemeRepository(ref.read(dioProvider)),
);

class SchemeRepository {
  SchemeRepository(this._dio);

  final Dio _dio;

  Future<SchemeCatalogue> catalogue() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/api/schemes');

      final body = response.data;
      if (response.statusCode != 200 || body == null) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
        );
      }

      return SchemeCatalogue.fromJson(body);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }
}

/// The scheme list is hand-curated and changes at most a few times a year, so
/// it is held for the session rather than refetched on every visit.
final schemesProvider = FutureProvider<SchemeCatalogue>((ref) async {
  final catalogue = await ref.read(schemeRepositoryProvider).catalogue();
  cacheFor(ref, referenceCacheWindow);
  return catalogue;
});

/// Free-text search across the catalogue.
final schemeSearchProvider = NotifierProvider<SchemeSearch, String>(
  SchemeSearch.new,
);

class SchemeSearch extends Notifier<String> {
  @override
  String build() => '';

  void update(String query) => state = query;
}

/// The selected category id, or null for all.
final schemeCategoryProvider = NotifierProvider<SchemeCategoryFilter, String?>(
  SchemeCategoryFilter.new,
);

class SchemeCategoryFilter extends Notifier<String?> {
  @override
  String? build() => null;

  /// Tapping the active chip clears it, which is what a farmer expects from a
  /// filter row with no visible "clear" button.
  void toggle(String id) => state = state == id ? null : id;
}

/// Schemes after the search box and the category chips are applied.
final filteredSchemesProvider = Provider<List<GovScheme>>((ref) {
  final catalogue = ref.watch(schemesProvider).value;
  if (catalogue == null) return const [];

  final query = ref.watch(schemeSearchProvider);
  final category = ref.watch(schemeCategoryProvider);

  return catalogue.schemes
      .where((s) => category == null || s.category == category)
      .where((s) => s.matches(query))
      .toList(growable: false);
});
