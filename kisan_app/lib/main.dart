import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'app/locale_controller.dart';
import 'core/offline/offline_store.dart';
import 'core/offline/write_queue.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Read from disk once, here, so repositories can reach last-known-good data
  // synchronously instead of every screen awaiting its own handle.
  final prefs = await SharedPreferences.getInstance();

  final container = ProviderContainer(
    overrides: [
      offlineStoreProvider.overrideWithValue(OfflineStore(prefs)),
      writeQueueProvider.overrideWith((ref) => buildWriteQueue(prefs, ref)),
    ],
  );

  // Restore the saved language before the first frame, so a Gujarati user
  // never sees a flash of English on launch.
  await container.read(localeProvider.notifier).restore();

  runApp(
    UncontrolledProviderScope(container: container, child: const KisanApp()),
  );
}
