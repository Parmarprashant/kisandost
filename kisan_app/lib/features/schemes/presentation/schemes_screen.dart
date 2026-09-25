import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/scheme_models.dart';
import '../data/scheme_repository.dart';

class SchemesScreen extends ConsumerWidget {
  const SchemesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final catalogue = ref.watch(schemesProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.schemesTitle)),
      body: catalogue.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => _Error(error: error),
        data: (data) => _Body(catalogue: data),
      ),
    );
  }
}

class _Body extends ConsumerWidget {
  const _Body({required this.catalogue});

  final SchemeCatalogue catalogue;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final selected = ref.watch(schemeCategoryProvider);
    final schemes = ref.watch(filteredSchemesProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TextField(
            decoration: InputDecoration(
              hintText: l10n.schemesSearch,
              prefixIcon: const Icon(Icons.search),
            ),
            onChanged: (v) => ref.read(schemeSearchProvider.notifier).update(v),
          ),
        ),

        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              _CategoryChip(
                label: l10n.schemesAll,
                selected: selected == null,
                onTap: () {
                  if (selected != null) {
                    ref.read(schemeCategoryProvider.notifier).toggle(selected);
                  }
                },
              ),
              for (final category in catalogue.categories)
                _CategoryChip(
                  label: '${category.icon} ${category.label}',
                  selected: selected == category.id,
                  onTap: () => ref
                      .read(schemeCategoryProvider.notifier)
                      .toggle(category.id),
                ),
            ],
          ),
        ),

        Expanded(
          child: schemes.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Text(
                      l10n.schemesNone,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
                  itemCount: schemes.length + (catalogue.isCurated ? 1 : 0),
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    // The provenance note sits at the end of the list rather
                    // than above it: the schemes are what the farmer came for,
                    // and the caveat belongs after, not in the way.
                    if (i == schemes.length) {
                      return Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          l10n.schemesCuratedNote,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      );
                    }
                    return _SchemeCard(scheme: schemes[i]);
                  },
                ),
        ),
      ],
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
      ),
    );
  }
}

class _SchemeCard extends StatelessWidget {
  const _SchemeCard({required this.scheme});

  final GovScheme scheme;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _SchemeDetail.open(context, scheme),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(scheme.icon, style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // The abbreviation leads — that is what a farmer has
                    // actually heard on the radio.
                    Text(scheme.displayName, style: text.titleMedium),
                    if (scheme.hasDistinctFullName) ...[
                      const SizedBox(height: 2),
                      Text(scheme.name, style: text.labelSmall),
                    ],
                    const SizedBox(height: 8),
                    Text(
                      scheme.description,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: text.bodyLarge,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.muted),
            ],
          ),
        ),
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
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: Text(scheme.displayName)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          Row(
            children: [
              Text(scheme.icon, style: const TextStyle(fontSize: 40)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (scheme.hasDistinctFullName)
                      Text(scheme.name, style: text.titleMedium),
                    Text(scheme.ministry, style: text.labelSmall),
                    if (scheme.launched != null)
                      Text(
                        l10n.schemesLaunched(scheme.launched!),
                        style: text.labelSmall,
                      ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(scheme.description, style: text.bodyLarge),

          _Section(title: l10n.schemesBenefits, items: scheme.benefits),
          _Section(title: l10n.schemesEligibility, items: scheme.eligibility),

          const SizedBox(height: 28),
          if (scheme.url.isNotEmpty)
            FilledButton.icon(
              onPressed: () => _openUrl(context, scheme.url),
              icon: const Icon(Icons.open_in_new),
              label: Text(l10n.schemesOpen),
            ),
          const SizedBox(height: 12),
          // Eligibility rules change and this catalogue is hand-maintained, so
          // the official site is always the authority. Said plainly rather
          // than buried in small print at the bottom of a list.
          Text(l10n.schemesCuratedNote, style: text.bodySmall),
        ],
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

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 24),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 7, right: 10),
                  child: Icon(Icons.circle, size: 7, color: AppColors.primary),
                ),
                Expanded(
                  child: Text(
                    item,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Error extends ConsumerWidget {
  const _Error({required this.error});

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
