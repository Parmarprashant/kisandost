import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../mandi/data/mandi_models.dart';
import '../data/farm_models.dart';
import '../data/farm_repository.dart';

/// Four steps, one question group per screen, as in `DESIGN.md` §4.4.
///
/// Nothing is pre-selected that the app cannot know. The web wizard defaults
/// to Black Soil / Drip / Borewell, so a farmer who taps through ends up with
/// confident-looking soil data nobody entered — and that data feeds the
/// fertiliser calculator. Here every choice starts empty and "Don't know" is
/// a real option.
class FieldWizard extends ConsumerStatefulWidget {
  const FieldWizard({super.key});

  static Future<void> open(BuildContext context) {
    return Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => const FieldWizard(),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  ConsumerState<FieldWizard> createState() => _FieldWizardState();
}

class _FieldWizardState extends ConsumerState<FieldWizard> {
  static const _totalSteps = 4;

  int _step = 0;
  bool _saving = false;
  bool _locating = false;
  String? _error;

  // Step 1 — the field
  final _name = TextEditingController();
  final _area = TextEditingController();
  String _areaUnit = 'Acre';
  final _village = TextEditingController();
  final _taluka = TextEditingController();
  final _district = TextEditingController();
  String? _state;
  double? _latitude;
  double? _longitude;

  // Step 2 — soil and water
  String? _soilType;
  String? _irrigationMethod;
  String? _waterSource;
  String? _frequency;
  final _previousCrop = TextEditingController();

  // Step 3 — the first crop
  final _cropName = TextEditingController();
  final _variety = TextEditingController();
  DateTime _sowingDate = DateTime.now();
  final _cultivatedArea = TextEditingController();
  String _cultivatedAreaUnit = 'Acre';
  String? _cultivationMethod;

