import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/data/auth_controller.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/onboarding_screen.dart';
import '../features/auth/presentation/profile_screen.dart';
import '../features/community/presentation/community_screen.dart';
import '../features/diagnosis/presentation/diagnose_screen.dart';
import '../features/fertilizer/presentation/fertilizer_screen.dart';
import '../features/farm/presentation/farm_screen.dart';
import '../features/home/home_screen.dart';
import '../features/mandi/presentation/mandi_screen.dart';
import '../features/more/more_screen.dart';
import '../features/schemes/presentation/schemes_screen.dart';
import '../features/weather/presentation/weather_screen.dart';
import '../l10n/app_localizations.dart';

/// Five tabs, as laid out in `docs/mobile/DESIGN.md` §3.
///
/// Diagnose sits in the middle because it is the highest-value action and the
/// demo centrepiece — it gets the easiest thumb reach.
final _tabs = <_TabSpec>[
  _TabSpec('/home', Icons.home_outlined, Icons.home, (l) => l.navigation_home),
  _TabSpec('/farm', Icons.grass_outlined, Icons.grass, (l) => l.navFarm),
  _TabSpec(
    '/diagnose',
    Icons.camera_alt_outlined,
    Icons.camera_alt,
    (l) => l.navDiagnose,
  ),
  _TabSpec(
    '/insights',
    Icons.insights_outlined,
    Icons.insights,
    (l) => l.navInsights,
  ),
  _TabSpec('/more', Icons.apps_outlined, Icons.apps, (l) => l.navMore),
];

class _TabSpec {
  const _TabSpec(this.path, this.icon, this.activeIcon, this.label);

  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String Function(L10n) label;
}

/// Reachable without a session. Everything else redirects to the login screen.
const _publicPaths = {'/login', '/splash'};

/// Signed in, but the profile is not usable yet.
const _onboardingPath = '/onboarding';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/home',

    // Re-runs the redirect whenever auth state changes, so signing out drops
    // the user to the login screen without any screen having to navigate.
    refreshListenable: _AuthListenable(ref),

    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final path = state.uri.path;

      // Still looking for a stored session: hold on the splash rather than
      // flashing the login screen at someone who is already signed in.
      if (auth is AuthChecking) {
        return path == '/splash' ? null : '/splash';
      }

      if (auth is! SignedIn) {
        return path == '/login' ? null : '/login';
      }

      // A fresh Google sign-up has a name and an email but nothing about the
      // farm, so it is asked once before entering the shell.
      if (auth.user.needsOnboarding) {
        return path == _onboardingPath ? null : _onboardingPath;
      }

      // Signed in, profile complete, but sitting on a public or setup screen.
      if (_publicPaths.contains(path) || path == _onboardingPath) {
        return '/home';
      }

      return null;
    },

    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const _SplashScreen()),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(
        path: _onboardingPath,
        builder: (_, _) => const OnboardingScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) =>
            _AppShell(location: state.uri.path, child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, _) => const HomeScreen()),
          GoRoute(path: '/farm', builder: (_, _) => const FarmScreen()),
          GoRoute(path: '/diagnose', builder: (_, _) => const DiagnoseScreen()),
          GoRoute(path: '/insights', builder: (_, _) => const MandiScreen()),
          GoRoute(path: '/more', builder: (_, _) => const MoreScreen()),
          GoRoute(
            path: '/community',
            builder: (_, _) => const CommunityScreen(),
          ),
          GoRoute(path: '/weather', builder: (_, _) => const WeatherScreen()),
          GoRoute(
            path: '/fertilizer',
            builder: (_, _) => const FertilizerScreen(),
          ),
          GoRoute(path: '/schemes', builder: (_, _) => const SchemesScreen()),
          GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
        ],
      ),
    ],
  );
});

/// Bridges Riverpod's auth state to go_router's [Listenable] refresh hook.
class _AuthListenable extends ChangeNotifier {
  _AuthListenable(Ref ref) {
    ref.listen(authControllerProvider, (_, _) => notifyListeners());
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: CircularProgressIndicator()));
  }
}

class _AppShell extends StatelessWidget {
  const _AppShell({required this.location, required this.child});

  final String location;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final index = _tabs.indexWhere((t) => location.startsWith(t.path));

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: index < 0 ? 0 : index,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: [
          for (final tab in _tabs)
            NavigationDestination(
              icon: Icon(tab.icon),
              selectedIcon: Icon(tab.activeIcon),
              label: tab.label(l10n),
            ),
        ],
      ),
    );
  }
}
