// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Marathi (`mr`).
class L10nMr extends L10n {
  L10nMr([String locale = 'mr']) : super(locale);

  @override
  String advisoryDone(String count) {
    return '$count मागील टप्पे संपले आहेत';
  }

  @override
  String advisoryDose(String amount) {
    return 'तुमच्या शेतासाठी $amount';
  }

  @override
  String get advisoryGeneralNote =>
      'हे पिकाच्या वयानुसार सर्वसाधारण मार्गदर्शन आहे, तुमच्या शेताची पाहणी नव्हे. फवारणीपूर्वी पीक स्वतः पाहा आणि पाकिटावरील सूचना पाळा.';

  @override
  String advisoryNextIn(String days) {
    return 'पुढे, $days दिवसांनी';
  }

  @override
  String get advisoryNoCrops =>
      'शेत आणि पीक जोडा, मग हे पान प्रत्येक टप्प्यावर काय करायचे ते सांगेल.';

  @override
  String get advisoryNoneForCrop => 'या पिकासाठी अजून टप्पा मार्गदर्शन नाही.';

  @override
  String get advisoryNothingDue =>
      'सध्या काही करायचे नाही. पुढची पायरी खाली आहे.';

  @override
  String get advisoryNow => 'आता हे करा';

  @override
  String get advisoryTitle => 'पीक दिनदर्शिका';

  @override
  String get aiAsk => 'शेतीविषयी प्रश्न विचारा';

  @override
  String get aiBusy => 'सहाय्यक व्यस्त आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.';

  @override
  String get aiDisclaimer =>
      'हा सल्ला AI चा आहे, तुमचा जिल्हा आणि पिके लक्षात घेऊन. पैसे खर्च करण्याआधी कृषी अधिकार्याला नक्की विचारा.';

  @override
  String get aiExample1 => 'माझ्या कापसाची पाने पिवळी पडत आहेत. काय करू?';

  @override
  String get aiExample2 => 'या हंगामात गहू कधी पेरावा?';

  @override
  String get aiExample3 => 'एक एकर भाताला किती युरिया लागते?';

  @override
  String get aiIntro =>
      'तुमच्या पिकाविषयी तुमच्या शब्दांत काहीही विचारा. बोलायचे असल्यास मायक दाबा.';

  @override
  String get aiSignIn => 'प्रश्न विचारण्यासाठी साइन इन करा.';

  @override
  String get aiThinking => 'विचार करत आहे';

  @override
  String get aiTitle => 'किसानदोस्तला विचारा';

  @override
  String get appError => 'काहीतरी चूक झाली.';

  @override
  String get appLanguage => 'भाषा';

  @override
  String appLastUpdated(String time) {
    return '$time रोजी अद्यतनित';
  }

  @override
  String get appOffline => 'तुम्ही ऑफलाइन आहात. जतन केलेली माहिती दाखवत आहोत.';

  @override
  String get appRetry => 'पुन्हा प्रयत्न करा';

  @override
  String get appSlow =>
      'यास नेहमीपेक्षा जास्त वेळ लागत आहे. कृपया प्रतीक्षा करा.';

  @override
  String get authCancelled => 'साइन इन रद्द झाले.';

  @override
  String get authGoogle => 'Google ने पुढे जा';

  @override
  String get authOffline => 'तुम्ही ऑफलाइन आहात. जोडून पुन्हा प्रयत्न करा.';

  @override
  String get authProfile => 'प्रोफाइल';

  @override
  String get authRejected =>
      'Google साइन इन करू शकले नाही. पुन्हा प्रयत्न करा.';

  @override
  String get authServerError => 'आत्ता साइन इन होऊ शकले नाही.';

  @override
  String get authSignIn => 'साइन इन करा';

  @override
  String get authSignOut => 'साइन आउट';

  @override
  String get authSigningIn => 'साइन इन होत आहे';

  @override
  String get authStateMismatch =>
      'ही साइन इन लिंक जुळली नाही. कृपया पुन्हा सुरू करा.';

  @override
  String get authTagline => 'तुमचा शेती सोबती';

  @override
  String get authWhyGoogle =>
      'आम्ही तुमचे Google खाते वापरतो जेणेकरून पासवर्ड लक्षात ठेवावा लागणार नाही.';

  @override
  String get chatWidget_callExpert => 'तज्ञांना कॉल करा';

  @override
  String get chatWidget_greeting =>
      '🙏 नमस्ते! मी तुमचा किसानदोस्त AI सहाय्यक आहे.\n\nमी तुम्हाला पिकांचे रोग, खते, हवामान, नफा अंदाज आणि सरकारी योजनांबद्दल मदत करू शकतो!\n\nखाली तुमचा प्रश्न विचारा 👇';

  @override
  String get chatWidget_headerSub => 'हिंदी • इंग्रजी • गुजराती • मराठी';

  @override
  String get chatWidget_headerTitle => 'किसानदोस्त AI सहाय्यक';

  @override
  String get chatWidget_placeholder => 'आपला प्रश्न लिहा...';

  @override
  String get chatWidget_quickReplies_contact => '📞 संपर्क साधा';

  @override
  String get chatWidget_quickReplies_disease => '🌾 पीक रोग';

  @override
  String get chatWidget_quickReplies_fertilizer => '🧪 खत डोस';

  @override
  String get chatWidget_quickReplies_profit => '📈 नफा अंदाज';

  @override
  String get chatWidget_quickReplies_schemes => '🏛️ सरकारी योजना';

  @override
  String get chatWidget_quickReplies_weather => '☁️ हवामान टिप्स';

  @override
  String get comingSoon => 'लवकरच येत आहे';

  @override
  String get communities_annualSupport => '₹६,००० वार्षिक सहाय्य';

  @override
  String get communities_beneficiaries => 'लाभार्थी: कोट्यवधी शेतकरी';

  @override
  String get communities_directTransfer => 'थेट बँक ट्रान्सफर';

  @override
  String get communities_dislike => 'नाही आवडले';

  @override
  String get communities_eServiceCards_appStatus_description =>
      'ही सेवा शेतकऱ्यांना त्यांच्या पीएम-किसान अर्जांची स्थिती तपासण्यास सक्षम करते. नोंदणी तपशील प्रविष्ट करून, अर्जदार त्यांचे सबमिशन ट्रॅक करू शकतात.';

  @override
  String get communities_eServiceCards_appStatus_title =>
      'पीएम-किसान अर्ज स्थिती तपासा';

  @override
  String get communities_eServiceCards_ekyc_description =>
      'ई-केवायसी सेवा पीएम-किसान योजनेच्या लाभार्थ्यांची ओळख पडताळण्यासाठी आवश्यक आहे. शेतकरी त्यांची KYC प्रक्रिया ऑनलाइन पूर्ण करू शकतात.';

  @override
  String get communities_eServiceCards_ekyc_title =>
      'पीएम-किसान साठी ई-केवायसी पूर्ण करा';

  @override
  String get communities_eServiceCards_ems_description =>
      'EMS, ATMA कार्यक्रमांतर्गत मासिक प्रगती अहवाल (MPR) साठी वेब-सक्षम ऑनलाइन मॉनिटरिंग सिस्टम आहे. ही सर्व योजना घटकांच्या भौतिक आणि आर्थिक प्रगतीचे निरीक्षण करते.';

  @override
  String get communities_eServiceCards_ems_title =>
      'एक्स्टेन्शन रिफॉर्म्स मॉनिटरिंग सिस्टम (EMS)';

  @override
  String get communities_eServiceCards_foodSecurity_description =>
      'सर्व लोकांना सदैव सक्रिय आणि निरोगी जीवनासाठी मूलभूत अन्न उपलब्ध असल्याची खात्री करते. संपूर्ण देशभरात अन्नाची उपलब्धता, प्रवेश आणि स्थिरता.';

