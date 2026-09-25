/// Premium membership.
///
/// By decision there is no payment flow in v1 — the web app has prices and a
/// "Get Premium" button but no gateway wired anywhere, and membership rows are
/// written straight into Mongo. So this reads the status and gates the
/// features that require it; it never claims to sell anything.
///
/// Worth knowing: nothing in the codebase creates a `UserMembership` record.
/// The web pricing page says to insert one by hand. Until something does,
/// [hasPremium] is false for everyone and the gated screens say so plainly
/// rather than failing with a 403 the farmer cannot act on.
library;

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/cache_policy.dart';
import '../../../core/network/dio_client.dart';
import '../../auth/data/auth_controller.dart';

class MembershipRepository {
  MembershipRepository(this._dio);

  final Dio _dio;

  Future<bool> hasActiveMembership() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/api/membership');
      return response.data?['hasActiveMembership'] == true;
    } on DioException {
      // A signed-out user gets a 401, anything else is a server problem.
      // Either way the answer the UI needs is "not premium", not an error
      // page — the rest of the app works fine without it.
      return false;
    }
  }
}

final membershipRepositoryProvider = Provider<MembershipRepository>(
  (ref) => MembershipRepository(ref.watch(dioProvider)),
);

/// Whether this user can use the premium features.
///
/// Depends on auth so it re-resolves on sign-in rather than caching a `false`
/// from before the user signed in.
final membershipProvider = FutureProvider<bool>((ref) async {
  final user = ref.watch(currentUserProvider);
  if (user == null) return false;

  final result = await ref
      .read(membershipRepositoryProvider)
      .hasActiveMembership();

  // Membership does not change minute to minute, and every gated screen asks.
  cacheFor(ref, const Duration(minutes: 30));
  return result;
});
