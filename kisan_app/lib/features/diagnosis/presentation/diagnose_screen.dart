import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/theme/app_colors.dart';
import '../../../core/network/api_exception.dart';
import '../../../l10n/app_localizations.dart';
import '../data/diagnosis_models.dart';
import 'model_details_panel.dart';
import '../data/diagnosis_repository.dart';
import 'diagnosis_controller.dart';

class DiagnoseScreen extends ConsumerWidget {
  const DiagnoseScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final state = ref.watch(diagnosisControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.navDiagnose),
        actions: [
          if (state is! DiagnosisIdle)
            IconButton(
              icon: const Icon(Icons.close),
              tooltip: l10n.diagnoseRetake,
              onPressed: () =>
                  ref.read(diagnosisControllerProvider.notifier).reset(),
            ),
        ],
      ),
      body: switch (state) {
        DiagnosisIdle() => const _CaptureView(),
        DiagnosisRunning(:final photo, :final stage) => _RunningView(
          photo: photo,
          stage: stage,
        ),
        DiagnosisSuccess(:final photo, :final diagnosis) => _ResultView(
          photo: photo,
          diagnosis: diagnosis,
        ),
        DiagnosisFailure(:final error) => _FailureView(error: error),
      },
    );
  }
}

// ---------------------------------------------------------------- capture

class _CaptureView extends ConsumerWidget {
  const _CaptureView();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final controller = ref.read(diagnosisControllerProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 140,
            height: 140,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryContainer,
            ),
            child: const Icon(
              Icons.eco_outlined,
              size: 68,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 28),
          Text(
            l10n.diagnoseGuide,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 40),

          // Camera first and visually dominant — it is the path we want, and
          // the gallery is the fallback for a photo taken earlier.
          FilledButton.icon(
            onPressed: () => controller.pickAndDiagnose(ImageSource.camera),
            icon: const Icon(Icons.camera_alt),
            label: Text(l10n.diagnoseTakePhoto),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => controller.pickAndDiagnose(ImageSource.gallery),
            icon: const Icon(Icons.photo_library_outlined),
            label: Text(l10n.diagnoseGallery),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------- running

class _RunningView extends StatelessWidget {
  const _RunningView({required this.photo, required this.stage});

  final File photo;
  final DiagnosisStage stage;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    final steps = <(DiagnosisStage, String)>[
      (DiagnosisStage.compressing, l10n.diagnoseCompressing),
      (DiagnosisStage.uploading, l10n.diagnoseUploading),
      (DiagnosisStage.analysing, l10n.diagnoseAnalysing),
      (DiagnosisStage.matching, l10n.diagnoseMatching),
    ];
    final currentIndex = steps.indexWhere((s) => s.$1 == stage);

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: Image.file(photo, fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 28),

        // A real checklist rather than a bar that fakes progress: each line
        // ticks only when that stage actually happened.
        for (var i = 0; i < steps.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                SizedBox(
                  width: 28,
                  height: 28,
                  child: i < currentIndex
                      ? const Icon(
                          Icons.check_circle,
                          color: AppColors.success,
                          size: 24,
                        )
                      : i == currentIndex
                      ? const CircularProgressIndicator(strokeWidth: 2.5)
                      : Icon(
                          Icons.circle_outlined,
                          size: 22,
                          color: Theme.of(context).colorScheme.outline,
                        ),
                ),
                const SizedBox(width: 14),
                Text(
                  steps[i].$2,
                  style: i <= currentIndex
                      ? Theme.of(context).textTheme.bodyLarge
                      : Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),

        if (stage == DiagnosisStage.analysing) ...[
          const SizedBox(height: 16),
          // AgriVision runs on a free tier; the first call of the day pays a
          // cold start. Saying so beats looking hung.
          Text(
            l10n.diagnoseSlowNote,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ],
    );
  }
}

// ---------------------------------------------------------------- failure

class _FailureView extends ConsumerWidget {
  const _FailureView({required this.error});

  final ApiException error;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);

    final message = switch (error.kind) {
      ApiErrorKind.offline => l10n.appOffline,
      ApiErrorKind.timeout => l10n.appSlow,
      ApiErrorKind.badRequest when error.serverMessage == 'too_large' =>
        l10n.diagnoseTooLarge,
      _ => l10n.appError,
    };

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off, size: 56, color: AppColors.muted),
          const SizedBox(height: 20),
          Text(
            message,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            l10n.diagnoseKeepPhoto,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 28),
          FilledButton.icon(
            onPressed: () =>
                ref.read(diagnosisControllerProvider.notifier).retry(),
            icon: const Icon(Icons.refresh),
            label: Text(l10n.appRetry),
          ),
          const SizedBox(height: 12),
          OutlinedButton(
            onPressed: () =>
                ref.read(diagnosisControllerProvider.notifier).reset(),
            child: Text(l10n.diagnoseRetake),
          ),
        ],
      ),
    );
  }
}

// ----------------------------------------------------------------- result

class _ResultView extends ConsumerWidget {
  const _ResultView({required this.photo, required this.diagnosis});

  final File photo;
  final Diagnosis diagnosis;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    // The engine could not read the photo. Showing this as a diagnosis would
    // name a disease that does not exist, so it gets its own screen whose
    // answer is "take a better photo".
    if (diagnosis.isInconclusive) {
      return _InconclusiveView(photo: photo, diagnosis: diagnosis);
    }

    final healthy = diagnosis.isHealthy;
    final accent = healthy ? AppColors.success : AppColors.danger;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        _PhotoWithFocus(photo: photo, region: diagnosis.focusRegion),
        const SizedBox(height: 20),

