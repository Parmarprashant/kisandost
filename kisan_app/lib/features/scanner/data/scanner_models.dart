/// Pesticide QR verification.
///
/// `POST /api/verify-pesticide` looks a code up in a registry of known
/// products and answers one of three ways. The distinction matters more than
/// a boolean would suggest: "not in the registry" is not the same claim as
/// "we know this is counterfeit", and telling a farmer their stock is fake
/// when the registry simply has not heard of it would be its own harm.
library;

enum VerificationVerdict {
  /// In the registry and marked authentic.
  genuine,

  /// In the registry and flagged as counterfeit.
  counterfeit,

  /// Not in the registry at all. Unknown, not condemned.
  unknown,
}

class VerifiedProduct {
  const VerifiedProduct({
    required this.productName,
    required this.brandName,
    required this.manufacturer,
    required this.licenseNumber,
    required this.pesticideType,
    required this.dosagePerAcre,
    required this.usageInstructions,
  });

  final String productName;
  final String brandName;
  final String manufacturer;

  /// The CIB&RC registration number printed on a genuine pack.
  final String licenseNumber;

  final String pesticideType;
  final String dosagePerAcre;
  final String usageInstructions;

  bool get hasDosage => dosagePerAcre.trim().isNotEmpty;

  factory VerifiedProduct.fromJson(Map<String, dynamic> json) {
    String str(String key) => (json[key] as String? ?? '').trim();

    return VerifiedProduct(
      productName: str('productName'),
      brandName: str('brandName'),
      manufacturer: str('manufacturer'),
      licenseNumber: str('licenseNumber'),
      pesticideType: str('pesticideType'),
      dosagePerAcre: str('dosagePerAcre'),
      usageInstructions: str('usageInstructions'),
    );
  }
}

class VerificationResult {
  const VerificationResult({
    required this.verdict,
    required this.scannedCode,
    this.product,
  });

  final VerificationVerdict verdict;

  /// What the camera actually read, shown so a farmer can check it against
  /// the pack rather than trusting a verdict on an unreadable code.
  final String scannedCode;

  /// Present for both genuine and counterfeit results — the registry knows
  /// the product either way.
  final VerifiedProduct? product;

  bool get isSafe => verdict == VerificationVerdict.genuine;

  factory VerificationResult.fromJson(
    Map<String, dynamic> json, {
    required String scannedCode,
  }) {
    final verified = json['verified'] == true;
    final raw = json['product'];
    final product = raw is Map<String, dynamic>
        ? VerifiedProduct.fromJson(raw)
        : null;

    // The route does not name the three cases in its response, so they are
    // derived: verified means genuine, and an unverified result with a
    // product attached is a flagged fake rather than an unknown code.
    final verdict = verified
        ? VerificationVerdict.genuine
        : product != null
        ? VerificationVerdict.counterfeit
        : VerificationVerdict.unknown;

    return VerificationResult(
      verdict: verdict,
      scannedCode: scannedCode,
      product: product,
    );
  }
}
