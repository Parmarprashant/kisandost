import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/cache_policy.dart';
import '../../../core/network/dio_client.dart';
import 'mandi_models.dart';

final mandiRepositoryProvider = Provider<MandiRepository>(
  (ref) => MandiRepository(ref.read(dioProvider)),
);

class MandiRepository {
  MandiRepository(this._dio);

  final Dio _dio;

  Future<MandiPrice> price({
    required String crop,
    required String state,
    String? district,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mandi-prices',
        queryParameters: {
          'crop': crop,
          'state': state,
          if (district != null && district.isNotEmpty) 'district': district,
        },
      );

      final body = response.data;
      if (response.statusCode != 200 || body == null) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
          serverMessage: body?['error'] as String?,
        );
      }

      // The route answers `{ success, data }` and sets success=false with an
      // error string rather than a non-200 status.
      if (body['success'] != true || body['data'] is! Map<String, dynamic>) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
          serverMessage: body['error'] as String?,
        );
      }

      return MandiPrice.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  /// Crop names from the database, so the picker matches what the rest of the
  /// platform knows about. Falls back to a bundled list when unreachable.
  Future<List<String>> crops() async {
    try {
      final response = await _dio.get<List<dynamic>>('/api/crop-master');
      final data = response.data;
      if (response.statusCode != 200 || data == null) return fallbackCrops;

      final names = data
          .whereType<Map<String, dynamic>>()
          .where((row) => row['active'] != false)
          .map((row) => row['cropName'] as String? ?? '')
          .where((name) => name.isNotEmpty)
          .toList();

      names.sort();
      return names.isEmpty ? fallbackCrops : names;
    } on DioException {
      return fallbackCrops;
    }
  }
}

/// The crop list rarely changes, so it is fetched once per session.
final cropsProvider = FutureProvider<List<String>>((ref) async {
  final names = await ref.read(mandiRepositoryProvider).crops();
  cacheFor(ref, referenceCacheWindow);
  return names;
});

/// The crop + state pair currently being looked up.
typedef MandiQuery = ({String crop, String state});

final mandiQueryProvider = NotifierProvider<MandiQueryController, MandiQuery>(
  MandiQueryController.new,
);

class MandiQueryController extends Notifier<MandiQuery> {
  @override
  MandiQuery build() => (crop: 'Wheat', state: 'Gujarat');

  void setCrop(String crop) => state = (crop: crop, state: state.state);

  void setState(String value) => state = (crop: state.crop, state: value);
}

final mandiPriceProvider = FutureProvider.family<MandiPrice, MandiQuery>((
  ref,
  query,
) async {
  final price = await ref
      .read(mandiRepositoryProvider)
      .price(crop: query.crop, state: query.state);
  cacheFor(ref, mandiCacheWindow);
  return price;
});
