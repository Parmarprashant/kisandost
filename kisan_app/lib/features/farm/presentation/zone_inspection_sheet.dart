import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../data/boundary_models.dart';
import '../data/crop_detail_models.dart';
import '../data/farm_repository.dart';
import '../data/zone_scan_models.dart';
import '../../../app/theme/app_colors.dart';

/// Modal bottom sheet providing multi-photo zone scouting & progressive inspection
/// using the AgriVision AI diagnostic pipeline.
class ZoneInspectionSheet extends ConsumerStatefulWidget {
  const ZoneInspectionSheet({required this.crop, this.initialZone, super.key});

  final CropDetail crop;
  final FarmZoneSummary? initialZone;

  static Future<void> show(
    BuildContext context, {
    required CropDetail crop,
    FarmZoneSummary? initialZone,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ZoneInspectionSheet(
        crop: crop,
        initialZone: initialZone ?? crop.zone,
      ),
    );
  }

  @override
  ConsumerState<ZoneInspectionSheet> createState() =>
      _ZoneInspectionSheetState();
}

class _ZoneInspectionSheetState extends ConsumerState<ZoneInspectionSheet> {
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _notesController = TextEditingController();

  String? _selectedZoneId;
  String? _selectedZoneName;

  ZoneScoutAngle _selectedAngle = ZoneScoutAngle.screening;
  ZoneScanResult? _activeSession;
  final List<ZoneScanEvidenceItem> _scans = [];
  ZoneScanCompletionSummary? _finalSummary;

