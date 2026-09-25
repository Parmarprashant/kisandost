import 'dart:math' as math;

import 'package:latlong2/latlong.dart';

class FieldBoundaryInfo {
  const FieldBoundaryInfo({
    required this.fieldId,
    required this.fieldName,
    required this.hasBoundary,
    required this.points,
    required this.area,
    required this.areaUnit,
    this.calculatedArea,
    required this.zoneCount,
    this.centerLat,
    this.centerLng,
  });

  final String fieldId;
  final String fieldName;
  final bool hasBoundary;
  final List<LatLng> points;
  final double area;
  final String areaUnit;
  final double? calculatedArea;
  final int zoneCount;
  final double? centerLat;
  final double? centerLng;

  factory FieldBoundaryInfo.fromJson(Map<String, dynamic> json) {
    final boundary = json['boundary'];
    final List<LatLng> points = [];

    if (boundary is Map && boundary['coordinates'] is List) {
      final rings = boundary['coordinates'] as List;
      if (rings.isNotEmpty && rings[0] is List) {
        final rawRing = rings[0] as List;
        for (final pt in rawRing) {
          if (pt is List && pt.length >= 2) {
            final lng = (pt[0] as num).toDouble();
            final lat = (pt[1] as num).toDouble();
            points.add(LatLng(lat, lng));
          }
        }
      }
    }

    final loc = json['location'];
    double? centerLat;
    double? centerLng;
    if (loc is Map) {
      if (loc['latitude'] is num) {
        centerLat = (loc['latitude'] as num).toDouble();
      }
      if (loc['longitude'] is num) {
        centerLng = (loc['longitude'] as num).toDouble();
      }
    }

    return FieldBoundaryInfo(
      fieldId: json['fieldId']?.toString() ?? '',
      fieldName: json['fieldName']?.toString() ?? 'Field',
      hasBoundary: json['hasBoundary'] == true || points.length >= 3,
      points: points,
      area: (json['area'] is num) ? (json['area'] as num).toDouble() : 0.0,
      areaUnit: json['areaUnit']?.toString() ?? 'Acres',
      calculatedArea: (json['calculatedArea'] is num)
          ? (json['calculatedArea'] as num).toDouble()
          : null,
      zoneCount: (json['zoneCount'] is num)
          ? (json['zoneCount'] as num).toInt()
          : 0,
      centerLat: centerLat,
      centerLng: centerLng,
    );
  }

  Map<String, dynamic> toGeoJsonPolygon(List<LatLng> polygonPoints) {
    final ring = polygonPoints.map((p) => [p.longitude, p.latitude]).toList();
    if (ring.isNotEmpty &&
        (ring.first[0] != ring.last[0] || ring.first[1] != ring.last[1])) {
      ring.add([ring.first[0], ring.first[1]]);
    }

    return {
      'type': 'Polygon',
      'coordinates': [ring],
    };
  }

  /// Calculates geodesic area of the polygon points in acres.
  static double calculateAreaInAcres(List<LatLng> pts) {
    if (pts.length < 3) return 0.0;
    const earthRadius = 6378137.0; // meters
    double area = 0.0;

    for (int i = 0; i < pts.length; i++) {
      final j = (i + 1) % pts.length;
      final p1 = pts[i];
      final p2 = pts[j];

      final lat1 = p1.latitude * math.pi / 180.0;
      final lat2 = p2.latitude * math.pi / 180.0;
      final dLng = (p2.longitude - p1.longitude) * math.pi / 180.0;

      area += dLng * (2 + math.sin(lat1) + math.sin(lat2));
    }

    area = (area.abs() * earthRadius * earthRadius) / 4.0;
    // 1 sq meter = 0.000247105 acres
    return area * 0.000247105;
  }
}

class ZoneItem {
  const ZoneItem({
    required this.id,
    required this.zoneCode,
    required this.zoneName,
    required this.areaFraction,
    required this.points,
    required this.healthStatus,
  });

  final String id;
  final String zoneCode;
  final String zoneName;
  final double areaFraction;
  final List<LatLng> points;
  final String healthStatus;

  factory ZoneItem.fromJson(Map<String, dynamic> json) {
    final poly = json['polygon'];
    final List<LatLng> pts = [];
    if (poly is Map && poly['coordinates'] is List) {
      final rings = poly['coordinates'] as List;
      if (rings.isNotEmpty && rings[0] is List) {
        for (final pt in rings[0] as List) {
          if (pt is List && pt.length >= 2) {
            final lng = (pt[0] as num).toDouble();
            final lat = (pt[1] as num).toDouble();
            pts.add(LatLng(lat, lng));
          }
        }
      }
    }

    return ZoneItem(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      zoneCode: json['zoneCode']?.toString() ?? '',
      zoneName: json['zoneName']?.toString() ?? 'Zone',
      areaFraction: (json['areaFraction'] is num)
          ? (json['areaFraction'] as num).toDouble()
          : 0.25,
      points: pts,
      healthStatus: json['healthStatus']?.toString() ?? 'NORMAL',
    );
  }
}
