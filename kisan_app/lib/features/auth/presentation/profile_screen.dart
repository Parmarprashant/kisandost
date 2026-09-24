import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale_controller.dart';
import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../data/auth_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final user = ref.watch(currentUserProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.authProfile)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          if (user != null) ...[
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: AppColors.primaryContainer,
                  // A Google avatar may be missing or fail to load; initials
                  // are always available.
                  child: user.avatar != null && user.avatar!.isNotEmpty
                      ? ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: user.avatar!,
                            width: 64,
                            height: 64,
                            fit: BoxFit.cover,
                            errorWidget: (_, _, _) => _Initials(user.initials),
                          ),
                        )
                      : _Initials(user.initials),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      if (user.email != null && user.email!.isNotEmpty)
                        Text(
                          user.email!,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            if (user.village != null && user.village!.isNotEmpty)
              _Row(icon: Icons.home_outlined, label: user.village!),
            if (user.district != null && user.district!.isNotEmpty)
              _Row(icon: Icons.map_outlined, label: user.district!),
            if (user.mainCrop != null && user.mainCrop!.isNotEmpty)
              _Row(icon: Icons.grass_outlined, label: user.mainCrop!),
            if (user.mobile != null && user.mobile!.isNotEmpty)
              _Row(icon: Icons.phone_outlined, label: user.mobile!),
            const Divider(height: 40),
          ],

          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.language),
            title: Text(l10n.appLanguage),
            subtitle: Text(
              localeNames[locale.languageCode] ?? locale.languageCode,
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showLanguageSheet(context, ref),
          ),

          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () =>
                ref.read(authControllerProvider.notifier).signOut(),
            icon: const Icon(Icons.logout),
            label: Text(l10n.authSignOut),
          ),
        ],
      ),
    );
  }

  void _showLanguageSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) {
        final current = ref.read(localeProvider);
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              for (final locale in supportedLocales)
                ListTile(
                  title: Text(
                    localeNames[locale.languageCode] ?? locale.languageCode,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  trailing: locale == current
                      ? const Icon(Icons.check, color: AppColors.primary)
                      : null,
                  onTap: () {
                    ref.read(localeProvider.notifier).change(locale);
                    Navigator.of(sheetContext).pop();
                  },
                ),
            ],
          ),
        );
      },
    );
  }
}

class _Initials extends StatelessWidget {
  const _Initials(this.initials);

  final String initials;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        initials,
        style: Theme.of(context).textTheme.titleLarge
            ?.copyWith(color: AppColors.primary),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.muted),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}
