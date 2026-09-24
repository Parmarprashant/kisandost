import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/core/network/api_exception.dart';
import 'package:kisan_app/features/diagnosis/data/diagnosis_repository.dart';

/// Answers requests from memory so the upload path can be exercised without a
/// network or a platform channel.
class _StubAdapter implements HttpClientAdapter {
  _StubAdapter(this.respond);

  final Future<ResponseBody> Function(RequestOptions options) respond;
  RequestOptions? lastRequest;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequest = options;
    return respond(options);
  }

  @override
  void close({bool force = false}) {}
}

ResponseBody _json(Map<String, dynamic> body, {int status = 200}) {
  return ResponseBody.fromString(
    jsonEncode(body),
    status,
    headers: {
      Headers.contentTypeHeader: [Headers.jsonContentType],
    },
  );
}

void main() {
  late Directory tempDir;
  late File photo;

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('diagnosis_test');
    photo = File('${tempDir.path}/leaf.jpg')
      ..writeAsBytesSync(List.filled(64, 7));
  });

  tearDown(() => tempDir.deleteSync(recursive: true));

  Dio dioWith(_StubAdapter adapter) {
    final dio = Dio(
      BaseOptions(
        baseUrl: 'https://example.test',
        validateStatus: (status) => status != null && status < 500,
      ),
    );
    dio.httpClientAdapter = adapter;
    return dio;
  }

  // The real compressor needs a platform channel, so tests inject their own.
  Future<List<int>> passthrough(File file) => file.readAsBytes();

  test('posts the photo and parses the diagnosis', () async {
    final adapter = _StubAdapter(
      (_) async => _json({
        'cropName': 'Cotton',
        'diseaseName': 'Leaf Spot',
        'confidence': 81,
      }),
    );

    final result = await DiagnosisRepository(dioWith(adapter))
        .diagnose(photo, compressor: passthrough);

    expect(result.diseaseName, 'Leaf Spot');
    expect(result.confidence, 81);
    expect(adapter.lastRequest?.path, '/api/detect-disease');
    expect(adapter.lastRequest?.method, 'POST');
    expect(adapter.lastRequest?.data, isA<FormData>());
  });

  test('sends the file under the field name the route expects', () async {
    // The route reads `formData.get("file")`; any other field name returns
    // "No image file provided".
    final adapter = _StubAdapter(
      (_) async => _json({'diseaseName': 'Healthy'}),
    );

    await DiagnosisRepository(dioWith(adapter))
        .diagnose(photo, compressor: passthrough);

    final form = adapter.lastRequest!.data as FormData;
    expect(form.files.single.key, 'file');
    expect(form.files.single.value.filename, 'leaf.jpg');
  });

  test('reports every stage in order', () async {
    final adapter = _StubAdapter(
      (_) async => _json({'diseaseName': 'Healthy'}),
    );
    final stages = <DiagnosisStage>[];

    await DiagnosisRepository(dioWith(adapter))
        .diagnose(photo, compressor: passthrough, onStage: stages.add);

    // The progress checklist depends on this order, and on `analysing`
    // arriving only once the bytes are actually gone.
    expect(stages.first, DiagnosisStage.compressing);
    expect(stages, contains(DiagnosisStage.uploading));
    expect(stages.last, DiagnosisStage.matching);
  });

  test('refuses a photo the route would reject anyway', () async {
    final adapter = _StubAdapter((_) async => _json({}));

    // Over the route's 5MB cap. Failing here saves a long upload that ends
    // in a 400 — on a rural connection that is a minute wasted.
    Future<List<int>> tooBig(File _) async => List.filled(6 * 1024 * 1024, 0);

    await expectLater(
      DiagnosisRepository(dioWith(adapter)).diagnose(photo, compressor: tooBig),
      throwsA(
        isA<ApiException>()
            .having((e) => e.kind, 'kind', ApiErrorKind.badRequest)
            .having((e) => e.serverMessage, 'serverMessage', 'too_large'),
      ),
    );

    expect(adapter.lastRequest, isNull, reason: 'nothing should be uploaded');
  });

  test('maps a server error to a retryable failure', () async {
    final adapter = _StubAdapter(
      (_) async => _json({'error': 'AgriVision timeout'}, status: 503),
    );

    await expectLater(
      DiagnosisRepository(dioWith(adapter))
          .diagnose(photo, compressor: passthrough),
      throwsA(
        isA<ApiException>().having((e) => e.isRetryable, 'isRetryable', isTrue),
      ),
    );
  });

  test('maps a connection failure to offline', () async {
    final adapter = _StubAdapter(
      (options) async => throw DioException(
        requestOptions: options,
        type: DioExceptionType.connectionError,
      ),
    );

    await expectLater(
      DiagnosisRepository(dioWith(adapter))
          .diagnose(photo, compressor: passthrough),
      throwsA(
        isA<ApiException>()
            .having((e) => e.kind, 'kind', ApiErrorKind.offline)
            .having((e) => e.isRetryable, 'isRetryable', isTrue),
      ),
    );
  });

  test('maps a cold-start timeout to timeout, not a generic error', () async {
    // AgriVision runs on a free tier; a slow first call must read as "wait",
    // not "something broke".
    final adapter = _StubAdapter(
      (options) async => throw DioException(
        requestOptions: options,
        type: DioExceptionType.receiveTimeout,
      ),
    );

    await expectLater(
      DiagnosisRepository(dioWith(adapter))
          .diagnose(photo, compressor: passthrough),
      throwsA(
        isA<ApiException>().having((e) => e.kind, 'kind', ApiErrorKind.timeout),
      ),
    );
  });
}
