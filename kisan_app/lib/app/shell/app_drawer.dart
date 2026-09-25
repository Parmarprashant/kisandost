import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/data/auth_controller.dart';
import '../../features/auth/data/auth_models.dart';
import '../../l10n/app_localizations.dart';
import '../theme/app_colors.dart';
import 'language_sheet.dart';

/// One destination in the drawer.
class DrawerDestination {
  const DrawerDestination(this.icon, this.route, this.label);

  final IconData icon;
  final String route;
  final String Function(L10n) label;
}

/// A titled run of destinations.
///
/// Eight items in one list is a wall. Grouped by what a farmer is trying to
/// do — get advice, use a tool, look something up — they can be scanned
/// without reading every line.
class DrawerGroup {
  const DrawerGroup(this.title, this.destinations);

  final String Function(L10n) title;
  final List<DrawerDestination> destinations;
}

final drawerGroups = <DrawerGroup>[
  DrawerGroup((l) => l.navGroupAdvice, [
    DrawerDestination(Icons.support_agent_outlined, '/ask', (l) => l.aiTitle),
    DrawerDestination(
      Icons.event_note_outlined,
      '/advisory',
      (l) => l.advisoryTitle,
    ),
    DrawerDestination(
      Icons.forum_outlined,
      '/community',
      (l) => l.communityTitle,
    ),
  ]),
  DrawerGroup((l) => l.navGroupTools, [
    DrawerDestination(
      Icons.cloud_outlined,
      '/weather',
      (l) => l.navigation_weather,
    ),
    DrawerDestination(
      Icons.science_outlined,
      '/fertilizer',
      (l) => l.fertTitle,
    ),
    DrawerDestination(Icons.qr_code_scanner, '/scan', (l) => l.scanTitle),
    DrawerDestination(
      Icons.psychology_outlined,
      '/crop-suggestion',
      (l) => 'District AI Advisor',
    ),
  ]),
  DrawerGroup((l) => l.navGroupReference, [
    DrawerDestination(
      Icons.account_balance_outlined,
      '/schemes',
      (l) => l.schemesTitle,
    ),
    DrawerDestination(
      Icons.shopping_bag_outlined,
      '/products',
      (l) => l.productsTitle,
    ),
    DrawerDestination(
      Icons.menu_book_outlined,
      '/crops-guide',
      (l) => 'Crop Reference Guide',
    ),
  ]),
];

/// The navigation drawer.
///
/// Replaces the old "More" tab. That tab spent a fifth of the bottom bar on a
/// list of links, and the four things a farmer opens daily had to share the
/// rest. The links live here; the bar is now only daily actions.
///
/// [permanent] renders it inline for a wide screen, without the Drawer
/// chrome or the tap-to-close behaviour a modal needs.
class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key, this.permanent = false});

  final bool permanent;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final user = ref.watch(currentUserProvider);
    final location = GoRouterState.of(context).uri.path;

    void go(String route) {
      // A modal drawer must close itself; a permanent one has nothing to
      // close and popping would take a screen with it.
      if (!permanent) Navigator.of(context).pop();
      if (route != location) context.push(route);
    }

    final children = <Widget>[
      _Header(user: user, onTap: () => go('/profile')),

      for (final group in drawerGroups) ...[
        _GroupLabel(group.title(l10n)),
        for (final destination in group.destinations)
          _Tile(
            icon: destination.icon,
            label: destination.label(l10n),
            selected: location == destination.route,
            onTap: () => go(destination.route),
          ),
        const SizedBox(height: 8),
      ],

      const Divider(height: 24, indent: 20, endIndent: 20),

      _Tile(
        icon: Icons.workspace_premium_outlined,
        label: 'KisanDost Premium',
        selected: location == '/pricing',
        onTap: () => go('/pricing'),
      ),
      _Tile(
        icon: Icons.language,
        label: l10n.appLanguage,
        onTap: () {
          if (!permanent) Navigator.of(context).pop();
          showLanguageSheet(context, ref);
        },
      ),
      _Tile(
        icon: Icons.person_outline,
        label: l10n.authProfile,
        selected: location == '/profile',
        onTap: () => go('/profile'),
      ),
      if (user != null)
        _Tile(
          icon: Icons.logout,
          label: l10n.authSignOut,
          onTap: () {
            if (!permanent) Navigator.of(context).pop();
            ref.read(authControllerProvider.notifier).signOut();
          },
        ),
      const SizedBox(height: 16),
    ];

    final body = ListView(padding: EdgeInsets.zero, children: children);

    if (permanent) {
      return SizedBox(
        width: 280,
        child: Material(
          color: Theme.of(context).colorScheme.surface,
          child: body,
        ),
      );
    }

    return Drawer(child: body);
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.user, required this.onTap});

  final AppUser? user;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final name = user?.name ?? l10n.authSignIn;

    // Where they farm, which is what makes the advice in this app theirs.
    final place = [
      user?.village,
      user?.district,
    ].whereType<String>().where((s) => s.trim().isNotEmpty).join(', ');

    return Material(
      color: AppColors.primaryContainer,
      child: InkWell(
        onTap: onTap,
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    user?.initials ?? '?',
                    style: text.titleMedium?.copyWith(color: Colors.white),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: text.titleMedium,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (place.isNotEmpty)
                        Text(
                          place,
                          style: text.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GroupLabel extends StatelessWidget {
  const _GroupLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(28, 16, 20, 8),
      child: Text(
        text.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall
            ?.copyWith(color: AppColors.muted, letterSpacing: 0.8),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.selected = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: ListTile(
        leading: Icon(
          icon,
          color: selected ? AppColors.primary : AppColors.muted,
        ),
        title: Text(
          label,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: selected ? AppColors.primary : null,
            fontWeight: selected ? FontWeight.w600 : null,
          ),
        ),
        selected: selected,
        selectedTileColor: AppColors.primaryContainer.withValues(alpha: 0.6),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        onTap: onTap,
      ),
    );
  }
}
