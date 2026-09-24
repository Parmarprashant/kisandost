/// Models for `/api/fields` and `/api/fields/[id]/crops`.
///
/// Field names and nesting were taken from live POST/GET responses, not from
/// the Mongoose schema — the route fills in nulls for anything unsent, so
/// every nested value has to be treated as optional.
library;

class Field {
  const Field({
    required this.id,
    required this.name,
    required this.area,
    required this.areaUnit,
    required this.location,
    required this.soil,
    required this.irrigation,
    this.previousCrop,
    this.crops = const [],
  });

  final String id;
  final String name;
  final double area;

  /// 'Acre' or 'Hectare'.
  final String areaUnit;

  final FieldLocation location;
  final SoilInfo soil;
  final IrrigationInfo irrigation;
  final String? previousCrop;

  /// Filled in separately — the fields list does not embed them.
  final List<Crop> crops;

  String get areaLabel => '${_trim(area)} $areaUnit';

  Field copyWith({List<Crop>? crops}) => Field(
    id: id,
    name: name,
    area: area,
    areaUnit: areaUnit,
    location: location,
    soil: soil,
    irrigation: irrigation,
    previousCrop: previousCrop,
    crops: crops ?? this.crops,
  );

  factory Field.fromJson(Map<String, dynamic> json) {
    return Field(
      id: json['_id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      area: _toDouble(json['area']),
      areaUnit: json['areaUnit'] as String? ?? 'Acre',
      location: FieldLocation.fromJson(_map(json['location'])),
      soil: SoilInfo.fromJson(_map(json['soil'])),
      irrigation: IrrigationInfo.fromJson(_map(json['irrigation'])),
      previousCrop: _nonEmpty(json['previousCrop']),
    );
  }
}

class FieldLocation {
  const FieldLocation({
    this.village,
    this.taluka,
    this.district,
    this.state,
    this.latitude,
    this.longitude,
  });

  final String? village;
  final String? taluka;
  final String? district;
  final String? state;
  final double? latitude;
  final double? longitude;

  bool get hasCoordinates => latitude != null && longitude != null;

  /// Village first — that is how a farmer names where a plot is.
  ///
  /// Repeats are collapsed: across much of India the village, taluka and
  /// district share a name, and "Anand, Anand, Anand, Gujarat" reads like a
  /// bug rather than an address.
  String get label {
    final parts = <String>[];
    for (final part in [village, taluka, district, state]) {
      if (part == null || part.isEmpty) continue;
      if (parts.isNotEmpty && parts.last.toLowerCase() == part.toLowerCase()) {
        continue;
      }
      parts.add(part);
    }
    return parts.join(', ');
  }

  /// For the weather API, which takes `lat,lon` or a place name.
  String? get weatherQuery {
    if (hasCoordinates) {
      return '${latitude!.toStringAsFixed(3)},${longitude!.toStringAsFixed(3)}';
    }
    if (district != null && district!.isNotEmpty) return '$district,India';
    if (village != null && village!.isNotEmpty) return '$village,India';
    return null;
  }

  factory FieldLocation.fromJson(Map<String, dynamic> json) {
    return FieldLocation(
      village: _nonEmpty(json['village']),
      taluka: _nonEmpty(json['taluka']),
      district: _nonEmpty(json['district']),
      state: _nonEmpty(json['state']),
      latitude: _toDoubleOrNull(json['latitude']),
      longitude: _toDoubleOrNull(json['longitude']),
    );
  }

  Map<String, dynamic> toJson() => {
    if (village != null) 'village': village,
    if (taluka != null) 'taluka': taluka,
    if (district != null) 'district': district,
    if (state != null) 'state': state,
    if (latitude != null) 'latitude': latitude,
    if (longitude != null) 'longitude': longitude,
  };
}

class SoilInfo {
  const SoilInfo({
    this.type,
    this.soilTestAvailable = false,
    this.pH,
    this.nitrogen,
    this.phosphorus,
    this.potassium,
    this.organicCarbon,
  });

  final String? type;
  final bool soilTestAvailable;
  final double? pH;
  final double? nitrogen;
  final double? phosphorus;
  final double? potassium;
  final double? organicCarbon;

  bool get hasTestValues =>
      pH != null || nitrogen != null || phosphorus != null || potassium != null;

  factory SoilInfo.fromJson(Map<String, dynamic> json) {
    return SoilInfo(
      type: _nonEmpty(json['type']),
      soilTestAvailable: json['soilTestAvailable'] as bool? ?? false,
      pH: _toDoubleOrNull(json['pH']),
      nitrogen: _toDoubleOrNull(json['nitrogen']),
      phosphorus: _toDoubleOrNull(json['phosphorus']),
      potassium: _toDoubleOrNull(json['potassium']),
      organicCarbon: _toDoubleOrNull(json['organicCarbon']),
    );
  }

