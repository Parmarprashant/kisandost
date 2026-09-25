import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../data/district_suggestion_repository.dart';

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
      appBar: AppBar(
        title: const Text('District AI Crop Advisor'),
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
      body: districtsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error loading districts: $err')),
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
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFF2E7D32).withValues(alpha: 0.08),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.psychology,
                        color: Color(0xFF2E7D32),
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
                                color: const Color(0xFF1B5E20),
                              ),
                            ),
                            Text(
                              'Tap the map or pick your district to evaluate water availability and AI crop viability.',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // District selector dropdown
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: DropdownButtonFormField<DistrictData>(
                    initialValue: currentDistrict,
                    decoration: InputDecoration(
                      labelText: 'Select District (Gujarat)',
                      prefixIcon: const Icon(
                        Icons.location_city,
                        color: Color(0xFF2E7D32),
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
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
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      height: 240,
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(
                          initialCenter: _selectedPoint,
                          initialZoom: 7.0,
                          onTap: (tapPos, point) {
                            setState(() => _selectedPoint = point);
                            // If user tapped, keep selected point and ensure advisory is fetched
                            if (currentDistrict != null && _advisory == null) {
                              _fetchAdvisory(currentDistrict);
                            }
                          },
                        ),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
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
                    child: Card(
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: Colors.grey.shade300),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  currentDistrict.district,
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF2E7D32)
                                        .withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${currentDistrict.season} Season',
                                    style: const TextStyle(
                                      color: Color(0xFF2E7D32),
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
                                  color: Colors.blue,
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
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: currentDistrict.crops.map((c) {
                                return Chip(
                                  label: Text(c),
                                  backgroundColor: Colors.grey.shade100,
                                  labelStyle: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  visualDensity: VisualDensity.compact,
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              currentDistrict.reason,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade700,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // AI Advisory Generation Button / Status
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        style: FilledButton.styleFrom(
                          backgroundColor: const Color(0xFF2E7D32),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
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
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                      child: Card(
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(
                            color: Color(0xFF2E7D32),
                            width: 1.5,
                          ),
                        ),
                        color: const Color(0xFF2E7D32).withValues(alpha: 0.03),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.verified,
                                    color: Color(0xFF2E7D32),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Gemini Agro-Advisory Report',
                                    style: theme.textTheme.titleMedium
                                        ?.copyWith(
                                          fontWeight: FontWeight.bold,
                                          color: const Color(0xFF1B5E20),
                                        ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),
                              Text(
                                _advisory!,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  height: 1.55,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ] else if (_error != null) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Text(
                          _error!,
                          style: TextStyle(
                            color: Colors.red.shade900,
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
    );
  }
}