  @override
  String get communities_eServiceCards_foodSecurity_title =>
      'राष्ट्रीय अन्न सुरक्षा पोर्टल';

  @override
  String get communities_eServiceCards_kkms_description =>
      'किसान नॉलेज मॅनेजमेंट सिस्टम ही कृषी मंत्रालयाची एक पहल आहे जी शेतकऱ्यांना टोल-फ्री क्रमांक, ऑनलाइन फोरम आणि उपयुक्त शेती-विशिष्ट माहिती यासारख्या सेवा प्रदान करते.';

  @override
  String get communities_eServiceCards_kkms_title =>
      'किसान नॉलेज मॅनेजमेंट सिस्टम';

  @override
  String get communities_eServiceCards_landRecords_description =>
      'गुजरातच्या विविध गावांसाठी ऑनलाइन हक्क अभिलेख (RoR) मिळवा. गुजरात महसूल विभागाद्वारे प्रदान केलेले.';

  @override
  String get communities_eServiceCards_landRecords_title =>
      'गुजरातमध्ये ऑनलाइन जमीन नोंदी तपासा';

  @override
  String get communities_eServiceCards_pmKisanScheme_description =>
      'पीएम-किसान योजना लहान आणि अल्पभूधारक शेतकऱ्यांच्या (SMFs) आर्थिक गरजा पूर्ण करण्यासाठी वार्षिक ₹६००० चे थेट उत्पन्न सहाय्य प्रदान करते, जे तीन समान हप्त्यांमध्ये हस्तांतरित केले जाते.';

  @override
  String get communities_eServiceCards_pmKisanScheme_title =>
      'प्रधानमंत्री किसान सन्मान निधी (पीएम-किसान)';

  @override
  String get communities_eServiceCards_pmayDashboard_description =>
      'हा डिजिटल डॅशबोर्ड राज्ये आणि बँकांच्या अधिकाऱ्यांना PMAY-ग्रामीणच्या कामगिरीचा मागोवा घेण्यास सक्षम करतो. हे रिअल-टाइम डेटा आणि कामगिरी मेट्रिक्स प्रदान करते.';

  @override
  String get communities_eServiceCards_pmayDashboard_title =>
      'पीएम आवास योजना-ग्रामीण डॅशबोर्ड';

  @override
  String get communities_eServiceCards_registerFarmer_description =>
      'शेतकरी पीएम-किसान सन्मान निधी योजनेसाठी नोंदणी करू शकतात. आवश्यक तपशील प्रदान करून, शेतकरी सरकारकडून आर्थिक सहाय्य प्राप्त करण्यासाठी अर्ज करू शकतात.';

  @override
  String get communities_eServiceCards_registerFarmer_title =>
      'पीएम-किसान साठी नवीन शेतकरी म्हणून नोंदणी करा';

  @override
  String get communities_eServices => 'शेतकरी ई-सेवा';

  @override
  String get communities_footerNote =>
      '* माहिती अधिकृत पीएम किसान युट्यूब चॅनेल आणि शासकीय स्रोतांवर आधारित आहे.';

  @override
  String get communities_forFarmers => 'शेतकऱ्यांसाठी';

  @override
  String get communities_fullyOnline => 'पूर्णपणे ऑनलाइन';

  @override
  String get communities_govSchemesAll => 'सर्व योजना';

  @override
  String get communities_govSchemesApply => 'अधिकृत पोर्टल';

  @override
  String get communities_govSchemesBenefits => 'मुख्य लाभ';

  @override
  String get communities_govSchemesCentral => 'केंद्रीय योजना';

  @override
  String get communities_govSchemesDetails => 'तपशील पहा';

  @override
  String get communities_govSchemesEligibility => 'कोण अर्ज करू शकते';

  @override
  String get communities_govSchemesEmpty =>
      'तुमच्या शोधाशी कोणतीही योजना जुळत नाही.';

  @override
  String get communities_govSchemesError =>
      'योजना लोड होऊ शकल्या नाहीत. कृपया पुन्हा प्रयत्न करा.';

  @override
  String get communities_govSchemesIntro =>
      'उत्पन्न सहाय्य, पीक विमा, कर्ज, सिंचन, यंत्रसामग्री आणि संलग्न व्यवसायांशी संबंधित केंद्र सरकारच्या योजना. लाभ व पात्रता पाहण्यासाठी योजनेवर टॅप करा, किंवा अर्जासाठी अधिकृत पोर्टल उघडा.';

  @override
  String get communities_govSchemesLaunched => 'सुरुवात';

  @override
  String get communities_govSchemesLess => 'कमी दाखवा';

  @override
  String get communities_govSchemesLoading => 'योजना लोड होत आहेत…';

  @override
  String get communities_govSchemesSearch =>
      'नाव, मंत्रालय किंवा कीवर्डने योजना शोधा…';

  @override
  String get communities_govSchemesShowAll => 'सर्व योजना दाखवा';

  @override
  String get communities_govSchemesTitle => 'शेतकऱ्यांसाठी सरकारी योजना';

  @override
  String get communities_installments => '३ हप्ते';

  @override
  String get communities_latestVideos => 'नवीनतम व्हिडिओ';

  @override
  String get communities_launchDate => 'शुभारंभ: २४ फेब्रुवारी २०१९';

  @override
  String get communities_like => 'आवडले';

  @override
  String get communities_loadMore => 'अधिक व्हिडिओ लोड करा';

  @override
  String get communities_more => 'अधिक माहिती';

  @override
  String get communities_networkTab => 'शेतकरी नेटवर्क';

  @override
  String get communities_officialChannel => 'अधिकृत युट्यूब चॅनेल';

  @override
  String get communities_officialInitiative => 'अधिकृत शासकीय उपक्रम';

  @override
  String get communities_operationalDate => 'कार्यान्वित: ०१ डिसेंबर २०१८';

  @override
  String get communities_partiallyOnline => 'अंशतः ऑनलाइन';

  @override
  String get communities_peopleHelpful => 'लोकांना हे उपयुक्त वाटले';

  @override
  String get communities_pmKisanDesc =>
      'पीएम-किसान ही एक शासकीय योजना आहे जी भारतातील लहान आणि अल्पभूधारक शेतकऱ्यांना आर्थिक सहाय्य प्रदान करते. या उपक्रमांतर्गत, पात्र शेतकऱ्यांना त्यांच्या बँक खात्यात थेट तीन समान हप्त्यांमध्ये वार्षिक ₹६,००० मिळतात.';

  @override
  String get communities_pmKisanTitle => 'पीएम किसान सन्मान निधी योजना';

  @override
  String get communities_quote =>
      '\"२४ फेब्रुवारी २०१९ रोजी मा. पंतप्रधान श्री नरेंद्र मोदी यांच्या हस्ते शुभारंभ. १ डिसेंबर २०१८ पासून कार्यान्वित. पात्र शेतकरी कुटुंबांना उत्पन्न सहाय्य प्रदान करते.\"';

  @override
  String get communities_rateThis => 'याला रेट करा:';

  @override
  String get communities_resourcesTab => 'शेतकरी संसाधने';

  @override
  String get communities_shareThis => 'शेअर करा';

  @override
  String get communities_subtitle =>
      'शेतकऱ्यांना शासकीय उपक्रम आणि पीअर ज्ञानाशी जोडणे.';

  @override
  String get communities_title => 'समुदाय आणि योजना';

  @override
  String get communities_videoDates_v1 => '२ दिवसांपूर्वी';

  @override
  String get communities_videoDates_v2 => '१ आठवड्यापूर्वी';

  @override
  String get communities_videoDates_v3 => '२ आठवड्यांपूर्वी';

  @override
  String get communities_videoDates_v4 => '३ आठवड्यांपूर्वी';

  @override
  String get communities_videoDates_v5 => '१ महिन्यापूर्वी';

  @override
  String get communities_videoDates_v6 => '२ महिन्यांपूर्वी';

