import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/advisory/data/advisory_models.dart';

/// One entry exactly as it appears in the bundled `assets/advisories.json`,
/// converted from the web app's advisory seeder.
const _advisoryJson = '''
{
  "cropType": "cotton",
  "stageName": "Vegetative Stage",
  "daysAfterSowingStart": 16,
  "daysAfterSowingEnd": 45,
  "pesticideName": "Imidacloprid 17.8% SL",
  "dosagePerAcre": 80,
  "purpose": "Dose to control Whiteflies and Thrips.",
  "messageTemplate": "KisanDost Alert: Spray {{dosage}}ml of {{pesticide}} today."
}
''';

/// The cotton stages from the source data, which run back to back.
final _cotton = [
  CropAdvisory.fromJson({
    'cropType': 'cotton',
    'stageName': 'Seedling Stage',
    'daysAfterSowingStart': 0,
    'daysAfterSowingEnd': 15,
    'pesticideName': 'Thiamethoxam 25% WG',
    'dosagePerAcre': 40,
    'purpose': 'Early sucking pests.',
  }),
  CropAdvisory.fromJson({
    'cropType': 'cotton',
    'stageName': 'Vegetative Stage',
    'daysAfterSowingStart': 16,
    'daysAfterSowingEnd': 45,
    'pesticideName': 'Imidacloprid 17.8% SL',
    'dosagePerAcre': 80,
    'purpose': 'Whiteflies and Thrips.',
  }),
  CropAdvisory.fromJson({
    'cropType': 'cotton',
    'stageName': 'Square Formation',
    'daysAfterSowingStart': 46,
    'daysAfterSowingEnd': 75,
    'pesticideName': 'Spinosad 45% SC',
    'dosagePerAcre': 75,
    'purpose': 'Bollworms.',
  }),
];

/// Wheat, whose stages have a real gap between day 25 and day 40.
final _wheat = [
  CropAdvisory.fromJson({
    'cropType': 'wheat',
    'stageName': 'Crown Root Initiation',
    'daysAfterSowingStart': 21,
    'daysAfterSowingEnd': 25,
    'pesticideName': 'Pendimethalin 30% EC',
    'dosagePerAcre': 400,
    'purpose': 'Weed control.',
  }),
  CropAdvisory.fromJson({
    'cropType': 'wheat',
    'stageName': 'Tillering Stage',
    'daysAfterSowingStart': 40,
    'daysAfterSowingEnd': 55,
    'pesticideName': 'Tebuconazole 25.9% EC',
    'dosagePerAcre': 250,
    'purpose': 'Yellow Rust.',
  }),
];

