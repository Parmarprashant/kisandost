import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_input_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/auth_controller.dart';
import '../../farm/data/farm_repository.dart';
import '../data/assistant_models.dart';
import '../data/assistant_repository.dart';

/// Ask a farming question in your own words.
class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});

  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  // Lives in a provider, so leaving this screen does not wipe the
  // conversation the farmer just paid for.
  List<ChatMessage> get _messages => ref.read(assistantThreadProvider);

  bool _waiting = false;

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send([String? preset]) async {
    final question = (preset ?? _input.text).trim();
    if (question.isEmpty || _waiting) return;

    final user = ref.read(currentUserProvider);
    final crops = ref.read(activeCropsProvider);

    ref
        .read(assistantThreadProvider.notifier)
        .add(ChatMessage(sender: Sender.farmer, text: question));
    setState(() {
      _input.clear();
      _waiting = true;
    });
    _toBottom();

    try {
      final answer = await ref
          .read(assistantRepositoryProvider)
          .ask(
            question: question,
            locale: Localizations.localeOf(context).languageCode,
            // Everything before this turn. The question just added is sent
            // separately and must not appear twice.
            history: _messages.sublist(0, _messages.length - 1),
            district: crops.isNotEmpty
                ? crops.first.field.location.district
                : user?.district,
            crops: crops
                .map((c) => c.crop.cropName)
                .where((n) => n.isNotEmpty)
                .toSet()
                .toList(),
          );

      if (!mounted) return;
      ref
          .read(assistantThreadProvider.notifier)
          .add(ChatMessage(sender: Sender.assistant, text: answer));
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      final text = switch (error.kind) {
        ApiErrorKind.offline => l10n.appOffline,
        ApiErrorKind.timeout => l10n.aiBusy,
        ApiErrorKind.unauthorized => l10n.aiSignIn,
        _ => l10n.appError,
      };
      ref
          .read(assistantThreadProvider.notifier)
          .add(ChatMessage(sender: Sender.assistant, text: text, failed: true));
    } finally {
      if (mounted) setState(() => _waiting = false);
      _toBottom();
    }
  }

  void _toBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scroll.hasClients) return;
      _scroll.animateTo(
        _scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final messages = ref.watch(assistantThreadProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.aiTitle)),
      body: Column(
        children: [
          Expanded(
            child: messages.isEmpty
                ? _Empty(onPick: _send)
                : ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    itemCount: messages.length + (_waiting ? 1 : 0),
                    itemBuilder: (context, i) {
                      if (i == messages.length) return const _Thinking();
                      return _Bubble(message: messages[i]);
                    },
                  ),
          ),

          // Said once, above the input, not attached to every answer: a
          // caveat repeated on every message stops being read.
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              l10n.aiDisclaimer,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          const SizedBox(height: 8),

          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _input,
                    minLines: 1,
                    maxLines: 4,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _send(),
                    decoration: InputDecoration(
                      hintText: l10n.aiAsk,
                      // The whole point for someone who reads little.
                      suffixIcon: VoiceInputButton(controller: _input),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _waiting ? null : () => _send(),
                  icon: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Starter questions, so a blank screen is not the first thing a farmer meets.
class _Empty extends StatelessWidget {
  const _Empty({required this.onPick});

  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    final suggestions = [l10n.aiExample1, l10n.aiExample2, l10n.aiExample3];

    return ListView(
      padding: const EdgeInsets.fromLTRB(24, 48, 24, 24),
      children: [
        const Icon(
          Icons.support_agent_outlined,
          size: 56,
          color: AppColors.primary,
        ),
        const SizedBox(height: 16),
        Text(
          l10n.aiIntro,
          style: text.titleMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        for (final s in suggestions)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: OutlinedButton(
              onPressed: () => onPick(s),
              child: Text(s, textAlign: TextAlign.center),
            ),
          ),
      ],
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final farmer = message.isFarmer;
    final colour = message.failed
        ? AppColors.danger.withValues(alpha: 0.10)
        : farmer
        ? AppColors.primary.withValues(alpha: 0.12)
        : AppColors.primaryContainer.withValues(alpha: 0.45);

    return Align(
      alignment: farmer ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.82,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          color: colour,
        ),
        child: SelectableText(
          message.text,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}

class _Thinking extends StatelessWidget {
  const _Thinking();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12, left: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            const SizedBox(width: 10),
            Text(
              L10n.of(context).aiThinking,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
