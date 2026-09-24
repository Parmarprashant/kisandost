import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_gu.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_mr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of L10n
/// returned by `L10n.of(context)`.
///
/// Applications need to include `L10n.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: L10n.localizationsDelegates,
///   supportedLocales: L10n.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the L10n.supportedLocales
/// property.
abstract class L10n {
  L10n(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static L10n of(BuildContext context) {
    return Localizations.of<L10n>(context, L10n)!;
  }

  static const LocalizationsDelegate<L10n> delegate = _L10nDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('gu'),
    Locale('hi'),
    Locale('mr'),
  ];

  /// No description provided for @appError.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong.'**
  String get appError;

  /// No description provided for @appLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get appLanguage;

  /// No description provided for @appLastUpdated.
  ///
  /// In en, this message translates to:
  /// **'Updated {time}'**
  String appLastUpdated(String time);

  /// No description provided for @appOffline.
  ///
  /// In en, this message translates to:
  /// **'You are offline. Showing saved information.'**
  String get appOffline;

  /// No description provided for @appRetry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get appRetry;

  /// No description provided for @appSlow.
  ///
  /// In en, this message translates to:
  /// **'This is taking longer than usual. Please wait.'**
  String get appSlow;

  /// No description provided for @authCancelled.
  ///
  /// In en, this message translates to:
  /// **'Sign-in was cancelled.'**
  String get authCancelled;

  /// No description provided for @authGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get authGoogle;

  /// No description provided for @authOffline.
  ///
  /// In en, this message translates to:
  /// **'You are offline. Connect and try again.'**
  String get authOffline;

  /// No description provided for @authProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get authProfile;

  /// No description provided for @authRejected.
  ///
  /// In en, this message translates to:
  /// **'Google could not sign you in. Please try again.'**
  String get authRejected;

  /// No description provided for @authServerError.
  ///
  /// In en, this message translates to:
  /// **'We could not sign you in right now.'**
  String get authServerError;

  /// No description provided for @authSignOut.
  ///
  /// In en, this message translates to:
  /// **'Sign out'**
  String get authSignOut;

  /// No description provided for @authSigningIn.
  ///
  /// In en, this message translates to:
  /// **'Signing in'**
  String get authSigningIn;

  /// No description provided for @authStateMismatch.
  ///
  /// In en, this message translates to:
  /// **'That sign-in link did not match. Please start again.'**
  String get authStateMismatch;

  /// No description provided for @authTagline.
  ///
  /// In en, this message translates to:
  /// **'Your farming companion'**
  String get authTagline;

  /// No description provided for @authWhyGoogle.
  ///
  /// In en, this message translates to:
  /// **'We use your Google account so you never have to remember a password.'**
  String get authWhyGoogle;

  /// No description provided for @chatWidget_callExpert.
  ///
  /// In en, this message translates to:
  /// **'Call Expert'**
  String get chatWidget_callExpert;

  /// No description provided for @chatWidget_greeting.
  ///
  /// In en, this message translates to:
  /// **'🙏 Namaste! I am your KisanDost AI Assistant.\n\nI can help you with crop diseases, fertilizer, weather, profit prediction, government schemes, and more — in Hindi, English, Gujarati, or Marathi!\n\nSimply ask your question below 👇'**
  String get chatWidget_greeting;

  /// No description provided for @chatWidget_headerSub.
  ///
  /// In en, this message translates to:
  /// **'Hindi • English • Gujarati • Marathi'**
  String get chatWidget_headerSub;

  /// No description provided for @chatWidget_headerTitle.
  ///
  /// In en, this message translates to:
  /// **'KisanDost AI Assistant'**
  String get chatWidget_headerTitle;

  /// No description provided for @chatWidget_placeholder.
  ///
  /// In en, this message translates to:
  /// **'Type your question...'**
  String get chatWidget_placeholder;

  /// No description provided for @chatWidget_quickReplies_contact.
  ///
  /// In en, this message translates to:
  /// **'📞 Contact Expert'**
  String get chatWidget_quickReplies_contact;

  /// No description provided for @chatWidget_quickReplies_disease.
  ///
  /// In en, this message translates to:
  /// **'🌾 Crop Disease'**
  String get chatWidget_quickReplies_disease;

  /// No description provided for @chatWidget_quickReplies_fertilizer.
  ///
  /// In en, this message translates to:
  /// **'🧪 Fertilizer'**
  String get chatWidget_quickReplies_fertilizer;

  /// No description provided for @chatWidget_quickReplies_profit.
  ///
  /// In en, this message translates to:
  /// **'📈 Profit Predict'**
  String get chatWidget_quickReplies_profit;

  /// No description provided for @chatWidget_quickReplies_schemes.
  ///
  /// In en, this message translates to:
  /// **'🏛️ Govt Schemes'**
  String get chatWidget_quickReplies_schemes;

  /// No description provided for @chatWidget_quickReplies_weather.
  ///
  /// In en, this message translates to:
  /// **'☁️ Weather Tips'**
  String get chatWidget_quickReplies_weather;

  /// No description provided for @comingSoon.
  ///
  /// In en, this message translates to:
  /// **'Coming soon'**
  String get comingSoon;

  /// No description provided for @communities_annualSupport.
  ///
  /// In en, this message translates to:
  /// **'₹6,000 Annual Support'**
  String get communities_annualSupport;

  /// No description provided for @communities_beneficiaries.
  ///
  /// In en, this message translates to:
  /// **'Beneficiaries: Crores of Farmers'**
  String get communities_beneficiaries;

  /// No description provided for @communities_directTransfer.
  ///
  /// In en, this message translates to:
  /// **'Direct Bank Transfer'**
  String get communities_directTransfer;

  /// No description provided for @communities_dislike.
  ///
  /// In en, this message translates to:
  /// **'Dislike'**
  String get communities_dislike;

  /// No description provided for @communities_eServiceCards_appStatus_description.
  ///
  /// In en, this message translates to:
  /// **'This service enables farmers to check the status of their PM-Kisan applications. By entering registration details, applicants can track submissions and verify if they have been approved to receive financial benefits.'**
  String get communities_eServiceCards_appStatus_description;

  /// No description provided for @communities_eServiceCards_appStatus_title.
  ///
  /// In en, this message translates to:
  /// **'Check PM-Kisan Application Status'**
  String get communities_eServiceCards_appStatus_title;

  /// No description provided for @communities_eServiceCards_ekyc_description.
  ///
  /// In en, this message translates to:
  /// **'The e-KYC service is essential for verifying the identity of beneficiaries under the PM-Kisan scheme. Farmers can complete their KYC process online, ensuring they meet eligibility criteria and receive timely disbursements.'**
  String get communities_eServiceCards_ekyc_description;

  /// No description provided for @communities_eServiceCards_ekyc_title.
  ///
  /// In en, this message translates to:
  /// **'Complete e-KYC for PM-Kisan'**
  String get communities_eServiceCards_ekyc_title;

  /// No description provided for @communities_eServiceCards_ems_description.
  ///
  /// In en, this message translates to:
  /// **'The EMS is a web-enabled online monitoring system for Monthly Progress Reports (MPR) under the ATMA Programme. It monitors the physical and financial progress of all scheme components.'**
  String get communities_eServiceCards_ems_description;

  /// No description provided for @communities_eServiceCards_ems_title.
  ///
  /// In en, this message translates to:
  /// **'Extension Reforms Monitoring System (EMS)'**
  String get communities_eServiceCards_ems_title;

  /// No description provided for @communities_eServiceCards_foodSecurity_description.
  ///
  /// In en, this message translates to:
  /// **'Ensures all people at all times have access to basic food for an active and healthy life. Characterized by availability, access, utilization and stability of food across the country.'**
  String get communities_eServiceCards_foodSecurity_description;

  /// No description provided for @communities_eServiceCards_foodSecurity_title.
  ///
  /// In en, this message translates to:
  /// **'National Food Security Portal'**
  String get communities_eServiceCards_foodSecurity_title;

  /// No description provided for @communities_eServiceCards_kkms_description.
  ///
  /// In en, this message translates to:
  /// **'The Kisaan Knowledge Management System is an initiative by the Ministry of Agriculture to assist farmers by providing services such as toll-free numbers, online forums, and useful farming-specific information.'**
  String get communities_eServiceCards_kkms_description;

  /// No description provided for @communities_eServiceCards_kkms_title.
  ///
  /// In en, this message translates to:
  /// **'Kisaan Knowledge Management System'**
  String get communities_eServiceCards_kkms_title;

  /// No description provided for @communities_eServiceCards_landRecords_description.
  ///
  /// In en, this message translates to:
  /// **'Get the Record of Rights (RoR) online for various villages of Gujarat. Provided by the Department of Revenue, Gujarat. Users can get RoR details by selecting district, taluka, village, and survey number.'**
  String get communities_eServiceCards_landRecords_description;

  /// No description provided for @communities_eServiceCards_landRecords_title.
  ///
  /// In en, this message translates to:
  /// **'Check Land Records in Gujarat Online'**
  String get communities_eServiceCards_landRecords_title;

  /// No description provided for @communities_eServiceCards_pmKisanScheme_description.
  ///
  /// In en, this message translates to:
  /// **'The PM-KISAN scheme aims to supplement the financial needs of Small and Marginal Farmers (SMFs) by providing direct income support of Rs. 6000 per year, transferred in three equal installments.'**
  String get communities_eServiceCards_pmKisanScheme_description;

  /// No description provided for @communities_eServiceCards_pmKisanScheme_title.
  ///
  /// In en, this message translates to:
  /// **'Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)'**
  String get communities_eServiceCards_pmKisanScheme_title;

  /// No description provided for @communities_eServiceCards_pmayDashboard_description.
  ///
  /// In en, this message translates to:
  /// **'This digital dashboard enables officials from states and banks to track the performance of PMAY-Gramin. It provides real-time data and performance metrics to monitor implementation of affordable rural housing.'**
  String get communities_eServiceCards_pmayDashboard_description;

  /// No description provided for @communities_eServiceCards_pmayDashboard_title.
  ///
  /// In en, this message translates to:
  /// **'PM Awaas Yojana-Gramin Dashboard'**
  String get communities_eServiceCards_pmayDashboard_title;

  /// No description provided for @communities_eServiceCards_registerFarmer_description.
  ///
  /// In en, this message translates to:
  /// **'Farmers may register for the PM-Kisan Samman Nidhi scheme. By providing necessary details, farmers can apply to receive financial support from the government to ensure economic stability and agricultural productivity.'**
  String get communities_eServiceCards_registerFarmer_description;

  /// No description provided for @communities_eServiceCards_registerFarmer_title.
  ///
  /// In en, this message translates to:
  /// **'Register as New Farmer for PM-Kisan'**
  String get communities_eServiceCards_registerFarmer_title;

  /// No description provided for @communities_eServices.
  ///
  /// In en, this message translates to:
  /// **'Farmer e-Services'**
  String get communities_eServices;

  /// No description provided for @communities_footerNote.
  ///
  /// In en, this message translates to:
  /// **'* Information based on official PM Kisan YouTube channel and government sources.'**
  String get communities_footerNote;

  /// No description provided for @communities_forFarmers.
  ///
  /// In en, this message translates to:
  /// **'For Farmers'**
  String get communities_forFarmers;

  /// No description provided for @communities_fullyOnline.
  ///
  /// In en, this message translates to:
  /// **'Fully Online'**
  String get communities_fullyOnline;

  /// No description provided for @communities_govSchemesAll.
  ///
  /// In en, this message translates to:
  /// **'All Schemes'**
  String get communities_govSchemesAll;

  /// No description provided for @communities_govSchemesApply.
  ///
  /// In en, this message translates to:
  /// **'Official Portal'**
  String get communities_govSchemesApply;

  /// No description provided for @communities_govSchemesBenefits.
  ///
  /// In en, this message translates to:
  /// **'Key Benefits'**
  String get communities_govSchemesBenefits;

  /// No description provided for @communities_govSchemesCentral.
  ///
  /// In en, this message translates to:
  /// **'Central Scheme'**
  String get communities_govSchemesCentral;

  /// No description provided for @communities_govSchemesDetails.
  ///
  /// In en, this message translates to:
  /// **'View Details'**
  String get communities_govSchemesDetails;

  /// No description provided for @communities_govSchemesEligibility.
  ///
  /// In en, this message translates to:
  /// **'Who Can Apply'**
  String get communities_govSchemesEligibility;

  /// No description provided for @communities_govSchemesEmpty.
  ///
  /// In en, this message translates to:
  /// **'No schemes match your search.'**
  String get communities_govSchemesEmpty;

  /// No description provided for @communities_govSchemesError.
  ///
  /// In en, this message translates to:
  /// **'Could not load schemes. Please try again.'**
  String get communities_govSchemesError;

  /// No description provided for @communities_govSchemesIntro.
  ///
  /// In en, this message translates to:
  /// **'Central government schemes covering income support, crop insurance, credit, irrigation, machinery and allied activities. Tap a scheme for benefits and eligibility, or open the official portal to apply.'**
  String get communities_govSchemesIntro;

  /// No description provided for @communities_govSchemesLaunched.
  ///
  /// In en, this message translates to:
  /// **'Launched'**
  String get communities_govSchemesLaunched;

  /// No description provided for @communities_govSchemesLess.
  ///
  /// In en, this message translates to:
  /// **'Show Less'**
  String get communities_govSchemesLess;

  /// No description provided for @communities_govSchemesLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading schemes…'**
  String get communities_govSchemesLoading;

  /// No description provided for @communities_govSchemesSearch.
  ///
  /// In en, this message translates to:
  /// **'Search schemes by name, ministry or keyword…'**
  String get communities_govSchemesSearch;

  /// No description provided for @communities_govSchemesShowAll.
  ///
  /// In en, this message translates to:
  /// **'Show All Schemes'**
  String get communities_govSchemesShowAll;

  /// No description provided for @communities_govSchemesTitle.
  ///
  /// In en, this message translates to:
  /// **'Government Schemes for Farmers'**
  String get communities_govSchemesTitle;

  /// No description provided for @communities_installments.
  ///
  /// In en, this message translates to:
  /// **'3 Installments'**
  String get communities_installments;

  /// No description provided for @communities_latestVideos.
  ///
  /// In en, this message translates to:
  /// **'Latest Videos'**
  String get communities_latestVideos;

  /// No description provided for @communities_launchDate.
  ///
  /// In en, this message translates to:
  /// **'Launched: 24 February 2019'**
  String get communities_launchDate;

  /// No description provided for @communities_like.
  ///
  /// In en, this message translates to:
  /// **'Like'**
  String get communities_like;

  /// No description provided for @communities_loadMore.
  ///
  /// In en, this message translates to:
  /// **'Load More Videos'**
  String get communities_loadMore;

  /// No description provided for @communities_more.
  ///
  /// In en, this message translates to:
  /// **'Learn More'**
  String get communities_more;

  /// No description provided for @communities_networkTab.
  ///
  /// In en, this message translates to:
  /// **'Farmer Network'**
  String get communities_networkTab;

  /// No description provided for @communities_officialChannel.
  ///
  /// In en, this message translates to:
  /// **'Official YouTube Channel'**
  String get communities_officialChannel;

  /// No description provided for @communities_officialInitiative.
  ///
  /// In en, this message translates to:
  /// **'Official Government Initiative'**
  String get communities_officialInitiative;

  /// No description provided for @communities_operationalDate.
  ///
  /// In en, this message translates to:
  /// **'Operational: 01 December 2018'**
  String get communities_operationalDate;

  /// No description provided for @communities_partiallyOnline.
  ///
  /// In en, this message translates to:
  /// **'Partially Online'**
  String get communities_partiallyOnline;

  /// No description provided for @communities_peopleHelpful.
  ///
  /// In en, this message translates to:
  /// **'people found this helpful'**
  String get communities_peopleHelpful;

  /// No description provided for @communities_pmKisanDesc.
  ///
  /// In en, this message translates to:
  /// **'PM-KISAN is a government scheme that provides financial assistance to small and marginal farmers across India. Under this initiative, eligible farmers receive ₹6,000 annually, transferred directly into their bank accounts in three equal installments.'**
  String get communities_pmKisanDesc;

  /// No description provided for @communities_pmKisanTitle.
  ///
  /// In en, this message translates to:
  /// **'PM Kisan Samman Nidhi Scheme'**
  String get communities_pmKisanTitle;

  /// No description provided for @communities_quote.
  ///
  /// In en, this message translates to:
  /// **'\"Launched by Hon\'ble PM Shri Narendra Modi on 24th February 2019. Operational since 1st December 2018. Provides income support to eligible farmer families.\"'**
  String get communities_quote;

  /// No description provided for @communities_rateThis.
  ///
  /// In en, this message translates to:
  /// **'Rate This:'**
  String get communities_rateThis;

  /// No description provided for @communities_resourcesTab.
  ///
  /// In en, this message translates to:
  /// **'Farmer Resources'**
  String get communities_resourcesTab;

  /// No description provided for @communities_shareThis.
  ///
  /// In en, this message translates to:
  /// **'Share This'**
  String get communities_shareThis;

  /// No description provided for @communities_subtitle.
  ///
  /// In en, this message translates to:
  /// **'Connecting farmers with government initiatives and peer knowledge.'**
  String get communities_subtitle;

  /// No description provided for @communities_title.
  ///
  /// In en, this message translates to:
  /// **'Communities & Schemes'**
  String get communities_title;

  /// No description provided for @communities_videoDates_v1.
  ///
  /// In en, this message translates to:
  /// **'2 days ago'**
  String get communities_videoDates_v1;

  /// No description provided for @communities_videoDates_v2.
  ///
  /// In en, this message translates to:
  /// **'1 week ago'**
  String get communities_videoDates_v2;

  /// No description provided for @communities_videoDates_v3.
  ///
  /// In en, this message translates to:
  /// **'2 weeks ago'**
  String get communities_videoDates_v3;

  /// No description provided for @communities_videoDates_v4.
  ///
  /// In en, this message translates to:
  /// **'3 weeks ago'**
  String get communities_videoDates_v4;

  /// No description provided for @communities_videoDates_v5.
  ///
  /// In en, this message translates to:
  /// **'1 month ago'**
  String get communities_videoDates_v5;

  /// No description provided for @communities_videoDates_v6.
  ///
  /// In en, this message translates to:
  /// **'2 months ago'**
  String get communities_videoDates_v6;

  /// No description provided for @communities_videoDates_v7.
  ///
  /// In en, this message translates to:
  /// **'2 months ago'**
  String get communities_videoDates_v7;

  /// No description provided for @communities_videoDates_v8.
  ///
  /// In en, this message translates to:
  /// **'3 months ago'**
  String get communities_videoDates_v8;

  /// No description provided for @communities_videoTitles_v1.
  ///
  /// In en, this message translates to:
  /// **'PM Kisan Scheme - Farmer Benefits'**
  String get communities_videoTitles_v1;

  /// No description provided for @communities_videoTitles_v2.
  ///
  /// In en, this message translates to:
  /// **'How to Check PM Kisan Status Online'**
  String get communities_videoTitles_v2;

  /// No description provided for @communities_videoTitles_v3.
  ///
  /// In en, this message translates to:
  /// **'PM Kisan 12th Installment Release'**
  String get communities_videoTitles_v3;

  /// No description provided for @communities_videoTitles_v4.
  ///
  /// In en, this message translates to:
  /// **'PM Kisan Scheme - Complete Guide'**
  String get communities_videoTitles_v4;

  /// No description provided for @communities_videoTitles_v5.
  ///
  /// In en, this message translates to:
  /// **'Farmers Welfare Schemes 2024'**
  String get communities_videoTitles_v5;

  /// No description provided for @communities_videoTitles_v6.
  ///
  /// In en, this message translates to:
  /// **'Direct Benefit Transfer (DBT) Explained'**
  String get communities_videoTitles_v6;

