/// Models for the two prediction routes.
///
/// They are separate services with different shapes and different units, so
/// they get separate models rather than one merged type:
///
/// - `POST /api/yield-prediction` — yield in tonnes, plus a regional baseline
///   to compare against. Field names are snake_case.
/// - `POST /api/predict-yield` — yield in quintals, plus live mandi price and
///   a margin. Field names are camelCase.
library;

class YieldPrediction {
  const YieldPrediction({
    required this.crop,
    required this.totalYield,
    required this.yieldPerAcre,
    required this.regionalYield,
    required this.regionalPerAcre,
    required this.areaAcres,
    required this.percentDifference,
    required this.isAboveAverage,
    required this.insights,
  });

  final String crop;

  /// Tonnes across the whole area.
  final double totalYield;

  final double yieldPerAcre;

  /// What the region typically manages, for the same area.
  final double regionalYield;
  final double regionalPerAcre;

  final double areaAcres;

  /// Signed: negative means below the regional baseline.
  final double percentDifference;

  final bool isAboveAverage;

  /// A sentence the route composes explaining which input held the yield back.
  final String insights;

  bool get hasBaseline => regionalPerAcre > 0;

  factory YieldPrediction.fromJson(Map<String, dynamic> json) {
    return YieldPrediction(
      crop: json['crop'] as String? ?? '',
      totalYield: _toDouble(json['total_yield']),
      yieldPerAcre: _toDouble(json['yield_per_acre']),
      regionalYield: _toDouble(json['average_regional_yield']),
      regionalPerAcre: _toDouble(json['average_regional_per_acre']),
      areaAcres: _toDouble(json['area_acres']),
      percentDifference: _toDouble(json['percent_difference']),
      isAboveAverage: json['is_above_average'] as bool? ?? false,
      insights: json['insights'] as String? ?? '',
    );
  }
}

class ProfitPrediction {
  const ProfitPrediction({
    required this.predictedYield,
    required this.pricePerQuintal,
    required this.expectedRevenue,
    required this.totalCost,
    required this.margin,
    required this.fertilizerCost,
    required this.pesticideCost,
    required this.irrigationCost,
    required this.confidence,
    required this.recommendation,
    this.mandi,
  });

  /// Quintals — note the unit differs from [YieldPrediction].
  final double predictedYield;

  final double pricePerQuintal;
  final double expectedRevenue;

  /// Only the three input costs that were entered.
  final double totalCost;

  /// Revenue minus those input costs.
  ///
  /// The API calls this "profit", but it counts only fertiliser, pesticide and
  /// irrigation — not seed, labour, land rent, machinery or transport. Calling
  /// it profit to a farmer deciding what to plant would badly overstate what
  /// they take home, so it is named margin here and labelled as such in the UI.
  final double margin;

  final double fertilizerCost;
  final double pesticideCost;
  final double irrigationCost;

  /// 0–1 as the route sends it.
  final double confidence;

  final String recommendation;
  final MandiDetails? mandi;

  int get confidencePercent => (confidence * 100).round().clamp(0, 100);

  bool get isProfitable => margin > 0;

  /// Share of the margin each input cost represents, for the cost breakdown.
  double get costShare =>
      expectedRevenue <= 0 ? 0 : totalCost / expectedRevenue;

  factory ProfitPrediction.fromJson(Map<String, dynamic> json) {
    final mandi = json['mandiDetails'];

    return ProfitPrediction(
      predictedYield: _toDouble(json['predictedYield']),
      pricePerQuintal: _toDouble(json['pricePerQuintal']),
      expectedRevenue: _toDouble(json['expectedRevenue']),
      totalCost: _toDouble(json['totalCost']),
      margin: _toDouble(json['predictedProfit']),
      fertilizerCost: _toDouble(json['fertilizerCost']),
      pesticideCost: _toDouble(json['pesticideCost']),
      irrigationCost: _toDouble(json['irrigationCost']),
      confidence: _toDouble(json['confidenceScore']),
      recommendation: json['recommendation'] as String? ?? '',
      mandi: mandi is Map<String, dynamic>
          ? MandiDetails.fromJson(mandi)
          : null,
    );
  }
}

/// Where the price in a profit estimate came from.
class MandiDetails {
  const MandiDetails({
    required this.market,
    required this.district,
    required this.state,
    required this.arrivalDate,
    required this.source,
    required this.minPrice,
    required this.maxPrice,
  });

  final String market;
  final String district;
  final String state;
  final String arrivalDate;
  final String source;
  final double minPrice;
  final double maxPrice;

  /// Same distinction the mandi screen makes: a real government reading versus
  /// a calculated baseline. A margin built on an invented price is a guess.
  bool get isLive => source.toLowerCase().contains('live apmc');

  bool get hasRange => maxPrice > minPrice && minPrice > 0;

  String get location =>
      [market, district, state].where((p) => p.isNotEmpty).join(' · ');

  factory MandiDetails.fromJson(Map<String, dynamic> json) {
    return MandiDetails(
      market: json['market'] as String? ?? '',
      district: json['district'] as String? ?? '',
      state: json['state'] as String? ?? '',
      arrivalDate: json['arrivalDate'] as String? ?? '',
      source: json['source'] as String? ?? '',
      minPrice: _toDouble(json['minPrice']),
      maxPrice: _toDouble(json['maxPrice']),
    );
  }
}

/// Sensible starting points so the forms are not blank.
///
/// NDVI stays user-entered by decision: the dashboard value in the web app is
/// hardcoded at 0.78 and there is no satellite source wired up, so inventing
/// one here would be the same fake in a new place.
const defaultNdvi = 0.65;
const defaultSoilMoisture = 40.0;
const defaultRainfall = 600.0;

/// Typical soil-test figures in kg/acre, used only as form defaults.
const defaultNitrogen = 120.0;
const defaultPhosphorus = 30.0;
const defaultPotassium = 25.0;

double _toDouble(Object? value) => switch (value) {
  final num n => n.toDouble(),
  final String s => double.tryParse(s) ?? 0,
  _ => 0,
};
