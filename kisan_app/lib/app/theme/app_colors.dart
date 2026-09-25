import 'package:flutter/material.dart';

/// Palette from `docs/mobile/DESIGN.md` §2 — "Warm Earth Editorial".
///
/// Three things drive it, and they are all about where the phone is held:
///
/// 1. **Warm paper, not white.** A pure white page in direct sun is a mirror.
///    A warm off-white at the same luminance is readable at the same screen
///    brightness, which also costs less battery.
/// 2. **Lightness carries meaning, never hue alone.** Red/green is the one
///    pairing a colour-blind farmer cannot separate, and severity is exactly
///    where being wrong is expensive — so each severity step also steps in
///    lightness, and never travels without its word and icon.
/// 3. **No shadows.** Outdoors an elevation shadow reads as a smudge on the
///    glass. Separation is a hairline rule or a step from paper to surface.
class AppColors {
  const AppColors._();

  // Ground. `paper` is the page, `surface` the card that sits on it, `sunk`
  // a well inside a card (table headers, disabled fields).
  static const paper = Color(0xFFFAF6EF);
  static const paperDark = Color(0xFF14120F);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceDark = Color(0xFF1C1A16);
  static const sunk = Color(0xFFF1E9DC);
  static const sunkDark = Color(0xFF26231D);

  // Ink. `ink3` is the lightest we go on `paper` and still clears 4.5:1 —
  // anything lighter is decoration, and decoration does not carry words.
  static const ink = Color(0xFF1C1917);
  static const inkDark = Color(0xFFF2EDE4);
  static const ink2 = Color(0xFF4C4640);
  static const ink2Dark = Color(0xFFC4BDB2);
  static const ink3 = Color(0xFF6B645F);
  static const ink3Dark = Color(0xFF9C948A);

  // Hairlines.
  static const line = Color(0xFFE6DDCE);
  static const lineDark = Color(0xFF332F28);
  static const lineStrong = Color(0xFFD3C7B2);
  static const lineStrongDark = Color(0xFF474238);

  // Brand. `forest` is every primary action and the active tab.
  static const forest = Color(0xFF14532D);
  static const forestDark = Color(0xFF6BAF7E);
  static const forestTint = Color(0xFFEAF2E6);
  static const forestTintDark = Color(0xFF16291C);
  static const forestLine = Color(0xFFC8DCC4);
  static const forestLineDark = Color(0xFF2C4633);

  /// Accent. `terracotta` fills and borders; [terracottaText] is the darker
  /// step used for words, because the fill colour under white text only
  /// reaches 3.5:1 and small labels need 4.5.
  static const terracotta = Color(0xFFC2410C);
  static const terracottaText = Color(0xFF9A3412);
  static const terracottaDark = Color(0xFFF08A5D);
  static const terracottaTint = Color(0xFFFAE7E4);
  static const terracottaTintDark = Color(0xFF32190F);

  // Caution — an unverified figure, an overdue task, a national average.
  static const amber = Color(0xFFB45309);
  static const amberText = Color(0xFF92400E);
  static const amberDark = Color(0xFFE3A008);
  static const amberTint = Color(0xFFFBF1DC);
  static const amberTintDark = Color(0xFF2E2413);
  static const amberLine = Color(0xFFEBD7AE);
  static const amberLineDark = Color(0xFF4A3B1C);

  // Water, weather, irrigation.
  static const sky = Color(0xFF0C4A6E);
  static const skyDark = Color(0xFF6BB6DE);
  static const skyTint = Color(0xFFE4EEF5);
  static const skyTintDark = Color(0xFF122630);
  static const skyLine = Color(0xFFBFD8E6);
  static const skyLineDark = Color(0xFF204052);

  // Trouble.
  static const danger = Color(0xFF991B1B);
  static const dangerDark = Color(0xFFF08080);
  static const dangerTint = Color(0xFFFAE7E4);
  static const dangerTintDark = Color(0xFF331614);
  static const dangerLine = Color(0xFFE8BFBA);
  static const dangerLineDark = Color(0xFF522824);

  // Soil, kept for field and land UI.
  static const soil = Color(0xFF8D6E63);
  static const soilDark = Color(0xFFBCA79E);

