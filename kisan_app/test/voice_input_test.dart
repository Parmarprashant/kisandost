import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/voice/voice_input.dart';

void main() {
  group('speechLocaleFor', () {
    test('asks for the Indian variant of each supported language', () {
      // Generic tags do noticeably worse on Indian speech and place names.
      expect(speechLocaleFor(const Locale('hi')), 'hi_IN');
      expect(speechLocaleFor(const Locale('gu')), 'gu_IN');
      expect(speechLocaleFor(const Locale('mr')), 'mr_IN');
      expect(speechLocaleFor(const Locale('en')), 'en_IN');
    });

    test('an unexpected language falls back to Indian English', () {
      expect(speechLocaleFor(const Locale('ta')), 'en_IN');
      expect(speechLocaleFor(const Locale('fr')), 'en_IN');
    });

    test('ignores the country the app locale carries', () {
      // The app only ever sets a language, but a device could hand over
      // en_US and must still get en_IN.
      expect(speechLocaleFor(const Locale('en', 'US')), 'en_IN');
      expect(speechLocaleFor(const Locale('hi', 'IN')), 'hi_IN');
    });
  });

  group('resolveSpeechLocale', () {
    test('takes an exact match', () {
      expect(
        resolveSpeechLocale('hi_IN', ['en_US', 'hi_IN', 'gu_IN']),
        'hi_IN',
      );
    });

    test('matches regardless of separator or case', () {
      // Android reports en_US, iOS reports en-US.
      expect(resolveSpeechLocale('hi_IN', ['hi-IN']), 'hi-IN');
      expect(resolveSpeechLocale('hi_IN', ['HI_in']), 'HI_in');
    });

    test('falls back to the same language in another region', () {
      expect(resolveSpeechLocale('mr_IN', ['en_US', 'mr_Latn']), 'mr_Latn');
    });

    test('prefers Indian English when the language is missing', () {
      // Gujarati recognition is not installed on every handset. en_IN beats
      // en_US on crop and village names, so it is chosen explicitly.
      expect(
        resolveSpeechLocale('gu_IN', ['en_US', 'en_IN', 'fr_FR']),
        'en_IN',
      );
    });

    test('falls back to any English before giving up', () {
      expect(resolveSpeechLocale('gu_IN', ['en_US', 'fr_FR']), 'en_US');
    });

    test('returns null when the device offers nothing usable', () {
      // Null tells the plugin to use the device default, which is better
      // than forcing a locale it does not have.
      expect(resolveSpeechLocale('gu_IN', ['fr_FR', 'de_DE']), isNull);
      expect(resolveSpeechLocale('hi_IN', const []), isNull);
    });

    test('does not mistake a different language sharing a prefix', () {
      // "mr" must not match "mri" (Maori).
      expect(resolveSpeechLocale('mr_IN', ['mri_NZ']), isNull);
    });

    test('every app language resolves on a typical Indian handset', () {
      const installed = ['en_IN', 'en_US', 'hi_IN', 'gu_IN', 'mr_IN', 'bn_IN'];

      for (final language in ['en', 'hi', 'gu', 'mr']) {
        final wanted = speechLocaleFor(Locale(language));
        expect(
          resolveSpeechLocale(wanted, installed),
          isNotNull,
          reason: '$language did not resolve',
        );
      }
    });

    test('a handset with only English still serves every app language', () {
      // The common case on a budget phone. Nobody should lose the mic.
      const installed = ['en_IN', 'en_US'];

      for (final language in ['en', 'hi', 'gu', 'mr']) {
        final wanted = speechLocaleFor(Locale(language));
        expect(resolveSpeechLocale(wanted, installed), 'en_IN');
      }
    });
  });

  group('VoiceStatus', () {
    test('a fresh controller is idle, not listening', () {
      final controller = VoiceInputController();
      addTearDown(controller.dispose);

      expect(controller.status, VoiceStatus.idle);
      expect(controller.isListening, isFalse);
    });
  });
}
