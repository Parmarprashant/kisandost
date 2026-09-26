import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_input_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/auth_controller.dart';
import '../../farm/data/farm_repository.dart';
import '../../fertilizer/data/fertilizer_calculator.dart';
import '../data/community_repository.dart';

/// The kinds of post the backend accepts.
///
/// These strings are an enum in the Mongoose schema — anything else is
/// rejected — so they are sent verbatim and only the label is translated.
const postTypeValues = <String>[
  'Ask Farmers',
  'Crop Problem',
  'Farmer Experience',
  'Success Story',
  'Prevention Tip',
];

String postTypeLabel(L10n l10n, String value) => switch (value) {
  'Ask Farmers' => l10n.composeTypeAsk,
  'Crop Problem' => l10n.composeTypeProblem,
  'Farmer Experience' => l10n.composeTypeExperience,
  'Success Story' => l10n.composeTypeSuccess,
  'Prevention Tip' => l10n.composeTypeTip,
  _ => value,
};

/// Asking the rest of the community a question.
///
/// The same post lands on the web app — one backend, one feed — so this is
/// how a farmer in a field reaches people reading on a laptop.
class ComposePostScreen extends ConsumerStatefulWidget {
  const ComposePostScreen({super.key});

  @override
  ConsumerState<ComposePostScreen> createState() => _ComposePostScreenState();
}

class _ComposePostScreenState extends ConsumerState<ComposePostScreen> {
  final _title = TextEditingController();
  final _problem = TextEditingController();
  final _whatIDid = TextEditingController();

  String _postType = postTypeValues.first;
  late String _crop = cropFormulas.keys.first;

  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Default to something they actually grow, so the commonest case is one
    // less thing to choose.
    final crops = ref.read(activeCropsProvider);
    if (crops.isNotEmpty) {
      final name = crops.first.crop.cropName;
      if (name.isNotEmpty) _crop = name;
    }
  }

  @override
  void dispose() {
    for (final c in [_title, _problem, _whatIDid]) {
      c.dispose();
    }
    super.dispose();
  }

  bool get _canPost =>
      _title.text.trim().isNotEmpty && _problem.text.trim().isNotEmpty;

  Future<void> _submit() async {
    if (!_canPost || _sending) return;

    setState(() {
      _sending = true;
      _error = null;
    });

    final user = ref.read(currentUserProvider);
    final crops = ref.read(activeCropsProvider);
    final location = crops.isNotEmpty ? crops.first.field.location : null;

    try {
      await ref
          .read(communityRepositoryProvider)
          .createPost(
            postType: _postType,
            crop: _crop,
            title: _title.text.trim(),
            problem: _problem.text.trim(),
            whatIDid: _whatIDid.text.trim(),
            state: location?.state,
            district: location?.district ?? user?.district,
          );

      // The feed is a page fetched once, so it has to be told.
      ref.invalidate(communityFeedProvider);

      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      setState(() {
        _error = switch (error.kind) {
          ApiErrorKind.offline => l10n.appOffline,
          ApiErrorKind.timeout => l10n.appSlow,
          ApiErrorKind.unauthorized => l10n.communitySignInNote,
          _ => l10n.appError,
        };
      });
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final crops = cropFormulas.keys.toList();
    final cropOptions = crops.contains(_crop) ? crops : [_crop, ...crops];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Row(
                children: [
                  _HeaderButton(
                    icon: Icons.arrow_back,
                    tooltip: MaterialLocalizations.of(context)
                        .backButtonTooltip,
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.communityAsk,
                          style: theme.textTheme.titleMedium,
                        ),
                        Text(
                          l10n.composeIntro,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                children: [
                  _Labelled(
                    label: l10n.composeType,
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final value in postTypeValues)
                          _SelectableChip(
                            label: postTypeLabel(l10n, value),
                            selected: _postType == value,
                            onTap: () => setState(() => _postType = value),
                          ),
                      ],
                    ),
                  ),
                  _Labelled(
                    label: l10n.communityCrop,
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (final crop in cropOptions)
                          _SelectableChip(
                            label: crop,
                            selected: _crop == crop,
                            onTap: () => setState(() => _crop = crop),
                          ),
                      ],
                    ),
                  ),
                  _Labelled(
                    label: l10n.communityPostTitle,
                    child: TextField(
                      controller: _title,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        suffixIcon: VoiceInputButton(
                          controller: _title,
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      onChanged: (_) => setState(() {}),
                    ),
                  ),
                  _Labelled(
                    label: l10n.communityDetails,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextField(
                          controller: _problem,
                          minLines: 4,
                          maxLines: 8,
                          textCapitalization: TextCapitalization.sentences,
                          onChanged: (_) => setState(() {}),
                        ),
                        const SizedBox(height: 6),
                        VoiceInputBar(controller: _problem),
                      ],
                    ),
                  ),
                  _Labelled(
                    label: l10n.composeTried,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        TextField(
                          controller: _whatIDid,
                          minLines: 2,
                          maxLines: 5,
                          textCapitalization: TextCapitalization.sentences,
                        ),
                        const SizedBox(height: 6),
                        VoiceInputBar(controller: _whatIDid),
                      ],
                    ),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _error!,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: AppColors.danger,
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                    ),
                    onPressed: _canPost && !_sending ? _submit : null,
                    child: Text(
                      _sending ? l10n.communityPosting : l10n.communityPost,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.composeVisibleNote,
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
    );
  }
}

class _Labelled extends StatelessWidget {
  const _Labelled({required this.label, required this.child});

  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 7),
          child,
        ],
      ),
    );
  }
}

class _SelectableChip extends StatelessWidget {
  const _SelectableChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppTheme.radiusChip),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusChip),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.outline,
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.labelMedium?.copyWith(
            color: selected
                ? theme.colorScheme.onPrimary
                : theme.colorScheme.onSurface,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
      ),
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