void main() {
  group('CropAdvisory', () {
    late CropAdvisory advisory;

    setUp(() {
      advisory = CropAdvisory.fromJson(
        jsonDecode(_advisoryJson) as Map<String, dynamic>,
      );
    });

    test('parses the seeded payload', () {
      expect(advisory.cropType, 'cotton');
      expect(advisory.stageName, 'Vegetative Stage');
      expect(advisory.startDay, 16);
      expect(advisory.endDay, 45);
      expect(advisory.dosagePerAcre, 80);
    });

    test('lowercases the crop so lookups match whatever the farmer typed', () {
      final odd = CropAdvisory.fromJson({'cropType': '  Cotton '});
      expect(odd.cropType, 'cotton');
    });

    test('covers its whole day range, endpoints included', () {
      // An off-by-one here silently drops the first or last day of a stage.
      expect(advisory.covers(16), isTrue);
      expect(advisory.covers(45), isTrue);
      expect(advisory.covers(30), isTrue);
      expect(advisory.covers(15), isFalse);
      expect(advisory.covers(46), isFalse);
    });

    group('dose', () {
      test('scales to the plot size', () {
        expect(advisory.dosageFor(2.5), 200);
      });

      test('rounds to something measurable', () {
        expect(advisory.dosageFor(1.333), 107);
      });

      test('falls back to the per-acre figure for a zero area', () {
        // A crop saved without an area must not show a dose of 0.
        expect(advisory.dosageFor(0), 80);
        expect(advisory.dosageFor(-1), 80);
      });
    });
  });

  group('AdvisoryTimeline', () {
    test('finds the stage the crop is in today', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'Cotton',
        daysAfterSowing: 30,
        all: _cotton,
      );

      expect(timeline.current?.stageName, 'Vegetative Stage');
      expect(timeline.next?.stageName, 'Square Formation');
      expect(timeline.daysUntilNext, 16);
    });

    test('matches the crop name whatever its case', () {
      // Crops are typed by the farmer; the data is lowercase.
      final timeline = AdvisoryTimeline.build(
        cropName: '  COTTON ',
        daysAfterSowing: 5,
        all: _cotton,
      );
      expect(timeline.current?.stageName, 'Seedling Stage');
    });

    test('reports no current stage inside a gap rather than inventing one', () {
      // Wheat has nothing between day 26 and day 39. Showing the previous
      // stage here would tell a farmer to spray a fortnight late.
      final timeline = AdvisoryTimeline.build(
        cropName: 'Wheat',
        daysAfterSowing: 32,
        all: _wheat,
      );

      expect(timeline.current, isNull);
      expect(timeline.next?.stageName, 'Tillering Stage');
      expect(timeline.daysUntilNext, 8);
      expect(timeline.hasAnything, isTrue);
    });

    test('before the first stage, everything is still ahead', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'Wheat',
        daysAfterSowing: 3,
        all: _wheat,
      );

      expect(timeline.current, isNull);
      expect(timeline.next?.stageName, 'Crown Root Initiation');
      expect(timeline.daysUntilNext, 18);
      expect(timeline.past, isEmpty);
    });

    test('after the last stage there is no next', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'Cotton',
        daysAfterSowing: 200,
        all: _cotton,
      );

      expect(timeline.current, isNull);
      expect(timeline.next, isNull);
      expect(timeline.daysUntilNext, isNull);
      expect(timeline.past, hasLength(3));
    });

    test('counts only the stages that have finished', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'Cotton',
        daysAfterSowing: 50,
        all: _cotton,
      );

      // Seedling and Vegetative are done; Square Formation is current.
      expect(timeline.past, hasLength(2));
      expect(timeline.current?.stageName, 'Square Formation');
    });

    test('an unknown crop gets an empty timeline, not an error', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'Dragonfruit',
        daysAfterSowing: 30,
        all: _cotton,
      );

      expect(timeline.hasAnything, isFalse);
      expect(timeline.current, isNull);
      expect(timeline.next, isNull);
      expect(timeline.stages, isEmpty);
    });

    test('ignores other crops in the catalogue', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'wheat',
        daysAfterSowing: 22,
        all: [..._cotton, ..._wheat],
      );

      expect(timeline.stages, hasLength(2));
      expect(timeline.current?.stageName, 'Crown Root Initiation');
    });

    test('orders stages by day even when the source data is not', () {
      final timeline = AdvisoryTimeline.build(
        cropName: 'cotton',
        daysAfterSowing: 0,
        all: _cotton.reversed.toList(),
      );

      expect(timeline.stages.map((s) => s.startDay).toList(), [0, 16, 46]);
      expect(timeline.next?.stageName, 'Vegetative Stage');
    });
  });

  group('bundled catalogue', () {
    late List<CropAdvisory> advisories;

    setUpAll(() {
      final raw = File('assets/advisories.json').readAsStringSync();
      advisories = (jsonDecode(raw) as List)
          .whereType<Map<String, dynamic>>()
          .map(CropAdvisory.fromJson)
          .toList();
    });

    test('the asset parses and is not empty', () {
      expect(advisories, isNotEmpty);
    });

    test('every advisory is usable', () {
      for (final a in advisories) {
        expect(a.cropType, isNotEmpty);
        expect(a.stageName, isNotEmpty, reason: '${a.cropType} has no stage');
        expect(
          a.pesticideName,
          isNotEmpty,
          reason: '${a.stageName} has no product',
        );
        expect(
          a.dosagePerAcre,
          greaterThan(0),
          reason: '${a.stageName} has no dose',
        );
      }
    });

    test('day ranges run forwards', () {
      for (final a in advisories) {
        expect(
          a.endDay,
          greaterThanOrEqualTo(a.startDay),
          reason: '${a.cropType}/${a.stageName} ends before it starts',
        );
      }
    });

    test('stages within a crop do not overlap', () {
      // Two stages covering the same day would make "what do I do today"
      // ambiguous, and the timeline silently picks the first.
      final byCrop = <String, List<CropAdvisory>>{};
      for (final a in advisories) {
        byCrop.putIfAbsent(a.cropType, () => []).add(a);
      }

      for (final entry in byCrop.entries) {
        final stages = entry.value
          ..sort((a, b) => a.startDay.compareTo(b.startDay));
        for (var i = 1; i < stages.length; i++) {
          expect(
            stages[i].startDay,
            greaterThan(stages[i - 1].endDay),
            reason:
                '${entry.key}: "${stages[i].stageName}" overlaps '
                '"${stages[i - 1].stageName}"',
          );
        }
      }
    });

    test('the crops the app offers are represented', () {
      final crops = advisories.map((a) => a.cropType).toSet();
      expect(crops, contains('cotton'));
      expect(crops, contains('wheat'));
      expect(crops, contains('rice'));
    });
  });
}
