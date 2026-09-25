import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import 'connectivity.dart';

/// A thin strip saying the phone has no signal.
///
/// Shown above the content rather than over it: a farmer who has lost signal
/// mid-task should still be able to read what is on screen.
class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(isOnlineProvider);
    if (online) return const SizedBox.shrink();

    final l10n = L10n.of(context);

    return Material(
      color: AppColors.secondary.withValues(alpha: 0.22),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Icon(Icons.cloud_off, size: 18, color: AppColors.muted),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.offlineBanner,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A note saying when the figures on screen were last fetched.
///
/// Used where a screen is showing cached data. Stale prices or an old
/// forecast are useful, but only if it is clear they are old — a two-day-old
/// mandi rate presented as today's is worse than no rate at all.
class CachedNotice extends StatelessWidget {
  const CachedNotice({super.key, required this.savedAt});

  final DateTime savedAt;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final age = DateTime.now().difference(savedAt);

    final when = switch (age) {
      _ when age.inMinutes < 2 => l10n.offlineJustNow,
      _ when age.inMinutes < 60 => l10n.offlineMinutes('${age.inMinutes}'),
      _ when age.inHours < 24 => l10n.offlineHours('${age.inHours}'),
      _ => l10n.offlineDays('${age.inDays}'),
    };

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: AppColors.secondary.withValues(alpha: 0.12),
      ),
      child: Text(
        l10n.offlineShowingSaved(when),
        style: Theme.of(context).textTheme.bodyLarge,
      ),
    );
  }
}
