import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

import '../../../core/config/env.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_store.dart';
import 'auth_models.dart';

/// The custom scheme the OAuth callback redirects to. Must match the
/// `MOBILE_CALLBACK_SCHEME` constant in the Next.js callback route and the
/// intent filter in AndroidManifest.xml.
const kCallbackScheme = 'kisandost';

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.read(dioProvider), ref.read(secureStoreProvider)),
);

class AuthRepository {
  AuthRepository(this._dio, this._store);

  final Dio _dio;
  final SecureStore _store;

  /// Signs in with Google.
  ///
  /// The app cannot use Google's native SDK without its own Android OAuth
  /// client, so it reuses the web flow the server already has registered: open
  /// `/api/auth/google?client=mobile` in a system browser, let Google redirect
  /// back to the server's own callback, and have that callback hand the JWT
  /// back through `kisandost://auth/callback?token=...`.
  ///
  /// Using a system browser rather than an embedded webview is deliberate —
  /// Google blocks sign-in from embedded webviews, and the user can see the
  /// real address bar, which is the point of the whole exercise.
  Future<AppUser> signInWithGoogle() async {
    final String result;
    try {
      result = await FlutterWebAuth2.authenticate(
        url: '${Env.apiBaseUrl}/api/auth/google?client=mobile',
        callbackUrlScheme: kCallbackScheme,
      );
    } catch (_) {
      // The plugin throws when the user dismisses the browser. That is a
      // choice, not a fault, so it is reported as such.
      throw AuthFailure.cancelled;
    }

    final callback = Uri.parse(result);
    final error = callback.queryParameters['error'];
    if (error != null) {
      throw AuthFailureFromCallback.parse(error);
    }

    final token = callback.queryParameters['token'];
    if (token == null || token.isEmpty) {
      throw AuthFailure.server;
    }

    await _store.writeToken(token);

    // Prove the token works before calling the user signed in. A token the
    // API will not accept is worse than no token: it produces a shell full of
    // 401s instead of a login screen.
    final user = await me();
    if (user == null) {
      await _store.clearToken();
      throw AuthFailure.server;
    }
    return user;
  }

  /// Username + password sign-in.
  ///
  /// The production path on Android is Google, whose callback comes back
  /// through a custom scheme that only resolves on a device. This exists so
  /// the app can be driven on desktop and in a browser during development,
  /// where that scheme does not resolve — see `kDebugMode` in the login
  /// screen, which is the only place it is offered.
  Future<AppUser> signInWithPassword(String username, String password) async {
    final Response<Map<String, dynamic>> response;
    try {
      response = await _dio.post<Map<String, dynamic>>(
        '/api/auth/login',
        data: {'username': username, 'password': password},
      );
    } on DioException catch (error) {
      final api = ApiException.from(error);
      throw api.kind == ApiErrorKind.offline
          ? AuthFailure.offline
          : AuthFailure.server;
    }

    if (response.statusCode == 401 || response.statusCode == 403) {
      throw AuthFailure.rejected;
    }

    final token = response.data?['token'];
    if (response.statusCode != 200 || token is! String || token.isEmpty) {
      throw AuthFailure.server;
    }

    await _store.writeToken(token);

    final user = await me();
    if (user == null) {
      await _store.clearToken();
      throw AuthFailure.server;
    }
    return user;
  }

  /// The signed-in user, or null when there is no valid session.
  Future<AppUser?> me() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/api/auth/me');
      final body = response.data;
      if (response.statusCode != 200 || body == null) return null;

      final user = body['user'];
      if (user is! Map<String, dynamic>) return null;

      return AppUser.fromJson(user);
    } on DioException catch (error) {
      final api = ApiException.from(error);
      // Offline is not the same as signed out. Rethrow so the caller can keep
      // a cached session instead of dumping the user back to the login screen
      // every time they lose signal.
      if (api.kind == ApiErrorKind.offline ||
          api.kind == ApiErrorKind.timeout) {
        rethrow;
      }
      return null;
    }
  }

  /// Saves the profile fields onboarding collects.
  ///
  /// The API allows only name, mobile, village, district and mainCrop to be
  /// written here — identity fields are not editable through this route.
  Future<AppUser> updateProfile(Map<String, String> fields) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        '/api/auth/me',
        data: fields,
      );

      final body = response.data;
      final user = body?['user'];
      if (response.statusCode != 200 || user is! Map<String, dynamic>) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
        );
      }

      return AppUser.fromJson(user);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  Future<void> signOut() async {
    // Clear locally first: if the network call fails the user must still end
    // up signed out on this device.
    await _store.clearToken();
    try {
      await _dio.post('/api/auth/logout');
    } on DioException {
      // Nothing to do — the session is gone from this device either way.
    }
  }

  Future<bool> hasStoredToken() async {
    final token = await _store.readToken();
    return token != null && token.isNotEmpty;
  }
}
