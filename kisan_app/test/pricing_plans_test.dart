import 'package:flutter_test/flutter_test.dart';
import 'package:kisan_app/features/membership/presentation/pricing_screen.dart';

void main() {
  group('PricingPlan', () {
    test('standard plans match the web pricing specifications', () {
      expect(pricingPlans, hasLength(3));

      final oneMonth = pricingPlans.firstWhere((p) => p.durationMonths == 1);
      expect(oneMonth.totalPrice, 65);
      expect(oneMonth.pricePerMonth, 65);

      final sixMonths = pricingPlans.firstWhere((p) => p.durationMonths == 6);
      expect(sixMonths.totalPrice, 139);
      expect(sixMonths.badge, 'Save 64%');

      final oneYear = pricingPlans.firstWhere((p) => p.durationMonths == 12);
      expect(oneYear.totalPrice, 199);
      expect(oneYear.badge, 'Best Value');
    });
  });
}
