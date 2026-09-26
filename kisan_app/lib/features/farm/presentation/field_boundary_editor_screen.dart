import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../data/boundary_models.dart';
import '../data/farm_repository.dart';
import '../../../app/theme/app_colors.dart';

class FieldBoundaryEditorScreen extends ConsumerStatefulWidget {
  const FieldBoundaryEditorScreen({required this.fieldId, super.key});

  final String fieldId;

  @override
  ConsumerState<FieldBoundaryEditorScreen> createState() =>
      _FieldBoundaryEditorScreenState();
}

class _FieldBoundaryEditorScreenState
    extends ConsumerState<FieldBoundaryEditorScreen> {
  final MapController _mapController = MapController();
  final List<LatLng> _points = [];
  bool _isSaving = false;
  bool _isGeneratingZones = false;
  bool _updateFieldArea = true;
  bool _initialLoaded = false;
  LatLng _mapCenter = const LatLng(22.2587, 71.1924);

  @override
  Widget build(BuildContext context) {
    final boundaryAsync = ref.watch(fieldBoundaryProvider(widget.fieldId));
    final zonesAsync = ref.watch(fieldZonesProvider(widget.fieldId));

    // When boundary loads initially, seed points if empty and not yet loaded
    boundaryAsync.whenData((info) {
      if (!_initialLoaded) {
        _initialLoaded = true;
        if (info.points.isNotEmpty) {
          _points.addAll(info.points);
          _mapCenter = info.points.first;
        } else if (info.centerLat != null && info.centerLng != null) {
          _mapCenter = LatLng(info.centerLat!, info.centerLng!);
        }
      }
    });

    final calculatedAcres = FieldBoundaryInfo.calculateAreaInAcres(_points);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Boundary & Zones'),
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
        actions: [
          IconButton(
            tooltip: 'Snap to GPS',
            icon: const Icon(Icons.my_location),
            onPressed: _snapToGps,
          ),
          IconButton(
            tooltip: 'Undo Last Pin',
            icon: const Icon(Icons.undo),
            onPressed: _points.isNotEmpty
                ? () {
                    setState(() => _points.removeLast());
                  }
                : null,
          ),
          IconButton(
            tooltip: 'Clear Boundary',
            icon: const Icon(Icons.delete_outline),
            onPressed: _points.isNotEmpty
                ? () {
                    setState(() => _points.clear());
                  }
                : null,
          ),
        ],
      ),
      body: Column(
        children: [
          // Telemetry and instructions strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppColors.forest,
            child: Row(
              children: [
                const Icon(Icons.touch_app, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _points.length < 3
                        ? 'Tap map to mark field corners (${_points.length}/3 min)'
                        : 'Polygon complete: ${calculatedAcres.toStringAsFixed(2)} Acres',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (_points.length >= 3)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade400,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${(calculatedAcres * 0.404686).toStringAsFixed(2)} Ha',
                      style: const TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Map Area
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: _mapCenter,
                    initialZoom: 16.0,
                    onTap: (tapPosition, point) {
                      setState(() {
                        _points.add(point);
                      });
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.kisandost.app',
                    ),
                    // Existing monitoring zones layer (if any)
                    if (zonesAsync.hasValue && zonesAsync.value!.isNotEmpty)
                      PolygonLayer(
                        polygons: zonesAsync.value!.map((zone) {
                          final color = zone.healthStatus == 'CRITICAL'
                              ? Colors.red
                              : zone.healthStatus == 'WARNING'
                              ? Colors.amber
                              : Colors.blue;
                          return Polygon(
                            points: zone.points,
                            color: color.withValues(alpha: 0.15),
                            borderColor: color.withValues(alpha: 0.8),
                            borderStrokeWidth: 1.5,
                          );
                        }).toList(),
                      ),
                    // Drawn polygon
                    if (_points.length >= 3)
                      PolygonLayer(
                        polygons: [
                          Polygon(
                            points: _points,
                            color: AppColors.forest.withValues(alpha: 0.25),
                            borderColor: AppColors.forest,
                            borderStrokeWidth: 3.0,
                          ),
                        ],
                      ),
                    // Corner Markers
                    MarkerLayer(
                      markers: [
                        for (int i = 0; i < _points.length; i++)
                          Marker(
                            point: _points[i],
                            width: 28,
                            height: 28,
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.forest,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white,
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.2),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  '${i + 1}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),

                // Floating Action Bar on Map
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              Checkbox(
                                value: _updateFieldArea,
                                activeColor: AppColors.forest,
                                onChanged: (val) => setState(
                                  () => _updateFieldArea = val ?? true,
                                ),
                              ),
                              const Expanded(
                                child: Text(
                                  'Sync field registered area with boundary',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  onPressed:
                                      (_points.length < 3 || _isGeneratingZones)
                                      ? null
                                      : _generateZones,
                                  icon: _isGeneratingZones
                                      ? const SizedBox(
                                          width: 14,
                                          height: 14,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Icon(Icons.grid_view, size: 18),
                                  label: const Text('Partition Zones'),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: FilledButton.icon(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.forest,
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  onPressed: (_points.length < 3 || _isSaving)
                                      ? null
                                      : _saveBoundary,
                                  icon: _isSaving
                                      ? const SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white,
                                          ),
                                        )
                                      : const Icon(Icons.check, size: 18),
                                  label: const Text('Save Boundary'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _snapToGps() async {
    try {
      final perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        final req = await Geolocator.requestPermission();
        if (req == LocationPermission.denied ||
            req == LocationPermission.deniedForever) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location permission is required to snap to GPS'),
            ),
          );
          return;
        }
      }
      final pos = await Geolocator.getCurrentPosition();
      final point = LatLng(pos.latitude, pos.longitude);
      _mapController.move(point, 17.0);
      setState(() {
        _points.add(point);
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not obtain current GPS position: $e')),
      );
    }
  }

  Future<void> _saveBoundary() async {
    if (_points.length < 3) return;
    setState(() => _isSaving = true);

    try {
      final ring = _points.map((p) => [p.longitude, p.latitude]).toList();
      // Close polygon loop
      if (ring.first[0] != ring.last[0] || ring.first[1] != ring.last[1]) {
        ring.add([ring.first[0], ring.first[1]]);
      }

      final geoJson = {
        'type': 'Polygon',
        'coordinates': [ring],
      };

      final repo = ref.read(farmRepositoryProvider);
      await repo.saveFieldBoundary(
        widget.fieldId,
        geoJson,
        updateFieldArea: _updateFieldArea,
      );

      ref.invalidate(fieldBoundaryProvider(widget.fieldId));
      ref.invalidate(fieldsProvider);

      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Field boundary saved successfully!'),
          backgroundColor: AppColors.forest,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save boundary: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _generateZones() async {
    setState(() => _isGeneratingZones = true);
    try {
      final repo = ref.read(farmRepositoryProvider);
      await repo.generateFieldZones(widget.fieldId, targetZones: 4);
      ref.invalidate(fieldZonesProvider(widget.fieldId));

      if (!mounted) return;
      setState(() => _isGeneratingZones = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Monitoring zones successfully partitioned!'),
          backgroundColor: AppColors.forest,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isGeneratingZones = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to partition zones: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
