import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/assistant/data/assistant_models.dart';

ChatMessage farmer(String text, {bool failed = false}) =>
    ChatMessage(sender: Sender.farmer, text: text, failed: failed);

ChatMessage bot(String text, {bool failed = false}) =>
    ChatMessage(sender: Sender.assistant, text: text, failed: failed);

void main() {
  group('ChatMessage', () {
    test('uses the wire roles the route expects', () {
      // "user" and "model" are what the Gemini history format wants; getting
      // these wrong makes the whole history rejected.
      expect(farmer('hi').role, 'user');
      expect(bot('hello').role, 'model');
    });

    test('knows who sent it', () {
      expect(farmer('hi').isFarmer, isTrue);
      expect(bot('hello').isFarmer, isFalse);
    });
  });

  group('historyFor', () {
    test('keeps an ordinary exchange in order', () {
      final history = historyFor([
        farmer('Why are my leaves yellow?'),
        bot('Likely nitrogen.'),
        farmer('How much urea?'),
        bot('20 kg per acre.'),
      ]);

      expect(history, hasLength(4));
      expect(history.first['role'], 'user');
      expect(history.first['text'], 'Why are my leaves yellow?');
      expect(history.last['role'], 'model');
    });

    test('drops failed turns', () {
      // A failed message is an error notice, not something the assistant
      // said. Sending it back would have the model answering its own
      // "please try again" text.
      final history = historyFor([
        farmer('Question one'),
        bot('Network error', failed: true),
        farmer('Question two'),
        bot('A real answer'),
      ]);

      expect(history, hasLength(3));
      expect(history.map((h) => h['text']), isNot(contains('Network error')));
    });

    test('drops empty and whitespace-only turns', () {
      final history = historyFor([farmer('Real'), bot('   '), bot('Answer')]);
      expect(history, hasLength(2));
    });

    test('trims to the most recent turns', () {
      final long = [
        for (var i = 0; i < 20; i++) i.isEven ? farmer('q$i') : bot('a$i'),
      ];

      final history = historyFor(long, maxTurns: 4);
      expect(history.length, lessThanOrEqualTo(4));
      // The tail is what matters — the farmer has moved on from turn 0.
      expect(history.last['text'], 'a19');
    });

    test('always starts with the farmer', () {
      // Gemini rejects a history whose first turn is the model. Trimming can
      // easily land on one, so the leading model turn is dropped.
      final history = historyFor([
        farmer('q0'),
        bot('a0'),
        farmer('q1'),
        bot('a1'),
      ], maxTurns: 3);

      expect(history, isNotEmpty);
      expect(history.first['role'], 'user');
    });

    test('returns nothing when there is no farmer turn at all', () {
      // Rather than send a model-only history the route would reject.
      expect(historyFor([bot('a'), bot('b')]), isEmpty);
    });

    test('an empty thread produces an empty history', () {
      expect(historyFor(const []), isEmpty);
    });

    test('a thread of only failures produces an empty history', () {
      final history = historyFor([
        farmer('q', failed: true),
        bot('err', failed: true),
      ]);
      expect(history, isEmpty);
    });

    test('every entry has both fields the route requires', () {
      final history = historyFor([farmer('q'), bot('a')]);
      for (final turn in history) {
        expect(turn.keys, containsAll(['role', 'text']));
        expect(turn['role'], anyOf('user', 'model'));
      }
    });
  });
}
