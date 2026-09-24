import 'package:dio/dio.dart';

/// What went wrong, in terms the UI can act on.
///
/// Every screen shows a plain-language message and a retry, so failures are
/// classified here rather than leaking `DioException` into widgets.
enum ApiErrorKind {
  /// No usable connection. Offer cached data.
  offline,

  /// Reached the server but it took too long — usually a cold-starting free
  /// tier, which is expected for AgriVision and the yield model.
  timeout,

  /// 401/403. The session is gone; sign the user out.
  unauthorized,

  /// 404.
  notFound,

  /// 4xx other than the above — we sent something wrong.
  badRequest,

  /// 5xx.
  server,

  /// Anything else, including parse failures.
  unknown,
}

class ApiException implements Exception {
  const ApiException(this.kind, {this.statusCode, this.serverMessage});

  final ApiErrorKind kind;
  final int? statusCode;

  /// The API's own `{ "error": "..." }` text, when it sent one. Not shown
  /// directly to farmers — it is English and often technical — but useful in
  /// logs and on the diagnostics screen.
  final String? serverMessage;

  factory ApiException.from(Object error) {
    if (error is ApiException) return error;
    if (error is! DioException) return const ApiException(ApiErrorKind.unknown);

    final status = error.response?.statusCode;
    final serverMessage = _extractMessage(error.response?.data);

    final kind = switch (error.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout => ApiErrorKind.timeout,
      DioExceptionType.connectionError => ApiErrorKind.offline,
      _ => _fromStatus(status),
    };

    return ApiException(kind, statusCode: status, serverMessage: serverMessage);
  }

  static ApiErrorKind _fromStatus(int? status) {
    if (status == null) return ApiErrorKind.unknown;
    if (status == 401 || status == 403) return ApiErrorKind.unauthorized;
    if (status == 404) return ApiErrorKind.notFound;
    if (status >= 500) return ApiErrorKind.server;
    if (status >= 400) return ApiErrorKind.badRequest;
    return ApiErrorKind.unknown;
  }

  static String? _extractMessage(Object? data) {
    if (data is Map && data['error'] is String) return data['error'] as String;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    return null;
  }

  bool get isRetryable =>
      kind == ApiErrorKind.offline ||
      kind == ApiErrorKind.timeout ||
      kind == ApiErrorKind.server;

  @override
  String toString() =>
      'ApiException($kind${statusCode != null ? ', $statusCode' : ''}'
      '${serverMessage != null ? ', $serverMessage' : ''})';
}
