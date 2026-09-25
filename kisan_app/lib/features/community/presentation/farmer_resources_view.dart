import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class EServiceItem {
  const EServiceItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.url,
    required this.badge,
    this.badgeColor = const Color(0xFF2E7D32),
  });

  final String icon;
  final String title;
  final String description;
  final String url;
  final String badge;
  final Color badgeColor;
}

const eServices = [
  EServiceItem(
    icon: '🪪',
    title: 'PM-Kisan e-KYC',
    description:
        'Mandatory Aadhaar biometric & OTP e-KYC for installment credit',
    url: 'https://pmkisan.gov.in/',
    badge: 'Fully Online',
  ),
  EServiceItem(
    icon: '🗺️',
    title: 'AnyRoR Gujarat Land Records',
    description:
        'Verify 7/12, 8A village form records & land ownership title online',
    url: 'https://anyror.gujarat.gov.in/',
    badge: 'Gujarat Revenue',
  ),
  EServiceItem(
    icon: '🔍',
    title: 'PM-Kisan Beneficiary Status',
    description: 'Check 4-month DBT installment credit status with mobile or registration number',
    url: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
    badge: 'Instant Lookup',
  ),
  EServiceItem(
    icon: '🌾',
    title: 'Soil Health Card Portal',
    description:
        'Government soil test reports with customized N-P-K recommendation',
    url: 'https://soilhealth.dac.gov.in/',
    badge: 'Govt Portal',
  ),
  EServiceItem(
    icon: '📲',
    title: 'mKisan SMS Advisory',
    description:
        'Register mobile number for IMD weather and district agro-bulletins',
    url: 'https://mkisan.gov.in/',
    badge: 'Free Service',
  ),
  EServiceItem(
    icon: '🏠',
    title: 'PMAY-G Rural Housing Dashboard',
    description: 'Pradhan Mantri Awaas Yojana rural beneficiary tracking',
    url: 'https://pmayg.nic.in/',
    badge: 'Central Scheme',
    badgeColor: Colors.blue,
  ),
  EServiceItem(
    icon: '🥣',
    title: 'National Food Security (NFSA)',
    description:
        'Ration card status, subsidized grain quota and DBT entitlement',
    url: 'https://nfsa.gov.in/',
    badge: 'Food Dept',
    badgeColor: Colors.amber,
  ),
];

class TrainingVideoItem {
  const TrainingVideoItem({
    required this.id,
    required this.title,
    required this.topic,
  });

  final String id;
  final String title;
  final String topic;

  String get youtubeUrl => 'https://www.youtube.com/watch?v=$id';
}

const trainingVideos = [
  TrainingVideoItem(
    id: 'fuE750JhA2U',
    title: 'Drip Irrigation & Micro-Fertigation Techniques',
    topic: 'Water Conservation',
  ),
  TrainingVideoItem(
    id: '0ZTcuWp0eXA',
    title: 'Natural Pest Management with Neem & Bio-Pesticides',
    topic: 'Organic Agriculture',
  ),
  TrainingVideoItem(
    id: 'flBkER1gsQI',
    title: 'Soil Organic Carbon Restoration for High Yield',
    topic: 'Soil Science',
  ),
  TrainingVideoItem(
    id: 'wSW9PKMNt9A',
    title: 'Kharif Crop Rotation & Intercropping Best Practices',
    topic: 'Agronomy',
  ),
];

class FarmerResourcesView extends StatelessWidget {
  const FarmerResourcesView({super.key});

  Future<void> _openUrl(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Could not launch $url')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 40),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF2E7D32).withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFF2E7D32).withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            children: [
              const Text('🏛️', style: TextStyle(fontSize: 28)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Official Government Portals',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF1B5E20),
                      ),
                    ),
                    Text(
                      'Direct access to official central and state agri e-services with zero middlemen.',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Text(
          'GOVERNMENT E-SERVICES',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 10),

        for (final service in eServices)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: theme.dividerColor.withValues(alpha: 0.4),
                ),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: () => _openUrl(context, service.url),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      Text(service.icon, style: const TextStyle(fontSize: 26)),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    service.title,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 7,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: service.badgeColor.withValues(
                                      alpha: 0.1,
                                    ),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    service.badge,
                                    style: TextStyle(
                                      color: service.badgeColor,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              service.description,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.open_in_new,
                        size: 18,
                        color: Colors.grey,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

        const SizedBox(height: 16),
        Text(
          'AGRONOMIC TRAINING & PRACTICAL GUIDES',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.1,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 10),

        for (final video in trainingVideos)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: theme.dividerColor.withValues(alpha: 0.4),
                ),
              ),
              child: ListTile(
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 4,
                ),
                leading: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.play_circle_filled,
                    color: Colors.red,
                    size: 28,
                  ),
                ),
                title: Text(
                  video.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                subtitle: Text(
                  video.topic,
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                ),
                trailing: const Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: Colors.grey,
                ),
                onTap: () => _openUrl(context, video.youtubeUrl),
              ),
            ),
          ),
      ],
    );
  }
}
