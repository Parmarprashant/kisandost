import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Whether the device has any network interface up.
///
/// Deliberately not a promise that the internet works. A farmer can be
/// connected to a tower with no usable data, so this is used to explain a
/// failure and to decide when to retry a queued write — never to skip a
/// request that might have succeeded.
bool hasConnection(List<ConnectivityResult> results) {
  if (results.isEmpty) return false;
  return results.any((r) => r != ConnectivityResult.none);
}

final connectivityProvider = StreamProvider<bool>((ref) async* {
  final connectivity = Connectivity();

  // Emit the current state first; the stream only fires on change, so a
  // screen opened while already offline would otherwise wait forever.
  yield hasConnection(await connectivity.checkConnectivity());

  yield* connectivity.onConnectivityChanged.map(hasConnection);
});

/// Convenience for widgets. Assumes online until told otherwise, so a slow
/// first reading never shows a false offline warning.
final isOnlineProvider = Provider<bool>((ref) {
  return ref.watch(connectivityProvider).value ?? true;
});
