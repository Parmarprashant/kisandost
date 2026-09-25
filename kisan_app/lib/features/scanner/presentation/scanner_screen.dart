import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../app/theme/app_colors.dart';
import '../../../app/theme/app_theme.dart';
import '../../../app/theme/kit.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../membership/data/membership_repository.dart';
import '../data/scanner_models.dart';
import '../data/scanner_repository.dart';

/// Whether this build has a camera the scanner plugin supports.
bool get scannerSupported => !kIsWeb && (Platform.isAndroid || Platform.isIOS);

/// Pesticide packet QR and batch verification screen.
/// Rebuilt in the Warm Earth Editorial language matching QrVerify.dc.html.
class ScannerScreen extends ConsumerStatefulWidget {
  const ScannerScreen({super.key});

  @override
  ConsumerState<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends ConsumerState<ScannerScreen> {
  MobileScannerController? _controller;
  final _manual = TextEditingController();

  bool _busy = false;
  String? _error;
  VerificationResult? _result;
  bool _handled = false;

  @override
  void initState() {
    super.initState();
    if (scannerSupported) _controller = MobileScannerController();
  }

  @override
  void dispose() {
    _controller?.dispose();
    _manual.dispose();
    super.dispose();
  }

  Future<void> _verify(String code) async {
    final trimmed = code.trim();
    if (trimmed.isEmpty || _busy) return;

    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final result = await ref.read(scannerRepositoryProvider).verify(trimmed);
      if (!mounted) return;
      setState(() => _result = result);
      await _controller?.stop();
    } on NotPremiumException {
      if (!mounted) return;
      setState(() => _error = L10n.of(context).scanPremiumNeeded);
    } on ApiException catch (error) {
      if (!mounted) return;
      final l10n = L10n.of(context);
      setState(() {
        _error = switch (error.kind) {
          ApiErrorKind.offline => l10n.appOffline,
          ApiErrorKind.timeout => l10n.appSlow,
          ApiErrorKind.unauthorized => l10n.scanSignIn,
          _ => l10n.appError,
        };
      });
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _scanAgain() {
    setState(() {
      _result = null;
      _error = null;
      _handled = false;
      _manual.clear();
    });
    _controller?.start();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final premium = ref.watch(membershipProvider).value ?? false;
    final result = _result;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation Bar
            Container(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 13),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(
                  bottom: BorderSide(
                    color: isDark
                        ? AppColors.lineDark
                        : const Color(0xFFEFE6D7),
                  ),
                ),
              ),
              child: Row(
                children: [
                  InkWell(
                    onTap: () {
                      if (Navigator.of(context).canPop()) {
                        Navigator.of(context).pop();
                      } else {
                        context.go('/home');
                      }
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: scheme.outline),
                        color: scheme.surface,
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        Icons.chevron_left_rounded,
                        size: 24,
                        color: scheme.onSurface,
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
                          l10n.scanPacketReal,
                          style: TextStyle(
                            fontFamily: AppTheme.displayFamily,
                            fontSize: 21,
                            fontWeight: FontWeight.w600,
                            height: 1.15,
                            color: scheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          l10n.scanSubtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.muted,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Main Content Area
            Expanded(
              child: !premium
                  ? _PremiumWall(l10n: l10n)
                  : result != null
                  ? _ResultView(
                      result: result,
                      onAgain: _scanAgain,
                      isDark: isDark,
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(18, 16, 18, 28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Viewfinder Camera Frame (if supported)
                          if (scannerSupported) ...[
                            ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: AspectRatio(
                                aspectRatio: 1,
                                child: Stack(
                                  children: [
                                    MobileScanner(
                                      controller: _controller,
                                      onDetect: (capture) {
                                        if (_handled) return;
                                        final code = capture.barcodes
                                            .map((b) => b.rawValue)
                                            .firstWhere(
                                              (v) =>
                                                  v != null &&
                                                  v.trim().isNotEmpty,
                                              orElse: () => null,
                                            );
                                        if (code == null) return;
                                        _handled = true;
                                        _verify(code);
                                      },
                                    ),
                                    // Viewfinder Corner Brackets
                                    const Positioned(
                                      top: 14,
                                      left: 14,
                                      child: _CornerBracket(
                                        isTop: true,
                                        isLeft: true,
                                      ),
                                    ),
                                    const Positioned(
                                      top: 14,
                                      right: 14,
                                      child: _CornerBracket(
                                        isTop: true,
                                        isLeft: false,
                                      ),
                                    ),
                                    const Positioned(
                                      bottom: 14,
                                      left: 14,
                                      child: _CornerBracket(
                                        isTop: false,
                                        isLeft: true,
                                      ),
                                    ),
                                    const Positioned(
                                      bottom: 14,
                                      right: 14,
                                      child: _CornerBracket(
                                        isTop: false,
                                        isLeft: false,
                                      ),
                                    ),
                                    // Overlay Instruction Pill
                                    Positioned(
                                      top: 14,
                                      left: 0,
                                      right: 0,
                                      child: Center(
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 14,
                                            vertical: 6,
                                          ),
                                          decoration: BoxDecoration(
                                            color: const Color(0xCC14140F),
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                            border: Border.all(
                                              color: const Color(0xFFFBBF24),
                                            ),
                                          ),
                                          child: Text(
                                            l10n.scanHelp,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: Colors.white,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Manual Entry Card
                          KdCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l10n.scanManual,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: scheme.onSurface,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Container(
                                  height: 48,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                  ),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: scheme.outline),
                                    color: scheme.surface,
                                  ),
                                  child: TextField(
                                    controller: _manual,
                                    textCapitalization:
                                        TextCapitalization.characters,
                                    style: const TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    decoration: InputDecoration(
                                      hintText: l10n.scanCodeLabel,
                                      hintStyle: const TextStyle(
                                        fontSize: 13,
                                        fontFamily: 'sans-serif',
                                        color: AppColors.muted,
                                      ),
                                      border: InputBorder.none,
                                      isDense: true,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                            vertical: 12,
                                          ),
                                    ),
                                    onSubmitted: _verify,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: FilledButton(
                                    onPressed: _busy
                                        ? null
                                        : () => _verify(_manual.text),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: isDark
                                          ? AppColors.forestDark
                                          : AppColors.forest,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    child: _busy
                                        ? const SizedBox(
                                            width: 20,
                                            height: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white,
                                            ),
                                          )
                                        : Text(
                                            l10n.scanCheck,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          if (_error != null) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark
                                    ? AppColors.dangerTintDark
                                    : AppColors.dangerTint,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isDark
                                      ? AppColors.dangerLineDark
                                      : AppColors.dangerLine,
                                ),
                              ),
                              child: Text(
                                _error!,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark
                                      ? AppColors.dangerDark
                                      : AppColors.danger,
                                ),
                              ),
                            ),
                          ],

                          // Educational Section: What other answers look like
                          Padding(
                            padding: const EdgeInsets.only(top: 22, bottom: 10),
                            child: Text(
                              l10n.scanWhatOthersLookLike.toUpperCase(),
                              style: AppTheme.eyebrow(context),
                            ),
                          ),

                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(13),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? AppColors.dangerTintDark
                                        : AppColors.dangerTint,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isDark
                                          ? AppColors.dangerLineDark
                                          : AppColors.dangerLine,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Icon(
                                        Icons.dangerous_outlined,
                                        size: 22,
                                        color: isDark
                                            ? AppColors.dangerDark
                                            : AppColors.danger,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        l10n.scanFake,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: isDark
                                              ? AppColors.dangerDark
                                              : AppColors.danger,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        'Do not use it. Keep the packet and report the shop.',
                                        style: TextStyle(
                                          fontSize: 12,
                                          height: 1.5,
                                          color: isDark
                                              ? AppColors.ink2Dark
                                              : const Color(0xFF4C4640),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(13),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? AppColors.amberTintDark
                                        : AppColors.amberTint,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isDark
                                          ? AppColors.amberLineDark
                                          : AppColors.amberLine,
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Icon(
                                        Icons.help_outline_rounded,
                                        size: 22,
                                        color: isDark
                                            ? AppColors.amberDark
                                            : AppColors.amberText,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        l10n.scanNotOnList,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: isDark
                                              ? AppColors.amberDark
                                              : AppColors.amberText,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        'Unknown, not proven fake. Ask for the invoice.',
                                        style: TextStyle(
                                          fontSize: 12,
                                          height: 1.5,
                                          color: isDark
                                              ? AppColors.ink2Dark
                                              : const Color(0xFF4C4640),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 14),

                          // Footnote
                          Text(
                            l10n.scanFootnote,
                            style: const TextStyle(
                              fontSize: 12,
                              height: 1.55,
                              color: AppColors.muted,
                            ),
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

class _ResultView extends StatelessWidget {
  const _ResultView({
    required this.result,
    required this.onAgain,
    required this.isDark,
  });

  final VerificationResult result;
  final VoidCallback onAgain;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final product = result.product;

    final (
      bg,
      line,
      iconColor,
      iconData,
      title,
      detail,
    ) = switch (result.verdict) {
      VerificationVerdict.genuine => (
        isDark ? AppColors.forestTintDark : AppColors.forestTint,
        isDark ? AppColors.forestLineDark : AppColors.forestLine,
        isDark ? AppColors.forestDark : AppColors.forest,
        Icons.check_rounded,
        l10n.scanGenuine,
        l10n.scanGenuineDetail,
      ),
      VerificationVerdict.counterfeit => (
        isDark ? AppColors.dangerTintDark : AppColors.dangerTint,
        isDark ? AppColors.dangerLineDark : AppColors.dangerLine,
        isDark ? AppColors.dangerDark : AppColors.danger,
        Icons.close_rounded,
        l10n.scanFake,
        l10n.scanFakeDetail,
      ),
      VerificationVerdict.unknown => (
        isDark ? AppColors.amberTintDark : AppColors.amberTint,
        isDark ? AppColors.amberLineDark : AppColors.amberLine,
        isDark ? AppColors.amberDark : AppColors.amberText,
        Icons.question_mark_rounded,
        l10n.scanNotOnList,
        l10n.scanUnknownDetail,
      ),
    };

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 28),
      children: [
        // 1. Verdict Banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: line),
          ),
          child: Column(
            children: [
              Container(
                width: 66,
                height: 66,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: iconColor,
                ),
                alignment: Alignment.center,
                child: Icon(iconData, size: 34, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppTheme.displayFamily,
                  fontSize: 27,
                  fontWeight: FontWeight.w600,
                  height: 1.15,
                  color: isDark ? AppColors.inkDark : AppColors.ink,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                detail,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppColors.ink2Dark : const Color(0xFF4C4640),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 2. Packet Specifications
        KdCard(
          clip: true,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              if (product != null) ...[
                _SpecRow(
                  label: l10n.scanProduct,
                  value: product.productName,
                  isBold: true,
                  showDivider: true,
                  isDark: isDark,
                ),
                _SpecRow(
                  label: l10n.scanBrand,
                  value: product.brandName,
                  showDivider: true,
                  isDark: isDark,
                ),
                _SpecRow(
                  label: l10n.scanManufacturer,
                  value: '${product.manufacturer}, ${product.licenseNumber}',
                  showDivider: true,
                  isDark: isDark,
                ),
                _SpecRow(
                  label: l10n.scanType,
                  value: product.pesticideType,
                  showDivider: true,
                  isDark: isDark,
                ),
              ],
              _SpecRow(
                label: 'Batch',
                value: result.scannedCode,
                isMonospace: true,
                showDivider: product != null && product.hasDosage,
                isDark: isDark,
              ),
              if (product != null && product.hasDosage && result.isSafe) ...[
                _SpecRow(
                  label: l10n.scanDose,
                  value: product.dosagePerAcre,
                  showDivider: product.usageInstructions.isNotEmpty,
                  isDark: isDark,
                ),
                if (product.usageInstructions.isNotEmpty)
                  _SpecRow(
                    label: l10n.scanHowToUse,
                    value: product.usageInstructions,
                    showDivider: false,
                    isDark: isDark,
                  ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 3. Crop advisory hint
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isDark ? AppColors.forestTintDark : AppColors.forestTint,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? AppColors.forestLineDark : AppColors.forestLine,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.eco_outlined, size: 22, color: AppColors.forest),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Crop protection recommendation',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.forestDark : AppColors.forest,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Verify the expiry date on the physical pack before opening the seal.',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? AppColors.ink2Dark
                            : const Color(0xFF4C4640),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 4. Scan Another Button
        SizedBox(
          height: 50,
          child: FilledButton.icon(
            onPressed: onAgain,
            style: FilledButton.styleFrom(
              backgroundColor: isDark ? AppColors.forestDark : AppColors.forest,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
            label: Text(
              l10n.scanAgain,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Footnote
        Text(
          l10n.scanFootnote,
          style: const TextStyle(
            fontSize: 12,
            height: 1.55,
            color: AppColors.muted,
          ),
        ),
      ],
    );
  }
}

class _SpecRow extends StatelessWidget {
  const _SpecRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.isMonospace = false,
    required this.showDivider,
    required this.isDark,
  });

  final String label;
  final String value;
  final bool isBold;
  final bool isMonospace;
  final bool showDivider;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    if (value.trim().isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      decoration: BoxDecoration(
        border: showDivider
            ? Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.sunkDark : AppColors.sunk,
                ),
              )
            : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 96,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: AppColors.muted),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isBold ? FontWeight.w600 : FontWeight.w400,
                fontFamily: isMonospace ? 'monospace' : null,
                color: isDark ? AppColors.inkDark : AppColors.ink,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CornerBracket extends StatelessWidget {
  const _CornerBracket({required this.isTop, required this.isLeft});

  final bool isTop;
  final bool isLeft;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        border: Border(
          top: isTop
              ? const BorderSide(color: Color(0xFFFBBF24), width: 3.5)
              : BorderSide.none,
          bottom: !isTop
              ? const BorderSide(color: Color(0xFFFBBF24), width: 3.5)
              : BorderSide.none,
          left: isLeft
              ? const BorderSide(color: Color(0xFFFBBF24), width: 3.5)
              : BorderSide.none,
          right: !isLeft
              ? const BorderSide(color: Color(0xFFFBBF24), width: 3.5)
              : BorderSide.none,
        ),
      ),
    );
  }
}

class _PremiumWall extends StatelessWidget {
  const _PremiumWall({required this.l10n});

  final L10n l10n;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: KdCard(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.lock_outline_rounded,
                size: 44,
                color: AppColors.muted,
              ),
              const SizedBox(height: 14),
              Text(
                l10n.scanPremiumTitle,
                style: const TextStyle(
                  fontFamily: AppTheme.displayFamily,
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                l10n.scanPremiumNeeded,
                style: const TextStyle(fontSize: 14, height: 1.5),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
