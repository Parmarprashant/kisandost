import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/offline/offline_store.dart';
import 'package:kisan_app/features/farm/data/farm_repository.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// A field exactly as `/api/fields` returns it.
final _fieldJson = {
  '_id': 'f1',
  'name': 'North plot',
  'area': 2.5,
  'areaUnit': 'Acre',
  'location': {
    'village': 'Visnagar',
    'taluka': 'Visnagar',
    'district': 'Mehsana',
    'state': 'Gujarat',
  },
  'soil': {'soilType': 'Black'},
  'irrigation': {'method': 'Drip'},
};

/// Crops as `/api/fields/f1/crops` returns them.
final _cropsJson = [
  {
    '_id': 'c1',
    'fieldId': 'f1',
    'cropName': 'Cotton',
    'sowingDate': '2026-06-15T00:00:00.000Z',
    'cultivatedArea': 2.5,
    'cultivatedAreaUnit': 'Acre',
    'status': 'Active',
  },
  {
    '_id': 'c2',
    'fieldId': 'f1',
    'cropName': 'Wheat',
    'sowingDate': '2025-11-20T00:00:00.000Z',
    'cultivatedArea': 1.0,
    'cultivatedAreaUnit': 'Acre',
    'status': 'Harvested',
  },
];

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late OfflineStore store;
  late FarmRepository repository;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    store = OfflineStore(await SharedPreferences.getInstance());
    // Dio is unused by lastKnownFields — the whole point is that it answers
    // with no network at all.
    repository = FarmRepository(Dio(), store);
  });

  group('with nothing cached', () {
    test('there is no last-known farm', () {
      expect(repository.lastKnownFields(), isNull);
    });

    test('an empty cached list is treated as nothing, not an empty farm', () {
      // Showing "no fields" to someone who has fields would read as the app
      // having lost their work.
      store.save(OfflineKeys.fields, <dynamic>[]);
      expect(repository.lastKnownFields(), isNull);
    });
  });

  group('after a successful load has been cached', () {
    setUp(() async {
      await store.save(OfflineKeys.fields, [_fieldJson]);
      await store.save(OfflineKeys.cropsOf('f1'), _cropsJson);
    });

    test('the farm comes back with no network', () {
      final cached = repository.lastKnownFields()!;

      expect(cached.value, hasLength(1));
      expect(cached.value.single.name, 'North plot');
      expect(cached.value.single.location.district, 'Mehsana');
    });

    test('crops are reattached to their field', () {
      // This is the metric: a farmer in airplane mode still sees what is
      // planted. Fields without crops would be half an answer.
      final field = repository.lastKnownFields()!.value.single;

      expect(field.crops, hasLength(2));
      expect(field.crops.first.cropName, 'Cotton');
      expect(field.crops.first.isActive, isTrue);
      expect(field.crops.last.cropName, 'Wheat');
      expect(field.crops.last.isActive, isFalse);
    });

    test('sowing dates survive the round trip', () {
      // daysAfterSowing drives the whole advisory calendar, so a date lost
      // in the cache would silently move a farmer to the wrong crop stage.
      final crop = repository.lastKnownFields()!.value.single.crops.first;
      expect(crop.sowingDate, DateTime.parse('2026-06-15T00:00:00.000Z'));
    });

    test('it reports when it was saved', () {
      final cached = repository.lastKnownFields()!;
      expect(cached.age.inSeconds, lessThan(5));
    });
  });

  group('partial cache', () {
    test('a field whose crops were never cached still loads', () async {
      // Better to show the field with no crops than to hide the field.
      await store.save(OfflineKeys.fields, [_fieldJson]);

      final field = repository.lastKnownFields()!.value.single;
      expect(field.name, 'North plot');
      expect(field.crops, isEmpty);
    });

    test('crops are kept per field, not shared', () async {
      final second = Map<String, dynamic>.from(_fieldJson)
        ..['_id'] = 'f2'
        ..['name'] = 'South plot';

      await store.save(OfflineKeys.fields, [_fieldJson, second]);
      await store.save(OfflineKeys.cropsOf('f1'), _cropsJson);

      final fields = repository.lastKnownFields()!.value;
      expect(fields, hasLength(2));
      expect(fields.first.crops, hasLength(2));
      expect(fields.last.crops, isEmpty);
    });
  });

  group('corrupt cache', () {
    test(
      'a non-list payload is ignored rather than crashing the farm',
      () async {
        await store.save(OfflineKeys.fields, {'not': 'a list'});
        expect(repository.lastKnownFields(), isNull);
      },
    );

    test('entries that are not objects are skipped', () async {
      await store.save(OfflineKeys.fields, ['nonsense', _fieldJson]);
      final cached = repository.lastKnownFields()!;
      expect(cached.value, hasLength(1));
    });
  });
}
