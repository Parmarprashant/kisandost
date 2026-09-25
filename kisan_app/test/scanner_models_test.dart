import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/scanner/data/scanner_models.dart';

/// A genuine result, shaped as `/api/verify-pesticide` returns it. The whole
/// Mongo document comes back under `product`.
const _genuineJson = '''
{
  "verified": true,
  "product": {
    "_id": "6531f0a1c2b4e8d9a1234567",
    "productName": "Imidacloprid 17.8% SL",
    "brandName": "Confidor",
    "manufacturer": "Bayer CropScience",
    "licenseNumber": "CIB-INS-2019-4471",
    "qrCodeId": "IMD178SL001",
    "pesticideType": "Insecticide",
    "dosagePerAcre": "80 ml per acre",
    "usageInstructions": "Mix with 200 litres of water and spray evenly.",
    "isAuthentic": true
  }
}
''';

/// A flagged counterfeit. Note `verified: false` but a product is still
/// attached — the registry knows this code and knows it is fake.
const _fakeJson = '''
{
  "verified": false,
  "warning": "WARNING: This product has been flagged as counterfeit.",
  "product": {
    "productName": "Cypermethrin 10% EC",
    "brandName": "Unknown",
    "manufacturer": "Unregistered",
    "licenseNumber": "NONE",
    "qrCodeId": "FAKE999XXX",
    "pesticideType": "Insecticide",
    "dosagePerAcre": "200 ml per acre",
    "usageInstructions": "Do not use.",
    "isAuthentic": false
  }
}
''';

/// A code the registry has never seen. No product at all.
const _unknownJson = '''
{
  "verified": false,
  "warning": "This pesticide is not found in the official registry."
}
''';

VerificationResult parse(String json, String code) =>
    VerificationResult.fromJson(
      jsonDecode(json) as Map<String, dynamic>,
      scannedCode: code,
    );

void main() {
  group('genuine', () {
    late VerificationResult result;

    setUp(() => result = parse(_genuineJson, 'IMD178SL001'));

    test('is read as genuine', () {
      expect(result.verdict, VerificationVerdict.genuine);
      expect(result.isSafe, isTrue);
    });

    test('carries the product details', () {
      final product = result.product!;
      expect(product.productName, 'Imidacloprid 17.8% SL');
      expect(product.brandName, 'Confidor');
      expect(product.licenseNumber, 'CIB-INS-2019-4471');
      expect(product.dosagePerAcre, '80 ml per acre');
      expect(product.hasDosage, isTrue);
    });

    test('keeps the code that was scanned', () {
      // Shown back so a farmer can compare it against the pack rather than
      // trusting a verdict on a misread code.
      expect(result.scannedCode, 'IMD178SL001');
    });
  });

  group('counterfeit', () {
    late VerificationResult result;

    setUp(() => result = parse(_fakeJson, 'FAKE999XXX'));

    test('an unverified result with a product is a flagged fake', () {
      expect(result.verdict, VerificationVerdict.counterfeit);
      expect(result.isSafe, isFalse);
    });

    test('still carries the product, so the farmer sees what was flagged', () {
      expect(result.product?.productName, 'Cypermethrin 10% EC');
    });
  });

  group('unknown', () {
    late VerificationResult result;

    setUp(() => result = parse(_unknownJson, 'NEVER_SEEN_1234'));

    test('an unverified result with no product is unknown, not fake', () {
      // The distinction is the point of the enum. Telling a farmer their
      // stock is counterfeit when the registry simply has no record of it
      // could cost them good product.
      expect(result.verdict, VerificationVerdict.unknown);
      expect(result.verdict, isNot(VerificationVerdict.counterfeit));
      expect(result.isSafe, isFalse);
    });

    test('has no product to show', () {
      expect(result.product, isNull);
    });
  });

  group('malformed responses', () {
    test('an empty body is unknown rather than an error', () {
      final result = parse('{}', 'X');
      expect(result.verdict, VerificationVerdict.unknown);
    });

    test('verified as a string is not treated as true', () {
      // Only a real boolean true means genuine. A truthy-looking string must
      // not pass a pesticide as safe.
      final result = parse('{"verified": "true"}', 'X');
      expect(result.verdict, isNot(VerificationVerdict.genuine));
    });

    test('a product that is not an object is dropped', () {
      final result = parse('{"verified": false, "product": "nope"}', 'X');
      expect(result.product, isNull);
      expect(result.verdict, VerificationVerdict.unknown);
    });

    test('missing product fields become empty, not null crashes', () {
      final result = parse('{"verified": true, "product": {}}', 'X');
      final product = result.product!;
      expect(product.productName, isEmpty);
      expect(product.hasDosage, isFalse);
    });

    test('whitespace-only dosage does not count as a dosage', () {
      final result = parse(
        '{"verified": true, "product": {"dosagePerAcre": "   "}}',
        'X',
      );
      expect(result.product!.hasDosage, isFalse);
    });
  });

  group('verdicts', () {
    test('only genuine is safe', () {
      expect(parse(_genuineJson, 'a').isSafe, isTrue);
      expect(parse(_fakeJson, 'b').isSafe, isFalse);
      expect(parse(_unknownJson, 'c').isSafe, isFalse);
    });
  });
}
