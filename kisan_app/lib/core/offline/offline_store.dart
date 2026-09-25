/// Last-known-good data, kept on disk.
///
/// [cacheFor] in `cache_policy.dart` keeps a value alive in memory for a
/// while, which saves a farmer's data allowance during a session. It does
/// nothing the next morning, when the app is reopened in a field with no
/// signal and every screen has forgotten everything.
///
/// This survives a restart. A screen that cannot reach the server falls back
/// to what it last saw and says how old that is, which is a far better answer
/// than an error for someone standing in a field deciding whether to spray.
library;

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Something read from disk, with the age that makes it honest to show.
class CachedPayload<T> {
  const CachedPayload({required this.value, required this.savedAt});

  final T value;
  final DateTime savedAt;

  Duration get age => DateTime.now().difference(savedAt);

  /// Whether this is old enough that showing it without comment would be
  /// misleading.
  bool get isStale => age > const Duration(hours: 6);
}

class OfflineStore {
  OfflineStore(this._prefs);

  final SharedPreferences _prefs;

  static const _prefix = 'offline:';
  static const _savedAtSuffix = ':savedAt';

  /// Saves a successful response.
  ///
  /// Failures are never written. A cache holding an error page would hand it
  /// back for days.
  Future<void> save(String key, Object json) async {
    try {
      await _prefs.setString('$_prefix$key', jsonEncode(json));
      await _prefs.setInt(
        '$_prefix$key$_savedAtSuffix',
        DateTime.now().millisecondsSinceEpoch,
      );
    } catch (error) {
      // A full disk must not break a request that already succeeded.
      debugPrint('Offline save failed for $key: $error');
    }
  }

  /// Reads back what was last saved, or null if there is nothing usable.
  CachedPayload<Object?>? read(String key) {
    final raw = _prefs.getString('$_prefix$key');
    if (raw == null) return null;

    final millis = _prefs.getInt('$_prefix$key$_savedAtSuffix');
    if (millis == null) return null;

    try {
      return CachedPayload(
        value: jsonDecode(raw),
        savedAt: DateTime.fromMillisecondsSinceEpoch(millis),
      );
    } catch (_) {
      // Corrupt or written by an older version of the app. Dropping it is
      // better than crashing a screen that was only trying to be helpful.
      return null;
    }
  }

  /// Reads a JSON object, or null when what was stored is not one.
  CachedPayload<Map<String, dynamic>>? readMap(String key) {
    final payload = read(key);
    final value = payload?.value;
    if (payload == null || value is! Map<String, dynamic>) return null;
    return CachedPayload(value: value, savedAt: payload.savedAt);
  }

  /// Reads a JSON list, or null when what was stored is not one.
  CachedPayload<List<dynamic>>? readList(String key) {
    final payload = read(key);
    final value = payload?.value;
    if (payload == null || value is! List) return null;
    return CachedPayload(value: value, savedAt: payload.savedAt);
  }

  Future<void> clear() async {
    final keys = _prefs.getKeys().where((k) => k.startsWith(_prefix)).toList();
    for (final key in keys) {
      await _prefs.remove(key);
    }
  }
}

/// Set once at startup, so repositories can reach the store synchronously.
final offlineStoreProvider = Provider<OfflineStore>(
  (ref) => throw UnimplementedError('offlineStoreProvider must be overridden'),
);

/// Cache keys. Kept together so two features cannot quietly collide on one.
class OfflineKeys {
  const OfflineKeys._();

  static String weather(String query) => 'weather:$query';
  static const mandi = 'mandi';
  static const fields = 'fields';
  static const schemes = 'schemes';
}
