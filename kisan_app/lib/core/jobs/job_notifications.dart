/// Telling the farmer a long job finished while they were elsewhere.
///
/// Diagnosis takes as long as the model takes — 10 to 45 seconds against a
/// cold Modal container. Standing still watching a spinner for that long is
/// not what someone does in a field, so they switch away, and without this
/// the answer they walked out to get arrives on a screen nobody is looking
/// at.
///
/// This is a LOCAL notification: the phone posts it to itself when the work
/// finishes. Nothing is sent to a server and no push token is involved — it
/// has nothing to do with the FCM advisories.
library;

import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Whether this build can post one.
///
/// Android and iOS only. The desktop build the app is developed against has
/// no implementation worth wiring, and a failure here must never be allowed
/// to break the job it was reporting on.
bool get jobNotificationsSupported =>
    !kIsWeb && (Platform.isAndroid || Platform.isIOS);

/// Where tapping the notification should take them.
///
/// Read by the app shell once, on resume, and then cleared.
final pendingJobRouteProvider = NotifierProvider<PendingJobRoute, String?>(
  PendingJobRoute.new,
);

class PendingJobRoute extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String route) => state = route;

  /// Cleared as soon as it is acted on, so a second resume does not navigate
  /// again to a screen the farmer has already left.
  void clear() => state = null;
}

class JobNotifications {
  JobNotifications(this._ref);

  final Ref _ref;

  final _plugin = FlutterLocalNotificationsPlugin();
  bool _ready = false;

  /// Its own channel so a farmer can silence advisory pushes without losing
  /// the answer to something they asked for.
  static const _channel = AndroidNotificationChannel(
    'kisan_jobs',
    'Finished work',
    description: 'Tells you when a scan or estimate you started has finished.',
    importance: Importance.high,
  );

  Future<bool> _ensureReady() async {
    if (_ready) return true;
    if (!jobNotificationsSupported) return false;

    try {
      await _plugin.initialize(
        settings: const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
          iOS: DarwinInitializationSettings(
            // The job already asked for permission through Firebase; asking
            // again here would show a second prompt for the same thing.
            requestAlertPermission: false,
            requestBadgePermission: false,
            requestSoundPermission: false,
          ),
        ),
        onDidReceiveNotificationResponse: (response) {
          final route = response.payload;
          if (route != null && route.isNotEmpty) {
            _ref.read(pendingJobRouteProvider.notifier).set(route);
          }
        },
      );

      if (Platform.isAndroid) {
        await _plugin
            .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin
            >()
            ?.createNotificationChannel(_channel);
      }

      _ready = true;
      return true;
    } catch (error) {
      debugPrint('Local notifications unavailable: $error');
      return false;
    }
  }

  /// Posts a "this finished" notification.
  ///
  /// [route] is where a tap should land. Never throws: a farmer who denied
  /// notifications still gets their result on screen.
  Future<void> jobFinished({
    required int id,
    required String title,
    required String body,
    required String route,
  }) async {
    if (!await _ensureReady()) return;

    try {
      await _plugin.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: NotificationDetails(
          android: AndroidNotificationDetails(
            _channel.id,
            _channel.name,
            channelDescription: _channel.description,
            importance: Importance.high,
            priority: Priority.high,
            // The body is a sentence, not a label, and a farmer reading a
            // disease name should not have to expand the notification.
            styleInformation: BigTextStyleInformation(body),
          ),
          iOS: const DarwinNotificationDetails(),
        ),
        payload: route,
      );
    } catch (error) {
      debugPrint('Could not post job notification: $error');
    }
  }

  /// Clears one, so a result the farmer has already seen does not sit in the
  /// shade afterwards.
  Future<void> dismiss(int id) async {
    if (!_ready) return;
    try {
      await _plugin.cancel(id: id);
    } catch (_) {
      // Nothing to do; a stale notification is not worth an error.
    }
  }
}

final jobNotificationsProvider = Provider<JobNotifications>(
  (ref) => JobNotifications(ref),
);

/// Notification ids, fixed so a second run replaces the first rather than
/// stacking two answers for the same photo.
class JobIds {
  const JobIds._();

  static const diagnosis = 1001;
}
