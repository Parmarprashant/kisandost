/// Models for `POST /api/detect-disease`.
///
/// The route normalises the AgriVision engine's raw payload before returning
/// it, so this parses the normalised shape (`AgriVisionDiseaseResult` in
/// `lib/agriVisionService.ts`), not the engine's own.
library;

class Diagnosis {
  const Diagnosis({
    required this.cropName,
    required this.diseaseName,
    required this.confidence,
    required this.description,
    required this.symptoms,
    required this.causes,
    required this.precautions,
    required this.pesticides,
    required this.fertilizers,
    required this.requiresExpertVerification,
    this.focusRegion,
    this.diagnostics,
  });

  /// What the model itself reported, when the route passes it through.
  ///
  /// Null on an older backend. Never shown to a farmer as-is — it is English
  /// and technical — but it is what makes "why was my photo rejected"
  /// answerable instead of a guess.
  final ModelDiagnostics? diagnostics;

  final String cropName;
  final String diseaseName;

  /// 0–100, as the API sends it.
  final int confidence;

  final String description;
  final List<String> symptoms;
  final List<String> causes;

  /// Cultural practices — the non-chemical actions.
  final List<String> precautions;

  final List<RecommendedProduct> pesticides;
  final List<RecommendedProduct> fertilizers;

  /// The engine's own flag for a low-certainty call. When set, the UI says so
  /// plainly rather than presenting the diagnosis as settled — spraying the
  /// wrong chemical costs a farmer money and can damage the crop.
  final bool requiresExpertVerification;

  final FocusRegion? focusRegion;

  /// The API signals "nothing wrong" through the disease name rather than a
  /// boolean, so the sentinel values are matched here in one place.
  bool get isHealthy {
    if (isInconclusive) return false;
    final name = diseaseName.trim().toLowerCase();
    return name == 'healthy plant' ||
        name == 'healthy crop' ||
        name == 'healthy';
  }

  /// The engine could not read the photo well enough to judge it.
  ///
  /// It reports this by putting a message where a disease name belongs —
  /// "Image Quality Insufficient", with `confidence: 0` — rather than by a
  /// status field. Treating that as a diagnosis would tell a farmer their crop
  /// has a disease called "Image Quality Insufficient", so it gets its own
  /// state: the answer is "take a better photo", not a treatment.
  bool get isInconclusive {
    final name = diseaseName.trim().toLowerCase();
    return name.contains('image quality') ||
        name.contains('insufficient') ||
        name.contains('not a plant') ||
        name.contains('unable to') ||
        (confidence == 0 && requiresExpertVerification);
  }

  bool get hasProducts => pesticides.isNotEmpty || fertilizers.isNotEmpty;

  factory Diagnosis.fromJson(Map<String, dynamic> json) {
    return Diagnosis(
      cropName: json['cropName'] as String? ?? '',
      diseaseName: json['diseaseName'] as String? ?? '',
      confidence: _toInt(json['confidence']).clamp(0, 100),
      description: json['description'] as String? ?? '',
      symptoms: _toStringList(json['symptoms']),
      causes: _toStringList(json['causes']),
      precautions: _toStringList(json['precautions']),
      pesticides: _toProducts(json['recommendedPesticides']),
      fertilizers: _toProducts(json['recommendedFertilizers']),
      requiresExpertVerification:
          json['requiresExpertVerification'] as bool? ?? false,
      focusRegion: json['focusRegion'] is Map<String, dynamic>
          ? FocusRegion.fromJson(json['focusRegion'] as Map<String, dynamic>)
          : null,
      diagnostics: json['diagnostics'] is Map<String, dynamic>
          ? ModelDiagnostics.fromJson(
              json['diagnostics'] as Map<String, dynamic>,
            )
          : null,
    );
  }
}

/// A product the farmer can actually buy.
///
/// The route tries to match the engine's generic chemical names against the
/// `AgriProduct` collection, but that lookup is allowed to fail silently — so
/// everything except the name may be absent, and the UI must cope.
class RecommendedProduct {
  const RecommendedProduct({
    required this.name,
    this.productId,
    this.price,
    this.brand,
  });

  final String name;
  final String? productId;
  final num? price;
  final String? brand;

  /// Only a matched product can be opened in the catalogue.
  bool get isPurchasable => productId != null && productId!.isNotEmpty;

  factory RecommendedProduct.fromJson(Map<String, dynamic> json) {
    return RecommendedProduct(
      name: json['name'] as String? ?? '',
      productId: json['productId'] as String?,
      price: json['price'] as num?,
      brand: json['brand'] as String?,
    );
  }
}

