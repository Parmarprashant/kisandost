import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/auth/data/auth_models.dart';

void main() {
  group('AppUser', () {
    test('parses the /api/auth/me payload', () {
      // Field names taken from the live route, which returns a nested `user`.
      final user = AppUser.fromJson({
        'id': '6ab55617d5be956e2fbf7294',
        'username': 'ramesh_patel',
        'name': 'Ramesh Patel',
        'email': 'ramesh@example.com',
        'avatar': 'https://lh3.googleusercontent.com/a/abc',
        'mobile': '9876543210',
        'village': 'Anand',
        'district': 'Anand',
        'mainCrop': 'Cotton',
      });

      expect(user.id, '6ab55617d5be956e2fbf7294');
      expect(user.name, 'Ramesh Patel');
      expect(user.village, 'Anand');
      expect(user.mainCrop, 'Cotton');
    });

    test('survives the sparse payload a fresh Google sign-up produces', () {
      // Google gives a name, an email and a picture — nothing about the farm.
      final user = AppUser.fromJson({
        'id': 'abc',
        'name': 'Ramesh Patel',
        'email': 'ramesh@example.com',
      });

      expect(user.village, isNull);
      expect(user.mobile, isNull);
      expect(user.needsOnboarding, isTrue);
    });

    test('a complete profile does not need onboarding', () {
      final user = AppUser.fromJson({
        'id': 'abc',
        'name': 'Ramesh',
        'village': 'Anand',
        'district': 'Anand',
      });
      expect(user.needsOnboarding, isFalse);
    });

    test('an empty string counts as missing, not as an answer', () {
      // The web form writes '' rather than omitting the field, so a blank
      // village must still send the user through onboarding.
      final user = AppUser.fromJson({
        'id': 'abc',
        'name': 'Ramesh',
        'village': '',
        'district': 'Anand',
      });
      expect(user.needsOnboarding, isTrue);
    });

    test('coerces a non-string id', () {
      // Mongo ObjectIds have been seen serialised both ways.
      expect(AppUser.fromJson({'id': 12345, 'name': 'X'}).id, '12345');
    });

    group('initials', () {
      test('uses first and last name', () {
        expect(AppUser.fromJson({'name': 'Ramesh Patel'}).initials, 'RP');
      });

      test('uses one letter for a single name', () {
        expect(AppUser.fromJson({'name': 'Ramesh'}).initials, 'R');
      });

      test('handles extra whitespace', () {
        expect(
          AppUser.fromJson({'name': '  Ramesh   Kumar  Patel '}).initials,
          'RP',
        );
      });

      test('falls back rather than crashing on an empty name', () {
        expect(AppUser.fromJson(const {}).initials, '?');
      });

      test('does not split a Devanagari grapheme cluster', () {
        // Naive `substring(0, 1)` splits combining marks and renders a
        // broken glyph. Most of these users have non-Latin names.
        final initials = AppUser.fromJson({'name': 'रमेश पटेल'}).initials;
        expect(initials, isNotEmpty);
        expect(initials, isNot(contains('�')));
      });
    });
  });

  group('AuthFailure', () {
    test('maps every error the callback route can send', () {
      // These strings are produced by the Next.js OAuth callback. If one is
      // renamed there, this test is where it should break.
      expect(
        AuthFailureFromCallback.parse('state_mismatch'),
        AuthFailure.stateMismatch,
      );
      expect(
        AuthFailureFromCallback.parse('google_auth_failed'),
        AuthFailure.rejected,
      );
      expect(
        AuthFailureFromCallback.parse('token_exchange_failed'),
        AuthFailure.rejected,
      );
      expect(
        AuthFailureFromCallback.parse('profile_fetch_failed'),
        AuthFailure.rejected,
      );
    });

    test('an unrecognised error is treated as a server fault', () {
      expect(AuthFailureFromCallback.parse('who_knows'), AuthFailure.server);
      expect(AuthFailureFromCallback.parse(null), AuthFailure.server);
    });
  });
}
