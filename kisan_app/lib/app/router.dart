import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/home/home_screen.dart';
import '../features/shared/placeholder_screen.dart';
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

final router = GoRouter(
  initialLocation: '/home',
  routes: [
    ShellRoute(
      builder: (context, state, child) =>
          _AppShell(location: state.uri.path, child: child),
      routes: [
        GoRoute(path: '/home', builder: (_, _) => const HomeScreen()),
        GoRoute(
          path: '/farm',
          builder: (context, _) => PlaceholderScreen(
            title: L10n.of(context).navFarm,
            icon: Icons.grass_outlined,
            note: 'P0-7 — fields, crops, add-field wizard',
          ),
        ),
        GoRoute(
          path: '/diagnose',
          builder: (context, _) => PlaceholderScreen(
            title: L10n.of(context).navDiagnose,
            icon: Icons.camera_alt_outlined,
            note: 'P0-4 — camera → AgriVision → diagnosis',
          ),
        ),
        GoRoute(
          path: '/insights',
          builder: (context, _) => PlaceholderScreen(
            title: L10n.of(context).navInsights,
            icon: Icons.insights_outlined,
            note: 'P0-6 mandi prices · P1-1/P1-2 predictors',
          ),
        ),
        GoRoute(
          path: '/more',
          builder: (context, _) => PlaceholderScreen(
            title: L10n.of(context).navMore,
            icon: Icons.apps_outlined,
            note: 'P0-9 community · P1-4 schemes · P1-5 products',
          ),
        ),
      ],
    ),
  ],
);

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
