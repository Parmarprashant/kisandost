import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/notifications/data/push_service.dart';

void main() {
  group('routeForPayload', () {
    test('sends a crop advisory to the advisory screen', () {
      // What the advisory cron actually puts in data.url.
      expect(routeForPayload({'url': '/dashboard/my-crops'}), '/advisory');
    });

    test('maps the other web paths the backend sends', () {
      expect(routeForPayload({'url': '/dashboard/weather'}), '/weather');
      expect(routeForPayload({'url': '/dashboard/mandi-prices'}), '/insights');
      expect(routeForPayload({'url': '/dashboard/diagnose'}), '/diagnose');
      expect(routeForPayload({'url': '/community'}), '/community');
    });

    test('tolerates surrounding whitespace', () {
      expect(routeForPayload({'url': '  /dashboard/my-crops  '}), '/advisory');
    });

    test('returns null for a destination the app has no screen for', () {
      // Opening the app is the right outcome. Pushing an unmapped web path
      // into go_router would land on a blank error screen.
      expect(routeForPayload({'url': '/pricing'}), isNull);
      expect(routeForPayload({'url': '/some/new/page'}), isNull);
    });

    test('returns null when there is no url at all', () {
      expect(routeForPayload(const {}), isNull);
      expect(routeForPayload({'url': ''}), isNull);
      expect(routeForPayload({'url': '   '}), isNull);
    });

    test('returns null when url is not a string', () {
      // Every value in an FCM data payload arrives as a string in practice,
      // but a malformed one must not crash the launch path.
      expect(routeForPayload({'url': 42}), isNull);
      expect(routeForPayload({'url': null}), isNull);
      expect(
        routeForPayload({
          'url': ['/a'],
        }),
        isNull,
      );
    });

    test('every mapped route is one the router actually serves', () {
      // Guards against a typo here sending someone to a dead path.
      const known = {
        '/advisory',
        '/weather',
        '/insights',
        '/diagnose',
        '/community',
      };

      for (final url in [
        '/dashboard/my-crops',
        '/dashboard/weather',
        '/dashboard/mandi-prices',
        '/dashboard/diagnose',
        '/community',
      ]) {
        final route = routeForPayload({'url': url});
        expect(route, isNotNull, reason: '$url mapped to nothing');
        expect(known, contains(route), reason: '$url mapped to $route');
      }
    });
  });

  group('pushSupported', () {
    test('is false on the desktop build the app is developed against', () {
      // Firebase Messaging has no Windows implementation. If this ever flips
      // true here, every launch would throw MissingPluginException.
      expect(pushSupported, isFalse);
    });
  });
}
