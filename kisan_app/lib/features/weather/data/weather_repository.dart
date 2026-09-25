import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/cache_policy.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/offline_store.dart';
import 'weather_models.dart';

final weatherRepositoryProvider = Provider<WeatherRepository>(
  (ref) =>
      WeatherRepository(ref.read(dioProvider), ref.read(offlineStoreProvider)),
);

class WeatherRepository {
  WeatherRepository(this._dio, this._offline);

  final Dio _dio;
  final OfflineStore _offline;

  /// The last forecast that came back for [query], however old.
  ///
  /// Returned with its age so the screen can say how stale it is rather than
  /// passing off yesterday's forecast as today's.
  CachedPayload<WeatherSnapshot>? lastKnown(String query) {
    final cached = _offline.readMap(OfflineKeys.weather(query));
    if (cached == null) return null;
    try {
      return CachedPayload(
        value: WeatherSnapshot.fromJson(cached.value),
        savedAt: cached.savedAt,
      );
    } catch (_) {
      return null;
    }
  }

  /// `q` accepts a place name (`Ahmedabad,India`) or `lat,lon` — the Next.js
  /// route handles both.
  Future<WeatherSnapshot> fetch(String query) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/weather',
        queryParameters: {'q': query},
      );

      final data = response.data;
      if (response.statusCode != 200 || data == null) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
          serverMessage: data?['error'] as String?,
        );
      }

      // Only a real response is kept. Caching a failure would hand the
      // same error back for days.
      await _offline.save(OfflineKeys.weather(query), data);

      return WeatherSnapshot.fromJson(data);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }
}

/// Weather for one place. `family` so the home strip and the full weather
/// screen can watch different locations without fighting over one cache slot.
final weatherProvider = FutureProvider.family<WeatherSnapshot, String>((
  ref,
  query,
) async {
  final snapshot = await ref.read(weatherRepositoryProvider).fetch(query);
  cacheFor(ref, weatherCacheWindow);
  return snapshot;
});
