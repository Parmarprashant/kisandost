/// Pushes a glanceable summary to the Android home-screen widget.
///
/// The widget is the only part of this app a farmer sees without opening it,
/// so it carries the two things worth a glance: today's weather where they
/// are, and whatever their crop calendar says is due.
///
/// Everything it shows comes from here. The widget itself computes nothing
/// and invents nothing — a field this never fills stays blank rather than
/// displaying a placeholder that could be read as real.
library;

import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:home_widget/home_widget.dart';

/// Matches the receiver registered in AndroidManifest.xml.
const _androidProvider = 'KisanWidgetProvider';

/// Whether this build has a home-screen widget at all.
///
/// Android only. iOS widgets need a separate extension target that does not
/// exist here, and pretending otherwise would just throw at runtime.
bool get homeWidgetSupported => !kIsWeb && Platform.isAndroid;

/// What the widget shows. All strings, already formatted and translated —
/// the widget has no access to the app's localisations.
@immutable
class HomeWidgetData {
  const HomeWidgetData({
    this.place = '',
    this.temperature = '',
    this.condition = '',
    this.advisory = '',
    this.updated = '',
  });

  final String place;
  final String temperature;
  final String condition;

  /// What the crop calendar says is due, or empty when nothing is.
  final String advisory;

  /// When these figures were fetched, in words. Shown so a widget that has
  /// not refreshed for a day cannot be mistaken for a live one.
  final String updated;

  Map<String, String> toMap() => {
    'place': place,
    'temperature': temperature,
    'condition': condition,
    'advisory': advisory,
    'updated': updated,
  };
}

class HomeWidgetService {
  const HomeWidgetService();

  /// Writes the values and asks Android to redraw.
  ///
  /// Never throws. A farmer who has not added the widget, or a device that
  /// does not support one, must not see the app fail because of it.
  Future<void> update(HomeWidgetData data) async {
    if (!homeWidgetSupported) return;

    try {
      for (final entry in data.toMap().entries) {
        await HomeWidget.saveWidgetData<String>(entry.key, entry.value);
      }
      await HomeWidget.updateWidget(name: _androidProvider);
    } catch (error) {
      debugPrint('Home widget update failed: $error');
    }
  }
}
