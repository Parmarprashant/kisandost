import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as p;

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/offline_store.dart';
import 'boundary_models.dart';
import 'crop_detail_models.dart';
import 'farm_models.dart';
import 'zone_scan_models.dart';

final farmRepositoryProvider = Provider<FarmRepository>(
  (ref) =>
      FarmRepository(ref.read(dioProvider), ref.read(offlineStoreProvider)),
);

class FarmRepository {
  FarmRepository(this._dio, this._offline);

  final Dio _dio;
  final OfflineStore _offline;

  /// When the fields currently in hand were saved, if they came from the
  /// cache rather than the network. Null when they are live.
  ///
  /// Held here because the provider returns a plain list and the screen still
  /// needs to know whether to say how old it is.
  DateTime? servedFromCacheAt;

  Future<List<Field>> fields() async {
    final response = await _get<List<dynamic>>('/api/fields');

    // The raw payload is cached rather than the parsed object: it round-trips
    // exactly what the server sent, with no second serialiser to drift.
    await _offline.save(OfflineKeys.fields, response);

    return response
        .whereType<Map<String, dynamic>>()
        .map(Field.fromJson)
        .toList(growable: false);
  }

  Future<List<Crop>> cropsOf(String fieldId) async {
    final response = await _get<List<dynamic>>('/api/fields/$fieldId/crops');
    await _offline.save(OfflineKeys.cropsOf(fieldId), response);

    return response
        .whereType<Map<String, dynamic>>()
        .map(Crop.fromJson)
        .toList(growable: false);
  }

  /// The farmer's fields and crops as they were last seen, or null if they
  /// have never loaded on this device.
  ///
  /// A farmer standing in their own field with no signal should still be able
  /// to see what is planted in it. This is the difference between an app that
  /// works outdoors and one that only works on wifi.
  CachedPayload<List<Field>>? lastKnownFields() {
    final cached = _offline.readList(OfflineKeys.fields);
    if (cached == null) return null;

    try {
      final fields = cached.value
          .whereType<Map<String, dynamic>>()
          .map(Field.fromJson)
          .map((field) {
            final crops = _offline.readList(OfflineKeys.cropsOf(field.id));
            if (crops == null) return field;
            return field.copyWith(
              crops: crops.value
                  .whereType<Map<String, dynamic>>()
                  .map(Crop.fromJson)
                  .toList(growable: false),
            );
          })
          .toList(growable: false);

      if (fields.isEmpty) return null;
      return CachedPayload(value: fields, savedAt: cached.savedAt);
    } catch (_) {
      // Written by an older version, or corrupt. Better to fall through to
      // the real error than to show half a farm.
      return null;
    }
  }

  /// Fields with their crops attached.
  ///
  /// The API has no combined endpoint, so the crop lists are fetched in
  /// parallel rather than one after another — on a rural connection a serial
  /// loop over five fields is five round trips the user waits through.
  Future<List<Field>> fieldsWithCrops() async {
    final list = await fields();
    final crops = await Future.wait(
      list.map((field) async {
        try {
          return await cropsOf(field.id);
        } on ApiException {
          // One field's crops failing should not blank the whole screen.
          return const <Crop>[];
        }
      }),
    );

    return [
      for (var i = 0; i < list.length; i++) list[i].copyWith(crops: crops[i]),
    ];
  }

  Future<Field> createField({
    required String name,
    required double area,
    required String areaUnit,
    required FieldLocation location,
    required SoilInfo soil,
    required IrrigationInfo irrigation,
    String? previousCrop,
  }) async {
    final body = {
      'name': name,
      'area': area,
      'areaUnit': areaUnit,
      'location': location.toJson(),
      'soil': soil.toJson(),
      'irrigation': irrigation.toJson(),
      if (previousCrop != null && previousCrop.isNotEmpty)
        'previousCrop': previousCrop,
    };

    final json = await _send<Map<String, dynamic>>('POST', '/api/fields', body);
    return Field.fromJson(json);
  }

  Future<Crop> addCrop({
    required String fieldId,
    required String cropName,
    required DateTime sowingDate,
    required double cultivatedArea,
    required String cultivatedAreaUnit,
    String? variety,
    String? cultivationMethod,
    String? notes,
  }) async {
    final body = {
      'cropName': cropName,
      // The API parses this with `new Date(...)`, so a date-only ISO string is
      // unambiguous where a localised string would not be.
      'sowingDate': sowingDate.toIso8601String().split('T').first,
      'cultivatedArea': cultivatedArea,
      'cultivatedAreaUnit': cultivatedAreaUnit,
      if (variety != null && variety.isNotEmpty) 'variety': variety,
      'cultivationMethod': ?cultivationMethod,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    };

    final json = await _send<Map<String, dynamic>>(
      'POST',
      '/api/fields/$fieldId/crops',
      body,
    );
    return Crop.fromJson(json);
  }

