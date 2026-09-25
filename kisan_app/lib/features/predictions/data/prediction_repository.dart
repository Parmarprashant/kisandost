import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'prediction_models.dart';

final predictionRepositoryProvider = Provider<PredictionRepository>(
  (ref) => PredictionRepository(ref.read(dioProvider)),
);

class PredictionRepository {
  PredictionRepository(this._dio);

  final Dio _dio;

  /// Yield only, against the regional baseline.
  ///
  /// The route uses snake_case field names — `/api/predict-yield` uses
  /// camelCase for the same concepts, which is a trap worth stating once here
  /// rather than rediscovering.
  Future<YieldPrediction> predictYield({
    required String crop,
    required double areaAcres,
    required double ndvi,
    required double soilMoisture,
    required double rainfall,
  }) async {
    final json = await _post('/api/yield-prediction', {
      'crop_type': crop,
      'area_acres': areaAcres,
      'ndvi': ndvi,
      'soil_moisture': soilMoisture,
      'rainfall': rainfall,
    });

    return YieldPrediction.fromJson(json);
  }

  /// Yield, live mandi price and the margin over input costs.
  ///
  /// Field names here are camelCase. Sending `crop` instead of `cropType`
  /// makes the route crash with a 500 inside its mandi lookup rather than
  /// returning a validation error, so the names matter.
  Future<ProfitPrediction> predictProfit({
    required String crop,
    required double landArea,
    required double fertilizerCost,
    required double pesticideCost,
    required double irrigationCost,
    required double rainfall,
    required double nitrogen,
    required double phosphorus,
    required double potassium,
    required double ndvi,
    required double soilMoisture,
    String? state,
    String? district,
  }) async {
    final json = await _post('/api/predict-yield', {
      'cropType': crop,
      'landArea': landArea,
      'soilNitrogen': nitrogen,
      'soilPhosphorus': phosphorus,
      'soilPotassium': potassium,
      'rainfall': rainfall,
      'fertilizerCost': fertilizerCost,
      'pesticideCost': pesticideCost,
      'irrigationCost': irrigationCost,
      // The model behind this route requires both; without them it rejects the
      // call and the route silently answers from a hardcoded table instead.
      'ndvi': ndvi,
      'soilMoisture': soilMoisture,
      if (state != null && state.isNotEmpty) 'state': state,
      if (district != null && district.isNotEmpty) 'district': district,
    });

    return ProfitPrediction.fromJson(json);
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(path, data: body);
      final data = response.data;
      final status = response.statusCode ?? 0;

      if (status == 401 || status == 403) {
        throw const ApiException(ApiErrorKind.unauthorized);
      }
      if (status != 200 || data == null) {
        throw ApiException(
          status >= 400 && status < 500
              ? ApiErrorKind.badRequest
              : ApiErrorKind.server,
          statusCode: status,
          serverMessage: data?['error'] as String?,
        );
      }

      return data;
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }
}