  @override
  String get communities_videoDates_v7 => '२ महिन्यांपूर्वी';

  @override
  String get communities_videoDates_v8 => '३ महिन्यांपूर्वी';

  @override
  String get communities_videoTitles_v1 => 'पीएम किसान योजना - शेतकरी लाभ';

  @override
  String get communities_videoTitles_v2 =>
      'पीएम किसान स्थिती ऑनलाइन कशी तपासावी';

  @override
  String get communities_videoTitles_v3 => 'पीएम किसान १२ वा हप्ता जारी';

  @override
  String get communities_videoTitles_v4 =>
      'पीएम किसान योजना - संपूर्ण मार्गदर्शक';

  @override
  String get communities_videoTitles_v5 => 'शेतकरी कल्याण योजना २०२४';

  @override
  String get communities_videoTitles_v6 =>
      'थेट लाभ हस्तांतरण (DBT) समजावून सांगितले';

  @override
  String get communities_videoTitles_v7 => 'ई-केवायसी नोंदणी ट्युटोरियल';

  @override
  String get communities_videoTitles_v8 => 'PMAY आणि पीएम किसान सामंजस्य';

  @override
  String get communities_visitChannel => 'चॅनेलला भेट द्या';

  @override
  String get communities_visitPortal => 'अधिकृत पोर्टलला भेट द्या';

  @override
  String get communities_visitYoutube => 'युट्यूब चॅनेलला भेट द्या';

  @override
  String get communities_watchMore => 'युट्यूबवर अधिक पहा';

  @override
  String get communities_welfareSchemes => 'शेतकरी कल्याणकारी योजना';

  @override
  String get communityAddComment => 'उत्तर लिहा';

  @override
  String get communityAsk => 'शेतकऱ्यांना विचारा';

  @override
  String communityComments(String count) {
    return '$count उत्तरे';
  }

  @override
  String get communityCrop => 'पीक';

  @override
  String get communityDetails => 'सविस्तर सांगा';

  @override
  String get communityEmpty => 'अजून पोस्ट नाही';

  @override
  String get communityHelpful => 'उपयुक्त';

  @override
  String get communityNoComments => 'अजून उत्तर नाही. पहिले तुम्ही लिहा.';

  @override
  String get communityNoMatch => 'या शोधासाठी कोणतीही पोस्ट नाही';

  @override
  String get communityPost => 'पोस्ट करा';

  @override
  String get communityPostTitle => 'समस्या काय आहे?';

  @override
  String get communityPosted => 'पोस्ट केले. आता इतर शेतकरी हे पाहू शकतात.';

  @override
  String get communityPosting => 'पोस्ट होत आहे';

  @override
  String get communitySearch => 'पोस्ट, पीक किंवा गाव शोधा';

  @override
  String get communitySend => 'पाठवा';

  @override
  String get communitySignInNote =>
      'उत्तर देण्यासाठी किंवा उपयुक्त म्हणण्यासाठी साइन इन करा.';

  @override
  String get communityTitle => 'शेतकरी समुदाय';

  @override
  String get composeIntro =>
      'इतर शेतकरी हे पाहून उत्तर देऊ शकतात. तुमच्या शब्दांत लिहा — बोलणे सोपे असल्यास मायक दाबा.';

  @override
  String get composeTried => 'तुम्ही आतापर्यंत काय केले?';

  @override
  String get composeTriedHelp =>
      'ऐच्छिक, पण यामुळे लोक तेच सल्ला पुन्हा देणार नाहीत.';

  @override
  String get composeType => 'पोस्ट कोणत्या प्रकारची आहे';

  @override
  String get composeTypeAsk => 'शेतकर्यांना विचारा';

  @override
  String get composeTypeExperience => 'माझा अनुभव';

  @override
  String get composeTypeProblem => 'पिकाची समस्या';

  @override
  String get composeTypeSuccess => 'यशोगाथा';

  @override
  String get composeTypeTip => 'प्रतिबंधात्मक सल्ला';

  @override
  String get composeVisibleNote =>
      'तुमचे नाव आणि जिल्हा पोस्टसोबत अॅप आणि वेबसाइट दोन्हीवर दिसेल.';

  @override
  String cropSuggestion_aiAdvisory(String district) {
    return '$district साठी AI सल्ला';
  }

  @override
  String get cropSuggestion_analyzing =>
      'स्थान विश्लेषित करत आहे आणि AI शिफारसी तयार करत आहे...';

  @override
  String get cropSuggestion_awaitingLocation => 'स्थानाची वाट पाहत आहे';

  @override
  String get cropSuggestion_awaitingLocationDesc =>
      'जिल्हा निवडण्यासाठी आणि तज्ञ पीक शिफारसी मिळवण्यासाठी नकाशावर क्लिक करा.';

  @override
  String get cropSuggestion_bestCrops => 'या क्षेत्रासाठी सर्वोत्तम पिके';

  @override
  String get cropSuggestion_description =>
      'प्रदेशानुसार सर्वोत्तम पिकांच्या AI शिफारसी मिळवण्यासाठी नकाशावर स्थान निवडा.';

  @override
  String get cropSuggestion_geminiInsight => 'जेमिनी इनसाइट';

  @override
  String get cropSuggestion_loadingMap => 'नकाशा लोड होत आहे...';

  @override
  String get cropSuggestion_season => 'हंगाम';

  @override
  String get cropSuggestion_selectLocationDesc =>
      'स्थानिक AI पीक शिफारसी पाहण्यासाठी नकाशावर कुठेही क्लिक करा.';

  @override
  String get cropSuggestion_selectLocationTitle => 'स्थान निवडा';

  @override
  String get cropSuggestion_selectedLocation => 'निवडलेले स्थान';

  @override
  String get cropSuggestion_title => 'AI पीक शिफारस';

  @override
  String get cropSuggestion_waterLevel => 'पाण्याची पातळी';

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
  String get dashboard_calculateFertilizer => 'खत कॅल्क्युलेट करा';

  @override
  String get dashboard_chooseCrop => 'तुमचे पीक निवडा';

  @override
  String get dashboard_commonDiseasesLabel => 'सामान्य रोग';

  @override
  String get dashboard_excellent => 'उत्कृष्ट';

  @override
  String get dashboard_fair => 'ठीक';

  @override
  String get dashboard_good => 'छानाव';

  @override
  String dashboard_greeting(String health, String name) {
    return 'नमस्ते $name! तुमचे शेत आज $health आहे';
  }

  @override
  String get dashboard_healthStatus_healthy => 'निरोगी';

  @override
  String get dashboard_healthStatus_moderate => 'मध्यम';

  @override
  String get dashboard_healthStatus_stress => 'ताणतणाव';

  @override
  String dashboard_ndviSubtitle(String status, String value) {
    return 'तुमचे सध्याचे एकूण शेत NDVI $value ($status) आहे.';
  }

  @override
  String get dashboard_poor => 'कमकुवत';

  @override
  String get dashboard_precautionsLabel => 'खबरदारी आणि उपाय';

  @override
  String get dashboard_profitIntelDesc =>
      'रिअल-टाइम बाजार भावाच्या आधारे आपल्या पिकाच्या उत्पन्नाचा आणि नफ्याचा अंदाज लावा.';

  @override
  String get dashboard_profitIntelTitle => 'AI नफा बुद्धिमत्ता';

  @override
  String get dashboard_seasonLabel => 'हंगाम';

  @override
  String get dashboard_soilTypeLabel => 'मातीचा प्रकार';

  @override
  String get dashboard_tryPredictor => 'अंदाज लावा';

  @override
  String get dashboard_viewDetails => 'तपशील पहा';

  @override
  String get dashboard_waterNeedLabel => 'पाण्याची गरज';

  @override
  String get diagnoseAnalysing => 'पानाची तपासणी होत आहे';

