/// Speaking instead of typing.
///
/// The point of this app is that a farmer with a phone can use it. Typing
/// Devanagari or Gujarati on a phone keyboard is slow for anyone and a wall
/// for someone who reads little, so anywhere the app asks for free text it
/// also offers a microphone.
///
/// Recognition runs on the device's own speech service. Nothing is uploaded
/// by this app, and nothing is stored — the transcript goes straight into the
/// field the farmer is filling in, where they can correct it before sending.
library;

import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';

/// Device locale to ask the recogniser for.
///
/// Indian variants, deliberately: `hi_IN` recognises Hindi spoken here far
/// better than a generic `hi`, and `en_IN` copes with Indian English place
/// and crop names that `en_US` mangles.
String speechLocaleFor(Locale locale) {
  return switch (locale.languageCode) {
    'hi' => 'hi_IN',
    'gu' => 'gu_IN',
    'mr' => 'mr_IN',
    _ => 'en_IN',
  };
}

/// Picks the closest locale the device actually offers.
///
/// Gujarati and Marathi recognition are not installed on every handset. When
/// the exact match is missing this falls back to Indian English rather than
/// to whatever the device defaults to, which is usually `en_US` and does
/// noticeably worse on Indian names.
String? resolveSpeechLocale(String wanted, List<String> available) {
  if (available.isEmpty) return null;

  final target = wanted.toLowerCase().replaceAll('-', '_');
  for (final id in available) {
    if (id.toLowerCase().replaceAll('-', '_') == target) return id;
  }

  // Same language, different region — hi_IN wanted, hi_Latn or hi offered.
  final language = target.split('_').first;
  for (final id in available) {
    if (id.toLowerCase().split(RegExp('[_-]')).first == language) return id;
  }

  for (final id in available) {
    final normalised = id.toLowerCase().replaceAll('-', '_');
    if (normalised == 'en_in') return id;
  }
  for (final id in available) {
    if (id.toLowerCase().startsWith('en')) return id;
  }

  return null;
}

/// What the mic button is doing right now.
enum VoiceStatus {
  /// Not listening. Tapping starts.
  idle,

  /// Listening, and passing partial results back as they arrive.
  listening,

  /// The device has no speech recognition, or permission was refused.
  unavailable,
}

/// Wraps [SpeechToText] so screens never touch the plugin directly.
class VoiceInputController extends ChangeNotifier {
  VoiceInputController({SpeechToText? speech})
    : _speech = speech ?? SpeechToText();

  final SpeechToText _speech;

  VoiceStatus _status = VoiceStatus.idle;
  VoiceStatus get status => _status;

  bool get isListening => _status == VoiceStatus.listening;

  bool _initialised = false;

  /// Asks for permission and checks the device can do this at all.
  ///
  /// Returns false when it cannot, so the caller can hide the microphone
  /// rather than offering a button that does nothing.
  Future<bool> prepare() async {
    if (_initialised) return _status != VoiceStatus.unavailable;

    try {
      final ok = await _speech.initialize(
        onStatus: _onStatus,
        onError: (_) => _set(VoiceStatus.idle),
      );
      _initialised = true;
      _set(ok ? VoiceStatus.idle : VoiceStatus.unavailable);
      return ok;
    } catch (_) {
      // A missing platform implementation throws rather than returning false.
      _initialised = true;
      _set(VoiceStatus.unavailable);
      return false;
    }
  }

  /// Starts listening, calling [onText] with the transcript so far.
  ///
  /// Partial results are passed through on purpose: a farmer watching words
  /// appear can tell it is working, and can stop and retry if it is hearing
  /// the wrong thing.
  Future<void> start({
    required Locale locale,
    required ValueChanged<String> onText,
  }) async {
    if (!await prepare()) return;
    if (_speech.isListening) return;

    final wanted = speechLocaleFor(locale);
    final available = (await _speech.locales()).map((l) => l.localeId).toList();

    await _speech.listen(
      onResult: (result) => onText(result.recognizedWords),
      listenOptions: SpeechListenOptions(
        localeId: resolveSpeechLocale(wanted, available),
        partialResults: true,
        cancelOnError: true,
        // Farmers describe a problem in sentences and pause while thinking.
        // The defaults cut them off mid-thought.
        pauseFor: const Duration(seconds: 4),
        listenFor: const Duration(seconds: 60),
      ),
    );

    _set(VoiceStatus.listening);
  }

  Future<void> stop() async {
    if (!_speech.isListening) return;
    await _speech.stop();
    _set(VoiceStatus.idle);
  }

  void _onStatus(String status) {
    if (status == 'done' || status == 'notListening') _set(VoiceStatus.idle);
  }

  void _set(VoiceStatus next) {
    if (_status == next) return;
    _status = next;
    notifyListeners();
  }

  @override
  void dispose() {
    if (_speech.isListening) _speech.stop();
    super.dispose();
  }
}
