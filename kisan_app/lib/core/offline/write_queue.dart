/// Writes that were made with no signal.
///
/// Reading offline is half the problem. The other half is a farmer typing a
/// reply to a neighbour under a tree with one bar, tapping send, and watching
/// it fail — at which point the text is usually gone and they do not type it
/// again.
///
/// A queued write is held on disk, survives the app being closed, and is sent
/// when the phone is back on a network. Nothing is invented: the queue only
/// ever replays exactly what the farmer wrote.
library;

import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../network/dio_client.dart';

/// One POST waiting for a connection.
@immutable
class QueuedWrite {
  const QueuedWrite({
    required this.id,
    required this.path,
    required this.body,
    required this.queuedAt,
    this.attempts = 0,
  });

  final String id;
  final String path;
  final Map<String, dynamic> body;
  final DateTime queuedAt;

  /// How many times sending has been tried and failed.
  final int attempts;

  /// Given up on.
  ///
  /// A write that has failed repeatedly is almost certainly being rejected
  /// rather than unlucky, and retrying it forever would mean a farmer's phone
  /// quietly burning data on something that will never succeed.
  bool get isExhausted => attempts >= 5;

  QueuedWrite withAttempt() => QueuedWrite(
    id: id,
    path: path,
    body: body,
    queuedAt: queuedAt,
    attempts: attempts + 1,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'path': path,
    'body': body,
    'queuedAt': queuedAt.toIso8601String(),
    'attempts': attempts,
  };

  static QueuedWrite? fromJson(Object? raw) {
    if (raw is! Map<String, dynamic>) return null;

    final id = raw['id'];
    final path = raw['path'];
    final body = raw['body'];
    final queuedAt = DateTime.tryParse(raw['queuedAt'] as String? ?? '');

    if (id is! String || path is! String || queuedAt == null) return null;
    if (body is! Map<String, dynamic>) return null;

    return QueuedWrite(
      id: id,
      path: path,
      body: body,
      queuedAt: queuedAt,
      attempts: raw['attempts'] is int ? raw['attempts'] as int : 0,
    );
  }
}

class WriteQueue {
  WriteQueue(this._prefs, this._dio);

  final SharedPreferences _prefs;
  final Dio _dio;

  static const _key = 'offline:writeQueue';

  List<QueuedWrite> get pending {
    final raw = _prefs.getString(_key);
    if (raw == null) return const [];

    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];
      return decoded
          .map(QueuedWrite.fromJson)
          .whereType<QueuedWrite>()
          .toList(growable: false);
    } catch (_) {
      return const [];
    }
  }

  bool get isEmpty => pending.isEmpty;

  Future<void> _write(List<QueuedWrite> items) async {
    await _prefs.setString(
      _key,
      jsonEncode(items.map((i) => i.toJson()).toList()),
    );
  }

  /// Holds a write until there is a connection.
  Future<void> add({required String path, required Map<String, dynamic> body}) {
    final item = QueuedWrite(
      // Unique enough for a queue one person adds to by hand.
      id: '${DateTime.now().microsecondsSinceEpoch}',
      path: path,
      body: body,
      queuedAt: DateTime.now(),
    );
    return _write([...pending, item]);
  }

  /// Tries every queued write, oldest first.
  ///
  /// Order matters: two replies on one thread should arrive as they were
  /// written. Returns how many were sent.
  Future<int> flush() async {
    final items = pending;
    if (items.isEmpty) return 0;

    final remaining = <QueuedWrite>[];
    var sent = 0;

    for (final item in items) {
      try {
        await _dio.post<Map<String, dynamic>>(item.path, data: item.body);
        sent++;
      } on DioException catch (error) {
        final status = error.response?.statusCode ?? 0;

        // A 4xx will fail the same way next time — the server has rejected
        // it, not missed it. Keeping it would retry forever.
        if (status >= 400 && status < 500 && status != 408 && status != 429) {
          debugPrint('Dropping queued write to ${item.path}: $status');
          continue;
        }

        final retried = item.withAttempt();
        if (!retried.isExhausted) remaining.add(retried);
      }
    }

    await _write(remaining);
    return sent;
  }

  Future<void> clear() => _prefs.remove(_key);
}

final writeQueueProvider = Provider<WriteQueue>(
  (ref) => throw UnimplementedError('writeQueueProvider must be overridden'),
);

/// Builds the real queue once the preferences handle exists.
WriteQueue buildWriteQueue(SharedPreferences prefs, Ref ref) =>
    WriteQueue(prefs, ref.read(dioProvider));
