import 'package:flutter/material.dart';

import '../../app/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import 'voice_input.dart';

/// A microphone that dictates into a [TextEditingController].
///
/// Designed to sit in a field's `suffixIcon`, so speaking and typing are the
/// same act in the same box rather than two different screens.
///
/// It hides itself when the device has no speech recognition. A dead button
/// is worse than no button, especially for someone who cannot read the error.
class VoiceInputButton extends StatefulWidget {
  const VoiceInputButton({super.key, required this.controller, this.onChanged});

  final TextEditingController controller;

  /// Called after each update, for forms that react to typing.
  final ValueChanged<String>? onChanged;

  @override
  State<VoiceInputButton> createState() => _VoiceInputButtonState();
}

class _VoiceInputButtonState extends State<VoiceInputButton> {
  final _voice = VoiceInputController();

  /// What was already in the field when listening started.
  ///
  /// Dictation appends rather than replaces, so someone can type a word,
  /// speak the rest, and not lose the typed part.
  String _base = '';

  bool _available = true;

  @override
  void initState() {
    super.initState();
    _voice.addListener(_onVoiceChanged);
    _check();
  }

  Future<void> _check() async {
    final ok = await _voice.prepare();
    if (mounted) setState(() => _available = ok);
  }

  void _onVoiceChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _voice.removeListener(_onVoiceChanged);
    _voice.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_voice.isListening) {
      await _voice.stop();
      return;
    }

    final existing = widget.controller.text.trimRight();
    _base = existing.isEmpty ? '' : '$existing ';

    await _voice.start(
      locale: Localizations.localeOf(context),
      onText: (words) {
        final text = '$_base$words';
        widget.controller.value = TextEditingValue(
          text: text,
          selection: TextSelection.collapsed(offset: text.length),
        );
        widget.onChanged?.call(text);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_available) return const SizedBox.shrink();

    final l10n = L10n.of(context);
    final listening = _voice.isListening;

    return IconButton(
      onPressed: _toggle,
      tooltip: listening ? l10n.voiceStop : l10n.voiceStart,
      icon: Icon(
        listening ? Icons.stop_circle_outlined : Icons.mic_none,
        color: listening ? AppColors.danger : AppColors.muted,
      ),
    );
  }
}

/// A full-width dictation row for multi-line fields.
///
/// The suffix icon works for one-line inputs, but on a tall "describe your
/// problem" box a small icon in the corner goes unnoticed. This states what
/// it does in words.
class VoiceInputBar extends StatefulWidget {
  const VoiceInputBar({super.key, required this.controller});

  final TextEditingController controller;

  @override
  State<VoiceInputBar> createState() => _VoiceInputBarState();
}

class _VoiceInputBarState extends State<VoiceInputBar> {
  final _voice = VoiceInputController();
  String _base = '';
  bool _available = true;

  @override
  void initState() {
    super.initState();
    _voice.addListener(_onVoiceChanged);
    _check();
  }

  Future<void> _check() async {
    final ok = await _voice.prepare();
    if (mounted) setState(() => _available = ok);
  }

  void _onVoiceChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _voice.removeListener(_onVoiceChanged);
    _voice.dispose();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_voice.isListening) {
      await _voice.stop();
      return;
    }

    final existing = widget.controller.text.trimRight();
    _base = existing.isEmpty ? '' : '$existing ';

    await _voice.start(
      locale: Localizations.localeOf(context),
      onText: (words) {
        final text = '$_base$words';
        widget.controller.value = TextEditingValue(
          text: text,
          selection: TextSelection.collapsed(offset: text.length),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_available) return const SizedBox.shrink();

    final l10n = L10n.of(context);
    final listening = _voice.isListening;

    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton.icon(
        onPressed: _toggle,
        icon: Icon(listening ? Icons.stop_circle_outlined : Icons.mic_none),
        label: Text(listening ? l10n.voiceListening : l10n.voiceSpeak),
        style: TextButton.styleFrom(
          foregroundColor: listening ? AppColors.danger : AppColors.primary,
        ),
      ),
    );
  }
}