/// Where the engine decided to look, as normalised `[ymin, xmin, ymax, xmax]`
/// in 0–1 coordinates. Drawn over the photo so the farmer can see whether it
/// actually looked at the damaged part.
class FocusRegion {
  const FocusRegion({
    required this.isFocused,
    required this.box,
    required this.message,
  });

  final bool isFocused;
  final List<double> box;
  final String message;

  double get top => box[0];
  double get left => box[1];
  double get height => box[2] - box[0];
  double get width => box[3] - box[1];

  /// A box is only drawable if all four numbers arrived and describe a real
  /// rectangle; a malformed one silently disables the overlay.
  bool get isDrawable =>
      isFocused &&
      box.length == 4 &&
      height > 0 &&
      width > 0 &&
      box.every((v) => v >= 0 && v <= 1);

  factory FocusRegion.fromJson(Map<String, dynamic> json) {
    final raw = json['boxNormalized'];
    final box = raw is List
        ? raw.map((v) => v is num ? v.toDouble() : 0.0).toList(growable: false)
        : const <double>[];

    return FocusRegion(
      isFocused: json['isFocused'] as bool? ?? false,
      box: box,
      message: json['message'] as String? ?? '',
    );
  }
}

List<String> _toStringList(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<String>()
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList(growable: false);
}

List<RecommendedProduct> _toProducts(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<Map<String, dynamic>>()
      .map(RecommendedProduct.fromJson)
      .where((p) => p.name.isNotEmpty)
      .toList(growable: false);
}

int _toInt(Object? value) => switch (value) {
  final num n => n.toInt(),
  final String s => int.tryParse(s) ?? num.tryParse(s)?.toInt() ?? 0,
  _ => 0,
};

/// The model's own verdict, passed through untouched by the route.
///
/// Exists because the farmer-facing copy is generated from templates: when a
/// photo was rejected the app used to say it was "wide-angle or distant" no
/// matter what actually went wrong, which sent people back to photograph the
/// same leaf the same wrong way.
class ModelDiagnostics {
  const ModelDiagnostics({
    this.gateStatus,
    this.cropStatus,
    this.rejectionReason,
    this.rejectionReasons = const [],
    this.rawTopPrediction,
    this.rawConfidence,
    this.accepted,
    this.endpoint,
  });

  /// "REJECTED" when the quality gate refused the image.
  final String? gateStatus;

  /// e.g. "IMAGE_QUALITY_FAILURE", "OK".
  final String? cropStatus;

  /// Why, in the model's words.
  final String? rejectionReason;
  final List<String> rejectionReasons;

  /// What the classifier would have said before the gate overruled it.
  final String? rawTopPrediction;
  final double? rawConfidence;

  final bool? accepted;

  /// Which service answered — the hosted model or a local one. Worth knowing
  /// when a result looks wrong.
  final String? endpoint;

  bool get wasRejected =>
      accepted == false || (gateStatus ?? '').toUpperCase() == 'REJECTED';

  /// Every distinct reason, with the boilerplate prefix stripped.
  List<String> get reasons {
    final all = <String>[...rejectionReasons, ?rejectionReason];

    final cleaned = all
        .map(
          (r) => r
              .replaceFirst(
                RegExp(r'^Image quality gate failed:\s*', caseSensitive: false),
                '',
              )
              .trim(),
        )
        .where((r) => r.isNotEmpty);

    return {...cleaned}.toList(growable: false);
  }

  /// Flattened for the technical details panel, in a stable order.
  Map<String, String> get asLines => {
    'gate': ?gateStatus,
    'crop': ?cropStatus,
    if (accepted != null) 'accepted': '$accepted',
    'top prediction': ?rawTopPrediction,
    'raw confidence': ?rawConfidence?.toStringAsFixed(3),
    for (final (i, reason) in reasons.indexed) 'reason ${i + 1}': reason,
    'endpoint': ?endpoint,
  };

  factory ModelDiagnostics.fromJson(Map<String, dynamic> json) {
    return ModelDiagnostics(
      gateStatus: _nonEmptyString(json['gateStatus']),
      cropStatus: _nonEmptyString(json['cropStatus']),
      rejectionReason: _nonEmptyString(json['rejectionReason']),
      rejectionReasons: _toStringList(json['rejectionReasons']),
      rawTopPrediction: _nonEmptyString(json['rawTopPrediction']),
      rawConfidence: json['rawConfidence'] is num
          ? (json['rawConfidence'] as num).toDouble()
          : null,
      accepted: json['accepted'] is bool ? json['accepted'] as bool : null,
      endpoint: _nonEmptyString(json['endpoint']),
    );
  }
}

String? _nonEmptyString(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}
