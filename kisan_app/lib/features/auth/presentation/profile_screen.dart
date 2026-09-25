import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale_controller.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/auth_controller.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final user = ref.watch(currentUserProvider);
    final locale = ref.watch(localeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.authProfile),
        actions: [
          if (user != null)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: l10n.profileEdit,
              onPressed: () => _EditProfileSheet.open(context, user),
            ),
        ],
      ),
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

/// Edits the five profile fields the API allows.
///
/// Deliberately the same five as onboarding — name, mobile, village, district
/// and main crop. Identity fields (email, username, password) are not editable
/// through this route, so they are not offered here either.
class _EditProfileSheet extends ConsumerStatefulWidget {
  const _EditProfileSheet({required this.user});

  final AppUser user;

  static Future<void> open(BuildContext context, AppUser user) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _EditProfileSheet(user: user),
    );
  }

  @override
  ConsumerState<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends ConsumerState<_EditProfileSheet> {
  late final _name = TextEditingController(text: widget.user.name);
  late final _mobile = TextEditingController(text: widget.user.mobile ?? '');
  late final _village = TextEditingController(text: widget.user.village ?? '');
  late final _district = TextEditingController(
    text: widget.user.district ?? '',
  );
  late final _crop = TextEditingController(text: widget.user.mainCrop ?? '');

  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [_name, _mobile, _village, _district, _crop]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });

    // Only non-empty values are sent: the route ignores blanks, and clearing a
    // field is not something this form offers.
    final fields = <String, String>{
      for (final entry in {
        'name': _name,
        'mobile': _mobile,
        'village': _village,
        'district': _district,
        'mainCrop': _crop,
      }.entries)
        if (entry.value.text.trim().isNotEmpty)
          entry.key: entry.value.text.trim(),
    };

    try {
      final updated = await ref
          .read(authRepositoryProvider)
          .updateProfile(fields);
      ref.read(authControllerProvider.notifier).updateUser(updated);

      if (!mounted) return;
      final saved = L10n.of(context).profileSaved;
      final messenger = ScaffoldMessenger.of(context);
      Navigator.of(context).pop();
      messenger.showSnackBar(SnackBar(content: Text(saved)));
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      setState(() {
        _error = switch (error.kind) {
          ApiErrorKind.offline => l10n.appOffline,
          ApiErrorKind.timeout => l10n.appSlow,
          _ => l10n.appError,
        };
      });
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.profileEdit,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _name,
                decoration: InputDecoration(labelText: l10n.onboardName),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _mobile,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: l10n.onboardMobile),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _village,
                decoration: InputDecoration(labelText: l10n.onboardVillage),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _district,
                decoration: InputDecoration(labelText: l10n.onboardDistrict),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _crop,
                decoration: InputDecoration(labelText: l10n.onboardMainCrop),
              ),

              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(
                  _error!,
                  style: Theme.of(context).textTheme.bodyLarge
                      ?.copyWith(color: AppColors.danger),
                ),
              ],

              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : _save,
                child: Text(_saving ? l10n.farmSaving : l10n.farmSave),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