  @override
  String get diagnoseBuy => 'वापरायची उत्पादने';

  @override
  String get diagnoseCauses => 'असे का झाले';

  @override
  String get diagnoseCompressing => 'फोटो तयार होत आहे';

  @override
  String diagnoseConfidence(String value) {
    return '$value% खात्री';
  }

  @override
  String get diagnoseCopyDetails => 'माहिती कॉपी करा';

  @override
  String get diagnoseDetailsCopied => 'कॉपी केले';

  @override
  String get diagnoseExpertNote => 'फवारणीपूर्वी तज्ञांची खात्री करून घ्या.';

  @override
  String get diagnoseFarmingSteps => 'शेतीचे उपाय';

  @override
  String get diagnoseGallery => 'गॅलरीमधून निवडा';

  @override
  String get diagnoseGuide => 'एक बाधित पान पूर्ण फ्रेममध्ये घ्या';

  @override
  String get diagnoseHealthy => 'निरोगी';

  @override
  String get diagnoseHowToFix => 'चांगला फोटो कसा काढावा';

  @override
  String get diagnoseInfected => 'रोग आढळला';

  @override
  String get diagnoseKeepPhoto =>
      'तुमचा फोटो जतन केला आहे. तुम्ही पुन्हा प्रयत्न करू शकता.';

  @override
  String get diagnoseMatching => 'उपचार शोधत आहे';

  @override
  String get diagnoseModelDetails => 'मॉडेलची तांत्रिक माहिती';

  @override
  String get diagnoseNoCamera => 'या फोनमध्ये कॅमेरा उपलब्ध नाही.';

  @override
  String get diagnosePermission => 'पीक तपासण्यासाठी कॅमेऱ्याची परवानगी द्या.';

  @override
  String get diagnoseRetake => 'दुसरे पान तपासा';

  @override
  String get diagnoseSlowNote => 'दिवसातील पहिल्या तपासणीस एक मिनिट लागू शकतो.';

  @override
  String get diagnoseSymptoms => 'काय पहावे';

  @override
  String get diagnoseTakePhoto => 'फोटो काढा';

  @override
  String get diagnoseTooLarge => 'हा फोटो खूप मोठा आहे. कृपया नवीन फोटो काढा.';

  @override
  String get diagnoseUnclear => 'फोटो पुरेसा स्पष्ट नव्हता';

  @override
  String get diagnoseUploading => 'पाठवत आहे';

  @override
  String get diagnoseWhatToDo => 'आता काय करावे';

  @override
  String get diseasesPage_bestSeason => 'सर्वोत्तम हंगाम: खरीप (पावसाळा)';

  @override
  String diseasesPage_care(String crop) {
    return '$crop काळजी';
  }

  @override
  String get diseasesPage_favorableConditions => 'अनुकूल परिस्थिती';

  @override
  String get diseasesPage_filters_all => 'सर्व पिके';

  @override
  String get diseasesPage_filters_cashCrops => 'नगदी पिके';

  @override
  String get diseasesPage_filters_cereals => 'धान्य';

  @override
  String get diseasesPage_filters_fruits => 'फळे';

  @override
  String get diseasesPage_filters_vegetables => 'भाजीपाला';

  @override
  String get diseasesPage_generalPrecaution => 'सामान्य खबरदारी:';

  @override
  String get diseasesPage_impact => 'परिणाम';

  @override
  String get diseasesPage_pestControl => 'कीटक नियंत्रण';

  @override
  String get diseasesPage_prevention => 'प्रतिबंध आणि नियंत्रण';

  @override
  String get diseasesPage_reset => 'निवड रिसेट करा';

  @override
  String diseasesPage_selected(String count) {
    return 'तुम्ही ८ पैकी $count पिके निवडली आहेत';
  }

  @override
  String get diseasesPage_subtitle =>
      'रोग, कीटक आणि प्रतिबंधात्मक उपाय पाहण्यासाठी पिके निवडा. तज्ञांच्या मार्गदर्शनाने तुमचे पीक वाचवा.';

  @override
  String get diseasesPage_symptoms => 'लक्षणे';

  @override
  String get diseasesPage_title => 'पीक रोग आणि कीटक व्यवस्थापन';

  @override
  String get diseasesPage_viewStoreProducts => 'स्टोअर उत्पादने पहा';

  @override
  String get farmAddCrop => 'पीक जोडा';

  @override
  String get farmAddField => 'शेत जोडा';

  @override
  String get farmArea => 'क्षेत्र';

  @override
  String get farmBack => 'मागे';

  @override
  String get farmBadNumber => 'संख्या टाका';

  @override
  String get farmCancel => 'रद्द करा';

  @override
  String get farmCropName => 'पीक';

  @override
  String get farmCrops => 'पिके';

  @override
  String get farmCultivationMethod => 'कसे पेरले';

  @override
  String farmDayCount(String days) {
    return 'दिवस $days';
  }

  @override
  String get farmDelete => 'काढून टाका';

  @override
  String get farmDeleteField => 'हे शेत काढायचे?';

  @override
  String get farmDeleteFieldNote => 'त्यातील पिकेही काढली जातील.';

  @override
  String get farmDistrict => 'जिल्हा';

  @override
  String get farmFieldName => 'शेताचे नाव';

  @override
  String get farmFields => 'शेत';

  @override
  String get farmFrequency => 'पाणी देणे';

  @override
  String get farmIrrigation => 'सिंचन';

  @override
  String get farmNext => 'पुढे';

  @override
  String get farmNoCrops => 'या शेतात अजून पीक नाही';

  @override
  String get farmNoFields => 'अजून शेत नाही';

  @override
  String get farmNoFieldsHint => 'सल्ला मिळवण्यासाठी तुमचे पहिले शेत जोडा.';

  @override
  String get farmNotes => 'टिपा';

  @override
  String get farmPreviousCrop => 'मागील पीक';

  @override
  String get farmRequired => 'कृपया हे भरा';

  @override
  String get farmReview => 'तुमची उत्तरे तपासा';

  @override
  String get farmSave => 'जतन करा';

  @override
  String get farmSaved => 'जतन केले';

  @override
  String get farmSaving => 'जतन करत आहे';

  @override
  String get farmSoilType => 'मातीचा प्रकार';

  @override
  String get farmSowingDate => 'पेरणीची तारीख';

  @override
  String get farmState => 'राज्य';

  @override
  String farmStep(String current, String total) {
    return 'पायरी $current / $total';
  }

  @override
  String get farmTaluka => 'तालुका';

  @override
  String get farmUseLocation => 'माझे स्थान घ्या';

  @override
  String get farmVariety => 'जात';

  @override
  String get farmVillage => 'गाव';

  @override
  String get farmWaterSource => 'पाण्याचा स्रोत';

  @override
  String get fertArea => 'क्षेत्र (एकर)';

  @override
  String fertBags(String count) {
    return 'अंदाजे $count पोती (50 कि.ग्रा.)';
  }

  @override
  String get fertBuy => 'काय खरेदी करावे';

  @override
  String get fertCalculate => 'गणना करा';

  @override
  String fertCost(String amount) {
    return 'अंदाजे ₹$amount';
  }

  @override
  String get fertCostNote => 'अंदाजित दुकान दरांवरून अंदाज, ठरलेला दर नाही.';

  @override
  String get fertCrop => 'पीक';

  @override
  String get fertDap => 'डीएपी';

  @override
  String get fertExistingK => 'मातीत पोटॅश (कि.ग्रा./एकर)';

  @override
  String get fertExistingN => 'मातीत नायट्रोजन (कि.ग्रा./एकर)';

  @override
  String get fertExistingP => 'मातीत फॉस्फरस (कि.ग्रा./एकर)';

  @override
  String fertKg(String value) {
    return '$value कि.ग्रा.';
  }

  @override
  String get fertMop => 'एमओपी';

