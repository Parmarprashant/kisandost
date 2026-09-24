import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Keeps a provider's value alive for [duration] after it loads.
///
/// Riverpod 3 makes every provider auto-dispose by default, so a provider
/// watched by one screen is thrown away the moment the user moves to another
/// tab — and refetched when they come back. Left alone that turns idle tab
/// switching into repeated network calls, which for a farmer on a metered 3G
/// connection is their own money.
///
/// Call this **only after a successful load**. A failure is deliberately left
/// uncached: someone who was offline and reconnects should get a real retry on
/// the next visit rather than a remembered error.
void cacheFor(Ref ref, Duration duration) {
  final link = ref.keepAlive();
  final timer = Timer(duration, link.close);
  ref.onDispose(timer.cancel);
}

/// Weather moves, but not minute to minute, and the API's own forecast is
/// hourly.
const weatherCacheWindow = Duration(minutes: 15);

/// APMC prices are published once a day per mandi, so re-asking within a
/// session returns the same arrival date.
const mandiCacheWindow = Duration(minutes: 30);

/// The crop master list effectively never changes during a session.
const referenceCacheWindow = Duration(hours: 12);