  /// No description provided for @communities_videoTitles_v7.
  ///
  /// In en, this message translates to:
  /// **'E-KYC Registration Tutorial'**
  String get communities_videoTitles_v7;

  /// No description provided for @communities_videoTitles_v8.
  ///
  /// In en, this message translates to:
  /// **'PMAY and PM Kisan Synergy'**
  String get communities_videoTitles_v8;

  /// No description provided for @communities_visitChannel.
  ///
  /// In en, this message translates to:
  /// **'Visit Channel'**
  String get communities_visitChannel;

  /// No description provided for @communities_visitPortal.
  ///
  /// In en, this message translates to:
  /// **'Visit Official Portal'**
  String get communities_visitPortal;

  /// No description provided for @communities_visitYoutube.
  ///
  /// In en, this message translates to:
  /// **'Visit YouTube Channel'**
  String get communities_visitYoutube;

  /// No description provided for @communities_watchMore.
  ///
  /// In en, this message translates to:
  /// **'Watch More on YouTube'**
  String get communities_watchMore;

  /// No description provided for @communities_welfareSchemes.
  ///
  /// In en, this message translates to:
  /// **'Farmer Welfare Schemes'**
  String get communities_welfareSchemes;

  /// No description provided for @communityAddComment.
  ///
  /// In en, this message translates to:
  /// **'Write a reply'**
  String get communityAddComment;

  /// No description provided for @communityAsk.
  ///
  /// In en, this message translates to:
  /// **'Ask farmers'**
  String get communityAsk;

  /// No description provided for @communityComments.
  ///
  /// In en, this message translates to:
  /// **'{count} comments'**
  String communityComments(String count);

  /// No description provided for @communityCrop.
  ///
  /// In en, this message translates to:
  /// **'Crop'**
  String get communityCrop;

  /// No description provided for @communityDetails.
  ///
  /// In en, this message translates to:
  /// **'Describe it'**
  String get communityDetails;

  /// No description provided for @communityEmpty.
  ///
  /// In en, this message translates to:
  /// **'No posts yet'**
  String get communityEmpty;

  /// No description provided for @communityHelpful.
  ///
  /// In en, this message translates to:
  /// **'Helpful'**
  String get communityHelpful;

  /// No description provided for @communityNoComments.
  ///
  /// In en, this message translates to:
  /// **'No replies yet. Be the first.'**
  String get communityNoComments;

  /// No description provided for @communityPost.
  ///
  /// In en, this message translates to:
  /// **'Post'**
  String get communityPost;

  /// No description provided for @communityPostTitle.
  ///
  /// In en, this message translates to:
  /// **'What is the problem?'**
  String get communityPostTitle;

  /// No description provided for @communityPosting.
  ///
  /// In en, this message translates to:
  /// **'Posting'**
  String get communityPosting;

  /// No description provided for @communitySend.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get communitySend;

  /// No description provided for @communitySignInNote.
  ///
  /// In en, this message translates to:
  /// **'Sign in to reply or mark posts helpful.'**
  String get communitySignInNote;

  /// No description provided for @communityTitle.
  ///
  /// In en, this message translates to:
  /// **'Farmer community'**
  String get communityTitle;

  /// No description provided for @cropSuggestion_aiAdvisory.
  ///
  /// In en, this message translates to:
  /// **'AI Advisory for {district}'**
  String cropSuggestion_aiAdvisory(String district);

  /// No description provided for @cropSuggestion_analyzing.
  ///
  /// In en, this message translates to:
  /// **'Analyzing location details & generating AI suggestions...'**
  String get cropSuggestion_analyzing;

  /// No description provided for @cropSuggestion_awaitingLocation.
  ///
  /// In en, this message translates to:
  /// **'Awaiting Location'**
  String get cropSuggestion_awaitingLocation;

  /// No description provided for @cropSuggestion_awaitingLocationDesc.
  ///
  /// In en, this message translates to:
  /// **'Click on the map to select a district and let our AI provide expert crop recommendations.'**
  String get cropSuggestion_awaitingLocationDesc;

  /// No description provided for @cropSuggestion_bestCrops.
  ///
  /// In en, this message translates to:
  /// **'Best Crops for this Region'**
  String get cropSuggestion_bestCrops;

  /// No description provided for @cropSuggestion_description.
  ///
  /// In en, this message translates to:
  /// **'Select a location on the map of Gujarat to get expert AI recommendations for the best crops to grow in that region.'**
  String get cropSuggestion_description;

  /// No description provided for @cropSuggestion_geminiInsight.
  ///
  /// In en, this message translates to:
  /// **'Gemini Insight'**
  String get cropSuggestion_geminiInsight;

  /// No description provided for @cropSuggestion_loadingMap.
  ///
  /// In en, this message translates to:
  /// **'Loading Map...'**
  String get cropSuggestion_loadingMap;

  /// No description provided for @cropSuggestion_season.
  ///
  /// In en, this message translates to:
  /// **'Season'**
  String get cropSuggestion_season;

  /// No description provided for @cropSuggestion_selectLocationDesc.
  ///
  /// In en, this message translates to:
  /// **'Click anywhere on the map of Gujarat to see localized AI crop suggestions.'**
  String get cropSuggestion_selectLocationDesc;

  /// No description provided for @cropSuggestion_selectLocationTitle.
  ///
  /// In en, this message translates to:
  /// **'Select Location'**
  String get cropSuggestion_selectLocationTitle;

  /// No description provided for @cropSuggestion_selectedLocation.
  ///
  /// In en, this message translates to:
  /// **'Selected Location'**
  String get cropSuggestion_selectedLocation;

  /// No description provided for @cropSuggestion_title.
  ///
  /// In en, this message translates to:
  /// **'AI Crop Suggestion'**
  String get cropSuggestion_title;

  /// No description provided for @cropSuggestion_waterLevel.
  ///
  /// In en, this message translates to:
  /// **'Water Level'**
  String get cropSuggestion_waterLevel;

  /// No description provided for @crops_apple_diseases_appleScab_description.
  ///
  /// In en, this message translates to:
  /// **'Velvety spots on fruit.'**
  String get crops_apple_diseases_appleScab_description;

  /// No description provided for @crops_apple_diseases_appleScab_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Rainy spring.'**
  String get crops_apple_diseases_appleScab_favorableConditions;

  /// No description provided for @crops_apple_diseases_appleScab_impact.
  ///
  /// In en, this message translates to:
  /// **'Market loss.'**
  String get crops_apple_diseases_appleScab_impact;

  /// No description provided for @crops_apple_diseases_appleScab_name.
  ///
  /// In en, this message translates to:
  /// **'Apple Scab'**
  String get crops_apple_diseases_appleScab_name;

  /// No description provided for @crops_apple_name.
  ///
  /// In en, this message translates to:
  /// **'Apple'**
  String get crops_apple_name;

  /// No description provided for @crops_banana_diseases_panamaDisease_description.
  ///
  /// In en, this message translates to:
  /// **'Soil-borne fungal disease.'**
  String get crops_banana_diseases_panamaDisease_description;

  /// No description provided for @crops_banana_diseases_panamaDisease_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Acidic soil and poor drainage.'**
  String get crops_banana_diseases_panamaDisease_favorableConditions;

  /// No description provided for @crops_banana_diseases_panamaDisease_impact.
  ///
  /// In en, this message translates to:
  /// **'Permanent loss of plantations.'**
  String get crops_banana_diseases_panamaDisease_impact;

  /// No description provided for @crops_banana_diseases_panamaDisease_name.
  ///
  /// In en, this message translates to:
  /// **'Panama Disease'**
  String get crops_banana_diseases_panamaDisease_name;

  /// No description provided for @crops_banana_name.
  ///
  /// In en, this message translates to:
  /// **'Banana'**
  String get crops_banana_name;

  /// No description provided for @crops_broccoli_diseases_clubrootBroccoli_description.
  ///
  /// In en, this message translates to:
  /// **'Soil-borne root distortion.'**
  String get crops_broccoli_diseases_clubrootBroccoli_description;

  /// No description provided for @crops_broccoli_diseases_clubrootBroccoli_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Acidic soil moisture.'**
  String get crops_broccoli_diseases_clubrootBroccoli_favorableConditions;

  /// No description provided for @crops_broccoli_diseases_clubrootBroccoli_impact.
  ///
  /// In en, this message translates to:
  /// **'Small heads, plant death.'**
  String get crops_broccoli_diseases_clubrootBroccoli_impact;

  /// No description provided for @crops_broccoli_diseases_clubrootBroccoli_name.
  ///
  /// In en, this message translates to:
  /// **'Clubroot'**
  String get crops_broccoli_diseases_clubrootBroccoli_name;

  /// No description provided for @crops_broccoli_name.
  ///
  /// In en, this message translates to:
  /// **'Broccoli'**
  String get crops_broccoli_name;

  /// No description provided for @crops_cabbage_diseases_alternariaLeafSpotCab_description.
  ///
  /// In en, this message translates to:
  /// **'Unsightly head fungus.'**
  String get crops_cabbage_diseases_alternariaLeafSpotCab_description;

  /// No description provided for @crops_cabbage_diseases_alternariaLeafSpotCab_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Hot and humid.'**
  String get crops_cabbage_diseases_alternariaLeafSpotCab_favorableConditions;

  /// No description provided for @crops_cabbage_diseases_alternariaLeafSpotCab_impact.
  ///
  /// In en, this message translates to:
  /// **'Decreases shelf-life and value.'**
  String get crops_cabbage_diseases_alternariaLeafSpotCab_impact;

  /// No description provided for @crops_cabbage_diseases_alternariaLeafSpotCab_name.
  ///
  /// In en, this message translates to:
  /// **'Alternaria Spot'**
  String get crops_cabbage_diseases_alternariaLeafSpotCab_name;

  /// No description provided for @crops_cabbage_name.
  ///
  /// In en, this message translates to:
  /// **'Cabbage'**
  String get crops_cabbage_name;

  /// No description provided for @crops_carrot_diseases_carrotLeafBlight_description.
  ///
  /// In en, this message translates to:
  /// **'Common carrot leaf rot.'**
  String get crops_carrot_diseases_carrotLeafBlight_description;

  /// No description provided for @crops_carrot_diseases_carrotLeafBlight_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Humid heat.'**
  String get crops_carrot_diseases_carrotLeafBlight_favorableConditions;

  /// No description provided for @crops_carrot_diseases_carrotLeafBlight_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces root size.'**
  String get crops_carrot_diseases_carrotLeafBlight_impact;

  /// No description provided for @crops_carrot_diseases_carrotLeafBlight_name.
  ///
  /// In en, this message translates to:
  /// **'Alternaria Blight'**
  String get crops_carrot_diseases_carrotLeafBlight_name;

  /// No description provided for @crops_carrot_name.
  ///
  /// In en, this message translates to:
  /// **'Carrot'**
  String get crops_carrot_name;

  /// No description provided for @crops_cauliflower_diseases_blackRotCauli_description.
  ///
  /// In en, this message translates to:
  /// **'Crucifer bacterial decay.'**
  String get crops_cauliflower_diseases_blackRotCauli_description;

  /// No description provided for @crops_cauliflower_diseases_blackRotCauli_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Warm Rain.'**
  String get crops_cauliflower_diseases_blackRotCauli_favorableConditions;

  /// No description provided for @crops_cauliflower_diseases_blackRotCauli_impact.
  ///
  /// In en, this message translates to:
  /// **'Severe head rot.'**
  String get crops_cauliflower_diseases_blackRotCauli_impact;

  /// No description provided for @crops_cauliflower_diseases_blackRotCauli_name.
  ///
  /// In en, this message translates to:
  /// **'Black Rot'**
  String get crops_cauliflower_diseases_blackRotCauli_name;

  /// No description provided for @crops_cauliflower_name.
  ///
  /// In en, this message translates to:
  /// **'Cauliflower'**
  String get crops_cauliflower_name;

  /// No description provided for @crops_corn_diseases_cornSmut_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal disease causing galls on plants.'**
  String get crops_corn_diseases_cornSmut_description;

  /// No description provided for @crops_corn_diseases_cornSmut_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Hot, dry weather followed by rain.'**
  String get crops_corn_diseases_cornSmut_favorableConditions;

  /// No description provided for @crops_corn_diseases_cornSmut_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces yield and grain quality.'**
  String get crops_corn_diseases_cornSmut_impact;

  /// No description provided for @crops_corn_diseases_cornSmut_name.
  ///
  /// In en, this message translates to:
  /// **'Common Smut'**
  String get crops_corn_diseases_cornSmut_name;

  /// No description provided for @crops_corn_name.
  ///
  /// In en, this message translates to:
  /// **'Corn'**
  String get crops_corn_name;

  /// No description provided for @crops_cotton_diseases_bollRotCotton_description.
  ///
  /// In en, this message translates to:
  /// **'Cotton boll decay.'**
  String get crops_cotton_diseases_bollRotCotton_description;

  /// No description provided for @crops_cotton_diseases_bollRotCotton_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Rain and density.'**
  String get crops_cotton_diseases_bollRotCotton_favorableConditions;

  /// No description provided for @crops_cotton_diseases_bollRotCotton_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces lint yield and quality.'**
  String get crops_cotton_diseases_bollRotCotton_impact;

  /// No description provided for @crops_cotton_diseases_bollRotCotton_name.
  ///
  /// In en, this message translates to:
  /// **'Boll Rot'**
  String get crops_cotton_diseases_bollRotCotton_name;

  /// No description provided for @crops_cotton_name.
  ///
  /// In en, this message translates to:
  /// **'Cotton'**
  String get crops_cotton_name;

  /// No description provided for @crops_cucumber_diseases_powderyMildewCuc_description.
  ///
  /// In en, this message translates to:
  /// **'White leaf powder fungus.'**
  String get crops_cucumber_diseases_powderyMildewCuc_description;

  /// No description provided for @crops_cucumber_diseases_powderyMildewCuc_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Humidity.'**
  String get crops_cucumber_diseases_powderyMildewCuc_favorableConditions;

  /// No description provided for @crops_cucumber_diseases_powderyMildewCuc_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduced harvest life.'**
  String get crops_cucumber_diseases_powderyMildewCuc_impact;

  /// No description provided for @crops_cucumber_diseases_powderyMildewCuc_name.
  ///
  /// In en, this message translates to:
  /// **'Powdery Mildew'**
  String get crops_cucumber_diseases_powderyMildewCuc_name;

  /// No description provided for @crops_cucumber_name.
  ///
  /// In en, this message translates to:
  /// **'Cucumber'**
  String get crops_cucumber_name;

  /// No description provided for @crops_grapes_diseases_downyMildewGrapes_description.
  ///
  /// In en, this message translates to:
  /// **'Aggressive fungal disease of vines.'**
  String get crops_grapes_diseases_downyMildewGrapes_description;

  /// No description provided for @crops_grapes_diseases_downyMildewGrapes_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Wet weather, moderate temps.'**
  String get crops_grapes_diseases_downyMildewGrapes_favorableConditions;

  /// No description provided for @crops_grapes_diseases_downyMildewGrapes_impact.
  ///
  /// In en, this message translates to:
  /// **'Severe defoliation and fruit loss.'**
  String get crops_grapes_diseases_downyMildewGrapes_impact;

  /// No description provided for @crops_grapes_diseases_downyMildewGrapes_name.
  ///
  /// In en, this message translates to:
  /// **'Downy Mildew'**
  String get crops_grapes_diseases_downyMildewGrapes_name;

  /// No description provided for @crops_grapes_name.
  ///
  /// In en, this message translates to:
  /// **'Grapes'**
  String get crops_grapes_name;

  /// No description provided for @crops_lettuce_diseases_downyMildewLettuce_description.
  ///
  /// In en, this message translates to:
  /// **'Leaf rot of lettuce.'**
  String get crops_lettuce_diseases_downyMildewLettuce_description;

  /// No description provided for @crops_lettuce_diseases_downyMildewLettuce_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Cool and wet.'**
  String get crops_lettuce_diseases_downyMildewLettuce_favorableConditions;

  /// No description provided for @crops_lettuce_diseases_downyMildewLettuce_impact.
  ///
  /// In en, this message translates to:
  /// **'Destroys marketable heads.'**
  String get crops_lettuce_diseases_downyMildewLettuce_impact;

  /// No description provided for @crops_lettuce_diseases_downyMildewLettuce_name.
  ///
  /// In en, this message translates to:
  /// **'Downy Mildew'**
  String get crops_lettuce_diseases_downyMildewLettuce_name;

  /// No description provided for @crops_lettuce_name.
  ///
  /// In en, this message translates to:
  /// **'Lettuce'**
  String get crops_lettuce_name;

  /// No description provided for @crops_onion_diseases_purpleBlotchOnion_description.
  ///
  /// In en, this message translates to:
  /// **'Bulb-stunting fungus.'**
  String get crops_onion_diseases_purpleBlotchOnion_description;

  /// No description provided for @crops_onion_diseases_purpleBlotchOnion_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Humidity.'**
  String get crops_onion_diseases_purpleBlotchOnion_favorableConditions;

  /// No description provided for @crops_onion_diseases_purpleBlotchOnion_impact.
  ///
  /// In en, this message translates to:
  /// **'Affects quality and storage.'**
  String get crops_onion_diseases_purpleBlotchOnion_impact;

  /// No description provided for @crops_onion_diseases_purpleBlotchOnion_name.
  ///
  /// In en, this message translates to:
  /// **'Purple Blotch'**
  String get crops_onion_diseases_purpleBlotchOnion_name;

  /// No description provided for @crops_onion_name.
  ///
  /// In en, this message translates to:
  /// **'Onion'**
  String get crops_onion_name;

  /// No description provided for @crops_orange_diseases_citrusCanker_description.
  ///
  /// In en, this message translates to:
  /// **'Bacterial spots on fruit and leaves.'**
  String get crops_orange_diseases_citrusCanker_description;

  /// No description provided for @crops_orange_diseases_citrusCanker_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Wind-driven rain.'**
  String get crops_orange_diseases_citrusCanker_favorableConditions;

  /// No description provided for @crops_orange_diseases_citrusCanker_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces yield and quality.'**
  String get crops_orange_diseases_citrusCanker_impact;

  /// No description provided for @crops_orange_diseases_citrusCanker_name.
  ///
  /// In en, this message translates to:
  /// **'Citrus Canker'**
  String get crops_orange_diseases_citrusCanker_name;

  /// No description provided for @crops_orange_name.
  ///
  /// In en, this message translates to:
  /// **'Orange'**
  String get crops_orange_name;

  /// No description provided for @crops_papaya_diseases_ringspotPapaya_description.
  ///
  /// In en, this message translates to:
  /// **'Viral rings on fruit leaves.'**
  String get crops_papaya_diseases_ringspotPapaya_description;

  /// No description provided for @crops_papaya_diseases_ringspotPapaya_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Aphid activity.'**
  String get crops_papaya_diseases_ringspotPapaya_favorableConditions;

  /// No description provided for @crops_papaya_diseases_ringspotPapaya_impact.
  ///
  /// In en, this message translates to:
  /// **'Stunts plant growth.'**
  String get crops_papaya_diseases_ringspotPapaya_impact;

  /// No description provided for @crops_papaya_diseases_ringspotPapaya_name.
  ///
  /// In en, this message translates to:
  /// **'Papaya Ringspot'**
  String get crops_papaya_diseases_ringspotPapaya_name;

  /// No description provided for @crops_papaya_name.
  ///
  /// In en, this message translates to:
  /// **'Papaya'**
  String get crops_papaya_name;

  /// No description provided for @crops_peach_diseases_leafCurlPeach_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal distortion of leaves.'**
  String get crops_peach_diseases_leafCurlPeach_description;

  /// No description provided for @crops_peach_diseases_leafCurlPeach_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Cool, wet spring.'**
  String get crops_peach_diseases_leafCurlPeach_favorableConditions;

