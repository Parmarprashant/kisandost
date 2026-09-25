import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/locale_controller.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/config/env.dart';
import '../../../l10n/app_localizations.dart';
import '../data/auth_controller.dart';
import '../data/auth_models.dart';

/// Sign-in screen matching Login.dc.html (Warm Earth).
///
/// The artboard shows OTP entry, but the real auth is Google OAuth.
/// We keep the Google flow and restyle the chrome to match the artboard.
class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = ref.watch(authControllerProvider);
    final busy = state is SigningIn;

    return Scaffold(
      backgroundColor: isDark ? AppColors.paperDark : AppColors.paper,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 22),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Column(
                    children: [
                      // Brand header
                      Padding(
                        padding: const EdgeInsets.only(top: 52),
                        child: Column(
                          children: [
                            Container(
                              width: 68,
                              height: 68,
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.forestDark
                                    : AppColors.forest,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Icon(
                                Icons.eco,
                                size: 36,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 18),
                            Text(
                              'KisanDost',
                              style: TextStyle(
                                fontFamily: AppTheme.displayFamily,
                                fontSize: 34,
                                fontWeight: FontWeight.w600,
                                letterSpacing: -0.5,
                                color: isDark
                                    ? AppColors.inkDark
                                    : AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              l10n.authTagline,
                              style: TextStyle(
                                fontSize: 15,
                                height: 1.55,
                                color: isDark
                                    ? AppColors.ink2Dark
                                    : AppColors.ink2,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const Spacer(),

                      // Failure note
                      if (state is SignedOut && state.failure != null) ...[
                        _FailureNote(failure: state.failure!),
                        const SizedBox(height: 16),
                      ],

                      // Sign in button (primary)
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: busy
                              ? null
                              : () => ref
                                    .read(authControllerProvider.notifier)
                                    .signInWithGoogle(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                            foregroundColor: Colors.white,
                            disabledBackgroundColor:
                                (isDark
                                        ? AppColors.forestDark
                                        : AppColors.forest)
                                    .withValues(alpha: 0.6),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                          child: busy
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.login, size: 20),
                                    const SizedBox(width: 9),
                                    Text(
                                      l10n.authGoogle,
                                      style: const TextStyle(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),

                      const SizedBox(height: 10),
                      Text(
                        l10n.authWhyGoogle,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                        ),
                      ),

                      if (Env.allowPasswordLogin) const _DeveloperSignIn(),

                      // Language picker card
                      Container(
                        margin: const EdgeInsets.only(top: 26),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 15,
                        ),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.surfaceDark : Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isDark ? AppColors.lineDark : AppColors.line,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.loginPickLanguage.toUpperCase(),
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.08 * 13,
                                color: isDark
                                    ? AppColors.ink3Dark
                                    : AppColors.ink3,
                              ),
                            ),
                            const SizedBox(height: 11),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                for (final locale in supportedLocales)
                                  _LanguageChip(
                                    label:
                                        localeNames[locale.languageCode] ??
                                        locale.languageCode,
                                    selected:
                                        ref.watch(localeProvider) == locale,
                                    isDark: isDark,
                                    onTap: () => ref
                                        .read(localeProvider.notifier)
                                        .change(locale),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const Spacer(flex: 1),

                      // Footer note
                      Padding(
                        padding: const EdgeInsets.only(bottom: 26),
                        child: Text(
                          l10n.loginPrivacyNote,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            height: 1.55,
                            color: isDark ? AppColors.ink3Dark : AppColors.ink3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _LanguageChip extends StatelessWidget {
  const _LanguageChip({
    required this.label,
    required this.selected,
    required this.isDark,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: selected
              ? (isDark ? AppColors.forestDark : AppColors.forest)
              : (isDark ? AppColors.surfaceDark : Colors.white),
          borderRadius: BorderRadius.circular(4),
          border: selected
              ? null
              : Border.all(color: isDark ? AppColors.lineDark : AppColors.line),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 15,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
            color: selected
                ? Colors.white
                : (isDark ? AppColors.ink2Dark : AppColors.ink2),
          ),
        ),
      ),
    );
  }
}

class _FailureNote extends StatelessWidget {
  const _FailureNote({required this.failure});
  final AuthFailure failure;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final message = switch (failure) {
      AuthFailure.cancelled => l10n.authCancelled,
      AuthFailure.rejected => l10n.authRejected,
      AuthFailure.stateMismatch => l10n.authStateMismatch,
      AuthFailure.offline => l10n.authOffline,
      AuthFailure.server => l10n.authServerError,
    };

    final isFault = failure != AuthFailure.cancelled;
    final color = isFault
        ? (isDark ? AppColors.dangerDark : AppColors.danger)
        : (isDark ? AppColors.mutedDark : AppColors.muted);

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
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppColors.inkDark : AppColors.ink,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Username + password sign-in, shown only when the build opted in.
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
        child: const Text('Sign in with username'),
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
          OutlinedButton(onPressed: _submit, child: const Text('Sign in')),
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
