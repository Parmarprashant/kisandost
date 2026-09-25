import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/community/presentation/compose_post_screen.dart';

void main() {
  group('post types', () {
    test('match the enum the backend accepts, exactly', () {
      // FarmerPost.postType is a Mongoose enum. A value outside this set is
      // rejected when the document is created, so a typo here would fail
      // every post of that kind with a 500 the farmer cannot act on.
      const backendEnum = {
        'Farmer Experience',
        'Crop Problem',
        'Ask Farmers',
        'Success Story',
        'Prevention Tip',
      };

      expect(postTypeValues.toSet(), backendEnum);
    });

    test('are sent verbatim, not translated', () {
      // Only the label is localised. Sending a Gujarati label would fail the
      // enum check.
      for (final value in postTypeValues) {
        expect(value, matches(RegExp(r'^[A-Za-z ]+$')));
      }
    });

    test('lead with asking, which is what the screen is for', () {
      expect(postTypeValues.first, 'Ask Farmers');
    });

    test('contain no duplicates', () {
      expect(postTypeValues.toSet(), hasLength(postTypeValues.length));
    });
  });
}
