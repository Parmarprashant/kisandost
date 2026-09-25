import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_search_field.dart';
import '../../../app/theme/app_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../data/community_models.dart';
import '../data/community_repository.dart';
import 'compose_post_screen.dart';
import 'farmer_resources_view.dart';
import 'post_detail_screen.dart';

class CommunityScreen extends ConsumerStatefulWidget {
  const CommunityScreen({super.key});

  @override
  ConsumerState<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends ConsumerState<CommunityScreen> {
  int _selectedTab = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final feed = ref.watch(communityFeedProvider);
    final query = ref.watch(communitySearchProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.communityTitle)),
      floatingActionButton: _selectedTab == 0
          ? FloatingActionButton.extended(
              onPressed: () async {
                final posted = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(builder: (_) => const ComposePostScreen()),
                );
                if (posted != true || !context.mounted) return;

                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(l10n.communityPosted)));
              },
              icon: const Icon(Icons.edit_outlined),
              label: Text(l10n.communityAsk),
            )
          : null,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('🌾 Farmer Network')),
                    selected: _selectedTab == 0,
                    onSelected: (val) {
                      if (val) setState(() => _selectedTab = 0);
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Center(child: Text('🏛️ E-Services & Guides')),
                    selected: _selectedTab == 1,
                    onSelected: (val) {
                      if (val) setState(() => _selectedTab = 1);
                    },
                  ),
                ),
              ],
            ),
          ),
          if (_selectedTab == 1)
            const Expanded(child: FarmerResourcesView())
          else ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: VoiceSearchField(
                hintText: l10n.communitySearch,
                onChanged: (v) =>
                    ref.read(communitySearchProvider.notifier).update(v),
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async =>
                    ref.refresh(communityFeedProvider.future),
                child: feed.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error, _) => _Error(error: error),
                  data: (page) {
                    // Filtered in the app rather than on the server: the feed
                    // is one page of posts that is already in hand, and a
                    // round trip per keystroke would cost a farmer data for
                    // work the phone can do instantly.
                    final posts = page.posts
                        .where((p) => p.matches(query))
                        .toList(growable: false);

                    if (posts.isEmpty) {
                      return _Empty(
                        message: query.trim().isEmpty
                            ? l10n.communityEmpty
                            : l10n.communityNoMatch,
                      );
                    }

                    return ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                      itemCount: posts.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 14),
                      itemBuilder: (context, i) => _PostCard(post: posts[i]),
                    );
                  },
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post});

  final FarmerPost post;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(AppTheme.radiusCard),
        onTap: () => PostDetailScreen.open(context, post),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: AppColors.primaryContainer,
                    child: Text(
                      post.authorName.isEmpty
                          ? '?'
                          : post.authorName.trim()[0].toUpperCase(),
                      style: text.labelMedium?.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(post.authorName, style: text.titleSmall),
                        Text(
                          [
                            post.location,
                            _relative(context, post.createdAt),
                          ].where((s) => s.isNotEmpty).join(' · '),
                          style: text.labelSmall,
                        ),
                      ],
                    ),
                  ),
                  _TypeChip(type: post.postType),
                ],
              ),
              const SizedBox(height: 12),
              Text(post.title, style: text.titleMedium),
              const SizedBox(height: 5),
              Text(
                post.problem,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: text.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),

              if (post.hasImages) ...[
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: CachedNetworkImage(
                      imageUrl: post.images.first,
                      fit: BoxFit.cover,
                      errorWidget: (_, _, _) => Container(
                        color: Theme.of(context)
                            .colorScheme
                            .surfaceContainerHighest,
                      ),
                    ),
                  ),
                ),
              ],

              // The counts sit below a rule rather than floating under the
              // body: they belong to the post, not to the sentence above
              // them, and a farmer scanning the feed reads them as a block.
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Divider(
                  height: 1,
                  color: Theme.of(context).colorScheme.outline,
                ),
              ),
              Row(
                children: [
                  Icon(
                    post.isHelpfulByMe
                        ? Icons.thumb_up
                        : Icons.thumb_up_outlined,
                    size: 17,
                    // Marked in brand green once this farmer has voted, so
                    // "I already answered this" is legible at a glance in a
                    // feed they scroll every morning.
                    color: post.isHelpfulByMe
                        ? Theme.of(context).colorScheme.primary
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${post.helpfulCount}',
                    style: text.labelMedium?.copyWith(
                      color: post.isHelpfulByMe
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: 18),
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 17,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    l10n.communityComments('${post.commentCount}'),
                    style: text.labelSmall,
                  ),
                  const Spacer(),
                  if (post.crop.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Theme.of(context)
                            .colorScheme
                            .surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(
                          AppTheme.radiusChip,
                        ),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                      ),
                      child: Text(
                        post.crop,
                        style: text.labelSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  const _TypeChip({required this.type});

  final String type;

  @override
  Widget build(BuildContext context) {
    // A problem and a success story deserve different weight at a glance.
    final color = switch (type) {
      'Crop Problem' => AppColors.danger,
      'Success Story' => AppColors.success,
      'Prevention Tip' => AppColors.sky,
      _ => AppColors.muted,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color.withValues(alpha: 0.12),
      ),
      child: Text(
        type,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 80),
        const Icon(Icons.forum_outlined, size: 56, color: AppColors.muted),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center),
      ],
    );
  }
}

class _Error extends ConsumerWidget {
  const _Error({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final api = ApiException.from(error);

    final message = switch (api.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      _ => l10n.appError,
    };

    return ListView(
      padding: const EdgeInsets.all(32),
      children: [
        const SizedBox(height: 80),
        const Icon(Icons.cloud_off, size: 48, color: AppColors.muted),
        const SizedBox(height: 16),
        Text(message, textAlign: TextAlign.center),
        const SizedBox(height: 20),
        OutlinedButton.icon(
          onPressed: () => ref.invalidate(communityFeedProvider),
          icon: const Icon(Icons.refresh),
          label: Text(l10n.appRetry),
        ),
      ],
    );
  }
}

/// "3 days ago" in the active locale, falling back to a date for older posts.
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
