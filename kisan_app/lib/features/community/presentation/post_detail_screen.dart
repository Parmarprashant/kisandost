import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/auth_controller.dart';
import '../data/community_models.dart';
import '../data/community_repository.dart';

class PostDetailScreen extends ConsumerStatefulWidget {
  const PostDetailScreen({required this.post, super.key});

  final FarmerPost post;

  static Future<void> open(BuildContext context, FarmerPost post) {
    return Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => PostDetailScreen(post: post)));
  }

  @override
  ConsumerState<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends ConsumerState<PostDetailScreen> {
  final _reply = TextEditingController();
  late FarmerPost _post = widget.post;
  bool _sending = false;

  @override
  void dispose() {
    _reply.dispose();
    super.dispose();
  }

  Future<void> _toggleHelpful() async {
    // Optimistic: the vote shows immediately and rolls back if the call
    // fails. On a slow rural connection a button that does nothing for three
    // seconds gets tapped five more times.
    final previous = _post;
    setState(() {
      _post = _post.copyWith(
        isHelpfulByMe: !_post.isHelpfulByMe,
        helpfulCount: _post.helpfulCount + (_post.isHelpfulByMe ? -1 : 1),
      );
    });

    try {
      await ref.read(communityRepositoryProvider).toggleHelpful(_post.id);
      ref.invalidate(communityFeedProvider);
    } on ApiException {
      if (mounted) setState(() => _post = previous);
    }
  }

  Future<void> _sendReply() async {
    final content = _reply.text.trim();
    if (content.isEmpty) return;

    setState(() => _sending = true);
    try {
      await ref.read(communityRepositoryProvider).addComment(_post.id, content);
      _reply.clear();
      ref.invalidate(postCommentsProvider(_post.id));
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            error.kind == ApiErrorKind.unauthorized
                ? l10n.communitySignInNote
                : l10n.appError,
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;
    final comments = ref.watch(postCommentsProvider(_post.id));
    final signedIn = ref.watch(currentUserProvider) != null;

    return Scaffold(
      appBar: AppBar(title: Text(_post.crop)),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(_post.title, style: text.titleLarge),
                const SizedBox(height: 6),
                Text(
                  [
                    _post.authorName,
                    _post.location,
                  ].where((s) => s.isNotEmpty).join(' · '),
                  style: text.labelSmall,
                ),
                const SizedBox(height: 16),
                Text(_post.problem, style: text.bodyLarge),

                for (final image in _post.images) ...[
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: image,
                      errorWidget: (_, _, _) => const SizedBox.shrink(),
                    ),
                  ),
                ],

                _Section(title: l10n.diagnoseSymptoms, items: _post.symptoms),
                if (_post.whatIDid != null)
                  _Paragraph(
                    title: l10n.diagnoseWhatToDo,
                    body: _post.whatIDid!,
                  ),
                if (_post.precautions != null)
                  _Paragraph(
                    title: l10n.diagnoseFarmingSteps,
                    body: _post.precautions!,
                  ),

                const SizedBox(height: 20),
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: signedIn ? _toggleHelpful : null,
                      icon: Icon(
                        _post.isHelpfulByMe
                            ? Icons.thumb_up
                            : Icons.thumb_up_outlined,
                      ),
                      label: Text(
                        '${l10n.communityHelpful} · ${_post.helpfulCount}',
                      ),
                    ),
                  ],
                ),

                if (!signedIn) ...[
                  const SizedBox(height: 10),
                  Text(l10n.communitySignInNote, style: text.bodySmall),
                ],

                const Divider(height: 36),
                Text(
                  l10n.communityComments('${_post.commentCount}'),
                  style: text.titleMedium,
                ),
                const SizedBox(height: 12),

                comments.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                  error: (_, _) => Text(l10n.appError, style: text.bodySmall),
                  data: (list) => list.isEmpty
                      ? Text(l10n.communityNoComments, style: text.bodySmall)
                      : Column(
                          children: [
                            for (final comment in list)
                              _CommentRow(comment: comment),
                          ],
                        ),
                ),
              ],
            ),
          ),

          if (signedIn)
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _reply,
                        minLines: 1,
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText: l10n.communityAddComment,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _sending ? null : _sendReply,
                      icon: _sending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send),
                      tooltip: l10n.communitySend,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CommentRow extends StatelessWidget {
  const _CommentRow({required this.comment});

  final PostComment comment;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primaryContainer,
            child: Text(
              comment.authorName.isEmpty
                  ? '?'
                  : comment.authorName.trim()[0].toUpperCase(),
              style: text.labelSmall?.copyWith(color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  [
                    comment.authorName,
                    comment.authorLocation,
                  ].where((s) => s != null && s.isNotEmpty).join(' · '),
                  style: text.labelMedium,
                ),
                const SizedBox(height: 2),
                Text(comment.content, style: text.bodyLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 7, right: 10),
                  child: Icon(Icons.circle, size: 7, color: AppColors.primary),
                ),
                Expanded(
                  child: Text(
                    item,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Paragraph extends StatelessWidget {
  const _Paragraph({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Text(body, style: Theme.of(context).textTheme.bodyLarge),
      ],
    );
  }
}