  Future<void> deleteField(String id) async {
    await _send<dynamic>('DELETE', '/api/fields/$id', null);
  }

  Future<void> deleteCrop(String id) async {
    await _send<dynamic>('DELETE', '/api/crops/$id', null);
  }

  Future<CropDetail> cropDetail(String cropId) async {
    final json = await _get<Map<String, dynamic>>('/api/crops/$cropId');
    return CropDetail.fromJson(json);
  }

  Future<CropRiskSummary> cropRisk(String cropId) async {
    final json = await _get<Map<String, dynamic>>('/api/crops/$cropId/risk');
    return CropRiskSummary.fromJson(json);
  }

  Future<CropCycleState> cropCycle(String cropId) async {
    final json = await _get<Map<String, dynamic>>('/api/crops/$cropId/cycle');
    return CropCycleState.fromJson(json);
  }

  Future<CropCycleState> updateCropCycle(String cropId) async {
    final json = await _send<Map<String, dynamic>>(
      'POST',
      '/api/crops/$cropId/cycle/update',
      <String, dynamic>{},
    );
    final cycleJson = json['cycle'] is Map<String, dynamic>
        ? json['cycle'] as Map<String, dynamic>
        : json;
    return CropCycleState.fromJson(cycleJson);
  }

  Future<List<CropScanItem>> cropScans(String cropId) async {
    final response = await _get<List<dynamic>>('/api/crops/$cropId/scans');
    return response
        .whereType<Map<String, dynamic>>()
        .map(CropScanItem.fromJson)
        .toList(growable: false);
  }

  Future<FieldBoundaryInfo> fieldBoundary(String fieldId) async {
    final json = await _get<Map<String, dynamic>>(
      '/api/fields/$fieldId/boundary',
    );
    return FieldBoundaryInfo.fromJson(json);
  }

  Future<FieldBoundaryInfo> saveFieldBoundary(
    String fieldId,
    Map<String, dynamic> boundary, {
    bool updateFieldArea = true,
  }) async {
    final json = await _send<Map<String, dynamic>>(
      'POST',
      '/api/fields/$fieldId/boundary',
      {'boundary': boundary, 'updateFieldArea': updateFieldArea},
    );
    return FieldBoundaryInfo.fromJson(json);
  }

  Future<List<ZoneItem>> fieldZones(String fieldId) async {
    final json = await _get<Map<String, dynamic>>('/api/fields/$fieldId/zones');
    final rawZones = json['zones'];
    if (rawZones is List) {
      return rawZones
          .whereType<Map<String, dynamic>>()
          .map(ZoneItem.fromJson)
          .toList(growable: false);
    }
    return const [];
  }

  Future<void> generateFieldZones(String fieldId, {int targetZones = 4}) async {
    await _send<Map<String, dynamic>>('POST', '/api/fields/$fieldId/zones', {
      'targetZones': targetZones,
    });
  }

  // ---------------------------------------------------- Multi-Photo Zone Scan

