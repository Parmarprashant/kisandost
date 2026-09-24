import 'package:characters/characters.dart';

/// The signed-in farmer, as `/api/auth/me` returns them.
class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    this.username,
    this.email,
    this.avatar,
    this.mobile,
    this.village,
    this.district,
    this.mainCrop,
  });

  final String id;
  final String name;
  final String? username;
  final String? email;
  final String? avatar;
  final String? mobile;
  final String? village;
  final String? district;
  final String? mainCrop;

  /// A Google sign-up fills in name and email but nothing about the farm, so
  /// the app asks for the rest once before letting them into the shell.
  bool get needsOnboarding =>
      (village == null || village!.isEmpty) ||
      (district == null || district!.isEmpty);

  /// Shown in the avatar when there is no picture.
  String get initials {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty);
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.characters.first.toUpperCase();
    return (parts.first.characters.first + parts.last.characters.first)
        .toUpperCase();
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      username: json['username'] as String?,
      email: json['email'] as String?,
      avatar: json['avatar'] as String?,
      mobile: json['mobile'] as String?,
      village: json['village'] as String?,
      district: json['district'] as String?,
      mainCrop: json['mainCrop'] as String?,
    );
  }
}

/// Why a sign-in attempt did not produce a session.
///
/// The OAuth callback reports failures as an `error` query parameter on the
/// app's custom scheme, so these mirror the values the route can send.
enum AuthFailure {
  /// The user closed the browser before finishing.
  cancelled,

  /// Google refused, or the code could not be exchanged.
  rejected,

  /// The callback did not match the request this app started. Treated as
  /// hostile rather than as a glitch.
  stateMismatch,

  /// Reached the server but something broke.
  server,

  /// No usable connection.
  offline,
}

extension AuthFailureFromCallback on AuthFailure {
  static AuthFailure parse(String? error) => switch (error) {
    'state_mismatch' => AuthFailure.stateMismatch,
    'google_auth_failed' ||
    'token_exchange_failed' ||
    'profile_fetch_failed' => AuthFailure.rejected,
    _ => AuthFailure.server,
  };
}
