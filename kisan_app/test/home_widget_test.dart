import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/widgets/home_widget_service.dart';

void main() {
  group('HomeWidgetData', () {
    test('carries every field the Android layout reads', () {
      // These keys are read by name in KisanWidgetProvider.kt. A rename on
      // one side without the other leaves a silently blank widget.
      const data = HomeWidgetData(
        place: 'Mehsana',
        temperature: '31°C',
        condition: 'Sunny',
        advisory: 'Cotton: Vegetative Stage',
        updated: 'just now',
      );

      expect(
        data.toMap().keys,
        containsAll(const [
          'place',
          'temperature',
          'condition',
          'advisory',
          'updated',
        ]),
      );
      expect(data.toMap()['place'], 'Mehsana');
      expect(data.toMap()['advisory'], 'Cotton: Vegetative Stage');
    });

    test('every value is a string', () {
      // home_widget stores typed values; the provider reads all of these as
      // strings, so anything else comes back null and renders blank.
      const data = HomeWidgetData(place: 'A', temperature: '1°C');
      for (final value in data.toMap().values) {
        expect(value, isA<String>());
      }
    });

    test('defaults to empty rather than placeholder text', () {
      // A blank line is honest. "--" or "Loading" on a home screen reads as
      // data and would outlive whatever produced it.
      const data = HomeWidgetData();
      expect(data.toMap().values.every((v) => v.isEmpty), isTrue);
    });

    test('an absent advisory is empty, not a filler sentence', () {
      const data = HomeWidgetData(place: 'Mehsana', temperature: '31°C');
      expect(data.advisory, isEmpty);
    });
  });

  group('platform support', () {
    test('is false on the desktop build the app is developed against', () {
      // Android only — iOS needs a widget extension target that does not
      // exist, and Windows has no home screen widgets at all.
      expect(homeWidgetSupported, isFalse);
    });
  });

  group('update', () {
    test(
      'does nothing and does not throw on an unsupported platform',
      () async {
        // A farmer who never added the widget must not see the app fail.
        await const HomeWidgetService().update(const HomeWidgetData());
      },
    );
  });
}
