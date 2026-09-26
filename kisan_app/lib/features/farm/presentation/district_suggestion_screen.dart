import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../data/district_suggestion_repository.dart';
import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';

class DistrictSuggestionScreen extends ConsumerStatefulWidget {
  const DistrictSuggestionScreen({super.key});

  @override
  ConsumerState<DistrictSuggestionScreen> createState() =>
      _DistrictSuggestionScreenState();
}

class _DistrictSuggestionScreenState
    extends ConsumerState<DistrictSuggestionScreen> {
  final MapController _mapController = MapController();
  LatLng _selectedPoint = const LatLng(22.2587, 71.1924); // Center of Gujarat
  DistrictData? _selectedDistrict;
  bool _isLoadingAdvisory = false;
  String? _advisory;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final districts = ref.read(districtsListProvider).value;
      if (districts != null && districts.isNotEmpty) {
        setState(() {
          _selectedDistrict = districts.first;
        });
      }
    });
  }

  void _onDistrictChanged(DistrictData? district) {
    if (district == null) return;
    setState(() {
      _selectedDistrict = district;
      _advisory = null;
      _error = null;
    });
    _fetchAdvisory(district);
  }

  Future<void> _fetchAdvisory(DistrictData district) async {
    setState(() {
      _isLoadingAdvisory = true;
      _error = null;
    });

    try {
      final repo = ref.read(districtSuggestionRepositoryProvider);
      final result = await repo.getGeminiAdvisory(
        district: district.district,
        season: district.season,
        waterAvailability: district.waterAvailability,
        recommendedCrops: district.crops,
      );
      if (mounted) {
        setState(() {
          _advisory = result;
          _isLoadingAdvisory = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to generate advisory: $e';
          _isLoadingAdvisory = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final districtsAsync = ref.watch(districtsListProvider);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
              child: Row(
                children: [
                  _HeaderButton(
                    icon: Icons.arrow_back,
                    tooltip:
                        MaterialLocalizations.of(context).backButtonTooltip,
                    onTap: () {
                      if (context.canPop()) {
                        context.pop();
                      } else {
                        context.go('/farm');
                      }
                    },
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'District AI Crop Advisor',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Gujarat Agro-climatic Zones',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: districtsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, _) =>
                    Center(child: Text('Error loading districts: $err')),
                data: (districts) {
                  final currentDistrict =
                      _selectedDistrict ??
                      (districts.isNotEmpty ? districts.first : null);

                  return SingleChildScrollView(
                    padding: const EdgeInsets.only(bottom: 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top guidance banner
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                          child: KdCard(
                            background: AppColors.forestTint,
                            outline: AppColors.forestLine,
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.psychology,
                                  color: AppColors.forest,
                                  size: 28,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Grounded Agronomic Intelligence',
                                        style: theme.textTheme.titleSmall?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.forest,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Tap the map or pick your district to evaluate water availability and AI crop viability.',
                                        style: theme.textTheme.bodySmall?.copyWith(
                                          color: theme.colorScheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // District selector dropdown
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                          child: DropdownButtonFormField<DistrictData>(
                            initialValue: currentDistrict,
                            decoration: InputDecoration(
                              labelText: 'Select District (Gujarat)',
                              prefixIcon: const Icon(
                                Icons.location_city,
                                color: AppColors.forest,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            items: districts.map((d) {
                              return DropdownMenuItem<DistrictData>(
                                value: d,
                                child: Text(
                                  '${d.district} (${d.season} · ${d.waterAvailability} Water)',
                                ),
                              );
                            }).toList(),
                            onChanged: _onDistrictChanged,
                          ),
                        ),

                        // Interactive Map View
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                            child: Container(
                              height: 240,
                              decoration: BoxDecoration(
                                border: Border.all(color: theme.colorScheme.outline),
                                borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                              ),
                              child: FlutterMap(
                                mapController: _mapController,
                                options: MapOptions(
                                  initialCenter: _selectedPoint,
                                  initialZoom: 7.0,
                                  onTap: (tapPos, point) {
                                    setState(() => _selectedPoint = point);
                                    if (currentDistrict != null && _advisory == null) {
                                      _fetchAdvisory(currentDistrict);
                                    }
                                  },
                                ),
                                children: [
                                  TileLayer(
                                    urlTemplate:
                                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    userAgentPackageName: 'com.kisandost.app',
                                  ),
                                  MarkerLayer(
                                    markers: [
                                      Marker(
                                        point: _selectedPoint,
                                        width: 40,
                                        height: 40,
                                        child: const Icon(
                                          Icons.location_pin,
                                          color: Colors.red,
                                          size: 36,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        if (currentDistrict != null) ...[
                          // District Agronomic Baseline Card
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: KdCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        currentDistrict.district,
                                        style: theme.textTheme.titleMedium
                                            ?.copyWith(
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 3,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.forestTint,
                                          borderRadius: BorderRadius.circular(
                                              AppTheme.radiusChip),
                                          border: Border.all(
                                              color: AppColors.forestLine),
                                        ),
                                        child: Text(
                                          '${currentDistrict.season} Season',
                                          style: const TextStyle(
                                            color: AppColors.forest,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.water_drop_outlined,
                                        size: 16,
                                        color: AppColors.sky,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        'Water Availability: ${currentDistrict.waterAvailability}',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Wrap(
                                    spacing: 6,
                                    runSpacing: 6,
                                    children: currentDistrict.crops.map((c) {
                                      return Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: theme.colorScheme
                                              .surfaceContainerHighest,
                                          borderRadius: BorderRadius.circular(
                                              AppTheme.radiusChip),
                                          border: Border.all(
                                              color: theme.colorScheme.outline),
                                        ),
                                        child: Text(
                                          c,
                                          style: theme.textTheme.labelMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.w600,
                                              ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    currentDistrict.reason,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // AI Advisory Generation Button / Status
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: FilledButton.icon(
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.forest,
                                foregroundColor: Colors.white,
                                minimumSize: const Size.fromHeight(48),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(
                                      AppTheme.radiusButton),
                                ),
                              ),
                              onPressed: _isLoadingAdvisory
                                  ? null
                                  : () => _fetchAdvisory(currentDistrict),
                              icon: _isLoadingAdvisory
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.auto_awesome),
                              label: Text(
                                _isLoadingAdvisory
                                    ? 'Analyzing Agro-Climatic Data...'
                                    : 'Ask Gemini Agronomic Advisor',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),

                          // Advisory Card
                          if (_isLoadingAdvisory) ...[
                            const Padding(
                              padding: EdgeInsets.all(32),
                              child: Center(
                                child: Column(
                                  children: [
                                    CircularProgressIndicator(),
                                    SizedBox(height: 12),
                                    Text(
                                      'Evaluating temperature windows & soil chemistry...',
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ] else if (_advisory != null) ...[
                            Padding(
                              padding:
                                  const EdgeInsets.fromLTRB(16, 16, 16, 0),
                              child: KdCard(
                                background: AppColors.forestTint,
                                outline: AppColors.forestLine,
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.verified,
                                          color: AppColors.forest,
                                          size: 20,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Gemini Agro-Advisory Report',
                                          style: theme.textTheme.titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.forest,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const Divider(height: 20),
                                    Text(
                                      _advisory!,
                                      style: theme.textTheme.bodyMedium
                                          ?.copyWith(
                                            height: 1.55,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ] else if (_error != null) ...[
                            Padding(
                              padding:
                                  const EdgeInsets.fromLTRB(16, 16, 16, 0),
                              child: KdCard(
                                outline: AppColors.danger,
                                child: Text(
                                  _error!,
                                  style: const TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],

                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({required this.icon, required this.onTap, this.tooltip});

  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            border: Border.all(color: theme.colorScheme.outline),
          ),
          child: Icon(icon, size: 22, color: theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}
