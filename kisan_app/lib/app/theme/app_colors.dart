import 'package:flutter/material.dart';

/// Palette from `docs/mobile/DESIGN.md` §2.
///
/// Carried over from the web app's emerald/amber agrarian scheme, with the
/// contrast pushed up — this app is read outdoors in direct sun.
class AppColors {
  const AppColors._();

  // Brand
  static const primary = Color(0xFF2E7D32);
  static const primaryDark = Color(0xFF4CAF50);
  static const primaryContainer = Color(0xFFE8F5E9);
  static const primaryContainerDark = Color(0xFF1B3D1E);

  static const secondary = Color(0xFFF9A825);
  static const secondaryDark = Color(0xFFFFB300);

  // Domain accents
  static const soil = Color(0xFF8D6E63);
  static const soilDark = Color(0xFFA1887F);
  static const sky = Color(0xFF0288D1);
  static const skyDark = Color(0xFF4FC3F7);

  // Status. Never used alone — always paired with a word and an icon, because
  // colour-blind users and bright sunlight both defeat colour-only meaning.
  static const success = Color(0xFF2E7D32);
  static const successDark = Color(0xFF66BB6A);
  static const warning = Color(0xFFED6C02);
  static const warningDark = Color(0xFFFFA726);
  static const danger = Color(0xFFC62828);
  static const dangerDark = Color(0xFFEF5350);

  // Surfaces
  static const surface = Color(0xFFFFFFFF);
  static const surfaceDark = Color(0xFF121212);
  static const background = Color(0xFFFAFAF8);
  static const backgroundDark = Color(0xFF0A0A0A);

  static const onSurface = Color(0xFF1A1C19);
  static const onSurfaceDark = Color(0xFFE2E3DE);
  static const muted = Color(0xFF5F6368);
  static const mutedDark = Color(0xFF9AA0A6);

  static const border = Color(0xFFE0E3DD);
  static const borderDark = Color(0xFF2A2D28);
}

/// Severity shown by the disease detector.
enum Severity { low, moderate, severe }

extension SeverityColors on Severity {
  Color color(bool isDark) => switch (this) {
    Severity.low => isDark ? AppColors.successDark : AppColors.success,
    Severity.moderate => isDark ? AppColors.warningDark : AppColors.warning,
    Severity.severe => isDark ? AppColors.dangerDark : AppColors.danger,
  };

  IconData get icon => switch (this) {
    Severity.low => Icons.check_circle_outline,
    Severity.moderate => Icons.error_outline,
    Severity.severe => Icons.warning_amber_rounded,
  };
}
