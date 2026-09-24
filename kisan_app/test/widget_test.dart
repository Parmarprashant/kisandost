import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/app/locale_controller.dart';
import 'package:kisan_app/l10n/app_localizations.dart';

/// Loads the generated localizations for one locale directly from the
/// delegate. No widget tree, so these stay fast and do not depend on which
/// Material/Cupertino delegates an app happens to register.
Future<L10n> _load(Locale locale) => L10n.delegate.load(locale);

void main() {
  group('localization', () {
    test('every supported locale resolves', () async {
      for (final locale in supportedLocales) {
        expect(
          L10n.delegate.isSupported(locale),
          isTrue,
          reason: '${locale.languageCode} is listed but has no ARB file',
        );

        final l10n = await _load(locale);
        expect(
          l10n.navigation_home,
          isNotEmpty,
          reason: 'navigation_home missing for ${locale.languageCode}',
        );
      }
    });

    test('app-only strings are translated, not left in English', () async {
      final english = await _load(const Locale('en'));

      // These are added in tool/import_arb.py rather than imported from the
      // web app, so they are the easiest ones to forget to translate.
      for (final code in ['hi', 'gu', 'mr']) {
        final other = await _load(Locale(code));
        expect(
          other.appRetry,
          isNot(equals(english.appRetry)),
          reason: 'appRetry not translated for $code',
        );
        expect(
          other.navFarm,
          isNot(equals(english.navFarm)),
          reason: 'navFarm not translated for $code',
        );
        expect(
          other.appOffline,
          isNot(equals(english.appOffline)),
          reason: 'appOffline not translated for $code',
        );
      }
    });

    test('a key missing from Marathi falls back to English', () async {
      // Marathi is ~48% translated. The contract is that a gap shows English
      // rather than an empty string or a crash.
      final marathi = await _load(const Locale('mr'));
      expect(marathi.dashboard_chooseCrop, isNotEmpty);
    });

    test('placeholder strings keep their arguments', () async {
      final english = await _load(const Locale('en'));
      final greeting = english.dashboard_greeting('Ramesh', 'healthy');

      expect(greeting, contains('Ramesh'));
      expect(greeting, contains('healthy'));
      // A literal `{name}` here would mean the ARB placeholder metadata was
      // dropped during import.
      expect(greeting, isNot(contains('{')));
    });
  });

  group('supported locales', () {
    test('every locale has a name written in its own script', () {
      for (final locale in supportedLocales) {
        expect(
          localeNames[locale.languageCode],
          isNotNull,
          reason: 'no display name for ${locale.languageCode}',
        );
      }
    });

    test('English is first, so it is the fallback', () {
      expect(supportedLocales.first.languageCode, 'en');
    });
  });
}
