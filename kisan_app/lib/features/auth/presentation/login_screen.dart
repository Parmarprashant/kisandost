import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale_controller.dart';
import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../data/auth_controller.dart';
import '../data/auth_models.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final state = ref.watch(authControllerProvider);
    final busy = state is SigningIn;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // The language switch sits above the sign-in button on purpose:
              // someone who cannot read English has to be able to fix that
              // before they are asked to do anything else.
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => _showLanguageSheet(context, ref),
                  icon: const Icon(Icons.language),
                  label: Text(l10n.appLanguage),
                ),
              ),

              const Spacer(),

              Container(
                width: 120,
                height: 120,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryContainer,
                ),
                child: const Icon(
                  Icons.eco,
                  size: 64,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'KisanDost',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const SizedBox(height: 6),
              Text(
                l10n.authTagline,
                style: Theme.of(context).textTheme.bodyLarge,
              ),

              const Spacer(),

              if (state is SignedOut && state.failure != null) ...[
                _FailureNote(failure: state.failure!),
                const SizedBox(height: 16),
              ],

              FilledButton.icon(
                onPressed: busy
                    ? null
                    : () => ref
                          .read(authControllerProvider.notifier)
                          .signInWithGoogle(),
                icon: busy
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.login),
                label: Text(busy ? l10n.authSigningIn : l10n.authGoogle),
              ),
              const SizedBox(height: 14),
              Text(
                l10n.authWhyGoogle,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),

              // Google's callback returns through a custom scheme that only
              // resolves on a device, so the app cannot be signed into on
              // Windows or in a browser. This panel exists purely so the rest
              // of the app can be driven during development, and it is
              // compiled out of release builds entirely.
              if (kDebugMode) const _DeveloperSignIn(),

              const SizedBox(height: 24),
            ],
          ),
        ),
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

class _FailureNote extends StatelessWidget {
  const _FailureNote({required this.failure});

  final AuthFailure failure;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    final message = switch (failure) {
      AuthFailure.cancelled => l10n.authCancelled,
      AuthFailure.rejected => l10n.authRejected,
      AuthFailure.stateMismatch => l10n.authStateMismatch,
      AuthFailure.offline => l10n.authOffline,
      AuthFailure.server => l10n.authServerError,
    };

    // Cancelling is not an error — the user chose it — so it is stated
    // neutrally rather than in alarm colours.
    final isFault = failure != AuthFailure.cancelled;
    final color = isFault ? AppColors.danger : AppColors.muted;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: color.withValues(alpha: 0.10),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isFault ? Icons.error_outline : Icons.info_outline,
            color: color,
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}

/// Debug-only username + password sign-in.
///
/// Stripped from release builds by the `kDebugMode` guard at its only call
/// site — `kDebugMode` is a compile-time constant, so the tree shaker removes
/// this widget and the code path behind it from a release binary.
class _DeveloperSignIn extends ConsumerStatefulWidget {
  const _DeveloperSignIn();

  @override
  ConsumerState<_DeveloperSignIn> createState() => _DeveloperSignInState();
}

class _DeveloperSignInState extends ConsumerState<_DeveloperSignIn> {
  final _username = TextEditingController();
  final _password = TextEditingController();
  bool _open = false;

  @override
  void dispose() {
    _username.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_open) {
      return TextButton(
        onPressed: () => setState(() => _open = true),
        child: const Text('Developer sign-in'),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        children: [
          TextField(
            controller: _username,
            autofillHints: const [AutofillHints.username],
            decoration: const InputDecoration(labelText: 'Username'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Password'),
            onSubmitted: (_) => _submit(),
          ),
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: _submit,
            child: const Text('Sign in (dev)'),
          ),
        ],
      ),
    );
  }

  void _submit() {
    ref
        .read(authControllerProvider.notifier)
        .signInWithPassword(_username.text.trim(), _password.text);
  }
}
