/// Models for `GET /api/mandi-prices`.
///
/// The route wraps the data.gov.in APMC feed. Two things about it shape this
/// file, and both are honesty problems rather than parsing problems:
///
/// 1. **It never fails.** When the government feed has nothing for a crop or
///    state, it returns a fabricated MSP-baseline figure with `success: true`.
///    The only signal is the `source` string, so that is what [isLive] reads.
/// 2. **It ignores the requested district.** Asking for Rajkot can return a
///    mandi in Jamnagar. The UI must show the district that came back, not the
///    one the farmer picked, or it misreports where the price is from.
library;

/// How far a price can be trusted.
///
/// The route reports its provenance only through a free-text `source` string,
/// and it uses five different ones:
///
/// | `source` | Meaning | Confidence |
/// | :-- | :-- | :-- |
/// | `data.gov.in (Live APMC)` | today's reading from a real mandi | live |
/// | `data.gov.in (National APMC Average)` | real, but averaged nationwide | indicative |
/// | `Database Cache` | real, fetched earlier and stored | indicative |
/// | `Government MSP Baseline` | not a traded price | estimated |
/// | `CACP / APMC Baseline` | not a traded price | estimated |
enum PriceConfidence {
  /// A real reading from a real market, today.
  live,

  /// Real government data, but not a fresh local reading — a national average
  /// or a cached figure. Honest to show, dishonest to call live.
  indicative,

  /// A calculated baseline. Nobody traded at this price.
  estimated,
}

class MandiPrice {
  const MandiPrice({
    required this.crop,
    required this.mandi,
    required this.district,
    required this.state,
    required this.pricePerQuintal,
    required this.minPrice,
    required this.maxPrice,
    required this.arrivalDate,
    required this.source,
    required this.variety,
  });

  final String crop;

  /// The market the price is from — e.g. "Kalawad APMC".
  final String mandi;

  /// The district the returned mandi is in. **Not** necessarily the one that
  /// was asked for.
  final String district;

  final String state;
  final int pricePerQuintal;
  final int minPrice;
  final int maxPrice;

  /// As sent: `dd/MM/yyyy`, and sometimes `d/M/yyyy` on the fallback path.
  final String arrivalDate;

  final String source;
  final String variety;

  /// How much this number can be trusted, derived from `source`.
  ///
  /// The route emits five different source strings and gives no other signal,
  /// so they are classified here in one place. Getting this wrong in the
  /// optimistic direction would have a farmer plan a harvest around a price
  /// nobody traded at.
  PriceConfidence get confidence => switch (source.toLowerCase()) {
    final s when s.contains('live apmc') => PriceConfidence.live,
    final s when s.contains('data.gov.in') => PriceConfidence.indicative,
    final s when s.contains('database cache') => PriceConfidence.indicative,
    // Anything unrecognised is treated as an estimate. Being wrong that way
    // costs a caveat; the other way presents a guess as fact.
    _ => PriceConfidence.estimated,
  };

  bool get isLive => confidence == PriceConfidence.live;

  /// Whether min and max say anything beyond the headline price.
  bool get hasRange => maxPrice > minPrice && minPrice > 0;

  String get location {
    final parts = [
      if (mandi.isNotEmpty) mandi,
      if (district.isNotEmpty) district,
      if (state.isNotEmpty) state,
    ];
    return parts.join(' · ');
  }

  factory MandiPrice.fromJson(Map<String, dynamic> json) {
    return MandiPrice(
      crop: json['crop'] as String? ?? '',
      mandi: json['mandi'] as String? ?? '',
      district: json['district'] as String? ?? '',
      state: json['state'] as String? ?? '',
      pricePerQuintal: _toInt(json['pricePerQuintal']),
      minPrice: _toInt(json['minPrice']),
      maxPrice: _toInt(json['maxPrice']),
      arrivalDate: json['arrivalDate'] as String? ?? '',
      source: json['source'] as String? ?? '',
      variety: json['variety'] as String? ?? '',
    );
  }
}

int _toInt(Object? value) => switch (value) {
  final num n => n.round(),
  final String s => int.tryParse(s) ?? num.tryParse(s)?.round() ?? 0,
  _ => 0,
};

/// The states the APMC feed covers, for the picker.
///
/// A fixed list rather than a lookup: the feed has no "list states" endpoint,
/// and these do not change.
const indianStates = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

/// Used only if `/api/crop-master` cannot be reached, so the screen still
/// works offline instead of showing an empty dropdown.
const fallbackCrops = [
  'Wheat',
  'Rice',
  'Cotton',
  'Groundnut',
  'Maize',
  'Bajra',
  'Jowar',
  'Soyabean',
  'Mustard',
  'Gram',
  'Sugarcane',
  'Onion',
  'Potato',
  'Tomato',
];
