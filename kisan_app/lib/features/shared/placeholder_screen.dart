import 'package:flutter/material.dart';

import '../../l10n/app_localizations.dart';

/// Stand-in for a screen that has a route and a nav slot but no implementation
/// yet. Named so it is obvious in a demo that the tab is intentional and
/// unfinished, rather than broken.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({
    required this.title,
    required this.icon,
    this.note,
    super.key,
  });

  final String title;
  final IconData icon;

  /// Which PRD item will fill this in, e.g. 'P0-4'. Shown in small text so the
  /// build order is visible while developing.
  final String? note;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 56,
                color: Theme.of(context).colorScheme.outline,
              ),
              const SizedBox(height: 16),
              Text(
                l10n.comingSoon,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              if (note != null) ...[
                const SizedBox(height: 8),
                Text(note!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
