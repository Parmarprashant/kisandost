/// Models for AgriShield 360° telemetry, risk evaluation, GDD thermal cycle,
/// and crop disease scan history.
library;

import 'farm_models.dart';

// ---------------------------------------------------------------- CropDetail

class CropDetail {
  const CropDetail({
    required this.id,
    required this.cropName,
    required this.sowingDate,
    required this.cultivatedArea,
    required this.cultivatedAreaUnit,
    required this.status,
    this.variety,
    this.field,
    this.zone,
    this.currentDas = 0,
    this.currentStageId,
    this.progressionMode = 'DAS_ONLY',
    this.cumulativeGdd,
    this.baseTemperature,
    this.maturityGdd,
    this.expectedHarvestDate,
    this.cultivationMethod,
    this.notes,
  });

  final String id;
  final String cropName;
  final DateTime sowingDate;
  final double cultivatedArea;
  final String cultivatedAreaUnit;
  final String status;
  final String? variety;
  final Field? field;
  final FarmZoneSummary? zone;
  final int currentDas;
  final String? currentStageId;
  final String progressionMode;
  final double? cumulativeGdd;
  final double? baseTemperature;
  final double? maturityGdd;
  final DateTime? expectedHarvestDate;
  final String? cultivationMethod;
  final String? notes;

  bool get isActive => status == 'Active';

  String get areaLabel => '${_trim(cultivatedArea)} $cultivatedAreaUnit';

  factory CropDetail.fromJson(Map<String, dynamic> json) {
    Field? parsedField;
    final rawField = json['fieldId'];
    if (rawField is Map<String, dynamic>) {
      parsedField = Field.fromJson(rawField);
    }

    FarmZoneSummary? parsedZone;
    final rawZone = json['zoneId'];
    if (rawZone is Map<String, dynamic>) {
      parsedZone = FarmZoneSummary.fromJson(rawZone);
    }

    final sowingParsed =
        DateTime.tryParse(json['sowingDate'] as String? ?? '') ??
        DateTime.now();

    final calculatedDas = switch (json['currentDas']) {
      final num n => n.toInt(),
      final String s => int.tryParse(s) ?? 0,
      _ => () {
        final d = DateTime.now().difference(sowingParsed).inDays;
        return d < 0 ? 0 : d;
      }(),
    };

    return CropDetail(
      id: json['_id']?.toString() ?? '',
      cropName: json['cropName'] as String? ?? '',
      sowingDate: sowingParsed,
      cultivatedArea: _toDouble(json['cultivatedArea']),
      cultivatedAreaUnit: json['cultivatedAreaUnit'] as String? ?? 'Acre',
      status: json['status'] as String? ?? 'Active',
      variety: _nonEmpty(json['variety']),
      field: parsedField,
      zone: parsedZone,
      currentDas: calculatedDas,
      currentStageId: _nonEmpty(json['currentStageId']),
      progressionMode: json['progressionMode'] as String? ?? 'DAS_ONLY',
      cumulativeGdd: _toDoubleOrNull(json['cumulativeGdd']),
      baseTemperature: _toDoubleOrNull(json['baseTemperature']),
      maturityGdd: _toDoubleOrNull(json['maturityGdd']),
      expectedHarvestDate: DateTime.tryParse(
        json['expectedHarvestDate'] as String? ?? '',
      ),
      cultivationMethod: _nonEmpty(json['cultivationMethod']),
      notes: _nonEmpty(json['notes']),
    );
  }
}

class FarmZoneSummary {
  const FarmZoneSummary({
    required this.id,
    required this.zoneCode,
    required this.zoneName,
  });

  final String id;
  final String zoneCode;
  final String zoneName;

  String get displayName => '$zoneCode — $zoneName';

  factory FarmZoneSummary.fromJson(Map<String, dynamic> json) {
    return FarmZoneSummary(
      id: json['_id']?.toString() ?? '',
      zoneCode: json['zoneCode'] as String? ?? '',
      zoneName: json['zoneName'] as String? ?? '',
    );
  }
}

// ----------------------------------------------------------- CropRiskSummary

class CropRiskSummary {
  const CropRiskSummary({
    required this.cropId,
    required this.fieldId,
    required this.cropName,
    required this.variety,
    required this.overallStatus,
    required this.overallLevel,
    required this.growthStage,
    this.evaluatedThreats = const [],
    required this.evidenceCompleteness,
    this.zoneId,
    this.lastEvaluatedAt,
  });

  final String cropId;
  final String fieldId;
  final String? zoneId;
  final String cropName;
  final String variety;

