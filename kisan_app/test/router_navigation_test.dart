import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/app/router.dart';
import 'package:kisan_app/core/offline/offline_store.dart';
import 'package:kisan_app/core/offline/write_queue.dart';
import 'package:kisan_app/features/auth/data/auth_controller.dart';
import 'package:kisan_app/features/auth/data/auth_models.dart';
import 'package:kisan_app/app/locale_controller.dart';
import 'package:kisan_app/l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// A farmer with a complete profile — nothing that should trigger onboarding.
const _completeUser = AppUser(
  id: 'u1',
  name: 'Khush Patel',
  username: 'khush',
  village: 'Visnagar',
  district: 'Mehsana',
  mainCrop: 'Cotton',
);

/// A Google sign-up before the farm details are filled in.
const _incompleteUser = AppUser(id: 'u2', name: 'New Farmer');

class _FakeAuth extends AuthController {
  _FakeAuth(this._state);

  final AuthState _state;

  @override
  AuthState build() => _state;
}

Future<ProviderContainer> _pump(WidgetTester tester, AuthState auth) async {
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();

  final container = ProviderContainer(
    overrides: [
      authControllerProvider.overrideWith(() => _FakeAuth(auth)),
      offlineStoreProvider.overrideWithValue(OfflineStore(prefs)),
      writeQueueProvider.overrideWith((ref) => buildWriteQueue(prefs, ref)),
    ],
  );
  addTearDown(container.dispose);

  final router = container.read(routerProvider);

  await tester.pumpWidget(
    UncontrolledProviderScope(
      container: container,
      child: MaterialApp.router(
        routerConfig: router,
        supportedLocales: supportedLocales,
        localizationsDelegates: const [
          L10n.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
      ),
    ),
  );
  await tester.pump();
  return container;
}

String _where(ProviderContainer container) =>
    container.read(routerProvider).routerDelegate.currentConfiguration.uri.path;

void main() {
  group('a signed-in farmer with a complete profile', () {
    testWidgets('stays on every More destination it navigates to', (
      tester,
    ) async {
      final container = await _pump(tester, const SignedIn(_completeUser));
      final router = container.read(routerProvider);

      // Every path the More screen offers. Landing back on /home for any of
      // these is the bug this test exists for.
      const destinations = [
        '/products',
        '/profile',
        '/community',
        '/weather',
        '/fertilizer',
        '/schemes',
        '/advisory',
      ];

      for (final path in destinations) {
        router.go(path);
        await tester.pump();
        await tester.pump(const Duration(milliseconds: 50));

        expect(
          _where(container),
          path,
          reason: 'navigating to $path ended up at ${_where(container)}',
        );
      }
    });
  });

  group('which tab is lit', () {
    test('a bar destination lights itself', () {
      expect(tabIndexFor('/home'), 0);
      expect(tabIndexFor('/farm'), 1);
      expect(tabIndexFor('/diagnose'), 2);
      expect(tabIndexFor('/insights'), 3);
    });

    test('the bar holds only the four daily actions', () {
      // The fifth slot used to be a "More" list of links. Spending a fifth of
      // the bar on a menu left the things a farmer opens every day crowded.
      expect(tabIndexFor('/insights'), 3);
      expect(tabIndexFor('/more'), isNull);
    });

    test('a drawer screen lights nothing', () {
      // Null rather than Home. Lighting a tab the farmer is not on is what
      // made this look like the app was bouncing them to the dashboard.
      const fromDrawer = [
        '/products',
        '/profile',
        '/weather',
        '/fertilizer',
        '/schemes',
        '/advisory',
        '/ask',
        '/scan',
      ];

      for (final path in fromDrawer) {
        expect(
          tabIndexFor(path),
          isNull,
          reason: '$path lit tab ${tabIndexFor(path)}',
        );
      }
    });

    test('an unknown path lights nothing rather than guessing', () {
      expect(tabIndexFor('/nowhere'), isNull);
      expect(tabIndexFor(''), isNull);
    });

    test('a sub-path of a bar destination keeps its tab', () {
      expect(tabIndexFor('/farm/field/1'), 1);
    });

    test('a sub-path of a drawer screen still lights nothing', () {
      expect(tabIndexFor('/products/abc123'), isNull);
    });

    test('community is a bar destination now, not a drawer link', () {
      // It moved into the bar in the redesign: the feed is what brings a
      // farmer back on a day when nothing is due on their own field.
      expect(tabIndexFor('/community'), 4);
      expect(tabIndexFor('/community/abc123'), 4);
    });

    test('the raised destination is still an ordinary tab index', () {
      // The scan button is drawn differently, but it is tab 2 like any
      // other — nothing about the layout changes which tab is lit.
      expect(tabIndexFor('/diagnose'), 2);
    });
  });

  group('a profile that is not filled in yet', () {
    testWidgets('is sent to onboarding from anywhere', (tester) async {
      // If a farmer's village or district is blank, needsOnboarding is true
      // and nothing else in the app is reachable until it is filled in.
      final container = await _pump(tester, const SignedIn(_incompleteUser));
      final router = container.read(routerProvider);

      router.go('/products');
      await tester.pump();

      expect(_where(container), '/onboarding');
    });
  });

  group('signed out', () {
    testWidgets('every route lands on login', (tester) async {
      final container = await _pump(tester, const SignedOut());
      final router = container.read(routerProvider);

      router.go('/products');
      await tester.pump();

      expect(_where(container), '/login');
    });
  });

  group('needsOnboarding', () {
    test('is true when the village is missing', () {
      expect(
        const AppUser(id: '1', name: 'A', district: 'Mehsana').needsOnboarding,
        isTrue,
      );
    });

    test('is true when the district is missing', () {
      expect(
        const AppUser(id: '1', name: 'A', village: 'Visnagar').needsOnboarding,
        isTrue,
      );
    });

    test('is true when either is present but empty', () {
      expect(
        const AppUser(
          id: '1',
          name: 'A',
          village: '',
          district: 'Mehsana',
        ).needsOnboarding,
        isTrue,
      );
    });

    test('is false only when both are filled in', () {
      expect(_completeUser.needsOnboarding, isFalse);
    });
  });
}