  /// No description provided for @crops_peach_diseases_leafCurlPeach_impact.
  ///
  /// In en, this message translates to:
  /// **'Weakens tree vitality.'**
  String get crops_peach_diseases_leafCurlPeach_impact;

  /// No description provided for @crops_peach_diseases_leafCurlPeach_name.
  ///
  /// In en, this message translates to:
  /// **'Peach Leaf Curl'**
  String get crops_peach_diseases_leafCurlPeach_name;

  /// No description provided for @crops_peach_name.
  ///
  /// In en, this message translates to:
  /// **'Peach'**
  String get crops_peach_name;

  /// No description provided for @crops_pear_diseases_fireBlightPear_description.
  ///
  /// In en, this message translates to:
  /// **'Bacterial scorching disease.'**
  String get crops_pear_diseases_fireBlightPear_description;

  /// No description provided for @crops_pear_diseases_fireBlightPear_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Warm, wet blooms.'**
  String get crops_pear_diseases_fireBlightPear_favorableConditions;

  /// No description provided for @crops_pear_diseases_fireBlightPear_impact.
  ///
  /// In en, this message translates to:
  /// **'Rapid tree death.'**
  String get crops_pear_diseases_fireBlightPear_impact;

  /// No description provided for @crops_pear_diseases_fireBlightPear_name.
  ///
  /// In en, this message translates to:
  /// **'Fire Blight'**
  String get crops_pear_diseases_fireBlightPear_name;

  /// No description provided for @crops_pear_name.
  ///
  /// In en, this message translates to:
  /// **'Pear'**
  String get crops_pear_name;

  /// No description provided for @crops_pepper_diseases_bacterialSpotPepper_description.
  ///
  /// In en, this message translates to:
  /// **'Damaging bacterial infection.'**
  String get crops_pepper_diseases_bacterialSpotPepper_description;

  /// No description provided for @crops_pepper_diseases_bacterialSpotPepper_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Rain and heat.'**
  String get crops_pepper_diseases_bacterialSpotPepper_favorableConditions;

  /// No description provided for @crops_pepper_diseases_bacterialSpotPepper_impact.
  ///
  /// In en, this message translates to:
  /// **'Sunscald and yield drop.'**
  String get crops_pepper_diseases_bacterialSpotPepper_impact;

  /// No description provided for @crops_pepper_diseases_bacterialSpotPepper_name.
  ///
  /// In en, this message translates to:
  /// **'Bacterial Spot'**
  String get crops_pepper_diseases_bacterialSpotPepper_name;

  /// No description provided for @crops_pepper_name.
  ///
  /// In en, this message translates to:
  /// **'Pepper'**
  String get crops_pepper_name;

  /// No description provided for @crops_pineapple_diseases_heartRot_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal decay of the inner leaves.'**
  String get crops_pineapple_diseases_heartRot_description;

  /// No description provided for @crops_pineapple_diseases_heartRot_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Waterlogged heavy soils.'**
  String get crops_pineapple_diseases_heartRot_favorableConditions;

  /// No description provided for @crops_pineapple_diseases_heartRot_impact.
  ///
  /// In en, this message translates to:
  /// **'Plant death.'**
  String get crops_pineapple_diseases_heartRot_impact;

  /// No description provided for @crops_pineapple_diseases_heartRot_name.
  ///
  /// In en, this message translates to:
  /// **'Heart Rot'**
  String get crops_pineapple_diseases_heartRot_name;

  /// No description provided for @crops_pineapple_name.
  ///
  /// In en, this message translates to:
  /// **'Pineapple'**
  String get crops_pineapple_name;

  /// No description provided for @crops_plum_diseases_blackKnot_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal swellings on branches.'**
  String get crops_plum_diseases_blackKnot_description;

  /// No description provided for @crops_plum_diseases_blackKnot_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Wet springs.'**
  String get crops_plum_diseases_blackKnot_favorableConditions;

  /// No description provided for @crops_plum_diseases_blackKnot_impact.
  ///
  /// In en, this message translates to:
  /// **'Can kill the tree.'**
  String get crops_plum_diseases_blackKnot_impact;

  /// No description provided for @crops_plum_diseases_blackKnot_name.
  ///
  /// In en, this message translates to:
  /// **'Black Knot'**
  String get crops_plum_diseases_blackKnot_name;

  /// No description provided for @crops_plum_name.
  ///
  /// In en, this message translates to:
  /// **'Plum'**
  String get crops_plum_name;

  /// No description provided for @crops_pomegranate_diseases_bacterialBlightPom_description.
  ///
  /// In en, this message translates to:
  /// **'Dark water-soaked lesions.'**
  String get crops_pomegranate_diseases_bacterialBlightPom_description;

  /// No description provided for @crops_pomegranate_diseases_bacterialBlightPom_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Rainy weather.'**
  String get crops_pomegranate_diseases_bacterialBlightPom_favorableConditions;

  /// No description provided for @crops_pomegranate_diseases_bacterialBlightPom_impact.
  ///
  /// In en, this message translates to:
  /// **'Severe market loss.'**
  String get crops_pomegranate_diseases_bacterialBlightPom_impact;

  /// No description provided for @crops_pomegranate_diseases_bacterialBlightPom_name.
  ///
  /// In en, this message translates to:
  /// **'Bacterial Blight'**
  String get crops_pomegranate_diseases_bacterialBlightPom_name;

  /// No description provided for @crops_pomegranate_name.
  ///
  /// In en, this message translates to:
  /// **'Pomegranate'**
  String get crops_pomegranate_name;

  /// No description provided for @crops_potato_diseases_lateBlightPotato_description.
  ///
  /// In en, this message translates to:
  /// **'Destructive fungal rot.'**
  String get crops_potato_diseases_lateBlightPotato_description;

  /// No description provided for @crops_potato_diseases_lateBlightPotato_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Moist cool weather.'**
  String get crops_potato_diseases_lateBlightPotato_favorableConditions;

  /// No description provided for @crops_potato_diseases_lateBlightPotato_impact.
  ///
  /// In en, this message translates to:
  /// **'Total plant loss.'**
  String get crops_potato_diseases_lateBlightPotato_impact;

  /// No description provided for @crops_potato_diseases_lateBlightPotato_name.
  ///
  /// In en, this message translates to:
  /// **'Late Blight'**
  String get crops_potato_diseases_lateBlightPotato_name;

  /// No description provided for @crops_potato_name.
  ///
  /// In en, this message translates to:
  /// **'Potato'**
  String get crops_potato_name;

  /// No description provided for @crops_rice_diseases_riceBlast_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal infection affecting above-ground parts.'**
  String get crops_rice_diseases_riceBlast_description;

  /// No description provided for @crops_rice_diseases_riceBlast_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'High humidity and continuous rain.'**
  String get crops_rice_diseases_riceBlast_favorableConditions;

  /// No description provided for @crops_rice_diseases_riceBlast_impact.
  ///
  /// In en, this message translates to:
  /// **'Severe destruction of the entire crop.'**
  String get crops_rice_diseases_riceBlast_impact;

  /// No description provided for @crops_rice_diseases_riceBlast_name.
  ///
  /// In en, this message translates to:
  /// **'Rice Blast'**
  String get crops_rice_diseases_riceBlast_name;

  /// No description provided for @crops_rice_name.
  ///
  /// In en, this message translates to:
  /// **'Rice'**
  String get crops_rice_name;

  /// No description provided for @crops_soyabean_diseases_soybeanRust_description.
  ///
  /// In en, this message translates to:
  /// **'Aggressive foliar fungus.'**
  String get crops_soyabean_diseases_soybeanRust_description;

  /// No description provided for @crops_soyabean_diseases_soybeanRust_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'High moisture.'**
  String get crops_soyabean_diseases_soybeanRust_favorableConditions;

  /// No description provided for @crops_soyabean_diseases_soybeanRust_impact.
  ///
  /// In en, this message translates to:
  /// **'Up to 80% loss.'**
  String get crops_soyabean_diseases_soybeanRust_impact;

  /// No description provided for @crops_soyabean_diseases_soybeanRust_name.
  ///
  /// In en, this message translates to:
  /// **'Soybean Rust'**
  String get crops_soyabean_diseases_soybeanRust_name;

  /// No description provided for @crops_soyabean_name.
  ///
  /// In en, this message translates to:
  /// **'Soyabean'**
  String get crops_soyabean_name;

  /// No description provided for @crops_spinach_diseases_spinachDownyMildew_description.
  ///
  /// In en, this message translates to:
  /// **'Critical spinach rot.'**
  String get crops_spinach_diseases_spinachDownyMildew_description;

  /// No description provided for @crops_spinach_diseases_spinachDownyMildew_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Damp cold weather.'**
  String get crops_spinach_diseases_spinachDownyMildew_favorableConditions;

  /// No description provided for @crops_spinach_diseases_spinachDownyMildew_impact.
  ///
  /// In en, this message translates to:
  /// **'Rapid crop destruction.'**
  String get crops_spinach_diseases_spinachDownyMildew_impact;

  /// No description provided for @crops_spinach_diseases_spinachDownyMildew_name.
  ///
  /// In en, this message translates to:
  /// **'Downy Mildew'**
  String get crops_spinach_diseases_spinachDownyMildew_name;

  /// No description provided for @crops_spinach_name.
  ///
  /// In en, this message translates to:
  /// **'Spinach'**
  String get crops_spinach_name;

  /// No description provided for @crops_strawberry_diseases_grayMoldStrawberry_description.
  ///
  /// In en, this message translates to:
  /// **'Common berry fungus.'**
  String get crops_strawberry_diseases_grayMoldStrawberry_description;

  /// No description provided for @crops_strawberry_diseases_grayMoldStrawberry_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'High humidity.'**
  String get crops_strawberry_diseases_grayMoldStrawberry_favorableConditions;

  /// No description provided for @crops_strawberry_diseases_grayMoldStrawberry_impact.
  ///
  /// In en, this message translates to:
  /// **'Post-harvest decay.'**
  String get crops_strawberry_diseases_grayMoldStrawberry_impact;

  /// No description provided for @crops_strawberry_diseases_grayMoldStrawberry_name.
  ///
  /// In en, this message translates to:
  /// **'Gray Mold'**
  String get crops_strawberry_diseases_grayMoldStrawberry_name;

  /// No description provided for @crops_strawberry_name.
  ///
  /// In en, this message translates to:
  /// **'Strawberry'**
  String get crops_strawberry_name;

  /// No description provided for @crops_sugarcane_diseases_redRotSugarcane_description.
  ///
  /// In en, this message translates to:
  /// **'Critical sugar rot.'**
  String get crops_sugarcane_diseases_redRotSugarcane_description;

  /// No description provided for @crops_sugarcane_diseases_redRotSugarcane_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Rain and waterlogging.'**
  String get crops_sugarcane_diseases_redRotSugarcane_favorableConditions;

  /// No description provided for @crops_sugarcane_diseases_redRotSugarcane_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces sugar recovery and weight.'**
  String get crops_sugarcane_diseases_redRotSugarcane_impact;

  /// No description provided for @crops_sugarcane_diseases_redRotSugarcane_name.
  ///
  /// In en, this message translates to:
  /// **'Red Rot'**
  String get crops_sugarcane_diseases_redRotSugarcane_name;

  /// No description provided for @crops_sugarcane_name.
  ///
  /// In en, this message translates to:
  /// **'Sugarcane'**
  String get crops_sugarcane_name;

  /// No description provided for @crops_tomato_diseases_earlyBlightTom_description.
  ///
  /// In en, this message translates to:
  /// **'Common foliar rot.'**
  String get crops_tomato_diseases_earlyBlightTom_description;

  /// No description provided for @crops_tomato_diseases_earlyBlightTom_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Humid days.'**
  String get crops_tomato_diseases_earlyBlightTom_favorableConditions;

  /// No description provided for @crops_tomato_diseases_earlyBlightTom_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces yield by damaging foliage.'**
  String get crops_tomato_diseases_earlyBlightTom_impact;

  /// No description provided for @crops_tomato_diseases_earlyBlightTom_name.
  ///
  /// In en, this message translates to:
  /// **'Early Blight'**
  String get crops_tomato_diseases_earlyBlightTom_name;

  /// No description provided for @crops_tomato_name.
  ///
  /// In en, this message translates to:
  /// **'Tomato'**
  String get crops_tomato_name;

  /// No description provided for @crops_watermelon_diseases_fusariumWiltWm_description.
  ///
  /// In en, this message translates to:
  /// **'Soil-borne pathogen.'**
  String get crops_watermelon_diseases_fusariumWiltWm_description;

  /// No description provided for @crops_watermelon_diseases_fusariumWiltWm_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Warm soil.'**
  String get crops_watermelon_diseases_fusariumWiltWm_favorableConditions;

  /// No description provided for @crops_watermelon_diseases_fusariumWiltWm_impact.
  ///
  /// In en, this message translates to:
  /// **'Total crop failure.'**
  String get crops_watermelon_diseases_fusariumWiltWm_impact;

  /// No description provided for @crops_watermelon_diseases_fusariumWiltWm_name.
  ///
  /// In en, this message translates to:
  /// **'Fusarium Wilt'**
  String get crops_watermelon_diseases_fusariumWiltWm_name;

  /// No description provided for @crops_watermelon_name.
  ///
  /// In en, this message translates to:
  /// **'Watermelon'**
  String get crops_watermelon_name;

  /// No description provided for @crops_wheat_diseases_wheatRust_description.
  ///
  /// In en, this message translates to:
  /// **'Fungal disease affecting wheat stems, leaves, and grains.'**
  String get crops_wheat_diseases_wheatRust_description;

  /// No description provided for @crops_wheat_diseases_wheatRust_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'Warm days and cool nights with dew.'**
  String get crops_wheat_diseases_wheatRust_favorableConditions;

  /// No description provided for @crops_wheat_diseases_wheatRust_impact.
  ///
  /// In en, this message translates to:
  /// **'Reduces yield by 20-50%.'**
  String get crops_wheat_diseases_wheatRust_impact;

  /// No description provided for @crops_wheat_diseases_wheatRust_name.
  ///
  /// In en, this message translates to:
  /// **'Wheat Rust'**
  String get crops_wheat_diseases_wheatRust_name;

  /// No description provided for @crops_wheat_name.
  ///
  /// In en, this message translates to:
  /// **'Wheat'**
  String get crops_wheat_name;

  /// No description provided for @dashboard_calculateFertilizer.
  ///
  /// In en, this message translates to:
  /// **'Calculate Fertilizer'**
  String get dashboard_calculateFertilizer;

  /// No description provided for @dashboard_chooseCrop.
  ///
  /// In en, this message translates to:
  /// **'Choose Your Crop'**
  String get dashboard_chooseCrop;

  /// No description provided for @dashboard_commonDiseasesLabel.
  ///
  /// In en, this message translates to:
  /// **'Common Diseases'**
  String get dashboard_commonDiseasesLabel;

  /// No description provided for @dashboard_excellent.
  ///
  /// In en, this message translates to:
  /// **'Excellent'**
  String get dashboard_excellent;

  /// No description provided for @dashboard_fair.
  ///
  /// In en, this message translates to:
  /// **'Fair'**
  String get dashboard_fair;

  /// No description provided for @dashboard_good.
  ///
  /// In en, this message translates to:
  /// **'Good'**
  String get dashboard_good;

  /// No description provided for @dashboard_greeting.
  ///
  /// In en, this message translates to:
  /// **'Namaste {name}! Your farm is {health} today'**
  String dashboard_greeting(String health, String name);

  /// No description provided for @dashboard_healthStatus_healthy.
  ///
  /// In en, this message translates to:
  /// **'Healthy'**
  String get dashboard_healthStatus_healthy;

  /// No description provided for @dashboard_healthStatus_moderate.
  ///
  /// In en, this message translates to:
  /// **'Moderate'**
  String get dashboard_healthStatus_moderate;

  /// No description provided for @dashboard_healthStatus_stress.
  ///
  /// In en, this message translates to:
  /// **'Stress'**
  String get dashboard_healthStatus_stress;

  /// No description provided for @dashboard_ndviSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Your current overall farm NDVI is {value} ({status}).'**
  String dashboard_ndviSubtitle(String status, String value);

  /// No description provided for @dashboard_poor.
  ///
  /// In en, this message translates to:
  /// **'Poor'**
  String get dashboard_poor;

  /// No description provided for @dashboard_precautionsLabel.
  ///
  /// In en, this message translates to:
  /// **'Precautions & Remedies'**
  String get dashboard_precautionsLabel;

  /// No description provided for @dashboard_profitIntelDesc.
  ///
  /// In en, this message translates to:
  /// **'Predict your crop yield and estimate profits based on real-time APMC market prices.'**
  String get dashboard_profitIntelDesc;

  /// No description provided for @dashboard_profitIntelTitle.
  ///
  /// In en, this message translates to:
  /// **'AI Profit Intelligence'**
  String get dashboard_profitIntelTitle;

  /// No description provided for @dashboard_seasonLabel.
  ///
  /// In en, this message translates to:
  /// **'Season'**
  String get dashboard_seasonLabel;

  /// No description provided for @dashboard_soilTypeLabel.
  ///
  /// In en, this message translates to:
  /// **'Soil Type'**
  String get dashboard_soilTypeLabel;

  /// No description provided for @dashboard_tryPredictor.
  ///
  /// In en, this message translates to:
  /// **'Try Predictor'**
  String get dashboard_tryPredictor;

  /// No description provided for @dashboard_viewDetails.
  ///
  /// In en, this message translates to:
  /// **'View Details'**
  String get dashboard_viewDetails;

  /// No description provided for @dashboard_waterNeedLabel.
  ///
  /// In en, this message translates to:
  /// **'Water Need'**
  String get dashboard_waterNeedLabel;

  /// No description provided for @diagnoseAnalysing.
  ///
  /// In en, this message translates to:
  /// **'Analysing leaf'**
  String get diagnoseAnalysing;

  /// No description provided for @diagnoseBuy.
  ///
  /// In en, this message translates to:
  /// **'Products to use'**
  String get diagnoseBuy;

  /// No description provided for @diagnoseCauses.
  ///
  /// In en, this message translates to:
  /// **'Why it happened'**
  String get diagnoseCauses;

  /// No description provided for @diagnoseCompressing.
  ///
  /// In en, this message translates to:
  /// **'Preparing photo'**
  String get diagnoseCompressing;

  /// No description provided for @diagnoseConfidence.
  ///
  /// In en, this message translates to:
  /// **'{value}% sure'**
  String diagnoseConfidence(String value);

  /// No description provided for @diagnoseExpertNote.
  ///
  /// In en, this message translates to:
  /// **'Please confirm with an expert before you spray.'**
  String get diagnoseExpertNote;

  /// No description provided for @diagnoseFarmingSteps.
  ///
  /// In en, this message translates to:
  /// **'Farming steps'**
  String get diagnoseFarmingSteps;

  /// No description provided for @diagnoseGallery.
  ///
  /// In en, this message translates to:
  /// **'Choose from gallery'**
  String get diagnoseGallery;

  /// No description provided for @diagnoseGuide.
  ///
  /// In en, this message translates to:
  /// **'Fill the frame with one affected leaf'**
  String get diagnoseGuide;

  /// No description provided for @diagnoseHealthy.
  ///
  /// In en, this message translates to:
  /// **'Healthy'**
  String get diagnoseHealthy;

  /// No description provided for @diagnoseHowToFix.
  ///
  /// In en, this message translates to:
  /// **'How to get a good photo'**
  String get diagnoseHowToFix;

  /// No description provided for @diagnoseInfected.
  ///
  /// In en, this message translates to:
  /// **'Disease found'**
  String get diagnoseInfected;

  /// No description provided for @diagnoseKeepPhoto.
  ///
  /// In en, this message translates to:
  /// **'Your photo is saved. You can try again.'**
  String get diagnoseKeepPhoto;

  /// No description provided for @diagnoseMatching.
  ///
  /// In en, this message translates to:
  /// **'Finding treatments'**
  String get diagnoseMatching;

