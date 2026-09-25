import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../../membership/data/membership_repository.dart';
import '../data/scanner_models.dart';
import '../data/scanner_repository.dart';

/// Whether this build has a camera the scanner plugin supports.
///
/// mobile_scanner has no Windows implementation, and Windows is what the app
/// is developed against, so the desktop build offers manual entry instead of
/// crashing on a missing plugin.
bool get scannerSupported => !kIsWeb && (Platform.isAndroid || Platform.isIOS);

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

  /// Stops the camera firing the same code a dozen times a second.
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
    if (_busy) return;
    setState(() {
      _busy = true;
      _error = null;
    });

    try {
      final result = await ref.read(scannerRepositoryProvider).verify(code);
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
    });
    _controller?.start();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final premium = ref.watch(membershipProvider).value ?? false;
    final result = _result;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.scanTitle)),
      body: !premium
          ? _PremiumWall(l10n: l10n)
          : result != null
          ? _Result(result: result, onAgain: _scanAgain)
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: [
                Text(
                  l10n.scanHelp,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 16),

                if (scannerSupported)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: AspectRatio(
                      aspectRatio: 1,
                      child: MobileScanner(
                        controller: _controller,
                        onDetect: (capture) {
                          if (_handled) return;
                          final code = capture.barcodes
                              .map((b) => b.rawValue)
                              .firstWhere(
                                (v) => v != null && v.trim().isNotEmpty,
                                orElse: () => null,
                              );
                          if (code == null) return;
                          _handled = true;
                          _verify(code);
                        },
                      ),
                    ),
                  ),

                const SizedBox(height: 20),
                // Codes rub off packs, and a torn label should not end the
                // check. Typing the number does the same lookup.
                Text(
                  l10n.scanManual,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _manual,
                  textCapitalization: TextCapitalization.characters,
                  decoration: InputDecoration(labelText: l10n.scanCodeLabel),
                  onSubmitted: _verify,
                ),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: _busy ? null : () => _verify(_manual.text),
                  child: Text(_busy ? l10n.scanChecking : l10n.scanCheck),
                ),

                if (_error != null) ...[
                  const SizedBox(height: 20),
                  Text(
                    _error!,
                    style: Theme.of(context).textTheme.bodyLarge
                        ?.copyWith(color: AppColors.danger),
                  ),
                ],
              ],
            ),
    );
  }
}

/// Shown when the account is not premium.
///
/// Deliberately not a sales page: there is no payment flow in the app, so
/// offering to upgrade would lead nowhere.
class _PremiumWall extends StatelessWidget {
  const _PremiumWall({required this.l10n});

  final L10n l10n;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock_outline, size: 48, color: AppColors.muted),
            const SizedBox(height: 16),
            Text(
              l10n.scanPremiumTitle,
              style: text.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.scanPremiumNeeded,
              style: text.bodyLarge,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _Result extends StatelessWidget {
  const _Result({required this.result, required this.onAgain});

  final VerificationResult result;
  final VoidCallback onAgain;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    final (colour, icon, heading, detail) = switch (result.verdict) {
      VerificationVerdict.genuine => (
        AppColors.success,
        Icons.verified_outlined,
        l10n.scanGenuine,
        l10n.scanGenuineDetail,
      ),
      VerificationVerdict.counterfeit => (
        AppColors.danger,
        Icons.dangerous_outlined,
        l10n.scanFake,
        l10n.scanFakeDetail,
      ),
      // Not condemned — the registry simply has no record. Said as an
      // unknown, because calling it fake could cost a farmer good stock.
      VerificationVerdict.unknown => (
        AppColors.secondary,
        Icons.help_outline,
        l10n.scanUnknown,
        l10n.scanUnknownDetail,
      ),
    };

    final product = result.product;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: colour.withValues(alpha: 0.12),
            border: Border.all(color: colour.withValues(alpha: 0.35)),
          ),
          child: Column(
            children: [
              Icon(icon, size: 48, color: colour),
              const SizedBox(height: 12),
              Text(
                heading,
                style: text.headlineSmall?.copyWith(color: colour),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(detail, style: text.bodyLarge, textAlign: TextAlign.center),
            ],
          ),
        ),

        const SizedBox(height: 16),
        Text(l10n.scanCodeWas(result.scannedCode), style: text.bodySmall),

        if (product != null) ...[
          const SizedBox(height: 24),
          _Row(label: l10n.scanProduct, value: product.productName),
          _Row(label: l10n.scanBrand, value: product.brandName),
          _Row(label: l10n.scanManufacturer, value: product.manufacturer),
          _Row(label: l10n.scanLicence, value: product.licenseNumber),
          _Row(label: l10n.scanType, value: product.pesticideType),

          // Dosage is withheld for a flagged counterfeit on purpose: telling
          // someone how to apply a product you have just called fake would
          // undercut the warning.
          if (result.isSafe && product.hasDosage) ...[
            _Row(label: l10n.scanDose, value: product.dosagePerAcre),
            if (product.usageInstructions.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(l10n.scanHowToUse, style: text.titleMedium),
              const SizedBox(height: 6),
              Text(product.usageInstructions, style: text.bodyLarge),
            ],
          ],
        ],

        const SizedBox(height: 28),
        FilledButton(onPressed: onAgain, child: Text(l10n.scanAgain)),
      ],
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    if (value.trim().isEmpty) return const SizedBox.shrink();
    final text = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(label, style: text.labelMedium)),
          Expanded(child: Text(value, style: text.bodyLarge)),
        ],
      ),
    );
  }
}
