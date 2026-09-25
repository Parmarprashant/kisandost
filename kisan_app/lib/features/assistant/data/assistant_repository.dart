import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'assistant_models.dart';

class AssistantRepository {
  AssistantRepository(this._dio);

  final Dio _dio;

  Future<String> ask({
    required String question,
    required String locale,
    required List<ChatMessage> history,
    String? district,
    List<String> crops = const [],
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/assistant',
        data: {
          'question': question,
          'locale': locale,
          'history': historyFor(history),
          if (district != null && district.isNotEmpty) 'district': district,
          if (crops.isNotEmpty) 'crops': crops,
        },
      );

      final answer = response.data?['answer'] as String? ?? '';
      if (answer.trim().isEmpty) {
        throw const ApiException(ApiErrorKind.server);
      }
      return answer.trim();
    } on DioException catch (error) {
      final status = error.response?.statusCode ?? 0;

      if (status == 401) throw const ApiException(ApiErrorKind.unauthorized);
      // 503 is the route's own "every model was busy". A farmer should be
      // told to try again, not that something is broken.
      if (status == 503) throw const ApiException(ApiErrorKind.timeout);
      if (status >= 400 && status < 500) {
        throw const ApiException(ApiErrorKind.badRequest);
      }
      if (error.type == DioExceptionType.connectionError) {
        throw const ApiException(ApiErrorKind.offline);
      }
      if (error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.connectionTimeout) {
        throw const ApiException(ApiErrorKind.timeout);
      }
      throw const ApiException(ApiErrorKind.server);
    }
  }
}

final assistantRepositoryProvider = Provider<AssistantRepository>(
  (ref) => AssistantRepository(ref.watch(dioProvider)),
);
