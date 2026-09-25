import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../app/theme/app_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../data/diagnosis_models.dart';

/// What the model actually reported, collapsed by default.
///
/// The farmer-facing copy on this screen is generated from templates, which
/// is fine until a photo is rejected and the templates guess wrong about why.
/// This shows the model's own words, so "the model returned 200 but the app
/// says my photo is unclear" stops being a mystery — a 200 carries the
/// rejection in its body, and this is where that body becomes visible.
///
/// Collapsed and in English on purpose: it is a diagnostic, not advice. The
/// plain-language reason a farmer needs is already in the list above.
class ModelDetailsPanel extends StatelessWidget {
  const ModelDetailsPanel({super.key, required this.diagnostics});

  final ModelDiagnostics diagnostics;

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);
    final lines = diagnostics.asLines;
    if (lines.isEmpty) return const SizedBox.shrink();

    final text = Theme.of(context).textTheme;

    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Theme(
        // Strip the divider lines so it does not look like a section header.
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: EdgeInsets.zero,
          childrenPadding: EdgeInsets.zero,
          title: Text(l10n.diagnoseModelDetails, style: text.bodySmall),
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: AppColors.primaryContainer.withValues(alpha: 0.35),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (final entry in lines.entries)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 110,
                            child: Text(entry.key, style: text.labelSmall),
                          ),
                          Expanded(
                            child: SelectableText(
                              entry.value,
                              style: text.bodySmall,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton.icon(
                      onPressed: () => _copy(context, lines),
                      icon: const Icon(Icons.copy_all, size: 16),
                      label: Text(l10n.diagnoseCopyDetails),
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

  /// Copies the whole block, so it can be pasted into a bug report rather
  /// than retyped off a phone screen.
  Future<void> _copy(BuildContext context, Map<String, String> lines) async {
    final messenger = ScaffoldMessenger.of(context);
    final copied = L10n.of(context).diagnoseDetailsCopied;

    final body = lines.entries.map((e) => '${e.key}: ${e.value}').join('\n');
    await Clipboard.setData(ClipboardData(text: body));

    messenger.showSnackBar(SnackBar(content: Text(copied)));
  }
}
