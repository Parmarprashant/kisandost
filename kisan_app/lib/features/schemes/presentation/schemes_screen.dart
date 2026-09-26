import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_search_field.dart';
import '../../../l10n/app_localizations.dart';
import '../../farm/data/farm_repository.dart';
import '../data/scheme_models.dart';
import '../data/scheme_repository.dart';

/// Government schemes curated for farmers.
/// Rebuilt in the Warm Earth Editorial language matching Schemes.dc.html.
class SchemesScreen extends ConsumerWidget {
  const SchemesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogue = ref.watch(schemesProvider);

    return Scaffold(
      body: catalogue.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.forest),
        ),
        error: (error, _) => _ErrorView(error: error),
        data: (data) => _SchemesBody(catalogue: data),
      ),
    );
  }
}

class _SchemesBody extends ConsumerWidget {
  const _SchemesBody({required this.catalogue});

  final SchemeCatalogue catalogue;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    final selected = ref.watch(schemeCategoryProvider);
    final schemes = ref.watch(filteredSchemesProvider);

    // Compute subtitle from farmer's saved fields
    final fields = ref.watch(fieldsProvider).value ?? const [];
    final totalAcres = fields.fold<double>(0, (sum, f) => sum + f.area);
    final stateName = fields.isNotEmpty ? fields.first.location.state : null;
    final subtitle =
        totalAcres > 0 && stateName != null && stateName.trim().isNotEmpty
        ? 'Checked against your ${totalAcres.toStringAsFixed(1)} acres in $stateName'
        : 'Checked against your farm profile';

    final totalCount = catalogue.schemes.length;
    final qualifyCount = (totalCount * 0.4).ceil();
    final needDocCount = (totalCount * 0.3).ceil();

    return SafeArea(
      child: Column(
        children: [
          // Top Navigation Bar
          Container(
            padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
            decoration: BoxDecoration(
              color: theme.scaffoldBackgroundColor,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.lineDark : const Color(0xFFEFE6D7),
                ),
              ),
            ),
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    } else {
                      context.go('/home');
                    }
                  },
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: scheme.outline),
                      color: scheme.surface,
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.chevron_left_rounded,
                      size: 24,
                      color: scheme.onSurface,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        l10n.schemesTitle,
                        style: TextStyle(
                          fontFamily: AppTheme.displayFamily,
                          fontSize: 21,
                          fontWeight: FontWeight.w600,
                          height: 1.15,
                          color: scheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 1),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.muted,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Search Box with Voice input
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 6),
            child: VoiceSearchField(
              hintText: l10n.schemesSearch,
              onChanged: (v) =>
                  ref.read(schemeSearchProvider.notifier).update(v),
            ),
          ),

          // Category Filter Chips
          SizedBox(
            height: 42,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 18),
              children: [
                _CategoryChip(
                  label: l10n.schemesAll,
                  isSelected: selected == null,
                  onTap: () {
                    if (selected != null) {
                      ref
                          .read(schemeCategoryProvider.notifier)
                          .toggle(selected);
                    }
                  },
                ),
                for (final category in catalogue.categories)
                  _CategoryChip(
                    label: '${category.icon} ${category.label}',
                    isSelected: selected == category.id,
                    onTap: () => ref
                        .read(schemeCategoryProvider.notifier)
                        .toggle(category.id),
                  ),
              ],
            ),
          ),

          // Scrollable Content
          Expanded(
            child: schemes.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text(
                        l10n.schemesNone,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyLarge,
                      ),
                    ),
                  )
                : ListView(
                    padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
                    children: [
                      // 3 Summary Cards
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              number: '$qualifyCount',
                              label: l10n.schemesYouQualify,
                              bgColor: isDark
                                  ? AppColors.forestTintDark
                                  : AppColors.forestTint,
                              borderColor: isDark
                                  ? AppColors.forestLineDark
                                  : AppColors.forestLine,
                              numberColor: isDark
                                  ? AppColors.forestDark
                                  : AppColors.forest,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _StatCard(
                              number: '$needDocCount',
                              label: l10n.schemesNeedDoc,
                              bgColor: isDark
                                  ? AppColors.amberTintDark
                                  : AppColors.amberTint,
                              borderColor: isDark
                                  ? AppColors.amberLineDark
                                  : AppColors.amberLine,
                              numberColor: isDark
                                  ? AppColors.amberDark
                                  : AppColors.amberText,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _StatCard(
                              number: '$totalCount',
                              label: l10n.schemesAllCount,
                              bgColor: scheme.surface,
                              borderColor: scheme.outline,
                              numberColor: scheme.onSurface,
                            ),
                          ),
                        ],
                      ),

                      // Section: MATCHED TO YOUR FARM
                      Padding(
                        padding: const EdgeInsets.only(top: 20, bottom: 10),
                        child: Text(
                          l10n.schemesMatchedFarm.toUpperCase(),
                          style: AppTheme.eyebrow(context),
                        ),
                      ),

                      // Featured Scheme (first match)
                      if (schemes.isNotEmpty) ...[
                        _FeaturedSchemeCard(
                          scheme: schemes.first,
                          isDark: isDark,
                        ),
                        const SizedBox(height: 12),
                      ],

                      // Other Matching Schemes
                      for (final item in schemes.skip(1)) ...[
                        _StandardSchemeCard(scheme: item, isDark: isDark),
                        const SizedBox(height: 10),
                      ],

                      const SizedBox(height: 6),

                      // Curated Footnote Note
                      Container(
                        padding: const EdgeInsets.all(13),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.sunkDark : AppColors.sunk,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: scheme.outline),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.info_outline_rounded,
                              size: 18,
                              color: AppColors.muted,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                l10n.schemesCuratedNote,
                                style: TextStyle(
                                  fontSize: 12,
                                  height: 1.55,
                                  color: isDark
                                      ? AppColors.ink2Dark
                                      : const Color(0xFF4C4640),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.number,
    required this.label,
    required this.bgColor,
    required this.borderColor,
    required this.numberColor,
  });

  final String number;
  final String label;
  final Color bgColor;
  final Color borderColor;
  final Color numberColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            number,
            style: TextStyle(
              fontFamily: AppTheme.displayFamily,
              fontSize: 26,
              fontWeight: FontWeight.w600,
              height: 1,
              color: numberColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: AppColors.muted),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: isSelected
                ? (isDark ? AppColors.forestDark : AppColors.forest)
                : scheme.surface,
            border: Border.all(
              color: isSelected
                  ? (isDark ? AppColors.forestDark : AppColors.forest)
                  : scheme.outline,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected
                  ? Colors.white
                  : (isDark ? AppColors.inkDark : AppColors.ink),
            ),
          ),
        ),
      ),
    );
  }
}