  // ---------------------------------------------------------------------
  // Names the old theme used. Kept so the rest of the app keeps compiling
  // while screens move over one at a time.
  // ---------------------------------------------------------------------
  static const primary = forest;
  static const primaryDark = forestDark;
  static const primaryContainer = forestTint;
  static const primaryContainerDark = forestTintDark;
  static const secondary = amber;
  static const secondaryDark = amberDark;
  static const success = forest;
  static const successDark = forestDark;
  static const warning = amber;
  static const warningDark = amberDark;
  static const background = paper;
  static const backgroundDark = paperDark;
  static const onSurface = ink;
  static const onSurfaceDark = inkDark;
  static const muted = ink3;
  static const mutedDark = ink3Dark;
  static const border = line;
  static const borderDark = lineDark;
}

/// One provenance step for a figure on screen.
///
/// The app shows numbers from five different kinds of source and only one of
/// them is a live local reading. Anything else wears a chip saying so, and a
/// number with no chip is a promise that it came from a real source. This
/// enum is what makes that promise checkable rather than a habit.
enum Provenance {
  /// A live reading from a real source, today. The only unchipped case.
  live,

  /// Real data, but not local or not fresh — a national average, a cached row.
  indicative,

  /// Calculated or looked up. Nobody measured it.
  estimated,

  /// The farmer typed it, so it is exactly as good as their guess.
  entered,

  /// Read from the device, with no network involved.
  onDevice,
}

extension ProvenanceStyle on Provenance {
  /// Whether this figure needs a chip at all.
  bool get needsChip => this != Provenance.live;

  Color background(bool isDark) => switch (this) {
    Provenance.live => isDark
        ? AppColors.forestTintDark
        : AppColors.forestTint,
    Provenance.indicative ||
    Provenance.estimated => isDark
        ? AppColors.amberTintDark
        : AppColors.amberTint,
    Provenance.entered => isDark ? AppColors.sunkDark : AppColors.sunk,
    Provenance.onDevice => isDark ? AppColors.skyTintDark : AppColors.skyTint,
  };

  Color foreground(bool isDark) => switch (this) {
    Provenance.live => isDark ? AppColors.forestDark : AppColors.forest,
    Provenance.indicative ||
    Provenance.estimated => isDark
        ? AppColors.amberDark
        : AppColors.amberText,
    Provenance.entered => isDark ? AppColors.ink2Dark : AppColors.ink2,
    Provenance.onDevice => isDark ? AppColors.skyDark : AppColors.sky,
  };

  Color outline(bool isDark) => switch (this) {
    Provenance.live => isDark
        ? AppColors.forestLineDark
        : AppColors.forestLine,
    Provenance.indicative ||
    Provenance.estimated => isDark
        ? AppColors.amberLineDark
        : AppColors.amberLine,
    Provenance.entered => isDark ? AppColors.lineDark : AppColors.line,
    Provenance.onDevice => isDark ? AppColors.skyLineDark : AppColors.skyLine,
  };
}

/// Severity shown by the disease detector.
enum Severity { low, moderate, severe }

extension SeverityColors on Severity {
  /// The word colour. Each step is also a step in lightness, so the three
  /// remain distinguishable without colour vision.
  Color color(bool isDark) => switch (this) {
    Severity.low => isDark ? AppColors.forestDark : AppColors.forest,
    Severity.moderate => isDark ? AppColors.amberDark : AppColors.amberText,
    Severity.severe => isDark ? AppColors.dangerDark : AppColors.danger,
  };

  Color background(bool isDark) => switch (this) {
    Severity.low => isDark ? AppColors.forestTintDark : AppColors.forestTint,
    Severity.moderate => isDark ? AppColors.amberTintDark : AppColors.amberTint,
    Severity.severe => isDark
        ? AppColors.dangerTintDark
        : AppColors.dangerTint,
  };

  Color outline(bool isDark) => switch (this) {
    Severity.low => isDark ? AppColors.forestLineDark : AppColors.forestLine,
    Severity.moderate => isDark ? AppColors.amberLineDark : AppColors.amberLine,
    Severity.severe => isDark
        ? AppColors.dangerLineDark
        : AppColors.dangerLine,
  };

  IconData get icon => switch (this) {
    Severity.low => Icons.check_circle_outline,
    Severity.moderate => Icons.error_outline,
    Severity.severe => Icons.warning_amber_rounded,
  };
}
