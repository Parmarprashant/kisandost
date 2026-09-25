import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale_controller.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../data/auth_controller.dart';
import '../data/auth_models.dart';
import '../data/auth_repository.dart';

/// Profile & settings screen matching Profile.dc.html.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = ref.watch(currentUserProvider);
    final locale = ref.watch(localeProvider);
    final crops = ref.watch(activeCropsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.paper,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.lineDark : AppColors.line,
                  ),
                ),
              ),
              child: Row(
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).maybePop(),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.sunkDark : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark ? AppColors.lineDark : AppColors.line,
                        ),
                      ),
                      child: Icon(
                        Icons.arrow_back,
                        size: 20,
                        color: isDark ? AppColors.inkDark : AppColors.ink,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    l10n.authProfile,
                    style: TextStyle(
                      fontFamily: AppTheme.displayFamily,
                      fontSize: 21,
                      fontWeight: FontWeight.w600,
                      height: 1.15,
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),
                ],
              ),
            ),

            // Scrollable Body
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 24),
                children: [
                  // User Identity Card
                  if (user != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.surfaceDark
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? AppColors.lineDark : AppColors.line,
                        ),
                      ),
                      child: Row(
                        children: [
                          // Initials Avatar
                          Container(
                            width: 54,
                            height: 54,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.forestTintDark
                                  : AppColors.forestTint,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isDark
                                    ? AppColors.forestLineDark
                                    : AppColors.forestLine,
                              ),
                            ),
                            child:
                                user.avatar != null && user.avatar!.isNotEmpty
                                ? ClipOval(
                                    child: CachedNetworkImage(
                                      imageUrl: user.avatar!,
                                      width: 54,
                                      height: 54,
                                      fit: BoxFit.cover,
                                      errorWidget: (_, _, _) =>
                                          _InitialsWidget(user.initials),
                                    ),
                                  )
                                : _InitialsWidget(user.initials),
                          ),
                          const SizedBox(width: 13),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user.name,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.inkDark
                                        : AppColors.ink,
                                  ),
                                ),
                                const SizedBox(height: 1),
                                Text(
                                  [
                                    if (user.village != null &&
                                        user.village!.isNotEmpty)
                                      user.village!,
                                    if (user.district != null &&
                                        user.district!.isNotEmpty)
                                      user.district!,
                                  ].join(', '),
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isDark
                                        ? AppColors.ink3Dark
                                        : AppColors.ink3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          InkWell(
                            onTap: () => _EditProfileSheet.open(context, user),
                            child: Text(
                              l10n.profileEdit,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? AppColors.terracottaDark
                                    : AppColors.terracottaText,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Stats Row (Fields / Scans / Estimates)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Row(
                      children: [
                        _StatCard(
                          value: '${crops.length}',
                          label: 'Fields',
                          isDark: isDark,
                        ),
                        const SizedBox(width: 10),
                        _StatCard(value: '—', label: 'Scans', isDark: isDark),
                        const SizedBox(width: 10),
                        _StatCard(
                          value: '—',
                          label: 'Estimates',
                          isDark: isDark,
                        ),
                      ],
                    ),
                  ),

                  // HOW WE REACH YOU
                  _SectionLabel(l10n.profileHowWeReachYou, isDark: isDark),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceDark : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppColors.lineDark : AppColors.line,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: [
                        _ToggleRow(
                          title: l10n.profileDailySms,
                          subtitle: l10n.profileDailySmsSub,
                          value: true,
                          isDark: isDark,
                          hasBorder: true,
                        ),
                        _ToggleRow(
                          title: l10n.profilePushNotifs,
                          subtitle: l10n.profilePushNotifsSub,
                          value: true,
                          isDark: isDark,
                          hasBorder: true,
                        ),
                        _ToggleRow(
                          title: l10n.profileCommunityReplies,
                          subtitle: l10n.profileCommunityRepliesSub,
                          value: false,
                          isDark: isDark,
                          hasBorder: false,
                        ),
                      ],
                    ),
                  ),

                  // THE APP
                  _SectionLabel(l10n.profileTheApp, isDark: isDark),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceDark : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppColors.lineDark : AppColors.line,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: [
                        // Language
                        InkWell(
                          onTap: () => _showLanguageSheet(context, ref),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 14,
                            ),
                            decoration: BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                  color: isDark
                                      ? AppColors.sunkDark
                                      : AppColors.sunk,
                                ),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.language,
                                  size: 20,
                                  color: isDark
                                      ? AppColors.ink2Dark
                                      : AppColors.ink2,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    l10n.appLanguage,
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w500,
                                      color: isDark
                                          ? AppColors.inkDark
                                          : AppColors.ink,
                                    ),
                                  ),
                                ),
                                Text(
                                  localeNames[locale.languageCode] ??
                                      locale.languageCode,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: isDark
                                        ? AppColors.ink3Dark
                                        : AppColors.ink3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Saved offline
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: isDark
                                    ? AppColors.sunkDark
                                    : AppColors.sunk,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.wifi_off,
                                size: 20,
                                color: isDark
                                    ? AppColors.ink2Dark
                                    : AppColors.ink2,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      l10n.profileSavedOffline,
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w500,
                                        color: isDark
                                            ? AppColors.inkDark
                                            : AppColors.ink,
                                      ),
                                    ),
                                    Text(
                                      l10n.profileSavedOfflineSub,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: isDark
                                            ? AppColors.ink3Dark
                                            : AppColors.ink3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Home screen widget
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: isDark
                                    ? AppColors.sunkDark
                                    : AppColors.sunk,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.widgets_outlined,
                                size: 20,
                                color: isDark
                                    ? AppColors.ink2Dark
                                    : AppColors.ink2,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                l10n.profileAddWidget,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: isDark
                                      ? AppColors.inkDark
                                      : AppColors.ink,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Sign out
                        InkWell(
                          onTap: () => ref
                              .read(authControllerProvider.notifier)
                              .signOut(),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 14,
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.logout,
                                  size: 20,
                                  color: isDark
                                      ? AppColors.dangerDark
                                      : AppColors.danger,
                                ),
                                const SizedBox(width: 12),
                                Text(
                                  l10n.authSignOut,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w500,
                                    color: isDark
                                        ? AppColors.dangerDark
                                        : AppColors.danger,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Privacy Note
                  Container(
                    margin: const EdgeInsets.only(top: 16),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.sunkDark : AppColors.sunk,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark ? AppColors.lineDark : AppColors.line,
                      ),
                    ),
                    child: Text(
                      l10n.profilePrivacyNote,
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.55,
                        color: isDark ? AppColors.ink2Dark : AppColors.ink2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageSheet(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
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
                    style: TextStyle(
                      fontSize: 15,
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),
                  trailing: locale == current
                      ? Icon(
                          Icons.check,
                          color: isDark
                              ? AppColors.forestDark
                              : AppColors.forest,
                        )
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

class _InitialsWidget extends StatelessWidget {
  const _InitialsWidget(this.initials);
  final String initials;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        initials,
        style: const TextStyle(
          fontSize: 19,
          fontWeight: FontWeight.w700,
          color: AppColors.forest,
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.value,
    required this.label,
    required this.isDark,
  });
  final String value;
  final String label;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 13, 14, 13),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceDark : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppColors.lineDark : AppColors.line,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: TextStyle(
                fontFamily: AppTheme.displayFamily,
                fontSize: 25,
                fontWeight: FontWeight.w600,
                height: 1,
                color: isDark ? AppColors.inkDark : AppColors.ink,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isDark ? AppColors.ink3Dark : AppColors.ink3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label, {required this.isDark});
  final String label;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 18, bottom: 10),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: isDark ? AppColors.ink3Dark : AppColors.ink3,
        ),
      ),
    );
  }
}

