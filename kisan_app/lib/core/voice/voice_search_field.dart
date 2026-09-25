import 'package:flutter/material.dart';

import 'voice_input_button.dart';

/// A search box you can talk to.
///
/// Owns its controller so a stateless screen can drop it in without becoming
/// stateful just to hold one. Searching by voice matters more than it looks:
/// a farmer looking for a scheme or an input knows its name out loud long
/// before they can spell it on a phone keyboard.
class VoiceSearchField extends StatefulWidget {
  const VoiceSearchField({
    super.key,
    required this.hintText,
    required this.onChanged,
  });

  final String hintText;
  final ValueChanged<String> onChanged;

  @override
  State<VoiceSearchField> createState() => _VoiceSearchFieldState();
}

class _VoiceSearchFieldState extends State<VoiceSearchField> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      decoration: InputDecoration(
        hintText: widget.hintText,
        prefixIcon: const Icon(Icons.search),
        suffixIcon: VoiceInputButton(
          controller: _controller,
          // Dictation writes straight to the controller, which does not fire
          // onChanged, so the filter is told here instead.
          onChanged: widget.onChanged,
        ),
      ),
      onChanged: widget.onChanged,
    );
  }
}
