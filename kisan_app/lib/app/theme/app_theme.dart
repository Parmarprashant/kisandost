import 'package:flutter/material.dart';

import 'app_colors.dart';

/// Theme for the "Warm Earth Editorial" language in `docs/mobile/DESIGN.md`.
///
/// Four rules drive most of what looks unusual here:
///
/// 1. **Everything is bigger than Material's default.** Body starts at 16sp,
///    not 14sp, and touch targets are 48dp. The user is outdoors, often
///    one-handed, often not a confident reader.
/// 2. **Line height is 1.5 on body text.** Devanagari and Gujarati have taller
///    glyph stacks than Latin; at Material's default height their diacritics
///    collide.
/// 3. **No shadows anywhere.** Elevation is a hairline rule or a step from
///    paper to surface. Outdoors, a drop shadow reads as a dirty screen. The
///    one exception is the raised scan button, which has to be findable
///    without looking.
/// 4. **Figures are the loudest thing on a card.** A rate, a dose, a day
///    count — one per card, set in the display face, big.
class AppTheme {
  const AppTheme._();

  /// The display face, used for figures and short headings.
  ///
  /// `serif` resolves to the platform's serif (Noto Serif on Android), which
  /// carries Devanagari and Gujarati as well as Latin. The design calls for
  /// Fraunces; swapping to it is a change to this one constant plus a `fonts:`
  /// block in pubspec.yaml, and nothing else in the app needs to know.
  static const displayFamily = 'serif';

  static const double _bodyLineHeight = 1.5;

  /// Corner radii. Chips are nearly square so they never read as buttons.
  static const double radiusChip = 4;
  static const double radiusButton = 10;
  static const double radiusCard = 14;
  static const double radiusSheet = 20;

  static ThemeData light() => _base(Brightness.light);
  static ThemeData dark() => _base(Brightness.dark);

