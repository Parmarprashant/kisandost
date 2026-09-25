import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../auth/data/auth_controller.dart';
import '../data/membership_repository.dart';
import '../../../app/theme/app_colors.dart';

class PricingPlan {
  const PricingPlan({
    required this.durationMonths,
    required this.label,
    required this.pricePerMonth,
    required this.totalPrice,
    this.badge,
  });

  final int durationMonths;
  final String label;
  final int pricePerMonth;
  final int totalPrice;
  final String? badge;
}

const pricingPlans = [
  PricingPlan(
    durationMonths: 1,
    label: '1 Month',
    pricePerMonth: 65,
    totalPrice: 65,
  ),
  PricingPlan(
    durationMonths: 6,
    label: '6 Months',
    pricePerMonth: 23,
    totalPrice: 139,
    badge: 'Save 64%',
  ),
  PricingPlan(
    durationMonths: 12,
    label: '1 Year',
    pricePerMonth: 17,
    totalPrice: 199,
    badge: 'Best Value',
  ),
];

class PricingScreen extends ConsumerStatefulWidget {
  const PricingScreen({super.key});

  @override
  ConsumerState<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends ConsumerState<PricingScreen> {
  PricingPlan _selectedPlan = pricingPlans[1]; // default 6 Months
  bool _isProcessing = false;

  void _onGetPremium() {
    setState(() => _isProcessing = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          icon: const Icon(Icons.verified, color: AppColors.forest, size: 40),
          title: const Text('KisanDost Premium Demo'),
          content: Text(
            'Plan "${_selectedPlan.label}" selected for ₹${_selectedPlan.totalPrice}.\n\n'
            'In demo mode, your membership can be activated on the server via MongoDB UserMembership '
            'or by linking your phone number with our pilot coordinator.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('OK'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.forest,
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/farm');
              },
              child: const Text('Go to My Farm'),
            ),
          ],
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = ref.watch(currentUserProvider);
    final isPremium = ref.watch(membershipProvider).value ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('KisanDost Premium'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/home');
            }
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 680),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Top Crown badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.amber.shade300),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.workspace_premium,
                        size: 18,
                        color: Colors.amber.shade900,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'KisanDost Premium',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber.shade900,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Grow Smarter',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: AppColors.forest,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'One subscription unlocks AgriShield 360° risk evaluations, daily SMS advisories, pesticide QR verification, and GDD lifecycle tracking.',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 24),

                // Duration Selector
                Text(
                  'SELECT PLAN DURATION',
                  style: TextStyle(
                    fontSize: 11,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  alignment: WrapAlignment.center,
                  children: pricingPlans.map((plan) {
                    final isSelected =
                        plan.durationMonths == _selectedPlan.durationMonths;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedPlan = plan),
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 18,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.forest
                                        .withValues(alpha: 0.08)
                                  : theme.cardColor,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.forest
                                    : Colors.grey.shade300,
                                width: isSelected ? 2 : 1,
                              ),
                            ),
                            child: Text(
                              plan.label,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: isSelected
                                    ? AppColors.forest
                                    : theme.textTheme.bodyMedium?.color,
                              ),
                            ),
                          ),
                          if (plan.badge != null)
                            Positioned(
                              top: -8,
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 6,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.forest,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    plan.badge!,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                // Pricing Cards
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: const BorderSide(color: AppColors.forest, width: 2),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Premium Plan',
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.forest,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.forest,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'Most Popular',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '₹${_selectedPlan.totalPrice}',
                              style: const TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w900,
                                color: AppColors.forest,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              _selectedPlan.durationMonths == 1
                                  ? '/month'
                                  : 'for ${_selectedPlan.durationMonths} months',
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          _selectedPlan.durationMonths == 1
                              ? 'Billed monthly'
                              : '₹${_selectedPlan.pricePerMonth}/month avg · Billed upfront',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                        const Divider(height: 28),

                        Text(
                          'EVERYTHING IN FREE, PLUS:',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.1,
                            color: Colors.grey.shade700,
                          ),
                        ),
                        const SizedBox(height: 14),

                        _FeatureRow(
                          icon: Icons.shield_outlined,
                          iconColor: AppColors.forest,
                          title: 'AgriShield 360° Risk Engine',
                          subtitle: '26 zero-hallucination agronomic rules & thermal stress alerts',
                        ),
                        _FeatureRow(
                          icon: Icons.thermostat_outlined,
                          iconColor: Colors.deepOrange,
                          title: 'GDD Thermal Lifecycle Tracking',
                          subtitle: 'Live growth degree day tracking with ICAR baseline benchmarks',
                        ),
                        _FeatureRow(
                          icon: Icons.sms_outlined,
                          iconColor: Colors.blue.shade700,
                          title: 'Daily 6 AM SMS Advisories',
                          subtitle: 'Targeted morning pest and weather guidance delivered to phone',
                        ),
                        _FeatureRow(
                          icon: Icons.qr_code_scanner,
                          iconColor: Colors.indigo,
                          title: 'Pesticide QR Scanner',
                          subtitle: 'Verify manufacturer seal and chemical authenticity before spraying',
                        ),
                        _FeatureRow(
                          icon: Icons.map_outlined,
                          iconColor: Colors.teal,
                          title: 'Field Zones & Multi-Photo Scans',
                          subtitle: 'Partition fields into zones with automated polygon boundaries',
                        ),
                        const SizedBox(height: 20),

                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: FilledButton.icon(
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.forest,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            onPressed: _isProcessing ? null : _onGetPremium,
                            icon: _isProcessing
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.workspace_premium),
                            label: Text(
                              isPremium
                                  ? 'Renew Premium — ₹${_selectedPlan.totalPrice}'
                                  : 'Get Premium — ₹${_selectedPlan.totalPrice}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Free Plan Comparison
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.grey.shade300),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Free Plan',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              '₹0/month',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Includes AI Crop Disease Scan, Weather Forecast, Mandi Rates, and Fertilizer Calculator.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Demo Notice
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '* Demo Platform — no actual banking transaction is required. '
                    'Registered phone: ${user?.mobile ?? 'Active Farmer'}',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  const _FeatureRow({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
