import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/offline/connectivity.dart';
import 'package:kisan_app/core/offline/offline_store.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late OfflineStore store;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    store = OfflineStore(await SharedPreferences.getInstance());
  });

  group('save and read', () {
    test('round-trips a JSON object', () async {
      await store.save('weather:Mehsana', {'temp': 31, 'city': 'Mehsana'});

      final cached = store.readMap('weather:Mehsana')!;
      expect(cached.value['temp'], 31);
      expect(cached.value['city'], 'Mehsana');
    });

    test('round-trips a JSON list', () async {
      await store.save('mandi', [
        {'crop': 'Cotton'},
        {'crop': 'Wheat'},
      ]);

      final cached = store.readList('mandi')!;
      expect(cached.value, hasLength(2));
    });

    test('a key that was never saved reads as null', () {
      expect(store.readMap('nothing-here'), isNull);
      expect(store.readList('nothing-here'), isNull);
    });

    test('overwrites an earlier value for the same key', () async {
      await store.save('mandi', {'price': 100});
      await store.save('mandi', {'price': 200});
      expect(store.readMap('mandi')!.value['price'], 200);
    });

    test('keys do not collide across features', () async {
      await store.save(OfflineKeys.weather('Mehsana'), {'from': 'weather'});
      await store.save(OfflineKeys.mandi, {'from': 'mandi'});

      expect(
        store.readMap(OfflineKeys.weather('Mehsana'))!.value['from'],
        'weather',
      );
      expect(store.readMap(OfflineKeys.mandi)!.value['from'], 'mandi');
    });

    test('weather is cached per place, not globally', () async {
      // The home strip and the weather screen watch different locations.
      // One slot would have them overwriting each other.
      await store.save(OfflineKeys.weather('Mehsana'), {'t': 31});
      await store.save(OfflineKeys.weather('Rajkot'), {'t': 34});

      expect(store.readMap(OfflineKeys.weather('Mehsana'))!.value['t'], 31);
      expect(store.readMap(OfflineKeys.weather('Rajkot'))!.value['t'], 34);
    });
  });

  group('type safety', () {
    test('readMap returns null when a list was stored', () async {
      // Reading the wrong shape must not throw into a screen that is only
      // trying to be helpful when offline.
      await store.save('mandi', [1, 2, 3]);
      expect(store.readMap('mandi'), isNull);
    });

    test('readList returns null when an object was stored', () async {
      await store.save('mandi', {'a': 1});
      expect(store.readList('mandi'), isNull);
    });
  });

  group('age', () {
    test('something just saved is fresh', () async {
      await store.save('mandi', {'a': 1});
      final cached = store.readMap('mandi')!;

      expect(cached.age.inSeconds, lessThan(5));
      expect(cached.isStale, isFalse);
    });

    test('old enough data is marked stale', () {
      final old = CachedPayload(
        value: 1,
        savedAt: DateTime.now().subtract(const Duration(hours: 9)),
      );
      expect(old.isStale, isTrue);
    });

    test('a payload with no timestamp is unusable', () async {
      // Without an age we cannot tell the farmer how old it is, and showing
      // undated figures as current is the thing this whole layer avoids.
      SharedPreferences.setMockInitialValues({'offline:mandi': '{"a":1}'});
      final bare = OfflineStore(await SharedPreferences.getInstance());
      expect(bare.readMap('mandi'), isNull);
    });
  });

  group('corruption', () {
    test(
      'unparseable stored text reads as null rather than throwing',
      () async {
        SharedPreferences.setMockInitialValues({
          'offline:mandi': 'not json at all',
          'offline:mandi:savedAt': DateTime.now().millisecondsSinceEpoch,
        });
        final broken = OfflineStore(await SharedPreferences.getInstance());
        expect(broken.readMap('mandi'), isNull);
      },
    );
  });

  group('clear', () {
    test('removes cached data and leaves other settings alone', () async {
      SharedPreferences.setMockInitialValues({'locale': 'gu'});
      final prefs = await SharedPreferences.getInstance();
      final s = OfflineStore(prefs);

      await s.save('mandi', {'a': 1});
      await s.clear();

      expect(s.readMap('mandi'), isNull);
      // Clearing the cache must not sign someone out or reset their language.
      expect(prefs.getString('locale'), 'gu');
    });
  });

  group('hasConnection', () {
    test('no interface at all is offline', () {
      expect(hasConnection(const []), isFalse);
      expect(hasConnection(const [ConnectivityResult.none]), isFalse);
    });

    test('any usable interface is online', () {
      expect(hasConnection(const [ConnectivityResult.mobile]), isTrue);
      expect(hasConnection(const [ConnectivityResult.wifi]), isTrue);
    });

    test('mixed results count as online', () {
      // A phone can report wifi and none together while switching networks.
      expect(
        hasConnection(const [
          ConnectivityResult.none,
          ConnectivityResult.mobile,
        ]),
        isTrue,
      );
    });
  });
}
