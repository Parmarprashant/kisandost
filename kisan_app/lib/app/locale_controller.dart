import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/storage/secure_store.dart';

/// The four languages the platform ships.
///
/// Translation completeness as of the ARB import (see `tool/import_arb.py`):
/// Hindi 100%, Gujarati 94%, Marathi 47%. Anything missing falls back to
/// English at runtime rather than showing a blank.
const supportedLocales = [
  Locale('en'),
  Locale('hi'),
  Locale('gu'),
  Locale('mr'),
];

/// Language names written in their own script — a user who cannot read English
/// must still be able to find their language in the picker.
const localeNames = {
  'en': 'English',
  'hi': 'हिन्दी',
  'gu': 'ગુજરાતી',
  'mr': 'मराठी',
};

final localeProvider = NotifierProvider<LocaleController, Locale>(
  LocaleController.new,
);

class LocaleController extends Notifier<Locale> {
  @override
  Locale build() => const Locale('en');

  /// Called once during startup, before the first frame.
  Future<void> restore() async {
    final code = await ref.read(secureStoreProvider).readLocale();
    if (code != null && supportedLocales.any((l) => l.languageCode == code)) {
      state = Locale(code);
    }
  }

  Future<void> change(Locale locale) async {
    if (locale == state) return;
    state = locale;
    await ref.read(secureStoreProvider).writeLocale(locale.languageCode);
  }
}
