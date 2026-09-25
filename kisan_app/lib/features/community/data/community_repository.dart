import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/offline/write_queue.dart';
import 'community_models.dart';

final communityRepositoryProvider = Provider<CommunityRepository>(
  (ref) =>
      CommunityRepository(ref.read(dioProvider), ref.read(writeQueueProvider)),
);

class CommunityRepository {
  CommunityRepository(this._dio, this._queue);

  final Dio _dio;
  final WriteQueue _queue;

  /// The feed. Readable signed out, which is deliberate — a farmer should be
  /// able to see what others are dealing with before committing to an account.
  Future<PostPage> posts({int page = 1, String? crop}) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/community/posts',
        queryParameters: {
          'page': page,
          'limit': 20,
          if (crop != null && crop.isNotEmpty) 'crop': crop,
        },
      );

      final body = response.data;
      if (response.statusCode != 200 || body == null) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
        );
      }

      return PostPage.fromJson(body);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  Future<List<PostComment>> comments(String postId) async {
    try {
      final response = await _dio.get<dynamic>(
        '/api/community/posts/$postId/comments',
      );

      final data = response.data;
      // The route has been seen returning both a bare list and a wrapped
      // object, so both are accepted rather than assuming one.
      final raw = data is List
          ? data
          : (data is Map<String, dynamic> ? data['comments'] : null);

      if (raw is! List) return const [];

      return raw
          .whereType<Map<String, dynamic>>()
          .map(PostComment.fromJson)
          .toList(growable: false);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  /// Toggles "helpful". Requires a session.
  Future<void> toggleHelpful(String postId) async {
    await _post('/api/community/posts/$postId/helpful');
  }

  Future<void> toggleSaved(String postId) async {
    await _post('/api/community/posts/$postId/save');
  }

  /// Posts a reply, or queues it if there is no connection.
  ///
  /// Returns true when it went out now, false when it was queued. The screen
  /// says which, because "sent" and "will send later" are different promises.
  Future<bool> addCommentOrQueue(String postId, String content) async {
    final path = '/api/community/posts/$postId/comments';
    try {
      await addComment(postId, content);
      return true;
    } on ApiException catch (error) {
      // Only a connection problem is worth queueing. A rejected reply would
      // be rejected again, and a signed-out user needs to sign in first.
      if (error.kind == ApiErrorKind.offline ||
          error.kind == ApiErrorKind.timeout) {
        await _queue.add(path: path, body: {'content': content});
        return false;
      }
      rethrow;
    }
  }

  Future<void> addComment(String postId, String content) async {
    await _post(
      '/api/community/posts/$postId/comments',
      body: {'content': content},
    );
  }

  Future<void> createPost({
    required String postType,
    required String crop,
    required String title,
    required String problem,
    String? cropStage,
    String? state,
    String? district,
    String? whatIDid,
  }) async {
    await _post(
      '/api/community/posts',
      body: {
        'postType': postType,
        'crop': crop,
        'title': title,
        'problem': problem,
        if (cropStage != null && cropStage.isNotEmpty) 'cropStage': cropStage,
        'location': {
          if (state != null && state.isNotEmpty) 'state': state,
          if (district != null && district.isNotEmpty) 'district': district,
        },
        if (whatIDid != null && whatIDid.isNotEmpty) 'whatIDid': whatIDid,
      },
    );
  }

  Future<void> _post(String path, {Object? body}) async {
    try {
      final response = await _dio.post<dynamic>(path, data: body);
      final status = response.statusCode ?? 0;

      if (status < 200 || status >= 300) {
        throw ApiException(
          status == 401 || status == 403
              ? ApiErrorKind.unauthorized
              : ApiErrorKind.server,
          statusCode: status,
        );
      }
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }
}

/// First page of the feed.
final communityFeedProvider = FutureProvider<PostPage>((ref) {
  return ref.read(communityRepositoryProvider).posts();
});

final postCommentsProvider = FutureProvider.family<List<PostComment>, String>((
  ref,
  postId,
) {
  return ref.read(communityRepositoryProvider).comments(postId);
});

final communitySearchProvider = NotifierProvider<CommunitySearch, String>(
  CommunitySearch.new,
);

class CommunitySearch extends Notifier<String> {
  @override
  String build() => '';

  void update(String query) => state = query;
}
