import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/schemes/data/scheme_models.dart';

/// Trimmed from the real `/api/schemes` response. The `source: "curated"`
/// field is the important part — the route serves a hand-maintained list
/// because myScheme's API rejects unauthenticated calls.
const _response = '''
{
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "Pradhan Mantri Kisan Samman Nidhi",
      "shortName": "PM-KISAN",
      "ministry": "Ministry of Agriculture & Farmers Welfare",
      "category": "income",
      "description": "Income support of Rs 6000 a year to land-holding farmers.",
      "benefits": ["Rs 6000 per year", "Paid in three instalments", "Direct to bank"],
      "eligibility": ["Land-holding farmer", "Valid Aadhaar", "Bank account linked"],
      "url": "https://pmkisan.gov.in/",
      "icon": "\\ud83d\\udc68",
      "launched": "February 2019"
    },
    {
      "id": "pmfby",
      "name": "Pradhan Mantri Fasal Bima Yojana",
      "shortName": "PMFBY",
      "ministry": "Ministry of Agriculture & Farmers Welfare",
      "category": "insurance",
      "description": "Crop insurance against natural calamity and pest attack.",
      "benefits": ["Low premium"],
      "eligibility": ["All farmers"],
      "url": "https://pmfby.gov.in/",
      "icon": "\\ud83d\\udee1"
    }
  ],
  "categories": [
    { "id": "income", "label": "Income Support", "icon": "\\ud83d\\udcb0" },
    { "id": "insurance", "label": "Crop Insurance", "icon": "\\ud83d\\udee1" }
  ],
  "total": 2,
  "source": "curated"
}
''';

SchemeCatalogue parse() =>
    SchemeCatalogue.fromJson(jsonDecode(_response) as Map<String, dynamic>);

void main() {
  group('SchemeCatalogue', () {
    test('parses the real payload', () {
      final catalogue = parse();
      expect(catalogue.schemes, hasLength(2));
      expect(catalogue.categories, hasLength(2));
      expect(catalogue.source, 'curated');
    });

    test('knows the list is curated, not a live feed', () {
      // This drives the caveat shown to the farmer. Eligibility rules change
      // and this catalogue is maintained by hand, so the official site has to
      // stay the authority.
      expect(parse().isCurated, isTrue);
    });

    test('a future live feed would not be flagged as curated', () {
      final live = SchemeCatalogue.fromJson({
        'schemes': [],
        'source': 'api-setu',
      });
      expect(live.isCurated, isFalse);
    });

    test('survives an empty response', () {
      final empty = SchemeCatalogue.fromJson(const {});
      expect(empty.schemes, isEmpty);
      expect(empty.categories, isEmpty);
    });

    test('drops a scheme with no name rather than rendering a blank card', () {
      final messy = SchemeCatalogue.fromJson({
        'schemes': [
          {'id': 'x', 'name': ''},
          {'id': 'y', 'name': 'Real Scheme'},
        ],
      });
      expect(messy.schemes, hasLength(1));
      expect(messy.schemes.single.name, 'Real Scheme');
    });
  });

  group('GovScheme', () {
    late GovScheme pmKisan;

    setUp(() => pmKisan = parse().schemes.first);

    test('parses every field', () {
      expect(pmKisan.shortName, 'PM-KISAN');
      expect(pmKisan.category, 'income');
      expect(pmKisan.benefits, hasLength(3));
      expect(pmKisan.eligibility, hasLength(3));
      expect(pmKisan.url, 'https://pmkisan.gov.in/');
      expect(pmKisan.launched, 'February 2019');
    });

    test('leads with the abbreviation a farmer has actually heard', () {
      expect(pmKisan.displayName, 'PM-KISAN');
      expect(pmKisan.hasDistinctFullName, isTrue);
    });

    test('falls back to the full name when there is no abbreviation', () {
      final noShort = GovScheme.fromJson({
        'name': 'Some Scheme',
        'shortName': '',
      });
      expect(noShort.displayName, 'Some Scheme');
    });

    test('does not repeat the name when both are the same', () {
      // Showing "Kisan Credit Card" twice, stacked, looks like a rendering bug.
      final same = GovScheme.fromJson({
        'name': 'Kisan Credit Card',
        'shortName': 'Kisan Credit Card',
      });
      expect(same.hasDistinctFullName, isFalse);
    });

    test('treats a missing launch date as absent', () {
      expect(parse().schemes[1].launched, isNull);
    });

    group('search', () {
      test('matches the abbreviation', () {
        expect(pmKisan.matches('pm-kisan'), isTrue);
      });

      test('matches the full name', () {
        expect(pmKisan.matches('samman'), isTrue);
      });

      test('matches the description', () {
        expect(pmKisan.matches('income support'), isTrue);
      });

      test('matches the ministry', () {
        expect(pmKisan.matches('agriculture'), isTrue);
      });

      test('ignores case and surrounding spaces', () {
        expect(pmKisan.matches('  PM-Kisan  '), isTrue);
      });

      test('an empty query matches everything', () {
        // Otherwise clearing the search box would empty the list.
        expect(pmKisan.matches(''), isTrue);
        expect(pmKisan.matches('   '), isTrue);
      });

      test('an unrelated query does not match', () {
        expect(pmKisan.matches('tractor loan'), isFalse);
      });
    });
  });

  group('SchemeCategory', () {
    test('parses id, label and icon', () {
      final category = parse().categories.first;
      expect(category.id, 'income');
      expect(category.label, 'Income Support');
      expect(category.icon, isNotEmpty);
    });

    test('every scheme category exists in the category list', () {
      // A scheme whose category has no chip would be unreachable by filtering.
      final catalogue = parse();
      final ids = catalogue.categories.map((c) => c.id).toSet();

      for (final scheme in catalogue.schemes) {
        expect(
          ids,
          contains(scheme.category),
          reason:
              '${scheme.shortName} has category "${scheme.category}" '
              'with no matching chip',
        );
      }
    });
  });
}