  /// No description provided for @diagnoseNoCamera.
  ///
  /// In en, this message translates to:
  /// **'Camera is not available on this device.'**
  String get diagnoseNoCamera;

  /// No description provided for @diagnosePermission.
  ///
  /// In en, this message translates to:
  /// **'Allow camera access to check your crop.'**
  String get diagnosePermission;

  /// No description provided for @diagnoseRetake.
  ///
  /// In en, this message translates to:
  /// **'Check another leaf'**
  String get diagnoseRetake;

  /// No description provided for @diagnoseSlowNote.
  ///
  /// In en, this message translates to:
  /// **'The first check of the day can take up to a minute.'**
  String get diagnoseSlowNote;

  /// No description provided for @diagnoseSymptoms.
  ///
  /// In en, this message translates to:
  /// **'What to look for'**
  String get diagnoseSymptoms;

  /// No description provided for @diagnoseTakePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take photo'**
  String get diagnoseTakePhoto;

  /// No description provided for @diagnoseTooLarge.
  ///
  /// In en, this message translates to:
  /// **'That photo is too large. Please take a new one.'**
  String get diagnoseTooLarge;

  /// No description provided for @diagnoseUnclear.
  ///
  /// In en, this message translates to:
  /// **'The photo was not clear enough'**
  String get diagnoseUnclear;

  /// No description provided for @diagnoseUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading'**
  String get diagnoseUploading;

  /// No description provided for @diagnoseWhatToDo.
  ///
  /// In en, this message translates to:
  /// **'What to do now'**
  String get diagnoseWhatToDo;

  /// No description provided for @diseasesPage_bestSeason.
  ///
  /// In en, this message translates to:
  /// **'Best Season: Kharif (Monsoon)'**
  String get diseasesPage_bestSeason;

  /// No description provided for @diseasesPage_care.
  ///
  /// In en, this message translates to:
  /// **'{crop} CARE'**
  String diseasesPage_care(String crop);

  /// No description provided for @diseasesPage_favorableConditions.
  ///
  /// In en, this message translates to:
  /// **'FAVORABLE CONDITIONS'**
  String get diseasesPage_favorableConditions;

  /// No description provided for @diseasesPage_filters_all.
  ///
  /// In en, this message translates to:
  /// **'All Crops'**
  String get diseasesPage_filters_all;

  /// No description provided for @diseasesPage_filters_cashCrops.
  ///
  /// In en, this message translates to:
  /// **'Cash Crops'**
  String get diseasesPage_filters_cashCrops;

  /// No description provided for @diseasesPage_filters_cereals.
  ///
  /// In en, this message translates to:
  /// **'Cereals'**
  String get diseasesPage_filters_cereals;

  /// No description provided for @diseasesPage_filters_fruits.
  ///
  /// In en, this message translates to:
  /// **'Fruits'**
  String get diseasesPage_filters_fruits;

  /// No description provided for @diseasesPage_filters_vegetables.
  ///
  /// In en, this message translates to:
  /// **'Vegetables'**
  String get diseasesPage_filters_vegetables;

  /// No description provided for @diseasesPage_generalPrecaution.
  ///
  /// In en, this message translates to:
  /// **'GENERAL PRECAUTION:'**
  String get diseasesPage_generalPrecaution;

  /// No description provided for @diseasesPage_impact.
  ///
  /// In en, this message translates to:
  /// **'Impact'**
  String get diseasesPage_impact;

  /// No description provided for @diseasesPage_pestControl.
  ///
  /// In en, this message translates to:
  /// **'PEST CONTROL (इलाज)'**
  String get diseasesPage_pestControl;

  /// No description provided for @diseasesPage_prevention.
  ///
  /// In en, this message translates to:
  /// **'Prevention & Control'**
  String get diseasesPage_prevention;

  /// No description provided for @diseasesPage_reset.
  ///
  /// In en, this message translates to:
  /// **'Reset Selection'**
  String get diseasesPage_reset;

  /// No description provided for @diseasesPage_selected.
  ///
  /// In en, this message translates to:
  /// **'You\'ve selected {count} out of 8 crops'**
  String diseasesPage_selected(String count);

  /// No description provided for @diseasesPage_subtitle.
  ///
  /// In en, this message translates to:
  /// **'Select up to 8 crops to view common diseases, pests, and preventive measures. Protect your harvest with expert guidance.'**
  String get diseasesPage_subtitle;

  /// No description provided for @diseasesPage_symptoms.
  ///
  /// In en, this message translates to:
  /// **'SYMPTOMS (लक्षण)'**
  String get diseasesPage_symptoms;

  /// No description provided for @diseasesPage_title.
  ///
  /// In en, this message translates to:
  /// **'Crop Disease & Pest Management'**
  String get diseasesPage_title;

  /// No description provided for @diseasesPage_viewStoreProducts.
  ///
  /// In en, this message translates to:
  /// **'View Store Products'**
  String get diseasesPage_viewStoreProducts;

  /// No description provided for @farmAddCrop.
  ///
  /// In en, this message translates to:
  /// **'Add crop'**
  String get farmAddCrop;

  /// No description provided for @farmAddField.
  ///
  /// In en, this message translates to:
  /// **'Add field'**
  String get farmAddField;

  /// No description provided for @farmArea.
  ///
  /// In en, this message translates to:
  /// **'Area'**
  String get farmArea;

  /// No description provided for @farmBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get farmBack;

  /// No description provided for @farmBadNumber.
  ///
  /// In en, this message translates to:
  /// **'Enter a number'**
  String get farmBadNumber;

  /// No description provided for @farmCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get farmCancel;

  /// No description provided for @farmCropName.
  ///
  /// In en, this message translates to:
  /// **'Crop'**
  String get farmCropName;

  /// No description provided for @farmCrops.
  ///
  /// In en, this message translates to:
  /// **'Crops'**
  String get farmCrops;

  /// No description provided for @farmCultivationMethod.
  ///
  /// In en, this message translates to:
  /// **'How was it sown'**
  String get farmCultivationMethod;

  /// No description provided for @farmDayCount.
  ///
  /// In en, this message translates to:
  /// **'Day {days}'**
  String farmDayCount(String days);

  /// No description provided for @farmDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get farmDelete;

  /// No description provided for @farmDeleteField.
  ///
  /// In en, this message translates to:
  /// **'Delete this field?'**
  String get farmDeleteField;

  /// No description provided for @farmDeleteFieldNote.
  ///
  /// In en, this message translates to:
  /// **'The crops in it will be removed too.'**
  String get farmDeleteFieldNote;

  /// No description provided for @farmDistrict.
  ///
  /// In en, this message translates to:
  /// **'District'**
  String get farmDistrict;

  /// No description provided for @farmFieldName.
  ///
  /// In en, this message translates to:
  /// **'Field name'**
  String get farmFieldName;

  /// No description provided for @farmFields.
  ///
  /// In en, this message translates to:
  /// **'Fields'**
  String get farmFields;

  /// No description provided for @farmFrequency.
  ///
  /// In en, this message translates to:
  /// **'Watering'**
  String get farmFrequency;

  /// No description provided for @farmIrrigation.
  ///
  /// In en, this message translates to:
  /// **'Irrigation'**
  String get farmIrrigation;

  /// No description provided for @farmNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get farmNext;

  /// No description provided for @farmNoCrops.
  ///
  /// In en, this message translates to:
  /// **'No crops in this field yet'**
  String get farmNoCrops;

  /// No description provided for @farmNoFields.
  ///
  /// In en, this message translates to:
  /// **'No fields yet'**
  String get farmNoFields;

  /// No description provided for @farmNoFieldsHint.
  ///
  /// In en, this message translates to:
  /// **'Add your first field to get advice for your crops.'**
  String get farmNoFieldsHint;

  /// No description provided for @farmNotes.
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get farmNotes;

  /// No description provided for @farmPreviousCrop.
  ///
  /// In en, this message translates to:
  /// **'Last crop'**
  String get farmPreviousCrop;

  /// No description provided for @farmRequired.
  ///
  /// In en, this message translates to:
  /// **'Please fill this in'**
  String get farmRequired;

  /// No description provided for @farmReview.
  ///
  /// In en, this message translates to:
  /// **'Check your answers'**
  String get farmReview;

  /// No description provided for @farmSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get farmSave;

  /// No description provided for @farmSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get farmSaved;

  /// No description provided for @farmSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving'**
  String get farmSaving;

  /// No description provided for @farmSoilType.
  ///
  /// In en, this message translates to:
  /// **'Soil type'**
  String get farmSoilType;

  /// No description provided for @farmSowingDate.
  ///
  /// In en, this message translates to:
  /// **'Sowing date'**
  String get farmSowingDate;

  /// No description provided for @farmState.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get farmState;

  /// No description provided for @farmStep.
  ///
  /// In en, this message translates to:
  /// **'Step {current} of {total}'**
  String farmStep(String current, String total);

  /// No description provided for @farmTaluka.
  ///
  /// In en, this message translates to:
  /// **'Taluka'**
  String get farmTaluka;

  /// No description provided for @farmUseLocation.
  ///
  /// In en, this message translates to:
  /// **'Use my location'**
  String get farmUseLocation;

  /// No description provided for @farmVariety.
  ///
  /// In en, this message translates to:
  /// **'Variety'**
  String get farmVariety;

  /// No description provided for @farmVillage.
  ///
  /// In en, this message translates to:
  /// **'Village'**
  String get farmVillage;

  /// No description provided for @farmWaterSource.
  ///
  /// In en, this message translates to:
  /// **'Water source'**
  String get farmWaterSource;

  /// No description provided for @fertArea.
  ///
  /// In en, this message translates to:
  /// **'Area (acres)'**
  String get fertArea;

  /// No description provided for @fertBags.
  ///
  /// In en, this message translates to:
  /// **'About {count} bags of 50 kg'**
  String fertBags(String count);

  /// No description provided for @fertBuy.
  ///
  /// In en, this message translates to:
  /// **'What to buy'**
  String get fertBuy;

  /// No description provided for @fertCalculate.
  ///
  /// In en, this message translates to:
  /// **'Calculate'**
  String get fertCalculate;

  /// No description provided for @fertCost.
  ///
  /// In en, this message translates to:
  /// **'Roughly ₹{amount}'**
  String fertCost(String amount);

  /// No description provided for @fertCostNote.
  ///
  /// In en, this message translates to:
  /// **'An estimate from indicative shop prices, not a quote.'**
  String get fertCostNote;

  /// No description provided for @fertCrop.
  ///
  /// In en, this message translates to:
  /// **'Crop'**
  String get fertCrop;

  /// No description provided for @fertDap.
  ///
  /// In en, this message translates to:
  /// **'DAP'**
  String get fertDap;

  /// No description provided for @fertExistingK.
  ///
  /// In en, this message translates to:
  /// **'Potassium in soil (kg/acre)'**
  String get fertExistingK;

  /// No description provided for @fertExistingN.
  ///
  /// In en, this message translates to:
  /// **'Nitrogen in soil (kg/acre)'**
  String get fertExistingN;

  /// No description provided for @fertExistingP.
  ///
  /// In en, this message translates to:
  /// **'Phosphorus in soil (kg/acre)'**
  String get fertExistingP;

  /// No description provided for @fertKg.
  ///
  /// In en, this message translates to:
  /// **'{value} kg'**
  String fertKg(String value);

  /// No description provided for @fertMop.
  ///
  /// In en, this message translates to:
  /// **'MOP'**
  String get fertMop;

  /// No description provided for @fertReduced.
  ///
  /// In en, this message translates to:
  /// **'Your soil test reduced the dose — you need to buy less.'**
  String get fertReduced;

  /// No description provided for @fertSoil.
  ///
  /// In en, this message translates to:
  /// **'Soil type'**
  String get fertSoil;

  /// No description provided for @fertSoilTest.
  ///
  /// In en, this message translates to:
  /// **'I have a soil test'**
  String get fertSoilTest;

  /// No description provided for @fertSplitNote.
  ///
  /// In en, this message translates to:
  /// **'Apply nitrogen in 2–3 splits through the season, not all at sowing.'**
  String get fertSplitNote;

  /// No description provided for @fertTitle.
  ///
  /// In en, this message translates to:
  /// **'Fertilizer calculator'**
  String get fertTitle;

  /// No description provided for @fertUrea.
  ///
  /// In en, this message translates to:
  /// **'Urea'**
  String get fertUrea;

  /// No description provided for @fertilizer_area.
  ///
  /// In en, this message translates to:
  /// **'Farm area (acres)'**
  String get fertilizer_area;

  /// No description provided for @fertilizer_calculate.
  ///
  /// In en, this message translates to:
  /// **'Calculate'**
  String get fertilizer_calculate;

  /// No description provided for @fertilizer_cost.
  ///
  /// In en, this message translates to:
  /// **'Cost Estimate'**
  String get fertilizer_cost;

  /// No description provided for @fertilizer_crop.
  ///
  /// In en, this message translates to:
  /// **'Select Crop'**
  String get fertilizer_crop;

  /// No description provided for @fertilizer_profit.
  ///
  /// In en, this message translates to:
  /// **'Profit Gain'**
  String get fertilizer_profit;

  /// No description provided for @fertilizer_recommended.
  ///
  /// In en, this message translates to:
  /// **'Recommended NPK'**
  String get fertilizer_recommended;

  /// No description provided for @fertilizer_save.
  ///
  /// In en, this message translates to:
  /// **'Save to My Farm'**
  String get fertilizer_save;

  /// No description provided for @fertilizer_soilDesc.
  ///
  /// In en, this message translates to:
  /// **'Loamy / Sandy / Clay'**
  String get fertilizer_soilDesc;

  /// No description provided for @fertilizer_soilType.
  ///
  /// In en, this message translates to:
  /// **'Soil Type'**
  String get fertilizer_soilType;

  /// No description provided for @fertilizer_title.
  ///
  /// In en, this message translates to:
  /// **'Fertilizer Calculator'**
  String get fertilizer_title;

  /// No description provided for @fertilizer_totalBags.
  ///
  /// In en, this message translates to:
  /// **'Total Bags Needed'**
  String get fertilizer_totalBags;

  /// No description provided for @homeGreeting.
  ///
  /// In en, this message translates to:
  /// **'Namaste, {name}'**
  String homeGreeting(String name);

  /// No description provided for @homeMyCrops.
  ///
  /// In en, this message translates to:
  /// **'My crops'**
  String get homeMyCrops;

  /// No description provided for @mandiArrival.
  ///
  /// In en, this message translates to:
  /// **'Market date {date}'**
  String mandiArrival(String date);

  /// No description provided for @mandiCrop.
  ///
  /// In en, this message translates to:
  /// **'Crop'**
  String get mandiCrop;

  /// No description provided for @mandiEstimate.
  ///
  /// In en, this message translates to:
  /// **'Estimated rate'**
  String get mandiEstimate;

  /// No description provided for @mandiEstimateNote.
  ///
  /// In en, this message translates to:
  /// **'No live market data for this crop here. This is a government baseline, not a traded price.'**
  String get mandiEstimateNote;

  /// No description provided for @mandiIndicative.
  ///
  /// In en, this message translates to:
  /// **'Indicative rate'**
  String get mandiIndicative;

  /// No description provided for @mandiIndicativeNote.
  ///
  /// In en, this message translates to:
  /// **'Real government data, but not a fresh reading from your local market today.'**
  String get mandiIndicativeNote;

  /// No description provided for @mandiLive.
  ///
  /// In en, this message translates to:
  /// **'Live government rate'**
  String get mandiLive;

  /// No description provided for @mandiNotYourDistrict.
  ///
  /// In en, this message translates to:
  /// **'Nearest reporting market'**
  String get mandiNotYourDistrict;

  /// No description provided for @mandiPerQuintal.
  ///
  /// In en, this message translates to:
  /// **'per quintal'**
  String get mandiPerQuintal;

  /// No description provided for @mandiRange.
  ///
  /// In en, this message translates to:
  /// **'Range {min} – {max}'**
  String mandiRange(String max, String min);

  /// No description provided for @mandiState.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get mandiState;

  /// No description provided for @mandiTitle.
  ///
  /// In en, this message translates to:
  /// **'Mandi prices'**
  String get mandiTitle;

  /// No description provided for @myCrop_acres.
  ///
  /// In en, this message translates to:
  /// **'Acres'**
  String get myCrop_acres;

  /// No description provided for @myCrop_addCrop.
  ///
  /// In en, this message translates to:
  /// **'+ Add Crop'**
  String get myCrop_addCrop;

  /// No description provided for @myCrop_addField.
  ///
  /// In en, this message translates to:
  /// **'+ Add Field'**
  String get myCrop_addField;

  /// No description provided for @myCrop_advisoryNotice.
  ///
  /// In en, this message translates to:
  /// **'Crop monitoring and AI advisory will be available soon.'**
  String get myCrop_advisoryNotice;

  /// No description provided for @myCrop_area.
  ///
  /// In en, this message translates to:
  /// **'Field Area'**
  String get myCrop_area;

  /// No description provided for @myCrop_areaUnit.
  ///
  /// In en, this message translates to:
  /// **'Area Unit'**
  String get myCrop_areaUnit;

  /// No description provided for @myCrop_back.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get myCrop_back;

  /// No description provided for @myCrop_cropName.
  ///
  /// In en, this message translates to:
  /// **'Crop Name'**
  String get myCrop_cropName;

  /// No description provided for @myCrop_cultivatedArea.
  ///
  /// In en, this message translates to:
  /// **'Cultivated Area'**
  String get myCrop_cultivatedArea;

  /// No description provided for @myCrop_cultivationMethod.
  ///
  /// In en, this message translates to:
  /// **'Cultivation Method'**
  String get myCrop_cultivationMethod;

  /// No description provided for @myCrop_deleteCrop.
  ///
  /// In en, this message translates to:
  /// **'Delete Crop'**
  String get myCrop_deleteCrop;

  /// No description provided for @myCrop_deleteField.
  ///
  /// In en, this message translates to:
  /// **'Delete Field'**
  String get myCrop_deleteField;

  /// No description provided for @myCrop_detectLocation.
  ///
  /// In en, this message translates to:
  /// **'Detect Field Location'**
  String get myCrop_detectLocation;

  /// No description provided for @myCrop_editCrop.
  ///
  /// In en, this message translates to:
  /// **'Edit Crop'**
  String get myCrop_editCrop;

  /// No description provided for @myCrop_editField.
  ///
  /// In en, this message translates to:
  /// **'Edit Field'**
  String get myCrop_editField;

  /// No description provided for @myCrop_fieldName.
  ///
  /// In en, this message translates to:
  /// **'Field Name'**
  String get myCrop_fieldName;

  /// No description provided for @myCrop_hectares.
  ///
  /// In en, this message translates to:
  /// **'Hectares'**
  String get myCrop_hectares;

  /// No description provided for @myCrop_irrigationFrequency.
  ///
  /// In en, this message translates to:
  /// **'Irrigation Frequency'**
  String get myCrop_irrigationFrequency;

  /// No description provided for @myCrop_irrigationMethod.
  ///
  /// In en, this message translates to:
  /// **'Irrigation Method'**
  String get myCrop_irrigationMethod;

  /// No description provided for @myCrop_location.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get myCrop_location;

  /// No description provided for @myCrop_locationDetected.
  ///
  /// In en, this message translates to:
  /// **'Location detected successfully!'**
  String get myCrop_locationDetected;

  /// No description provided for @myCrop_myFields.
  ///
  /// In en, this message translates to:
  /// **'My Fields'**
  String get myCrop_myFields;

  /// No description provided for @myCrop_next.
  ///
  /// In en, this message translates to:
  /// **'Next Step'**
  String get myCrop_next;

  /// No description provided for @myCrop_noCropsInField.
  ///
  /// In en, this message translates to:
  /// **'No crop registered for this field.'**
  String get myCrop_noCropsInField;