  @override
  void dispose() {
    for (final c in [
      _name,
      _area,
      _village,
      _taluka,
      _district,
      _previousCrop,
      _cropName,
      _variety,
      _cultivatedArea,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  bool get _step1Valid =>
      _name.text.trim().isNotEmpty &&
      double.tryParse(_area.text.trim()) != null &&
      (double.tryParse(_area.text.trim()) ?? 0) > 0;

  bool get _step3Valid => _cropName.text.trim().isEmpty
      // The crop step is optional — a field with no crop yet is valid.
      ? true
      : (double.tryParse(_cultivatedArea.text.trim()) ?? 0) > 0;

  Future<void> _useLocation() async {
    setState(() => _locating = true);
    try {
      if (!await Geolocator.isLocationServiceEnabled()) return;
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return;
      }

      // Without a limit a fix indoors never arrives and the button spins
      // until the app is force-closed. A field is entered from a house as
      // often as from the field itself.
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 20),
        ),
      );
      if (!mounted) return;
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
      });
    } catch (_) {
      // Coordinates are optional on a field, so a failure here just leaves
      // them unset rather than blocking the farmer from saving.
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      final repository = ref.read(farmRepositoryProvider);

      final field = await repository.createField(
        name: _name.text.trim(),
        area: double.parse(_area.text.trim()),
        areaUnit: _areaUnit,
        location: FieldLocation(
          village: _text(_village),
          taluka: _text(_taluka),
          district: _text(_district),
          state: _state,
          latitude: _latitude,
          longitude: _longitude,
        ),
        soil: SoilInfo(type: _keep(_soilType)),
        irrigation: IrrigationInfo(
          method: _keep(_irrigationMethod),
          waterSource: _keep(_waterSource),
          frequency: _keep(_frequency),
        ),
        previousCrop: _text(_previousCrop),
      );

      if (_cropName.text.trim().isNotEmpty) {
        await repository.addCrop(
          fieldId: field.id,
          cropName: _cropName.text.trim(),
          sowingDate: _sowingDate,
          cultivatedArea: double.parse(_cultivatedArea.text.trim()),
          cultivatedAreaUnit: _cultivatedAreaUnit,
          variety: _text(_variety),
          cultivationMethod: _cultivationMethod,
        );
      }

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

  /// "Don't know" is stored as absent rather than as a literal answer — the
  /// database should not contain a soil type of "Don't know".
  String? _keep(String? value) =>
      value == null || value == dontKnow ? null : value;

  String? _text(TextEditingController c) {
    final value = c.text.trim();
    return value.isEmpty ? null : value;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.farmAddField),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: LinearProgressIndicator(value: (_step + 1) / _totalSteps),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  l10n.farmStep('${_step + 1}', '$_totalSteps'),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                switch (_step) {
                  0 => _stepField(l10n),
                  1 => _stepSoil(l10n),
                  2 => _stepCrop(l10n),
                  _ => _stepReview(l10n),
                },
                if (_error != null) ...[
                  const SizedBox(height: 20),
                  Text(
                    _error!,
                    style: Theme.of(context).textTheme.bodyLarge
                        ?.copyWith(color: AppColors.danger),
                  ),
                ],
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _saving
                            ? null
                            : () => setState(() => _step--),
                        child: Text(l10n.farmBack),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: _nextAction(),
                      child: Text(
                        _step == _totalSteps - 1
                            ? (_saving ? l10n.farmSaving : l10n.farmSave)
                            : l10n.farmNext,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  VoidCallback? _nextAction() {
    if (_saving) return null;
    if (_step == 0 && !_step1Valid) return null;
    if (_step == 2 && !_step3Valid) return null;
    if (_step == _totalSteps - 1) return _save;
    return () => setState(() => _step++);
  }

  Widget _stepField(L10n l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _name,
          decoration: InputDecoration(labelText: l10n.farmFieldName),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              flex: 2,
              child: TextField(
                controller: _area,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(labelText: l10n.farmArea),
                onChanged: (_) => setState(() {}),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _Dropdown(
                label: '',
                value: _areaUnit,
                options: areaUnits,
                onChanged: (v) => setState(() => _areaUnit = v),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _village,
          decoration: InputDecoration(labelText: l10n.farmVillage),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _taluka,
          decoration: InputDecoration(labelText: l10n.farmTaluka),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _district,
          decoration: InputDecoration(labelText: l10n.farmDistrict),
        ),
        const SizedBox(height: 16),
        _Dropdown(
          label: l10n.farmState,
          value: _state,
          options: indianStates,
          onChanged: (v) => setState(() => _state = v),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: _locating ? null : _useLocation,
          icon: _locating
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Icon(
                  _latitude == null ? Icons.my_location : Icons.check_circle,
                  color: _latitude == null ? null : AppColors.success,
                ),
          label: Text(l10n.farmUseLocation),
        ),
      ],
    );
  }

  Widget _stepSoil(L10n l10n) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _Dropdown(
          label: l10n.farmSoilType,
          value: _soilType,
          options: soilTypes,
          onChanged: (v) => setState(() => _soilType = v),
        ),
        const SizedBox(height: 16),
        _Dropdown(
          label: l10n.farmIrrigation,
          value: _irrigationMethod,
          options: irrigationMethods,
          onChanged: (v) => setState(() => _irrigationMethod = v),
        ),
        const SizedBox(height: 16),
        _Dropdown(
          label: l10n.farmWaterSource,
          value: _waterSource,
          options: waterSources,
          onChanged: (v) => setState(() => _waterSource = v),
        ),
        const SizedBox(height: 16),
        _Dropdown(
          label: l10n.farmFrequency,
          value: _frequency,
          options: irrigationFrequencies,
          onChanged: (v) => setState(() => _frequency = v),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _previousCrop,
          decoration: InputDecoration(labelText: l10n.farmPreviousCrop),
        ),
      ],
    );
  }

  Widget _stepCrop(L10n l10n) {
    final locale = Localizations.localeOf(context).toString();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _cropName,
          decoration: InputDecoration(labelText: l10n.farmCropName),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _variety,
          decoration: InputDecoration(labelText: l10n.farmVariety),
        ),
        const SizedBox(height: 16),
        _DateField(
          label: l10n.farmSowingDate,
          value: _sowingDate,
          locale: locale,
          onChanged: (date) => setState(() => _sowingDate = date),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              flex: 2,
              child: TextField(
                controller: _cultivatedArea,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                decoration: InputDecoration(labelText: l10n.farmArea),
                onChanged: (_) => setState(() {}),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _Dropdown(
                label: '',
                value: _cultivatedAreaUnit,
                options: areaUnits,
                onChanged: (v) => setState(() => _cultivatedAreaUnit = v),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _Dropdown(
          label: l10n.farmCultivationMethod,
          value: _cultivationMethod,
          options: cultivationMethods,
          onChanged: (v) => setState(() => _cultivationMethod = v),
        ),
      ],
    );
  }

  Widget _stepReview(L10n l10n) {
    final rows = <(String, String?)>[
      (l10n.farmFieldName, _name.text.trim()),
      (l10n.farmArea, '${_area.text.trim()} $_areaUnit'),
      (l10n.farmVillage, _text(_village)),
      (l10n.farmDistrict, _text(_district)),
      (l10n.farmState, _state),
      (l10n.farmSoilType, _soilType),
      (l10n.farmIrrigation, _irrigationMethod),
      (l10n.farmWaterSource, _waterSource),
      (l10n.farmFrequency, _frequency),
      (l10n.farmPreviousCrop, _text(_previousCrop)),
      (l10n.farmCropName, _text(_cropName)),
      (l10n.farmVariety, _text(_variety)),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.farmReview, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 16),
        for (final (label, value) in rows)
          if (value != null && value.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 130,
                    child: Text(
                      label,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      value,
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

class _Dropdown extends StatelessWidget {
  const _Dropdown({
    required this.label,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  final String label;
  final String? value;
  final List<String> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(labelText: label.isEmpty ? null : label),
      items: [
        for (final option in options)
          DropdownMenuItem(value: option, child: Text(option)),
      ],
      onChanged: (v) {
        if (v != null) onChanged(v);
      },
    );
  }
}

class _DateField extends StatelessWidget {
  const _DateField({
    required this.label,
    required this.value,
    required this.locale,
    required this.onChanged,
  });

  final String label;
  final DateTime value;
  final String locale;
  final ValueChanged<DateTime> onChanged;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () async {
        final now = DateTime.now();
        final picked = await showDatePicker(
          context: context,
          initialDate: value,
          // A crop cannot have been sown in the future, and two years back
          // covers any season still standing.
          firstDate: DateTime(now.year - 2),
          lastDate: now,
        );
        if (picked != null) onChanged(picked);
      },
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          suffixIcon: const Icon(Icons.calendar_today, size: 20),
        ),
        child: Text(
          MaterialLocalizations.of(context).formatMediumDate(value),
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}
