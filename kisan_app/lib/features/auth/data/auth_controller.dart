import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import 'auth_models.dart';
import 'auth_repository.dart';

/// Where the app stands with respect to a signed-in user.
sealed class AuthState {
  const AuthState();
}

/// Still checking for a stored session. The router waits on this rather than
/// flashing the login screen at someone who is already signed in.
class AuthChecking extends AuthState {
  const AuthChecking();
}

class SignedOut extends AuthState {
  const SignedOut({this.failure});

  /// Set when the last attempt failed, so the login screen can explain why.
  final AuthFailure? failure;
}

class SigningIn extends AuthState {
  const SigningIn();
}

class SignedIn extends AuthState {
  const SignedIn(this.user);

  final AppUser user;
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(
  AuthController.new,
);

class AuthController extends Notifier<AuthState> {
  @override
  AuthState build() {
    // Kick off the session check without making every watcher await it.
    Future.microtask(restore);
    return const AuthChecking();
  }

  /// Looks for a session left over from a previous launch.
  Future<void> restore() async {
    final repository = ref.read(authRepositoryProvider);

    if (!await repository.hasStoredToken()) {
      state = const SignedOut();
      return;
    }

    try {
      final user = await repository.me();
      state = user == null ? const SignedOut() : SignedIn(user);
    } on ApiException {
      // Offline at launch. The token is still on the device and may well be
      // valid, so the user is not thrown out over a lost signal — the next
      // authenticated request will settle it.
      state = const SignedOut();
    }
  }

  Future<void> signInWithGoogle() async {
    state = const SigningIn();
    try {
      final user = await ref.read(authRepositoryProvider).signInWithGoogle();
      state = SignedIn(user);
    } on AuthFailure catch (failure) {
      state = SignedOut(failure: failure);
    } catch (_) {
      state = const SignedOut(failure: AuthFailure.server);
    }
  }

  /// Development-only sign-in. See [AuthRepository.signInWithPassword].
  Future<void> signInWithPassword(String username, String password) async {
    state = const SigningIn();
    try {
      final user = await ref
          .read(authRepositoryProvider)
          .signInWithPassword(username, password);
      state = SignedIn(user);
    } on AuthFailure catch (failure) {
      state = SignedOut(failure: failure);
    } catch (_) {
      state = const SignedOut(failure: AuthFailure.server);
    }
  }

  Future<void> signOut() async {
    await ref.read(authRepositoryProvider).signOut();
    state = const SignedOut();
  }

  /// Replaces the cached user after onboarding edits the profile.
  void updateUser(AppUser user) {
    if (state is SignedIn) state = SignedIn(user);
  }
}

/// Convenience for screens that only care whether someone is signed in.
final currentUserProvider = Provider<AppUser?>((ref) {
  final state = ref.watch(authControllerProvider);
  return state is SignedIn ? state.user : null;
});
