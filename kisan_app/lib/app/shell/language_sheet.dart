import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../locale_controller.dart';
import '../theme/app_colors.dart';

/// The language picker.
///
/// Was copy-pasted into three screens, which is three places to forget when a
/// language is added. One implementation now, called from all of them.
///
/// Every language is written in its own script, never translated: someone
/// looking for Gujarati is looking for "ગુજરાતી", not for "Gujarati" spelled
/// out in a language they cannot read.
Future<void> showLanguageSheet(BuildContext context, WidgetRef ref) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheetContext) {
      final current = ref.read(localeProvider);
      final text = Theme.of(context).textTheme;

      return SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final locale in supportedLocales)
              ListTile(
                title: Text(
                  localeNames[locale.languageCode] ?? locale.languageCode,
                  style: text.titleMedium,
                ),
                trailing: locale == current
                    ? const Icon(Icons.check, color: AppColors.primary)
                    : null,
                selected: locale == current,
                onTap: () {
                  ref.read(localeProvider.notifier).change(locale);
                  Navigator.of(sheetContext).pop();
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      );
    },
  );
}
