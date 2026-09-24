import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
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

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            const SizedBox(height: 12),
            Text(
              l10n.onboardTitle,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(l10n.onboardWhy, style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: 28),

            TextField(
              controller: _name,
              decoration: InputDecoration(labelText: l10n.onboardName),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _mobile,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: l10n.onboardMobile,
                prefixText: '+91 ',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _village,
              decoration: InputDecoration(labelText: l10n.onboardVillage),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _district,
              decoration: InputDecoration(labelText: l10n.onboardDistrict),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _mainCrop,
              isExpanded: true,
              decoration: InputDecoration(labelText: l10n.onboardMainCrop),
              items: [
                for (final crop in fallbackCrops)
                  DropdownMenuItem(value: crop, child: Text(crop)),
              ],
              onChanged: (v) => setState(() => _mainCrop = v),
            ),

            if (_error != null) ...[
              const SizedBox(height: 20),
              Text(
                _error!,
                style: Theme.of(context).textTheme.bodyLarge
                    ?.copyWith(color: AppColors.danger),
              ),
            ],

            const SizedBox(height: 28),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? l10n.farmSaving : l10n.onboardFinish),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: _saving ? null : _skip,
              child: Text(l10n.onboardSkip),
            ),
          ],
        ),
      ),
    );
  }
}
