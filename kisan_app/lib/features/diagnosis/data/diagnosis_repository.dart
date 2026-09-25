import 'dart:io';

import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

import '../../../core/network/api_exception.dart';
import '../../../core/network/dio_client.dart';
import 'diagnosis_models.dart';

/// The route rejects anything over 5 MB.
///
/// This used to aim at 1 MB to save a farmer's data, which cost far more than
/// it saved: the same leaf that the web app diagnoses correctly was being
/// refused here, because the web app uploads the original file and this was
/// sending a 1280px re-encode at as low as quality 40. The model's ambiguity
/// gate needs leaf detail to tell one crop from another, and that detail was
/// being compressed away before it ever left the phone.
///
/// The target now sits just under the server's limit. An upload is slower;
/// an answer that never comes is slower still.
const _targetBytes = 4 * 1024 * 1024;
const _serverLimitBytes = 5 * 1024 * 1024;

/// Never re-encode below this. Past it the artefacts themselves start to
/// look like lesions, which is worse than a larger upload.
const _minQuality = 75;

/// Never shrink below this on the long edge. Lesion margins are the signal.
const _minDimension = 2048;

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

    // Declare what this actually is. Without a content type Dio sends
    // application/octet-stream, which is a lie about a JPEG and leaves
    // anything downstream that checks the type guessing. The type is read
    // from the bytes rather than the filename, because compression rewrites
    // the image without renaming the file it came from.
    final mediaType = _mediaTypeOf(bytes);

    final form = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        bytes,
        filename: _filenameFor(p.basename(photo.path), mediaType),
        contentType: mediaType,
      ),
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

    // Most phone photos already fit. Sending the file untouched is both
    // faster and exactly what the web app does, which is the version known
    // to get a diagnosis out of this model.
    if (original <= _targetBytes) return file.readAsBytes();

    for (final quality in [92, 85, _minQuality]) {
      final result = await FlutterImageCompress.compressWithFile(
        file.absolute.path,
        quality: quality,
        minWidth: _minDimension,
        minHeight: _minDimension,
      );

      if (result == null) break;
      if (result.length <= _targetBytes || quality == _minQuality) {
        return result;
      }
    }

    // Compression unavailable (or ineffective) — send the original and let the
    // size check above decide.
    return file.readAsBytes();
  }
}

/// The image type, read from the first bytes rather than the file extension.
///
/// A photo picked as `.heic` or `.png` and then compressed is JPEG by the
/// time it is uploaded, so the original name says nothing useful.
MediaType _mediaTypeOf(List<int> bytes) {
  bool startsWith(List<int> magic) {
    if (bytes.length < magic.length) return false;
    for (var i = 0; i < magic.length; i++) {
      if (bytes[i] != magic[i]) return false;
    }
    return true;
  }

  if (startsWith(const [0xFF, 0xD8, 0xFF])) return MediaType('image', 'jpeg');
  if (startsWith(const [0x89, 0x50, 0x4E, 0x47])) {
    return MediaType('image', 'png');
  }
  if (startsWith(const [0x52, 0x49, 0x46, 0x46])) {
    return MediaType('image', 'webp');
  }

  // Unrecognised: claim JPEG, which is what the camera produces and what
  // compression emits. Better than octet-stream, which tells nobody anything.
  return MediaType('image', 'jpeg');
}

/// Keeps the original name but corrects the extension to match the bytes.
String _filenameFor(String original, MediaType type) {
  final base = original.contains('.')
      ? original.substring(0, original.lastIndexOf('.'))
      : original;
  final safe = base.trim().isEmpty ? 'photo' : base;
  return '$safe.${type.subtype == 'jpeg' ? 'jpg' : type.subtype}';
}