  /// 'NO_CONCERN', 'POTENTIAL_CONCERN', 'STABLE', 'ATTENTION', 'HIGH_RISK',
  /// 'INSUFFICIENT_DATA', 'INCONCLUSIVE'.
  final String overallStatus;

  /// 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'.
  final String overallLevel;

  final RiskGrowthStage growthStage;
  final List<RiskEvaluationItem> evaluatedThreats;
  final RiskEvidenceCompleteness evidenceCompleteness;
  final DateTime? lastEvaluatedAt;

  bool get hasThreats => evaluatedThreats.any(
    (t) =>
        t.status == 'ATTENTION' ||
        t.status == 'HIGH_RISK' ||
        t.status == 'POTENTIAL_CONCERN',
  );

  factory CropRiskSummary.fromJson(Map<String, dynamic> json) {
    final threatsList = json['evaluatedThreats'] as List<dynamic>? ?? const [];
    return CropRiskSummary(
      cropId: json['cropId']?.toString() ?? '',
      fieldId: json['fieldId']?.toString() ?? '',
      zoneId: _nonEmpty(json['zoneId']),
      cropName: json['cropName'] as String? ?? '',
      variety: json['variety'] as String? ?? '',
      overallStatus: json['overallStatus'] as String? ?? 'NO_CONCERN',
      overallLevel: json['overallLevel'] as String? ?? 'LOW',
      growthStage: RiskGrowthStage.fromJson(
        json['growthStage'] is Map<String, dynamic>
            ? json['growthStage'] as Map<String, dynamic>
            : const {},
      ),
      evaluatedThreats: threatsList
          .whereType<Map<String, dynamic>>()
          .map(RiskEvaluationItem.fromJson)
          .toList(growable: false),
      evidenceCompleteness: RiskEvidenceCompleteness.fromJson(
        json['evidenceCompleteness'] is Map<String, dynamic>
            ? json['evidenceCompleteness'] as Map<String, dynamic>
            : const {},
      ),
      lastEvaluatedAt: DateTime.tryParse(
        json['lastEvaluatedAt'] as String? ?? '',
      ),
    );
  }
}

class RiskGrowthStage {
  const RiskGrowthStage({
    required this.name,
    required this.currentDas,
    this.cumulativeGdd,
    this.progressionMode = 'DAS_ONLY',
    this.source = 'DAS_INTERVAL',
  });

  final String name;
  final int currentDas;
  final double? cumulativeGdd;
  final String progressionMode;
  final String source;

  factory RiskGrowthStage.fromJson(Map<String, dynamic> json) {
    return RiskGrowthStage(
      name: json['name'] as String? ?? 'Initial Growth',
      currentDas: switch (json['currentDas']) {
        final num n => n.toInt(),
        final String s => int.tryParse(s) ?? 0,
        _ => 0,
      },
      cumulativeGdd: _toDoubleOrNull(json['cumulativeGdd']),
      progressionMode: json['progressionMode'] as String? ?? 'DAS_ONLY',
      source: json['source'] as String? ?? 'DAS_INTERVAL',
    );
  }
}

class RiskEvaluationItem {
  const RiskEvaluationItem({
    required this.ruleId,
    required this.threatId,
    required this.threatName,
    required this.threatCategory,
    required this.status,
    required this.riskLevel,
    required this.explanation,
    this.missingEvidence = const [],
    this.evaluatedAt,
  });

  final String ruleId;
  final String threatId;
  final String threatName;
  final String threatCategory;
  final String status;
  final String riskLevel;
  final String explanation;
  final List<String> missingEvidence;
  final DateTime? evaluatedAt;

  bool get isElevated =>
      status == 'ATTENTION' ||
      status == 'HIGH_RISK' ||
      status == 'POTENTIAL_CONCERN' ||
      riskLevel == 'HIGH' ||
      riskLevel == 'CRITICAL';

  factory RiskEvaluationItem.fromJson(Map<String, dynamic> json) {
    final missingList = json['missingEvidence'] as List<dynamic>? ?? const [];
    return RiskEvaluationItem(
      ruleId: json['ruleId'] as String? ?? '',
      threatId: json['threatId'] as String? ?? '',
      threatName: json['threatName'] as String? ?? '',
      threatCategory: json['threatCategory'] as String? ?? 'OTHER',
      status: json['status'] as String? ?? 'NO_CONCERN',
      riskLevel: json['riskLevel'] as String? ?? 'LOW',
      explanation: json['explanation'] as String? ?? '',
      missingEvidence: missingList.map((e) => e.toString()).toList(),
      evaluatedAt: DateTime.tryParse(json['evaluatedAt'] as String? ?? ''),
    );
  }
}