  @override
  String get fertReduced =>
      'तुमच्या माती परीक्षणाने मात्रा कमी झाली — कमी खरेदी करावी लागेल.';

  @override
  String get fertSoil => 'मातीचा प्रकार';

  @override
  String get fertSoilTest => 'माझ्याकडे माती परीक्षण आहे';

  @override
  String get fertSplitNote =>
      'नायट्रोजन 2–3 हप्त्यांत द्या, पेरणीच्या वेळी सर्व नाही.';

  @override
  String get fertTitle => 'खत कॅल्क्युलेटर';

  @override
  String get fertUrea => 'युरिया';

  @override
  String get fertilizer_area => 'शेताचे क्षेत्रफळ (एकड)';

  @override
  String get fertilizer_calculate => 'गणना करा';

  @override
  String get fertilizer_cost => 'अंदाजे खर्च';

  @override
  String get fertilizer_crop => 'पीक निवडा';

  @override
  String get fertilizer_profit => 'अपेक्षित वाढीव फायदा';

  @override
  String get fertilizer_recommended => 'शिफारस केलेले NPK';

  @override
  String get fertilizer_save => 'माझ्या शेतात सेव्ह करा';

  @override
  String get fertilizer_soilDesc => 'गाळाची / वालुकामय / काळी माती';

  @override
  String get fertilizer_soilType => 'मातीचा प्रकार';

  @override
  String get fertilizer_title => 'खत कॅल्क्युलेटर';

  @override
  String get fertilizer_totalBags => 'एकूण आवश्यक पोती';

  @override
  String homeGreeting(String name) {
    return 'नमस्ते, $name';
  }

  @override
  String get homeMarkDone => 'पूर्ण झाले';

  @override
  String get homeNothingDue => 'आज काहीही बाकी नाही';

  @override
  String get homeNothingDueBody =>
      'आज कोणतीही फवारणी किंवा मात्रा ठरलेली नाही. पुढची अजून काही दिवसांनी आहे.';

  @override
  String get homeRateToday => 'आजचा भाव';

  @override
  String get homeSchemesForYou => 'तुमच्यासाठी योजना';

  @override
  String get homeSeeAll => 'सर्व पहा';

  @override
  String get homeToday => 'आज हे करा';

  @override
  String get homeMyCrops => 'माझी पिके';

  @override
  String get homeNextUp => 'पुढे काय करायचे';

  @override
  String mandiArrival(String date) {
    return 'बाजार दिनांक $date';
  }

  @override
  String get mandiCrop => 'पीक';

  @override
  String get mandiEstimate => 'अंदाजित दर';

  @override
  String get mandiEstimateNote =>
      'येथे या पिकाचा थेट दर उपलब्ध नाही. हा सरकारी आधार दर आहे, विकला गेलेला भाव नाही.';

  @override
  String get mandiIndicative => 'निर्देशक दर';

  @override
  String get mandiIndicativeNote =>
      'खरी सरकारी माहिती, पण आजचा तुमच्या स्थानिक बाजाराचा ताजा दर नाही.';

  @override
  String get mandiLive => 'सरकारी थेट दर';

  @override
  String get mandiNotYourDistrict => 'जवळचे बाजार';

  @override
  String get mandiPerQuintal => 'प्रति क्विंटल';

  @override
  String mandiRange(String max, String min) {
    return 'श्रेणी $min – $max';
  }

  @override
  String get mandiState => 'राज्य';

  @override
  String get mandiTitle => 'बाजार भाव';

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
  String get navCommunity => 'समुदाय';

  @override
  String get navDiagnose => 'तपासणी';

  @override
  String get navFarm => 'माझे शेत';

  @override
  String get navGroupAdvice => 'सल्ला';

  @override
  String get navGroupReference => 'माहिती';

  @override
  String get navGroupTools => 'साधने';

  @override
  String get navInsights => 'माहिती';

  @override
  String get navMarket => 'बाजार';

  @override
  String get navMore => 'अधिक';

  @override
  String get navbar_activeFarmer => 'सक्रिय शेतकरी';

  @override
  String get navbar_detectingLocation => 'स्थान शोधत आहे...';

  @override
  String get navbar_farmerLogin => 'शेतकरी लॉगिन';

  @override
  String get navbar_fullWeather => 'संपूर्ण हवामान';

  @override
  String get navbar_home => 'मुख्यपृष्ठ';

  @override
  String get navbar_locationBlocked => 'स्थान ब्लॉक केले आहे';

  @override
  String get navbar_locationBlockedDesc =>
      'तुमच्या ब्राउझरने स्थान प्रवेश ब्लॉक केला आहे. निश्चित करण्यासाठी:';

  @override
  String get navbar_locationBlockedStep1 =>
      'पत्ता बारमधील लॉक चिन्हावर क्लिक करा';

  @override
  String get navbar_locationBlockedStep2 => 'स्थान परवानगी द्या सेट करा';

  @override
  String get navbar_locationBlockedStep3 =>
      'नंतर खालील पुन्हा प्रयत्न करा वर क्लिक करा';

  @override
  String get navbar_refresh => 'रिफ्रेश';

  @override
  String get navbar_retryLocation => 'स्थान पुन्हा प्रयत्न करा';

  @override
  String get navbar_selectLanguage => 'भाषा निवडा:';

  @override
  String get navbar_updated => 'अपडेट केले';

  @override
  String get navigation_ai => 'AI नफा';

  @override
  String get navigation_calculator => 'खत कॅल्क्युलेटर';

  @override
  String get navigation_communities => 'समुदाय व योजना';

  @override
  String get navigation_diseases => 'रोग व कीटक';

  @override
  String get navigation_home => 'मुख्यपृष्ठ';

  @override
  String get navigation_myCrops => 'माझी पिके';

  @override
  String get navigation_products => 'उत्पादने';

  @override
  String get navigation_profile => 'प्रोफाइल';

  @override
  String get navigation_weather => 'हवामान';

  @override
  String get navigation_yieldAi => 'उत्पन्न AI';

  @override
  String get offlineBanner => 'इंटरनेट नाही. सेव्ह केलेली माहिती दिसत आहे.';

  @override
  String offlineDays(String count) {
    return '$count दिवसांपूर्वी';
  }

  @override
  String offlineHours(String count) {
    return '$count तासांपूर्वी';
  }

  @override
  String get offlineJustNow => 'आत्ताच';

  @override
  String offlineMinutes(String count) {
    return '$count मिनिटेंपूर्वी';
  }

  @override
  String get offlineQueued =>
      'सिग्नल नाही. तुमचे उत्तर सेव्ह केले आहे, इंटरनेट आल्यावर पाठवू.';

  @override
  String offlineShowingSaved(String when) {
    return '$when सेव्ह केले. नवीन माहितीसाठी इंटरनेट सुरू करा.';
  }

  @override
  String get onboardDistrict => 'जिल्हा';

  @override
  String get onboardFinish => 'पुढे जा';

  @override
  String get onboardMainCrop => 'मुख्य पीक';

  @override
  String get onboardMobile => 'मोबाइल नंबर';

  @override
  String get onboardName => 'तुमचे नाव';

  @override
  String get onboardSkip => 'आत्ता वगळा';

  @override
  String get onboardTitle => 'तुमच्या शेताबद्दल सांगा';

  @override
  String get onboardVillage => 'गाव';

  @override
  String get onboardWhy =>
      'यामुळे आम्ही तुमच्या भागानुसार आणि पिकानुसार सल्ला देऊ शकू.';

  @override
  String predAbove(String value) {
    return 'तुमच्या भागापेक्षा $value% जास्त';
  }

  @override
  String get predArea => 'क्षेत्र (एकर)';

  @override
  String predBelow(String value) {
    return 'तुमच्या भागापेक्षा $value% कमी';
  }

  @override
  String predConfidence(String value) {
    return '$value% खात्री';
  }

