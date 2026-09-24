import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'app/locale_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final container = ProviderContainer();

  // Restore the saved language before the first frame, so a Gujarati user
  // never sees a flash of English on launch.
  await container.read(localeProvider.notifier).restore();

  runApp(
    UncontrolledProviderScope(container: container, child: const KisanApp()),
  );
}
