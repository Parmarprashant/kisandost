import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'farm_models.dart';

final farmRepositoryProvider = Provider<FarmRepository>(
  (ref) => FarmRepository(ref.read(dioProvider)),
);

class FarmRepository {
  FarmRepository(this._dio);

  final Dio _dio;

  Future<List<Field>> fields() async {
    final response = await _get<List<dynamic>>('/api/fields');
    return response
        .whereType<Map<String, dynamic>>()
        .map(Field.fromJson)
        .toList(growable: false);
  }

  Future<List<Crop>> cropsOf(String fieldId) async {
    final response = await _get<List<dynamic>>('/api/fields/$fieldId/crops');
    return response
        .whereType<Map<String, dynamic>>()
        .map(Crop.fromJson)
        .toList(growable: false);
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
final fieldsProvider = FutureProvider<List<Field>>((ref) {
  return ref.read(farmRepositoryProvider).fieldsWithCrops();
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