  /// No description provided for @myCrop_noFieldsDesc.
  ///
  /// In en, this message translates to:
  /// **'Add your first field to start tracking your crops and soil details.'**
  String get myCrop_noFieldsDesc;

  /// No description provided for @myCrop_noFieldsYet.
  ///
  /// In en, this message translates to:
  /// **'No fields registered yet'**
  String get myCrop_noFieldsYet;

  /// No description provided for @myCrop_notes.
  ///
  /// In en, this message translates to:
  /// **'Additional Notes'**
  String get myCrop_notes;

  /// No description provided for @myCrop_previousCrop.
  ///
  /// In en, this message translates to:
  /// **'Previous Crop'**
  String get myCrop_previousCrop;

  /// No description provided for @myCrop_reviewTitle.
  ///
  /// In en, this message translates to:
  /// **'Review Field & Crop Data'**
  String get myCrop_reviewTitle;

  /// No description provided for @myCrop_saveCrop.
  ///
  /// In en, this message translates to:
  /// **'Save Crop'**
  String get myCrop_saveCrop;

  /// No description provided for @myCrop_saveField.
  ///
  /// In en, this message translates to:
  /// **'Save Field'**
  String get myCrop_saveField;

  /// No description provided for @myCrop_seedDemo.
  ///
  /// In en, this message translates to:
  /// **'🌱 Seed Demo Fields'**
  String get myCrop_seedDemo;

  /// No description provided for @myCrop_soilTestReport.
  ///
  /// In en, this message translates to:
  /// **'Do you have a soil test report?'**
  String get myCrop_soilTestReport;

  /// No description provided for @myCrop_soilType.
  ///
  /// In en, this message translates to:
  /// **'Soil Type'**
  String get myCrop_soilType;

  /// No description provided for @myCrop_sowingDate.
  ///
  /// In en, this message translates to:
  /// **'Sowing / Planting Date'**
  String get myCrop_sowingDate;

  /// No description provided for @myCrop_status.
  ///
  /// In en, this message translates to:
  /// **'Crop Status'**
  String get myCrop_status;

  /// No description provided for @myCrop_step1.
  ///
  /// In en, this message translates to:
  /// **'1. Field Details'**
  String get myCrop_step1;

  /// No description provided for @myCrop_step2.
  ///
  /// In en, this message translates to:
  /// **'2. Soil & Irrigation'**
  String get myCrop_step2;

  /// No description provided for @myCrop_step3.
  ///
  /// In en, this message translates to:
  /// **'3. Crop Registration'**
  String get myCrop_step3;

  /// No description provided for @myCrop_step4.
  ///
  /// In en, this message translates to:
  /// **'4. Review & Save'**
  String get myCrop_step4;

  /// No description provided for @myCrop_subtitle.
  ///
  /// In en, this message translates to:
  /// **'Register and manage your farm fields and crop data.'**
  String get myCrop_subtitle;

  /// No description provided for @myCrop_title.
  ///
  /// In en, this message translates to:
  /// **'My Fields & Crops'**
  String get myCrop_title;

  /// No description provided for @myCrop_variety.
  ///
  /// In en, this message translates to:
  /// **'Variety'**
  String get myCrop_variety;

  /// No description provided for @myCrop_viewField.
  ///
  /// In en, this message translates to:
  /// **'View Field Details'**
  String get myCrop_viewField;

  /// No description provided for @myCrop_waterSource.
  ///
  /// In en, this message translates to:
  /// **'Water Source'**
  String get myCrop_waterSource;

  /// No description provided for @navDiagnose.
  ///
  /// In en, this message translates to:
  /// **'Diagnose'**
  String get navDiagnose;

  /// No description provided for @navFarm.
  ///
  /// In en, this message translates to:
  /// **'My Farm'**
  String get navFarm;

  /// No description provided for @navInsights.
  ///
  /// In en, this message translates to:
  /// **'Insights'**
  String get navInsights;

  /// No description provided for @navMore.
  ///
  /// In en, this message translates to:
  /// **'More'**
  String get navMore;

  /// No description provided for @navbar_activeFarmer.
  ///
  /// In en, this message translates to:
  /// **'Active Farmer'**
  String get navbar_activeFarmer;

  /// No description provided for @navbar_detectingLocation.
  ///
  /// In en, this message translates to:
  /// **'Detecting location…'**
  String get navbar_detectingLocation;

  /// No description provided for @navbar_farmerLogin.
  ///
  /// In en, this message translates to:
  /// **'Farmer Login'**
  String get navbar_farmerLogin;

  /// No description provided for @navbar_fullWeather.
  ///
  /// In en, this message translates to:
  /// **'Full weather'**
  String get navbar_fullWeather;

  /// No description provided for @navbar_home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navbar_home;

  /// No description provided for @navbar_locationBlocked.
  ///
  /// In en, this message translates to:
  /// **'Location Blocked'**
  String get navbar_locationBlocked;

  /// No description provided for @navbar_locationBlockedDesc.
  ///
  /// In en, this message translates to:
  /// **'Your browser has blocked location access. To fix:'**
  String get navbar_locationBlockedDesc;

  /// No description provided for @navbar_locationBlockedStep1.
  ///
  /// In en, this message translates to:
  /// **'Click the lock icon in address bar'**
  String get navbar_locationBlockedStep1;

  /// No description provided for @navbar_locationBlockedStep2.
  ///
  /// In en, this message translates to:
  /// **'Set Location to Allow'**
  String get navbar_locationBlockedStep2;

  /// No description provided for @navbar_locationBlockedStep3.
  ///
  /// In en, this message translates to:
  /// **'Then click Retry below'**
  String get navbar_locationBlockedStep3;

  /// No description provided for @navbar_refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get navbar_refresh;

  /// No description provided for @navbar_retryLocation.
  ///
  /// In en, this message translates to:
  /// **'Retry Location'**
  String get navbar_retryLocation;

  /// No description provided for @navbar_selectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select Language:'**
  String get navbar_selectLanguage;

  /// No description provided for @navbar_updated.
  ///
  /// In en, this message translates to:
  /// **'Updated'**
  String get navbar_updated;

  /// No description provided for @navigation_ai.
  ///
  /// In en, this message translates to:
  /// **'AI Profit'**
  String get navigation_ai;

  /// No description provided for @navigation_calculator.
  ///
  /// In en, this message translates to:
  /// **'Calculator'**
  String get navigation_calculator;

  /// No description provided for @navigation_communities.
  ///
  /// In en, this message translates to:
  /// **'Communities'**
  String get navigation_communities;

  /// No description provided for @navigation_diseases.
  ///
  /// In en, this message translates to:
  /// **'Diseases'**
  String get navigation_diseases;

  /// No description provided for @navigation_home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navigation_home;

  /// No description provided for @navigation_myCrops.
  ///
  /// In en, this message translates to:
  /// **'My Crops'**
  String get navigation_myCrops;

  /// No description provided for @navigation_products.
  ///
  /// In en, this message translates to:
  /// **'Products'**
  String get navigation_products;

  /// No description provided for @navigation_profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navigation_profile;

  /// No description provided for @navigation_weather.
  ///
  /// In en, this message translates to:
  /// **'Weather'**
  String get navigation_weather;

  /// No description provided for @navigation_yieldAi.
  ///
  /// In en, this message translates to:
  /// **'Yield AI'**
  String get navigation_yieldAi;

  /// No description provided for @onboardDistrict.
  ///
  /// In en, this message translates to:
  /// **'District'**
  String get onboardDistrict;

  /// No description provided for @onboardFinish.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get onboardFinish;

  /// No description provided for @onboardMainCrop.
  ///
  /// In en, this message translates to:
  /// **'Main crop'**
  String get onboardMainCrop;

  /// No description provided for @onboardMobile.
  ///
  /// In en, this message translates to:
  /// **'Mobile number'**
  String get onboardMobile;

  /// No description provided for @onboardName.
  ///
  /// In en, this message translates to:
  /// **'Your name'**
  String get onboardName;

  /// No description provided for @onboardSkip.
  ///
  /// In en, this message translates to:
  /// **'Skip for now'**
  String get onboardSkip;

  /// No description provided for @onboardTitle.
  ///
  /// In en, this message translates to:
  /// **'Tell us about your farm'**
  String get onboardTitle;

  /// No description provided for @onboardVillage.
  ///
  /// In en, this message translates to:
  /// **'Village'**
  String get onboardVillage;

  /// No description provided for @onboardWhy.
  ///
  /// In en, this message translates to:
  /// **'This lets us give advice for your area and your crops.'**
  String get onboardWhy;

  /// No description provided for @predAbove.
  ///
  /// In en, this message translates to:
  /// **'{value}% above your region'**
  String predAbove(String value);

  /// No description provided for @predArea.
  ///
  /// In en, this message translates to:
  /// **'Area (acres)'**
  String get predArea;

  /// No description provided for @predBelow.
  ///
  /// In en, this message translates to:
  /// **'{value}% below your region'**
  String predBelow(String value);

  /// No description provided for @predConfidence.
  ///
  /// In en, this message translates to:
  /// **'{value}% confident'**
  String predConfidence(String value);

  /// No description provided for @predCosts.
  ///
  /// In en, this message translates to:
  /// **'Your input costs'**
  String get predCosts;

  /// No description provided for @predCrop.
  ///
  /// In en, this message translates to:
  /// **'Crop'**
  String get predCrop;

  /// No description provided for @predEstimatedPrice.
  ///
  /// In en, this message translates to:
  /// **'This estimate uses a baseline price, not a live market rate.'**
  String get predEstimatedPrice;

  /// No description provided for @predFertCost.
  ///
  /// In en, this message translates to:
  /// **'Fertilizer cost (₹)'**
  String get predFertCost;

  /// No description provided for @predIrrigCost.
  ///
  /// In en, this message translates to:
  /// **'Irrigation cost (₹)'**
  String get predIrrigCost;

  /// No description provided for @predLoss.
  ///
  /// In en, this message translates to:
  /// **'You may not cover your input costs.'**
  String get predLoss;

  /// No description provided for @predMargin.
  ///
  /// In en, this message translates to:
  /// **'Left after input costs'**
  String get predMargin;

  /// No description provided for @predMarginNote.
  ///
  /// In en, this message translates to:
  /// **'This counts only the fertilizer, pesticide and irrigation you entered. Seed, labour, land and transport are not included, so your real profit will be lower.'**
  String get predMarginNote;

  /// No description provided for @predNdvi.
  ///
  /// In en, this message translates to:
  /// **'Crop greenness (NDVI)'**
  String get predNdvi;

  /// No description provided for @predNdviHelp.
  ///
  /// In en, this message translates to:
  /// **'How green and healthy the crop looks from above. Leave as-is if unsure.'**
  String get predNdviHelp;

  /// No description provided for @predPerAcre.
  ///
  /// In en, this message translates to:
  /// **'{value} t per acre'**
  String predPerAcre(String value);

  /// No description provided for @predPestCost.
  ///
  /// In en, this message translates to:
  /// **'Pesticide cost (₹)'**
  String get predPestCost;

  /// No description provided for @predPrice.
  ///
  /// In en, this message translates to:
  /// **'₹{value} per quintal'**
  String predPrice(String value);

  /// No description provided for @predQuintals.
  ///
  /// In en, this message translates to:
  /// **'{value} quintals'**
  String predQuintals(String value);

  /// No description provided for @predRainfall.
  ///
  /// In en, this message translates to:
  /// **'Season rainfall (mm)'**
  String get predRainfall;

  /// No description provided for @predRevenue.
  ///
  /// In en, this message translates to:
  /// **'Expected revenue'**
  String get predRevenue;

  /// No description provided for @predRun.
  ///
  /// In en, this message translates to:
  /// **'Estimate'**
  String get predRun;

  /// No description provided for @predRunning.
  ///
  /// In en, this message translates to:
  /// **'Working'**
  String get predRunning;

  /// No description provided for @predSoilMoisture.
  ///
  /// In en, this message translates to:
  /// **'Soil moisture (%)'**
  String get predSoilMoisture;

  /// No description provided for @predTabMandi.
  ///
  /// In en, this message translates to:
  /// **'Mandi'**
  String get predTabMandi;

  /// No description provided for @predTabProfit.
  ///
  /// In en, this message translates to:
  /// **'Profit'**
  String get predTabProfit;

  /// No description provided for @predTabYield.
  ///
  /// In en, this message translates to:
  /// **'Yield'**
  String get predTabYield;

  /// No description provided for @predTonnes.
  ///
  /// In en, this message translates to:
  /// **'{value} tonnes'**
  String predTonnes(String value);

  /// No description provided for @predVsRegion.
  ///
  /// In en, this message translates to:
  /// **'Regional average {value} t per acre'**
  String predVsRegion(String value);

  /// No description provided for @predYieldResult.
  ///
  /// In en, this message translates to:
  /// **'Expected harvest'**
  String get predYieldResult;

  /// No description provided for @productsPage_allProducts.
  ///
  /// In en, this message translates to:
  /// **'← All Products'**
  String get productsPage_allProducts;

  /// No description provided for @productsPage_buyOnWhatsApp.
  ///
  /// In en, this message translates to:
  /// **'Buy on WhatsApp'**
  String get productsPage_buyOnWhatsApp;

  /// No description provided for @productsPage_footer.
  ///
  /// In en, this message translates to:
  /// **'© 2026 KisanDost · Empowering Indian Farmers'**
  String get productsPage_footer;

  /// No description provided for @productsPage_heroSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Science-backed crop nutrition and soil enhancement products for modern farming.'**
  String get productsPage_heroSubtitle;

  /// No description provided for @productsPage_heroTag.
  ///
  /// In en, this message translates to:
  /// **'🌾 Agricultural Solutions'**
  String get productsPage_heroTag;

  /// No description provided for @productsPage_heroTitle.
  ///
  /// In en, this message translates to:
  /// **'KisanDost Products'**
  String get productsPage_heroTitle;

  /// No description provided for @productsPage_loading.
  ///
  /// In en, this message translates to:
  /// **'Loading product...'**
  String get productsPage_loading;

  /// No description provided for @productsPage_noFeatures.
  ///
  /// In en, this message translates to:
  /// **'No features listed for this product.'**
  String get productsPage_noFeatures;

  /// No description provided for @productsPage_noUsage.
  ///
  /// In en, this message translates to:
  /// **'Usage information not available. Please contact us for dosage details.'**
  String get productsPage_noUsage;

  /// No description provided for @productsPage_notFoundDesc.
  ///
  /// In en, this message translates to:
  /// **'The product you are looking for does not exist.'**
  String get productsPage_notFoundDesc;

  /// No description provided for @productsPage_priceLabel.
  ///
  /// In en, this message translates to:
  /// **'Price:'**
  String get productsPage_priceLabel;

  /// No description provided for @productsPage_priceOnRequest.
  ///
  /// In en, this message translates to:
  /// **'Price on request'**
  String get productsPage_priceOnRequest;

  /// No description provided for @productsPage_productNotFound.
  ///
  /// In en, this message translates to:
  /// **'Product Not Found'**
  String get productsPage_productNotFound;

  /// No description provided for @productsPage_solvesLabel.
  ///
  /// In en, this message translates to:
  /// **'Solves'**
  String get productsPage_solvesLabel;

  /// No description provided for @productsPage_tabs_features.
  ///
  /// In en, this message translates to:
  /// **'Features'**
  String get productsPage_tabs_features;

  /// No description provided for @productsPage_tabs_overview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get productsPage_tabs_overview;

  /// No description provided for @productsPage_tabs_usage.
  ///
  /// In en, this message translates to:
  /// **'Usage'**
  String get productsPage_tabs_usage;

  /// No description provided for @productsPage_viewProduct.
  ///
  /// In en, this message translates to:
  /// **'View Product →'**
  String get productsPage_viewProduct;

  /// No description provided for @products_Abamectin_description.
  ///
  /// In en, this message translates to:
  /// **'Effective against mites and leaf miners in a variety of crops.'**
  String get products_Abamectin_description;

  /// No description provided for @products_Abamectin_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Abamectin 1.9% EC is a mixture of avermectins, producing toxic effects in insects and mites by stimulating the release of gamma-aminobutyric acid (GABA), an inhibitory neurotransmitter. It provides excellent control of spider mites and leaf miners in crops like roses, grapes, apples, and tomatoes.'**
  String get products_Abamectin_longDescription;

  /// No description provided for @products_Abamectin_name.
  ///
  /// In en, this message translates to:
  /// **'Abamectin 1.9% EC'**
  String get products_Abamectin_name;

  /// No description provided for @products_Abamectin_tag.
  ///
  /// In en, this message translates to:
  /// **'Miticide / Insecticide'**
  String get products_Abamectin_tag;

  /// No description provided for @products_Abamectin_usage_apple.
  ///
  /// In en, this message translates to:
  /// **'0.05% solution, 6-7 L water per tree (7 days waiting period)'**
  String get products_Abamectin_usage_apple;

  /// No description provided for @products_Abamectin_usage_grapes.
  ///
  /// In en, this message translates to:
  /// **'0.75 ml/L water in 500-1000 L water per ha (3 days waiting period)'**
  String get products_Abamectin_usage_grapes;

  /// No description provided for @products_Abamectin_usage_rose.
  ///
  /// In en, this message translates to:
  /// **'0.025-0.05% solution in 5000 L water per ha (3 days waiting period)'**
  String get products_Abamectin_usage_rose;

  /// No description provided for @products_Abamectin_usage_tomato.
  ///
  /// In en, this message translates to:
  /// **'450-600 ml in 500 L water per ha (3 days waiting period)'**
  String get products_Abamectin_usage_tomato;

  /// No description provided for @products_AcephateImida_description.
  ///
  /// In en, this message translates to:
  /// **'A powerful combination for controlling both sucking and borer pests.'**
  String get products_AcephateImida_description;

  /// No description provided for @products_AcephateImida_longDescription.
  ///
  /// In en, this message translates to:
  /// **'This combination product harnesses the systemic and contact action of Imidacloprid with the broad-spectrum activity of Acephate. It provides a comprehensive solution for complex pest infestations, effectively managing jassids, aphids, thrips, whiteflies, and bollworms in crops like cotton, chilli, and paddy.'**
  String get products_AcephateImida_longDescription;

  /// No description provided for @products_AcephateImida_name.
  ///
  /// In en, this message translates to:
  /// **'Acephate 50% + Imidacloprid 1.8% SP'**
  String get products_AcephateImida_name;

  /// No description provided for @products_AcephateImida_tag.
  ///
  /// In en, this message translates to:
  /// **'Combination SP'**
  String get products_AcephateImida_tag;

  /// No description provided for @products_AcephateImida_usage_chilli.
  ///
  /// In en, this message translates to:
  /// **'518 g a.i./ha (1000 g) in 500 L water (3 days waiting)'**
  String get products_AcephateImida_usage_chilli;

  /// No description provided for @products_AcephateImida_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'518 g a.i./ha (1000 g) in 500 L water (40 days waiting)'**
  String get products_AcephateImida_usage_cotton;

  /// No description provided for @products_AcephateImida_usage_rice.
  ///
  /// In en, this message translates to:
  /// **'518 g a.i./ha (1000 g) in 500 L water'**
  String get products_AcephateImida_usage_rice;

  /// No description provided for @products_AcephateImida_usage_sugarcane.
  ///
  /// In en, this message translates to:
  /// **'1250+45 g a.i./ha (2500 ml) in 500 L water (123 days waiting)'**
  String get products_AcephateImida_usage_sugarcane;

  /// No description provided for @products_Acephate_description.
  ///
  /// In en, this message translates to:
  /// **'Broad-spectrum systemic insecticide for sucking and chewing pests.'**
  String get products_Acephate_description;

  /// No description provided for @products_Acephate_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Acephate 75% SP is a soluble powder that acts as a systemic and contact insecticide. It is absorbed by leaves and roots, providing effective control against a wide range of pests including jassids, bollworms, aphids, and stem borers in crops like cotton, rice, and safflower.'**
  String get products_Acephate_longDescription;

