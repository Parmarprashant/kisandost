/// Build-time configuration.
///
/// Override per environment without touching code:
///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
///
/// 10.0.2.2 is how the Android emulator reaches the host machine's localhost —
/// `localhost` inside the emulator is the emulator itself.
class Env {
  const Env._();

  /// The deployed Next.js app. Every `/api/*` route lives under this origin.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://venturehack.vercel.app',
  );

  /// The AgriVision diagnostic engine. The Next.js `/api/detect-disease` route
  /// proxies to this, so the app normally goes through the API and never calls
  /// it directly — kept here for the diagnostics screen and for warm-up pings.
  static const String agriVisionUrl = String.fromEnvironment(
    'AGRIVISION_URL',
    defaultValue: 'https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run',
  );

  static const Duration connectTimeout = Duration(seconds: 15);

  /// Generous on purpose: AgriVision and the yield model run on free tiers and
  /// can cold-start for 30s or more.
  static const Duration receiveTimeout = Duration(seconds: 60);

  static bool get isProduction => apiBaseUrl.startsWith('https://');

  /// Shows the username + password sign-in panel.
  ///
  /// Google is the intended path, but its callback returns through a custom
  /// scheme that only resolves on a real Android device — so the app cannot be
  /// signed into on Windows, on the web, or on a device where the intent
  /// filter is misbehaving. Building with
  ///
  ///     --dart-define=ALLOW_PASSWORD_LOGIN=true
  ///
  /// re-enables the password path. It is off unless asked for, so a normal
  /// release build has no second way in.
  static const bool allowPasswordLogin = bool.fromEnvironment(
    'ALLOW_PASSWORD_LOGIN',
  );
}
