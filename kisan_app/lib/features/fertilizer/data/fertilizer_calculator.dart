/// Fertiliser dosing, ported from the web app's `fertilizer-calculator` page
/// and `data/fertilizers.ts`.
///
/// Runs entirely on the device: there is no API for this, and a farmer
/// standing in a shop with no signal is exactly who needs the answer.
library;

/// Recommended N-P-K in kg per acre for a full crop cycle.
const cropFormulas = <String, NpkFormula>{
  'Wheat': NpkFormula(n: 120, p: 60, k: 40),
  'Rice': NpkFormula(n: 100, p: 50, k: 50),
  'Maize': NpkFormula(n: 120, p: 60, k: 40),
  'Cotton': NpkFormula(n: 150, p: 75, k: 75),
  'Sugarcane': NpkFormula(n: 250, p: 100, k: 100),
  'Mango': NpkFormula(n: 100, p: 50, k: 100),
  'Groundnut': NpkFormula(n: 20, p: 60, k: 40),
  'Banana': NpkFormula(n: 200, p: 100, k: 250),
  'Tomato': NpkFormula(n: 150, p: 100, k: 100),
  'Potato': NpkFormula(n: 180, p: 100, k: 120),
  'Onion': NpkFormula(n: 120, p: 80, k: 100),
  'Chickpea': NpkFormula(n: 20, p: 50, k: 20),
};

class NpkFormula {
  const NpkFormula({required this.n, required this.p, required this.k});

  final double n;
  final double p;
  final double k;
}

/// Nutrient content of the three fertilisers Indian farmers actually buy.
const _ureaN = 0.46;
const _dapN = 0.18;
const _dapP = 0.46;
const _mopK = 0.60;

const bagSizeKg = 50;

/// Indicative shop prices per kg in rupees. Hardcoded in the web app too, and
/// they do move — so the UI labels the cost as an estimate rather than a quote.
const _ureaPricePerKg = 6.0;
const _dapPricePerKg = 24.0;
const _mopPricePerKg = 34.0;

/// Sandy soil leaches nutrients and needs more; clay holds them and needs less.
const soilAdjustments = <String, double>{
  'Loamy': 1.0,
  'Sandy': 1.2,
  'Clay': 0.9,
  'Black': 1.0,
  'Alluvial': 1.0,
};

class FertilizerResult {
  const FertilizerResult({
    required this.ureaKg,
    required this.dapKg,
    required this.mopKg,
    required this.totalBags,
    required this.estimatedCost,
    required this.reducedBySoilTest,
  });

  final int ureaKg;
  final int dapKg;
  final int mopKg;
  final int totalBags;
  final int estimatedCost;

  /// True when a soil test reduced the dose. Worth saying out loud: it means
  /// the farmer is being told to buy *less* than the default, which is money
  /// saved and a claim they deserve to see justified.
  final bool reducedBySoilTest;

  bool get isEmpty => ureaKg == 0 && dapKg == 0 && mopKg == 0;
}

/// Works out how much urea, DAP and MOP to buy.
///
/// [existingN], [existingP] and [existingK] are kg/acre already in the soil
/// from a soil health card. Passing them reduces the dose, which is the whole
/// point of having the card.
FertilizerResult calculateFertilizer({
  required String crop,
  required double acres,
  required String soilType,
  double existingN = 0,
  double existingP = 0,
  double existingK = 0,
}) {
  final formula = cropFormulas[crop];
  if (formula == null || acres <= 0) {
    return const FertilizerResult(
      ureaKg: 0,
      dapKg: 0,
      mopKg: 0,
      totalBags: 0,
      estimatedCost: 0,
      reducedBySoilTest: false,
    );
  }

  final multiplier = soilAdjustments[soilType] ?? 1.0;

  // What the crop needs, adjusted for how the soil holds nutrients.
  final targetN = formula.n * multiplier;
  final targetP = formula.p * multiplier;
  final targetK = formula.k * multiplier;

  // Subtract what the soil already has. Clamped at zero: a soil test showing
  // plenty of phosphorus means buy none, never "negative DAP".
  final neededN = (targetN - existingN).clamp(0.0, double.infinity);
  final neededP = (targetP - existingP).clamp(0.0, double.infinity);
  final neededK = (targetK - existingK).clamp(0.0, double.infinity);

  final reduced = neededN < targetN || neededP < targetP || neededK < targetK;

  // DAP first, because it is the practical source of phosphorus.
  final dapKg = neededP / _dapP;

  // DAP carries 18% nitrogen, so urea only covers the shortfall. Ignoring
  // this over-applies nitrogen, which burns the crop and wastes money.
  final nitrogenFromDap = dapKg * _dapN;
  final ureaKg = ((neededN - nitrogenFromDap) / _ureaN).clamp(
    0.0,
    double.infinity,
  );

  final mopKg = neededK / _mopK;

  final totalKg = (dapKg + ureaKg + mopKg) * acres;
  final cost =
      (ureaKg * _ureaPricePerKg +
          dapKg * _dapPricePerKg +
          mopKg * _mopPricePerKg) *
      acres;

  return FertilizerResult(
    ureaKg: (ureaKg * acres).round(),
    dapKg: (dapKg * acres).round(),
    mopKg: (mopKg * acres).round(),
    totalBags: (totalKg / bagSizeKg).ceil(),
    estimatedCost: cost.round(),
    reducedBySoilTest: reduced,
  );
}
