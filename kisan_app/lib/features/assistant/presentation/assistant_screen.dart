import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../core/network/api_exception.dart';
import '../../../core/voice/voice_input.dart';
import '../../../core/voice/voice_input_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/auth_controller.dart';
import '../../farm/data/farm_repository.dart';
import '../data/assistant_models.dart';
import '../data/assistant_repository.dart';

/// Ask KisanDost screen in the Warm Earth Editorial language.
class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});

  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final _voice = VoiceInputController();

  List<ChatMessage> get _messages => ref.read(assistantThreadProvider);

  bool _waiting = false;
  bool _voiceAvailable = true;
  String _baseVoiceText = '';

  @override
  void initState() {
    super.initState();
    _voice.addListener(_onVoiceChanged);
    _input.addListener(_onInputChanged);
    _checkVoice();
  }

  Future<void> _checkVoice() async {
    final ok = await _voice.prepare();
    if (mounted) setState(() => _voiceAvailable = ok);
  }

  void _onVoiceChanged() {
    if (mounted) setState(() {});
  }

  void _onInputChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _voice.removeListener(_onVoiceChanged);
    _voice.dispose();
    _input.removeListener(_onInputChanged);
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _toggleVoice() async {
    if (_voice.isListening) {
      await _voice.stop();
      return;
    }

    final existing = _input.text.trimRight();
    _baseVoiceText = existing.isEmpty ? '' : '$existing ';

    await _voice.start(
      locale: Localizations.localeOf(context),
      onText: (words) {
        final text = '$_baseVoiceText$words';
        _input.value = TextEditingValue(
          text: text,
          selection: TextSelection.collapsed(offset: text.length),
        );
      },
    );
  }

  Future<void> _send([String? preset]) async {
    final question = (preset ?? _input.text).trim();
    if (question.isEmpty || _waiting) return;

    final localeCode = Localizations.localeOf(context).languageCode;

    if (_voice.isListening) {
      await _voice.stop();
    }
    if (!mounted) return;

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
            locale: localeCode,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final messages = ref.watch(assistantThreadProvider);
    final crops = ref.watch(activeCropsProvider);

    final suggestions = [l10n.aiExample1, l10n.aiExample2, l10n.aiExample3];

    return Scaffold(
      backgroundColor: isDark ? AppColors.surfaceDark : AppColors.paper,
      body: SafeArea(
        child: Column(
          children: [
            // Top Header: 42x42dp back button, Fraunces serif title, contextual subtitle
            Container(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.lineDark : AppColors.line,
                  ),
                ),
              ),
              child: Row(
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).maybePop(),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.sunkDark : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark ? AppColors.lineDark : AppColors.line,
                        ),
                      ),
                      child: Icon(
                        Icons.arrow_back,
                        size: 20,
                        color: isDark ? AppColors.inkDark : AppColors.ink,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          l10n.aiTitle,
                          style: TextStyle(
                            fontFamily: AppTheme.displayFamily,
                            fontSize: 21,
                            fontWeight: FontWeight.w600,
                            height: 1.15,
                            color: isDark ? AppColors.inkDark : AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          crops.isNotEmpty
                              ? (crops.length == 1
                                    ? '${crops.first.crop.cropName} · ${l10n.aiSubtitle}'
                                    : '${crops.length} fields · ${l10n.aiSubtitle}')
                              : l10n.aiSubtitle,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? AppColors.mutedDark
                                : AppColors.muted,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Chat Body
            Expanded(
              child: ListView(
                controller: _scroll,
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
                children: [
                  if (messages.isEmpty) ...[
                    // Empty state intro
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.sunkDark : AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isDark ? AppColors.lineDark : AppColors.line,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.forestDark.withValues(alpha: 0.25)
                                  : const Color(0xFFEAF2E6),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFFC8DCC4),
                              ),
                            ),
                            child: const Icon(
                              Icons.spa_outlined,
                              size: 20,
                              color: AppColors.forest,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l10n.aiTitle,
                                  style: TextStyle(
                                    fontFamily: AppTheme.displayFamily,
                                    fontSize: 17,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.inkDark
                                        : AppColors.ink,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  l10n.aiIntro,
                                  style: TextStyle(
                                    fontSize: 14,
                                    height: 1.5,
                                    color: isDark
                                        ? AppColors.mutedDark
                                        : const Color(0xFF4C4640),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ] else ...[
                    // Thread messages
                    for (final msg in messages) _MessageBubble(message: msg),
                    if (_waiting) const _ThinkingBubble(),
                    const SizedBox(height: 8),
                  ],

                  // Quick prompt suggestion pills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final s in suggestions)
                        InkWell(
                          onTap: _waiting ? null : () => _send(s),
                          borderRadius: BorderRadius.circular(19),
                          child: Container(
                            height: 38,
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.surfaceDark
                                  : AppColors.surface,
                              borderRadius: BorderRadius.circular(19),
                              border: Border.all(
                                color: isDark
                                    ? AppColors.lineDark
                                    : const Color(0xFFD3C7B2),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              s,
                              style: TextStyle(
                                fontSize: 13,
                                color: isDark
                                    ? AppColors.inkDark
                                    : const Color(0xFF4C4640),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),

                  // Agronomy model caveat card (Matches Assistant.dc.html)
                  Container(
                    margin: const EdgeInsets.only(top: 16),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.sunkDark : AppColors.sunk,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark ? AppColors.lineDark : AppColors.line,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 18,
                          color: isDark
                              ? AppColors.mutedDark
                              : const Color(0xFF4C4640),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            l10n.aiDisclaimer,
                            style: TextStyle(
                              fontSize: 12,
                              height: 1.55,
                              color: isDark
                                  ? AppColors.mutedDark
                                  : const Color(0xFF4C4640),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Input Bar
            Container(
              padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : AppColors.paper,
                border: Border(
                  top: BorderSide(
                    color: isDark
                        ? AppColors.lineDark
                        : const Color(0xFFEFE6D7),
                  ),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.sunkDark : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isDark
                              ? AppColors.lineDark
                              : const Color(0xFFD3C7B2),
                        ),
                      ),
                      child: TextField(
                        controller: _input,
                        minLines: 1,
                        maxLines: 4,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _send(),
                        style: TextStyle(
                          fontSize: 14,
                          color: isDark ? AppColors.inkDark : AppColors.ink,
                        ),
                        decoration: InputDecoration(
                          hintText: l10n.aiTypeOrHoldMic,
                          hintStyle: TextStyle(
                            fontSize: 14,
                            color: isDark
                                ? AppColors.mutedDark
                                : const Color(0xFF6B645F),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                          suffixIcon: VoiceInputButton(
                            controller: _input,
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _waiting
                        ? null
                        : () {
                            if (_input.text.trim().isNotEmpty) {
                              _send();
                            } else if (_voiceAvailable) {
                              _toggleVoice();
                            }
                          },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: _voice.isListening
                            ? AppColors.danger
                            : AppColors.forest,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _voice.isListening
                            ? Icons.stop_circle_outlined
                            : (_input.text.trim().isNotEmpty
                                  ? Icons.arrow_upward
                                  : Icons.mic_none),
                        color: Colors.white,
                        size: 22,
                      ),
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

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isFarmer = message.isFarmer;

    if (isFarmer) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 14),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.sizeOf(context).width * 0.78,
          ),
          padding: const EdgeInsets.fromLTRB(15, 12, 15, 12),
          decoration: const BoxDecoration(
            color: AppColors.forest,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(14),
              topRight: Radius.circular(14),
              bottomLeft: Radius.circular(14),
              bottomRight: Radius.circular(4),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              SelectableText(
                message.text,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.55,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Assistant response
    final isError = message.failed;
    final lower = message.text.toLowerCase();
    final hasPestMention =
        lower.contains('scan') ||
        lower.contains('leaf') ||
        lower.contains('leaves') ||
        lower.contains('spot') ||
        lower.contains('pest') ||
        lower.contains('disease') ||
        lower.contains('પાન') ||
        lower.contains('રોગ') ||
        lower.contains('पत्ता') ||
        lower.contains('रोग');

    final hasFertilizerMention =
        lower.contains('urea') ||
        lower.contains('fertilizer') ||
        lower.contains('dose') ||
        lower.contains('nitrogen') ||
        lower.contains('ખાતર') ||
        lower.contains('યૂરિયા') ||
        lower.contains('उर्वरक') ||
        lower.contains('यूरिया');

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: isError
                  ? const Color(0xFFFAE7E4)
                  : const Color(0xFFEAF2E6),
              shape: BoxShape.circle,
              border: Border.all(
                color: isError
                    ? const Color(0xFFE8BFBA)
                    : const Color(0xFFC8DCC4),
              ),
            ),
            child: Icon(
              isError ? Icons.warning_amber_rounded : Icons.spa_outlined,
              size: 18,
              color: isError ? AppColors.danger : AppColors.forest,
            ),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Container(
              padding: const EdgeInsets.fromLTRB(15, 13, 15, 13),
              decoration: BoxDecoration(
                color: isError
                    ? (isDark
                          ? AppColors.dangerDark.withValues(alpha: 0.15)
                          : const Color(0xFFFAE7E4))
                    : (isDark ? AppColors.surfaceDark : AppColors.surface),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(14),
                  topRight: Radius.circular(14),
                  bottomRight: Radius.circular(14),
                  bottomLeft: Radius.circular(4),
                ),
                border: Border.all(
                  color: isError
                      ? const Color(0xFFE8BFBA)
                      : (isDark ? AppColors.lineDark : AppColors.line),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SelectableText(
                    message.text,
                    style: TextStyle(
                      fontSize: 15,
                      height: 1.6,
                      color: isError
                          ? (isDark ? Colors.white : AppColors.dangerDark)
                          : (isDark ? AppColors.inkDark : AppColors.ink),
                    ),
                  ),

                  // Shortcut action buttons matching Assistant.dc.html
                  if (!isError && (hasPestMention || hasFertilizerMention)) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.only(top: 12),
                      decoration: BoxDecoration(
                        border: Border(
                          top: BorderSide(
                            color: isDark
                                ? AppColors.lineDark
                                : const Color(0xFFF1E9DC),
                          ),
                        ),
                      ),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (hasPestMention)
                            InkWell(
                              onTap: () => context.push('/diagnose'),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                height: 40,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 13,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFEAF2E6),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: const Color(0xFFC8DCC4),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.camera_alt_outlined,
                                      size: 16,
                                      color: AppColors.forest,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      l10n.aiScanLeaf,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.forest,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (hasFertilizerMention)
                            InkWell(
                              onTap: () => context.push('/fertilizer'),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                height: 40,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 13,
                                ),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppColors.surfaceDark
                                      : AppColors.surface,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: isDark
                                        ? AppColors.lineDark
                                        : const Color(0xFFD3C7B2),
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  l10n.aiUreaDose,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.inkDark
                                        : const Color(0xFF4C4640),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ThinkingBubble extends StatelessWidget {
  const _ThinkingBubble();

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF2E6),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFC8DCC4)),
            ),
            child: const Icon(
              Icons.spa_outlined,
              size: 18,
              color: AppColors.forest,
            ),
          ),
          const SizedBox(width: 9),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
                bottomRight: Radius.circular(14),
                bottomLeft: Radius.circular(4),
              ),
              border: Border.all(
                color: isDark ? AppColors.lineDark : AppColors.line,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.forest,
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  l10n.aiThinking,
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? AppColors.mutedDark : AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