        if (diagnosis.diagnostics != null)
          ModelDetailsPanel(diagnostics: diagnosis.diagnostics!),

        if (diagnosis.cropName.isNotEmpty)
          Text(diagnosis.cropName, style: text.bodySmall),

        // Verdict first and largest. Everything below is supporting detail.
        const SizedBox(height: 4),
        Text(
          diagnosis.diseaseName,
          style: text.headlineMedium?.copyWith(color: accent),
        ),
        const SizedBox(height: 10),

        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _Chip(
              icon: healthy ? Icons.check_circle : Icons.warning_amber_rounded,
              label: healthy ? l10n.diagnoseHealthy : l10n.diagnoseInfected,
              color: accent,
            ),
            if (diagnosis.confidence > 0)
              _Chip(
                icon: Icons.insights,
                label: l10n.diagnoseConfidence('${diagnosis.confidence}'),
                color: AppColors.muted,
              ),
          ],
        ),

        if (diagnosis.requiresExpertVerification) ...[
          const SizedBox(height: 16),
          // The engine itself flagged this as uncertain. Spraying on a wrong
          // call costs money and can harm the crop, so this is stated up
          // front rather than buried under the treatment list.
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppColors.secondary.withValues(alpha: 0.12),
              border: Border.all(
                color: AppColors.secondary.withValues(alpha: 0.4),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info_outline, color: AppColors.secondary),
                const SizedBox(width: 12),
                Expanded(child: Text(l10n.diagnoseExpertNote)),
              ],
            ),
          ),
        ],

        if (diagnosis.description.isNotEmpty) ...[
          const SizedBox(height: 16),
          Text(diagnosis.description, style: text.bodyLarge),
        ],

        _Section(title: l10n.diagnoseWhatToDo, items: diagnosis.precautions),
        _Section(title: l10n.diagnoseSymptoms, items: diagnosis.symptoms),
        _Section(title: l10n.diagnoseCauses, items: diagnosis.causes),

        if (diagnosis.hasProducts) ...[
          const SizedBox(height: 24),
          Text(l10n.diagnoseBuy, style: text.titleMedium),
          const SizedBox(height: 12),
          for (final product in [
            ...diagnosis.pesticides,
            ...diagnosis.fertilizers,
          ])
            _ProductTile(product: product),
        ],

        const SizedBox(height: 28),
        OutlinedButton.icon(
          onPressed: () =>
              ref.read(diagnosisControllerProvider.notifier).reset(),
          icon: const Icon(Icons.camera_alt_outlined),
          label: Text(l10n.diagnoseRetake),
        ),
      ],
    );
  }
}

/// Shown when the engine could not read the photo.
///
/// The engine's own `precautions` in this case are photography instructions
/// ("take a close-up in good daylight"), so they are reused as the guidance
/// list — and the primary action is the camera, not a treatment.
class _InconclusiveView extends ConsumerWidget {
  const _InconclusiveView({required this.photo, required this.diagnosis});

  final File photo;
  final Diagnosis diagnosis;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = L10n.of(context);
    final text = Theme.of(context).textTheme;

    final guidance = diagnosis.precautions.isNotEmpty
        ? diagnosis.precautions
        : diagnosis.symptoms;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: Image.file(photo, fit: BoxFit.cover),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            const Icon(Icons.filter_center_focus, color: AppColors.secondary),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                l10n.diagnoseUnclear,
                style: text.titleMedium?.copyWith(color: AppColors.secondary),
              ),
            ),
          ],
        ),
        _Section(title: l10n.diagnoseHowToFix, items: guidance),

        if (diagnosis.diagnostics != null)
          ModelDetailsPanel(diagnostics: diagnosis.diagnostics!),

        const SizedBox(height: 28),
        FilledButton.icon(
          onPressed: () =>
              ref.read(diagnosisControllerProvider.notifier).reset(),
          icon: const Icon(Icons.camera_alt),
          label: Text(l10n.diagnoseTakePhoto),
        ),
      ],
    );
  }
}

/// The photo, with the engine's focus box drawn over it when there is one.
class _PhotoWithFocus extends StatelessWidget {
  const _PhotoWithFocus({required this.photo, this.region});

  final File photo;
  final FocusRegion? region;

  @override
  Widget build(BuildContext context) {
    final box = region;

    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.file(photo, fit: BoxFit.cover),
            if (box != null && box.isDrawable)
              LayoutBuilder(
                builder: (context, constraints) => Stack(
                  children: [
                    Positioned(
                      top: box.top * constraints.maxHeight,
                      left: box.left * constraints.maxWidth,
                      height: box.height * constraints.maxHeight,
                      width: box.width * constraints.maxWidth,
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.secondary,
                            width: 3,
                          ),
                          borderRadius: BorderRadius.circular(6),
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
        const SizedBox(height: 24),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        for (final item in items)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
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

class _ProductTile extends StatelessWidget {
  const _ProductTile({required this.product});

  final RecommendedProduct product;

  @override
  Widget build(BuildContext context) {
    final subtitleParts = [
      if (product.brand != null && product.brand!.isNotEmpty) product.brand!,
      if (product.price != null) '₹${product.price}',
    ];

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: const Icon(Icons.science_outlined, color: AppColors.primary),
        title: Text(product.name, style: Theme.of(context).textTheme.bodyLarge),
        subtitle: subtitleParts.isEmpty
            ? null
            : Text(subtitleParts.join(' · ')),
        // Only matched products exist in the catalogue; an unmatched generic
        // name has nothing to open, so it gets no affordance.
        trailing: product.isPurchasable
            ? const Icon(Icons.chevron_right)
            : null,
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.icon, required this.label, required this.color});

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        color: color.withValues(alpha: 0.12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium
                ?.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}
