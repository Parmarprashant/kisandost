/// Stage-by-stage crop advisories.
///
/// The web app computed these server-side: `/api/crop-stage` looked up a
/// `CropAdvisory` document by crop and days-after-sowing. That route now
/// returns a hardcoded block of nulls and `/api/farmer-crops` returns an empty
/// list, so there is nothing live to call.
///
/// The advisory content itself still exists, in the seeder that populates the
/// collection, and it is small, static and identical for every user. So it is
/// bundled as an asset and the stage is computed on the device — the same
/// decision as the fertilizer calculator, and for the same reasons: it works
/// with no signal, and it does not depend on a route someone else may change.
library;

class CropAdvisory {
  const CropAdvisory({
    required this.cropType,
    required this.stageName,
    required this.startDay,
    required this.endDay,
    required this.pesticideName,
    required this.dosagePerAcre,
    required this.purpose,
  });

  /// Lowercase, as the source data stores it.
  final String cropType;

  final String stageName;

  /// Inclusive day range after sowing that this stage covers.
  final int startDay;
  final int endDay;

  final String pesticideName;

  /// Grams or millilitres per acre depending on the formulation — the source
  /// data does not record which, so nothing here converts or scales it.
  final num dosagePerAcre;

  final String purpose;

  bool covers(int daysAfterSowing) =>
      daysAfterSowing >= startDay && daysAfterSowing <= endDay;

  /// Dose for [acres], rounded to something a farmer can measure.
  num dosageFor(double acres) {
    if (acres <= 0) return dosagePerAcre;
    return (dosagePerAcre * acres).round();
  }

  factory CropAdvisory.fromJson(Map<String, dynamic> json) {
    return CropAdvisory(
      cropType: (json['cropType'] as String? ?? '').trim().toLowerCase(),
      stageName: json['stageName'] as String? ?? '',
      startDay: _toInt(json['daysAfterSowingStart']),
      endDay: _toInt(json['daysAfterSowingEnd']),
      pesticideName: json['pesticideName'] as String? ?? '',
      dosagePerAcre: json['dosagePerAcre'] is num
          ? json['dosagePerAcre'] as num
          : 0,
      purpose: json['purpose'] as String? ?? '',
    );
  }
}

/// Where a crop sits along its advisory stages right now.
class AdvisoryTimeline {
  const AdvisoryTimeline({
    required this.daysAfterSowing,
    required this.stages,
    required this.current,
    required this.next,
  });

  final int daysAfterSowing;

  /// Every stage known for this crop, in day order.
  final List<CropAdvisory> stages;

  /// The stage the crop is in today, if any stage covers this day.
  ///
  /// Null is a real answer, not a failure: the seeded data has gaps between
  /// stages (wheat jumps from day 25 to day 40), and inventing an advisory to
  /// fill one would put a spray recommendation in a farmer's hands for a week
  /// when nobody said to spray.
  final CropAdvisory? current;

  /// The next stage that has not started yet.
  final CropAdvisory? next;

  bool get hasAnything => stages.isNotEmpty;

  /// Days until [next] begins. Null when there is no next stage.
  int? get daysUntilNext {
    final upcoming = next;
    if (upcoming == null) return null;
    final gap = upcoming.startDay - daysAfterSowing;
    return gap < 0 ? 0 : gap;
  }

  /// Stages already finished, for the completed part of the timeline.
  List<CropAdvisory> get past =>
      stages.where((s) => s.endDay < daysAfterSowing).toList(growable: false);

  /// Builds a timeline from every advisory known for a crop.
  ///
  /// [all] may contain other crops; it is filtered here so callers can pass
  /// the whole catalogue.
  factory AdvisoryTimeline.build({
    required String cropName,
    required int daysAfterSowing,
    required List<CropAdvisory> all,
  }) {
    final key = cropName.trim().toLowerCase();
    final stages = all.where((a) => a.cropType == key).toList()
      ..sort((a, b) => a.startDay.compareTo(b.startDay));

    CropAdvisory? current;
    for (final stage in stages) {
      if (stage.covers(daysAfterSowing)) {
        current = stage;
        break;
      }
    }

    CropAdvisory? next;
    for (final stage in stages) {
      if (stage.startDay > daysAfterSowing) {
        next = stage;
        break;
      }
    }

    return AdvisoryTimeline(
      daysAfterSowing: daysAfterSowing,
      stages: stages,
      current: current,
      next: next,
    );
  }
}

int _toInt(Object? value) {
  if (value is int) return value;
  if (value is num) return value.round();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}
