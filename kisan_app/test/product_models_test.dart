import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/products/data/product_models.dart';

/// One entry exactly as it appears in the bundled `assets/products.json`,
/// converted from the web app's `data/products.ts`.
const _productJson = '''
{
  "id": 1,
  "name": "NAA 4.5% SL",
  "tag": "Plant Growth Regulator",
  "color": "#4A6B8F",
  "description": "Prevents flower and fruit drop in a wide range of crops.",
  "longDescription": "NAA is a synthetic plant hormone in the auxin family.",
  "features": ["Prevents flower and fruit drop", "Improves fruit set"],
  "usage": { "Cotton": "2 ml per litre", "Tomato": "1.5 ml per litre" },
  "translationKey": "NAA",
  "price": 340,
  "imageUrl": "https://example.test/naa.png"
}
''';

void main() {
  group('Product', () {
    late Product product;

    setUp(() {
      product = Product.fromJson(
        jsonDecode(_productJson) as Map<String, dynamic>,
      );
    });

    test('parses the converted payload', () {
      expect(product.id, '1');
      expect(product.name, 'NAA 4.5% SL');
      expect(product.tag, 'Plant Growth Regulator');
      expect(product.price, 340);
      expect(product.features, hasLength(2));
    });

    test('keeps the per-crop dosing, which is the point of the page', () {
      expect(product.usage, hasLength(2));
      expect(product.usage['Cotton'], '2 ml per litre');
      expect(product.hasUsage, isTrue);
    });

    test('coerces a numeric id to a string', () {
      // The source data numbers them; routes and keys want strings.
      expect(product.id, isA<String>());
    });

    test('survives an entry with nothing but a name', () {
      final bare = Product.fromJson({'name': 'Mystery Input'});
      expect(bare.price, 0);
      expect(bare.features, isEmpty);
      expect(bare.usage, isEmpty);
      expect(bare.hasUsage, isFalse);
      expect(bare.tag, isNull);
    });

    test('ignores a usage block that is not a string map', () {
      final odd = Product.fromJson({
        'name': 'X',
        'usage': {'Cotton': 42, 'Wheat': '1 ml'},
      });
      // The numeric entry is dropped rather than rendered as "42".
      expect(odd.usage, {'Wheat': '1 ml'});
    });

    group('search', () {
      test('matches the name', () {
        expect(product.matches('naa'), isTrue);
      });

      test('matches the category tag', () {
        expect(product.matches('growth regulator'), isTrue);
      });

      test('matches a crop it is used on', () {
        // A farmer searches for their crop, not for the chemical.
        expect(product.matches('cotton'), isTrue);
        expect(product.matches('tomato'), isTrue);
      });

      test('matches the description', () {
        expect(product.matches('fruit drop'), isTrue);
      });

      test('an empty query matches everything', () {
        expect(product.matches(''), isTrue);
        expect(product.matches('   '), isTrue);
      });

      test('an unrelated query does not match', () {
        expect(product.matches('tractor'), isFalse);
      });
    });
  });

  group('bundled catalogue', () {
    late List<Product> products;

    setUpAll(() {
      // Read the asset from disk rather than through rootBundle so this stays
      // a plain unit test.
      final raw = File('assets/products.json').readAsStringSync();
      products = (jsonDecode(raw) as List)
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList();
    });

    test('the asset parses and is not empty', () {
      expect(products, isNotEmpty);
    });

    test('every product has a name and a price', () {
      for (final product in products) {
        expect(product.name, isNotEmpty);
        expect(
          product.price,
          greaterThan(0),
          reason: '${product.name} has no price',
        );
      }
    });

    test('ids are unique', () {
      // Duplicates would break byId lookups and list keys.
      final ids = products.map((p) => p.id).toList();
      expect(ids.toSet(), hasLength(ids.length));
    });

    test('the conversion did not mangle image URLs', () {
      // The first attempt at converting products.ts used a regex that turned
      // "https:" inside URLs into a quoted key. This catches that class of
      // breakage if the asset is ever regenerated.
      for (final product in products) {
        if (product.imageUrl.isEmpty) continue;
        expect(
          product.imageUrl,
          startsWith('http'),
          reason: '${product.name} has a broken image URL',
        );
      }
    });
  });
}
