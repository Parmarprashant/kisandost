import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../app/shell/app_drawer.dart';
import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/farm_models.dart';
import '../../../app/shell/ask_fab.dart';
import '../../../core/offline/offline_banner.dart';
import '../data/farm_repository.dart';
import 'add_crop_sheet.dart';
import 'field_wizard.dart';

class FarmScreen extends ConsumerWidget {
  const FarmScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final fields = ref.watch(fieldsProvider);

    return Scaffold(
      drawer: const AppDrawer(),
      appBar: AppBar(title: Text(l10n.navFarm)),
      floatingActionButton: FabColumn(
        primary: fields.hasValue && fields.value!.isNotEmpty
            ? FloatingActionButton.extended(
                heroTag: 'farm-add-field',
                onPressed: () => FieldWizard.open(context),
                icon: const Icon(Icons.add),
                label: Text(l10n.farmAddField),
              )
            : null,
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(fieldsProvider.future),
        child: fields.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => _Error(error: error),
          data: (list) {
            if (list.isEmpty) return const _Empty();

            // Non-null only when the network failed and this came off disk.
            // A crop list from last week shown as today's would put someone
            // at the wrong stage of their own calendar.
            final cachedAt = ref.watch(fieldsCachedAtProvider);

            return ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              itemCount: list.length + (cachedAt == null ? 0 : 1),
              separatorBuilder: (_, _) => const SizedBox(height: 16),
              itemBuilder: (context, i) {
                if (cachedAt != null && i == 0) {
                  return CachedNotice(savedAt: cachedAt);
                }
                final field = list[cachedAt == null ? i : i - 1];
                return _FieldCard(field: field);
              },
            );
          },
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    // A scrollable so pull-to-refresh still works on an empty list.
    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 60),
        const Icon(Icons.grass_outlined, size: 64, color: AppColors.muted),
        const SizedBox(height: 20),
        Text(
          l10n.farmNoFields,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          l10n.farmNoFieldsHint,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 28),
        FilledButton.icon(
          onPressed: () => FieldWizard.open(context),
          icon: const Icon(Icons.add),
          label: Text(l10n.farmAddField),
        ),
      ],
    );
  }
}

class _FieldCard extends ConsumerWidget {
  const _FieldCard({required this.field});

  final Field field;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(field.name, style: text.titleMedium),
                      const SizedBox(height: 2),
                      Text(field.areaLabel, style: text.bodySmall),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    Icons.polyline_outlined,
                    color: Color(0xFF2E7D32),
                  ),
                  tooltip: 'Field Geo-Boundary & Zones',
                  onPressed: () => context.push('/fields/${field.id}/boundary'),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  tooltip: l10n.farmDelete,
                  onPressed: () => _confirmDelete(context, ref),
                ),
              ],
            ),

            if (field.location.label.isNotEmpty) ...[
              const SizedBox(height: 4),
              _Detail(icon: Icons.place_outlined, text: field.location.label),
            ],
            if (field.soil.type != null)
              _Detail(icon: Icons.terrain_outlined, text: field.soil.type!),
            if (field.irrigation.method != null)
              _Detail(
                icon: Icons.water_drop_outlined,
                text: field.irrigation.method!,
              ),

            const Divider(height: 28),

            if (field.crops.isEmpty)
              Text(l10n.farmNoCrops, style: text.bodySmall)
            else
              for (final crop in field.crops) _CropRow(crop: crop),

            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => AddCropSheet.open(context, field),
              icon: const Icon(Icons.add),
              label: Text(l10n.farmAddCrop),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final l10n = L10n.of(context);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(l10n.farmDeleteField),
        // Says what else disappears. Deleting a field silently taking its
        // crops with it is the kind of surprise that loses trust.
        content: Text(l10n.farmDeleteFieldNote),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text(l10n.farmCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text(l10n.farmDelete),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    await ref.read(farmRepositoryProvider).deleteField(field.id);
    ref.invalidate(fieldsProvider);
  }
}

class _CropRow extends StatelessWidget {
  const _CropRow({required this.crop});

  final Crop crop;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final sown = DateFormat.yMMMd(Localizations.localeOf(context).toString())
        .format(crop.sowingDate);

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () => context.push('/crops/${crop.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primaryContainer,
                ),
                child: const Icon(Icons.eco, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      crop.variety == null
                          ? crop.cropName
                          : '${crop.cropName} · ${crop.variety}',
                      style: text.bodyLarge,
                    ),
                    Text('$sown · ${crop.areaLabel}', style: text.bodySmall),
                  ],
                ),
              ),
              // Days after sowing is what the advisory engine keys off, and the
              // number a farmer actually thinks in.
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  color: AppColors.primaryContainer,
                ),
                child: Text(
                  l10n.farmDayCount('${crop.daysAfterSowing}'),
                  style: text.labelMedium?.copyWith(color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 6),
              const Icon(Icons.chevron_right, size: 20, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}

class _Detail extends StatelessWidget {
  const _Detail({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.muted),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: Theme.of(context).textTheme.bodySmall),
          ),
        ],
      ),
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

    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 60),
        const Icon(Icons.cloud_off, size: 48, color: AppColors.muted),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center),
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: () => ref.invalidate(fieldsProvider),
          icon: const Icon(Icons.refresh),
          label: Text(l10n.appRetry),
        ),
      ],
    );
  }
}
