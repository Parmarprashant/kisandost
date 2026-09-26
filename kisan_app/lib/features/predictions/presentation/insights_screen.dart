import 'package:flutter/material.dart';

import '../../../../app/shell/app_drawer.dart';
import '../../../app/theme/app_theme.dart';
import '../../../l10n/app_localizations.dart';
import '../../mandi/presentation/mandi_screen.dart';
import 'profit_tab.dart';
import 'yield_tab.dart';

/// The Insights tab: mandi prices, yield and profit in one place.
///
/// Tabs rather than a list of links — all three answer the same question
/// ("what is this crop worth?") and a farmer comparing them should not have to
/// go back and forth through a menu.
class InsightsScreen extends StatelessWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = L10n.of(context);

    final theme = Theme.of(context);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        drawer: const AppDrawer(),
        appBar: AppBar(
          title: Text(l10n.navMarket, style: theme.textTheme.headlineSmall),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(54),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
              // A segmented control rather than underlined tabs: all three
              // answer the same question and the farmer is switching between
              // them, not navigating away.
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(AppTheme.radiusButton),
                  border: Border.all(color: theme.colorScheme.outline),
                ),
                child: TabBar(
                  dividerColor: Colors.transparent,
                  indicatorSize: TabBarIndicatorSize.tab,
                  indicator: BoxDecoration(
                    color: theme.colorScheme.primary,
                    borderRadius: BorderRadius.circular(7),
                  ),
                  labelColor: theme.colorScheme.onPrimary,
                  unselectedLabelColor: theme.colorScheme.onSurfaceVariant,
                  labelStyle: theme.textTheme.labelMedium,
                  unselectedLabelStyle: theme.textTheme.labelMedium,
                  tabs: [
                    Tab(height: 36, text: l10n.predTabMandi),
                    Tab(height: 36, text: l10n.predTabYield),
                    Tab(height: 36, text: l10n.predTabProfit),
                  ],
                ),
              ),
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            // Mandi keeps its own scaffold-free body so it sits inside the
            // tab rather than nesting a second app bar.
            MandiBody(),
            YieldTab(),
            ProfitTab(),
          ],
        ),
      ),
    );
  }
}
