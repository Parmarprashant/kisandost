import 'dart:math' as math;

/// Standard scouting angle categories recognized by the AgriVision zone
/// inspection engine.
enum ZoneScoutAngle {
  screening(
    'screening',
    'Primary Screening',
    'General overview of affected zone canopy',
  ),
  canopy(
    'canopy',
    'Upper Canopy',
    'Overhead shot showing leaf arrangement & light exposure',
  ),
  underside(
    'underside',
    'Foliar Underside',
    'Underside of leaf where spores and mites colonize',
  ),
  stem(
    'stem',
    'Stem & Crown',
    'Base of plant, stem lesions, and vascular vascular discoloration',
  ),
  fruit(
    'fruit',
    'Fruit & Pods',
    'Close-up of fruit, grain heads, or flower clusters',
  );

  const ZoneScoutAngle(this.code, this.label, this.hint);

  final String code;
  final String label;
  final String hint;

  static ZoneScoutAngle fromCode(String code) {
    for (final angle in ZoneScoutAngle.values) {
      if (angle.code.toLowerCase() == code.toLowerCase()) return angle;
    }
    return ZoneScoutAngle.screening;
  }
}

/// Consolidated evidence across all photo angles captured in a zone session.
class ZoneEvidenceSummary {
  const ZoneEvidenceSummary({
    this.diagnoses = const [],
    this.confidences = const [],
    this.repeatedDiagnosis,
    this.isConsistent = true,
    this.requiresExpertVerification = false,
  });

  final List<String> diagnoses;
  final List<double> confidences;
  final String? repeatedDiagnosis;
  final bool isConsistent;
  final bool requiresExpertVerification;

