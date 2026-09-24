import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'weather_models.dart';

final weatherRepositoryProvider = Provider<WeatherRepository>(
  (ref) => WeatherRepository(ref.read(dioProvider)),
);

class WeatherRepository {
  WeatherRepository(this._dio);

  final Dio _dio;

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
) {
  return ref.read(weatherRepositoryProvider).fetch(query);
});
