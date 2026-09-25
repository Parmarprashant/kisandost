import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
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
    final crops = cropFormulas.keys.toList();
    final cropOptions = crops.contains(_crop) ? crops : [_crop, ...crops];

    return Scaffold(
      appBar: AppBar(title: Text(l10n.communityAsk)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: [
          Text(l10n.composeIntro, style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 20),

          DropdownButtonFormField<String>(
            initialValue: _postType,
            isExpanded: true,
            decoration: InputDecoration(labelText: l10n.composeType),
            items: [
              for (final value in postTypeValues)
                DropdownMenuItem(
                  value: value,
                  child: Text(postTypeLabel(l10n, value)),
                ),
            ],
            onChanged: (v) => setState(() => _postType = v ?? _postType),
          ),
          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            initialValue: _crop,
            isExpanded: true,
            decoration: InputDecoration(labelText: l10n.communityCrop),
            items: [
              for (final crop in cropOptions)
                DropdownMenuItem(value: crop, child: Text(crop)),
            ],
            onChanged: (v) => setState(() => _crop = v ?? _crop),
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _title,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              labelText: l10n.communityPostTitle,
              suffixIcon: VoiceInputButton(
                controller: _title,
                // Rebuild so the Post button enables as words arrive.
                onChanged: (_) => setState(() {}),
              ),
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 16),

          TextField(
            controller: _problem,
            minLines: 4,
            maxLines: 8,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              labelText: l10n.communityDetails,
              alignLabelWithHint: true,
            ),
            onChanged: (_) => setState(() {}),
          ),
          // A tall box needs a labelled button, not a small icon lost in the
          // corner — this is the field a farmer has the most to say in.
          VoiceInputBar(controller: _problem),

          const SizedBox(height: 8),
          TextField(
            controller: _whatIDid,
            minLines: 2,
            maxLines: 5,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              labelText: l10n.composeTried,
              helperText: l10n.composeTriedHelp,
              alignLabelWithHint: true,
            ),
          ),
          VoiceInputBar(controller: _whatIDid),

          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(
              _error!,
              style: Theme.of(context).textTheme.bodyLarge
                  ?.copyWith(color: AppColors.danger),
            ),
          ],

          const SizedBox(height: 24),
          FilledButton(
            onPressed: _canPost && !_sending ? _submit : null,
            child: Text(_sending ? l10n.communityPosting : l10n.communityPost),
          ),
          const SizedBox(height: 12),
          Text(
            l10n.composeVisibleNote,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
