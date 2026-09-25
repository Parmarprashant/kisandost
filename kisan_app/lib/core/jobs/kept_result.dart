/// Results that outlive the screen that asked for them.
///
/// Profit, yield and the assistant all kept their answers in widget state, so
/// walking to another tab threw them away — and on a rural connection the
/// farmer pays for the round trip twice. Diagnosis solved this by holding its
/// provider open for the length of the run; these are shorter jobs where what
/// matters is not losing the answer afterwards.
///
/// Deliberately not persisted to disk. These are a session's working answers,
/// not records: a profit estimate from last Tuesday shown as today's would be
/// worse than an empty form.
library;

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Holds one value for as long as the app is running.
///
/// [keepAlive] is what makes it survive: without it Riverpod drops the
/// provider the moment the screen stops watching, which is exactly the moment
/// the farmer navigates away.
class KeptResult<T> extends Notifier<T?> {
  @override
  T? build() {
    ref.keepAlive();
    return null;
  }

  void set(T value) => state = value;

  /// Used when the inputs change enough that the old answer would be
  /// misleading — a new crop, a new field.
  void clear() => state = null;
}
