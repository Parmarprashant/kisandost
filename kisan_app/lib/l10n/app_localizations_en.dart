// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class L10nEn extends L10n {
  L10nEn([String locale = 'en']) : super(locale);

  @override
  String advisoryDone(String count) {
    return '$count earlier stages have passed';
  }

  @override
  String advisoryDose(String amount) {
    return '$amount for your plot';
  }

  @override
  String get advisoryGeneralNote =>
      'A general guide by crop age, not an inspection of your field. Check the crop yourself before spraying, and follow the label on the pack.';

  @override
  String advisoryNextIn(String days) {
    return 'NEXT, IN $days DAYS';
  }

  @override
  String get advisoryNoCrops =>
      'Add a field and a crop, and this page will tell you what to do at each stage.';

  @override
  String get advisoryNoneForCrop => 'No stage guide for this crop yet.';

  @override
  String get advisoryNothingDue =>
      'Nothing is due right now. The next step is below.';

  @override
  String get advisoryNow => 'DO THIS NOW';

  @override
  String get advisoryTitle => 'Crop calendar';

  @override
  String get advisorySubtitle => 'What to do, when';

  @override
  String get advisorySmsNoticeTitle => 'You get this as an SMS at 6 AM';

  @override
  String get advisorySmsNoticeBody =>
      'In your language, even with the app closed and no data';

  @override
  String get advisoryComingUp => 'Coming up';

  @override
  String get advisoryToday => 'Today';

  @override
  String get aiAsk => 'Ask a farming question';

  @override
  String get aiBusy => 'The assistant is busy. Please try again in a moment.';

  @override
  String get aiDisclaimer =>
      'Advice from an AI, using your district and crops. Check anything important with your local agriculture officer before spending money on it.';

  @override
  String get aiExample1 =>
      'My cotton leaves are turning yellow. What should I do?';

  @override
  String get aiExample2 => 'When should I sow wheat this season?';

  @override
  String get aiExample3 => 'How much urea does one acre of rice need?';

  @override
  String get aiIntro =>
      'Ask anything about your crops, in your own words. Tap the microphone if you would rather speak.';

  @override
  String get aiSignIn => 'Sign in to ask a question.';

  @override
  String get aiThinking => 'Thinking';

  @override
  String get aiTitle => 'Ask KisanDost';

  @override
  String get appError => 'Something went wrong.';

  @override
  String get appLanguage => 'Language';

  @override
  String appLastUpdated(String time) {
    return 'Updated $time';
  }

  @override
  String get appOffline => 'You are offline. Showing saved information.';

  @override
  String get appRetry => 'Try again';

  @override
  String get appSlow => 'This is taking longer than usual. Please wait.';

  @override
  String get authCancelled => 'Sign-in was cancelled.';

  @override
  String get authGoogle => 'Continue with Google';

  @override
  String get authOffline => 'You are offline. Connect and try again.';

  @override
  String get authProfile => 'Profile';

  @override
  String get authRejected => 'Google could not sign you in. Please try again.';

  @override
  String get authServerError => 'We could not sign you in right now.';

  @override
  String get authSignIn => 'Sign in';

  @override
  String get authSignOut => 'Sign out';

  @override
  String get authSigningIn => 'Signing in';

  @override
  String get authStateMismatch =>
      'That sign-in link did not match. Please start again.';

  @override
  String get authTagline => 'Your farming companion';

  @override
  String get authWhyGoogle =>
      'We use your Google account so you never have to remember a password.';

  @override
  String get chatWidget_callExpert => 'Call Expert';

  @override
  String get chatWidget_greeting =>
      '🙏 Namaste! I am your KisanDost AI Assistant.\n\nI can help you with crop diseases, fertilizer, weather, profit prediction, government schemes, and more — in Hindi, English, Gujarati, or Marathi!\n\nSimply ask your question below 👇';

  @override
  String get chatWidget_headerSub => 'Hindi • English • Gujarati • Marathi';

  @override
  String get chatWidget_headerTitle => 'KisanDost AI Assistant';

  @override
  String get chatWidget_placeholder => 'Type your question...';

  @override
  String get chatWidget_quickReplies_contact => '📞 Contact Expert';

  @override
  String get chatWidget_quickReplies_disease => '🌾 Crop Disease';

  @override
  String get chatWidget_quickReplies_fertilizer => '🧪 Fertilizer';

  @override
  String get chatWidget_quickReplies_profit => '📈 Profit Predict';

  @override
  String get chatWidget_quickReplies_schemes => '🏛️ Govt Schemes';

  @override
  String get chatWidget_quickReplies_weather => '☁️ Weather Tips';

  @override
  String get comingSoon => 'Coming soon';

  @override
  String get communities_annualSupport => '₹6,000 Annual Support';

  @override
  String get communities_beneficiaries => 'Beneficiaries: Crores of Farmers';

  @override
  String get communities_directTransfer => 'Direct Bank Transfer';

  @override
  String get communities_dislike => 'Dislike';

  @override
  String get communities_eServiceCards_appStatus_description =>
      'This service enables farmers to check the status of their PM-Kisan applications. By entering registration details, applicants can track submissions and verify if they have been approved to receive financial benefits.';

  @override
  String get communities_eServiceCards_appStatus_title =>
      'Check PM-Kisan Application Status';

  @override
  String get communities_eServiceCards_ekyc_description =>
      'The e-KYC service is essential for verifying the identity of beneficiaries under the PM-Kisan scheme. Farmers can complete their KYC process online, ensuring they meet eligibility criteria and receive timely disbursements.';

  @override
  String get communities_eServiceCards_ekyc_title =>
      'Complete e-KYC for PM-Kisan';

  @override
  String get communities_eServiceCards_ems_description =>
      'The EMS is a web-enabled online monitoring system for Monthly Progress Reports (MPR) under the ATMA Programme. It monitors the physical and financial progress of all scheme components.';

  @override
  String get communities_eServiceCards_ems_title =>
      'Extension Reforms Monitoring System (EMS)';

  @override
  String get communities_eServiceCards_foodSecurity_description =>
      'Ensures all people at all times have access to basic food for an active and healthy life. Characterized by availability, access, utilization and stability of food across the country.';

  @override
  String get communities_eServiceCards_foodSecurity_title =>
      'National Food Security Portal';

  @override
  String get communities_eServiceCards_kkms_description =>
      'The Kisaan Knowledge Management System is an initiative by the Ministry of Agriculture to assist farmers by providing services such as toll-free numbers, online forums, and useful farming-specific information.';

  @override
  String get communities_eServiceCards_kkms_title =>
      'Kisaan Knowledge Management System';

  @override
  String get communities_eServiceCards_landRecords_description =>
      'Get the Record of Rights (RoR) online for various villages of Gujarat. Provided by the Department of Revenue, Gujarat. Users can get RoR details by selecting district, taluka, village, and survey number.';

  @override
  String get communities_eServiceCards_landRecords_title =>
      'Check Land Records in Gujarat Online';

  @override
  String get communities_eServiceCards_pmKisanScheme_description =>
      'The PM-KISAN scheme aims to supplement the financial needs of Small and Marginal Farmers (SMFs) by providing direct income support of Rs. 6000 per year, transferred in three equal installments.';

  @override
  String get communities_eServiceCards_pmKisanScheme_title =>
      'Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)';

  @override
  String get communities_eServiceCards_pmayDashboard_description =>
      'This digital dashboard enables officials from states and banks to track the performance of PMAY-Gramin. It provides real-time data and performance metrics to monitor implementation of affordable rural housing.';

  @override
  String get communities_eServiceCards_pmayDashboard_title =>
      'PM Awaas Yojana-Gramin Dashboard';

  @override
  String get communities_eServiceCards_registerFarmer_description =>
      'Farmers may register for the PM-Kisan Samman Nidhi scheme. By providing necessary details, farmers can apply to receive financial support from the government to ensure economic stability and agricultural productivity.';

  @override
  String get communities_eServiceCards_registerFarmer_title =>
      'Register as New Farmer for PM-Kisan';

  @override
  String get communities_eServices => 'Farmer e-Services';

  @override
  String get communities_footerNote =>
      '* Information based on official PM Kisan YouTube channel and government sources.';

  @override
  String get communities_forFarmers => 'For Farmers';

  @override
  String get communities_fullyOnline => 'Fully Online';

  @override
  String get communities_govSchemesAll => 'All Schemes';

  @override
  String get communities_govSchemesApply => 'Official Portal';

  @override
  String get communities_govSchemesBenefits => 'Key Benefits';

  @override
  String get communities_govSchemesCentral => 'Central Scheme';

  @override
  String get communities_govSchemesDetails => 'View Details';

  @override
  String get communities_govSchemesEligibility => 'Who Can Apply';

  @override
  String get communities_govSchemesEmpty => 'No schemes match your search.';

  @override
  String get communities_govSchemesError =>
      'Could not load schemes. Please try again.';

  @override
  String get communities_govSchemesIntro =>
      'Central government schemes covering income support, crop insurance, credit, irrigation, machinery and allied activities. Tap a scheme for benefits and eligibility, or open the official portal to apply.';

  @override
  String get communities_govSchemesLaunched => 'Launched';

  @override
  String get communities_govSchemesLess => 'Show Less';

  @override
  String get communities_govSchemesLoading => 'Loading schemes…';

  @override
  String get communities_govSchemesSearch =>
      'Search schemes by name, ministry or keyword…';

  @override
  String get communities_govSchemesShowAll => 'Show All Schemes';

  @override
  String get communities_govSchemesTitle => 'Government Schemes for Farmers';

  @override
  String get communities_installments => '3 Installments';

  @override
  String get communities_latestVideos => 'Latest Videos';

  @override
  String get communities_launchDate => 'Launched: 24 February 2019';

  @override
  String get communities_like => 'Like';

  @override
  String get communities_loadMore => 'Load More Videos';

  @override
  String get communities_more => 'Learn More';

  @override
  String get communities_networkTab => 'Farmer Network';

  @override
  String get communities_officialChannel => 'Official YouTube Channel';

  @override
  String get communities_officialInitiative => 'Official Government Initiative';

  @override
  String get communities_operationalDate => 'Operational: 01 December 2018';

  @override
  String get communities_partiallyOnline => 'Partially Online';

  @override
  String get communities_peopleHelpful => 'people found this helpful';

  @override
  String get communities_pmKisanDesc =>
      'PM-KISAN is a government scheme that provides financial assistance to small and marginal farmers across India. Under this initiative, eligible farmers receive ₹6,000 annually, transferred directly into their bank accounts in three equal installments.';

  @override
  String get communities_pmKisanTitle => 'PM Kisan Samman Nidhi Scheme';

  @override
  String get communities_quote =>
      '\"Launched by Hon\'ble PM Shri Narendra Modi on 24th February 2019. Operational since 1st December 2018. Provides income support to eligible farmer families.\"';

  @override
  String get communities_rateThis => 'Rate This:';

  @override
  String get communities_resourcesTab => 'Farmer Resources';

  @override
  String get communities_shareThis => 'Share This';

  @override
  String get communities_subtitle =>
      'Connecting farmers with government initiatives and peer knowledge.';

  @override
  String get communities_title => 'Communities & Schemes';

  @override
  String get communities_videoDates_v1 => '2 days ago';

  @override
  String get communities_videoDates_v2 => '1 week ago';

  @override
  String get communities_videoDates_v3 => '2 weeks ago';

  @override
  String get communities_videoDates_v4 => '3 weeks ago';

  @override
  String get communities_videoDates_v5 => '1 month ago';

  @override
  String get communities_videoDates_v6 => '2 months ago';

  @override
  String get communities_videoDates_v7 => '2 months ago';

  @override
  String get communities_videoDates_v8 => '3 months ago';

  @override
  String get communities_videoTitles_v1 => 'PM Kisan Scheme - Farmer Benefits';

  @override
  String get communities_videoTitles_v2 =>
      'How to Check PM Kisan Status Online';

  @override
  String get communities_videoTitles_v3 => 'PM Kisan 12th Installment Release';

  @override
  String get communities_videoTitles_v4 => 'PM Kisan Scheme - Complete Guide';

  @override
  String get communities_videoTitles_v5 => 'Farmers Welfare Schemes 2024';

  @override
  String get communities_videoTitles_v6 =>
      'Direct Benefit Transfer (DBT) Explained';

  @override
  String get communities_videoTitles_v7 => 'E-KYC Registration Tutorial';

  @override
  String get communities_videoTitles_v8 => 'PMAY and PM Kisan Synergy';

  @override
  String get communities_visitChannel => 'Visit Channel';

  @override
  String get communities_visitPortal => 'Visit Official Portal';

  @override
  String get communities_visitYoutube => 'Visit YouTube Channel';

  @override
  String get communities_watchMore => 'Watch More on YouTube';

  @override
  String get communities_welfareSchemes => 'Farmer Welfare Schemes';

  @override
  String get communityAddComment => 'Write a reply';

  @override
  String get communityAsk => 'Ask farmers';

  @override
  String communityComments(String count) {
    return '$count comments';
  }

  @override
  String get communityCrop => 'Crop';

  @override
  String get communityDetails => 'Describe it';

  @override
  String get communityEmpty => 'No posts yet';

  @override
  String get communityHelpful => 'Helpful';

  @override
  String get communityNoComments => 'No replies yet. Be the first.';

  @override
  String get communityNoMatch => 'No posts match that search';

  @override
  String get communityPost => 'Post';

  @override
  String get communityPostTitle => 'What is the problem?';

  @override
  String get communityPosted => 'Posted. Other farmers can see it now.';

  @override
  String get communityPosting => 'Posting';

  @override
  String get communitySearch => 'Search posts, crops or villages';

  @override
  String get communitySend => 'Send';

  @override
  String get communitySignInNote => 'Sign in to reply or mark posts helpful.';

  @override
  String get communityTitle => 'Farmer community';

  @override
  String get composeIntro =>
      'Other farmers will see this and can reply. Say it in your own words — tap the microphone if that is easier.';

  @override
  String get composeTried => 'What have you already tried?';

  @override
  String get composeTriedHelp =>
      'Optional, but it saves people suggesting what you have done.';

  @override
  String get composeType => 'What kind of post';

  @override
  String get composeTypeAsk => 'Ask farmers';

  @override
  String get composeTypeExperience => 'My experience';

  @override
  String get composeTypeProblem => 'Crop problem';

  @override
  String get composeTypeSuccess => 'Success story';

  @override
  String get composeTypeTip => 'Prevention tip';

  @override
  String get composeVisibleNote =>
      'Your name and district are shown with the post, on the app and on the website.';

  @override
  String cropSuggestion_aiAdvisory(String district) {
    return 'AI Advisory for $district';
  }

  @override
  String get cropSuggestion_analyzing =>
      'Analyzing location details & generating AI suggestions...';

  @override
  String get cropSuggestion_awaitingLocation => 'Awaiting Location';

  @override
  String get cropSuggestion_awaitingLocationDesc =>
      'Click on the map to select a district and let our AI provide expert crop recommendations.';

  @override
  String get cropSuggestion_bestCrops => 'Best Crops for this Region';

  @override
  String get cropSuggestion_description =>
      'Select a location on the map of Gujarat to get expert AI recommendations for the best crops to grow in that region.';

  @override
  String get cropSuggestion_geminiInsight => 'Gemini Insight';

  @override
  String get cropSuggestion_loadingMap => 'Loading Map...';

  @override
  String get cropSuggestion_season => 'Season';

  @override
  String get cropSuggestion_selectLocationDesc =>
      'Click anywhere on the map of Gujarat to see localized AI crop suggestions.';

  @override
  String get cropSuggestion_selectLocationTitle => 'Select Location';

  @override
  String get cropSuggestion_selectedLocation => 'Selected Location';

  @override
  String get cropSuggestion_title => 'AI Crop Suggestion';

  @override
  String get cropSuggestion_waterLevel => 'Water Level';

  @override
  String get crops_apple_diseases_appleScab_description =>
      'Velvety spots on fruit.';

  @override
  String get crops_apple_diseases_appleScab_favorableConditions =>
      'Rainy spring.';

  @override
  String get crops_apple_diseases_appleScab_impact => 'Market loss.';

  @override
  String get crops_apple_diseases_appleScab_name => 'Apple Scab';

  @override
  String get crops_apple_name => 'Apple';

  @override
  String get crops_banana_diseases_panamaDisease_description =>
      'Soil-borne fungal disease.';

  @override
  String get crops_banana_diseases_panamaDisease_favorableConditions =>
      'Acidic soil and poor drainage.';

  @override
  String get crops_banana_diseases_panamaDisease_impact =>
      'Permanent loss of plantations.';

  @override
  String get crops_banana_diseases_panamaDisease_name => 'Panama Disease';

  @override
  String get crops_banana_name => 'Banana';

  @override
  String get crops_broccoli_diseases_clubrootBroccoli_description =>
      'Soil-borne root distortion.';

  @override
  String get crops_broccoli_diseases_clubrootBroccoli_favorableConditions =>
      'Acidic soil moisture.';

  @override
  String get crops_broccoli_diseases_clubrootBroccoli_impact =>
      'Small heads, plant death.';

  @override
  String get crops_broccoli_diseases_clubrootBroccoli_name => 'Clubroot';

  @override
  String get crops_broccoli_name => 'Broccoli';

  @override
  String get crops_cabbage_diseases_alternariaLeafSpotCab_description =>
      'Unsightly head fungus.';

  @override
  String get crops_cabbage_diseases_alternariaLeafSpotCab_favorableConditions =>
      'Hot and humid.';

  @override
  String get crops_cabbage_diseases_alternariaLeafSpotCab_impact =>
      'Decreases shelf-life and value.';

  @override
  String get crops_cabbage_diseases_alternariaLeafSpotCab_name =>
      'Alternaria Spot';

  @override
  String get crops_cabbage_name => 'Cabbage';

  @override
  String get crops_carrot_diseases_carrotLeafBlight_description =>
      'Common carrot leaf rot.';

  @override
  String get crops_carrot_diseases_carrotLeafBlight_favorableConditions =>
      'Humid heat.';

  @override
  String get crops_carrot_diseases_carrotLeafBlight_impact =>
      'Reduces root size.';

  @override
  String get crops_carrot_diseases_carrotLeafBlight_name => 'Alternaria Blight';

  @override
  String get crops_carrot_name => 'Carrot';

  @override
  String get crops_cauliflower_diseases_blackRotCauli_description =>
      'Crucifer bacterial decay.';

  @override
  String get crops_cauliflower_diseases_blackRotCauli_favorableConditions =>
      'Warm Rain.';

  @override
  String get crops_cauliflower_diseases_blackRotCauli_impact =>
      'Severe head rot.';

  @override
  String get crops_cauliflower_diseases_blackRotCauli_name => 'Black Rot';

  @override
  String get crops_cauliflower_name => 'Cauliflower';

  @override
  String get crops_corn_diseases_cornSmut_description =>
      'Fungal disease causing galls on plants.';

  @override
  String get crops_corn_diseases_cornSmut_favorableConditions =>
      'Hot, dry weather followed by rain.';

  @override
  String get crops_corn_diseases_cornSmut_impact =>
      'Reduces yield and grain quality.';

  @override
  String get crops_corn_diseases_cornSmut_name => 'Common Smut';

  @override
  String get crops_corn_name => 'Corn';

  @override
  String get crops_cotton_diseases_bollRotCotton_description =>
      'Cotton boll decay.';

  @override
  String get crops_cotton_diseases_bollRotCotton_favorableConditions =>
      'Rain and density.';

  @override
  String get crops_cotton_diseases_bollRotCotton_impact =>
      'Reduces lint yield and quality.';

  @override
  String get crops_cotton_diseases_bollRotCotton_name => 'Boll Rot';

  @override
  String get crops_cotton_name => 'Cotton';

  @override
  String get crops_cucumber_diseases_powderyMildewCuc_description =>
      'White leaf powder fungus.';

  @override
  String get crops_cucumber_diseases_powderyMildewCuc_favorableConditions =>
      'Humidity.';

  @override
  String get crops_cucumber_diseases_powderyMildewCuc_impact =>
      'Reduced harvest life.';

  @override
  String get crops_cucumber_diseases_powderyMildewCuc_name => 'Powdery Mildew';

  @override
  String get crops_cucumber_name => 'Cucumber';

  @override
  String get crops_grapes_diseases_downyMildewGrapes_description =>
      'Aggressive fungal disease of vines.';

  @override
  String get crops_grapes_diseases_downyMildewGrapes_favorableConditions =>
      'Wet weather, moderate temps.';

  @override
  String get crops_grapes_diseases_downyMildewGrapes_impact =>
      'Severe defoliation and fruit loss.';

  @override
  String get crops_grapes_diseases_downyMildewGrapes_name => 'Downy Mildew';

  @override
  String get crops_grapes_name => 'Grapes';

  @override
  String get crops_lettuce_diseases_downyMildewLettuce_description =>
      'Leaf rot of lettuce.';

  @override
  String get crops_lettuce_diseases_downyMildewLettuce_favorableConditions =>
      'Cool and wet.';

  @override
  String get crops_lettuce_diseases_downyMildewLettuce_impact =>
      'Destroys marketable heads.';

  @override
  String get crops_lettuce_diseases_downyMildewLettuce_name => 'Downy Mildew';

  @override
  String get crops_lettuce_name => 'Lettuce';

  @override
  String get crops_onion_diseases_purpleBlotchOnion_description =>
      'Bulb-stunting fungus.';

  @override
  String get crops_onion_diseases_purpleBlotchOnion_favorableConditions =>
      'Humidity.';

  @override
  String get crops_onion_diseases_purpleBlotchOnion_impact =>
      'Affects quality and storage.';

  @override
  String get crops_onion_diseases_purpleBlotchOnion_name => 'Purple Blotch';

  @override
  String get crops_onion_name => 'Onion';

  @override
  String get crops_orange_diseases_citrusCanker_description =>
      'Bacterial spots on fruit and leaves.';

  @override
  String get crops_orange_diseases_citrusCanker_favorableConditions =>
      'Wind-driven rain.';

  @override
  String get crops_orange_diseases_citrusCanker_impact =>
      'Reduces yield and quality.';

  @override
  String get crops_orange_diseases_citrusCanker_name => 'Citrus Canker';

  @override
  String get crops_orange_name => 'Orange';

  @override
  String get crops_papaya_diseases_ringspotPapaya_description =>
      'Viral rings on fruit leaves.';

  @override
  String get crops_papaya_diseases_ringspotPapaya_favorableConditions =>
      'Aphid activity.';

  @override
  String get crops_papaya_diseases_ringspotPapaya_impact =>
      'Stunts plant growth.';

  @override
  String get crops_papaya_diseases_ringspotPapaya_name => 'Papaya Ringspot';

  @override
  String get crops_papaya_name => 'Papaya';

  @override
  String get crops_peach_diseases_leafCurlPeach_description =>
      'Fungal distortion of leaves.';

  @override
  String get crops_peach_diseases_leafCurlPeach_favorableConditions =>
      'Cool, wet spring.';

  @override
  String get crops_peach_diseases_leafCurlPeach_impact =>
      'Weakens tree vitality.';

  @override
  String get crops_peach_diseases_leafCurlPeach_name => 'Peach Leaf Curl';

  @override
  String get crops_peach_name => 'Peach';

  @override
  String get crops_pear_diseases_fireBlightPear_description =>
      'Bacterial scorching disease.';

  @override
  String get crops_pear_diseases_fireBlightPear_favorableConditions =>
      'Warm, wet blooms.';

  @override
  String get crops_pear_diseases_fireBlightPear_impact => 'Rapid tree death.';

  @override
  String get crops_pear_diseases_fireBlightPear_name => 'Fire Blight';

  @override
  String get crops_pear_name => 'Pear';

  @override
  String get crops_pepper_diseases_bacterialSpotPepper_description =>
      'Damaging bacterial infection.';

  @override
  String get crops_pepper_diseases_bacterialSpotPepper_favorableConditions =>
      'Rain and heat.';

  @override
  String get crops_pepper_diseases_bacterialSpotPepper_impact =>
      'Sunscald and yield drop.';

  @override
  String get crops_pepper_diseases_bacterialSpotPepper_name => 'Bacterial Spot';

  @override
  String get crops_pepper_name => 'Pepper';

  @override
  String get crops_pineapple_diseases_heartRot_description =>
      'Fungal decay of the inner leaves.';

  @override
  String get crops_pineapple_diseases_heartRot_favorableConditions =>
      'Waterlogged heavy soils.';

  @override
  String get crops_pineapple_diseases_heartRot_impact => 'Plant death.';

  @override
  String get crops_pineapple_diseases_heartRot_name => 'Heart Rot';

  @override
  String get crops_pineapple_name => 'Pineapple';

  @override
  String get crops_plum_diseases_blackKnot_description =>
      'Fungal swellings on branches.';

  @override
  String get crops_plum_diseases_blackKnot_favorableConditions =>
      'Wet springs.';

  @override
  String get crops_plum_diseases_blackKnot_impact => 'Can kill the tree.';

  @override
  String get crops_plum_diseases_blackKnot_name => 'Black Knot';

  @override
  String get crops_plum_name => 'Plum';

  @override
  String get crops_pomegranate_diseases_bacterialBlightPom_description =>
      'Dark water-soaked lesions.';

  @override
  String
  get crops_pomegranate_diseases_bacterialBlightPom_favorableConditions =>
      'Rainy weather.';

  @override
  String get crops_pomegranate_diseases_bacterialBlightPom_impact =>
      'Severe market loss.';

  @override
  String get crops_pomegranate_diseases_bacterialBlightPom_name =>
      'Bacterial Blight';

  @override
  String get crops_pomegranate_name => 'Pomegranate';

  @override
  String get crops_potato_diseases_lateBlightPotato_description =>
      'Destructive fungal rot.';

  @override
  String get crops_potato_diseases_lateBlightPotato_favorableConditions =>
      'Moist cool weather.';

  @override
  String get crops_potato_diseases_lateBlightPotato_impact =>
      'Total plant loss.';

  @override
  String get crops_potato_diseases_lateBlightPotato_name => 'Late Blight';

  @override
  String get crops_potato_name => 'Potato';

  @override
  String get crops_rice_diseases_riceBlast_description =>
      'Fungal infection affecting above-ground parts.';

  @override
  String get crops_rice_diseases_riceBlast_favorableConditions =>
      'High humidity and continuous rain.';

  @override
  String get crops_rice_diseases_riceBlast_impact =>
      'Severe destruction of the entire crop.';

  @override
  String get crops_rice_diseases_riceBlast_name => 'Rice Blast';

  @override
  String get crops_rice_name => 'Rice';

  @override
  String get crops_soyabean_diseases_soybeanRust_description =>
      'Aggressive foliar fungus.';

  @override
  String get crops_soyabean_diseases_soybeanRust_favorableConditions =>
      'High moisture.';

  @override
  String get crops_soyabean_diseases_soybeanRust_impact => 'Up to 80% loss.';

  @override
  String get crops_soyabean_diseases_soybeanRust_name => 'Soybean Rust';

  @override
  String get crops_soyabean_name => 'Soyabean';

  @override
  String get crops_spinach_diseases_spinachDownyMildew_description =>
      'Critical spinach rot.';

  @override
  String get crops_spinach_diseases_spinachDownyMildew_favorableConditions =>
      'Damp cold weather.';

  @override
  String get crops_spinach_diseases_spinachDownyMildew_impact =>
      'Rapid crop destruction.';

  @override
  String get crops_spinach_diseases_spinachDownyMildew_name => 'Downy Mildew';

  @override
  String get crops_spinach_name => 'Spinach';

  @override
  String get crops_strawberry_diseases_grayMoldStrawberry_description =>
      'Common berry fungus.';

  @override
  String get crops_strawberry_diseases_grayMoldStrawberry_favorableConditions =>
      'High humidity.';

  @override
  String get crops_strawberry_diseases_grayMoldStrawberry_impact =>
      'Post-harvest decay.';

  @override
  String get crops_strawberry_diseases_grayMoldStrawberry_name => 'Gray Mold';

  @override
  String get crops_strawberry_name => 'Strawberry';

  @override
  String get crops_sugarcane_diseases_redRotSugarcane_description =>
      'Critical sugar rot.';

  @override
  String get crops_sugarcane_diseases_redRotSugarcane_favorableConditions =>
      'Rain and waterlogging.';

  @override
  String get crops_sugarcane_diseases_redRotSugarcane_impact =>
      'Reduces sugar recovery and weight.';

  @override
  String get crops_sugarcane_diseases_redRotSugarcane_name => 'Red Rot';

  @override
  String get crops_sugarcane_name => 'Sugarcane';

  @override
  String get crops_tomato_diseases_earlyBlightTom_description =>
      'Common foliar rot.';

  @override
  String get crops_tomato_diseases_earlyBlightTom_favorableConditions =>
      'Humid days.';

  @override
  String get crops_tomato_diseases_earlyBlightTom_impact =>
      'Reduces yield by damaging foliage.';

  @override
  String get crops_tomato_diseases_earlyBlightTom_name => 'Early Blight';

  @override
  String get crops_tomato_name => 'Tomato';

  @override
  String get crops_watermelon_diseases_fusariumWiltWm_description =>
      'Soil-borne pathogen.';

  @override
  String get crops_watermelon_diseases_fusariumWiltWm_favorableConditions =>
      'Warm soil.';

  @override
  String get crops_watermelon_diseases_fusariumWiltWm_impact =>
      'Total crop failure.';

  @override
  String get crops_watermelon_diseases_fusariumWiltWm_name => 'Fusarium Wilt';

  @override
  String get crops_watermelon_name => 'Watermelon';

  @override
  String get crops_wheat_diseases_wheatRust_description =>
      'Fungal disease affecting wheat stems, leaves, and grains.';

  @override
  String get crops_wheat_diseases_wheatRust_favorableConditions =>
      'Warm days and cool nights with dew.';

  @override
  String get crops_wheat_diseases_wheatRust_impact =>
      'Reduces yield by 20-50%.';

  @override
  String get crops_wheat_diseases_wheatRust_name => 'Wheat Rust';

  @override
  String get crops_wheat_name => 'Wheat';

  @override
  String get dashboard_calculateFertilizer => 'Calculate Fertilizer';

  @override
  String get dashboard_chooseCrop => 'Choose Your Crop';

  @override
  String get dashboard_commonDiseasesLabel => 'Common Diseases';

  @override
  String get dashboard_excellent => 'Excellent';

  @override
  String get dashboard_fair => 'Fair';

  @override
  String get dashboard_good => 'Good';

  @override
  String dashboard_greeting(String health, String name) {
    return 'Namaste $name! Your farm is $health today';
  }

  @override
  String get dashboard_healthStatus_healthy => 'Healthy';

  @override
  String get dashboard_healthStatus_moderate => 'Moderate';

  @override
  String get dashboard_healthStatus_stress => 'Stress';

  @override
  String dashboard_ndviSubtitle(String status, String value) {
    return 'Your current overall farm NDVI is $value ($status).';
  }

  @override
  String get dashboard_poor => 'Poor';

  @override
  String get dashboard_precautionsLabel => 'Precautions & Remedies';

  @override
  String get dashboard_profitIntelDesc =>
      'Predict your crop yield and estimate profits based on real-time APMC market prices.';

  @override
  String get dashboard_profitIntelTitle => 'AI Profit Intelligence';

  @override
  String get dashboard_seasonLabel => 'Season';

  @override
  String get dashboard_soilTypeLabel => 'Soil Type';

  @override
  String get dashboard_tryPredictor => 'Try Predictor';

  @override
  String get dashboard_viewDetails => 'View Details';

  @override
  String get dashboard_waterNeedLabel => 'Water Need';

  @override
  String get diagnoseAnalysing => 'Analysing leaf';

  @override
  String get diagnoseBuy => 'Products to use';

  @override
  String get diagnoseCauses => 'Why it happened';

  @override
  String get diagnoseCompressing => 'Preparing photo';

  @override
  String diagnoseConfidence(String value) {
    return '$value% sure';
  }

  @override
  String get diagnoseCopyDetails => 'Copy details';

  @override
  String get diagnoseDetailsCopied => 'Copied';

  @override
  String get diagnoseExpertNote =>
      'Please confirm with an expert before you spray.';

  @override
  String get diagnoseFarmingSteps => 'Farming steps';

  @override
  String get diagnoseGallery => 'Choose from gallery';

  @override
  String get diagnoseGuide => 'Fill the frame with one affected leaf';

  @override
  String get diagnoseHealthy => 'Healthy';

  @override
  String get diagnoseHowToFix => 'How to get a good photo';

  @override
  String get diagnoseInfected => 'Disease found';

  @override
  String get diagnoseKeepPhoto => 'Your photo is saved. You can try again.';

  @override
  String get diagnoseMatching => 'Finding treatments';

  @override
  String get diagnoseModelDetails => 'Technical details from the model';

  @override
  String get diagnoseNoCamera => 'Camera is not available on this device.';

  @override
  String get diagnosePermission => 'Allow camera access to check your crop.';

  @override
  String get diagnoseRetake => 'Check another leaf';

  @override
  String get diagnoseSlowNote =>
      'The first check of the day can take up to a minute.';

  @override
  String get diagnoseSymptoms => 'What to look for';

  @override
  String get diagnoseTakePhoto => 'Take photo';

  @override
  String get diagnoseTooLarge =>
      'That photo is too large. Please take a new one.';

  @override
  String get diagnoseUnclear => 'The photo was not clear enough';

  @override
  String get diagnoseUploading => 'Uploading';

  @override
  String get diagnoseWhatToDo => 'What to do now';

  @override
  String get diagnoseSprayThis => 'Spray this';

  @override
  String get diagnoseCulturalPractices => 'And do this, no cost';

  @override
  String get diagnoseWhereToGet => 'Where to get it';

  @override
  String get diagnoseCheckGenuine =>
      'Check the packet is genuine before you pay';

  @override
  String get diagnoseAskCommunity => 'Ask the community';

  @override
  String get diagnoseModelConfidence => 'Model confidence';

  @override
  String get diagnoseFromModel => 'From the model';

  @override
  String get diagnoseGoodLightTip =>
      'Good light. Keep the phone about 15 cm away.';

  @override
  String get diagnoseShadowTip => 'Avoid your own shadow on the leaf.';

  @override
  String get diagnoseFootnote =>
      'This is one photo of one leaf, read by a model. If the field looks worse than the leaf, trust the field and ask an officer.';

  @override
  String get diseasesPage_bestSeason => 'Best Season: Kharif (Monsoon)';

  @override
  String diseasesPage_care(String crop) {
    return '$crop CARE';
  }

  @override
  String get diseasesPage_favorableConditions => 'FAVORABLE CONDITIONS';

  @override
  String get diseasesPage_filters_all => 'All Crops';

  @override
  String get diseasesPage_filters_cashCrops => 'Cash Crops';

  @override
  String get diseasesPage_filters_cereals => 'Cereals';

  @override
  String get diseasesPage_filters_fruits => 'Fruits';

  @override
  String get diseasesPage_filters_vegetables => 'Vegetables';

  @override
  String get diseasesPage_generalPrecaution => 'GENERAL PRECAUTION:';

  @override
  String get diseasesPage_impact => 'Impact';

  @override
  String get diseasesPage_pestControl => 'PEST CONTROL (इलाज)';

  @override
  String get diseasesPage_prevention => 'Prevention & Control';

  @override
  String get diseasesPage_reset => 'Reset Selection';

  @override
  String diseasesPage_selected(String count) {
    return 'You\'ve selected $count out of 8 crops';
  }

  @override
  String get diseasesPage_subtitle =>
      'Select up to 8 crops to view common diseases, pests, and preventive measures. Protect your harvest with expert guidance.';

  @override
  String get diseasesPage_symptoms => 'SYMPTOMS (लक्षण)';

  @override
  String get diseasesPage_title => 'Crop Disease & Pest Management';

  @override
  String get diseasesPage_viewStoreProducts => 'View Store Products';

  @override
  String get farmAddCrop => 'Add crop';

  @override
  String get farmAddField => 'Add field';

  @override
  String get farmArea => 'Area';

  @override
  String get farmBack => 'Back';

  @override
  String get farmBadNumber => 'Enter a number';

  @override
  String get farmCancel => 'Cancel';

  @override
  String get farmCropName => 'Crop';

  @override
  String get farmCrops => 'Crops';

  @override
  String get farmCultivationMethod => 'How was it sown';

  @override
  String farmDayCount(String days) {
    return 'Day $days';
  }

  @override
  String get farmDelete => 'Delete';

  @override
  String get farmDeleteField => 'Delete this field?';

  @override
  String get farmDeleteFieldNote => 'The crops in it will be removed too.';

  @override
  String get farmDistrict => 'District';

  @override
  String get farmFieldName => 'Field name';

  @override
  String get farmFields => 'Fields';

  @override
  String get farmFrequency => 'Watering';

  @override
  String get farmIrrigation => 'Irrigation';

  @override
  String get farmNext => 'Next';

  @override
  String get farmBoundary => 'Field boundary and zones';

  @override
  String get farmNextUp => 'Worth doing next';

  @override
  String get farmNothingNext =>
      'Nothing waiting. Every field has its soil, water and crop on record.';

  @override
  String get farmSoilMissingWhy =>
      'Set it and the fertiliser dose stops guessing.';

  @override
  String get farmSoilUnknown => 'Soil not set';

  @override
  String farmSummary(String fields, String crops) {
    return '$fields fields · $crops crops standing';
  }

  @override
  String get farmNoCrops => 'No crops in this field yet';

  @override
  String get farmNoFields => 'No fields yet';

  @override
  String get farmNoFieldsHint =>
      'Add your first field to get advice for your crops.';

  @override
  String get farmNotes => 'Notes';

  @override
  String get farmPreviousCrop => 'Last crop';

  @override
  String get farmRequired => 'Please fill this in';

  @override
  String get farmReview => 'Check your answers';

  @override
  String get farmSave => 'Save';

  @override
  String get farmSaved => 'Saved';

  @override
  String get farmSaving => 'Saving';

  @override
  String get farmSoilType => 'Soil type';

  @override
  String get farmSowingDate => 'Sowing date';

  @override
  String get farmState => 'State';

  @override
  String farmStep(String current, String total) {
    return 'Step $current of $total';
  }

  @override
  String get farmTaluka => 'Taluka';

  @override
  String get farmUseLocation => 'Use my location';

  @override
  String get farmVariety => 'Variety';

  @override
  String get farmVillage => 'Village';

  @override
  String get farmWaterSource => 'Water source';

  @override
  String get fertArea => 'Area (acres)';

  @override
  String fertBags(String count) {
    return 'About $count bags of 50 kg';
  }

  @override
  String get fertBuy => 'What to buy';

  @override
  String get fertCalculate => 'Calculate';

  @override
  String fertCost(String amount) {
    return 'Roughly ₹$amount';
  }

  @override
  String get fertCostNote =>
      'An estimate from indicative shop prices, not a quote.';

  @override
  String get fertCrop => 'Crop';

  @override
  String get fertDap => 'DAP';

  @override
  String get fertExistingK => 'Potassium in soil (kg/acre)';

  @override
  String get fertExistingN => 'Nitrogen in soil (kg/acre)';

  @override
  String get fertExistingP => 'Phosphorus in soil (kg/acre)';

  @override
  String fertKg(String value) {
    return '$value kg';
  }

  @override
  String get fertMop => 'MOP';

  @override
  String get fertReduced =>
      'Your soil test reduced the dose — you need to buy less.';

  @override
  String get fertSoil => 'Soil type';

  @override
  String get fertSoilTest => 'I have a soil test';

  @override
  String get fertSplitNote =>
      'Apply nitrogen in 2–3 splits through the season, not all at sowing.';

  @override
  String get fertTitle => 'Fertilizer calculator';

  @override
  String get fertilizerWorksOffline => 'Works with no signal';

  @override
  String get fertilizerOnDevice => 'On device';

  @override
  String get fertilizerTotalBuy => 'Buy this much, in total';

  @override
  String get fertilizerWhenToApply => 'When to put it on';

  @override
  String get fertilizerFootnote =>
      'Based on ICAR\'s recommended rates. A Soil Health Card test for your own field would beat this — it is free, and it is on the schemes list.';

  @override
  String get fertUrea => 'Urea';

  @override
  String get fertilizer_area => 'Farm area (acres)';

  @override
  String get fertilizer_calculate => 'Calculate';

  @override
  String get fertilizer_cost => 'Cost Estimate';

  @override
  String get fertilizer_crop => 'Select Crop';

  @override
  String get fertilizer_profit => 'Profit Gain';

  @override
  String get fertilizer_recommended => 'Recommended NPK';

  @override
  String get fertilizer_save => 'Save to My Farm';

  @override
  String get fertilizer_soilDesc => 'Loamy / Sandy / Clay';

  @override
  String get fertilizer_soilType => 'Soil Type';

  @override
  String get fertilizer_title => 'Fertilizer Calculator';

  @override
  String get fertilizer_totalBags => 'Total Bags Needed';

  @override
  String homeGreeting(String name) {
    return 'Namaste, $name';
  }

  @override
  String get homeMarkDone => 'Mark as done';

  @override
  String get homeNothingDue => 'Nothing due today';

  @override
  String get homeNothingDueBody =>
      'No spray or dose is scheduled. The next one is still days away.';

  @override
  String get homeRateToday => 'Today\'s rate';

  @override
  String get homeSchemesForYou => 'Schemes for you';

  @override
  String get homeSeeAll => 'See all';

  @override
  String get homeToday => 'Do this today';

  @override
  String get homeMyCrops => 'My crops';

  @override
  String get homeNextUp => 'What to do next';

  @override
  String mandiArrival(String date) {
    return 'Market date $date';
  }

  @override
  String get mandiCrop => 'Crop';

  @override
  String get mandiEstimate => 'Estimated rate';

  @override
  String get mandiEstimateNote =>
      'No live market data for this crop here. This is a government baseline, not a traded price.';

  @override
  String get mandiIndicative => 'Indicative rate';

  @override
  String get mandiIndicativeNote =>
      'Real government data, but not a fresh reading from your local market today.';

  @override
  String get mandiLive => 'Live government rate';

  @override
  String get mandiNotYourDistrict => 'Nearest reporting market';

  @override
  String get mandiPerQuintal => 'per quintal';

  @override
  String mandiRange(String max, String min) {
    return 'Range $min – $max';
  }

  @override
  String get mandiState => 'State';

  @override
  String get mandiTitle => 'Mandi prices';

  @override
  String get myCrop_acres => 'Acres';

  @override
  String get myCrop_addCrop => '+ Add Crop';

  @override
  String get myCrop_addField => '+ Add Field';

  @override
  String get myCrop_advisoryNotice =>
      'Crop monitoring and AI advisory will be available soon.';

  @override
  String get myCrop_area => 'Field Area';

  @override
  String get myCrop_areaUnit => 'Area Unit';

  @override
  String get myCrop_back => 'Back';

  @override
  String get myCrop_cropName => 'Crop Name';

  @override
  String get myCrop_cultivatedArea => 'Cultivated Area';

  @override
  String get myCrop_cultivationMethod => 'Cultivation Method';

  @override
  String get myCrop_deleteCrop => 'Delete Crop';

  @override
  String get myCrop_deleteField => 'Delete Field';

  @override
  String get myCrop_detectLocation => 'Detect Field Location';

  @override
  String get myCrop_editCrop => 'Edit Crop';

  @override
  String get myCrop_editField => 'Edit Field';

  @override
  String get myCrop_fieldName => 'Field Name';

  @override
  String get myCrop_hectares => 'Hectares';

  @override
  String get myCrop_irrigationFrequency => 'Irrigation Frequency';

  @override
  String get myCrop_irrigationMethod => 'Irrigation Method';

  @override
  String get myCrop_location => 'Location';

  @override
  String get myCrop_locationDetected => 'Location detected successfully!';

  @override
  String get myCrop_myFields => 'My Fields';

  @override
  String get myCrop_next => 'Next Step';

  @override
  String get myCrop_noCropsInField => 'No crop registered for this field.';

  @override
  String get myCrop_noFieldsDesc =>
      'Add your first field to start tracking your crops and soil details.';

  @override
  String get myCrop_noFieldsYet => 'No fields registered yet';

  @override
  String get myCrop_notes => 'Additional Notes';

  @override
  String get myCrop_previousCrop => 'Previous Crop';

  @override
  String get myCrop_reviewTitle => 'Review Field & Crop Data';

  @override
  String get myCrop_saveCrop => 'Save Crop';

  @override
  String get myCrop_saveField => 'Save Field';

  @override
  String get myCrop_seedDemo => '🌱 Seed Demo Fields';

  @override
  String get myCrop_soilTestReport => 'Do you have a soil test report?';

  @override
  String get myCrop_soilType => 'Soil Type';

  @override
  String get myCrop_sowingDate => 'Sowing / Planting Date';

  @override
  String get myCrop_status => 'Crop Status';

  @override
  String get myCrop_step1 => '1. Field Details';

  @override
  String get myCrop_step2 => '2. Soil & Irrigation';

  @override
  String get myCrop_step3 => '3. Crop Registration';

  @override
  String get myCrop_step4 => '4. Review & Save';

  @override
  String get myCrop_subtitle =>
      'Register and manage your farm fields and crop data.';

  @override
  String get myCrop_title => 'My Fields & Crops';

  @override
  String get myCrop_variety => 'Variety';

  @override
  String get myCrop_viewField => 'View Field Details';

  @override
  String get myCrop_waterSource => 'Water Source';

  @override
  String get navCommunity => 'Community';

  @override
  String get navDiagnose => 'Diagnose';

  @override
  String get navFarm => 'My Farm';

  @override
  String get navGroupAdvice => 'Advice';

  @override
  String get navGroupReference => 'Look up';

  @override
  String get navGroupTools => 'Tools';

  @override
  String get navInsights => 'Insights';

  @override
  String get navMarket => 'Market';

  @override
  String get navMore => 'More';

  @override
  String get navbar_activeFarmer => 'Active Farmer';

  @override
  String get navbar_detectingLocation => 'Detecting location…';

  @override
  String get navbar_farmerLogin => 'Farmer Login';

  @override
  String get navbar_fullWeather => 'Full weather';

  @override
  String get navbar_home => 'Home';

  @override
  String get navbar_locationBlocked => 'Location Blocked';

  @override
  String get navbar_locationBlockedDesc =>
      'Your browser has blocked location access. To fix:';

  @override
  String get navbar_locationBlockedStep1 =>
      'Click the lock icon in address bar';

  @override
  String get navbar_locationBlockedStep2 => 'Set Location to Allow';

  @override
  String get navbar_locationBlockedStep3 => 'Then click Retry below';

  @override
  String get navbar_refresh => 'Refresh';

  @override
  String get navbar_retryLocation => 'Retry Location';

  @override
  String get navbar_selectLanguage => 'Select Language:';

  @override
  String get navbar_updated => 'Updated';

  @override
  String get navigation_ai => 'AI Profit';

  @override
  String get navigation_calculator => 'Calculator';

  @override
  String get navigation_communities => 'Communities';

  @override
  String get navigation_diseases => 'Diseases';

  @override
  String get navigation_home => 'Home';

  @override
  String get navigation_myCrops => 'My Crops';

  @override
  String get navigation_products => 'Products';

  @override
  String get navigation_profile => 'Profile';

  @override
  String get navigation_weather => 'Weather';

  @override
  String get navigation_yieldAi => 'Yield AI';

  @override
  String get offlineBanner => 'No internet. Showing what was saved.';

  @override
  String offlineDays(String count) {
    return '$count days ago';
  }

  @override
  String offlineHours(String count) {
    return '$count hours ago';
  }

  @override
  String get offlineJustNow => 'just now';

  @override
  String offlineMinutes(String count) {
    return '$count minutes ago';
  }

  @override
  String get offlineQueued =>
      'No signal. Your reply is saved and will be sent when you are back online.';

  @override
  String offlineShowingSaved(String when) {
    return 'Saved $when. Connect to get the latest.';
  }

  @override
  String get onboardDistrict => 'District';

  @override
  String get onboardFinish => 'Continue';

  @override
  String get onboardMainCrop => 'Main crop';

  @override
  String get onboardMobile => 'Mobile number';

  @override
  String get onboardName => 'Your name';

  @override
  String get onboardSkip => 'Skip for now';

  @override
  String get onboardTitle => 'Tell us about your farm';

  @override
  String get onboardVillage => 'Village';

  @override
  String get onboardWhy =>
      'This lets us give advice for your area and your crops.';

  @override
  String predAbove(String value) {
    return '$value% above your region';
  }

  @override
  String get predArea => 'Area (acres)';

  @override
  String predBelow(String value) {
    return '$value% below your region';
  }

  @override
  String predConfidence(String value) {
    return '$value% confident';
  }

  @override
  String get predCosts => 'Your input costs';

  @override
  String get predCrop => 'Crop';

  @override
  String get predEstimatedPrice =>
      'This estimate uses a baseline price, not a live market rate.';

  @override
  String get predFallbackNote =>
      'The prediction model could not be reached, so this is a rough estimate from average figures for this crop.';

  @override
  String get predFertCost => 'Fertilizer cost (₹)';

  @override
  String get predIrrigCost => 'Irrigation cost (₹)';

  @override
  String get predLoss => 'You may not cover your input costs.';

  @override
  String get predMargin => 'Left after input costs';

  @override
  String get predMarginNote =>
      'This counts only the fertilizer, pesticide and irrigation you entered. Seed, labour, land and transport are not included, so your real profit will be lower.';

  @override
  String get predNdvi => 'Crop greenness (NDVI)';

  @override
  String get predNdviHelp =>
      'How green and healthy the crop looks from above. Leave as-is if unsure.';

  @override
  String predNoBaseline(String crop) {
    return 'We do not have a yield baseline for $crop yet. Try the Profit tab, which covers more crops.';
  }

  @override
  String predPerAcre(String value) {
    return '$value t per acre';
  }

  @override
  String get predPestCost => 'Pesticide cost (₹)';

  @override
  String predPrice(String value) {
    return '₹$value per quintal';
  }

  @override
  String predQuintals(String value) {
    return '$value quintals';
  }

  @override
  String get predRainfall => 'Season rainfall (mm)';

  @override
  String get predRevenue => 'Expected revenue';

  @override
  String get predRun => 'Estimate';

  @override
  String get predRunning => 'Working';

  @override
  String get predSoilMoisture => 'Soil moisture (%)';

  @override
  String get predTabMandi => 'Mandi';

  @override
  String get predTabProfit => 'Profit';

  @override
  String get predTabYield => 'Yield';

  @override
  String predTonnes(String value) {
    return '$value tonnes';
  }

  @override
  String predVsRegion(String value) {
    return 'Regional average $value t per acre';
  }

  @override
  String get predYieldResult => 'Expected harvest';

  @override
  String get productsFeatures => 'Why it helps';

  @override
  String get productsNone => 'No products match that search';

  @override
  String get productsPage_allProducts => '← All Products';

  @override
  String get productsPage_buyOnWhatsApp => 'Buy on WhatsApp';

  @override
  String get productsPage_footer =>
      '© 2026 KisanDost · Empowering Indian Farmers';

  @override
  String get productsPage_heroSubtitle =>
      'Science-backed crop nutrition and soil enhancement products for modern farming.';

  @override
  String get productsPage_heroTag => '🌾 Agricultural Solutions';

  @override
  String get productsPage_heroTitle => 'KisanDost Products';

  @override
  String get productsPage_loading => 'Loading product...';

  @override
  String get productsPage_noFeatures => 'No features listed for this product.';

  @override
  String get productsPage_noUsage =>
      'Usage information not available. Please contact us for dosage details.';

  @override
  String get productsPage_notFoundDesc =>
      'The product you are looking for does not exist.';

  @override
  String get productsPage_priceLabel => 'Price:';

  @override
  String get productsPage_priceOnRequest => 'Price on request';

  @override
  String get productsPage_productNotFound => 'Product Not Found';

  @override
  String get productsPage_solvesLabel => 'Solves';

  @override
  String get productsPage_tabs_features => 'Features';

  @override
  String get productsPage_tabs_overview => 'Overview';

  @override
  String get productsPage_tabs_usage => 'Usage';

  @override
  String get productsPage_viewProduct => 'View Product →';

  @override
  String productsPrice(String amount) {
    return '₹$amount';
  }

  @override
  String get productsSearch => 'Search products';

  @override
  String get productsStaticNote =>
      'A reference list of common agri-inputs. Prices are indicative — check with your dealer.';

  @override
  String get productsTitle => 'Products';

  @override
  String get productsUsage => 'How to use';

  @override
  String get products_Abamectin_description =>
      'Effective against mites and leaf miners in a variety of crops.';

  @override
  String get products_Abamectin_longDescription =>
      'Abamectin 1.9% EC is a mixture of avermectins, producing toxic effects in insects and mites by stimulating the release of gamma-aminobutyric acid (GABA), an inhibitory neurotransmitter. It provides excellent control of spider mites and leaf miners in crops like roses, grapes, apples, and tomatoes.';

  @override
  String get products_Abamectin_name => 'Abamectin 1.9% EC';

  @override
  String get products_Abamectin_tag => 'Miticide / Insecticide';

  @override
  String get products_Abamectin_usage_apple =>
      '0.05% solution, 6-7 L water per tree (7 days waiting period)';

  @override
  String get products_Abamectin_usage_grapes =>
      '0.75 ml/L water in 500-1000 L water per ha (3 days waiting period)';

  @override
  String get products_Abamectin_usage_rose =>
      '0.025-0.05% solution in 5000 L water per ha (3 days waiting period)';

  @override
  String get products_Abamectin_usage_tomato =>
      '450-600 ml in 500 L water per ha (3 days waiting period)';

  @override
  String get products_AcephateImida_description =>
      'A powerful combination for controlling both sucking and borer pests.';

  @override
  String get products_AcephateImida_longDescription =>
      'This combination product harnesses the systemic and contact action of Imidacloprid with the broad-spectrum activity of Acephate. It provides a comprehensive solution for complex pest infestations, effectively managing jassids, aphids, thrips, whiteflies, and bollworms in crops like cotton, chilli, and paddy.';

  @override
  String get products_AcephateImida_name =>
      'Acephate 50% + Imidacloprid 1.8% SP';

  @override
  String get products_AcephateImida_tag => 'Combination SP';

  @override
  String get products_AcephateImida_usage_chilli =>
      '518 g a.i./ha (1000 g) in 500 L water (3 days waiting)';

  @override
  String get products_AcephateImida_usage_cotton =>
      '518 g a.i./ha (1000 g) in 500 L water (40 days waiting)';

  @override
  String get products_AcephateImida_usage_rice =>
      '518 g a.i./ha (1000 g) in 500 L water';

  @override
  String get products_AcephateImida_usage_sugarcane =>
      '1250+45 g a.i./ha (2500 ml) in 500 L water (123 days waiting)';

  @override
  String get products_Acephate_description =>
      'Broad-spectrum systemic insecticide for sucking and chewing pests.';

  @override
  String get products_Acephate_longDescription =>
      'Acephate 75% SP is a soluble powder that acts as a systemic and contact insecticide. It is absorbed by leaves and roots, providing effective control against a wide range of pests including jassids, bollworms, aphids, and stem borers in crops like cotton, rice, and safflower.';

  @override
  String get products_Acephate_name => 'Acephate 75% SP';

  @override
  String get products_Acephate_tag => 'Systemic Insecticide';

  @override
  String get products_Acephate_usage_cottonBollworms =>
      '584 g a.i./ha (780 g formulation) in 500-1000 L water (15 days waiting)';

  @override
  String get products_Acephate_usage_cottonJassids =>
      '292 g a.i./ha (390 g formulation) in 500-1000 L water (15 days waiting)';

  @override
  String get products_Acephate_usage_ricePests =>
      '500-750 g a.i./ha (666-1000 g formulation) in 300-500 L water (15 days waiting)';

  @override
  String get products_Acephate_usage_safflowerAphids =>
      '584 g a.i./ha (780 g formulation) in 500-1000 L water (15 days waiting)';

  @override
  String get products_Acetamiprid_description =>
      'Systemic insecticide for effective control of sap-feeding insects.';

  @override
  String get products_Acetamiprid_longDescription =>
      'Acetamiprid 20% SP is a systemic, neonicotinoid insecticide that acts on the central nervous system of insects, causing paralysis and death. It is highly effective against aphids, jassids, thrips, and whiteflies in a variety of crops including cotton, cabbage, okra, chilli, and rice.';

  @override
  String get products_Acetamiprid_name => 'Acetamiprid 20% SP';

  @override
  String get products_Acetamiprid_tag => 'Neonicotinoid';

  @override
  String get products_Acetamiprid_usage_cabbageAphids =>
      '15 g a.i./ha (75 g formulation) in 500-600 L water (7 days waiting)';

  @override
  String get products_Acetamiprid_usage_chilliThrips =>
      '10-20 g a.i./ha (50-100 g formulation) in 500-600 L water (3 days waiting)';

  @override
  String get products_Acetamiprid_usage_cottonAphidsJassids =>
      '10 g a.i./ha (50 g formulation) in 500-600 L water (15 days waiting)';

  @override
  String get products_Acetamiprid_usage_cottonWhiteflies =>
      '20 g a.i./ha (100 g formulation) in 500-600 L water (15 days waiting)';

  @override
  String get products_Acetamiprid_usage_okraAphids =>
      '15 g a.i./ha (75 g formulation) in 500-600 L water (3 days waiting)';

  @override
  String get products_Acetamiprid_usage_riceBph =>
      '10-20 g a.i./ha (50-100 g formulation) in 500-600 L water (7 days waiting)';

  @override
  String get products_AluminumPhosphide_description =>
      'A highly effective fumigant for stored grain pest control.';

  @override
  String get products_AluminumPhosphide_longDescription =>
      'Aluminum Phosphide 56% is a solid fumigant that reacts with moisture in the air to release phosphine gas. It is used to control a broad spectrum of stored grain pests like weevils, borers, and beetles in cereals, pulses, oilseeds, and spices, as well as for rodent control in burrows.';

  @override
  String get products_AluminumPhosphide_name => 'Aluminum Phosphide 56%';

  @override
  String get products_AluminumPhosphide_tag => 'Fumigant';

  @override
  String get products_AluminumPhosphide_usage_cerealsPulses =>
      '3 tablets (3g) per ton or 150g/100m³, exposure 5-7 days, aeration 48 hrs';

  @override
  String get products_AluminumPhosphide_usage_godowns =>
      '14 tablets/1000m³ or 150g/100m³, exposure 72 hrs, aeration 24 hrs';

  @override
  String get products_AluminumPhosphide_usage_oilseedsSpices =>
      '3 tablets per ton or 225g/100m³, exposure 5 days, aeration 48 hrs';

  @override
  String get products_AluminumPhosphide_usage_rodentBurrows =>
      '1 tablet per burrow';

  @override
  String get products_Brodifacoum_description =>
      'A potent, single-feed anticoagulant rodenticide for field and premises.';

  @override
  String get products_Brodifacoum_longDescription =>
      'Brodifacoum 0.005% BB is a powerful anticoagulant rodenticide. It works by inhibiting the synthesis of Vitamin K, essential for blood clotting, leading to the death of rodents from internal hemorrhaging. It is a single-feed bait, effective against a wide range of rats, bandicoots, and mice in agricultural, commercial, and residential settings.';

  @override
  String get products_Brodifacoum_name => 'Brodifacoum 0.005% BB';

  @override
  String get products_Brodifacoum_tag => 'Rodenticide';

  @override
  String get products_Brodifacoum_usage_burrowBaiting =>
      'Place bait near active burrows';

  @override
  String get products_Brodifacoum_usage_fieldRats =>
      'One bait block (20g) per baiting station as single feed';

  @override
  String get products_Brodifacoum_usage_residential =>
      'Place in and around premises, cold storage, godowns, warehouses';

  @override
  String get products_ChlLambda_description =>
      'A potent mix of diamide and pyrethroid for rapid and residual control.';

  @override
  String get products_ChlLambda_longDescription =>
      'This combination formulation contains Chlorantraniliprole (a ryanodine receptor modulator) and Lambda-cyhalothrin (a sodium channel modulator). It provides both quick knockdown and long-lasting residual control of a wide range of pests including fruit borers, bollworms, leaf folders, jassids, and beetles in crops like pigeon pea, cotton, brinjal, and maize.';

  @override
  String get products_ChlLambda_name =>
      'Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC';

  @override
  String get products_ChlLambda_tag => 'Combination ZC';

  @override
  String get products_ChlLambda_usage_brinjal =>
      '28 g a.i./ha (200 ml) in 500 L water (5 days waiting)';

  @override
  String get products_ChlLambda_usage_cotton =>
      '37.5 g a.i./ha (250 ml) in 500 L water (20 days waiting)';

  @override
  String get products_ChlLambda_usage_maize =>
      '35 g a.i./ha (250 ml) in 500 L water (36 days waiting)';

  @override
  String get products_ChlLambda_usage_okra =>
      '28 g a.i./ha (200 ml) in 500 L water (3 days waiting)';

  @override
  String get products_ChlLambda_usage_pigeonPea =>
      '30 g a.i./ha (200 ml) in 500 L water (18 days waiting)';

  @override
  String get products_ChlLambda_usage_rice =>
      '28-35 g a.i./ha (200-250 ml) in 500 L water (53 days waiting)';

  @override
  String get products_ChlLambda_usage_soybean =>
      '28 g a.i./ha (200 ml) in 500 L water (41 days waiting)';

  @override
  String get products_Chlorantraniliprole_description =>
      'Targets lepidopteran pests by disrupting their muscle contraction.';

  @override
  String get products_Chlorantraniliprole_longDescription =>
      'Chlorantraniliprole 18.5% SC belongs to the anthranilic diamide class of insecticides. It works by activating the ryanodine receptors in insects, leading to uncontrolled muscle contraction, paralysis, and death. It is highly effective against stem borers, fruit borers, and caterpillars in crops like rice, cotton, and vegetables.';

  @override
  String get products_Chlorantraniliprole_name =>
      'Chlorantraniliprole 18.5% SC';

  @override
  String get products_Chlorantraniliprole_tag => 'Anthranilic Diamide';

  @override
  String get products_Chlorantraniliprole_usage_brinjal =>
      '40 g a.i./ha (200 ml) in 500-750 L water (22 days waiting)';

  @override
  String get products_Chlorantraniliprole_usage_cabbage =>
      '10 g a.i./ha (50 ml) in 500 L water (3 days waiting)';

  @override
  String get products_Chlorantraniliprole_usage_chilli =>
      '30 g a.i./ha (150 ml) in 500 L water (3 days waiting)';

  @override
  String get products_Chlorantraniliprole_usage_cotton =>
      '30 g a.i./ha (150 ml) in 500 L water (9 days waiting)';

  @override
  String get products_Chlorantraniliprole_usage_rice =>
      '30 g a.i./ha (150 ml) in 500 L water (47 days waiting)';

  @override
  String get products_Chlorantraniliprole_usage_tomato =>
      '30 g a.i./ha (150 ml) in 500 L water (3 days waiting)';

  @override
  String get products_Cypermethrin_description =>
      'A fast-acting, broad-spectrum insecticide for diverse crops.';

  @override
  String get products_Cypermethrin_longDescription =>
      'Cypermethrin 10% EC is a synthetic pyrethroid insecticide that acts on the nervous system of insects, providing quick knockdown and kill. It is effective against a wide range of chewing and sucking pests, including bollworms, diamondback moths, fruit borers, and jassids in crops such as cotton, cabbage, okra, brinjal, and wheat.';

  @override
  String get products_Cypermethrin_name => 'Cypermethrin 10% EC';

  @override
  String get products_Cypermethrin_tag => 'Pyrethroid';

  @override
  String get products_Cypermethrin_usage_brinjal =>
      '50-70 g a.i./ha (550-760 ml) in 150-400 L water (3 days waiting)';

  @override
  String get products_Cypermethrin_usage_cabbage =>
      '60-70 g a.i./ha (650-760 ml) in 100-400 L water (7 days waiting)';

  @override
  String get products_Cypermethrin_usage_cotton =>
      '50-70 g a.i./ha (550-760 ml) in 150-1000 L water (7 days waiting)';

  @override
  String get products_Cypermethrin_usage_okra =>
      '50-70 g a.i./ha (550-760 ml) in 150-400 L water (3 days waiting)';

  @override
  String get products_Cypermethrin_usage_wheat =>
      '50 g a.i./ha (550 ml) in 500-800 L water (14 days waiting)';

  @override
  String get products_Deltamethrin_description =>
      'High-potency insecticide for agriculture and public health.';

  @override
  String get products_Deltamethrin_longDescription =>
      'Deltamethrin 2.8% EC is a highly potent synthetic pyrethroid insecticide. It disrupts the nervous system of insects, causing immediate paralysis. It is used in agriculture to control bollworms, leaf folders, thrips, and borers, and in public health for mosquito control. Its high activity means lower dosage rates are required.';

  @override
  String get products_Deltamethrin_name => 'Deltamethrin 2.8% EC';

  @override
  String get products_Deltamethrin_tag => 'Pyrethroid';

  @override
  String get products_Deltamethrin_usage_chilli =>
      '10-12.5 g a.i./ha (400-500 ml) in 400-600 L water (5 days waiting)';

  @override
  String get products_Deltamethrin_usage_cotton =>
      '12.5 g a.i./ha (500 ml) in 400-600 L water';

  @override
  String get products_Deltamethrin_usage_groundnut =>
      '12.5 g a.i./ha (500 ml) in 400-600 L water (3 days waiting)';

  @override
  String get products_Deltamethrin_usage_okra =>
      '10-15 g a.i./ha (400-600 ml) in 400-600 L water (1 day waiting)';

  @override
  String get products_Deltamethrin_usage_publicHealthMosquito =>
      'Thermal fogging 0.5 g a.i./ha or ULV 0.5 g a.i./ha';

  @override
  String get products_Deltamethrin_usage_teaThrips =>
      '3-4 g a.i./ha (120-150 ml) in 400-600 L water (3 days waiting)';

  @override
  String get products_Imidacloprid_description =>
      'A systemic insecticide for long-lasting control of sucking pests.';

  @override
  String get products_Imidacloprid_longDescription =>
      'Imidacloprid 70% WG is a systemic insecticide from the neonicotinoid group. It is absorbed by plants and moves through the vascular system, providing long-lasting protection against sap-feeding insects. It is highly effective against jassids, aphids, thrips, and whiteflies in cotton, rice, vegetables, and other crops.';

  @override
  String get products_Imidacloprid_name => 'Imidacloprid 70% WG';

  @override
  String get products_Imidacloprid_tag => 'Neonicotinoid';

  @override
  String get products_Imidacloprid_usage_cotton =>
      '21-24.5 g a.i./ha (30-35 g) in 375-500 L water (7 days waiting)';

  @override
  String get products_Imidacloprid_usage_cucumber =>
      '24.5 g a.i./ha (35 g) in 500 L water (5 days waiting)';

  @override
  String get products_Imidacloprid_usage_okra =>
      '21-24.5 g a.i./ha (30-35 g) in 300-375 L water (3 days waiting)';

  @override
  String get products_Imidacloprid_usage_potato =>
      '63 g a.i./ha (90 g) in 500 L water (30 days waiting)';

  @override
  String get products_Imidacloprid_usage_rice =>
      '21-24.5 g a.i./ha (30-35 g) in 300-375 L water (7 days waiting)';

  @override
  String get products_Imidacloprid_usage_tomato =>
      '35 g a.i./ha (50 g) in 500 L water (5 days waiting)';

  @override
  String get products_LambdaCS_description =>
      'A microencapsulated formulation for effective mosquito control.';

  @override
  String get products_LambdaCS_longDescription =>
      'Lambda-cyhalothrin 9.7% CS is a public health insecticide formulated for indoor residual spraying (IRS). Its microencapsulation technology provides a safer and longer-lasting residual effect on various wall surfaces. It is specifically recommended for controlling mosquitoes that transmit malaria, dengue, and other vector-borne diseases.';

  @override
  String get products_LambdaCS_name => 'Lambda-cyhalothrin 9.7% CS';

  @override
  String get products_LambdaCS_tag => 'Public Health Insecticide';

  @override
  String get products_LambdaCS_usage_highInfestation =>
      '25 mg a.i./sq.m (5 ml/L water) spray solution 50 ml/sq.m';

  @override
  String get products_LambdaCS_usage_malariaControl =>
      '25 mg a.i./sq.m (12.5 ml/500 sq.m) in 10 L water';

  @override
  String get products_LambdaCS_usage_moderateInfestation =>
      '20 mg a.i./sq.m (4 ml/L water) spray solution 50 ml/sq.m';

  @override
  String get products_MiticideViricideCombo_description =>
      'A powerful combination of miticide and viricide to protect crops from mites and viral diseases.';

  @override
  String get products_MiticideViricideCombo_longDescription =>
      'Miticide + Lysorus Viricide Combo provides dual protection against harmful mites and viral infections in crops.';

  @override
  String get products_MiticideViricideCombo_name =>
      'Miticide + Lysorus Viricide Combo';

  @override
  String get products_MiticideViricideCombo_tag => 'Crop Protection Combo';

  @override
  String get products_MiticideViricideCombo_usage_foliarSpray =>
      '2-3 ml per liter of water';

  @override
  String get products_NAA_description =>
      'Prevents flower and fruit drop in a wide range of crops.';

  @override
  String get products_NAA_longDescription =>
      'NAA (Naphthalene Acetic Acid) 4.5% SL is a synthetic plant hormone in the auxin family. It is primarily used to prevent the premature shedding of flowers, squares, and bolls, thereby improving fruit set and overall yield. It is effective in crops like cotton, tomatoes, and mangoes.';

  @override
  String get products_NAA_name => 'NAA 4.5% SL';

  @override
  String get products_NAA_tag => 'Plant Growth Regulator';

  @override
  String get products_NAA_usage_cotton =>
      '222-444 ml in 1000 L water per ha (3 sprays from square formation)';

  @override
  String get products_NAA_usage_mango =>
      '15 ml formulation per 100 L water (pre-harvest spray)';

  @override
  String get products_NAA_usage_tomato =>
      '20-40 ml in 1000 L water per ha (at flowering and fruit set)';

  @override
  String get products_PrallethrinLV_description =>
      'A fast-acting liquid vaporizer for immediate mosquito protection.';

  @override
  String get products_PrallethrinLV_longDescription =>
      'This liquid vaporizer contains Prallethrin, a synthetic pyrethroid known for its rapid knockdown effect against mosquitoes. It is highly effective in eliminating mosquitoes quickly and providing a comfortable environment. It is safe for use in homes when used as directed.';

  @override
  String get products_PrallethrinLV_name =>
      'Prallethrin 0.65% Liquid Vaporizer';

  @override
  String get products_PrallethrinLV_tag => 'Household Insecticide';

  @override
  String get products_PrallethrinLV_usage_area =>
      'Effective for rooms up to 300-400 sq.ft';

  @override
  String get products_PrallethrinLV_usage_indoor =>
      'Use with standard liquid vaporizer machine, one refill provides 30-45 nights protection';

  @override
  String get products_RupiyaKuber_description =>
      'A natural liquid manure supplement providing balanced potassium, carbon, and magnesium to the crop.';

  @override
  String get products_RupiyaKuber_longDescription =>
      'It\'s a natural liquid manure supplement which provides balanced amounts of potassium, carbon and magnesium to the crop. Increases productivity and quality of crops by enhancing the process of photosynthesis and pollen germination.';

  @override
  String get products_RupiyaKuber_name => 'Rupiya Kuber';

  @override
  String get products_RupiyaKuber_tag => 'Liquid Manure Supplement';

  @override
  String get products_RupiyaKuber_usage_dripIrrigation =>
      '10-15 liters per acre';

  @override
  String get products_RupiyaKuber_usage_foliarSpray =>
      '5-10 ml per liter of water';

  @override
  String get products_TapasSiliconAdjuvant_description =>
      'A silicon-based adjuvant that enhances pesticide efficiency and strengthens plant defense.';

  @override
  String get products_TapasSiliconAdjuvant_longDescription =>
      'Tapas Silicon Adjuvant improves the effectiveness of pesticides and foliar sprays.';

  @override
  String get products_TapasSiliconAdjuvant_name => 'Tapas Silicon Adjuvant';

  @override
  String get products_TapasSiliconAdjuvant_tag => 'Silicon-Based Adjuvant';

  @override
  String get products_TapasSiliconAdjuvant_usage_foliarSpray =>
      '0.5-1 ml per liter of water';

  @override
  String get products_Temephos_description =>
      'A larvicide for controlling mosquito breeding in water bodies.';

  @override
  String get products_Temephos_longDescription =>
      'Temephos 1% GR is an organophosphate larvicide used in public health programs to control mosquito larvae. It is applied to breeding habitats such as stagnant water, ponds, drains, and containers to prevent the emergence of adult mosquitoes. It is highly effective against Aedes, Anopheles, and Culex species.';

  @override
  String get products_Temephos_name => 'Temephos 1% GR';

  @override
  String get products_Temephos_tag => 'Larvicide';

  @override
  String get products_Temephos_usage_cleanWater =>
      '50-100 g a.i./ha (5-10 kg/ha) for ponds, lakes';

  @override
  String get products_Temephos_usage_cyclopsControl =>
      '0.5-1.0 g a.i. (5-10 g) for ponds, step wells';

  @override
  String get products_Temephos_usage_highlyPolluted =>
      '200-500 g a.i./ha (20-50 kg/ha) for drains, cesspits';

  @override
  String get products_Temephos_usage_moderatelyPolluted =>
      '100-200 g a.i./ha (10-20 kg/ha) for marshes, swamps';

  @override
  String get products_Thiamethoxam_description =>
      'Systemic insecticide with rapid action for comprehensive crop protection.';

  @override
  String get products_Thiamethoxam_longDescription =>
      'Thiamethoxam 25% WG is a second-generation neonicotinoid insecticide with excellent systemic and translaminar activity. It works by interfering with nicotinic acetylcholine receptors in the insect nervous system. It is effective against a broad spectrum of sucking and some chewing pests in rice, cotton, vegetables, and mangoes.';

  @override
  String get products_Thiamethoxam_name => 'Thiamethoxam 25% WG';

  @override
  String get products_Thiamethoxam_tag => 'Neonicotinoid';

  @override
  String get products_Thiamethoxam_usage_cottonJassid =>
      '25 g a.i./ha (100 g) in 500-750 L water (21 days waiting)';

  @override
  String get products_Thiamethoxam_usage_cottonWhitefly =>
      '50 g a.i./ha (200 g) in 500-750 L water (21 days waiting)';

  @override
  String get products_Thiamethoxam_usage_mango =>
      '25 g a.i./ha (100 g) in 1000 L water (30 days waiting)';

  @override
  String get products_Thiamethoxam_usage_okra =>
      '25 g a.i./ha (100 g) in 500-1000 L water (5 days waiting)';

  @override
  String get products_Thiamethoxam_usage_rice =>
      '25 g a.i./ha (100 g) in 500-750 L water (14 days waiting)';

  @override
  String get products_Thiamethoxam_usage_wheat =>
      '12.5 g a.i./ha (50 g) in 500 L water (21 days waiting)';

  @override
  String get products_TransfluthrinLV_description =>
      'A ready-to-use liquid vaporizer for mosquito-free homes.';

  @override
  String get products_TransfluthrinLV_longDescription =>
      'This is a ready-to-use household insecticide in a liquid vaporizer format. It contains Transfluthrin, a fast-acting pyrethroid that effectively repels and kills mosquitoes (Aedes, Anopheles, Culex) and houseflies. It provides a convenient and continuous protection system for indoor use.';

  @override
  String get products_TransfluthrinLV_name =>
      'Transfluthrin 0.88% Liquid Vaporizer';

  @override
  String get products_TransfluthrinLV_tag => 'Household Insecticide';

  @override
  String get products_TransfluthrinLV_usage_area =>
      'Effective for rooms up to 300-400 sq.ft';

  @override
  String get products_TransfluthrinLV_usage_indoor =>
      'Use with standard liquid vaporizer machine, one refill provides 30-45 nights protection';

  @override
  String get profileEdit => 'Edit profile';

  @override
  String get profileSaved => 'Saved';

  @override
  String get profitPredictor_autoFetchDesc =>
      'Retrieving weather and environmental data';

  @override
  String get profitPredictor_autoFetchTitle => 'Auto-fetching data...';

  @override
  String get profitPredictor_confidence => 'Confidence';

  @override
  String get profitPredictor_cropType => 'Crop Type';

  @override
  String get profitPredictor_description =>
      'Calculate your expected profit based on farm inputs and market rates.';

  @override
  String get profitPredictor_developerPanel => 'Developer Debug Panel';

  @override
  String get profitPredictor_expectedRevenue => 'Expected Revenue';

  @override
  String get profitPredictor_fertilizerCost => 'Fertilizer Cost';

  @override
  String get profitPredictor_insights_costWarning =>
      'Your pesticide costs seem higher than regional averages.';

  @override
  String get profitPredictor_insights_goodProfit =>
      'Your estimated profit is healthy for this crop!';

  @override
  String get profitPredictor_insights_optimize =>
      'Switching to organic fertilizer may reduce input costs.';

  @override
  String get profitPredictor_irrigationCost => 'Irrigation Cost';

  @override
  String get profitPredictor_landArea => 'Land Area';

  @override
  String get profitPredictor_locationSelected => 'Location selected';

  @override
  String get profitPredictor_manualMode => 'Manual Mode';

  @override
  String get profitPredictor_pesticideCost => 'Pesticide Cost';

  @override
  String get profitPredictor_predictButton => 'Predict Profit';

  @override
  String get profitPredictor_predictedProfit => 'Predicted Profit';

  @override
  String get profitPredictor_predicting => 'Predicting...';

  @override
  String get profitPredictor_predictionError =>
      'Failed to calculate prediction.';

  @override
  String get profitPredictor_predictionSuccess => 'Profit prediction complete!';

  @override
  String get profitPredictor_rainfall => 'Rainfall';

  @override
  String get profitPredictor_readyToPredict => 'Ready to predict your profit?';

  @override
  String get profitPredictor_readyToPredictDesc =>
      'Fill out the form on the left with your land area and input costs to get AI-powered profit insights.';

  @override
  String get profitPredictor_recommendation => 'Recommendation';

  @override
  String get profitPredictor_selectCrop => 'Select Crop';

  @override
  String get profitPredictor_selectLocation => 'Select your farm location';

  @override
  String get profitPredictor_smartMode => 'Smart Mode';

  @override
  String get profitPredictor_soilNitrogen => 'Soil Nitrogen';

  @override
  String get profitPredictor_soilPhosphorus => 'Soil Phosphorus';

  @override
  String get profitPredictor_soilPotassium => 'Soil Potassium';

  @override
  String get profitPredictor_title => 'Profit Predictor';

  @override
  String get profitPredictor_totalCost => 'Total Cost';

  @override
  String get scanAgain => 'Check another';

  @override
  String get scanBrand => 'Brand';

  @override
  String get scanCheck => 'Check';

  @override
  String get scanChecking => 'Checking';

  @override
  String get scanCodeLabel => 'Code on the pack';

  @override
  String scanCodeWas(String code) {
    return 'Code read: $code';
  }

  @override
  String get scanDose => 'Dose per acre';

  @override
  String get scanFake => 'Do not use';

  @override
  String get scanFakeDetail =>
      'This code is flagged as counterfeit in the official registry. Report it to your dealer.';

  @override
  String get scanGenuine => 'Genuine';

  @override
  String get scanGenuineDetail => 'This product is in the official registry.';

  @override
  String get scanHelp => 'Point the camera at the QR code on the pack.';

  @override
  String get scanHowToUse => 'How to use';

  @override
  String get scanLicence => 'Licence no.';

  @override
  String get scanManual => 'Or type the code';

  @override
  String get scanManufacturer => 'Made by';

  @override
  String get scanPremiumNeeded =>
      'Pesticide checking needs a premium membership on your account.';

  @override
  String get scanPremiumTitle => 'Premium feature';

  @override
  String get scanProduct => 'Product';

  @override
  String get scanSignIn => 'Sign in to check a pesticide.';

  @override
  String get scanTitle => 'Check pesticide';

  @override
  String get scanType => 'Type';

  @override
  String get scanUnknown => 'Not in the registry';

  @override
  String get scanUnknownDetail =>
      'No record of this code. That does not prove it is fake, but check with your dealer before using it.';

  @override
  String get schemesAll => 'All';

  @override
  String get schemesBenefits => 'What you get';

  @override
  String get schemesCuratedNote =>
      'A hand-checked list, not a live government feed. Always confirm details on the official site.';

  @override
  String get schemesEligibility => 'Who can apply';

  @override
  String schemesLaunched(String when) {
    return 'Started $when';
  }

  @override
  String get schemesNone => 'No schemes match that search';

  @override
  String get schemesOpen => 'Open official website';

  @override
  String get schemesSearch => 'Search schemes';

  @override
  String get schemesTitle => 'Government schemes';

  @override
  String get schemesYouQualify => 'You qualify';

  @override
  String get schemesNeedDoc => 'Need a document';

  @override
  String get schemesAllCount => 'All schemes';

  @override
  String get schemesMatchedFarm => 'Matched to your farm';

  @override
  String get schemesHowToApply => 'How to apply';

  @override
  String get schemesSave => 'Save';

  @override
  String get suggestAddField => 'Add your field';

  @override
  String get suggestAddFieldWhy =>
      'Everything else — advice, prices, the crop calendar — works from your field.';

  @override
  String get suggestAsk => 'Ask KisanDost';

  @override
  String suggestAskCrop(String crop) {
    return 'Ask about your $crop';
  }

  @override
  String get suggestAskWhy =>
      'Any question, in your own words. Speak it if that is easier.';

  @override
  String suggestInDays(String days) {
    return 'In $days days';
  }

  @override
  String get voiceListening => 'Listening — tap to stop';

  @override
  String get voiceSpeak => 'Speak your answer';

  @override
  String get voiceStart => 'Speak instead of typing';

  @override
  String get voiceStop => 'Stop';

  @override
  String weatherFeels(String value) {
    return 'Feels like $value°';
  }

  @override
  String get weatherForecast => 'Next days';

  @override
  String get weatherHeatWarn => 'Very hot. Irrigate early morning or evening.';

  @override
  String get weatherHumidity => 'Humidity';

  @override
  String get weatherLocating => 'Finding your location';

  @override
  String get weatherLocationBlocked =>
      'Location is blocked for this app. Allow it in your phone\'s Settings.';

  @override
  String get weatherLocationDenied =>
      'Location is off. Search for your village instead.';

  @override
  String get weatherLocationOff =>
      'Turn on location on your phone, then try again.';

  @override
  String get weatherLocationSlow =>
      'Could not find your location. Try again outdoors, or search for your town.';

  @override
  String get weatherPage_allowLocation => 'Allow location access when prompted';

  @override
  String get weatherPage_cloudCover => 'Cloud Cover';

  @override
  String get weatherPage_detectingLocation => 'Detecting your location…';

  @override
  String get weatherPage_failedFetch => 'Failed to fetch weather';

  @override
  String get weatherPage_feelsLike => 'Feels like';

  @override
  String get weatherPage_fetchingWeather => 'Fetching weather…';

  @override
  String get weatherPage_gettingConditions => 'Getting the latest conditions';

  @override
  String get weatherPage_gustSpeed => 'Gust Speed';

  @override
  String get weatherPage_humidity => 'Humidity';

  @override
  String get weatherPage_locationDeniedDesc =>
      'Enable location in your browser settings, or search for a city below.';

  @override
  String get weatherPage_locationDeniedTitle => 'Location access denied';

  @override
  String get weatherPage_noLocationDesc =>
      'Click the locate button to use your current location, or search for any city above.';

  @override
  String get weatherPage_noLocationTitle => 'No location selected';

  @override
  String get weatherPage_pressure => 'Pressure';

  @override
  String get weatherPage_rain => 'Rain';

  @override
  String get weatherPage_searchBtn => 'Search';

  @override
  String get weatherPage_searchManually => 'Search manually instead';

  @override
  String get weatherPage_searchPlaceholder => 'City, region or country…';

  @override
  String get weatherPage_subtitle => 'Real-time conditions for any location';

  @override
  String get weatherPage_title => 'Weather';

  @override
  String get weatherPage_useMyLocation => 'Use My Location';

  @override
  String get weatherPage_useMyLocationTitle => 'Use my location';

  @override
  String get weatherPage_uvHigh => 'High';

  @override
  String get weatherPage_uvIndex => 'UV Index';

  @override
  String get weatherPage_uvLow => 'Low';

  @override
  String get weatherPage_uvModerate => 'Moderate';

  @override
  String get weatherPage_uvVeryHigh => 'Very High';

  @override
  String get weatherPage_visibility => 'Visibility';

  @override
  String get weatherPage_wind => 'Wind';

  @override
  String weatherRain(String value) {
    return '$value% chance of rain';
  }

  @override
  String get weatherSearchHint => 'Village, town or district';

  @override
  String get weatherWorkOk => 'Good conditions for field work right now.';

  @override
  String get weatherSprayWarn => 'Rain expected — do not spray today.';

  @override
  String get weatherTips_clear =>
      '✅ Clear skies — good conditions for field work & spraying fertilizers.';

  @override
  String get weatherTips_extremeHeat =>
      '🔥 Extreme heat — water crops early morning, shade young plants.';

  @override
  String get weatherTips_foggy =>
      '🌫️ Foggy morning — delay pesticide spraying until fog clears.';

  @override
  String get weatherTips_frost =>
      '❄️ Near-frost — cover sensitive crops overnight to prevent damage.';

  @override
  String get weatherTips_heavyRainWind =>
      '🌧️ Heavy rain + strong winds — postpone spraying & harvesting.';

  @override
  String get weatherTips_highHeatUV =>
      '☀️ High heat & UV — irrigate at dawn/dusk, protect workers too.';

  @override
  String get weatherTips_highHumidity =>
      '💧 High humidity — watch for fungal disease, ensure good airflow.';

  @override
  String get weatherTips_moderate =>
      '🌱 Moderate conditions — suitable for routine farm activities today.';

  @override
  String get weatherTips_rain =>
      '🌧️ Rain today — skip irrigation, ideal to transplant seedlings.';

  @override
  String get weatherTips_storm =>
      '⚡ Storm alert — avoid fieldwork, secure crops & equipment now.';

  @override
  String get weatherTips_strongWind =>
      '💨 Strong winds — avoid spraying, secure mulch & shade nets.';

  @override
  String get weatherTips_sunnyClear =>
      '🌤️ Good sunny day — great for harvesting & drying grains.';

  @override
  String get weatherUseLocation => 'Use my location';

  @override
  String get weatherWind => 'Wind';

  @override
  String get weatherWindWarn =>
      'Strong wind — spray will drift. Wait for calmer air.';

  @override
  String get weatherFieldImpact => 'What this means for the field';

  @override
  String get weatherNext7Days => 'Next seven days';

  @override
  String get weatherSourceNotice =>
      'Live · WeatherAPI. Open-Meteo is the fallback if it fails.';

  @override
  String get weatherGpsPoint => 'From your saved GPS point';

  @override
  String get yieldPredictor_areaRequired => 'Valid land area is required';

  @override
  String get yieldPredictor_averageRegional => 'Regional Average';

  @override
  String get yieldPredictor_baseYield => 'Base yield';

  @override
  String get yieldPredictor_comparisonChart => 'Yield Comparison';

  @override
  String get yieldPredictor_cropType => 'Crop Type';

  @override
  String get yieldPredictor_cropTypeRequired => 'Crop type is required';

  @override
  String get yieldPredictor_description =>
      'Enter environmental data to predict expected crop yield.';

  @override
  String get yieldPredictor_dry => 'Dry';

  @override
  String get yieldPredictor_enterArea => 'Enter area';

  @override
  String get yieldPredictor_environmental => 'Environmental Data';

  @override
  String get yieldPredictor_expandMap => 'Expand';

  @override
  String get yieldPredictor_farmInputs => 'Farm-specific inputs';

  @override
  String get yieldPredictor_landArea => 'Land Area';

  @override
  String get yieldPredictor_mapInstruction =>
      'Click on your farm to auto-fetch weather & predict yield';

  @override
  String get yieldPredictor_ndvi => 'NDVI (Vegetation Index)';

  @override
  String get yieldPredictor_ndviHigh => 'Dense vegetation';

  @override
  String get yieldPredictor_ndviLow => 'Bare soil';

  @override
  String get yieldPredictor_pageDescription =>
      'Click any farm location on the map. Our Auto-Pilot will instantly fetch live weather, run satellite parameters, and use TensorFlow.js to predict your harvest yield.';

  @override
  String get yieldPredictor_pageTitle => 'Kisan AI Auto-Pilot';

  @override
  String get yieldPredictor_predictButton => 'Predict Yield';

  @override
  String get yieldPredictor_predictYield => 'Predict Yield';

  @override
  String get yieldPredictor_predictedYield => 'Predicted Yield';

  @override
  String get yieldPredictor_predicting => 'Predicting...';

  @override
  String get yieldPredictor_predictionError => 'Failed to predict. Try again.';

  @override
  String get yieldPredictor_predictionSuccess => 'Yield prediction complete!';

  @override
  String get yieldPredictor_rainfall => 'Rainfall (mm)';

  @override
  String get yieldPredictor_readyDescription =>
      'Enter your NDVI, soil moisture, and rainfall data to get an AI-powered yield prediction.';

  @override
  String get yieldPredictor_readyTitle => 'Ready to predict yield?';

  @override
  String get yieldPredictor_regionBaseline => 'Baseline';

  @override
  String get yieldPredictor_satelliteData => 'Satellite & Weather Data';

  @override
  String get yieldPredictor_selectCrop => 'Select a crop...';

  @override
  String get yieldPredictor_soilMoisture => 'Soil Moisture (%)';

  @override
  String get yieldPredictor_stepEnvironment => 'Environment';

  @override
  String get yieldPredictor_stepGuide1 => 'Step 1: Set location on map';

  @override
  String get yieldPredictor_stepGuide2 => 'Step 2: Adjust environmental data';

  @override
  String get yieldPredictor_stepGuide3 => 'Step 3: Select crop & click Predict';

  @override
  String get yieldPredictor_stepMap => 'Location';

  @override
  String get yieldPredictor_stepResults => 'Results';

  @override
  String get yieldPredictor_title => 'Yield Predictor';

  @override
  String get yieldPredictor_tonsPerHectare => 'tons per hectare';

  @override
  String get yieldPredictor_validationError =>
      'Please fill in all required fields';

  @override
  String get yieldPredictor_vsAverage => 'vs regional avg';

  @override
  String get yieldPredictor_wet => 'Wet';
}
