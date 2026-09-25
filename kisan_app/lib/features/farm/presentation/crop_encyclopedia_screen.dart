import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/crop_encyclopedia_models.dart';
import '../../../app/theme/app_colors.dart';

class CropEncyclopediaScreen extends ConsumerStatefulWidget {
  const CropEncyclopediaScreen({super.key});

  @override
  ConsumerState<CropEncyclopediaScreen> createState() =>
      _CropEncyclopediaScreenState();
}

class _CropEncyclopediaScreenState
    extends ConsumerState<CropEncyclopediaScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final locale = Localizations.localeOf(context).languageCode;
    final cropsAsync = ref.watch(cropEncyclopediaProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Crop Reference Guide'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/farm');
            }
          },
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search crops (Wheat, Rice, Cotton, etc.)...',
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                filled: true,
                fillColor: theme.cardColor,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (val) =>
                  setState(() => _search = val.trim().toLowerCase()),
            ),
          ),
          Expanded(
            child: cropsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, _) =>
                  Center(child: Text('Error loading guide: $err')),
              data: (crops) {
                final filtered = crops.where((c) {
                  if (_search.isEmpty) return true;
                  final nameEn = c.name.en.toLowerCase();
                  final nameHi = c.name.hi.toLowerCase();
                  final nameGu = c.name.gu.toLowerCase();
                  return nameEn.contains(_search) ||
                      nameHi.contains(_search) ||
                      nameGu.contains(_search);
                }).toList();

                if (filtered.isEmpty) {
                  return const Center(
                    child: Text('No crops matching your search'),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final crop = filtered[i];
                    return _CropEncyclopediaCard(crop: crop, locale: locale);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CropEncyclopediaCard extends StatelessWidget {
  const _CropEncyclopediaCard({required this.crop, required this.locale});

  final CropEncyclopediaItem crop;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cropName = crop.name.localized(locale);
    final englishName = crop.name.en;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.4)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _showCropDetailModal(context, crop, locale),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 76,
                  height: 76,
                  child: CachedNetworkImage(
                    imageUrl: crop.image,
                    fit: BoxFit.cover,
                    errorWidget: (_, _, _) => Container(
                      color: AppColors.forest.withValues(alpha: 0.1),
                      child: const Icon(Icons.grass, color: AppColors.forest),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          cropName,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (cropName != englishName) ...[
                          const SizedBox(width: 6),
                          Text(
                            '($englishName)',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        _Badge(
                          text: crop.season.localized(locale),
                          color: Colors.amber.shade800,
                          bg: Colors.amber.shade50,
                        ),
                        _Badge(
                          text: 'Water: ${crop.waterNeed.localized(locale)}',
                          color: Colors.blue.shade800,
                          bg: Colors.blue.shade50,
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Soil: ${crop.soilType.localized(locale)} · ${crop.diseases.length} known diseases',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }

  void _showCropDetailModal(
    BuildContext context,
    CropEncyclopediaItem crop,
    String locale,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CropDetailSheet(crop: crop, locale: locale),
    );
  }
}

class _CropDetailSheet extends StatelessWidget {
  const _CropDetailSheet({required this.crop, required this.locale});

  final CropEncyclopediaItem crop;
  final String locale;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cropName = crop.name.localized(locale);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (ctx, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title and image
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          cropName,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.forest,
                          ),
                        ),
                        Text(
                          'Scientific Reference & Agronomic Care',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      width: 60,
                      height: 60,
                      child: CachedNetworkImage(
                        imageUrl: crop.image,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Agronomic Grid
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.forest.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.forest.withValues(alpha: 0.2),
                  ),
                ),
                child: Column(
                  children: [
                    _InfoRow('Growing Season', crop.season.localized(locale)),
                    const Divider(height: 12),
                    _InfoRow(
                      'Optimal Soil Type',
                      crop.soilType.localized(locale),
                    ),
                    const Divider(height: 12),
                    _InfoRow(
                      'Water Requirement',
                      crop.waterNeed.localized(locale),
                    ),
                    const Divider(height: 12),
                    _InfoRow(
                      'General Precautions',
                      crop.precautions.localized(locale),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Disease Profiles
              Text(
                'Common Diseases & Management',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 10),
              for (final disease in crop.diseases)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: theme.cardColor,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            disease.icon,
                            style: const TextStyle(fontSize: 20),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              disease.name.localized(locale),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: AppColors.danger,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Symptoms: ${disease.symptoms.localized(locale)}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Favorable Weather: ${disease.favorableConditions.localized(locale)}',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.health_and_safety,
                              size: 14,
                              color: AppColors.forest,
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Recommended Action: ${disease.management.localized(locale)}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.forest,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

              // Action button to fertilizer calculator
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.forest,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    Navigator.of(context).pop();
                    context.push('/fertilizer');
                  },
                  icon: const Icon(Icons.science_outlined),
                  label: const Text('Calculate Fertilizer Dosage for Crop'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 130,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  const _Badge({required this.text, required this.color, required this.bg});

  final String text;
  final Color color;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }
}
