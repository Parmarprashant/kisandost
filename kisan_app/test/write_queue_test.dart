import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/offline/write_queue.dart';

void main() {
  group('QueuedWrite serialisation', () {
    final item = QueuedWrite(
      id: '17',
      path: '/api/community/posts/abc/comments',
      body: const {'content': 'Try neem oil first.'},
      queuedAt: DateTime.utc(2026, 9, 25, 10, 30),
      attempts: 2,
    );

    test('round-trips through JSON', () {
      final back = QueuedWrite.fromJson(item.toJson())!;

      expect(back.id, '17');
      expect(back.path, '/api/community/posts/abc/comments');
      expect(back.body['content'], 'Try neem oil first.');
      expect(back.queuedAt, DateTime.utc(2026, 9, 25, 10, 30));
      expect(back.attempts, 2);
    });

    test('keeps the farmer text exactly', () {
      // The whole promise of the queue is that it replays what was written,
      // not an approximation of it.
      final tricky = QueuedWrite(
        id: '1',
        path: '/p',
        body: const {'content': 'મારા કપાસનાં પાન પીળાં — શું કરું?'},
        queuedAt: DateTime.utc(2026, 1, 1),
      );
      final back = QueuedWrite.fromJson(tricky.toJson())!;
      expect(back.body['content'], 'મારા કપાસનાં પાન પીળાં — શું કરું?');
    });

    test('rejects entries missing required fields', () {
      expect(QueuedWrite.fromJson(null), isNull);
      expect(QueuedWrite.fromJson('nope'), isNull);
      expect(QueuedWrite.fromJson(const {}), isNull);
      expect(QueuedWrite.fromJson(const {'id': '1', 'path': '/p'}), isNull);
    });

    test('rejects an unparseable timestamp', () {
      expect(
        QueuedWrite.fromJson(const {
          'id': '1',
          'path': '/p',
          'body': <String, dynamic>{},
          'queuedAt': 'not a date',
        }),
        isNull,
      );
    });

    test('rejects a body that is not an object', () {
      expect(
        QueuedWrite.fromJson({
          'id': '1',
          'path': '/p',
          'body': 'just a string',
          'queuedAt': DateTime.now().toIso8601String(),
        }),
        isNull,
      );
    });

    test('a missing attempt count starts at zero', () {
      final back = QueuedWrite.fromJson({
        'id': '1',
        'path': '/p',
        'body': <String, dynamic>{},
        'queuedAt': DateTime.now().toIso8601String(),
      })!;
      expect(back.attempts, 0);
    });
  });

  group('retry limit', () {
    test('a fresh write is not exhausted', () {
      final item = QueuedWrite(
        id: '1',
        path: '/p',
        body: const {},
        queuedAt: DateTime.now(),
      );
      expect(item.isExhausted, isFalse);
    });

    test('withAttempt increments without touching the content', () {
      final item = QueuedWrite(
        id: '1',
        path: '/p',
        body: const {'content': 'hello'},
        queuedAt: DateTime.utc(2026, 1, 1),
      );
      final retried = item.withAttempt();

      expect(retried.attempts, 1);
      expect(retried.id, item.id);
      expect(retried.body['content'], 'hello');
      expect(retried.queuedAt, item.queuedAt);
    });

    test('gives up after repeated failures', () {
      // Retrying forever would burn a farmer's data on something the server
      // is never going to accept.
      var item = QueuedWrite(
        id: '1',
        path: '/p',
        body: const {},
        queuedAt: DateTime.now(),
      );
      for (var i = 0; i < 5; i++) {
        expect(item.isExhausted, isFalse, reason: 'gave up at attempt $i');
        item = item.withAttempt();
      }
      expect(item.isExhausted, isTrue);
    });
  });
}