class RiskEvidenceCompleteness {
  const RiskEvidenceCompleteness({
    this.cropStageAvailable = false,
    this.weatherAvailable = false,
    this.weatherCoveragePercent = 0.0,
    this.imageScanAvailable = false,
    this.varietyDataAvailable = false,
  });

  final bool cropStageAvailable;
  final bool weatherAvailable;
  final double weatherCoveragePercent;
  final bool imageScanAvailable;
  final bool varietyDataAvailable;

  factory RiskEvidenceCompleteness.fromJson(Map<String, dynamic> json) {
    return RiskEvidenceCompleteness(
      cropStageAvailable: json['cropStageAvailable'] as bool? ?? false,
      weatherAvailable: json['weatherAvailable'] as bool? ?? false,
      weatherCoveragePercent:
          _toDoubleOrNull(json['weatherCoveragePercent']) ?? 0.0,
      imageScanAvailable: json['imageScanAvailable'] as bool? ?? false,
      varietyDataAvailable: json['varietyDataAvailable'] as bool? ?? false,
    );
  }
}

// -------------------------------------------------------------- CropScanItem

class CropScanItem {
  const CropScanItem({
    required this.id,
    required this.cropCycleId,
    required this.diagnosis,
    required this.severity,
    required this.confidence,
    this.zoneCode,
    this.zoneName,
    this.imageUrl,
    this.capturedAt,
    this.currentStage,
  });

  final String id;
  final String cropCycleId;
  final String? zoneCode;
  final String? zoneName;
  final String? imageUrl;
  final String diagnosis;
  final String severity;
  final double confidence;
  final DateTime? capturedAt;
  final String? currentStage;

  String? get zoneLabel {
    if (zoneCode != null && zoneName != null) return '$zoneCode — $zoneName';
    return zoneCode ?? zoneName;
  }

  factory CropScanItem.fromJson(Map<String, dynamic> json) {
    String? zCode;
    String? zName;
    final z = json['zoneId'];
    if (z is Map<String, dynamic>) {
      zCode = z['zoneCode'] as String?;
      zName = z['zoneName'] as String?;
    }

    return CropScanItem(
      id: json['_id']?.toString() ?? '',
      cropCycleId: json['cropCycleId']?.toString() ?? '',
      zoneCode: zCode,
      zoneName: zName,
      imageUrl: _nonEmpty(json['imageUrl']),
      diagnosis: json['diagnosis'] as String? ?? 'General Scan',
      severity: json['severity'] as String? ?? 'UNKNOWN',
      confidence: _toDouble(json['confidence']),
      capturedAt: DateTime.tryParse(json['capturedAt'] as String? ?? ''),
      currentStage: _nonEmpty(json['currentStage']),
    );
  }
}

// ------------------------------------------------------------- CropCycleState

class CropCycleState {
  const CropCycleState({
    required this.currentDas,
    required this.progressionMode,
    this.cumulativeGdd,
    this.currentStageName,
    this.status = 'ACTIVE',
  });

  final int currentDas;
  final String progressionMode;
  final double? cumulativeGdd;
  final String? currentStageName;
  final String status;

  factory CropCycleState.fromJson(Map<String, dynamic> json) {
    String? sName;
    final cs = json['currentStage'];
    if (cs is Map<String, dynamic>) {
      sName = cs['stageName'] as String?;
    } else if (cs is String) {
      sName = cs;
    }

    return CropCycleState(
      currentDas: switch (json['currentDas']) {
        final num n => n.toInt(),
        final String s => int.tryParse(s) ?? 0,
        _ => 0,
      },
      progressionMode: json['progressionMode'] as String? ?? 'DAS_ONLY',
      cumulativeGdd: _toDoubleOrNull(json['cumulativeGdd']),
      currentStageName: sName ?? _nonEmpty(json['currentStageId']),
      status: json['status'] as String? ?? 'ACTIVE',
    );
  }
}

// ------------------------------------------------------------------- Helpers

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

double _toDouble(Object? value) => _toDoubleOrNull(value) ?? 0;

double? _toDoubleOrNull(Object? value) => switch (value) {
  final num n => n.toDouble(),
  final String s => double.tryParse(s),
  _ => null,
};

String _trim(double value) {
  if (value == value.roundToDouble()) return value.round().toString();
  return value.toString();
}
