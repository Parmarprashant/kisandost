import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/jobs/app_visibility.dart';
import 'package:kisan_app/core/jobs/job_notifications.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('pending route from a tapped notification', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer();
      addTearDown(container.dispose);
    });

    test('starts with nothing pending', () {
      expect(container.read(pendingJobRouteProvider), isNull);
    });

    test('holds the route a notification carried', () {
      container.read(pendingJobRouteProvider.notifier).set('/diagnose');
      expect(container.read(pendingJobRouteProvider), '/diagnose');
    });

    test('is cleared once acted on', () {
      // Otherwise a second resume navigates again to a screen the farmer has
      // already left.
      final notifier = container.read(pendingJobRouteProvider.notifier);
      notifier.set('/diagnose');
      notifier.clear();

      expect(container.read(pendingJobRouteProvider), isNull);
    });
  });

  group('app visibility', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer();
      addTearDown(container.dispose);
    });

    test('assumes the app is visible until told otherwise', () {
      // Guessing "backgrounded" would buzz the phone about a result already
      // on screen.
      expect(container.read(appForegroundProvider), isTrue);
    });

    test('paused and detached count as backgrounded', () {
      final notifier = container.read(appForegroundProvider.notifier);

      notifier.didChangeAppLifecycleState(AppLifecycleState.paused);
      expect(container.read(appForegroundProvider), isFalse);

      notifier.didChangeAppLifecycleState(AppLifecycleState.detached);
      expect(container.read(appForegroundProvider), isFalse);
    });

    test('inactive still counts as visible', () {
      // A half-pulled notification shade or a call overlay makes the app
      // inactive while it is still on screen. Treating that as backgrounded
      // would notify someone staring at the answer.
      final notifier = container.read(appForegroundProvider.notifier);

      notifier.didChangeAppLifecycleState(AppLifecycleState.inactive);
      expect(container.read(appForegroundProvider), isTrue);
    });

    test('resuming brings it back', () {
      final notifier = container.read(appForegroundProvider.notifier);

      notifier.didChangeAppLifecycleState(AppLifecycleState.paused);
      notifier.didChangeAppLifecycleState(AppLifecycleState.resumed);

      expect(container.read(appForegroundProvider), isTrue);
    });

    test('hidden counts as backgrounded', () {
      final notifier = container.read(appForegroundProvider.notifier);
      notifier.didChangeAppLifecycleState(AppLifecycleState.hidden);
      expect(container.read(appForegroundProvider), isFalse);
    });
  });

  group('notification ids', () {
    test('diagnosis has a fixed id so a rerun replaces the old answer', () {
      // Two notifications for the same photo would leave a farmer choosing
      // between a stale result and a fresh one.
      expect(JobIds.diagnosis, isA<int>());
      expect(JobIds.diagnosis, greaterThan(0));
    });
  });

  group('platform support', () {
    test('is false on the desktop build the app is developed against', () {
      expect(jobNotificationsSupported, isFalse);
    });
  });
}
