import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/data/auth_controller.dart';
import '../../features/auth/data/auth_models.dart';
import '../../l10n/app_localizations.dart';
import '../../features/advisory/data/advisory_repository.dart';
import '../locale_controller.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
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
            trailing: _badgeFor(context, ref, destination.route),
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
        trailing: Text(
          localeNames[ref.watch(localeProvider).languageCode] ?? '',
          style: Theme.of(context).textTheme.bodySmall,
        ),
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

/// What a drawer row is worth reading before tapping it.
///
/// Only rows with something genuinely waiting get a badge. A count that is
/// always present stops being a signal, so "nothing due" renders nothing at
/// all rather than a zero.
Widget? _badgeFor(BuildContext context, WidgetRef ref, String route) {
  if (route != '/advisory') return null;

  final due = ref
      .watch(cropTimelinesProvider)
      .where((entry) => entry.timeline.current != null)
      .length;
  if (due == 0) return null;

  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(
      color: isDark ? AppColors.dangerTintDark : AppColors.dangerTint,
      borderRadius: BorderRadius.circular(AppTheme.radiusChip),
      border: Border.all(
        color: isDark ? AppColors.dangerLineDark : AppColors.dangerLine,
      ),
    ),
    child: Text(
      '$due',
      style: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: isDark ? AppColors.dangerDark : AppColors.danger,
      ),
    ),
  );
}

class _Header extends StatelessWidget {
  const _Header({required this.user, required this.onTap});

  final AppUser? user;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final name = user?.name ?? l10n.authSignIn;

    // Where they farm, which is what makes the advice in this app theirs.
    final place = [
      user?.village,
      user?.district,
    ].whereType<String>().where((s) => s.trim().isNotEmpty).join(', ');

    // The one solid block of brand colour in the app. It earns it here: the
    // drawer is the only surface with no other anchor, and a farmer opening
    // it should land on who they are before reading a list of links.
    return Material(
      color: theme.colorScheme.primary,
      child: InkWell(
        onTap: onTap,
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 20, 14, 20),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.16),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.32),
                      width: 1.5,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    user?.initials ?? '?',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.onPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: theme.colorScheme.onPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (place.isNotEmpty) ...[
                        const SizedBox(height: 1),
                        Text(
                          place,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onPrimary
                                .withValues(alpha: 0.78),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: theme.colorScheme.onPrimary.withValues(alpha: 0.7),
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
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
      child: Text(text.toUpperCase(), style: AppTheme.eyebrow(context)),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.selected = false,
    this.trailing,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;

  /// A count, a temperature, the current language — the thing that makes the
  /// row worth reading before tapping it.
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final foreground = selected
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurface;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 1),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 11),
          decoration: BoxDecoration(
            color: selected
                ? theme.colorScheme.primaryContainer
                : Colors.transparent,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 21,
                color: selected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: foreground,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: 8),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