  /// No description provided for @products_Acephate_name.
  ///
  /// In en, this message translates to:
  /// **'Acephate 75% SP'**
  String get products_Acephate_name;

  /// No description provided for @products_Acephate_tag.
  ///
  /// In en, this message translates to:
  /// **'Systemic Insecticide'**
  String get products_Acephate_tag;

  /// No description provided for @products_Acephate_usage_cottonBollworms.
  ///
  /// In en, this message translates to:
  /// **'584 g a.i./ha (780 g formulation) in 500-1000 L water (15 days waiting)'**
  String get products_Acephate_usage_cottonBollworms;

  /// No description provided for @products_Acephate_usage_cottonJassids.
  ///
  /// In en, this message translates to:
  /// **'292 g a.i./ha (390 g formulation) in 500-1000 L water (15 days waiting)'**
  String get products_Acephate_usage_cottonJassids;

  /// No description provided for @products_Acephate_usage_ricePests.
  ///
  /// In en, this message translates to:
  /// **'500-750 g a.i./ha (666-1000 g formulation) in 300-500 L water (15 days waiting)'**
  String get products_Acephate_usage_ricePests;

  /// No description provided for @products_Acephate_usage_safflowerAphids.
  ///
  /// In en, this message translates to:
  /// **'584 g a.i./ha (780 g formulation) in 500-1000 L water (15 days waiting)'**
  String get products_Acephate_usage_safflowerAphids;

  /// No description provided for @products_Acetamiprid_description.
  ///
  /// In en, this message translates to:
  /// **'Systemic insecticide for effective control of sap-feeding insects.'**
  String get products_Acetamiprid_description;

  /// No description provided for @products_Acetamiprid_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Acetamiprid 20% SP is a systemic, neonicotinoid insecticide that acts on the central nervous system of insects, causing paralysis and death. It is highly effective against aphids, jassids, thrips, and whiteflies in a variety of crops including cotton, cabbage, okra, chilli, and rice.'**
  String get products_Acetamiprid_longDescription;

  /// No description provided for @products_Acetamiprid_name.
  ///
  /// In en, this message translates to:
  /// **'Acetamiprid 20% SP'**
  String get products_Acetamiprid_name;

  /// No description provided for @products_Acetamiprid_tag.
  ///
  /// In en, this message translates to:
  /// **'Neonicotinoid'**
  String get products_Acetamiprid_tag;

  /// No description provided for @products_Acetamiprid_usage_cabbageAphids.
  ///
  /// In en, this message translates to:
  /// **'15 g a.i./ha (75 g formulation) in 500-600 L water (7 days waiting)'**
  String get products_Acetamiprid_usage_cabbageAphids;

  /// No description provided for @products_Acetamiprid_usage_chilliThrips.
  ///
  /// In en, this message translates to:
  /// **'10-20 g a.i./ha (50-100 g formulation) in 500-600 L water (3 days waiting)'**
  String get products_Acetamiprid_usage_chilliThrips;

  /// No description provided for @products_Acetamiprid_usage_cottonAphidsJassids.
  ///
  /// In en, this message translates to:
  /// **'10 g a.i./ha (50 g formulation) in 500-600 L water (15 days waiting)'**
  String get products_Acetamiprid_usage_cottonAphidsJassids;

  /// No description provided for @products_Acetamiprid_usage_cottonWhiteflies.
  ///
  /// In en, this message translates to:
  /// **'20 g a.i./ha (100 g formulation) in 500-600 L water (15 days waiting)'**
  String get products_Acetamiprid_usage_cottonWhiteflies;

  /// No description provided for @products_Acetamiprid_usage_okraAphids.
  ///
  /// In en, this message translates to:
  /// **'15 g a.i./ha (75 g formulation) in 500-600 L water (3 days waiting)'**
  String get products_Acetamiprid_usage_okraAphids;

  /// No description provided for @products_Acetamiprid_usage_riceBph.
  ///
  /// In en, this message translates to:
  /// **'10-20 g a.i./ha (50-100 g formulation) in 500-600 L water (7 days waiting)'**
  String get products_Acetamiprid_usage_riceBph;

  /// No description provided for @products_AluminumPhosphide_description.
  ///
  /// In en, this message translates to:
  /// **'A highly effective fumigant for stored grain pest control.'**
  String get products_AluminumPhosphide_description;

  /// No description provided for @products_AluminumPhosphide_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Aluminum Phosphide 56% is a solid fumigant that reacts with moisture in the air to release phosphine gas. It is used to control a broad spectrum of stored grain pests like weevils, borers, and beetles in cereals, pulses, oilseeds, and spices, as well as for rodent control in burrows.'**
  String get products_AluminumPhosphide_longDescription;

  /// No description provided for @products_AluminumPhosphide_name.
  ///
  /// In en, this message translates to:
  /// **'Aluminum Phosphide 56%'**
  String get products_AluminumPhosphide_name;

  /// No description provided for @products_AluminumPhosphide_tag.
  ///
  /// In en, this message translates to:
  /// **'Fumigant'**
  String get products_AluminumPhosphide_tag;

  /// No description provided for @products_AluminumPhosphide_usage_cerealsPulses.
  ///
  /// In en, this message translates to:
  /// **'3 tablets (3g) per ton or 150g/100m³, exposure 5-7 days, aeration 48 hrs'**
  String get products_AluminumPhosphide_usage_cerealsPulses;

  /// No description provided for @products_AluminumPhosphide_usage_godowns.
  ///
  /// In en, this message translates to:
  /// **'14 tablets/1000m³ or 150g/100m³, exposure 72 hrs, aeration 24 hrs'**
  String get products_AluminumPhosphide_usage_godowns;

  /// No description provided for @products_AluminumPhosphide_usage_oilseedsSpices.
  ///
  /// In en, this message translates to:
  /// **'3 tablets per ton or 225g/100m³, exposure 5 days, aeration 48 hrs'**
  String get products_AluminumPhosphide_usage_oilseedsSpices;

  /// No description provided for @products_AluminumPhosphide_usage_rodentBurrows.
  ///
  /// In en, this message translates to:
  /// **'1 tablet per burrow'**
  String get products_AluminumPhosphide_usage_rodentBurrows;

  /// No description provided for @products_Brodifacoum_description.
  ///
  /// In en, this message translates to:
  /// **'A potent, single-feed anticoagulant rodenticide for field and premises.'**
  String get products_Brodifacoum_description;

  /// No description provided for @products_Brodifacoum_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Brodifacoum 0.005% BB is a powerful anticoagulant rodenticide. It works by inhibiting the synthesis of Vitamin K, essential for blood clotting, leading to the death of rodents from internal hemorrhaging. It is a single-feed bait, effective against a wide range of rats, bandicoots, and mice in agricultural, commercial, and residential settings.'**
  String get products_Brodifacoum_longDescription;

  /// No description provided for @products_Brodifacoum_name.
  ///
  /// In en, this message translates to:
  /// **'Brodifacoum 0.005% BB'**
  String get products_Brodifacoum_name;

  /// No description provided for @products_Brodifacoum_tag.
  ///
  /// In en, this message translates to:
  /// **'Rodenticide'**
  String get products_Brodifacoum_tag;

  /// No description provided for @products_Brodifacoum_usage_burrowBaiting.
  ///
  /// In en, this message translates to:
  /// **'Place bait near active burrows'**
  String get products_Brodifacoum_usage_burrowBaiting;

  /// No description provided for @products_Brodifacoum_usage_fieldRats.
  ///
  /// In en, this message translates to:
  /// **'One bait block (20g) per baiting station as single feed'**
  String get products_Brodifacoum_usage_fieldRats;

  /// No description provided for @products_Brodifacoum_usage_residential.
  ///
  /// In en, this message translates to:
  /// **'Place in and around premises, cold storage, godowns, warehouses'**
  String get products_Brodifacoum_usage_residential;

  /// No description provided for @products_ChlLambda_description.
  ///
  /// In en, this message translates to:
  /// **'A potent mix of diamide and pyrethroid for rapid and residual control.'**
  String get products_ChlLambda_description;

  /// No description provided for @products_ChlLambda_longDescription.
  ///
  /// In en, this message translates to:
  /// **'This combination formulation contains Chlorantraniliprole (a ryanodine receptor modulator) and Lambda-cyhalothrin (a sodium channel modulator). It provides both quick knockdown and long-lasting residual control of a wide range of pests including fruit borers, bollworms, leaf folders, jassids, and beetles in crops like pigeon pea, cotton, brinjal, and maize.'**
  String get products_ChlLambda_longDescription;

  /// No description provided for @products_ChlLambda_name.
  ///
  /// In en, this message translates to:
  /// **'Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC'**
  String get products_ChlLambda_name;

  /// No description provided for @products_ChlLambda_tag.
  ///
  /// In en, this message translates to:
  /// **'Combination ZC'**
  String get products_ChlLambda_tag;

  /// No description provided for @products_ChlLambda_usage_brinjal.
  ///
  /// In en, this message translates to:
  /// **'28 g a.i./ha (200 ml) in 500 L water (5 days waiting)'**
  String get products_ChlLambda_usage_brinjal;

  /// No description provided for @products_ChlLambda_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'37.5 g a.i./ha (250 ml) in 500 L water (20 days waiting)'**
  String get products_ChlLambda_usage_cotton;

  /// No description provided for @products_ChlLambda_usage_maize.
  ///
  /// In en, this message translates to:
  /// **'35 g a.i./ha (250 ml) in 500 L water (36 days waiting)'**
  String get products_ChlLambda_usage_maize;

  /// No description provided for @products_ChlLambda_usage_okra.
  ///
  /// In en, this message translates to:
  /// **'28 g a.i./ha (200 ml) in 500 L water (3 days waiting)'**
  String get products_ChlLambda_usage_okra;

  /// No description provided for @products_ChlLambda_usage_pigeonPea.
  ///
  /// In en, this message translates to:
  /// **'30 g a.i./ha (200 ml) in 500 L water (18 days waiting)'**
  String get products_ChlLambda_usage_pigeonPea;

  /// No description provided for @products_ChlLambda_usage_rice.
  ///
  /// In en, this message translates to:
  /// **'28-35 g a.i./ha (200-250 ml) in 500 L water (53 days waiting)'**
  String get products_ChlLambda_usage_rice;

  /// No description provided for @products_ChlLambda_usage_soybean.
  ///
  /// In en, this message translates to:
  /// **'28 g a.i./ha (200 ml) in 500 L water (41 days waiting)'**
  String get products_ChlLambda_usage_soybean;

  /// No description provided for @products_Chlorantraniliprole_description.
  ///
  /// In en, this message translates to:
  /// **'Targets lepidopteran pests by disrupting their muscle contraction.'**
  String get products_Chlorantraniliprole_description;

  /// No description provided for @products_Chlorantraniliprole_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Chlorantraniliprole 18.5% SC belongs to the anthranilic diamide class of insecticides. It works by activating the ryanodine receptors in insects, leading to uncontrolled muscle contraction, paralysis, and death. It is highly effective against stem borers, fruit borers, and caterpillars in crops like rice, cotton, and vegetables.'**
  String get products_Chlorantraniliprole_longDescription;

  /// No description provided for @products_Chlorantraniliprole_name.
  ///
  /// In en, this message translates to:
  /// **'Chlorantraniliprole 18.5% SC'**
  String get products_Chlorantraniliprole_name;

  /// No description provided for @products_Chlorantraniliprole_tag.
  ///
  /// In en, this message translates to:
  /// **'Anthranilic Diamide'**
  String get products_Chlorantraniliprole_tag;

  /// No description provided for @products_Chlorantraniliprole_usage_brinjal.
  ///
  /// In en, this message translates to:
  /// **'40 g a.i./ha (200 ml) in 500-750 L water (22 days waiting)'**
  String get products_Chlorantraniliprole_usage_brinjal;

  /// No description provided for @products_Chlorantraniliprole_usage_cabbage.
  ///
  /// In en, this message translates to:
  /// **'10 g a.i./ha (50 ml) in 500 L water (3 days waiting)'**
  String get products_Chlorantraniliprole_usage_cabbage;

  /// No description provided for @products_Chlorantraniliprole_usage_chilli.
  ///
  /// In en, this message translates to:
  /// **'30 g a.i./ha (150 ml) in 500 L water (3 days waiting)'**
  String get products_Chlorantraniliprole_usage_chilli;

  /// No description provided for @products_Chlorantraniliprole_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'30 g a.i./ha (150 ml) in 500 L water (9 days waiting)'**
  String get products_Chlorantraniliprole_usage_cotton;

  /// No description provided for @products_Chlorantraniliprole_usage_rice.
  ///
  /// In en, this message translates to:
  /// **'30 g a.i./ha (150 ml) in 500 L water (47 days waiting)'**
  String get products_Chlorantraniliprole_usage_rice;

  /// No description provided for @products_Chlorantraniliprole_usage_tomato.
  ///
  /// In en, this message translates to:
  /// **'30 g a.i./ha (150 ml) in 500 L water (3 days waiting)'**
  String get products_Chlorantraniliprole_usage_tomato;

  /// No description provided for @products_Cypermethrin_description.
  ///
  /// In en, this message translates to:
  /// **'A fast-acting, broad-spectrum insecticide for diverse crops.'**
  String get products_Cypermethrin_description;

  /// No description provided for @products_Cypermethrin_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Cypermethrin 10% EC is a synthetic pyrethroid insecticide that acts on the nervous system of insects, providing quick knockdown and kill. It is effective against a wide range of chewing and sucking pests, including bollworms, diamondback moths, fruit borers, and jassids in crops such as cotton, cabbage, okra, brinjal, and wheat.'**
  String get products_Cypermethrin_longDescription;

  /// No description provided for @products_Cypermethrin_name.
  ///
  /// In en, this message translates to:
  /// **'Cypermethrin 10% EC'**
  String get products_Cypermethrin_name;

  /// No description provided for @products_Cypermethrin_tag.
  ///
  /// In en, this message translates to:
  /// **'Pyrethroid'**
  String get products_Cypermethrin_tag;

  /// No description provided for @products_Cypermethrin_usage_brinjal.
  ///
  /// In en, this message translates to:
  /// **'50-70 g a.i./ha (550-760 ml) in 150-400 L water (3 days waiting)'**
  String get products_Cypermethrin_usage_brinjal;

  /// No description provided for @products_Cypermethrin_usage_cabbage.
  ///
  /// In en, this message translates to:
  /// **'60-70 g a.i./ha (650-760 ml) in 100-400 L water (7 days waiting)'**
  String get products_Cypermethrin_usage_cabbage;

  /// No description provided for @products_Cypermethrin_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'50-70 g a.i./ha (550-760 ml) in 150-1000 L water (7 days waiting)'**
  String get products_Cypermethrin_usage_cotton;

  /// No description provided for @products_Cypermethrin_usage_okra.
  ///
  /// In en, this message translates to:
  /// **'50-70 g a.i./ha (550-760 ml) in 150-400 L water (3 days waiting)'**
  String get products_Cypermethrin_usage_okra;

  /// No description provided for @products_Cypermethrin_usage_wheat.
  ///
  /// In en, this message translates to:
  /// **'50 g a.i./ha (550 ml) in 500-800 L water (14 days waiting)'**
  String get products_Cypermethrin_usage_wheat;

  /// No description provided for @products_Deltamethrin_description.
  ///
  /// In en, this message translates to:
  /// **'High-potency insecticide for agriculture and public health.'**
  String get products_Deltamethrin_description;

  /// No description provided for @products_Deltamethrin_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Deltamethrin 2.8% EC is a highly potent synthetic pyrethroid insecticide. It disrupts the nervous system of insects, causing immediate paralysis. It is used in agriculture to control bollworms, leaf folders, thrips, and borers, and in public health for mosquito control. Its high activity means lower dosage rates are required.'**
  String get products_Deltamethrin_longDescription;

  /// No description provided for @products_Deltamethrin_name.
  ///
  /// In en, this message translates to:
  /// **'Deltamethrin 2.8% EC'**
  String get products_Deltamethrin_name;

  /// No description provided for @products_Deltamethrin_tag.
  ///
  /// In en, this message translates to:
  /// **'Pyrethroid'**
  String get products_Deltamethrin_tag;

  /// No description provided for @products_Deltamethrin_usage_chilli.
  ///
  /// In en, this message translates to:
  /// **'10-12.5 g a.i./ha (400-500 ml) in 400-600 L water (5 days waiting)'**
  String get products_Deltamethrin_usage_chilli;

  /// No description provided for @products_Deltamethrin_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'12.5 g a.i./ha (500 ml) in 400-600 L water'**
  String get products_Deltamethrin_usage_cotton;

  /// No description provided for @products_Deltamethrin_usage_groundnut.
  ///
  /// In en, this message translates to:
  /// **'12.5 g a.i./ha (500 ml) in 400-600 L water (3 days waiting)'**
  String get products_Deltamethrin_usage_groundnut;

  /// No description provided for @products_Deltamethrin_usage_okra.
  ///
  /// In en, this message translates to:
  /// **'10-15 g a.i./ha (400-600 ml) in 400-600 L water (1 day waiting)'**
  String get products_Deltamethrin_usage_okra;

  /// No description provided for @products_Deltamethrin_usage_publicHealthMosquito.
  ///
  /// In en, this message translates to:
  /// **'Thermal fogging 0.5 g a.i./ha or ULV 0.5 g a.i./ha'**
  String get products_Deltamethrin_usage_publicHealthMosquito;

  /// No description provided for @products_Deltamethrin_usage_teaThrips.
  ///
  /// In en, this message translates to:
  /// **'3-4 g a.i./ha (120-150 ml) in 400-600 L water (3 days waiting)'**
  String get products_Deltamethrin_usage_teaThrips;

  /// No description provided for @products_Imidacloprid_description.
  ///
  /// In en, this message translates to:
  /// **'A systemic insecticide for long-lasting control of sucking pests.'**
  String get products_Imidacloprid_description;

  /// No description provided for @products_Imidacloprid_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Imidacloprid 70% WG is a systemic insecticide from the neonicotinoid group. It is absorbed by plants and moves through the vascular system, providing long-lasting protection against sap-feeding insects. It is highly effective against jassids, aphids, thrips, and whiteflies in cotton, rice, vegetables, and other crops.'**
  String get products_Imidacloprid_longDescription;

  /// No description provided for @products_Imidacloprid_name.
  ///
  /// In en, this message translates to:
  /// **'Imidacloprid 70% WG'**
  String get products_Imidacloprid_name;

  /// No description provided for @products_Imidacloprid_tag.
  ///
  /// In en, this message translates to:
  /// **'Neonicotinoid'**
  String get products_Imidacloprid_tag;

  /// No description provided for @products_Imidacloprid_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'21-24.5 g a.i./ha (30-35 g) in 375-500 L water (7 days waiting)'**
  String get products_Imidacloprid_usage_cotton;

  /// No description provided for @products_Imidacloprid_usage_cucumber.
  ///
  /// In en, this message translates to:
  /// **'24.5 g a.i./ha (35 g) in 500 L water (5 days waiting)'**
  String get products_Imidacloprid_usage_cucumber;

  /// No description provided for @products_Imidacloprid_usage_okra.
  ///
  /// In en, this message translates to:
  /// **'21-24.5 g a.i./ha (30-35 g) in 300-375 L water (3 days waiting)'**
  String get products_Imidacloprid_usage_okra;

  /// No description provided for @products_Imidacloprid_usage_potato.
  ///
  /// In en, this message translates to:
  /// **'63 g a.i./ha (90 g) in 500 L water (30 days waiting)'**
  String get products_Imidacloprid_usage_potato;

  /// No description provided for @products_Imidacloprid_usage_rice.
  ///
  /// In en, this message translates to:
  /// **'21-24.5 g a.i./ha (30-35 g) in 300-375 L water (7 days waiting)'**
  String get products_Imidacloprid_usage_rice;

