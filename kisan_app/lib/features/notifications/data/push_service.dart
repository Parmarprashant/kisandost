/// Push notifications.
///
/// The backend already had the whole pipeline — `POST
/// /api/notifications/register-token` stores an `fcmToken` on the user,
/// `/api/notifications/test-push` sends one, and the advisory cron sends the
/// real ones. Nothing was ever registering a token against it.
///
/// Everything here is guarded by [pushSupported]. Firebase Messaging has no
/// Windows implementation, and the desktop build is what the app is developed
/// against, so an unguarded call would throw `MissingPluginException` on every
/// launch.
library;

import 'dart:async';
import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

/// Whether this build can receive push at all.
///
/// Web is excluded deliberately: it needs a service worker and a VAPID key
/// that nothing in this project sets up.
bool get pushSupported => !kIsWeb && (Platform.isAndroid || Platform.isIOS);

/// Where a notification wants the app to go.
///
/// The backend sends `data.url` as a web path (`/dashboard/my-crops`). The
/// app's routes do not match those, so they are mapped here rather than
/// pushing a path that would 404 into a blank screen.
String? routeForPayload(Map<String, dynamic> data) {
  final raw = data['url'];
  if (raw is! String || raw.trim().isEmpty) return null;

  final url = raw.trim();
  return switch (url) {
    _ when url.contains('my-crops') || url.contains('crop') => '/advisory',
    _ when url.contains('weather') => '/weather',
    _ when url.contains('mandi') || url.contains('price') => '/insights',
    _ when url.contains('disease') || url.contains('diagnose') => '/diagnose',
    _ when url.contains('community') => '/community',
    // An unrecognised destination opens the app rather than guessing.
    _ => null,
  };
}

class PushService {
  PushService(this._dio);

  final Dio _dio;

  StreamSubscription<String>? _refresh;
  String? _lastRegistered;

  /// Route a tapped notification asked for, waiting to be consumed once the
  /// router exists.
  String? pendingRoute;

  /// Asks for permission, then registers the token with the backend.
  ///
  /// Safe to call more than once: the same token is not re-sent.
  Future<void> start() async {
    if (!pushSupported) return;

    try {
      await Firebase.initializeApp();

      final messaging = FirebaseMessaging.instance;

      // Android 13+ needs this at runtime; below that it is granted already.
      final settings = await messaging.requestPermission();
      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        // A farmer who said no is not asked again on every launch.
        return;
      }

      final token = await messaging.getToken();
      if (token != null) await _register(token);

      // Tokens rotate — on reinstall, restore, or when Firebase decides to.
      // Without this the backend keeps sending to a dead token forever.
      _refresh ??= messaging.onTokenRefresh.listen(_register);

      // Opened from a notification while the app was already running.
      FirebaseMessaging.onMessageOpenedApp.listen((message) {
        pendingRoute = routeForPayload(message.data);
      });

      // Opened from a notification that launched the app from cold.
      final initial = await messaging.getInitialMessage();
      if (initial != null) pendingRoute = routeForPayload(initial.data);
    } catch (error, stack) {
      // Push is an extra. A misconfigured Firebase project must never stop
      // someone from using the app.
      debugPrint('Push setup failed: $error\n$stack');
    }
  }

  Future<void> _register(String token) async {
    if (token == _lastRegistered) return;

    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/notifications/register-token',
        data: {'token': token},
      );
      _lastRegistered = token;
    } on DioException catch (error) {
      // 401 here just means the token arrived before sign-in finished; the
      // next start() call after signing in will register it.
      debugPrint('Token registration failed: ${error.response?.statusCode}');
    }
  }

  void dispose() {
    _refresh?.cancel();
    _refresh = null;
  }
}

final pushServiceProvider = Provider<PushService>((ref) {
  final service = PushService(ref.watch(dioProvider));
  ref.onDispose(service.dispose);
  return service;
});
