import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';

class LocalizedText {
  const LocalizedText({required this.en, required this.hi, required this.gu});

  final String en;
  final String hi;
  final String gu;

  String localized(String langCode) {
    if (langCode == 'hi') return hi.isNotEmpty ? hi : en;
    if (langCode == 'gu') return gu.isNotEmpty ? gu : en;
    return en;
  }

  factory LocalizedText.fromJson(dynamic json) {
    if (json is Map) {
      return LocalizedText(
        en: json['en']?.toString() ?? '',
        hi: json['hi']?.toString() ?? '',
        gu: json['gu']?.toString() ?? '',
      );
    }
    if (json is String) {
      return LocalizedText(en: json, hi: json, gu: json);
    }
    return const LocalizedText(en: '', hi: '', gu: '');
  }
}

class CropDiseaseItem {
  const CropDiseaseItem({
    required this.name,
    required this.symptoms,
    required this.favorableConditions,
    required this.management,
    required this.icon,
  });

  final LocalizedText name;
  final LocalizedText symptoms;
  final LocalizedText favorableConditions;
  final LocalizedText management;
  final String icon;

  factory CropDiseaseItem.fromJson(Map<String, dynamic> json) {
    return CropDiseaseItem(
      name: LocalizedText.fromJson(json['name']),
      symptoms: LocalizedText.fromJson(json['symptoms']),
      favorableConditions: LocalizedText.fromJson(json['favorableConditions']),
      management: LocalizedText.fromJson(json['management']),
      icon: json['icon']?.toString() ?? '🌱',
    );
  }
}

class CropEncyclopediaItem {
  const CropEncyclopediaItem({
    required this.id,
    required this.name,
    required this.image,
    required this.season,
    required this.soilType,
    required this.waterNeed,
    required this.health,
    required this.ndvi,
    required this.diseases,
    required this.precautions,
  });

  final String id;
  final LocalizedText name;
  final String image;
  final LocalizedText season;
  final LocalizedText soilType;
  final LocalizedText waterNeed;
  final String health;
  final double ndvi;
  final List<CropDiseaseItem> diseases;
  final LocalizedText precautions;

  factory CropEncyclopediaItem.fromJson(Map<String, dynamic> json) {
    final rawDiseases = json['diseases'];
    final diseases = rawDiseases is List
        ? rawDiseases
              .whereType<Map<String, dynamic>>()
              .map(CropDiseaseItem.fromJson)
              .toList(growable: false)
        : const <CropDiseaseItem>[];

    return CropEncyclopediaItem(
      id: json['id']?.toString() ?? '',
      name: LocalizedText.fromJson(json['name']),
      image: json['image']?.toString() ?? '',
      season: LocalizedText.fromJson(json['season']),
      soilType: LocalizedText.fromJson(json['soilType']),
      waterNeed: LocalizedText.fromJson(json['waterNeed']),
      health: json['health']?.toString() ?? 'Healthy',
      ndvi: (json['ndvi'] is num) ? (json['ndvi'] as num).toDouble() : 0.6,
      diseases: diseases,
      precautions: LocalizedText.fromJson(json['precautions']),
    );
  }
}

class CropEncyclopediaRepository {
  List<CropEncyclopediaItem>? _cache;

  Future<List<CropEncyclopediaItem>> getAll() async {
    final cached = _cache;
    if (cached != null) return cached;

    final raw = await rootBundle.loadString('assets/crop_encyclopedia.json');
    final decoded = jsonDecode(raw);

    final items = decoded is List
        ? decoded
              .whereType<Map<String, dynamic>>()
              .map(CropEncyclopediaItem.fromJson)
              .toList(growable: false)
        : const <CropEncyclopediaItem>[];

    return _cache = items;
  }
}

final cropEncyclopediaRepositoryProvider = Provider<CropEncyclopediaRepository>(
  (ref) => CropEncyclopediaRepository(),
);

final cropEncyclopediaProvider = FutureProvider<List<CropEncyclopediaItem>>((
  ref,
) {
  return ref.read(cropEncyclopediaRepositoryProvider).getAll();
});
