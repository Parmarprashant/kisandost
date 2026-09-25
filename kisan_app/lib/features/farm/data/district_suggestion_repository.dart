import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

class DistrictData {
  const DistrictData({
    required this.district,
    required this.season,
    required this.waterAvailability,
    required this.crops,
    required this.reason,
    this.latitude,
    this.longitude,
  });

  final String district;
  final String season;
  final String waterAvailability;
  final List<String> crops;
  final String reason;
  final double? latitude;
  final double? longitude;

  factory DistrictData.fromJson(Map<String, dynamic> json) {
    final rawCrops = json['crops'];
    final crops = rawCrops is List
        ? rawCrops.whereType<String>().toList(growable: false)
        : const <String>[];

    return DistrictData(
      district: json['district'] as String? ?? '',
      season: json['season'] as String? ?? 'Kharif',
      waterAvailability: json['water_availability'] as String? ?? 'Medium',
      crops: crops,
      reason: json['reason'] as String? ?? '',
      latitude: (json['lat'] is num) ? (json['lat'] as num).toDouble() : null,
      longitude: (json['lng'] is num) ? (json['lng'] as num).toDouble() : null,
    );
  }
}

class DistrictSuggestionRepository {
  DistrictSuggestionRepository(this._dio);

  final Dio _dio;
  List<DistrictData>? _cachedDistricts;

  Future<List<DistrictData>> getDistricts() async {
    final cached = _cachedDistricts;
    if (cached != null) return cached;

    final raw = await rootBundle.loadString('assets/districts_dataset.json');
    final decoded = jsonDecode(raw);

    final list = decoded is List
        ? decoded
              .whereType<Map<String, dynamic>>()
              .map(DistrictData.fromJson)
              .toList(growable: false)
        : const <DistrictData>[];

    return _cachedDistricts = list;
  }

  Future<String> getGeminiAdvisory({
    required String district,
    required String season,
    required String waterAvailability,
    required List<String> recommendedCrops,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/api/gemini/district-suggestion',
        data: {
          'district': district,
          'season': season,
          'waterAvailability': waterAvailability,
          'recommendedCrops': recommendedCrops,
        },
      );

      final data = res.data;
      if (data != null && data['advisory'] != null) {
        return data['advisory'].toString();
      }
      return 'No advisory returned from agronomy AI server.';
    } on DioException catch (e) {
      if (e.response != null && e.response?.data is Map) {
        final err = (e.response?.data as Map)['error'] ?? e.response?.data;
        return 'Server note: $err';
      }
      return 'Unable to fetch real-time AI advisory (${e.message}). '
          'Baseline agronomic recommendation: Suitable crops for $district in $season with $waterAvailability water availability are ${recommendedCrops.join(", ")}.';
    }
  }
}

final districtSuggestionRepositoryProvider =
    Provider<DistrictSuggestionRepository>((ref) {
      return DistrictSuggestionRepository(ref.watch(dioProvider));
    });

final districtsListProvider = FutureProvider<List<DistrictData>>((ref) {
  return ref.read(districtSuggestionRepositoryProvider).getDistricts();
});