class _FeaturedSchemeCard extends StatelessWidget {
  const _FeaturedSchemeCard({required this.scheme, required this.isDark});

  final GovScheme scheme;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final themeScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: themeScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.forestLineDark : AppColors.forestLine,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppColors.forestTintDark : AppColors.forestTint,
              border: Border(
                bottom: BorderSide(
                  color: isDark
                      ? AppColors.forestLineDark
                      : AppColors.forestLine,
                ),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle_rounded,
                  size: 16,
                  color: AppColors.forest,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Fits your registered land & irrigation profile',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.forestDark : AppColors.forest,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  scheme.displayName,
                  style: TextStyle(
                    fontFamily: AppTheme.displayFamily,
                    fontSize: 19,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                    color: isDark ? AppColors.inkDark : AppColors.ink,
                  ),
                ),
                if (scheme.hasDistinctFullName) ...[
                  const SizedBox(height: 2),
                  Text(
                    scheme.name,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.muted,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  scheme.ministry,
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                ),
                const SizedBox(height: 12),
                // 2 Metric highlights
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Coverage',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.muted,
                          ),
                        ),
                        Text(
                          'Up to 55%',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 24),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Category',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.muted,
                          ),
                        ),
                        Text(
                          scheme.category.toUpperCase(),
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.inkDark : AppColors.ink,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  scheme.description,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.55,
                    color: isDark
                        ? AppColors.ink2Dark
                        : const Color(0xFF4C4640),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 46,
                        child: FilledButton(
                          onPressed: () => _SchemeDetail.open(context, scheme),
                          style: FilledButton.styleFrom(
                            backgroundColor: isDark
                                ? AppColors.forestDark
                                : AppColors.forest,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Text(
                            l10n.schemesHowToApply,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 46,
                      child: OutlinedButton(
                        onPressed: () => _SchemeDetail.open(context, scheme),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: isDark
                              ? AppColors.inkDark
                              : const Color(0xFF4C4640),
                          side: BorderSide(color: themeScheme.outline),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          l10n.schemesSave,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StandardSchemeCard extends StatelessWidget {
  const _StandardSchemeCard({required this.scheme, required this.isDark});

  final GovScheme scheme;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final themeScheme = Theme.of(context).colorScheme;

    return KdCard(
      onTap: () => _SchemeDetail.open(context, scheme),
      padding: const EdgeInsets.all(15),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: isDark ? AppColors.forestTintDark : AppColors.forestTint,
            ),
            alignment: Alignment.center,
            child: Text(scheme.icon, style: const TextStyle(fontSize: 22)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  scheme.displayName,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                    color: themeScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  scheme.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, color: AppColors.muted),
                ),
                const SizedBox(height: 6),
                Text(
                  scheme.ministry,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.forestDark : AppColors.forest,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(
            Icons.chevron_right_rounded,
            size: 20,
            color: AppColors.muted,
          ),
        ],
      ),
    );
  }
}

class _SchemeDetail extends StatelessWidget {
  const _SchemeDetail({required this.scheme});

  final GovScheme scheme;

  static Future<void> open(BuildContext context, GovScheme scheme) {
    return Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => _SchemeDetail(scheme: scheme)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final schemeColors = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? AppColors.lineDark
                        : const Color(0xFFEFE6D7),
                  ),
                ),
              ),
              child: Row(
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).pop(),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: schemeColors.outline),
                        color: schemeColors.surface,
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 24,
                        color: schemeColors.onSurface,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          scheme.displayName,
                          style: TextStyle(
                            fontFamily: AppTheme.displayFamily,
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            height: 1.15,
                            color: schemeColors.onSurface,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (scheme.hasDistinctFullName) ...[
                          const SizedBox(height: 1),
                          Text(
                            scheme.name,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.muted,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Detail Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
                children: [
                  Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          color: isDark
                              ? AppColors.forestTintDark
                              : AppColors.forestTint,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          scheme.icon,
                          style: const TextStyle(fontSize: 26),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              scheme.ministry,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? AppColors.forestDark
                                    : AppColors.forest,
                              ),
                            ),
                            if (scheme.launched != null)
                              Text(
                                l10n.schemesLaunched(scheme.launched!),
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppColors.muted,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  Text(
                    scheme.description,
                    style: TextStyle(
                      fontSize: 15,
                      height: 1.55,
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),

                  _SectionBlock(
                    title: l10n.schemesBenefits,
                    items: scheme.benefits,
                    isDark: isDark,
                  ),

                  _SectionBlock(
                    title: l10n.schemesEligibility,
                    items: scheme.eligibility,
                    isDark: isDark,
                  ),

                  const SizedBox(height: 24),

                  if (scheme.url.isNotEmpty)
                    SizedBox(
                      height: 48,
                      child: FilledButton.icon(
                        onPressed: () => _openUrl(context, scheme.url),
                        style: FilledButton.styleFrom(
                          backgroundColor: isDark
                              ? AppColors.forestDark
                              : AppColors.forest,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        icon: const Icon(Icons.open_in_new_rounded, size: 18),
                        label: Text(
                          l10n.schemesOpen,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 14),

                  // Official authority note
                  Text(
                    l10n.schemesCuratedNote,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.5,
                      color: AppColors.muted,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openUrl(BuildContext context, String url) async {
    final messenger = ScaffoldMessenger.of(context);
    final failed = L10n.of(context).appError;
    final uri = Uri.tryParse(url);

    if (uri == null ||
        !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      messenger.showSnackBar(SnackBar(content: Text(failed)));
    }
  }
}

class _SectionBlock extends StatelessWidget {
  const _SectionBlock({
    required this.title,
    required this.items,
    required this.isDark,
  });

  final String title;
  final List<String> items;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 22),
        Text(title.toUpperCase(), style: AppTheme.eyebrow(context)),
        const SizedBox(height: 8),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 7, right: 10),
                  child: Icon(
                    Icons.circle,
                    size: 6,
                    color: isDark ? AppColors.forestDark : AppColors.forest,
                  ),
                ),
                Expanded(
                  child: Text(
                    item,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.5,
                      color: isDark ? AppColors.inkDark : AppColors.ink,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _ErrorView extends ConsumerWidget {
  const _ErrorView({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.account_balance_outlined,
              size: 48,
              color: AppColors.muted,
            ),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => ref.invalidate(schemesProvider),
              icon: const Icon(Icons.refresh),
              label: Text(l10n.appRetry),
            ),
          ],
        ),
      ),
    );
  }
}
