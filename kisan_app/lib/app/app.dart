import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/jobs/app_visibility.dart';
import '../core/jobs/job_notifications.dart';
import '../core/offline/connectivity.dart';
import '../core/offline/write_queue.dart';
import '../features/auth/data/auth_controller.dart';
import '../features/notifications/data/push_service.dart';
import '../l10n/app_localizations.dart';
import 'locale_controller.dart';
import 'router.dart';
import 'theme/app_theme.dart';

class KisanApp extends ConsumerStatefulWidget {
  const KisanApp({super.key});

  @override
  ConsumerState<KisanApp> createState() => _KisanAppState();
}

class _KisanAppState extends ConsumerState<KisanApp> {
  @override
  Widget build(BuildContext context) {
    final locale = ref.watch(localeProvider);
    final router = ref.watch(routerProvider);

    // Registering a token needs a signed-in user, so this waits for sign-in
    // rather than running at launch. Signing out is left alone deliberately:
    // clearing the token server-side is the backend's job and there is no
    // route for it.
    // Keeps the lifecycle observer alive for the whole session. Without a
    // watcher it would be disposed, and a job finishing in the background
    // would think the app was still in front of the farmer.
    ref.watch(appForegroundProvider);

    // A tapped "your scan is ready" notification lands on the result.
    ref.listen(pendingJobRouteProvider, (_, route) {
      if (route == null || route.isEmpty) return;
      ref.read(pendingJobRouteProvider.notifier).clear();
      router.go(route);
    });

    // Anything written with no signal goes out the moment there is one.
    ref.listen(isOnlineProvider, (wasOnline, isOnline) {
      if (isOnline != true || wasOnline == true) return;
      ref.read(writeQueueProvider).flush();
    });

    ref.listen(authControllerProvider, (previous, next) {
      if (next is! SignedIn || previous is SignedIn) return;

      final push = ref.read(pushServiceProvider);
      push.start().then((_) {
        final route = push.pendingRoute;
        if (route == null) return;
        push.pendingRoute = null;
        // The router exists by now; a notification tap lands on the screen it
        // was about instead of the dashboard.
        router.go(route);
      });
    });

    return MaterialApp.router(
      title: 'KisanDost',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      // Light-only for now: the app is used outdoors in daylight, and dark
      // mode is an open question in DESIGN.md §11. The dark theme is built and
      // ready, so flipping this to ThemeMode.system is a one-line change.
      themeMode: ThemeMode.light,
      locale: locale,
      supportedLocales: supportedLocales,
      localizationsDelegates: const [
        L10n.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: router,
    );
  }
}