  Future<ZoneScanResult> startZoneScan(
    String cropId,
    String zoneId,
    File imageFile, {
    String viewAngle = 'screening',
  }) async {
    final bytes = await imageFile.readAsBytes();
    final filename = p.basename(imageFile.path);
    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        bytes,
        filename: filename.isEmpty ? 'scan.jpg' : filename,
        contentType: MediaType('image', 'jpeg'),
      ),
      'viewAngle': viewAngle,
    });

    final data = await _send<Map<String, dynamic>>(
      'POST',
      '/api/crops/$cropId/zones/$zoneId/scan',
      form,
    );
    return ZoneScanResult.fromJson(data);
  }

  Future<ZoneScanResult> uploadSupplementaryScan(
    String cropId,
    String zoneId,
    String sessionId,
    File imageFile, {
    String viewAngle = 'canopy',
  }) async {
    final bytes = await imageFile.readAsBytes();
    final filename = p.basename(imageFile.path);
    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        bytes,
        filename: filename.isEmpty ? 'scan.jpg' : filename,
        contentType: MediaType('image', 'jpeg'),
      ),
      'viewAngle': viewAngle,
    });

    final data = await _send<Map<String, dynamic>>(
      'POST',
      '/api/crops/$cropId/zones/$zoneId/scan/$sessionId/images',
      form,
    );
    return ZoneScanResult.fromJson(data);
  }

  Future<ZoneScanCompletionSummary> completeZoneScan(
    String cropId,
    String zoneId,
    String sessionId, {
    String? notes,
  }) async {
    final body = notes != null && notes.trim().isNotEmpty
        ? {'notes': notes.trim()}
        : <String, dynamic>{};

    final data = await _send<Map<String, dynamic>>(
      'POST',
      '/api/crops/$cropId/zones/$zoneId/scan/$sessionId/complete',
      body,
    );
    return ZoneScanCompletionSummary.fromJson(data);
  }

  Future<ZoneScanResult> getZoneScanSession(
    String cropId,
    String zoneId,
    String sessionId,
  ) async {
    final data = await _get<Map<String, dynamic>>(
      '/api/crops/$cropId/zones/$zoneId/scan/$sessionId',
    );
    return ZoneScanResult.fromJson(
      data['session'] as Map<String, dynamic>? ?? data,
    );
  }

  Future<T> _get<T>(String path) async {
    try {
      final response = await _dio.get<T>(path);
      final data = response.data;
      if (response.statusCode != 200 || data == null) {
        throw ApiException(
          _kindFor(response.statusCode),
          statusCode: response.statusCode,
        );
      }
      return data;
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  Future<T> _send<T>(String method, String path, Object? body) async {
    try {
      final response = await _dio.request<T>(
        path,
        data: body,
        options: Options(method: method),
      );

      final status = response.statusCode ?? 0;
      if (status < 200 || status >= 300) {
        throw ApiException(
          _kindFor(status),
          statusCode: status,
          serverMessage: _errorOf(response.data),
        );
      }

      return response.data as T;
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  // dio is configured to not throw below 500, so 4xx arrives as a normal
  // response and has to be classified here.
  ApiErrorKind _kindFor(int? status) => switch (status) {
    401 || 403 => ApiErrorKind.unauthorized,
    404 => ApiErrorKind.notFound,
    final s when s != null && s >= 400 && s < 500 => ApiErrorKind.badRequest,
    _ => ApiErrorKind.server,
  };

  String? _errorOf(Object? data) =>
      data is Map && data['error'] is String ? data['error'] as String : null;
}

/// All of the farmer's fields, each with its crops.
///
/// Not cached with `cacheFor`: this is data the user edits, and a stale list
/// after adding a field reads as the app having lost their work. It is
/// invalidated explicitly after every mutation instead.
final fieldsProvider = FutureProvider<List<Field>>((ref) async {
  final repository = ref.read(farmRepositoryProvider);
  try {
    final fields = await repository.fieldsWithCrops();
    repository.servedFromCacheAt = null;
    return fields;
  } on ApiException catch (error) {
    // Only a connection problem falls back. A 401 means the session is gone
    // and showing someone else's cached farm would be worse than an error.
    if (error.kind != ApiErrorKind.offline &&
        error.kind != ApiErrorKind.timeout) {
      rethrow;
    }

    final cached = repository.lastKnownFields();
    if (cached == null) rethrow;

    repository.servedFromCacheAt = cached.savedAt;
    return cached.value;
  }
});

/// When the fields on screen were saved, if they came from the cache.
///
/// Null when they are live. The screen uses it to say how old they are rather
/// than presenting a week-old crop list as today's.
final fieldsCachedAtProvider = Provider<DateTime?>((ref) {
  final async = ref.watch(fieldsProvider);
  if (!async.hasValue) return null;
  return ref.read(farmRepositoryProvider).servedFromCacheAt;
});

/// Every active crop across every field, for the home screen.
final activeCropsProvider = Provider<List<({Field field, Crop crop})>>((ref) {
  final fields = ref.watch(fieldsProvider).value ?? const [];
  return [
    for (final field in fields)
      for (final crop in field.crops)
        if (crop.isActive) (field: field, crop: crop),
  ];
});

/// Detailed information for a single crop by its ID.
final cropDetailProvider = FutureProvider.family<CropDetail, String>((
  ref,
  cropId,
) async {
  return ref.read(farmRepositoryProvider).cropDetail(cropId);
});

/// AgriShield 360° risk evaluation for a crop.
final cropRiskProvider = FutureProvider.family<CropRiskSummary, String>((
  ref,
  cropId,
) async {
  return ref.read(farmRepositoryProvider).cropRisk(cropId);
});

/// Cycle telemetry and thermal progression state for a crop.
final cropCycleProvider = FutureProvider.family<CropCycleState, String>((
  ref,
  cropId,
) async {
  return ref.read(farmRepositoryProvider).cropCycle(cropId);
});

/// Historical disease scans specifically attached to a crop.
final cropScansProvider = FutureProvider.family<List<CropScanItem>, String>((
  ref,
  cropId,
) async {
  return ref.read(farmRepositoryProvider).cropScans(cropId);
});

/// Field boundary polygon details.
final fieldBoundaryProvider = FutureProvider.family<FieldBoundaryInfo, String>((
  ref,
  fieldId,
) async {
  return ref.read(farmRepositoryProvider).fieldBoundary(fieldId);
});

/// Field monitoring zones.
final fieldZonesProvider = FutureProvider.family<List<ZoneItem>, String>((
  ref,
  fieldId,
) async {
  return ref.read(farmRepositoryProvider).fieldZones(fieldId);
});
