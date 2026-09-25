/// Models for `/api/community/*`.
///
/// The posts list is public — `auth()` is optional there and is used only to
/// fill in `isHelpfulByMe` / `isSavedByMe`. Posting, marking helpful and
/// saving all require a session.
library;

class FarmerPost {
  const FarmerPost({
    required this.id,
    required this.authorName,
    required this.postType,
    required this.crop,
    required this.title,
    required this.problem,
    required this.createdAt,
    required this.helpfulCount,
    required this.commentCount,
    required this.images,
    this.cropStage,
    this.state,
    this.district,
    this.symptoms = const [],
    this.whatIDid,
    this.result,
    this.precautions,
    this.isHelpfulByMe = false,
    this.isSavedByMe = false,
  });

  final String id;
  final String authorName;

  /// One of: Farmer Experience, Crop Problem, Ask Farmers, Success Story,
  /// Prevention Tip.
  final String postType;

  final String crop;
  final String title;
  final String problem;
  final DateTime createdAt;
  final int helpfulCount;
  final int commentCount;
  final List<String> images;
  final String? cropStage;
  final String? state;
  final String? district;

  /// Whether this post matches a search box.
  ///
  /// Crop is included deliberately: a farmer searches for "cotton", not for
  /// the wording someone else used in their title.
  bool matches(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return true;

    return title.toLowerCase().contains(q) ||
        problem.toLowerCase().contains(q) ||
        crop.toLowerCase().contains(q) ||
        authorName.toLowerCase().contains(q) ||
        postType.toLowerCase().contains(q) ||
        (district?.toLowerCase().contains(q) ?? false);
  }

  final List<String> symptoms;
  final String? whatIDid;
  final String? result;
  final String? precautions;

  /// False for a signed-out reader — the API cannot know, so the UI must not
  /// imply the reader has already voted.
  final bool isHelpfulByMe;
  final bool isSavedByMe;

  String get location =>
      [district, state].nonNulls.where((p) => p.isNotEmpty).join(', ');

  bool get hasImages => images.isNotEmpty;

  FarmerPost copyWith({int? helpfulCount, bool? isHelpfulByMe}) => FarmerPost(
    id: id,
    authorName: authorName,
    postType: postType,
    crop: crop,
    title: title,
    problem: problem,
    createdAt: createdAt,
    helpfulCount: helpfulCount ?? this.helpfulCount,
    commentCount: commentCount,
    images: images,
    cropStage: cropStage,
    state: state,
    district: district,
    symptoms: symptoms,
    whatIDid: whatIDid,
    result: result,
    precautions: precautions,
    isHelpfulByMe: isHelpfulByMe ?? this.isHelpfulByMe,
    isSavedByMe: isSavedByMe,
  );

  factory FarmerPost.fromJson(Map<String, dynamic> json) {
    final location = json['location'];
    final map = location is Map<String, dynamic> ? location : const {};

    return FarmerPost(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      authorName: json['authorName'] as String? ?? '',
      postType: json['postType'] as String? ?? 'Farmer Experience',
      crop: json['crop'] as String? ?? '',
      title: json['title'] as String? ?? '',
      problem: json['problem'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      helpfulCount: _toInt(json['helpfulCount']),
      commentCount: _toInt(json['commentCount']),
      images: _strings(json['images']),
      cropStage: _nonEmpty(json['cropStage']),
      state: _nonEmpty(map['state']),
      district: _nonEmpty(map['district']),
      symptoms: _strings(json['symptoms']),
      whatIDid: _nonEmpty(json['whatIDid']),
      result: _nonEmpty(json['result']),
      precautions: _nonEmpty(json['precautions']),
      isHelpfulByMe: json['isHelpfulByMe'] as bool? ?? false,
      isSavedByMe: json['isSavedByMe'] as bool? ?? false,
    );
  }
}

class PostComment {
  const PostComment({
    required this.id,
    required this.authorName,
    required this.content,
    required this.createdAt,
    this.authorLocation,
    this.helpfulCount = 0,
  });

  final String id;
  final String authorName;
  final String content;
  final DateTime createdAt;
  final String? authorLocation;
  final int helpfulCount;

  factory PostComment.fromJson(Map<String, dynamic> json) {
    return PostComment(
      id: json['_id']?.toString() ?? '',
      authorName: json['authorName'] as String? ?? '',
      content: json['content'] as String? ?? '',
      createdAt:
          DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      authorLocation: _nonEmpty(json['authorLocation']),
      helpfulCount: _toInt(json['helpfulCount']),
    );
  }
}

/// A page of posts, as the list endpoint returns it.
class PostPage {
  const PostPage({
    required this.posts,
    required this.page,
    required this.totalPages,
  });

  final List<FarmerPost> posts;
  final int page;
  final int totalPages;

  bool get hasMore => page < totalPages;

  factory PostPage.fromJson(Map<String, dynamic> json) {
    final raw = json['posts'];
    return PostPage(
      posts: raw is List
          ? raw
                .whereType<Map<String, dynamic>>()
                .map(FarmerPost.fromJson)
                .toList(growable: false)
          : const [],
      page: _toInt(json['page']),
      totalPages: _toInt(json['totalPages']),
    );
  }
}

/// The post types the API accepts, in the order the picker shows them.
const postTypes = [
  'Crop Problem',
  'Ask Farmers',
  'Farmer Experience',
  'Success Story',
  'Prevention Tip',
];

String? _nonEmpty(Object? value) {
  if (value is! String) return null;
  final trimmed = value.trim();
  return trimmed.isEmpty ? null : trimmed;
}

List<String> _strings(Object? value) {
  if (value is! List) return const [];
  return value
      .whereType<String>()
      .map((s) => s.trim())
      .where((s) => s.isNotEmpty)
      .toList(growable: false);
}

int _toInt(Object? value) => switch (value) {
  final num n => n.toInt(),
  final String s => int.tryParse(s) ?? 0,
  _ => 0,
};