  /// No description provided for @products_Imidacloprid_usage_tomato.
  ///
  /// In en, this message translates to:
  /// **'35 g a.i./ha (50 g) in 500 L water (5 days waiting)'**
  String get products_Imidacloprid_usage_tomato;

  /// No description provided for @products_LambdaCS_description.
  ///
  /// In en, this message translates to:
  /// **'A microencapsulated formulation for effective mosquito control.'**
  String get products_LambdaCS_description;

  /// No description provided for @products_LambdaCS_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Lambda-cyhalothrin 9.7% CS is a public health insecticide formulated for indoor residual spraying (IRS). Its microencapsulation technology provides a safer and longer-lasting residual effect on various wall surfaces. It is specifically recommended for controlling mosquitoes that transmit malaria, dengue, and other vector-borne diseases.'**
  String get products_LambdaCS_longDescription;

  /// No description provided for @products_LambdaCS_name.
  ///
  /// In en, this message translates to:
  /// **'Lambda-cyhalothrin 9.7% CS'**
  String get products_LambdaCS_name;

  /// No description provided for @products_LambdaCS_tag.
  ///
  /// In en, this message translates to:
  /// **'Public Health Insecticide'**
  String get products_LambdaCS_tag;

  /// No description provided for @products_LambdaCS_usage_highInfestation.
  ///
  /// In en, this message translates to:
  /// **'25 mg a.i./sq.m (5 ml/L water) spray solution 50 ml/sq.m'**
  String get products_LambdaCS_usage_highInfestation;

  /// No description provided for @products_LambdaCS_usage_malariaControl.
  ///
  /// In en, this message translates to:
  /// **'25 mg a.i./sq.m (12.5 ml/500 sq.m) in 10 L water'**
  String get products_LambdaCS_usage_malariaControl;

  /// No description provided for @products_LambdaCS_usage_moderateInfestation.
  ///
  /// In en, this message translates to:
  /// **'20 mg a.i./sq.m (4 ml/L water) spray solution 50 ml/sq.m'**
  String get products_LambdaCS_usage_moderateInfestation;

  /// No description provided for @products_MiticideViricideCombo_description.
  ///
  /// In en, this message translates to:
  /// **'A powerful combination of miticide and viricide to protect crops from mites and viral diseases.'**
  String get products_MiticideViricideCombo_description;

  /// No description provided for @products_MiticideViricideCombo_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Miticide + Lysorus Viricide Combo provides dual protection against harmful mites and viral infections in crops.'**
  String get products_MiticideViricideCombo_longDescription;

  /// No description provided for @products_MiticideViricideCombo_name.
  ///
  /// In en, this message translates to:
  /// **'Miticide + Lysorus Viricide Combo'**
  String get products_MiticideViricideCombo_name;

  /// No description provided for @products_MiticideViricideCombo_tag.
  ///
  /// In en, this message translates to:
  /// **'Crop Protection Combo'**
  String get products_MiticideViricideCombo_tag;

  /// No description provided for @products_MiticideViricideCombo_usage_foliarSpray.
  ///
  /// In en, this message translates to:
  /// **'2-3 ml per liter of water'**
  String get products_MiticideViricideCombo_usage_foliarSpray;

  /// No description provided for @products_NAA_description.
  ///
  /// In en, this message translates to:
  /// **'Prevents flower and fruit drop in a wide range of crops.'**
  String get products_NAA_description;

  /// No description provided for @products_NAA_longDescription.
  ///
  /// In en, this message translates to:
  /// **'NAA (Naphthalene Acetic Acid) 4.5% SL is a synthetic plant hormone in the auxin family. It is primarily used to prevent the premature shedding of flowers, squares, and bolls, thereby improving fruit set and overall yield. It is effective in crops like cotton, tomatoes, and mangoes.'**
  String get products_NAA_longDescription;

  /// No description provided for @products_NAA_name.
  ///
  /// In en, this message translates to:
  /// **'NAA 4.5% SL'**
  String get products_NAA_name;

  /// No description provided for @products_NAA_tag.
  ///
  /// In en, this message translates to:
  /// **'Plant Growth Regulator'**
  String get products_NAA_tag;

  /// No description provided for @products_NAA_usage_cotton.
  ///
  /// In en, this message translates to:
  /// **'222-444 ml in 1000 L water per ha (3 sprays from square formation)'**
  String get products_NAA_usage_cotton;

  /// No description provided for @products_NAA_usage_mango.
  ///
  /// In en, this message translates to:
  /// **'15 ml formulation per 100 L water (pre-harvest spray)'**
  String get products_NAA_usage_mango;

  /// No description provided for @products_NAA_usage_tomato.
  ///
  /// In en, this message translates to:
  /// **'20-40 ml in 1000 L water per ha (at flowering and fruit set)'**
  String get products_NAA_usage_tomato;

  /// No description provided for @products_PrallethrinLV_description.
  ///
  /// In en, this message translates to:
  /// **'A fast-acting liquid vaporizer for immediate mosquito protection.'**
  String get products_PrallethrinLV_description;

  /// No description provided for @products_PrallethrinLV_longDescription.
  ///
  /// In en, this message translates to:
  /// **'This liquid vaporizer contains Prallethrin, a synthetic pyrethroid known for its rapid knockdown effect against mosquitoes. It is highly effective in eliminating mosquitoes quickly and providing a comfortable environment. It is safe for use in homes when used as directed.'**
  String get products_PrallethrinLV_longDescription;

  /// No description provided for @products_PrallethrinLV_name.
  ///
  /// In en, this message translates to:
  /// **'Prallethrin 0.65% Liquid Vaporizer'**
  String get products_PrallethrinLV_name;

  /// No description provided for @products_PrallethrinLV_tag.
  ///
  /// In en, this message translates to:
  /// **'Household Insecticide'**
  String get products_PrallethrinLV_tag;

  /// No description provided for @products_PrallethrinLV_usage_area.
  ///
  /// In en, this message translates to:
  /// **'Effective for rooms up to 300-400 sq.ft'**
  String get products_PrallethrinLV_usage_area;

  /// No description provided for @products_PrallethrinLV_usage_indoor.
  ///
  /// In en, this message translates to:
  /// **'Use with standard liquid vaporizer machine, one refill provides 30-45 nights protection'**
  String get products_PrallethrinLV_usage_indoor;

  /// No description provided for @products_RupiyaKuber_description.
  ///
  /// In en, this message translates to:
  /// **'A natural liquid manure supplement providing balanced potassium, carbon, and magnesium to the crop.'**
  String get products_RupiyaKuber_description;

  /// No description provided for @products_RupiyaKuber_longDescription.
  ///
  /// In en, this message translates to:
  /// **'It\'s a natural liquid manure supplement which provides balanced amounts of potassium, carbon and magnesium to the crop. Increases productivity and quality of crops by enhancing the process of photosynthesis and pollen germination.'**
  String get products_RupiyaKuber_longDescription;

  /// No description provided for @products_RupiyaKuber_name.
  ///
  /// In en, this message translates to:
  /// **'Rupiya Kuber'**
  String get products_RupiyaKuber_name;

  /// No description provided for @products_RupiyaKuber_tag.
  ///
  /// In en, this message translates to:
  /// **'Liquid Manure Supplement'**
  String get products_RupiyaKuber_tag;

  /// No description provided for @products_RupiyaKuber_usage_dripIrrigation.
  ///
  /// In en, this message translates to:
  /// **'10-15 liters per acre'**
  String get products_RupiyaKuber_usage_dripIrrigation;

  /// No description provided for @products_RupiyaKuber_usage_foliarSpray.
  ///
  /// In en, this message translates to:
  /// **'5-10 ml per liter of water'**
  String get products_RupiyaKuber_usage_foliarSpray;

  /// No description provided for @products_TapasSiliconAdjuvant_description.
  ///
  /// In en, this message translates to:
  /// **'A silicon-based adjuvant that enhances pesticide efficiency and strengthens plant defense.'**
  String get products_TapasSiliconAdjuvant_description;

  /// No description provided for @products_TapasSiliconAdjuvant_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Tapas Silicon Adjuvant improves the effectiveness of pesticides and foliar sprays.'**
  String get products_TapasSiliconAdjuvant_longDescription;

  /// No description provided for @products_TapasSiliconAdjuvant_name.
  ///
  /// In en, this message translates to:
  /// **'Tapas Silicon Adjuvant'**
  String get products_TapasSiliconAdjuvant_name;

  /// No description provided for @products_TapasSiliconAdjuvant_tag.
  ///
  /// In en, this message translates to:
  /// **'Silicon-Based Adjuvant'**
  String get products_TapasSiliconAdjuvant_tag;

  /// No description provided for @products_TapasSiliconAdjuvant_usage_foliarSpray.
  ///
  /// In en, this message translates to:
  /// **'0.5-1 ml per liter of water'**
  String get products_TapasSiliconAdjuvant_usage_foliarSpray;

  /// No description provided for @products_Temephos_description.
  ///
  /// In en, this message translates to:
  /// **'A larvicide for controlling mosquito breeding in water bodies.'**
  String get products_Temephos_description;

  /// No description provided for @products_Temephos_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Temephos 1% GR is an organophosphate larvicide used in public health programs to control mosquito larvae. It is applied to breeding habitats such as stagnant water, ponds, drains, and containers to prevent the emergence of adult mosquitoes. It is highly effective against Aedes, Anopheles, and Culex species.'**
  String get products_Temephos_longDescription;

  /// No description provided for @products_Temephos_name.
  ///
  /// In en, this message translates to:
  /// **'Temephos 1% GR'**
  String get products_Temephos_name;

  /// No description provided for @products_Temephos_tag.
  ///
  /// In en, this message translates to:
  /// **'Larvicide'**
  String get products_Temephos_tag;

  /// No description provided for @products_Temephos_usage_cleanWater.
  ///
  /// In en, this message translates to:
  /// **'50-100 g a.i./ha (5-10 kg/ha) for ponds, lakes'**
  String get products_Temephos_usage_cleanWater;

  /// No description provided for @products_Temephos_usage_cyclopsControl.
  ///
  /// In en, this message translates to:
  /// **'0.5-1.0 g a.i. (5-10 g) for ponds, step wells'**
  String get products_Temephos_usage_cyclopsControl;

  /// No description provided for @products_Temephos_usage_highlyPolluted.
  ///
  /// In en, this message translates to:
  /// **'200-500 g a.i./ha (20-50 kg/ha) for drains, cesspits'**
  String get products_Temephos_usage_highlyPolluted;

  /// No description provided for @products_Temephos_usage_moderatelyPolluted.
  ///
  /// In en, this message translates to:
  /// **'100-200 g a.i./ha (10-20 kg/ha) for marshes, swamps'**
  String get products_Temephos_usage_moderatelyPolluted;

  /// No description provided for @products_Thiamethoxam_description.
  ///
  /// In en, this message translates to:
  /// **'Systemic insecticide with rapid action for comprehensive crop protection.'**
  String get products_Thiamethoxam_description;

  /// No description provided for @products_Thiamethoxam_longDescription.
  ///
  /// In en, this message translates to:
  /// **'Thiamethoxam 25% WG is a second-generation neonicotinoid insecticide with excellent systemic and translaminar activity. It works by interfering with nicotinic acetylcholine receptors in the insect nervous system. It is effective against a broad spectrum of sucking and some chewing pests in rice, cotton, vegetables, and mangoes.'**
  String get products_Thiamethoxam_longDescription;

  /// No description provided for @products_Thiamethoxam_name.
  ///
  /// In en, this message translates to:
  /// **'Thiamethoxam 25% WG'**
  String get products_Thiamethoxam_name;

  /// No description provided for @products_Thiamethoxam_tag.
  ///
  /// In en, this message translates to:
  /// **'Neonicotinoid'**
  String get products_Thiamethoxam_tag;

  /// No description provided for @products_Thiamethoxam_usage_cottonJassid.
  ///
  /// In en, this message translates to:
  /// **'25 g a.i./ha (100 g) in 500-750 L water (21 days waiting)'**
  String get products_Thiamethoxam_usage_cottonJassid;

  /// No description provided for @products_Thiamethoxam_usage_cottonWhitefly.
  ///
  /// In en, this message translates to:
  /// **'50 g a.i./ha (200 g) in 500-750 L water (21 days waiting)'**
  String get products_Thiamethoxam_usage_cottonWhitefly;

  /// No description provided for @products_Thiamethoxam_usage_mango.
  ///
  /// In en, this message translates to:
  /// **'25 g a.i./ha (100 g) in 1000 L water (30 days waiting)'**
  String get products_Thiamethoxam_usage_mango;

  /// No description provided for @products_Thiamethoxam_usage_okra.
  ///
  /// In en, this message translates to:
  /// **'25 g a.i./ha (100 g) in 500-1000 L water (5 days waiting)'**
  String get products_Thiamethoxam_usage_okra;

  /// No description provided for @products_Thiamethoxam_usage_rice.
  ///
  /// In en, this message translates to:
  /// **'25 g a.i./ha (100 g) in 500-750 L water (14 days waiting)'**
  String get products_Thiamethoxam_usage_rice;

  /// No description provided for @products_Thiamethoxam_usage_wheat.
  ///
  /// In en, this message translates to:
  /// **'12.5 g a.i./ha (50 g) in 500 L water (21 days waiting)'**
  String get products_Thiamethoxam_usage_wheat;

  /// No description provided for @products_TransfluthrinLV_description.
  ///
  /// In en, this message translates to:
  /// **'A ready-to-use liquid vaporizer for mosquito-free homes.'**
  String get products_TransfluthrinLV_description;

  /// No description provided for @products_TransfluthrinLV_longDescription.
  ///
  /// In en, this message translates to:
  /// **'This is a ready-to-use household insecticide in a liquid vaporizer format. It contains Transfluthrin, a fast-acting pyrethroid that effectively repels and kills mosquitoes (Aedes, Anopheles, Culex) and houseflies. It provides a convenient and continuous protection system for indoor use.'**
  String get products_TransfluthrinLV_longDescription;

  /// No description provided for @products_TransfluthrinLV_name.
  ///
  /// In en, this message translates to:
  /// **'Transfluthrin 0.88% Liquid Vaporizer'**
  String get products_TransfluthrinLV_name;

  /// No description provided for @products_TransfluthrinLV_tag.
  ///
  /// In en, this message translates to:
  /// **'Household Insecticide'**
  String get products_TransfluthrinLV_tag;

  /// No description provided for @products_TransfluthrinLV_usage_area.
  ///
  /// In en, this message translates to:
  /// **'Effective for rooms up to 300-400 sq.ft'**
  String get products_TransfluthrinLV_usage_area;

  /// No description provided for @products_TransfluthrinLV_usage_indoor.
  ///
  /// In en, this message translates to:
  /// **'Use with standard liquid vaporizer machine, one refill provides 30-45 nights protection'**
  String get products_TransfluthrinLV_usage_indoor;

  /// No description provided for @profitPredictor_autoFetchDesc.
  ///
  /// In en, this message translates to:
  /// **'Retrieving weather and environmental data'**
  String get profitPredictor_autoFetchDesc;

  /// No description provided for @profitPredictor_autoFetchTitle.
  ///
  /// In en, this message translates to:
  /// **'Auto-fetching data...'**
  String get profitPredictor_autoFetchTitle;

  /// No description provided for @profitPredictor_confidence.
  ///
  /// In en, this message translates to:
  /// **'Confidence'**
  String get profitPredictor_confidence;

  /// No description provided for @profitPredictor_cropType.
  ///
  /// In en, this message translates to:
  /// **'Crop Type'**
  String get profitPredictor_cropType;

  /// No description provided for @profitPredictor_description.
  ///
  /// In en, this message translates to:
  /// **'Calculate your expected profit based on farm inputs and market rates.'**
  String get profitPredictor_description;

  /// No description provided for @profitPredictor_developerPanel.
  ///
  /// In en, this message translates to:
  /// **'Developer Debug Panel'**
  String get profitPredictor_developerPanel;

  /// No description provided for @profitPredictor_expectedRevenue.
  ///
  /// In en, this message translates to:
  /// **'Expected Revenue'**
  String get profitPredictor_expectedRevenue;

  /// No description provided for @profitPredictor_fertilizerCost.
  ///
  /// In en, this message translates to:
  /// **'Fertilizer Cost'**
  String get profitPredictor_fertilizerCost;

  /// No description provided for @profitPredictor_insights_costWarning.
  ///
  /// In en, this message translates to:
  /// **'Your pesticide costs seem higher than regional averages.'**
  String get profitPredictor_insights_costWarning;

  /// No description provided for @profitPredictor_insights_goodProfit.
  ///
  /// In en, this message translates to:
  /// **'Your estimated profit is healthy for this crop!'**
  String get profitPredictor_insights_goodProfit;

  /// No description provided for @profitPredictor_insights_optimize.
  ///
  /// In en, this message translates to:
  /// **'Switching to organic fertilizer may reduce input costs.'**
  String get profitPredictor_insights_optimize;

  /// No description provided for @profitPredictor_irrigationCost.
  ///
  /// In en, this message translates to:
  /// **'Irrigation Cost'**
  String get profitPredictor_irrigationCost;

  /// No description provided for @profitPredictor_landArea.
  ///
  /// In en, this message translates to:
  /// **'Land Area'**
  String get profitPredictor_landArea;

  /// No description provided for @profitPredictor_locationSelected.
  ///
  /// In en, this message translates to:
  /// **'Location selected'**
  String get profitPredictor_locationSelected;

  /// No description provided for @profitPredictor_manualMode.
  ///
  /// In en, this message translates to:
  /// **'Manual Mode'**
  String get profitPredictor_manualMode;

  /// No description provided for @profitPredictor_pesticideCost.
  ///
  /// In en, this message translates to:
  /// **'Pesticide Cost'**
  String get profitPredictor_pesticideCost;

  /// No description provided for @profitPredictor_predictButton.
  ///
  /// In en, this message translates to:
  /// **'Predict Profit'**
  String get profitPredictor_predictButton;

  /// No description provided for @profitPredictor_predictedProfit.
  ///
  /// In en, this message translates to:
  /// **'Predicted Profit'**
  String get profitPredictor_predictedProfit;

  /// No description provided for @profitPredictor_predicting.
  ///
  /// In en, this message translates to:
  /// **'Predicting...'**
  String get profitPredictor_predicting;

  /// No description provided for @profitPredictor_predictionError.
  ///
  /// In en, this message translates to:
  /// **'Failed to calculate prediction.'**
  String get profitPredictor_predictionError;

  /// No description provided for @profitPredictor_predictionSuccess.
  ///
  /// In en, this message translates to:
  /// **'Profit prediction complete!'**
  String get profitPredictor_predictionSuccess;

  /// No description provided for @profitPredictor_rainfall.
  ///
  /// In en, this message translates to:
  /// **'Rainfall'**
  String get profitPredictor_rainfall;

  /// No description provided for @profitPredictor_readyToPredict.
  ///
  /// In en, this message translates to:
  /// **'Ready to predict your profit?'**
  String get profitPredictor_readyToPredict;

  /// No description provided for @profitPredictor_readyToPredictDesc.
  ///
  /// In en, this message translates to:
  /// **'Fill out the form on the left with your land area and input costs to get AI-powered profit insights.'**
  String get profitPredictor_readyToPredictDesc;

  /// No description provided for @profitPredictor_recommendation.
  ///
  /// In en, this message translates to:
  /// **'Recommendation'**
  String get profitPredictor_recommendation;

  /// No description provided for @profitPredictor_selectCrop.
  ///
  /// In en, this message translates to:
  /// **'Select Crop'**
  String get profitPredictor_selectCrop;

  /// No description provided for @profitPredictor_selectLocation.
  ///
  /// In en, this message translates to:
  /// **'Select your farm location'**
  String get profitPredictor_selectLocation;

