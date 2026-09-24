import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'diagnosis_models.dart';

/// The route rejects anything over 5 MB. We aim well under that so a slow
/// rural connection is not spending 30 seconds on the upload alone.
const _targetBytes = 1024 * 1024;
const _serverLimitBytes = 5 * 1024 * 1024;

/// Which stage the request is in, so the UI can show honest progress instead
/// of a spinner. AgriVision runs on a free Modal tier and can cold-start for
/// half a minute — a bare spinner for that long reads as "broken".
enum DiagnosisStage { compressing, uploading, analysing, matching }

final diagnosisRepositoryProvider = Provider<DiagnosisRepository>(
  (ref) => DiagnosisRepository(ref.read(dioProvider)),
);

class DiagnosisRepository {
  DiagnosisRepository(this._dio);

  final Dio _dio;

  /// Sends [photo] for diagnosis, reporting progress through [onStage].
  ///
  /// [compressor] is injectable so tests can exercise the upload path without
  /// a platform channel.
  Future<Diagnosis> diagnose(
    File photo, {
    void Function(DiagnosisStage stage)? onStage,
    Future<List<int>> Function(File file)? compressor,
  }) async {
    onStage?.call(DiagnosisStage.compressing);

    final bytes = await (compressor ?? _compress)(photo);

    if (bytes.length > _serverLimitBytes) {
      // Compression could not get it under the server's limit — better to say
      // so than to upload something that will be rejected after the wait.
      throw const ApiException(
        ApiErrorKind.badRequest,
        serverMessage: 'too_large',
      );
    }

    onStage?.call(DiagnosisStage.uploading);

    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(bytes, filename: p.basename(photo.path)),
    });

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/detect-disease',
        data: form,
        onSendProgress: (sent, total) {
          // Once the bytes are gone, the wait is the model thinking.
          if (total > 0 && sent >= total) {
            onStage?.call(DiagnosisStage.analysing);
          }
        },
      );

      onStage?.call(DiagnosisStage.matching);

      final data = response.data;
      if (response.statusCode != 200 || data == null) {
        throw ApiException(
          ApiErrorKind.server,
          statusCode: response.statusCode,
          serverMessage: data?['error'] as String?,
        );
      }

      return Diagnosis.fromJson(data);
    } on DioException catch (error) {
      throw ApiException.from(error);
    }
  }

  /// Shrinks the photo until it is near [_targetBytes], stepping quality down
  /// rather than guessing once. A leaf photo survives heavy JPEG compression
  /// far better than it survives a failed upload.
  Future<List<int>> _compress(File file) async {
    final original = await file.length();
    if (original <= _targetBytes) return file.readAsBytes();

    for (final quality in [85, 70, 55, 40]) {
      final result = await FlutterImageCompress.compressWithFile(
        file.absolute.path,
        quality: quality,
        minWidth: 1280,
        minHeight: 1280,
      );

      if (result == null) break;
      if (result.length <= _targetBytes || quality == 40) return result;
    }

    // Compression unavailable (or ineffective) — send the original and let the
    // size check above decide.
    return file.readAsBytes();
  }
}
