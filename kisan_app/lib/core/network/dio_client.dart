import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';
import '../storage/secure_store.dart';

/// The single HTTP client for the Next.js API.
///
/// The web app authenticates with an httpOnly cookie, which a mobile client
/// cannot use. This sends the JWT as `Authorization: Bearer <token>` instead —
/// see PRD §6.2(a) for the small backend change that accepts it.
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: Env.connectTimeout,
      receiveTimeout: Env.receiveTimeout,
      contentType: Headers.jsonContentType,
      // Let every status through so interceptors and repositories decide what
      // counts as an error, rather than dio throwing on a 404 we expect.
      validateStatus: (status) => status != null && status < 500,
    ),
  );

  dio.interceptors.add(_AuthInterceptor(ref.read(secureStoreProvider)));

  if (kDebugMode) {
    dio.interceptors.add(_LogInterceptor());
  }

  return dio;
});

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._store);

  final SecureStore _store;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _store.readToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    // The API reads the UI language for chatbot replies and advisory text.
    final locale = await _store.readLocale();
    if (locale != null) {
      options.queryParameters.putIfAbsent('locale', () => locale);
    }
    handler.next(options);
  }

  @override
  Future<void> onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    // A 401 means the JWT expired or was revoked. Drop it so the next launch
    // starts clean; routing to login is the router's job, driven by auth state.
    if (response.statusCode == 401) {
      await _store.clearToken();
    }
    handler.next(response);
  }
}

class _LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    developer.log('→ ${options.method} ${options.uri}', name: 'api');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    developer.log(
      '← ${response.statusCode} ${response.requestOptions.uri}',
      name: 'api',
    );
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    developer.log(
      '✗ ${err.type.name} ${err.requestOptions.uri}',
      name: 'api',
      error: err.message,
    );
    handler.next(err);
  }
}
