import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../farm/data/farm_models.dart';
import '../../farm/data/farm_repository.dart';
import 'advisory_models.dart';

/// Loads the bundled advisory catalogue once.
final advisoriesProvider = FutureProvider<List<CropAdvisory>>((ref) async {
  final raw = await rootBundle.loadString('assets/advisories.json');
  final decoded = jsonDecode(raw);

  if (decoded is! List) return const [];

  return decoded
      .whereType<Map<String, dynamic>>()
      .map(CropAdvisory.fromJson)
      .where((a) => a.cropType.isNotEmpty && a.stageName.isNotEmpty)
      .toList(growable: false);
});

/// The crops this farmer has in the ground, each with its stage worked out.
///
/// A crop with no advisories in the catalogue still appears, with an empty
/// timeline — the screen says so rather than hiding the crop, because a
/// missing crop looks like the app lost it.
final cropTimelinesProvider =
    Provider<List<({Field field, Crop crop, AdvisoryTimeline timeline})>>((
      ref,
    ) {
      final advisories = ref.watch(advisoriesProvider).value ?? const [];
      final crops = ref.watch(activeCropsProvider);

      return [
        for (final entry in crops)
          (
            field: entry.field,
            crop: entry.crop,
            timeline: AdvisoryTimeline.build(
              cropName: entry.crop.cropName,
              daysAfterSowing: entry.crop.daysAfterSowing,
              all: advisories,
            ),
          ),
      ];
    });
