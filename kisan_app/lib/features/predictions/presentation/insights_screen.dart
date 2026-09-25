import 'package:flutter/material.dart';

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

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(l10n.navInsights),
          bottom: TabBar(
            tabs: [
              Tab(text: l10n.predTabMandi),
              Tab(text: l10n.predTabYield),
              Tab(text: l10n.predTabProfit),
            ],
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
