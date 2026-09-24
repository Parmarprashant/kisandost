import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/network/api_exception.dart';
import '../data/diagnosis_models.dart';
import '../data/diagnosis_repository.dart';

/// The four states the diagnose screen can be in.
sealed class DiagnosisState {
  const DiagnosisState();
}

class DiagnosisIdle extends DiagnosisState {
  const DiagnosisIdle();
}

class DiagnosisRunning extends DiagnosisState {
  const DiagnosisRunning({required this.photo, required this.stage});

  final File photo;
  final DiagnosisStage stage;
}

class DiagnosisSuccess extends DiagnosisState {
  const DiagnosisSuccess({required this.photo, required this.diagnosis});

  final File photo;
  final Diagnosis diagnosis;
}

class DiagnosisFailure extends DiagnosisState {
  const DiagnosisFailure({required this.photo, required this.error});

  /// Kept so the farmer never loses the photo they walked into the field to
  /// take — retry reuses it rather than asking for another.
  final File photo;
  final ApiException error;
}

final imagePickerProvider = Provider<ImagePicker>((ref) => ImagePicker());

final diagnosisControllerProvider =
    NotifierProvider<DiagnosisController, DiagnosisState>(
      DiagnosisController.new,
    );

class DiagnosisController extends Notifier<DiagnosisState> {
  @override
  DiagnosisState build() => const DiagnosisIdle();

  /// Opens the camera or gallery, then runs the diagnosis.
  ///
  /// Returns silently when the user backs out of the picker — that is a
  /// choice, not an error, and should not raise anything on screen.
  Future<void> pickAndDiagnose(ImageSource source) async {
    final picked = await ref
        .read(imagePickerProvider)
        .pickImage(
          source: source,
          // Cap at capture time so a 12MP phone camera does not hand us a
          // 6MB file to shrink afterwards.
          maxWidth: 2048,
          maxHeight: 2048,
          imageQuality: 90,
        );

    if (picked == null) return;

    await _run(File(picked.path));
  }

  /// Retries the photo already in hand.
  Future<void> retry() async {
    final current = state;
    if (current is DiagnosisFailure) {
      await _run(current.photo);
    }
  }

  void reset() => state = const DiagnosisIdle();

  Future<void> _run(File photo) async {
    state = DiagnosisRunning(photo: photo, stage: DiagnosisStage.compressing);

    try {
      final diagnosis = await ref
          .read(diagnosisRepositoryProvider)
          .diagnose(
            photo,
            onStage: (stage) {
              // Late callbacks can arrive after a reset or a new run; only
              // advance the run this photo belongs to.
              final current = state;
              if (current is DiagnosisRunning && current.photo == photo) {
                state = DiagnosisRunning(photo: photo, stage: stage);
              }
            },
          );

      state = DiagnosisSuccess(photo: photo, diagnosis: diagnosis);
    } on ApiException catch (error) {
      state = DiagnosisFailure(photo: photo, error: error);
    } catch (error) {
      state = DiagnosisFailure(photo: photo, error: ApiException.from(error));
    }
  }
}