  bool _isUploading = false;
  String _uploadStatus = '';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialZone != null && widget.initialZone!.id.isNotEmpty) {
      _selectedZoneId = widget.initialZone!.id;
      _selectedZoneName = widget.initialZone!.displayName;
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickAndUpload(ImageSource source) async {
    final zoneId = _selectedZoneId;
    if (zoneId == null || zoneId.isEmpty) {
      setState(() {
        _errorMessage = 'Please select a field monitoring zone first.';
      });
      return;
    }

    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 3264,
        maxHeight: 3264,
        imageQuality: 95,
      );

      if (picked == null) return;

      setState(() {
        _isUploading = true;
        _errorMessage = null;
        _uploadStatus = _activeSession == null
            ? 'Analyzing initial screening image with AgriVision...'
            : 'Uploading supplementary ${_selectedAngle.label} view...';
      });

      final file = File(picked.path);
      final repo = ref.read(farmRepositoryProvider);

      if (_activeSession == null) {
        // Initial primary screening scan
        final result = await repo.startZoneScan(
          widget.crop.id,
          zoneId,
          file,
          viewAngle: _selectedAngle.code,
        );

        setState(() {
          _activeSession = result;
          _scans.clear();
          if (result.currentScan != null) {
            _scans.add(result.currentScan!);
          } else {
            _scans.addAll(result.scans);
          }
          _isUploading = false;
          _uploadStatus = '';
          _autoAdvanceAngle();
        });
      } else {
        // Supplementary angle scan attached to existing session
        final result = await repo.uploadSupplementaryScan(
          widget.crop.id,
          zoneId,
          _activeSession!.sessionId,
          file,
          viewAngle: _selectedAngle.code,
        );

        setState(() {
          _activeSession = result;
          if (result.currentScan != null) {
            _scans.add(result.currentScan!);
          }
          _isUploading = false;
          _uploadStatus = '';
          _autoAdvanceAngle();
        });
      }
    } catch (e) {
      setState(() {
        _isUploading = false;
        _errorMessage = 'Scan upload failed: ${e.toString()}';
      });
    }
  }

  void _autoAdvanceAngle() {
    final currentAngles = _scans.map((s) => s.viewAngle.toLowerCase()).toSet();
    for (final angle in ZoneScoutAngle.values) {
      if (!currentAngles.contains(angle.code.toLowerCase())) {
        _selectedAngle = angle;
        break;
      }
    }
  }

  Future<void> _finalizeSession() async {
    final session = _activeSession;
    final zoneId = _selectedZoneId;
    if (session == null || zoneId == null) return;

    setState(() {
      _isUploading = true;
      _uploadStatus = 'Consolidating multi-angle evidence & saving audit...';
      _errorMessage = null;
    });

    try {
      final repo = ref.read(farmRepositoryProvider);
      final summary = await repo.completeZoneScan(
        widget.crop.id,
        zoneId,
        session.sessionId,
        notes: _notesController.text,
      );

      // Invalidate relevant providers to update the rest of the application
      ref.invalidate(cropDetailProvider(widget.crop.id));
      ref.invalidate(cropRiskProvider(widget.crop.id));
      ref.invalidate(cropScansProvider(widget.crop.id));
      if (widget.crop.field != null) {
        ref.invalidate(fieldZonesProvider(widget.crop.field!.id));
      }

      setState(() {
        _finalSummary = summary;
        _isUploading = false;
      });
    } catch (e) {
      setState(() {
        _isUploading = false;
        _errorMessage = 'Failed to complete session: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final fieldId = widget.crop.field?.id ?? '';
    final zonesAsync = fieldId.isNotEmpty
        ? ref.watch(fieldZonesProvider(fieldId))
        : const AsyncValue.data(<ZoneItem>[]);

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              _buildDragHandle(theme),
              _buildHeader(theme),
              const Divider(height: 1),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (_finalSummary != null)
                      _buildCompletedView(theme, _finalSummary!)
                    else ...[
                      _buildZoneSelector(theme, zonesAsync),
                      const SizedBox(height: 16),
                      if (_errorMessage != null) _buildErrorCard(theme),
                      if (_activeSession != null) ...[
                        _buildSessionProgressCard(theme, _activeSession!),
                        const SizedBox(height: 16),
                      ],
                      if (_scans.isNotEmpty) ...[
                        _buildGallerySection(theme),
                        const SizedBox(height: 16),
                      ],
                      if (_isUploading)
                        _buildLoadingCard(theme)
                      else if (_activeSession == null ||
                          _activeSession!.remainingAnglesNeeded > 0) ...[
                        _buildAngleSelector(theme),
                        const SizedBox(height: 16),
                        _buildCaptureActions(theme),
                      ],
                      if (_activeSession != null && !_isUploading) ...[
                        const SizedBox(height: 20),
                        _buildFinalizeSection(theme),
                      ],
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDragHandle(ThemeData theme) {
    return Center(
      child: Container(
        width: 40,
        height: 4,
        margin: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: theme.dividerColor.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 16, 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.forest.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.camera_alt_outlined,
              color: AppColors.forest,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Multi-Angle Zone Inspection',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${widget.crop.cropName} · AgriShield Multi-Photo Scouting',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.textTheme.bodySmall?.color?.withValues(
                      alpha: 0.7,
                    ),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }

  Widget _buildZoneSelector(
    ThemeData theme,
    AsyncValue<List<ZoneItem>> zonesAsync,
  ) {
    return Card(
      elevation: 0,
      color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.grid_view_rounded,
                  size: 18,
                  color: AppColors.forest,
                ),
                const SizedBox(width: 8),
                Text(
                  'Target Monitoring Zone',
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            zonesAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (err, _) => Text(
                _selectedZoneName ??
                    'Zone Assigned: ${_selectedZoneId ?? "N/A"}',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              data: (zones) {
                if (zones.isEmpty && _selectedZoneId != null) {
                  return Text(
                    _selectedZoneName ?? 'Assigned Zone: $_selectedZoneId',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  );
                }

                if (zones.isEmpty) {
                  return Text(
                    'No zones partitioned yet for this field. Generate zones in the Field Boundary editor.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: Colors.amber.shade900,
                    ),
                  );
                }

                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: zones.map((z) {
                    final isSelected = _selectedZoneId == z.id;
                    return ChoiceChip(
                      label: Text('${z.zoneCode} — ${z.zoneName}'),
                      selected: isSelected,
                      selectedColor: AppColors.forest.withValues(alpha: 0.2),
                      side: BorderSide(
                        color: isSelected
                            ? AppColors.forest
                            : theme.dividerColor,
                      ),
                      onSelected: _activeSession == null
                          ? (selected) {
                              if (selected) {
                                setState(() {
                                  _selectedZoneId = z.id;
                                  _selectedZoneName =
                                      '${z.zoneCode} — ${z.zoneName}';
                                });
                              }
                            }
                          : null,
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAngleSelector(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Select Perspective Angle',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              _activeSession == null
                  ? 'Step 1 of 4'
                  : 'Step ${_activeSession!.scanCount + 1} of 4',
              style: TextStyle(
                color: AppColors.forest,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ZoneScoutAngle.values.map((angle) {
              final isSelected = _selectedAngle == angle;
              final isAlreadyCaptured = _scans.any(
                (s) => s.viewAngle.toLowerCase() == angle.code,
              );

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isAlreadyCaptured)
                        const Padding(
                          padding: EdgeInsets.only(right: 4),
                          child: Icon(
                            Icons.check_circle,
                            size: 14,
                            color: AppColors.forest,
                          ),
                        ),
                      Text(angle.label),
                    ],
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.forest.withValues(alpha: 0.18),
                  side: BorderSide(
                    color: isSelected
                        ? AppColors.forest
                        : theme.dividerColor.withValues(alpha: 0.6),
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedAngle = angle);
                    }
                  },
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: theme.colorScheme.surfaceContainerHighest.withValues(
              alpha: 0.3,
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, size: 16, color: Colors.grey),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _selectedAngle.hint,
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCaptureActions(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: FilledButton.icon(
            onPressed: () => _pickAndUpload(ImageSource.camera),
            icon: const Icon(Icons.camera_alt),
            label: Text('Take ${_selectedAngle.label}'),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.forest,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        OutlinedButton.icon(
          onPressed: () => _pickAndUpload(ImageSource.gallery),
          icon: const Icon(Icons.photo_library_outlined),
          label: const Text('Gallery'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingCard(ThemeData theme) {
    return Card(
      elevation: 0,
      color: AppColors.forest.withValues(alpha: 0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: AppColors.forest.withValues(alpha: 0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.forest),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              _uploadStatus,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.forest,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Zero-hallucination agronomic diagnostic model running...',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.textTheme.bodySmall?.color?.withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: TextStyle(color: Colors.red.shade900, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionProgressCard(ThemeData theme, ZoneScanResult session) {
    final Color badgeColor;
    final String statusLabel;
    final IconData statusIcon;

    if (session.isHealthy) {
      badgeColor = AppColors.forest;
      statusLabel = 'No Concern Detected (Healthy)';
      statusIcon = Icons.check_circle_outline;
    } else if (session.isPotentialConcern) {
      badgeColor = Colors.orange.shade800;
      statusLabel = 'Potential Concern Detected';
      statusIcon = Icons.warning_amber_rounded;
    } else {
      badgeColor = Colors.amber.shade900;
      statusLabel = 'Inconclusive Screening';
      statusIcon = Icons.help_outline;
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: badgeColor.withValues(alpha: 0.3)),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: badgeColor.withValues(alpha: 0.05),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(statusIcon, color: badgeColor, size: 22),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    statusLabel,
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: badgeColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: badgeColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${session.scanCount}/4 Photos',
                    style: TextStyle(
                      color: badgeColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            if (session.message.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(
                session.message,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
            if (session.guidanceMessage.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: badgeColor.withValues(alpha: 0.2)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.lightbulb_outline, size: 16, color: badgeColor),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        session.guidanceMessage,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: badgeColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (session.evidenceSummary != null &&
                session.evidenceSummary!.diagnoses.isNotEmpty) ...[
              const SizedBox(height: 12),
              _buildEvidenceSummaryBadge(theme, session.evidenceSummary!),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEvidenceSummaryBadge(
    ThemeData theme,
    ZoneEvidenceSummary summary,
  ) {
    final isConsistent = summary.isConsistent;
    final color = isConsistent ? AppColors.forest : Colors.amber.shade900;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(
            isConsistent ? Icons.verified_outlined : Icons.shuffle,
            size: 16,
            color: color,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              isConsistent
                  ? 'Agreement across captures: ${summary.repeatedDiagnosis ?? summary.diagnoses.first}'
                  : 'Diagnostic variation between angles. Supplementary shot advised.',
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGallerySection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Captured Angle Views (${_scans.length})',
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 130,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _scans.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final scan = _scans[index];
              return _buildScanThumbnailCard(theme, scan, index);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildScanThumbnailCard(
    ThemeData theme,
    ZoneScanEvidenceItem scan,
    int index,
  ) {
    return Container(
      width: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor.withValues(alpha: 0.5)),
        color: theme.colorScheme.surface,
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: scan.imageUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: scan.imageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    placeholder: (_, _) => Container(
                      color: Colors.grey.shade200,
                      child: const Center(
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                    ),
                    errorWidget: (_, _, _) => Container(
                      color: Colors.grey.shade100,
                      child: const Icon(
                        Icons.broken_image,
                        size: 24,
                        color: Colors.grey,
                      ),
                    ),
                  )
                : Container(
                    color: Colors.grey.shade100,
                    child: const Icon(
                      Icons.image,
                      size: 24,
                      color: Colors.grey,
                    ),
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(6),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  scan.viewAngleLabel,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.forest,
                  ),
                ),
                Text(
                  scan.diseaseName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFinalizeSection(ThemeData theme) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: theme.dividerColor.withValues(alpha: 0.5)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Field Observations & Notes (Optional)',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText:
                    'e.g. Mild leaf curling visible on northern perimeter...',
                hintStyle: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: theme.dividerColor),
                ),
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _finalizeSession,
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Complete & Finalize Zone Inspection'),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.forest,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompletedView(
    ThemeData theme,
    ZoneScanCompletionSummary summary,
  ) {
    final isHealthy = summary.isHealthy;
    final color = isHealthy ? AppColors.forest : Colors.orange.shade800;

    return Column(
      children: [
        const SizedBox(height: 20),
        Icon(
          isHealthy ? Icons.check_circle : Icons.warning_rounded,
          color: color,
          size: 64,
        ),
        const SizedBox(height: 12),
        Text(
          isHealthy
              ? 'Zone Inspection Complete — Healthy'
              : 'Zone Inspection Complete — Concern Logged',
          textAlign: TextAlign.center,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          summary.message,
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.8),
          ),
        ),
        const SizedBox(height: 20),
        Card(
          elevation: 0,
          color: color.withValues(alpha: 0.08),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: color.withValues(alpha: 0.2)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildSummaryRow(
                  'Final Assessment',
                  summary.evidenceSummary?.repeatedDiagnosis ??
                      (isHealthy ? 'Healthy Foliage' : summary.result),
                  isBold: true,
                ),
                const Divider(height: 16),
                _buildSummaryRow(
                  'Scouted Views',
                  '${summary.scanCount} perspectives',
                ),
                const Divider(height: 16),
                _buildSummaryRow('Audit Status', 'Logged in AgriShield 360°'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.forest,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Done'),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
