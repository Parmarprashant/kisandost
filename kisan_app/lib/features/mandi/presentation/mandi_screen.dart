import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/mandi_models.dart';
import '../data/mandi_repository.dart';

class MandiScreen extends ConsumerWidget {
  const MandiScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final query = ref.watch(mandiQueryProvider);
    final crops = ref.watch(cropsProvider);
    final price = ref.watch(mandiPriceProvider(query));

    return Scaffold(
      appBar: AppBar(title: Text(l10n.mandiTitle)),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(mandiPriceProvider(query).future),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: [
            _Picker(
              label: l10n.mandiCrop,
              value: query.crop,
              options: crops.value ?? fallbackCrops,
              onChanged: (v) =>
                  ref.read(mandiQueryProvider.notifier).setCrop(v),
            ),
            const SizedBox(height: 12),
            _Picker(
              label: l10n.mandiState,
              value: query.state,
              options: indianStates,
              onChanged: (v) =>
                  ref.read(mandiQueryProvider.notifier).setState(v),
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
    final text = Theme.of(context).textTheme;
    final rupees = NumberFormat.decimalPattern(
      Localizations.localeOf(context).toString(),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: AppColors.primaryContainer,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(price.crop, style: text.titleMedium),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    '₹${rupees.format(price.pricePerQuintal)}',
                    style: text.displaySmall?.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(l10n.mandiPerQuintal, style: text.bodySmall),
                ],
              ),
              if (price.hasRange) ...[
                const SizedBox(height: 6),
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
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Where the number came from. The route reports five different
        // sources and substitutes a calculated baseline when the feed has
        // nothing, so saying which kind this is matters more than the number.
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

        const SizedBox(height: 16),
        // The API can answer with a mandi in a different district from the one
        // requested, so the returned location is shown rather than the query.
        _Row(icon: Icons.storefront_outlined, label: price.location),
        if (price.arrivalDate.isNotEmpty)
          _Row(
            icon: Icons.event_outlined,
            label: l10n.mandiArrival(price.arrivalDate),
          ),
        if (price.variety.isNotEmpty)
          _Row(icon: Icons.grass_outlined, label: price.variety),
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

    final (label, icon, color) = switch (confidence) {
      PriceConfidence.live => (
        l10n.mandiLive,
        Icons.verified_outlined,
        AppColors.success,
      ),
      PriceConfidence.indicative => (
        l10n.mandiIndicative,
        Icons.history,
        AppColors.sky,
      ),
      PriceConfidence.estimated => (
        l10n.mandiEstimate,
        Icons.info_outline,
        AppColors.secondary,
      ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color.withValues(alpha: 0.12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium
                ?.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
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