  factory ZoneEvidenceSummary.fromJson(Map<String, dynamic> json) {
    final diagnoses =
        (json['diagnoses'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        const [];
    final confidences =
        (json['confidences'] as List<dynamic>?)
            ?.map((e) => (e is num) ? e.toDouble() : 0.0)
            .toList() ??
        const [];

    return ZoneEvidenceSummary(
      diagnoses: diagnoses,
      confidences: confidences,
      repeatedDiagnosis: json['repeatedDiagnosis']?.toString(),
      isConsistent: json['isConsistent'] == true,
      requiresExpertVerification: json['requiresExpertVerification'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'diagnoses': diagnoses,
    'confidences': confidences,
    'repeatedDiagnosis': repeatedDiagnosis,
    'isConsistent': isConsistent,
    'requiresExpertVerification': requiresExpertVerification,
  };

  double get averageConfidence {
    if (confidences.isEmpty) return 0.0;
    final sum = confidences.fold(0.0, (prev, c) => prev + c);
    return sum / confidences.length;
  }

  int get averageConfidencePercent => (averageConfidence * 100).round();
}

/// An individual scan capture associated with a zone scouting session.
class ZoneScanEvidenceItem {
  const ZoneScanEvidenceItem({
    required this.scanId,
    required this.imageUrl,
    required this.viewAngle,
    required this.diseaseName,
    required this.confidence,
    this.description = '',
    this.screeningResult = '',
    this.capturedAt,
  });

  final String scanId;
  final String imageUrl;
  final String viewAngle;
  final String diseaseName;
  final double confidence;
  final String description;
  final String screeningResult;
  final DateTime? capturedAt;

  factory ZoneScanEvidenceItem.fromJson(Map<String, dynamic> json) {
    final diagnosis = json['diagnosis'];
    String disease = json['diseaseName']?.toString() ?? '';
    if (disease.isEmpty && diagnosis is Map<String, dynamic>) {
      disease = diagnosis['primaryCondition']?.toString() ?? '';
    }
    if (disease.isEmpty) {
      disease = 'Diagnostic Pending';
    }

    double conf = 0.0;
    if (json['confidence'] is num) {
      conf = (json['confidence'] as num).toDouble();
    } else if (json['confidence'] is Map &&
        (json['confidence']['score'] is num)) {
      conf = (json['confidence']['score'] as num).toDouble();
    }

    return ZoneScanEvidenceItem(
      scanId: json['scanId']?.toString() ?? json['_id']?.toString() ?? '',
      imageUrl: json['imageUrl']?.toString() ?? '',
      viewAngle: json['viewAngle']?.toString() ?? 'screening',
      diseaseName: disease,
      confidence: conf,
      description: json['description']?.toString() ?? '',
      screeningResult: json['screeningResult']?.toString() ?? '',
      capturedAt: DateTime.tryParse(json['capturedAt']?.toString() ?? ''),
    );
  }

  int get confidencePercent => (confidence * 100).round();

  String get viewAngleLabel => ZoneScoutAngle.fromCode(viewAngle).label;

  bool get isHealthy =>
      diseaseName.toLowerCase().contains('healthy') ||
      screeningResult == 'NO_CONCERN_DETECTED';
}

/// Active zone scan progress state returned by the multi-photo inspection pipeline.
class ZoneScanResult {
  const ZoneScanResult({
    required this.sessionId,
    required this.zoneId,
    required this.cropId,
    this.fieldId = '',
    required this.status,
    required this.result,
    required this.requiresAdditionalImages,
    required this.scanCount,
    this.maxAdditionalImages = 3,
    this.currentStep = 1,
    this.message = '',
    this.guidanceMessage = '',
    this.currentScan,
    this.evidenceSummary,
    this.scans = const [],
  });

  final String sessionId;
  final String zoneId;
  final String cropId;
  final String fieldId;
  final String status;
  final String result;
  final bool requiresAdditionalImages;
  final int scanCount;
  final int maxAdditionalImages;
  final int currentStep;
  final String message;
  final String guidanceMessage;
  final ZoneScanEvidenceItem? currentScan;
  final ZoneEvidenceSummary? evidenceSummary;
  final List<ZoneScanEvidenceItem> scans;

  bool get isHealthy => result == 'NO_CONCERN_DETECTED';
  bool get isPotentialConcern => result == 'POTENTIAL_CONCERN';
  bool get isInconclusive => result == 'INCONCLUSIVE';
  bool get isCompleted =>
      status == 'COMPLETED' || (!requiresAdditionalImages && isHealthy);

  int get remainingAnglesNeeded =>
      math.max(0, (1 + maxAdditionalImages) - scanCount);

  factory ZoneScanResult.fromJson(Map<String, dynamic> json) {
    ZoneScanEvidenceItem? current;
    if (json['currentScan'] is Map<String, dynamic>) {
      current = ZoneScanEvidenceItem.fromJson(
        json['currentScan'] as Map<String, dynamic>,
      );
    }

    ZoneEvidenceSummary? evidence;
    if (json['evidenceSummary'] is Map<String, dynamic>) {
      evidence = ZoneEvidenceSummary.fromJson(
        json['evidenceSummary'] as Map<String, dynamic>,
      );
    }

    final rawScans = json['scans'];
    final List<ZoneScanEvidenceItem> scanList = [];
    if (rawScans is List) {
      for (final s in rawScans) {
        if (s is Map<String, dynamic>) {
          scanList.add(ZoneScanEvidenceItem.fromJson(s));
        }
      }
    }
    if (scanList.isEmpty && current != null) {
      scanList.add(current);
    }

    return ZoneScanResult(
      sessionId: json['sessionId']?.toString() ?? '',
      zoneId: json['zoneId']?.toString() ?? '',
      cropId: json['cropId']?.toString() ?? '',
      fieldId: json['fieldId']?.toString() ?? '',
      status: json['status']?.toString() ?? 'INITIAL_SCAN',
      result: json['result']?.toString() ?? 'INCONCLUSIVE',
      requiresAdditionalImages: json['requiresAdditionalImages'] == true,
      scanCount: (json['scanCount'] is num)
          ? (json['scanCount'] as num).toInt()
          : (scanList.isNotEmpty ? scanList.length : 1),
      maxAdditionalImages: (json['maxAdditionalImages'] is num)
          ? (json['maxAdditionalImages'] as num).toInt()
          : 3,
      currentStep: (json['currentStep'] is num)
          ? (json['currentStep'] as num).toInt()
          : 1,
      message: json['message']?.toString() ?? '',
      guidanceMessage: json['guidanceMessage']?.toString() ?? '',
      currentScan: current,
      evidenceSummary: evidence,
      scans: scanList,
    );
  }
}

/// Final summary returned upon completing a multi-angle zone scouting session.
class ZoneScanCompletionSummary {
  const ZoneScanCompletionSummary({
    required this.sessionId,
    required this.zoneId,
    required this.status,
    required this.result,
    required this.scanCount,
    this.evidenceSummary,
    this.completedAt,
    this.scans = const [],
    this.message = 'Scan session completed successfully',
  });

  final String sessionId;
  final String zoneId;
  final String status;
  final String result;
  final int scanCount;
  final ZoneEvidenceSummary? evidenceSummary;
  final DateTime? completedAt;
  final List<ZoneScanEvidenceItem> scans;
  final String message;

  bool get isHealthy => result == 'NO_CONCERN_DETECTED';
  bool get isPotentialConcern => result == 'POTENTIAL_CONCERN';
  bool get isInconclusive => result == 'INCONCLUSIVE';

  factory ZoneScanCompletionSummary.fromJson(Map<String, dynamic> json) {
    final Map<String, dynamic> data =
        json.containsKey('summary') && json['summary'] is Map<String, dynamic>
        ? json['summary'] as Map<String, dynamic>
        : json;

    ZoneEvidenceSummary? evidence;
    if (data['evidenceSummary'] is Map<String, dynamic>) {
      evidence = ZoneEvidenceSummary.fromJson(
        data['evidenceSummary'] as Map<String, dynamic>,
      );
    }

    final rawScans = data['scans'];
    final List<ZoneScanEvidenceItem> scanList = [];
    if (rawScans is List) {
      for (final s in rawScans) {
        if (s is Map<String, dynamic>) {
          scanList.add(ZoneScanEvidenceItem.fromJson(s));
        }
      }
    }

    return ZoneScanCompletionSummary(
      sessionId: data['sessionId']?.toString() ?? '',
      zoneId: data['zoneId']?.toString() ?? '',
      status: data['status']?.toString() ?? 'COMPLETED',
      result: data['result']?.toString() ?? 'NO_CONCERN_DETECTED',
      scanCount: (data['scanCount'] is num)
          ? (data['scanCount'] as num).toInt()
          : scanList.length,
      evidenceSummary: evidence,
      completedAt: DateTime.tryParse(data['completedAt']?.toString() ?? ''),
      scans: scanList,
      message:
          json['message']?.toString() ?? 'Scan session completed successfully',
    );
  }
}