  @override
  String get predCosts => 'तुमचा खर्च';

  @override
  String get predCrop => 'पीक';

  @override
  String get predEstimatedPrice =>
      'हा अंदाज आधारभूत दरावर आहे, थेट बाजारभावावर नाही.';

  @override
  String get predFallbackNote =>
      'अंदाज मॉडेलपर्यंत पोहोचता आले नाही, म्हणून हा या पिकाच्या सरासरी आकडेवारीवरून केलेला साधारण अंदाज आहे.';

  @override
  String get predFertCost => 'खताचा खर्च (₹)';

  @override
  String get predIrrigCost => 'पाण्याचा खर्च (₹)';

  @override
  String get predLoss => 'कदाचित खर्चही निघणार नाही.';

  @override
  String get predMargin => 'खर्चानंतर शिल्लक';

  @override
  String get predMarginNote =>
      'यात फक्त तुम्ही टाकलेले खत, औषध आणि पाणी मोजले आहे. बियाणे, मजुरी, जमीन आणि वाहतूक नाही, त्यामुळे खरा नफा कमी असेल.';

  @override
  String get predNdvi => 'पिकाची हिरवळ (NDVI)';

  @override
  String get predNdviHelp =>
      'वरून पीक किती हिरवे आणि निरोगी दिसते. माहीत नसल्यास तसेच ठेवा.';

  @override
  String predNoBaseline(String crop) {
    return '$crop साठी अजून उत्पादन आधार नाही. नफा टॅब वापरा, त्यात जास्त पिके आहेत.';
  }

  @override
  String predPerAcre(String value) {
    return '$value टन प्रति एकर';
  }

  @override
  String get predPestCost => 'औषधाचा खर्च (₹)';

  @override
  String predPrice(String value) {
    return '₹$value प्रति क्विंटल';
  }

  @override
  String predQuintals(String value) {
    return '$value क्विंटल';
  }

  @override
  String get predRainfall => 'हंगामातील पाऊस (मि.मी.)';

  @override
  String get predRevenue => 'अपेक्षित उत्पन्न';

  @override
  String get predRun => 'अंदाज काढा';

  @override
  String get predRunning => 'गणना सुरू आहे';

  @override
  String get predSoilMoisture => 'मातीतील ओलावा (%)';

  @override
  String get predTabMandi => 'बाजार';

  @override
  String get predTabProfit => 'नफा';

  @override
  String get predTabYield => 'उत्पादन';

  @override
  String predTonnes(String value) {
    return '$value टन';
  }

  @override
  String predVsRegion(String value) {
    return 'प्रादेशिक सरासरी $value टन प्रति एकर';
  }

  @override
  String get predYieldResult => 'अपेक्षित उत्पादन';

  @override
  String get productsFeatures => 'का उपयुक्त आहे';

  @override
  String get productsNone => 'या शोधाशी जुळणारे उत्पादन नाही';

  @override
  String get productsPage_allProducts => '← सर्व उत्पादने';

  @override
  String get productsPage_buyOnWhatsApp => 'व्हाट्सअ‍ॅपवर खरेदी करा';

  @override
  String get productsPage_footer =>
      '© २०२६ किसानदोस्त · भारतीय शेतकऱ्यांना सक्षम करत आहे';

  @override
  String get productsPage_heroSubtitle =>
      'आधुनिक शेतीसाठी विज्ञान-आधारित पीक पोषण आणि माती सुधारणा उत्पादने.';

  @override
  String get productsPage_heroTag => '🌾 कृषी उपाय';

  @override
  String get productsPage_heroTitle => 'किसानदोस्त उत्पादने';

  @override
  String get productsPage_loading => 'उत्पादन लोड होत आहे...';

  @override
  String get productsPage_noFeatures =>
      'या उत्पादनासाठी कोणतीही वैशिष्ट्ये सूचीबद्ध नाहीत.';

  @override
  String get productsPage_noUsage =>
      'वापराची माहिती उपलब्ध नाही. कृपया डोसच्या तपशीलासाठी आमच्याशी संपर्क साधा.';

  @override
  String get productsPage_notFoundDesc =>
      'तुम्ही शोधत असलेले उत्पादन अस्तित्वात नाही.';

  @override
  String get productsPage_priceLabel => 'किंमत:';

  @override
  String get productsPage_priceOnRequest => 'विनंतीनुसार किंमत';

  @override
  String get productsPage_productNotFound => 'उत्पादन सापडले नाही';

  @override
  String get productsPage_solvesLabel => 'उपयुक्त';

  @override
  String get productsPage_tabs_features => 'वैशिष्ट्ये';

  @override
  String get productsPage_tabs_overview => 'आढावा';

  @override
  String get productsPage_tabs_usage => 'वापर';

  @override
  String get productsPage_viewProduct => 'उत्पादन पहा →';

  @override
  String productsPrice(String amount) {
    return '₹$amount';
  }

  @override
  String get productsSearch => 'उत्पादन शोधा';

  @override
  String get productsStaticNote =>
      'सामान्य शेती साहित्याची संदर्भ यादी. दर अंदाजित आहेत — तुमच्या विक्रेत्याकडे तपासा.';

  @override
  String get productsTitle => 'उत्पादने';

  @override
  String get productsUsage => 'कसे वापरावे';

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
  String get profileEdit => 'प्रोफाइल बदला';

  @override
  String get profileSaved => 'जतन केले';

  @override
  String get profitPredictor_autoFetchDesc =>
      'हवामान आणि पर्यावरण डेटा मिळवत आहे';

  @override
  String get profitPredictor_autoFetchTitle => 'डेटा ऑटो-फेच होत आहे...';

  @override
  String get profitPredictor_confidence => 'विश्वासार्हता';

  @override
  String get profitPredictor_cropType => 'पिकाचा प्रकार';

  @override
  String get profitPredictor_description =>
      'शेती खर्च आणि बाजार भावाच्या आधारे अपेक्षित नफ्याची गणना करा.';

  @override
  String get profitPredictor_developerPanel => 'डेव्हलपर डिबग पॅनेल';

  @override
  String get profitPredictor_expectedRevenue => 'अपेक्षित उत्पन्न';

  @override
  String get profitPredictor_fertilizerCost => 'खत खर्च';

  @override
  String get profitPredictor_insights_costWarning =>
      'तुमचा कीटकनाशक खर्च प्रादेशिक सरासरीपेक्षा जास्त दिसतो.';

  @override
  String get profitPredictor_insights_goodProfit =>
      'या पिकासाठी तुमचा अंदाज नफा उत्तम आहे!';

  @override
  String get profitPredictor_insights_optimize =>
      'जैविक खताचा वापर केल्यास खर्च कमी होऊ शकतो.';

  @override
  String get profitPredictor_irrigationCost => 'सिंचन खर्च';

  @override
  String get profitPredictor_landArea => 'जमिनीचे क्षेत्रफळ';

  @override
  String get profitPredictor_locationSelected => 'स्थान निवडले';

  @override
  String get profitPredictor_manualMode => 'मॅन्युअल मोड';

  @override
  String get profitPredictor_pesticideCost => 'कीटकनाशक खर्च';

  @override
  String get profitPredictor_predictButton => 'नफ्याचा अंदाज लावा';

  @override
  String get profitPredictor_predictedProfit => 'अपेक्षित नफा';

  @override
  String get profitPredictor_predicting => 'अंदाज लावत आहे...';

  @override
  String get profitPredictor_predictionError => 'अंदाज मोजण्यात अपयश आले.';

  @override
  String get profitPredictor_predictionSuccess => 'नफा अंदाज पूर्ण झाला!';

  @override
  String get profitPredictor_rainfall => 'पाऊस';

  @override
  String get profitPredictor_readyToPredict =>
      'नफ्याचा अंदाज लावण्यासाठी तयार आहात?';

