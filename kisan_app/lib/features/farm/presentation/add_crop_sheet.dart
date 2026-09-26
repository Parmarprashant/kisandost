import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/farm_models.dart';
import '../data/farm_repository.dart';

/// Adds a crop to an existing field.
///
/// A sheet rather than a page: the field is already chosen, so this is three
/// questions, not a journey.
class AddCropSheet extends ConsumerStatefulWidget {
  const AddCropSheet({required this.field, super.key});

  final Field field;

  static Future<void> open(BuildContext context, Field field) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppTheme.radiusSheet),
        ),
      ),
      builder: (_) => AddCropSheet(field: field),
    );
  }

  @override
  ConsumerState<AddCropSheet> createState() => _AddCropSheetState();
}

class _AddCropSheetState extends ConsumerState<AddCropSheet> {
  final _cropName = TextEditingController();
  final _variety = TextEditingController();
  final _area = TextEditingController();
  DateTime _sowingDate = DateTime.now();
  String _areaUnit = 'Acre';
  String? _method;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Most fields grow one crop, so the field's own area is the likeliest
    // answer — pre-filled, but editable.
    _area.text = widget.field.area.toString();
    _areaUnit = widget.field.areaUnit;
  }

  @override
  void dispose() {
    _cropName.dispose();
    _variety.dispose();
    _area.dispose();
    super.dispose();
  }

  bool get _valid =>
      _cropName.text.trim().isNotEmpty &&
      (double.tryParse(_area.text.trim()) ?? 0) > 0;

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await ref
          .read(farmRepositoryProvider)
          .addCrop(
            fieldId: widget.field.id,
            cropName: _cropName.text.trim(),
            sowingDate: _sowingDate,
            cultivatedArea: double.parse(_area.text.trim()),
            cultivatedAreaUnit: _areaUnit,
            variety: _variety.text.trim().isEmpty ? null : _variety.text.trim(),
            cultivationMethod: _method,
          );

      ref.invalidate(fieldsProvider);
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      setState(() {
        _error = switch (error.kind) {
          ApiErrorKind.offline => l10n.appOffline,
          ApiErrorKind.timeout => l10n.appSlow,
          _ => l10n.appError,
        };
      });
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);

    return Padding(
      // Lifts the sheet above the keyboard so the save button stays reachable.
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outline,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                l10n.farmAddCrop,
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 2),
              Text(
                widget.field.name,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 20),

              _Labelled(
                label: l10n.farmCropName,
                child: TextField(
                  controller: _cropName,
                  autofocus: true,
                  textCapitalization: TextCapitalization.sentences,
                  onChanged: (_) => setState(() {}),
                ),
              ),
              _Labelled(
                label: l10n.farmVariety,
                child: TextField(
                  controller: _variety,
                  textCapitalization: TextCapitalization.sentences,
                ),
              ),

              _Labelled(
                label: l10n.farmSowingDate,
                child: InkWell(
                  onTap: () async {
                    final now = DateTime.now();
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _sowingDate,
                      firstDate: DateTime(now.year - 2),
                      lastDate: now,
                    );
                    if (picked != null) setState(() => _sowingDate = picked);
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      suffixIcon: Icon(Icons.calendar_today, size: 20),
                    ),
                    child: Text(
                      MaterialLocalizations.of(context)
                          .formatMediumDate(_sowingDate),
                      style: theme.textTheme.bodyLarge,
                    ),
                  ),
                ),
              ),

              _Labelled(
                label: l10n.farmArea,
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _area,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        initialValue: _areaUnit,
                        isExpanded: true,
                        items: [
                          for (final unit in areaUnits)
                            DropdownMenuItem(value: unit, child: Text(unit)),
                        ],
                        onChanged: (v) {
                          if (v != null) setState(() => _areaUnit = v);
                        },
                      ),
                    ),
                  ],
                ),
              ),

              _Labelled(
                label: l10n.farmCultivationMethod,
                child: DropdownButtonFormField<String>(
                  initialValue: _method,
                  isExpanded: true,
                  items: [
                    for (final method in cultivationMethods)
                      DropdownMenuItem(value: method, child: Text(method)),
                  ],
                  onChanged: (v) => setState(() => _method = v),
                ),
              ),

              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(
                  _error!,
                  style: theme.textTheme.bodyLarge
                      ?.copyWith(color: AppColors.danger),
                ),
              ],

              const SizedBox(height: 16),
              FilledButton(
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
                onPressed: _valid && !_saving ? _save : null,
                child: Text(_saving ? l10n.farmSaving : l10n.farmSave),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Labelled extends StatelessWidget {
  const _Labelled({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 7),
          child,
        ],
      ),
    );
  }
}

