import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_colors.dart';

/// The one thing a farmer can always reach.
///
/// Every other feature needs them to know it exists and where it lives. This
/// does not: whatever screen they are on, whatever they were trying to do,
/// they can ask in their own words. It follows them so nobody has to learn
/// the navigation before they can get help.
///
/// Sized above the usual 56dp because it is pressed with a working hand,
/// often in sunlight, sometimes through the corner of a screen protector.
class AskFab extends StatelessWidget {
  const AskFab({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return FloatingActionButton(
      heroTag: 'kisandost-ask',
      onPressed: () => context.push('/ask'),
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      tooltip: l10n.aiTitle,
      child: const Icon(Icons.forum_rounded, size: 28),
    );
  }
}

/// Places [AskFab] alongside a screen's own floating button.
///
/// A screen that already has one — Farm's "add field", Community's "ask
/// farmers" — keeps it as the primary action; asking sits above it, smaller
/// in emphasis but never absent.
class FabColumn extends StatelessWidget {
  const FabColumn({super.key, this.primary});

  final Widget? primary;

  @override
  Widget build(BuildContext context) {
    if (primary == null) return const AskFab();

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [const AskFab(), const SizedBox(height: 12), primary!],
    );
  }
}
