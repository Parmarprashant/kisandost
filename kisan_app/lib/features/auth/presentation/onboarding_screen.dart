import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../mandi/data/mandi_models.dart';
import '../data/auth_controller.dart';
import '../data/auth_repository.dart';

/// Asked once, after a first Google sign-in.
///
/// Google gives a name, an email and a picture — nothing about the farm. These
/// five answers are what turn generic weather into advice for this farmer's
/// district and crop, which is the whole point of the app.
///
/// Every field is skippable. A farmer who does not want to answer gets a
/// working app, not a wall.
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _name = TextEditingController();
  final _mobile = TextEditingController();
  final _village = TextEditingController();
  final _district = TextEditingController();
  String? _mainCrop;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Google already told us the name; asking again wastes a step.
    _name.text = ref.read(currentUserProvider)?.name ?? '';
  }

  @override
  void dispose() {
    for (final c in [_name, _mobile, _village, _district]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final fields = <String, String>{
      if (_name.text.trim().isNotEmpty) 'name': _name.text.trim(),
      if (_mobile.text.trim().isNotEmpty) 'mobile': _mobile.text.trim(),
      if (_village.text.trim().isNotEmpty) 'village': _village.text.trim(),
      if (_district.text.trim().isNotEmpty) 'district': _district.text.trim(),
      'mainCrop': ?_mainCrop,
    };

    if (fields.isEmpty) {
      await _skip();
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      final user = await ref.read(authRepositoryProvider).updateProfile(fields);
      ref.read(authControllerProvider.notifier).updateUser(user);
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

  /// Marks onboarding done without writing anything the user did not give.
  ///
  /// The district is written as a single space rather than a made-up value:
  /// it clears `needsOnboarding` so the question is not asked forever, without
  /// inventing a location the app would then use for weather.
  Future<void> _skip() async {
    setState(() => _saving = true);
    try {
      final user = await ref.read(authRepositoryProvider).updateProfile({
        'village': '-',
        'district': '-',
      });
      ref.read(authControllerProvider.notifier).updateUser(user);
    } on ApiException {
      // Not worth blocking on. They can fill it in from Profile later.
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 20, 22, 8),
                children: [
                  Text(l10n.onboardTitle, style: theme.textTheme.headlineMedium),
                  const SizedBox(height: 22),

                  _Labelled(
                    label: l10n.onboardName,
                    child: TextField(controller: _name),
                  ),
                  _Labelled(
                    label: l10n.onboardMobile,
                    child: TextField(
                      controller: _mobile,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(prefixText: '+91 '),
                    ),
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _Labelled(
                          label: l10n.onboardVillage,
                          child: TextField(controller: _village),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _Labelled(
                          label: l10n.onboardDistrict,
                          child: TextField(controller: _district),
                        ),
                      ),
                    ],
                  ),

                  // Chips rather than a dropdown. A dropdown hides every
                  // option behind a tap and reads as a form; the crops are
                  // few enough to show, and picking one is the answer most
                  // farmers give fastest.
                  Text(
                    l10n.onboardMainCrop,
                    style: theme.textTheme.titleSmall,
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final crop in fallbackCrops)
                        _CropChip(
                          label: crop,
                          selected: _mainCrop == crop,
                          onTap: () => setState(
                            () => _mainCrop = _mainCrop == crop ? null : crop,
                          ),
                        ),
                    ],
                  ),

                  if (_error != null) ...[
                    const SizedBox(height: 18),
                    KdCard(
                      background: theme.brightness == Brightness.dark
                          ? AppColors.dangerTintDark
                          : AppColors.dangerTint,
                      outline: theme.brightness == Brightness.dark
                          ? AppColors.dangerLineDark
                          : AppColors.dangerLine,
                      child: Text(_error!, style: theme.textTheme.bodyMedium),
                    ),
                  ],

                  const SizedBox(height: 20),
                  KdCard(
                    background: theme.brightness == Brightness.dark
                        ? AppColors.forestTintDark
                        : AppColors.forestTint,
                    outline: theme.brightness == Brightness.dark
                        ? AppColors.forestLineDark
                        : AppColors.forestLine,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.check_circle_outline,
                          size: 19,
                          color: theme.colorScheme.primary,
                        ),
                        const SizedBox(width: 11),
                        Expanded(
                          child: Text(
                            l10n.onboardWhy,
                            style: theme.textTheme.bodySmall,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // The action sits at the bottom edge, where a thumb already is,
            // rather than scrolling away under five text fields.
            Container(
              padding: const EdgeInsets.fromLTRB(22, 12, 22, 20),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(color: theme.colorScheme.outline),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FilledButton(
                    onPressed: _saving ? null : _save,
                    child: Text(_saving ? l10n.farmSaving : l10n.onboardFinish),
                  ),
                  const SizedBox(height: 6),
                  TextButton(
                    onPressed: _saving ? null : _skip,
                    child: Text(l10n.onboardSkip),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A field with its label above it rather than floating inside it.
///
/// A floating label collapses into the border once there is a value, so a
/// farmer scrolling back to check what they typed has to read the value and
/// infer the question. At 16sp with a full form that is a real cost.
class _Labelled extends StatelessWidget {
  const _Labelled({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 7),
          child,
        ],
      ),
    );
  }
}

class _CropChip extends StatelessWidget {
  const _CropChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppTheme.radiusChip),
      child: Container(
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? theme.colorScheme.primary : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusChip),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.outlineVariant,
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: selected
                ? theme.colorScheme.onPrimary
                : theme.colorScheme.onSurface,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }
}