  @override
  String get profitPredictor_readyToPredictDesc =>
      'AI-आधारित नफा विश्लेषण मिळवण्यासाठी डावीकडील फॉर्म भरा.';

  @override
  String get profitPredictor_recommendation => 'शिफारस';

  @override
  String get profitPredictor_selectCrop => 'पीक निवडा';

  @override
  String get profitPredictor_selectLocation => 'तुमचे शेत स्थान निवडा';

  @override
  String get profitPredictor_smartMode => 'स्मार्ट मोड';

  @override
  String get profitPredictor_soilNitrogen => 'मातीतील नायट्रोजन';

  @override
  String get profitPredictor_soilPhosphorus => 'मातीतील स्फुरद (फॉस्फरस)';

  @override
  String get profitPredictor_soilPotassium => 'मातीतील पालाश (पोटॅशियम)';

  @override
  String get profitPredictor_title => 'नफा अंदाजक';

  @override
  String get profitPredictor_totalCost => 'एकूण खर्च';

  @override
  String get scanAgain => 'पुन्हा तपासा';

  @override
  String get scanBrand => 'ब्रँड';

  @override
  String get scanCheck => 'तपासा';

  @override
  String get scanChecking => 'तपासत आहे';

  @override
  String get scanCodeLabel => 'पॅकवरील कोड';

  @override
  String scanCodeWas(String code) {
    return 'वाचलेला कोड: $code';
  }

  @override
  String get scanDose => 'एकरी मात्रा';

  @override
  String get scanFake => 'वापरू नका';

  @override
  String get scanFakeDetail =>
      'हा कोड सरकारी नोंदीत बनावट म्हणून नोंदवला आहे. दुकानदाराला कळवा.';

  @override
  String get scanGenuine => 'खरे';

  @override
  String get scanGenuineDetail => 'हे उत्पादन सरकारी नोंदीत आहे.';

  @override
  String get scanHelp => 'कॅमेरा पॅकवरील QR कोडवर धरा.';

  @override
  String get scanHowToUse => 'कसे वापरायचे';

  @override
  String get scanLicence => 'परवाना क्र.';

  @override
  String get scanManual => 'किंवा कोड लिहा';

  @override
  String get scanManufacturer => 'उत्पादक';

  @override
  String get scanPremiumNeeded =>
      'औषध तपासण्यासाठी तुमच्या खात्यावर प्रीमियम सदस्यत्व हवे.';

  @override
  String get scanPremiumTitle => 'प्रीमियम सुविधा';

  @override
  String get scanProduct => 'उत्पादन';

  @override
  String get scanSignIn => 'औषध तपासण्यासाठी साइन इन करा.';

  @override
  String get scanTitle => 'औषध तपासा';

  @override
  String get scanType => 'प्रकार';

  @override
  String get scanUnknown => 'नोंदीत नाही';

  @override
  String get scanUnknownDetail =>
      'या कोडची नोंद नाही. याचा अर्थ बनावट नाही, पण वापरण्याआधी दुकानदाराला विचारा.';

  @override
  String get schemesAll => 'सर्व';

  @override
  String get schemesBenefits => 'काय मिळेल';

  @override
  String get schemesCuratedNote =>
      'ही तपासलेली यादी आहे, शासकीय थेट फीड नाही. तपशील अधिकृत संकेतस्थळावर तपासा.';

  @override
  String get schemesEligibility => 'कोण अर्ज करू शकते';

  @override
  String schemesLaunched(String when) {
    return '$when मध्ये सुरू';
  }

  @override
  String get schemesNone => 'या शोधाशी जुळणारी योजना नाही';

  @override
  String get schemesOpen => 'अधिकृत संकेतस्थळ उघडा';

  @override
  String get schemesSearch => 'योजना शोधा';

  @override
  String get schemesTitle => 'शासकीय योजना';

  @override
  String get suggestAddField => 'तुमचे शेत जोडा';

  @override
  String get suggestAddFieldWhy =>
      'बाकी सर्व — सल्ला, भाव, पीक दिनदर्शिका — तुमच्या शेतावरून चालते.';

  @override
  String get suggestAsk => 'किसानदोस्तला विचारा';

  @override
  String suggestAskCrop(String crop) {
    return 'तुमच्या $crop विषयी विचारा';
  }

  @override
  String get suggestAskWhy =>
      'कोणताही प्रश्न, तुमच्या शब्दांत. सोपे असल्यास बोलून विचारा.';

  @override
  String suggestInDays(String days) {
    return '$days दिवसांनी';
  }

  @override
  String get voiceListening => 'ऐकत आहोत — थांबवण्यास दाबा';

  @override
  String get voiceSpeak => 'बोलून सांगा';

  @override
  String get voiceStart => 'लिहिण्याऐवजी बोला';

  @override
  String get voiceStop => 'थांबा';

  @override
  String weatherFeels(String value) {
    return 'जाणवते $value°';
  }

  @override
  String get weatherForecast => 'पुढील दिवस';

  @override
  String get weatherHeatWarn => 'खूप उष्णता. पहाटे किंवा संध्याकाळी पाणी द्या.';

  @override
  String get weatherHumidity => 'आर्द्रता';

  @override
  String get weatherLocating => 'तुमचे स्थान शोधत आहे';

  @override
  String get weatherLocationBlocked =>
      'या अॅपसाठी लोकेशन बंद आहे. सेटिंग्जमध्ये परवानगी द्या.';

  @override
  String get weatherLocationDenied => 'स्थान बंद आहे. तुमच्या गावाचे नाव शोधा.';

  @override
  String get weatherLocationOff => 'फोनवर लोकेशन सुरू करून पुन्हा प्रयत्न करा.';

  @override
  String get weatherLocationSlow =>
      'तुमचे ठिकाण सापडले नाही. बाहेर जाऊन पुन्हा प्रयत्न करा किंवा शहर शोधा.';

  @override
  String get weatherPage_allowLocation =>
      'विचारल्यावर स्थान प्रवेशास अनुमती द्या';

  @override
  String get weatherPage_cloudCover => 'ढगांचे आच्छादन';

  @override
  String get weatherPage_detectingLocation => 'तुमचे स्थान शोधत आहे...';

  @override
  String get weatherPage_failedFetch => 'हवामान मिळवण्यात अपयश';

  @override
  String get weatherPage_feelsLike => 'जाणवणारे तापमान';

  @override
  String get weatherPage_fetchingWeather => 'हवामान मिळवत आहे...';

  @override
  String get weatherPage_gettingConditions => 'नवीनतम हवामान मिळवत आहे';

  @override
  String get weatherPage_gustSpeed => 'वाऱ्याचा वेग';

  @override
  String get weatherPage_humidity => 'आर्द्रता';

  @override
  String get weatherPage_locationDeniedDesc =>
      'ब्राउझर सेटिंग्जमध्ये स्थान सक्षम करा किंवा खाली शोधा.';

  @override
  String get weatherPage_locationDeniedTitle => 'स्थान प्रवेश नाकारला';

  @override
  String get weatherPage_noLocationDesc =>
      'तुमचे स्थान वापरण्यासाठी स्थान बटणावर क्लिक करा.';

  @override
  String get weatherPage_noLocationTitle => 'कोणतेही स्थान निवडलेले नाही';

  @override
  String get weatherPage_pressure => 'दाब';

  @override
  String get weatherPage_rain => 'पाऊस';

  @override
  String get weatherPage_searchBtn => 'शोधा';

  @override
  String get weatherPage_searchManually => 'मॅन्युअली शोधा';

  @override
  String get weatherPage_searchPlaceholder => 'शहर किंवा जिल्हा शोधा...';

  @override
  String get weatherPage_subtitle => 'कोणत्याही स्थानासाठी रिअल-टाइम परिस्थिती';

  @override
  String get weatherPage_title => 'हवामान';

  @override
  String get weatherPage_useMyLocation => 'माझे स्थान वापरा';