  static ThemeData _base(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    final scheme =
        ColorScheme.fromSeed(
          seedColor: AppColors.forest,
          brightness: brightness,
        ).copyWith(
          primary: isDark ? AppColors.forestDark : AppColors.forest,
          onPrimary: isDark ? AppColors.paperDark : Colors.white,
          primaryContainer: isDark
              ? AppColors.forestTintDark
              : AppColors.forestTint,
          onPrimaryContainer: isDark ? AppColors.forestDark : AppColors.forest,
          secondary: isDark ? AppColors.terracottaDark : AppColors.terracotta,
          onSecondary: isDark ? AppColors.paperDark : Colors.white,
          secondaryContainer: isDark
              ? AppColors.terracottaTintDark
              : AppColors.terracottaTint,
          tertiary: isDark ? AppColors.skyDark : AppColors.sky,
          surface: isDark ? AppColors.surfaceDark : AppColors.surface,
          onSurface: isDark ? AppColors.inkDark : AppColors.ink,
          onSurfaceVariant: isDark ? AppColors.ink3Dark : AppColors.ink3,
          surfaceContainerHighest: isDark ? AppColors.sunkDark : AppColors.sunk,
          error: isDark ? AppColors.dangerDark : AppColors.danger,
          errorContainer: isDark
              ? AppColors.dangerTintDark
              : AppColors.dangerTint,
          outline: isDark ? AppColors.lineDark : AppColors.line,
          outlineVariant: isDark
              ? AppColors.lineStrongDark
              : AppColors.lineStrong,
        );

    final text = _textTheme(isDark);
    final hairline = isDark ? AppColors.lineDark : AppColors.line;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: isDark ? AppColors.paperDark : AppColors.paper,
      canvasColor: isDark ? AppColors.paperDark : AppColors.paper,
      textTheme: text,

      // The bar sits on the page, not above it: same colour, hairline below,
      // and no shadow when content scrolls under.
      appBarTheme: AppBarTheme(
        backgroundColor: isDark ? AppColors.paperDark : AppColors.paper,
        surfaceTintColor: Colors.transparent,
        foregroundColor: isDark ? AppColors.inkDark : AppColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: text.titleLarge,
      ),

      cardTheme: CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
        color: isDark ? AppColors.surfaceDark : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
          side: BorderSide(color: hairline),
        ),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          elevation: 0,
          textStyle: text.labelLarge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusButton),
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          textStyle: text.labelLarge,
          foregroundColor: isDark ? AppColors.forestDark : AppColors.forest,
          // 1.5 rather than 1: an outlined button is a real action here, not
          // a de-emphasised one, and a hairline is already spoken for by
          // card edges.
          side: BorderSide(
            color: isDark ? AppColors.forestDark : AppColors.forest,
            width: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radiusButton),
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: isDark
              ? AppColors.terracottaDark
              : AppColors.terracottaText,
          textStyle: text.labelLarge,
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        hintStyle: text.bodyLarge?.copyWith(
          color: isDark ? AppColors.ink3Dark : AppColors.ink3,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusButton),
          borderSide: BorderSide(
            color: isDark ? AppColors.lineStrongDark : AppColors.lineStrong,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusButton),
          borderSide: BorderSide(
            color: isDark ? AppColors.lineStrongDark : AppColors.lineStrong,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusButton),
          borderSide: BorderSide(color: scheme.primary, width: 2),
        ),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        selectedColor: isDark ? AppColors.forestDark : AppColors.forest,
        labelStyle: text.labelMedium,
        side: BorderSide(
          color: isDark ? AppColors.lineStrongDark : AppColors.lineStrong,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusChip),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),

      navigationBarTheme: NavigationBarThemeData(
        height: 72,
        elevation: 0,
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: Colors.transparent,
        // Labels always visible: an icon alone is not enough for a user who
        // may be guessing at what the picture means.
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => states.contains(WidgetState.selected)
              ? text.labelSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.forestDark : AppColors.forest,
                )
              : text.labelSmall?.copyWith(fontWeight: FontWeight.w500),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 24,
            color: states.contains(WidgetState.selected)
                ? (isDark ? AppColors.forestDark : AppColors.forest)
                : (isDark ? AppColors.ink3Dark : AppColors.ink3),
          ),
        ),
      ),

      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        indicatorColor: isDark
            ? AppColors.forestTintDark
            : AppColors.forestTint,
        selectedLabelTextStyle: text.labelMedium?.copyWith(
          color: isDark ? AppColors.forestDark : AppColors.forest,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelTextStyle: text.labelMedium,
      ),

      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(radiusSheet)),
        ),
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: isDark ? AppColors.surfaceDark : AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusCard),
        ),
      ),

      drawerTheme: DrawerThemeData(
        backgroundColor: isDark ? AppColors.paperDark : AppColors.paper,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: isDark ? AppColors.inkDark : AppColors.ink,
        contentTextStyle: text.bodyMedium?.copyWith(
          color: isDark ? AppColors.ink : AppColors.inkDark,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusButton),
        ),
      ),

      dividerTheme: DividerThemeData(
        color: hairline,
        thickness: 1,
        space: 1,
      ),

      listTileTheme: ListTileThemeData(
        titleTextStyle: text.bodyLarge?.copyWith(fontWeight: FontWeight.w600),
        subtitleTextStyle: text.bodySmall,
        iconColor: isDark ? AppColors.ink2Dark : AppColors.ink2,
      ),

      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: isDark ? AppColors.forestDark : AppColors.forest,
        linearTrackColor: isDark ? AppColors.sunkDark : AppColors.sunk,
      ),
    );
  }

  static TextTheme _textTheme(bool isDark) {
    final ink = isDark ? AppColors.inkDark : AppColors.ink;
    final ink3 = isDark ? AppColors.ink3Dark : AppColors.ink3;

    // Display styles are the figures: a rate, a dose, a day count. Tight
    // tracking, tight leading, serif.
    TextStyle display(double size) => TextStyle(
      fontFamily: displayFamily,
      fontSize: size,
      fontWeight: FontWeight.w600,
      height: 1.1,
      letterSpacing: -size * 0.02,
      color: ink,
    );

    return TextTheme(
      displayLarge: display(40),
      displayMedium: display(34),
      displaySmall: display(28),

      // Headlines are also the display face — a screen title reads as a
      // statement, not a label.
      headlineMedium: TextStyle(
        fontFamily: displayFamily,
        fontSize: 25,
        fontWeight: FontWeight.w600,
        height: 1.15,
        letterSpacing: -0.25,
        color: ink,
      ),
      headlineSmall: TextStyle(
        fontFamily: displayFamily,
        fontSize: 21,
        fontWeight: FontWeight.w600,
        height: 1.2,
        color: ink,
      ),

      titleLarge: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.3,
        color: ink,
      ),
      titleMedium: TextStyle(
        fontSize: 17,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: ink,
      ),
      titleSmall: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: ink,
      ),

      bodyLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: _bodyLineHeight,
        color: ink,
      ),
      bodyMedium: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        height: _bodyLineHeight,
        color: ink,
      ),
      bodySmall: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w400,
        height: 1.45,
        color: ink3,
      ),

      labelLarge: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.2,
      ),
      labelMedium: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        height: 1.2,
        color: ink,
      ),
      labelSmall: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        height: 1.2,
        color: ink3,
      ),
    );
  }

  /// The eyebrow above a section: small, spaced, upper case, muted.
  ///
  /// Used often enough that every screen re-deriving it from `labelSmall`
  /// was the single most repeated block in the old code.
  static TextStyle eyebrow(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextStyle(
      fontSize: 12,
      fontWeight: FontWeight.w700,
      height: 1.2,
      letterSpacing: 1.1,
      color: isDark ? AppColors.ink3Dark : AppColors.ink3,
    );
  }
}
