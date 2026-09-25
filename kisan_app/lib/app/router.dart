import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/offline/offline_banner.dart';
import 'shell/app_drawer.dart';
import '../features/advisory/presentation/advisory_screen.dart';
import '../features/assistant/presentation/assistant_screen.dart';
import '../features/scanner/presentation/scanner_screen.dart';
import '../features/auth/data/auth_controller.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/onboarding_screen.dart';
import '../features/auth/presentation/profile_screen.dart';
import '../features/community/presentation/community_screen.dart';
import '../features/diagnosis/presentation/diagnose_screen.dart';
import '../features/fertilizer/presentation/fertilizer_screen.dart';
import '../features/farm/presentation/crop_detail_screen.dart';
import '../features/farm/presentation/crop_encyclopedia_screen.dart';
import '../features/farm/presentation/district_suggestion_screen.dart';
import '../features/farm/presentation/farm_screen.dart';
import '../features/farm/presentation/field_boundary_editor_screen.dart';
import '../features/home/home_screen.dart';
import '../features/membership/presentation/pricing_screen.dart';
import '../features/predictions/presentation/insights_screen.dart';
import '../features/products/presentation/product_detail_screen.dart';
import '../features/products/presentation/products_screen.dart';
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
];

/// Screens reached from the drawer rather than the bottom bar.
///
/// They light no tab. Without this list they fall through to index 0 and
/// light Home, so someone on the products list is told they are on the
/// dashboard and taps Home to get back — which reads as the app throwing
/// them out.
const _drawerPaths = {
  '/community',
  '/weather',
  '/fertilizer',
  '/schemes',
  '/products',
  '/profile',
  '/advisory',
  '/ask',
  '/scan',
  '/crops',
  '/pricing',
  '/crop-suggestion',
  '/crops-guide',
  '/fields',
};

/// Which bottom-bar tab should be lit for [location], or null when none
/// should be.
///
/// Null is a real answer: a drawer screen belongs to no tab, and lighting one
/// anyway tells the farmer they are somewhere they are not.
///
/// Exposed for testing: the mapping is easy to break by adding a route and
/// forgetting the drawer set.
int? tabIndexFor(String location) {
  final direct = _tabs.indexWhere((t) => location == t.path);
  if (direct >= 0) return direct;

  if (_drawerPaths.any((p) => location.startsWith(p))) return null;

  final prefixed = _tabs.indexWhere((t) => location.startsWith(t.path));
  return prefixed < 0 ? null : prefixed;
}

/// Layout breakpoints.
///
/// A phone gets the bottom bar it has always had. A tablet held in two hands
/// has the bottom edge too far from the thumbs, so the destinations move to a
/// rail. A wide screen has room to keep the whole drawer open, which removes
/// a tap from every secondary screen.
const _railFrom = 640.0;
const _permanentDrawerFrom = 1100.0;

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
          GoRoute(path: '/insights', builder: (_, _) => const InsightsScreen()),
          GoRoute(
            path: '/community',
            builder: (_, _) => const CommunityScreen(),
          ),
          GoRoute(path: '/weather', builder: (_, _) => const WeatherScreen()),
          GoRoute(
            path: '/fertilizer',
            builder: (_, _) => const FertilizerScreen(),
          ),
          GoRoute(path: '/advisory', builder: (_, _) => const AdvisoryScreen()),
          GoRoute(path: '/ask', builder: (_, _) => const AssistantScreen()),
          GoRoute(path: '/scan', builder: (_, _) => const ScannerScreen()),
          GoRoute(path: '/schemes', builder: (_, _) => const SchemesScreen()),
          GoRoute(path: '/products', builder: (_, _) => const ProductsScreen()),
          GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
          GoRoute(
            path: '/crops/:id',
            builder: (_, state) =>
                CropDetailScreen(cropId: state.pathParameters['id'] ?? ''),
          ),
          GoRoute(path: '/pricing', builder: (_, _) => const PricingScreen()),
          GoRoute(
            path: '/products/:id',
            builder: (_, state) => ProductDetailScreen(
              productId: state.pathParameters['id'] ?? '',
            ),
          ),
          GoRoute(
            path: '/crop-suggestion',
            builder: (_, _) => const DistrictSuggestionScreen(),
          ),
          GoRoute(
            path: '/crops-guide',
            builder: (_, _) => const CropEncyclopediaScreen(),
          ),
          GoRoute(
            path: '/fields/:id/boundary',
            builder: (_, state) => FieldBoundaryEditorScreen(
              fieldId: state.pathParameters['id'] ?? '',
            ),
          ),
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

/// The chrome around every signed-in screen.
///
/// Three layouts from one set of destinations, chosen by width rather than by
/// platform: the same build runs on a phone, a tablet and a projector at a
/// demo, and the right one has to appear without anyone switching a flag.
class _AppShell extends StatelessWidget {
  const _AppShell({required this.location, required this.child});

  final String location;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;

    if (width >= _permanentDrawerFrom) return _WideLayout(child: child);
    if (width >= _railFrom) {
      return _RailLayout(location: location, child: child);
    }
    return _PhoneLayout(location: location, child: child);
  }
}

/// Phone: the bottom bar, where a thumb already is.
class _PhoneLayout extends StatelessWidget {
  const _PhoneLayout({required this.location, required this.child});

  final String location;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final index = tabIndexFor(location);

    return Scaffold(
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        // A drawer screen lights no tab. NavigationBar has no "none", so the
        // bar is hidden there rather than lying about where the farmer is.
        selectedIndex: index ?? 0,
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

/// Tablet: a rail. The bottom edge of a held tablet is nowhere near a thumb.
class _RailLayout extends StatelessWidget {
  const _RailLayout({required this.location, required this.child});

  final String location;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final index = tabIndexFor(location);

    return Scaffold(
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: Row(
              children: [
                NavigationRail(
                  selectedIndex: index,
                  labelType: NavigationRailLabelType.all,
                  onDestinationSelected: (i) => context.go(_tabs[i].path),
                  destinations: [
                    for (final tab in _tabs)
                      NavigationRailDestination(
                        icon: Icon(tab.icon),
                        selectedIcon: Icon(tab.activeIcon),
                        label: Text(tab.label(l10n)),
                      ),
                  ],
                ),
                const VerticalDivider(width: 1),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Wide: the drawer stays open, so nothing is a tap behind a hamburger.
///
/// The content is held to a readable column rather than stretched across a
/// desk-width monitor — a line of Gujarati 2000 pixels wide is unreadable.
class _WideLayout extends StatelessWidget {
  const _WideLayout({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: Row(
              children: [
                const AppDrawer(permanent: true),
                const VerticalDivider(width: 1),
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 900),
                      child: child,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