class _ToggleRow extends StatefulWidget {
  const _ToggleRow({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.isDark,
    required this.hasBorder,
  });
  final String title;
  final String subtitle;
  final bool value;
  final bool isDark;
  final bool hasBorder;

  @override
  State<_ToggleRow> createState() => _ToggleRowState();
}

class _ToggleRowState extends State<_ToggleRow> {
  late bool _on;

  @override
  void initState() {
    super.initState();
    _on = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        border: widget.hasBorder
            ? Border(
                bottom: BorderSide(
                  color: widget.isDark ? AppColors.sunkDark : AppColors.sunk,
                ),
              )
            : null,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: widget.isDark ? AppColors.inkDark : AppColors.ink,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  widget.subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: widget.isDark ? AppColors.ink3Dark : AppColors.ink3,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: () => setState(() => _on = !_on),
            child: Container(
              width: 48,
              height: 28,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                color: _on
                    ? (widget.isDark ? AppColors.forestDark : AppColors.forest)
                    : (widget.isDark
                          ? AppColors.lineDark
                          : AppColors.lineStrong),
              ),
              child: AnimatedAlign(
                alignment: _on ? Alignment.centerRight : Alignment.centerLeft,
                duration: const Duration(milliseconds: 200),
                child: Container(
                  margin: const EdgeInsets.all(3),
                  width: 22,
                  height: 22,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Edits the five profile fields the API allows.
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
