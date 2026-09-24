import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/community/data/community_models.dart';

/// Shaped after a real `/api/community/posts` response. The list endpoint
/// wraps posts in a page object and is readable without a session — the two
/// `*ByMe` flags are the only thing a session changes.
const _pageJson = '''
{
  "posts": [
    {
      "_id": "6aa50cd07ae45effa7ff4335",
      "authorId": "6aa50bf57ae45effa7ff4310",
      "authorName": "Manan patel",
      "postType": "Crop Problem",
      "crop": "Cotton",
      "cropStage": "Flowering",
      "location": { "state": "Gujarat", "district": "Rajkot" },
      "title": "Whitefly problem in my cotton crop",
      "problem": "I noticed small white insects under the leaves.",
      "symptoms": ["Leaf curling", "Slower growth"],
      "whatIDid": "Sprayed neem oil in the evening.",
      "images": [],
      "helpfulCount": 4,
      "commentCount": 2,
      "isHelpfulByMe": false,
      "isSavedByMe": false,
      "createdAt": "2026-09-10T08:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
''';

void main() {
  group('PostPage', () {
    late PostPage page;

    setUp(() {
      page = PostPage.fromJson(jsonDecode(_pageJson) as Map<String, dynamic>);
    });

    test('parses the wrapped list', () {
      expect(page.posts, hasLength(1));
      expect(page.page, 1);
      expect(page.totalPages, 1);
      expect(page.hasMore, isFalse);
    });

    test('knows when more pages exist', () {
      final more = PostPage.fromJson({'posts': [], 'page': 1, 'totalPages': 3});
      expect(more.hasMore, isTrue);
    });

    test('survives a response with no posts key', () {
      final empty = PostPage.fromJson(const {});
      expect(empty.posts, isEmpty);
      expect(empty.hasMore, isFalse);
    });
  });

  group('FarmerPost', () {
    late FarmerPost post;

    setUp(() {
      final page = PostPage.fromJson(
        jsonDecode(_pageJson) as Map<String, dynamic>,
      );
      post = page.posts.single;
    });

    test('parses the real payload', () {
      expect(post.authorName, 'Manan patel');
      expect(post.postType, 'Crop Problem');
      expect(post.crop, 'Cotton');
      expect(post.symptoms, hasLength(2));
      expect(post.whatIDid, 'Sprayed neem oil in the evening.');
      expect(post.helpfulCount, 4);
      expect(post.commentCount, 2);
    });

    test('flattens the nested location, district first', () {
      // District is what a farmer recognises; the state is context.
      expect(post.location, 'Rajkot, Gujarat');
    });

    test('handles a post with no location at all', () {
      expect(FarmerPost.fromJson(const {}).location, isEmpty);
    });

    test('reports no images rather than an empty box', () {
      expect(post.hasImages, isFalse);
    });

    test('defaults the vote flags to false for a signed-out reader', () {
      // The API cannot know, so the UI must not imply the reader has voted.
      final anonymous = FarmerPost.fromJson({'title': 'x'});
      expect(anonymous.isHelpfulByMe, isFalse);
      expect(anonymous.isSavedByMe, isFalse);
    });

    test('accepts either _id or id', () {
      // The route has been seen returning both.
      expect(FarmerPost.fromJson({'_id': 'a'}).id, 'a');
      expect(FarmerPost.fromJson({'id': 'b'}).id, 'b');
    });

    test('copyWith moves the vote without touching anything else', () {
      // Backs the optimistic toggle: the count must move exactly one step and
      // every other field must survive the rollback.
      final voted = post.copyWith(
        isHelpfulByMe: true,
        helpfulCount: post.helpfulCount + 1,
      );

      expect(voted.helpfulCount, 5);
      expect(voted.isHelpfulByMe, isTrue);
      expect(voted.title, post.title);
      expect(voted.symptoms, post.symptoms);
      expect(voted.commentCount, post.commentCount);
    });

    test('falls back to a valid date when createdAt is unusable', () {
      final broken = FarmerPost.fromJson({'createdAt': 'not-a-date'});
      expect(broken.createdAt, isA<DateTime>());
    });
  });

  group('PostComment', () {
    test('parses a comment', () {
      final comment = PostComment.fromJson({
        '_id': 'c1',
        'authorName': 'Ramesh',
        'authorLocation': 'Anand',
        'content': 'Try neem oil.',
        'helpfulCount': 2,
        'createdAt': '2026-09-11T10:00:00.000Z',
      });

      expect(comment.authorName, 'Ramesh');
      expect(comment.content, 'Try neem oil.');
      expect(comment.helpfulCount, 2);
    });

    test('treats a blank location as absent', () {
      final comment = PostComment.fromJson({
        'authorName': 'Ramesh',
        'authorLocation': '',
      });
      expect(comment.authorLocation, isNull);
    });
  });

  group('post types', () {
    test('match the enum the API accepts', () {
      // These strings are validated server-side against the FarmerPost schema;
      // a typo here is rejected at post time.
      expect(postTypes, contains('Crop Problem'));
      expect(postTypes, contains('Ask Farmers'));
      expect(postTypes, contains('Farmer Experience'));
      expect(postTypes, contains('Success Story'));
      expect(postTypes, contains('Prevention Tip'));
      expect(postTypes, hasLength(5));
    });
  });
}
