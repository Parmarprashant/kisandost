/// Whether anyone is actually looking at the app.
///
/// A job that finishes while the farmer is reading it needs no notification —
/// the result is already in front of them, and buzzing their phone about
/// something on screen is noise. A job that finishes while they are in
/// WhatsApp needs one, or the answer they walked out to get is never seen.
library;

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// True while the app is in the foreground.
final appForegroundProvider = NotifierProvider<AppForeground, bool>(
  AppForeground.new,
);

class AppForeground extends Notifier<bool> with WidgetsBindingObserver {
  @override
  bool build() {
    final binding = WidgetsBinding.instance;
    binding.addObserver(this);
    ref.onDispose(() => binding.removeObserver(this));

    // Assume visible until told otherwise: a wrong "backgrounded" would post
    // a notification for something the farmer is looking at.
    return binding.lifecycleState != AppLifecycleState.paused;
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // `inactive` covers a notification shade pulled halfway down or a call
    // overlay — the app is still on screen, so it is not backgrounded.
    // Shadows the notifier's own `state`, so the new value is computed
    // first and assigned after.
    final foreground = switch (state) {
      AppLifecycleState.resumed || AppLifecycleState.inactive => true,
      _ => false,
    };
    this.state = foreground;
  }
}
