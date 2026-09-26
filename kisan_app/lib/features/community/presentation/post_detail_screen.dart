import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_input_button.dart';
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
      final sentNow = await ref
          .read(communityRepositoryProvider)
          .addCommentOrQueue(_post.id, content);
      _reply.clear();
      ref.invalidate(postCommentsProvider(_post.id));

      if (!mounted) return;
      if (!sentNow) {
        // "Sent" and "will send when you have signal" are different
        // promises, and a farmer who is told the wrong one stops trusting
        // the app the first time a reply never appears.
        final l10n = L10n.of(context);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(l10n.offlineQueued)));
      }
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
    final theme = Theme.of(context);
    final text = theme.textTheme;
    final comments = ref.watch(postCommentsProvider(_post.id));
    final signedIn = ref.watch(currentUserProvider) != null;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
              child: Row(
                children: [
                  _HeaderButton(
                    icon: Icons.arrow_back,
                    tooltip:
                        MaterialLocalizations.of(context).backButtonTooltip,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.communityComments('${_post.commentCount}'),
                          style: theme.textTheme.titleMedium,
                        ),
                        if (_post.crop.isNotEmpty)
                          Text(
                            _post.crop,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                children: [
                  KdCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundColor:
                                  theme.colorScheme.primaryContainer,
                              child: Text(
                                _post.authorName.isEmpty
                                    ? '?'
                                    : _post.authorName.trim()[0].toUpperCase(),
                                style: text.labelMedium?.copyWith(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _post.authorName,
                                    style: text.titleSmall,
                                  ),
                                  Text(
                                    [
                                      _post.location,
                                      _relative(context, _post.createdAt),
                                    ].where((s) => s.isNotEmpty).join(' · '),
                                    style: text.labelSmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (_post.crop.isNotEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      theme
                                          .colorScheme
                                          .surfaceContainerHighest,
                                  borderRadius: BorderRadius.circular(
                                    AppTheme.radiusChip,
                                  ),
                                  border: Border.all(
                                    color: theme.colorScheme.outline,
                                  ),
                                ),
                                child: Text(
                                  _post.crop,
                                  style: text.labelSmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          _post.title,
                          style: TextStyle(
                            fontFamily: AppTheme.displayFamily,
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            height: 1.35,
                            color: text.titleLarge?.color,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _post.problem,
                          style: text.bodyLarge?.copyWith(height: 1.55),
                        ),
                        for (final image in _post.images) ...[
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: CachedNetworkImage(
                              imageUrl: image,
                              errorWidget: (_, _, _) => const SizedBox.shrink(),
                            ),
                          ),
                        ],
                        _Section(
                          title: l10n.diagnoseSymptoms,
                          items: _post.symptoms,
                        ),
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
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: signedIn ? _toggleHelpful : null,
                          icon: Icon(
                            _post.isHelpfulByMe
                                ? Icons.thumb_up
                                : Icons.thumb_up_outlined,
                            size: 18,
                          ),
                          label: Text(
                            '${l10n.communityHelpful} · ${_post.helpfulCount}',
                          ),
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 46),
                            backgroundColor:
                                _post.isHelpfulByMe
                                    ? theme.colorScheme.primaryContainer
                                        .withAlpha(80)
                                    : null,
                            side: BorderSide(
                              color:
                                  _post.isHelpfulByMe
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.outline,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (!signedIn) ...[
                    const SizedBox(height: 8),
                    Text(
                      l10n.communitySignInNote,
                      style: text.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                  SectionHeader(
                    l10n.communityComments('${_post.commentCount}'),
                  ),
                  comments.when(
                    loading:
                        () => const Center(
                          child: Padding(
                            padding: EdgeInsets.all(20),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                    error:
                        (_, _) => Text(
                          l10n.appError,
                          style: text.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                    data:
                        (list) =>
                            list.isEmpty
                                ? Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  child: Text(
                                    l10n.communityNoComments,
                                    style: text.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                )
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
              Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  border: Border(
                    top: BorderSide(color: theme.colorScheme.outline),
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _reply,
                          minLines: 1,
                          maxLines: 4,
                          decoration: InputDecoration(
                            hintText: l10n.communityAddComment,
                            suffixIcon: VoiceInputButton(controller: _reply),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _sending ? null : _sendReply,
                        icon:
                            _sending
                                ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
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
      ),
    );
  }
}

class _CommentRow extends StatelessWidget {
  const _CommentRow({required this.comment});

  final PostComment comment;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final text = theme.textTheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: KdCard(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 15,
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Text(
                    comment.authorName.isEmpty
                        ? '?'
                        : comment.authorName.trim()[0].toUpperCase(),
                    style: text.labelSmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(comment.authorName, style: text.titleSmall),
                      if (comment.authorLocation != null &&
                          comment.authorLocation!.isNotEmpty)
                        Text(
                          comment.authorLocation!,
                          style: text.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              comment.content,
              style: text.bodyMedium?.copyWith(height: 1.55),
            ),
          ],
        ),
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

class _HeaderButton extends StatelessWidget {
  const _HeaderButton({required this.icon, required this.onTap, this.tooltip});

  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.radiusButton),
        onTap: onTap,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            border: Border.all(color: theme.colorScheme.outline),
          ),
          child: Icon(icon, size: 22, color: theme.colorScheme.onSurface),
        ),
      ),
    );
  }
}

String _relative(BuildContext context, DateTime when) {
  final locale = Localizations.localeOf(context).toString();
  final difference = DateTime.now().difference(when);

  if (difference.inDays >= 7) {
    return DateFormat.yMMMd(locale).format(when);
  }
  if (difference.inDays >= 1) return '${difference.inDays}d';
  if (difference.inHours >= 1) return '${difference.inHours}h';
  if (difference.inMinutes >= 1) return '${difference.inMinutes}m';
  return '';
}

