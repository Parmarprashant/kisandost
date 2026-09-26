import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../app/theme/kit.dart';
import '../../../l10n/app_localizations.dart';
import '../data/mandi_models.dart';
import '../data/mandi_repository.dart';

/// Standalone mandi screen, with its own app bar.
class MandiScreen extends ConsumerWidget {
  const MandiScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text(L10n.of(context).mandiTitle)),
      body: const MandiBody(),
    );
  }
}

/// The mandi content without a Scaffold, so it can sit inside the Insights
/// tab bar without stacking a second app bar on top of the first.
class MandiBody extends ConsumerWidget {
  const MandiBody({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final query = ref.watch(mandiQueryProvider);
    final crops = ref.watch(cropsProvider);
    final price = ref.watch(mandiPriceProvider(query));

    return RefreshIndicator(
      onRefresh: () async => ref.refresh(mandiPriceProvider(query).future),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          _Picker(
            label: l10n.mandiCrop,
            value: query.crop,
            options: crops.value ?? fallbackCrops,
            onChanged: (v) => ref.read(mandiQueryProvider.notifier).setCrop(v),
          ),
          const SizedBox(height: 12),
          _Picker(
            label: l10n.mandiState,
            value: query.state,
            options: indianStates,
            onChanged: (v) => ref.read(mandiQueryProvider.notifier).setState(v),
          ),
          const SizedBox(height: 24),
          price.when(
            loading: () => const Padding(
              padding: EdgeInsets.symmetric(vertical: 48),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (error, _) => _Error(error: error, query: query),
            data: (data) => _PriceCard(price: data),
          ),
        ],
      ),
    );
  }
}

class _Picker extends StatelessWidget {
  const _Picker({
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<String> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    // A value that is not in the list would make the dropdown assert, which
    // happens whenever the DB crop list and the current selection disagree.
    final items = options.contains(value) ? options : [value, ...options];

    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(labelText: label),
      isExpanded: true,
      items: [
        for (final option in items)
          DropdownMenuItem(value: option, child: Text(option)),
      ],
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }
}

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.price});

  final MandiPrice price;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final text = theme.textTheme;
    final rupees = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        KdCard(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // The API can answer with a mandi in a different district from
              // the one requested, so the returned location is shown here
              // rather than the query the farmer typed.
              Text(
                '${price.crop} · ${price.location}',
                maxLines: 2,
                style: text.bodySmall,
              ),
              const SizedBox(height: 2),
              Figure(
                value: '₹${rupees.format(price.pricePerQuintal)}',
                unit: l10n.mandiPerQuintal,
                size: 40,
              ),
              if (price.hasRange) ...[
                const SizedBox(height: 16),
                // The day's spread, drawn. A farmer deciding whether to load
                // the trolley cares about the bottom of the range, which a
                // single headline figure hides.
                MiniBars(
                  values: [
                    price.minPrice.toDouble(),
                    price.pricePerQuintal.toDouble(),
                    price.maxPrice.toDouble(),
                  ],
                  height: 44,
                ),
                const SizedBox(height: 8),
                Text(
                  // gen_l10n orders placeholder parameters ALPHABETICALLY,
                  // not in the order they appear in the string. For
                  // "Range {min} - {max}" that means the signature is
                  // (max, min). Passing them in reading order silently
                  // renders the range backwards.
                  l10n.mandiRange(
                    '₹${rupees.format(price.maxPrice)}', // {max}
                    '₹${rupees.format(price.minPrice)}', // {min}
                  ),
                  style: text.bodySmall,
                ),
              ],
              const SizedBox(height: 14),
              Divider(height: 1, color: theme.colorScheme.outline),
              const SizedBox(height: 14),

              // Where the number came from. The route reports five different
              // sources and substitutes a calculated baseline when the feed
              // has nothing, so saying which kind this is matters more than
              // the number itself.
              _SourceBadge(confidence: price.confidence),

              if (price.confidence != PriceConfidence.live) ...[
                const SizedBox(height: 10),
                Text(
                  price.confidence == PriceConfidence.indicative
                      ? l10n.mandiIndicativeNote
                      : l10n.mandiEstimateNote,
                  style: text.bodySmall,
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 12),
        KdCard(
          clip: true,
          child: Column(
            children: [
              _Row(icon: Icons.storefront_outlined, label: price.location),
              if (price.arrivalDate.isNotEmpty)
                _Row(
                  icon: Icons.event_outlined,
                  label: l10n.mandiArrival(price.arrivalDate),
                ),
              if (price.variety.isNotEmpty)
                _Row(icon: Icons.grass_outlined, label: price.variety),
            ],
          ),
        ),
      ],
    );
  }
}

class _SourceBadge extends StatelessWidget {
  const _SourceBadge({required this.confidence});

  final PriceConfidence confidence;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return switch (confidence) {
      PriceConfidence.live => ProvenanceChip.always(
        Provenance.live,
        label: l10n.mandiLive,
      ),
      PriceConfidence.indicative => ProvenanceChip(
        Provenance.indicative,
        label: l10n.mandiIndicative,
      ),
      PriceConfidence.estimated => ProvenanceChip(
        Provenance.estimated,
        label: l10n.mandiEstimate,
      ),
    };
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(color: Theme.of(context).colorScheme.outline),
        ),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.muted),
          const SizedBox(width: 10),
          Expanded(
            child: Text(label, style: Theme.of(context).textTheme.bodyLarge),
          ),
        ],
      ),
    );
  }
}

class _Error extends ConsumerWidget {
  const _Error({required this.error, required this.query});

  final Object error;
  final MandiQuery query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          const Icon(
            Icons.price_change_outlined,
            size: 48,
            color: AppColors.muted,
          ),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () => ref.invalidate(mandiPriceProvider(query)),
            icon: const Icon(Icons.refresh),
            label: Text(l10n.appRetry),
          ),
        ],
      ),
    );
  }
}
