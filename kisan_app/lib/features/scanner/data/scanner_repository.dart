import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'scanner_models.dart';

/// Raised when the route refuses because the user is not a premium member.
///
/// Separate from [ApiException] so the screen can offer the premium
/// explanation rather than a generic failure — a farmer who is told "try
/// again later" for something that will never work is being misled.
class NotPremiumException implements Exception {
  const NotPremiumException();
}

class ScannerRepository {
  ScannerRepository(this._dio);

  final Dio _dio;

  Future<VerificationResult> verify(String qrCodeId) async {
    final code = qrCodeId.trim();
    if (code.isEmpty) throw const ApiException(ApiErrorKind.badRequest);

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/verify-pesticide',
        data: {'qrCodeId': code},
      );

      final data = response.data;
      if (data == null) throw const ApiException(ApiErrorKind.server);

      return VerificationResult.fromJson(data, scannedCode: code);
    } on DioException catch (error) {
      final status = error.response?.statusCode ?? 0;

      if (status == 403) throw const NotPremiumException();
      if (status == 401) throw const ApiException(ApiErrorKind.unauthorized);
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

final scannerRepositoryProvider = Provider<ScannerRepository>(
  (ref) => ScannerRepository(ref.watch(dioProvider)),
);
