import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_theme.dart';

/// The small pieces every screen in the redesign is built from.
///
/// These exist because the same four blocks were being rebuilt inline on
/// every screen with slightly different padding each time: a hairline card,
/// a section eyebrow, a provenance chip and a figure. Centralising them is
/// what keeps the language consistent as screens move over one at a time.

/// A card: warm surface, hairline edge, no shadow.
class KdCard extends StatelessWidget {
  const KdCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.fromLTRB(16, 14, 16, 14),
    this.background,
    this.outline,
    this.onTap,
    this.clip = false,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  /// Defaults to the theme surface. Pass a tint for a card that carries a
  /// state — an overdue task, a severe diagnosis.
  final Color? background;
  final Color? outline;
  final VoidCallback? onTap;

  /// True when the child draws to the card edge (a list with its own
  /// dividers, an image header).
  final bool clip;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final radius = BorderRadius.circular(AppTheme.radiusCard);

    final body = Container(
      padding: clip ? EdgeInsets.zero : padding,
      decoration: BoxDecoration(
        color: background ?? scheme.surface,
        borderRadius: radius,
        border: Border.all(color: outline ?? scheme.outline),
      ),
      clipBehavior: clip ? Clip.antiAlias : Clip.none,
      child: child,
    );

    if (onTap == null) return body;
    return InkWell(onTap: onTap, borderRadius: radius, child: body);
  }
}

/// `SECTION NAME` with an optional action on the right.
class SectionHeader extends StatelessWidget {
  const SectionHeader(
    this.label, {
    super.key,
    this.actionLabel,
    this.onAction,
    this.padding = const EdgeInsets.only(top: 20, bottom: 10),
  });

  final String label;
  final String? actionLabel;
  final VoidCallback? onAction;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.baseline,
        textBaseline: TextBaseline.alphabetic,
        children: [
          Expanded(
            child: Text(label.toUpperCase(), style: AppTheme.eyebrow(context)),
          ),
          if (actionLabel != null)
            GestureDetector(
              onTap: onAction,
              // A 44dp strip around the words, so the tap target clears the
              // minimum even though the text itself is 13sp.
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 4,
                ),
                child: Text(
                  actionLabel!,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.terracottaDark
                        : AppColors.terracottaText,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Says where a figure came from, when it did not come from a live reading.
///
/// Renders nothing for [Provenance.live] — an unchipped number is the app's
/// promise that a real source produced it, so adding a "live" chip everywhere
/// would make the absence of a chip meaningless.
class ProvenanceChip extends StatelessWidget {
  const ProvenanceChip(this.provenance, {super.key, required this.label})
    : _force = false;

  /// A chip that is always shown, including for a live source. Use on the
  /// screen that is *about* the figure, where naming the mandi or the API is
  /// itself the information.
  const ProvenanceChip.always(this.provenance, {super.key, required this.label})
    : _force = true;

  final Provenance provenance;
  final String label;

  final bool _force;

  @override
  Widget build(BuildContext context) {
    if (!_force && !provenance.needsChip) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: provenance.background(isDark),
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
        border: Border.all(color: provenance.outline(isDark)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          height: 1.2,
          color: provenance.foreground(isDark),
        ),
      ),
    );
  }
}

/// A figure with its caption — the thing a card is built around.
class Figure extends StatelessWidget {
  const Figure({
    super.key,
    required this.value,
    this.caption,
    this.unit,
    this.size = 34,
    this.color,
  });

  final String value;
  final String? caption;

  /// Sits on the baseline next to the figure, at body size.
  final String? unit;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (caption != null) ...[
          Text(caption!, style: text.bodySmall),
          const SizedBox(height: 2),
        ],
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              value,
              style: TextStyle(
                fontFamily: AppTheme.displayFamily,
                fontSize: size,
                fontWeight: FontWeight.w600,
                height: 1.1,
                letterSpacing: -size * 0.02,
                color: color ?? text.bodyLarge?.color,
              ),
            ),
            if (unit != null) ...[
              const SizedBox(width: 6),
              Text(unit!, style: text.bodyMedium),
            ],
          ],
        ),
      ],
    );
  }
}

/// The five-segment crop stage bar.
///
/// Segments before the current one are filled, the current one is terracotta,
/// the rest are the hairline colour. It is deliberately not a percentage bar:
/// a farmer counts in stages, not in percent of season.
class StageBar extends StatelessWidget {
  const StageBar({
    super.key,
    required this.stageCount,
    required this.currentStage,
    this.height = 5,
  });

  final int stageCount;

  /// Zero-based. Negative means nothing has started yet.
  final int currentStage;

  final double height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final done = isDark ? AppColors.forestDark : AppColors.forest;
    final now = isDark ? AppColors.terracottaDark : AppColors.terracotta;
    final todo = Theme.of(context).colorScheme.outline;

    return Row(
      children: [
        for (var i = 0; i < stageCount; i++) ...[
          Expanded(
            child: Container(
              height: height,
              decoration: BoxDecoration(
                color: i < currentStage
                    ? done
                    : i == currentStage
                    ? now
                    : todo,
                borderRadius: BorderRadius.circular(height / 2),
              ),
            ),
          ),
          if (i != stageCount - 1) const SizedBox(width: 3),
        ],
      ],
    );
  }
}

/// A row of bars for a short series — a week of prices, four months of
/// estimates. The last bar is the current reading and is the only dark one.
class MiniBars extends StatelessWidget {
  const MiniBars({
    super.key,
    required this.values,
    this.height = 34,
    this.barWidth,
  });

  /// Raw values; scaled here so callers never have to normalise.
  final List<double> values;
  final double height;
  final double? barWidth;

  @override
  Widget build(BuildContext context) {
    if (values.isEmpty) return SizedBox(height: height);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final max = values.reduce((a, b) => a > b ? a : b);
    final min = values.reduce((a, b) => a < b ? a : b);
    // Floor the range at the bottom of the series rather than zero, so a
    // 2% move in a mandi rate is actually visible.
    final span = (max - min).abs() < 0.0001 ? 1.0 : (max - min) * 1.35;
    final base = min - (max - min) * 0.35;

    return SizedBox(
      height: height,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < values.length; i++) ...[
            _bar(context, (values[i] - base) / span, i, isDark),
            if (i != values.length - 1) const SizedBox(width: 3),
          ],
        ],
      ),
    );
  }

  Widget _bar(BuildContext context, double fraction, int i, bool isDark) {
    final isLast = i == values.length - 1;
    final isPrev = i == values.length - 2;

    final bar = Container(
      height: (height * fraction.clamp(0.12, 1.0)),
      decoration: BoxDecoration(
        color: isLast
            ? (isDark ? AppColors.forestDark : AppColors.forest)
            : isPrev
            ? (isDark ? AppColors.terracottaDark : AppColors.terracotta)
            : Theme.of(context).colorScheme.outline,
        borderRadius: BorderRadius.circular(2),
      ),
    );

    return barWidth == null
        ? Expanded(child: bar)
        : SizedBox(width: barWidth, child: bar);
  }
}