  Map<String, dynamic> toJson() => {
    if (type != null) 'type': type,
    'soilTestAvailable': soilTestAvailable,
    if (pH != null) 'pH': pH,
    if (nitrogen != null) 'nitrogen': nitrogen,
    if (phosphorus != null) 'phosphorus': phosphorus,
    if (potassium != null) 'potassium': potassium,
    if (organicCarbon != null) 'organicCarbon': organicCarbon,
  };
}

class IrrigationInfo {
  const IrrigationInfo({this.method, this.waterSource, this.frequency});

  final String? method;
  final String? waterSource;
  final String? frequency;

  factory IrrigationInfo.fromJson(Map<String, dynamic> json) {
    return IrrigationInfo(
      method: _nonEmpty(json['method']),
      waterSource: _nonEmpty(json['waterSource']),
      frequency: _nonEmpty(json['frequency']),
    );
  }

  Map<String, dynamic> toJson() => {
    if (method != null) 'method': method,
    if (waterSource != null) 'waterSource': waterSource,
    if (frequency != null) 'frequency': frequency,
  };
}

class Crop {
  const Crop({
    required this.id,
    required this.fieldId,
    required this.cropName,
    required this.sowingDate,
    required this.cultivatedArea,
    required this.cultivatedAreaUnit,
    required this.status,
    this.variety,
    this.cultivationMethod,
    this.notes,
  });

  final String id;
  final String fieldId;
  final String cropName;
  final DateTime sowingDate;
  final double cultivatedArea;
  final String cultivatedAreaUnit;

  /// 'Active', 'Harvested' or 'Removed'.
  final String status;

  final String? variety;
  final String? cultivationMethod;
  final String? notes;

  bool get isActive => status == 'Active';

  /// Days since sowing — what the advisory engine keys off, and the number a
  /// farmer actually thinks in.
  int get daysAfterSowing {
    final days = DateTime.now().difference(sowingDate).inDays;
    return days < 0 ? 0 : days;
  }

  String get areaLabel => '${_trim(cultivatedArea)} $cultivatedAreaUnit';

  factory Crop.fromJson(Map<String, dynamic> json) {
    return Crop(
      id: json['_id']?.toString() ?? '',
      fieldId: json['fieldId']?.toString() ?? '',
      cropName: json['cropName'] as String? ?? '',
      sowingDate:
          DateTime.tryParse(json['sowingDate'] as String? ?? '') ??
          DateTime.now(),
      cultivatedArea: _toDouble(json['cultivatedArea']),
      cultivatedAreaUnit: json['cultivatedAreaUnit'] as String? ?? 'Acre',
      status: json['status'] as String? ?? 'Active',
      variety: _nonEmpty(json['variety']),
      cultivationMethod: _nonEmpty(json['cultivationMethod']),
      notes: _nonEmpty(json['notes']),
    );
  }
}

// ---------------------------------------------------------------- options

/// Wizard choices.
///
/// "Don't know" is a first-class option everywhere. The web wizard defaults to
/// Black Soil / Drip / Borewell, so a farmer who clicks through silently
/// stores confident-looking values nobody entered — and those values feed the
/// fertiliser calculator.
const dontKnow = "Don't know";

const soilTypes = [
  'Black Soil',
  'Loamy Soil',
  'Sandy Soil',
  'Clay Soil',
  'Alluvial Soil',
  'Red Soil',
  dontKnow,
];

const irrigationMethods = [
  'Drip',
  'Sprinkler',
  'Flood',
  'Rainfed',
  'Other',
  dontKnow,
];

const waterSources = [
  'Borewell',
  'Canal',
  'River',
  'Farm Pond',
  'Rainwater',
  'Other',
  dontKnow,
];

const irrigationFrequencies = [
  'Daily',
  'Every 2–3 days',
  'Weekly',
  'As required',
  'Rain-dependent',
  dontKnow,
];

const cultivationMethods = [
  'Direct Sowing',
  'Transplanting',
  'Nursery → Transplanting',
  'Other',
];

const areaUnits = ['Acre', 'Hectare'];

// ---------------------------------------------------------------- helpers

Map<String, dynamic> _map(Object? value) =>
    value is Map<String, dynamic> ? value : const {};

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

double _toDouble(Object? value) => _toDoubleOrNull(value) ?? 0;

double? _toDoubleOrNull(Object? value) => switch (value) {
  final num n => n.toDouble(),
  final String s => double.tryParse(s),
  _ => null,
};

/// 2.0 -> "2", 2.5 -> "2.5". Farmers write whole acres far more often than not.
String _trim(double value) {
  if (value == value.roundToDouble()) return value.round().toString();
  return value.toString();
}