  @override
  String get weatherPage_useMyLocationTitle => 'माझे स्थान वापरा';

  @override
  String get weatherPage_uvHigh => 'जास्त';

  @override
  String get weatherPage_uvIndex => 'UV इंडेक्स';

  @override
  String get weatherPage_uvLow => 'कमी';

  @override
  String get weatherPage_uvModerate => 'मध्यम';

  @override
  String get weatherPage_uvVeryHigh => 'अत्यंत जास्त';

  @override
  String get weatherPage_visibility => 'दृश्यमानता';

  @override
  String get weatherPage_wind => 'वारा';

  @override
  String weatherRain(String value) {
    return '$value% पावसाची शक्यता';
  }

  @override
  String get weatherSearchHint => 'गाव, शहर किंवा जिल्हा';

  @override
  String get weatherWorkOk => 'सध्या शेतातील कामासाठी हवामान चांगले आहे.';

  @override
  String get weatherSprayWarn => 'पाऊस अपेक्षित — आज फवारणी करू नका.';

  @override
  String get weatherTips_clear =>
      '✅ निरभ्र आकाश — शेतातील कामे आणि खत फवारणीसाठी योग्य.';

  @override
  String get weatherTips_extremeHeat =>
      '🔥 तीव्र उष्णता — सकाळी लवकर पाणी द्या.';

  @override
  String get weatherTips_foggy =>
      '🌫️ धुक्याची सकाळ — धुके निवेपर्यंत कीटकनाशक फवारणी थांबवा.';

  @override
  String get weatherTips_frost =>
      '❄️ थंडीची लाट — पिकांचे नुकसान टाळण्यासाठी रात्री झाकून ठेवा.';

  @override
  String get weatherTips_heavyRainWind =>
      '🌧️ मुसळधार पाऊस + जोरदार वारा — फवारणी आणि कापणी पुढे ढकलणे.';

  @override
  String get weatherTips_highHeatUV =>
      '☀️ जास्त उष्णता — पहाटे किंवा संध्याकाळी सिंचन करा.';

  @override
  String get weatherTips_highHumidity =>
      '💧 जास्त आर्द्रता — बुरशीजन्य रोगांकडे लक्ष द्या.';

  @override
  String get weatherTips_moderate =>
      '🌱 मध्यम परिस्थिती — दैनंदिन शेतीकामासाठी योग्य.';

  @override
  String get weatherTips_rain =>
      '🌧️ आज पाऊस — सिंचन टाळा, रोपांची पुनर्लागवड करण्यासाठी योग्य.';

  @override
  String get weatherTips_storm =>
      '⚡ वादळाचा इशारा — शेतातील कामे टाळा, पिके सुरक्षित करा.';

  @override
  String get weatherTips_strongWind => '💨 जोरदार वारा — फवारणी टाळा.';

  @override
  String get weatherTips_sunnyClear =>
      '🌤️ चांगला सूर्यप्रकाश — कापणी आणि धान्य वाळवण्यासाठी उत्तम.';

  @override
  String get weatherUseLocation => 'माझे स्थान घ्या';

  @override
  String get weatherWind => 'वारा';

  @override
  String get weatherWindWarn =>
      'जोरदार वारा — फवारणी वाहून जाईल. वारा शांत होऊ द्या.';

  @override
  String get yieldPredictor_areaRequired => 'योग्य क्षेत्रफळ आवश्यक आहे';

  @override
  String get yieldPredictor_averageRegional => 'प्रादेशिक सरासरी';

  @override
  String get yieldPredictor_baseYield => 'आधारभूत उत्पन्न';

  @override
  String get yieldPredictor_comparisonChart => 'उत्पन्न तुलना';

  @override
  String get yieldPredictor_cropType => 'पिकाचा प्रकार';

  @override
  String get yieldPredictor_cropTypeRequired => 'पिकाचा प्रकार आवश्यक आहे';

  @override
  String get yieldPredictor_description =>
      'अपेक्षित पिकाच्या उत्पन्नाचा अंदाज लावण्यासाठी डेटा प्रविष्ट करा.';

  @override
  String get yieldPredictor_dry => 'कोरडी';

  @override
  String get yieldPredictor_enterArea => 'क्षेत्रफळ टाका';

  @override
  String get yieldPredictor_environmental => 'पर्यावरण डेटा';

  @override
  String get yieldPredictor_expandMap => 'विस्तार करा';

  @override
  String get yieldPredictor_farmInputs => 'शेती माहिती';

  @override
  String get yieldPredictor_landArea => 'जमिनीचे क्षेत्रफळ';

  @override
  String get yieldPredictor_mapInstruction =>
      'उत्पन्नाचा अंदाज लावण्यासाठी शेतावर क्लिक करा';

  @override
  String get yieldPredictor_ndvi => 'NDVI (वनस्पती निर्देशांक)';

  @override
  String get yieldPredictor_ndviHigh => 'दाट पिके';

  @override
  String get yieldPredictor_ndviLow => 'उघडी जमीन';

  @override
  String get yieldPredictor_pageDescription =>
      'नकाशावर तुमच्या शेतावर क्लिक करा. ऑटो-पायलट थेट हवामान मिळवेल आणि पिकाच्या उत्पन्नाचा अंदाज लावेल.';

  @override
  String get yieldPredictor_pageTitle => 'किसान AI ऑटो-पायलट';

  @override
  String get yieldPredictor_predictButton => 'उत्पन्नाचा अंदाज लावा';

  @override
  String get yieldPredictor_predictYield => 'उत्पन्नाचा अंदाज लावा';

  @override
  String get yieldPredictor_predictedYield => 'अपेक्षित उत्पन्न';

  @override
  String get yieldPredictor_predicting => 'अंदाज लावत आहे...';

  @override
  String get yieldPredictor_predictionError =>
      'अंदाज लावण्यात अपयश. पुन्हा प्रयत्न करा.';

  @override
  String get yieldPredictor_predictionSuccess => 'उत्पन्न अंदाज पूर्ण झाला!';

  @override
  String get yieldPredictor_rainfall => 'पाऊस (मिमी)';

  @override
  String get yieldPredictor_readyDescription =>
      'AI-आधारित उत्पन्नाचा अंदाज मिळवण्यासाठी डेटा भरा.';

  @override
  String get yieldPredictor_readyTitle =>
      'उत्पन्नाचा अंदाज लावण्यासाठी तयार आहात?';

  @override
  String get yieldPredictor_regionBaseline => 'बेसलाइन';

  @override
  String get yieldPredictor_satelliteData => 'उपग्रह आणि हवामान डेटा';

  @override
  String get yieldPredictor_selectCrop => 'पीक निवडा...';

  @override
  String get yieldPredictor_soilMoisture => 'मातीची आर्द्रता (%)';

  @override
  String get yieldPredictor_stepEnvironment => 'पर्यावरण';

  @override
  String get yieldPredictor_stepGuide1 => 'पायरी १: नकाशावर स्थान सेट करा';

  @override
  String get yieldPredictor_stepGuide2 => 'पायरी २: पर्यावरण डेटा समायोजित करा';

  @override
  String get yieldPredictor_stepGuide3 =>
      'पायरी ३: पीक निवडा आणि अंदाज लावा वर क्लिक करा';

  @override
  String get yieldPredictor_stepMap => 'स्थान';

  @override
  String get yieldPredictor_stepResults => 'निकाल';

  @override
  String get yieldPredictor_title => 'उत्पन्न अंदाजक';

  @override
  String get yieldPredictor_tonsPerHectare => 'टन प्रति हेक्टर';

  @override
  String get yieldPredictor_validationError => 'कृपया सर्व आवश्यक फील्ड भरा';

  @override
  String get yieldPredictor_vsAverage => 'प्रादेशिक सरासरीच्या तुलनेत';

  @override
  String get yieldPredictor_wet => 'ओलसर';
}