  /// No description provided for @profitPredictor_smartMode.
  ///
  /// In en, this message translates to:
  /// **'Smart Mode'**
  String get profitPredictor_smartMode;

  /// No description provided for @profitPredictor_soilNitrogen.
  ///
  /// In en, this message translates to:
  /// **'Soil Nitrogen'**
  String get profitPredictor_soilNitrogen;

  /// No description provided for @profitPredictor_soilPhosphorus.
  ///
  /// In en, this message translates to:
  /// **'Soil Phosphorus'**
  String get profitPredictor_soilPhosphorus;

  /// No description provided for @profitPredictor_soilPotassium.
  ///
  /// In en, this message translates to:
  /// **'Soil Potassium'**
  String get profitPredictor_soilPotassium;

  /// No description provided for @profitPredictor_title.
  ///
  /// In en, this message translates to:
  /// **'Profit Predictor'**
  String get profitPredictor_title;

  /// No description provided for @profitPredictor_totalCost.
  ///
  /// In en, this message translates to:
  /// **'Total Cost'**
  String get profitPredictor_totalCost;

  /// No description provided for @schemesAll.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get schemesAll;

  /// No description provided for @schemesBenefits.
  ///
  /// In en, this message translates to:
  /// **'What you get'**
  String get schemesBenefits;

  /// No description provided for @schemesCuratedNote.
  ///
  /// In en, this message translates to:
  /// **'A hand-checked list, not a live government feed. Always confirm details on the official site.'**
  String get schemesCuratedNote;

  /// No description provided for @schemesEligibility.
  ///
  /// In en, this message translates to:
  /// **'Who can apply'**
  String get schemesEligibility;

  /// No description provided for @schemesLaunched.
  ///
  /// In en, this message translates to:
  /// **'Started {when}'**
  String schemesLaunched(String when);

  /// No description provided for @schemesNone.
  ///
  /// In en, this message translates to:
  /// **'No schemes match that search'**
  String get schemesNone;

  /// No description provided for @schemesOpen.
  ///
  /// In en, this message translates to:
  /// **'Open official website'**
  String get schemesOpen;

  /// No description provided for @schemesSearch.
  ///
  /// In en, this message translates to:
  /// **'Search schemes'**
  String get schemesSearch;

  /// No description provided for @schemesTitle.
  ///
  /// In en, this message translates to:
  /// **'Government schemes'**
  String get schemesTitle;

  /// No description provided for @weatherFeels.
  ///
  /// In en, this message translates to:
  /// **'Feels like {value}°'**
  String weatherFeels(String value);

  /// No description provided for @weatherForecast.
  ///
  /// In en, this message translates to:
  /// **'Next days'**
  String get weatherForecast;

  /// No description provided for @weatherHeatWarn.
  ///
  /// In en, this message translates to:
  /// **'Very hot. Irrigate early morning or evening.'**
  String get weatherHeatWarn;

  /// No description provided for @weatherHumidity.
  ///
  /// In en, this message translates to:
  /// **'Humidity'**
  String get weatherHumidity;

  /// No description provided for @weatherLocating.
  ///
  /// In en, this message translates to:
  /// **'Finding your location'**
  String get weatherLocating;

  /// No description provided for @weatherLocationDenied.
  ///
  /// In en, this message translates to:
  /// **'Location is off. Search for your village instead.'**
  String get weatherLocationDenied;

  /// No description provided for @weatherPage_allowLocation.
  ///
  /// In en, this message translates to:
  /// **'Allow location access when prompted'**
  String get weatherPage_allowLocation;

  /// No description provided for @weatherPage_cloudCover.
  ///
  /// In en, this message translates to:
  /// **'Cloud Cover'**
  String get weatherPage_cloudCover;

  /// No description provided for @weatherPage_detectingLocation.
  ///
  /// In en, this message translates to:
  /// **'Detecting your location…'**
  String get weatherPage_detectingLocation;

  /// No description provided for @weatherPage_failedFetch.
  ///
  /// In en, this message translates to:
  /// **'Failed to fetch weather'**
  String get weatherPage_failedFetch;

  /// No description provided for @weatherPage_feelsLike.
  ///
  /// In en, this message translates to:
  /// **'Feels like'**
  String get weatherPage_feelsLike;

  /// No description provided for @weatherPage_fetchingWeather.
  ///
  /// In en, this message translates to:
  /// **'Fetching weather…'**
  String get weatherPage_fetchingWeather;

  /// No description provided for @weatherPage_gettingConditions.
  ///
  /// In en, this message translates to:
  /// **'Getting the latest conditions'**
  String get weatherPage_gettingConditions;

  /// No description provided for @weatherPage_gustSpeed.
  ///
  /// In en, this message translates to:
  /// **'Gust Speed'**
  String get weatherPage_gustSpeed;

  /// No description provided for @weatherPage_humidity.
  ///
  /// In en, this message translates to:
  /// **'Humidity'**
  String get weatherPage_humidity;

  /// No description provided for @weatherPage_locationDeniedDesc.
  ///
  /// In en, this message translates to:
  /// **'Enable location in your browser settings, or search for a city below.'**
  String get weatherPage_locationDeniedDesc;

  /// No description provided for @weatherPage_locationDeniedTitle.
  ///
  /// In en, this message translates to:
  /// **'Location access denied'**
  String get weatherPage_locationDeniedTitle;

  /// No description provided for @weatherPage_noLocationDesc.
  ///
  /// In en, this message translates to:
  /// **'Click the locate button to use your current location, or search for any city above.'**
  String get weatherPage_noLocationDesc;

  /// No description provided for @weatherPage_noLocationTitle.
  ///
  /// In en, this message translates to:
  /// **'No location selected'**
  String get weatherPage_noLocationTitle;

  /// No description provided for @weatherPage_pressure.
  ///
  /// In en, this message translates to:
  /// **'Pressure'**
  String get weatherPage_pressure;

  /// No description provided for @weatherPage_rain.
  ///
  /// In en, this message translates to:
  /// **'Rain'**
  String get weatherPage_rain;

  /// No description provided for @weatherPage_searchBtn.
  ///
  /// In en, this message translates to:
  /// **'Search'**
  String get weatherPage_searchBtn;

  /// No description provided for @weatherPage_searchManually.
  ///
  /// In en, this message translates to:
  /// **'Search manually instead'**
  String get weatherPage_searchManually;

  /// No description provided for @weatherPage_searchPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'City, region or country…'**
  String get weatherPage_searchPlaceholder;

  /// No description provided for @weatherPage_subtitle.
  ///
  /// In en, this message translates to:
  /// **'Real-time conditions for any location'**
  String get weatherPage_subtitle;

  /// No description provided for @weatherPage_title.
  ///
  /// In en, this message translates to:
  /// **'Weather'**
  String get weatherPage_title;

  /// No description provided for @weatherPage_useMyLocation.
  ///
  /// In en, this message translates to:
  /// **'Use My Location'**
  String get weatherPage_useMyLocation;

  /// No description provided for @weatherPage_useMyLocationTitle.
  ///
  /// In en, this message translates to:
  /// **'Use my location'**
  String get weatherPage_useMyLocationTitle;

  /// No description provided for @weatherPage_uvHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get weatherPage_uvHigh;

  /// No description provided for @weatherPage_uvIndex.
  ///
  /// In en, this message translates to:
  /// **'UV Index'**
  String get weatherPage_uvIndex;

  /// No description provided for @weatherPage_uvLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get weatherPage_uvLow;

  /// No description provided for @weatherPage_uvModerate.
  ///
  /// In en, this message translates to:
  /// **'Moderate'**
  String get weatherPage_uvModerate;

  /// No description provided for @weatherPage_uvVeryHigh.
  ///
  /// In en, this message translates to:
  /// **'Very High'**
  String get weatherPage_uvVeryHigh;

  /// No description provided for @weatherPage_visibility.
  ///
  /// In en, this message translates to:
  /// **'Visibility'**
  String get weatherPage_visibility;

  /// No description provided for @weatherPage_wind.
  ///
  /// In en, this message translates to:
  /// **'Wind'**
  String get weatherPage_wind;

  /// No description provided for @weatherRain.
  ///
  /// In en, this message translates to:
  /// **'{value}% chance of rain'**
  String weatherRain(String value);

  /// No description provided for @weatherSearchHint.
  ///
  /// In en, this message translates to:
  /// **'Village, town or district'**
  String get weatherSearchHint;

  /// No description provided for @weatherSprayWarn.
  ///
  /// In en, this message translates to:
  /// **'Rain expected — do not spray today.'**
  String get weatherSprayWarn;

  /// No description provided for @weatherTips_clear.
  ///
  /// In en, this message translates to:
  /// **'✅ Clear skies — good conditions for field work & spraying fertilizers.'**
  String get weatherTips_clear;

  /// No description provided for @weatherTips_extremeHeat.
  ///
  /// In en, this message translates to:
  /// **'🔥 Extreme heat — water crops early morning, shade young plants.'**
  String get weatherTips_extremeHeat;

  /// No description provided for @weatherTips_foggy.
  ///
  /// In en, this message translates to:
  /// **'🌫️ Foggy morning — delay pesticide spraying until fog clears.'**
  String get weatherTips_foggy;

  /// No description provided for @weatherTips_frost.
  ///
  /// In en, this message translates to:
  /// **'❄️ Near-frost — cover sensitive crops overnight to prevent damage.'**
  String get weatherTips_frost;

  /// No description provided for @weatherTips_heavyRainWind.
  ///
  /// In en, this message translates to:
  /// **'🌧️ Heavy rain + strong winds — postpone spraying & harvesting.'**
  String get weatherTips_heavyRainWind;

  /// No description provided for @weatherTips_highHeatUV.
  ///
  /// In en, this message translates to:
  /// **'☀️ High heat & UV — irrigate at dawn/dusk, protect workers too.'**
  String get weatherTips_highHeatUV;

  /// No description provided for @weatherTips_highHumidity.
  ///
  /// In en, this message translates to:
  /// **'💧 High humidity — watch for fungal disease, ensure good airflow.'**
  String get weatherTips_highHumidity;

  /// No description provided for @weatherTips_moderate.
  ///
  /// In en, this message translates to:
  /// **'🌱 Moderate conditions — suitable for routine farm activities today.'**
  String get weatherTips_moderate;

  /// No description provided for @weatherTips_rain.
  ///
  /// In en, this message translates to:
  /// **'🌧️ Rain today — skip irrigation, ideal to transplant seedlings.'**
  String get weatherTips_rain;

  /// No description provided for @weatherTips_storm.
  ///
  /// In en, this message translates to:
  /// **'⚡ Storm alert — avoid fieldwork, secure crops & equipment now.'**
  String get weatherTips_storm;

  /// No description provided for @weatherTips_strongWind.
  ///
  /// In en, this message translates to:
  /// **'💨 Strong winds — avoid spraying, secure mulch & shade nets.'**
  String get weatherTips_strongWind;

  /// No description provided for @weatherTips_sunnyClear.
  ///
  /// In en, this message translates to:
  /// **'🌤️ Good sunny day — great for harvesting & drying grains.'**
  String get weatherTips_sunnyClear;

  /// No description provided for @weatherUseLocation.
  ///
  /// In en, this message translates to:
  /// **'Use my location'**
  String get weatherUseLocation;

  /// No description provided for @weatherWind.
  ///
  /// In en, this message translates to:
  /// **'Wind'**
  String get weatherWind;

  /// No description provided for @weatherWindWarn.
  ///
  /// In en, this message translates to:
  /// **'Strong wind — spray will drift. Wait for calmer air.'**
  String get weatherWindWarn;

  /// No description provided for @yieldPredictor_areaRequired.
  ///
  /// In en, this message translates to:
  /// **'Valid land area is required'**
  String get yieldPredictor_areaRequired;

  /// No description provided for @yieldPredictor_averageRegional.
  ///
  /// In en, this message translates to:
  /// **'Regional Average'**
  String get yieldPredictor_averageRegional;

  /// No description provided for @yieldPredictor_baseYield.
  ///
  /// In en, this message translates to:
  /// **'Base yield'**
  String get yieldPredictor_baseYield;

  /// No description provided for @yieldPredictor_comparisonChart.
  ///
  /// In en, this message translates to:
  /// **'Yield Comparison'**
  String get yieldPredictor_comparisonChart;

  /// No description provided for @yieldPredictor_cropType.
  ///
  /// In en, this message translates to:
  /// **'Crop Type'**
  String get yieldPredictor_cropType;

  /// No description provided for @yieldPredictor_cropTypeRequired.
  ///
  /// In en, this message translates to:
  /// **'Crop type is required'**
  String get yieldPredictor_cropTypeRequired;

  /// No description provided for @yieldPredictor_description.
  ///
  /// In en, this message translates to:
  /// **'Enter environmental data to predict expected crop yield.'**
  String get yieldPredictor_description;

  /// No description provided for @yieldPredictor_dry.
  ///
  /// In en, this message translates to:
  /// **'Dry'**
  String get yieldPredictor_dry;

  /// No description provided for @yieldPredictor_enterArea.
  ///
  /// In en, this message translates to:
  /// **'Enter area'**
  String get yieldPredictor_enterArea;

  /// No description provided for @yieldPredictor_environmental.
  ///
  /// In en, this message translates to:
  /// **'Environmental Data'**
  String get yieldPredictor_environmental;

  /// No description provided for @yieldPredictor_expandMap.
  ///
  /// In en, this message translates to:
  /// **'Expand'**
  String get yieldPredictor_expandMap;

  /// No description provided for @yieldPredictor_farmInputs.
  ///
  /// In en, this message translates to:
  /// **'Farm-specific inputs'**
  String get yieldPredictor_farmInputs;

  /// No description provided for @yieldPredictor_landArea.
  ///
  /// In en, this message translates to:
  /// **'Land Area'**
  String get yieldPredictor_landArea;

  /// No description provided for @yieldPredictor_mapInstruction.
  ///
  /// In en, this message translates to:
  /// **'Click on your farm to auto-fetch weather & predict yield'**
  String get yieldPredictor_mapInstruction;

  /// No description provided for @yieldPredictor_ndvi.
  ///
  /// In en, this message translates to:
  /// **'NDVI (Vegetation Index)'**
  String get yieldPredictor_ndvi;

  /// No description provided for @yieldPredictor_ndviHigh.
  ///
  /// In en, this message translates to:
  /// **'Dense vegetation'**
  String get yieldPredictor_ndviHigh;

  /// No description provided for @yieldPredictor_ndviLow.
  ///
  /// In en, this message translates to:
  /// **'Bare soil'**
  String get yieldPredictor_ndviLow;

  /// No description provided for @yieldPredictor_pageDescription.
  ///
  /// In en, this message translates to:
  /// **'Click any farm location on the map. Our Auto-Pilot will instantly fetch live weather, run satellite parameters, and use TensorFlow.js to predict your harvest yield.'**
  String get yieldPredictor_pageDescription;

  /// No description provided for @yieldPredictor_pageTitle.
  ///
  /// In en, this message translates to:
  /// **'Kisan AI Auto-Pilot'**
  String get yieldPredictor_pageTitle;

  /// No description provided for @yieldPredictor_predictButton.
  ///
  /// In en, this message translates to:
  /// **'Predict Yield'**
  String get yieldPredictor_predictButton;

  /// No description provided for @yieldPredictor_predictYield.
  ///
  /// In en, this message translates to:
  /// **'Predict Yield'**
  String get yieldPredictor_predictYield;

  /// No description provided for @yieldPredictor_predictedYield.
  ///
  /// In en, this message translates to:
  /// **'Predicted Yield'**
  String get yieldPredictor_predictedYield;

  /// No description provided for @yieldPredictor_predicting.
  ///
  /// In en, this message translates to:
  /// **'Predicting...'**
  String get yieldPredictor_predicting;

  /// No description provided for @yieldPredictor_predictionError.
  ///
  /// In en, this message translates to:
  /// **'Failed to predict. Try again.'**
  String get yieldPredictor_predictionError;

  /// No description provided for @yieldPredictor_predictionSuccess.
  ///
  /// In en, this message translates to:
  /// **'Yield prediction complete!'**
  String get yieldPredictor_predictionSuccess;

  /// No description provided for @yieldPredictor_rainfall.
  ///
  /// In en, this message translates to:
  /// **'Rainfall (mm)'**
  String get yieldPredictor_rainfall;

  /// No description provided for @yieldPredictor_readyDescription.
  ///
  /// In en, this message translates to:
  /// **'Enter your NDVI, soil moisture, and rainfall data to get an AI-powered yield prediction.'**
  String get yieldPredictor_readyDescription;

  /// No description provided for @yieldPredictor_readyTitle.
  ///
  /// In en, this message translates to:
  /// **'Ready to predict yield?'**
  String get yieldPredictor_readyTitle;

  /// No description provided for @yieldPredictor_regionBaseline.
  ///
  /// In en, this message translates to:
  /// **'Baseline'**
  String get yieldPredictor_regionBaseline;

  /// No description provided for @yieldPredictor_satelliteData.
  ///
  /// In en, this message translates to:
  /// **'Satellite & Weather Data'**
  String get yieldPredictor_satelliteData;

  /// No description provided for @yieldPredictor_selectCrop.
  ///
  /// In en, this message translates to:
  /// **'Select a crop...'**
  String get yieldPredictor_selectCrop;

  /// No description provided for @yieldPredictor_soilMoisture.
  ///
  /// In en, this message translates to:
  /// **'Soil Moisture (%)'**
  String get yieldPredictor_soilMoisture;

  /// No description provided for @yieldPredictor_stepEnvironment.
  ///
  /// In en, this message translates to:
  /// **'Environment'**
  String get yieldPredictor_stepEnvironment;

  /// No description provided for @yieldPredictor_stepGuide1.
  ///
  /// In en, this message translates to:
  /// **'Step 1: Set location on map'**
  String get yieldPredictor_stepGuide1;

  /// No description provided for @yieldPredictor_stepGuide2.
  ///
  /// In en, this message translates to:
  /// **'Step 2: Adjust environmental data'**
  String get yieldPredictor_stepGuide2;

  /// No description provided for @yieldPredictor_stepGuide3.
  ///
  /// In en, this message translates to:
  /// **'Step 3: Select crop & click Predict'**
  String get yieldPredictor_stepGuide3;

  /// No description provided for @yieldPredictor_stepMap.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get yieldPredictor_stepMap;

  /// No description provided for @yieldPredictor_stepResults.
  ///
  /// In en, this message translates to:
  /// **'Results'**
  String get yieldPredictor_stepResults;

  /// No description provided for @yieldPredictor_title.
  ///
  /// In en, this message translates to:
  /// **'Yield Predictor'**
  String get yieldPredictor_title;

  /// No description provided for @yieldPredictor_tonsPerHectare.
  ///
  /// In en, this message translates to:
  /// **'tons per hectare'**
  String get yieldPredictor_tonsPerHectare;

  /// No description provided for @yieldPredictor_validationError.
  ///
  /// In en, this message translates to:
  /// **'Please fill in all required fields'**
  String get yieldPredictor_validationError;

  /// No description provided for @yieldPredictor_vsAverage.
  ///
  /// In en, this message translates to:
  /// **'vs regional avg'**
  String get yieldPredictor_vsAverage;

  /// No description provided for @yieldPredictor_wet.
  ///
  /// In en, this message translates to:
  /// **'Wet'**
  String get yieldPredictor_wet;
}

class _L10nDelegate extends LocalizationsDelegate<L10n> {
  const _L10nDelegate();

  @override
  Future<L10n> load(Locale locale) {
    return SynchronousFuture<L10n>(lookupL10n(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'gu', 'hi', 'mr'].contains(locale.languageCode);

  @override
  bool shouldReload(_L10nDelegate old) => false;
}

L10n lookupL10n(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return L10nEn();
    case 'gu':
      return L10nGu();
    case 'hi':
      return L10nHi();
    case 'mr':
      return L10nMr();
  }

  throw FlutterError(
    'L10n.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
