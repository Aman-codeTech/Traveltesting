import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRIP_TRANSLATIONS } from './tripTranslations';

export type LanguageCode = 'en' | 'hi' | 'hr' | 'pa' | 'mr' | 'bn' | 'ta' | 'te' | 'gu';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hr', name: 'Haryanvi', nativeName: 'हरियाणवी', flag: '🌾' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Brand & Greeting
    appName: 'TravelSaathi AI',
    tagline: 'Your Smart Travel Companion Across India',
    builtInHaryana: 'Smart AI Travel Companion for India',
    bharatKiKhoj: 'Bharat Ki Khoj Ab Aur Aasaan',
    namasteGreeting: 'Namaste!',
    whereToGoToday: 'Where do you want to go today?',
    searchPlaceholder: 'Search destinations, experiences...',
    exploreNow: 'Explore Now',

    // Nav Links
    home: 'Home',
    exploreIndia: 'Explore India',
    planTrip: 'Plan Trip',
    planMyTrip: 'Plan My Trip',
    hotels: 'Hotels',
    restaurants: 'Restaurants',
    taxis: 'Taxi',
    hiddenGems: 'Hidden Gems',
    advertise: 'Advertise',
    myTrips: 'My Trips',
    aiAssistant: 'AI Assistant',
    saved: 'Saved',
    settings: 'Settings',
    profile: 'Profile',
    dashboard: 'Dashboard',
    language: 'Language / भाषा',

    // Planner Labels (Reference screen 3)
    whereDoYouWantToGo: 'Where do you want to go?',
    whereDoYouWantToGoDesc: 'e.g. Rajasthan, Himachal Pradesh, Kerala, Goa...',
    budgetLabel: 'Tera budget kitna se?',
    budgetSub: 'Select budget range',
    interestsLabel: 'Tanne ke pasand se?',
    interestsSub: 'Select interests',
    daysLabel: 'How many days?',
    daysSub: 'Select duration',
    generateTripBtn: 'Generate My Trip ✨',
    suggestedDuration: 'Suggested Trip Duration',

    // Local Experiences (Reference screen 7)
    experienceRealIndia: 'Experience the Real India',
    experienceSub: 'Meet locals | Taste local | Live the culture',
    all: 'All',
    food: 'Food',
    culture: 'Culture',
    adventure: 'Adventure',
    nature: 'Nature',
    ruralLife: 'Rural Life / Farming',
    heritage: 'Heritage',

    // Experience Card items
    foodTourTitle: 'Traditional Food & Dhaba Trail',
    foodTourDesc: 'Taste authentic desi food in iconic local dhabas',
    folkShowTitle: 'Folk Dance & Music Show',
    folkShowDesc: 'Feel the vibrant cultural rhythm of India',
    villageHomestayTitle: 'Village Homestay & Farm Tour',
    villageHomestayDesc: 'Stay with local farming families & tractor rides',

    // Itinerary & Stats (Reference screen 6 & 8)
    aiRecommended: 'AI Recommended',
    saveItinerary: 'Save Itinerary',
    tripStats: 'Your Travel Stats',
    tripsPlanned: 'Trips Planned',
    destinations: 'Destinations',
    states: 'States',
    helpAndSupport: 'Help & Support',
    aboutApp: 'About TravelSaathi AI',
    oneAiCompanion: 'One AI Travel Companion for Every Indian Destination',
  },

  hr: {
    // Haryanvi dialect (authentic regional touch matching reference)
    appName: 'ट्रैवल साथी AI',
    tagline: 'पूरे भारत का थारा अपना स्मार्ट साथी',
    builtInHaryana: 'स्मार्ट AI साथी, सारे भारत खातर',
    bharatKiKhoj: 'भारत की खोज अब और आसान',
    namasteGreeting: 'राम-राम जी!',
    whereToGoToday: 'आज कड़े जाणा से थारे नै?',
    searchPlaceholder: 'शहर, घूमन की जगह खोजो...',
    exploreNow: 'घूमो घणे चाव तै',

    home: 'घर',
    exploreIndia: 'भारत घूमो',
    planTrip: 'ट्रिप बणाओ',
    planMyTrip: 'म्हारी ट्रिप बणाओ',
    hotels: 'होटल',
    restaurants: 'ढाबे व खान-पान',
    taxis: 'टैक्सी',
    hiddenGems: 'अनदेखी जगहां',
    advertise: 'साझेदार बणो',
    myTrips: 'म्हारी ट्रिप',
    aiAssistant: 'AI साथी',
    saved: 'पसंदीदा',
    settings: 'सेटिंग्स',
    profile: 'प्रोफाइल',
    dashboard: 'डैशबोर्ड',
    language: 'बोली / भाषा',

    whereDoYouWantToGo: 'कड़े जाणा से थारे नै?',
    whereDoYouWantToGoDesc: 'जैसे: हरियाणा, हिमाचल प्रदेश, राजस्थान, केरल...',
    budgetLabel: 'तेरा बजट कितना से?',
    budgetSub: 'पईसे छांटो कितने लगाओगे',
    interestsLabel: 'तन्नै के पसंद से?',
    interestsSub: 'पसंद चुणो (खेती, खाना, किले, प्रकृति)',
    daysLabel: 'केतने दिन का टूर से?',
    daysSub: 'दिन छांटो',
    generateTripBtn: 'म्हारी ट्रिप बणाओ ✨',
    suggestedDuration: 'सलाह: 3 - 5 दिन',

    experienceRealIndia: 'असली भारत देखो',
    experienceSub: 'देसी लोगां तै मिलो | देसी खाओ | संस्कृति जीयो',
    all: 'सारे',
    food: 'खान-पान',
    culture: 'संस्कृति',
    adventure: 'रोमांच',
    nature: 'प्रकृति',
    ruralLife: 'देसी खेती व गांव',
    heritage: 'ऐतिहासिक किले',

    foodTourTitle: 'देसी हरियाणवी ढाबा टूर',
    foodTourDesc: 'ताज़ा माखन, बाजरे की रोटी, गुड़ व लस्सी का स्वाद',
    folkShowTitle: 'देसी रागिनी व सांग नृत्य',
    folkShowDesc: 'हरियाणा व राजस्थान का लोक संगीत व नृत्य',
    villageHomestayTitle: 'देहाती होमस्टे व ट्रैक्टर सैर',
    villageHomestayDesc: 'गांव के घरां म ठहरो, खेती और दूध-दही का आनंद',

    aiRecommended: 'AI की खास पसंद',
    saveItinerary: 'ट्रिप संभाल के रखो',
    tripStats: 'थारा यात्रा स्कोर',
    tripsPlanned: 'बणाई गई ट्रिप',
    destinations: 'देखे शहर',
    states: 'घूमे राज्य',
    helpAndSupport: 'मदद व सहारा',
    aboutApp: 'ट्रैवल साथी बारे म',
    oneAiCompanion: 'हर भारतीय सफर खातर एक सच्चा AI साथी',
  },

  hi: {
    appName: 'ट्रैवल साथी AI',
    tagline: 'संपूर्ण भारत में आपका स्मार्ट यात्रा साथी',
    builtInHaryana: 'भारत दर्शन हेतु स्मार्ट AI यात्रा साथी',
    bharatKiKhoj: 'भारत की खोज अब और आसान',
    namasteGreeting: 'नमस्ते!',
    whereToGoToday: 'आज आप कहाँ जाना चाहते हैं?',
    searchPlaceholder: 'मंज़िलें, शहर या अनुभव खोजें...',
    exploreNow: 'अभी घूमें',

    home: 'होम',
    exploreIndia: 'भारत दर्शन',
    planTrip: 'ट्रिप प्लान करें',
    planMyTrip: 'मेरी ट्रिप बनाएं',
    hotels: 'होटल',
    restaurants: 'रेस्तरां व ढाबे',
    taxis: 'टैक्सी',
    hiddenGems: 'छिपे हुए नगीने',
    advertise: 'व्यापार जोड़ें',
    myTrips: 'मेरी यात्राएं',
    aiAssistant: 'AI सहायक',
    saved: 'सहेजे गए',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    language: 'भाषा / Language',

    whereDoYouWantToGo: 'आप कहाँ जाना चाहते हैं?',
    whereDoYouWantToGoDesc: 'उदा. हरियाणा, हिमाचल प्रदेश, राजस्थान, केरल...',
    budgetLabel: 'आपका बजट कितना है?',
    budgetSub: 'बजट श्रेणी चुनें',
    interestsLabel: 'आपकी पसंद क्या है?',
    interestsSub: 'रुचियां चुनें (विरासत, प्रकृति, खान-पान)',
    daysLabel: 'कितने दिनों की यात्रा?',
    daysSub: 'अवधि चुनें',
    generateTripBtn: 'मेरी ट्रिप बनाएं ✨',
    suggestedDuration: 'सुझाया गया समय: 3 - 5 दिन',

    experienceRealIndia: 'असली भारत का अनुभव करें',
    experienceSub: 'स्थानीय लोगों से मिलें | स्थानीय स्वाद चखें | संस्कृति जिएं',
    all: 'सभी',
    food: 'खान-पान',
    culture: 'संस्कृति',
    adventure: 'रोमांच',
    nature: 'प्रकृति',
    ruralLife: 'ग्रामीण जीवन व खेती',
    heritage: 'ऐतिहासिक धरोहर',

    foodTourTitle: 'पारंपरिक हरियाणवी व देसी फूड टूर',
    foodTourDesc: 'प्रसिद्ध ढाबों पर शुद्ध घी, मक्के-बाजरे की रोटी और लस्सी',
    folkShowTitle: 'लोक नृत्य एवं संगीत संध्या',
    folkShowDesc: 'पारंपरिक लोक संस्कृति और संगीत की धुन',
    villageHomestayTitle: 'ग्रामीण होमस्टे एवं फार्म अनुभव',
    villageHomestayDesc: 'गांव के परिवारों के साथ विश्राम और ट्रैक्टर सफारी',

    aiRecommended: 'AI अनुशंसित',
    saveItinerary: 'यात्रा सहेजें',
    tripStats: 'आपके यात्रा आंकड़े',
    tripsPlanned: 'योजित यात्राएं',
    destinations: 'देखे गए स्थल',
    states: 'घूमे हुए राज्य',
    helpAndSupport: 'सहायता एवं संपर्क',
    aboutApp: 'ट्रैवल साथी के बारे में',
    oneAiCompanion: 'हर भारतीय गंतव्य के लिए एक मात्र AI साथी',
  },

  pa: {
    appName: 'ਟਰੈਵਲ ਸਾਥੀ AI',
    tagline: 'ਸਾਰੇ ਭਾਰਤ ਵਿੱਚ ਤੁਹਾਡਾ ਸਮਾਰਟ ਸਫ਼ਰ ਸਾਥੀ',
    builtInHaryana: 'ਹਰਿਆਣਾ ਵਿੱਚ ਬਣਿਆ, ਪੂਰੇ ਭਾਰਤ ਲਈ',
    bharatKiKhoj: 'ਭਾਰਤ ਦੀ ਖੋਜ ਹੁਣ ਹੋਰ ਵੀ ਆਸਾਨ',
    namasteGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!',
    whereToGoToday: 'ਅੱਜ ਤੁਸੀਂ ਕਿੱਥੇ ਜਾਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
    searchPlaceholder: 'ਸ਼ਹਿਰ, ਘੁੰਮਣ ਵਾਲੀਆਂ ਥਾਵਾਂ ਖੋਜੋ...',
    exploreNow: 'ਹੁਣੇ ਦੇਖੋ',

    home: 'ਹੋਮ',
    exploreIndia: 'ਭਾਰਤ ਦਰਸ਼ਨ',
    planTrip: 'ਟ੍ਰਿਪ ਪਲੈਨ ਕਰੋ',
    planMyTrip: 'ਮੇਰੀ ਟ੍ਰਿਪ ਬਣਾਓ',
    hotels: 'ਹੋਟਲ',
    restaurants: 'ਢਾਬੇ ਤੇ ਰੈਸਟੋਰੈਂਟ',
    taxis: 'ਟੈਕਸੀ',
    hiddenGems: 'ਲੁਕੀਆਂ ਸੋਹਣੀਆਂ ਥਾਵਾਂ',
    advertise: 'ਵਪਾਰ ਜੋੜੋ',
    myTrips: 'ਮੇਰੇ ਸਫ਼ਰ',
    aiAssistant: 'AI ਸਾਥੀ',
    saved: 'ਸੰਭਾਲੇ ਗਏ',
    settings: 'ਸੈਟਿੰਗਜ਼',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    language: 'ਬੋਲੀ / ਭਾਸ਼ਾ',

    whereDoYouWantToGo: 'ਤੁਸੀਂ ਕਿੱਥੇ ਜਾਣਾ ਚਾਹੁੰਦੇ ਹੋ?',
    whereDoYouWantToGoDesc: 'ਜਿਵੇਂ: ਹਰਿਆਣਾ, ਪੰਜਾਬ, ਰਾਜਸਥਾਨ, ਹਿਮਾਚਲ...',
    budgetLabel: 'ਤੁਹਾਡਾ ਬਜਟ ਕਿੰਨਾ ਹੈ?',
    budgetSub: 'ਬਜਟ ਚੁਣੋ',
    interestsLabel: 'ਤੁਹਾਨੂੰ ਕੀ ਪਸੰਦ ਹੈ?',
    interestsSub: 'ਪਸੰਦ ਚੁਣੋ',
    daysLabel: 'ਕਿੰਨੇ ਦਿਨਾਂ ਦਾ ਸਫ਼ਰ?',
    daysSub: 'ਸਫ਼ਰ ਦੇ ਦਿਨ',
    generateTripBtn: 'ਮੇਰੀ ਟ੍ਰਿਪ ਬਣਾਓ ✨',
    suggestedDuration: 'ਸੁਝਾਅ: 3 - 5 ਦਿਨ',

    experienceRealIndia: 'ਅਸਲੀ ਭਾਰਤ ਦਾ ਅਨੁਭਵ',
    experienceSub: 'ਲੋਕਾਂ ਨੂੰ ਮਿਲੋ | ਦੇਸੀ ਖਾਣਾ ਖਾਓ | ਸੱਭਿਆਚਾਰ ਜੀਓ',
    all: 'ਸਾਰੇ',
    food: 'ਖਾਣ-ਪੀਣ',
    culture: 'ਸੱਭਿਆਚਾਰ',
    adventure: 'ਸਾਹਸ',
    nature: 'ਕੁਦਰਤ',
    ruralLife: 'ਪੇਂਡੂ ਜੀਵਨ ਤੇ ਖੇਤੀ',
    heritage: 'ਇਤਿਹਾਸਿਕ ਕਿਲ੍ਹੇ',

    foodTourTitle: 'ਪਰੰਪਰਾਗਤ ਦੇਸੀ ਢਾਬਾ ਟੂਰ',
    foodTourDesc: 'ਦੇਸੀ ਘਿਓ, ਮੱਖਣ, ਮੱਕੀ ਦੀ ਰੋਟੀ ਤੇ ਲੱਸੀ ਦਾ ਸੁਆਦ',
    folkShowTitle: 'ਭੰਗੜਾ ਤੇ ਲੋਕ ਸੰਗੀਤ ਸ਼ੋਅ',
    folkShowDesc: 'ਪੰਜਾਬ ਤੇ ਹਰਿਆਣਾ ਦਾ ਪ੍ਰਸਿੱਧ ਲੋਕ ਨਾਚ',
    villageHomestayTitle: 'ਪਿੰਡ ਦਾ ਹੋਮਸਟੇ ਤੇ ਟਰੈਕਟਰ ਸਵਾਰੀ',
    villageHomestayDesc: 'ਪੇਂਡੂ ਪਰਿਵਾਰਾਂ ਨਾਲ ਰਹਿਣ ਦਾ ਅਨੰਦ',

    aiRecommended: 'AI ਸਿਫ਼ਾਰਸ਼ੀ',
    saveItinerary: 'ਸਫ਼ਰ ਸੰਭਾਲੋ',
    tripStats: 'ਤੁਹਾਡਾ ਸਫ਼ਰ ਸਕੋਰ',
    tripsPlanned: 'ਬਣਾਏ ਟ੍ਰਿਪ',
    destinations: 'ਵੇਖੇ ਸ਼ਹਿਰ',
    states: 'ਘੁੰਮੇ ਸੂਬੇ',
    helpAndSupport: 'ਮਦਦ ਤੇ ਸਹਾਇਤਾ',
    aboutApp: 'ਟਰੈਵਲ ਸਾਥੀ ਬਾਰੇ',
    oneAiCompanion: 'ਹਰ ਭਾਰਤੀ ਮੰਜ਼ਿਲ ਲਈ ਇੱਕੋ AI ਸਾਥੀ',
  },

  mr: {
    appName: 'ट्रॅव्हल साथी AI',
    tagline: 'संपूर्ण भारतात आपला स्मार्ट प्रवास साथी',
    builtInHaryana: 'हरियाणात निर्मित, संपूर्ण भारतासाठी',
    bharatKiKhoj: 'भारताचा शोध आता अधिक सोपा',
    namasteGreeting: 'नमस्कार!',
    whereToGoToday: 'आज तुम्हाला कुठे जायचे आहे?',
    searchPlaceholder: 'ठिकाणे, संस्कृती किंवा शहरे शोधा...',
    exploreNow: 'आता एक्सप्लोर करा',

    home: 'मुख्यपृष्ठ',
    exploreIndia: 'भारत दर्शन',
    planTrip: 'ट्रिप प्लॅन करा',
    planMyTrip: 'माझी ट्रिप तयार करा',
    hotels: 'हॉटेल्स',
    restaurants: 'ढाबे व रेस्टॉरंट्स',
    taxis: 'टॅक्सी',
    hiddenGems: 'गुपित सुंदर ठिकाणे',
    advertise: 'व्यवसाय जोडा',
    myTrips: 'माझे प्रवास',
    aiAssistant: 'AI साहाय्यक',
    saved: 'जतन केलेले',
    settings: 'सेटिंग्ज',
    profile: 'प्रोफाइल',
    dashboard: 'डॅशबोर्ड',
    language: 'भाषा / Language',

    whereDoYouWantToGo: 'तुम्हाला कुठे जायचे आहे?',
    whereDoYouWantToGoDesc: 'उदा. हरियाणा, महाराष्ट्र, राजस्थान, केरळ...',
    budgetLabel: 'तुमचे बजेट किती आहे?',
    budgetSub: 'बजेट निवडा',
    interestsLabel: 'तुमची आवड काय आहे?',
    interestsSub: 'आवडी निवडा',
    daysLabel: 'किती दिवस?',
    daysSub: 'कालावधी निवडा',
    generateTripBtn: 'माझी ट्रिप तयार करा ✨',
    suggestedDuration: 'सुचवलेला कालावधी: ३ - ५ दिवस',

    experienceRealIndia: 'खऱ्या भारताचा अनुभव घ्या',
    experienceSub: 'स्थानिकांना भेटा | स्थानिक चव चाखा | संस्कृती अनुभवा',
    all: 'सर्व',
    food: 'अन्न',
    culture: 'संस्कृती',
    adventure: 'साहस',
    nature: 'निसर्ग',
    ruralLife: 'ग्रामीण जीवन व शेती',
    heritage: 'ऐतिहासिक वारसा',

    foodTourTitle: 'पारंपरिक देशी ढाबा फूड टूर',
    foodTourDesc: 'स्थानिक ढाब्यांवर अस्सल जेवण व लस्सी',
    folkShowTitle: 'लोककला व संगीत कार्यक्रम',
    folkShowDesc: 'पारंपरिक लोकनृत्य व वाद्यसंगीत',
    villageHomestayTitle: 'ग्रामीण होमस्टे व फार्म टूर',
    villageHomestayDesc: 'शेतकरी कुटुंबांसोबत मुक्काम व ट्रॅक्टर सफारी',

    aiRecommended: 'AI शिफारस केलेले',
    saveItinerary: 'प्रवास जतन करा',
    tripStats: 'तुमची प्रवास आकडेवारी',
    tripsPlanned: 'प्लॅन केलेल्या ट्रिप्स',
    destinations: 'पाहिलेली शहरे',
    states: 'फिरलेली राज्ये',
    helpAndSupport: 'मदत व संपर्क',
    aboutApp: 'ट्रॅव्हल साथी बद्दल',
    oneAiCompanion: 'प्रत्येक भारतीय प्रवासासाठी एकच AI साथी',
  },

  bn: {
    appName: 'ট্রাভেল সাথী AI',
    tagline: 'সমগ্র ভারতে আপনার বিশ্বস্ত ভ্রমণ সঙ্গী',
    builtInHaryana: 'হরিয়ানায় তৈরি, সমগ্র ভারতের জন্য',
    bharatKiKhoj: 'ভারতের আবিষ্কার এখন আরও সহজ',
    namasteGreeting: 'নমস্কার!',
    whereToGoToday: 'আজ আপনি কোথায় যেতে চান?',
    searchPlaceholder: 'গন্তব্য বা অভিজ্ঞতা খুঁজুন...',
    exploreNow: 'এখনই ভ্রমণ করুন',

    home: 'হোম',
    exploreIndia: 'ভারত দর্শন',
    planTrip: 'ট্রিপ প্ল্যান করুন',
    planMyTrip: 'আমার ট্রিপ তৈরি করুন',
    hotels: 'হোটেল',
    restaurants: 'রেস্তোরাঁ ও ধাবা',
    taxis: 'ট্যাক্সি',
    hiddenGems: 'অদেখা সুন্দর স্থান',
    advertise: 'ব্যবসা যুক্ত করুন',
    myTrips: 'আমার ভ্রমণ',
    aiAssistant: 'AI সহকারী',
    saved: 'সংরক্ষিত',
    settings: 'সেটিংস',
    profile: 'প্রোফাইল',
    dashboard: 'ড্যাশবোর্ড',
    language: 'ভাষা / Language',

    whereDoYouWantToGo: 'আপনি কোথায় যেতে চান?',
    whereDoYouWantToGoDesc: 'যেমন: হরিয়ানা, রাজস্থান, কাশ্মীর, কেরল...',
    budgetLabel: 'আপনার বাজেট কত?',
    budgetSub: 'বাজেট বেছে নিন',
    interestsLabel: 'আপনার পছন্দ কী?',
    interestsSub: 'পছন্দ বেছে নিন',
    daysLabel: 'কত দিনের ভ্রমণ?',
    daysSub: 'সময়কাল বেছে নিন',
    generateTripBtn: 'আমার ট্রিপ তৈরি করুন ✨',
    suggestedDuration: 'প্রস্তাবিত সময়: ৩ - ৫ দিন',

    experienceRealIndia: 'আসল ভারতের অভিজ্ঞতা',
    experienceSub: 'স্থানীয়দের সাথে মিশুন | স্থানীয় খাবারের স্বাদ নিন',
    all: 'সব',
    food: 'খাবার',
    culture: 'সংস্কৃতি',
    adventure: 'রোমাঞ্চ',
    nature: 'প্রকৃতি',
    ruralLife: 'গ্রামীণ জীবন ও কৃষি',
    heritage: 'ঐতিহাসিক দুর্গ',

    foodTourTitle: 'ঐতিহ্যবাহী দেশি ধাবা ফুড ট্যুর',
    foodTourDesc: 'খাঁটি মাখন, রুটি এবং সুস্বাদু খাবারের স্বাদ',
    folkShowTitle: 'লোকনৃত্য ও সঙ্গীতানুষ্ঠান',
    folkShowDesc: 'স্থানীয় ঐতিহ্যবাহী লোকনৃত্য ও সুরের মায়া',
    villageHomestayTitle: 'গ্রামীণ হোমস্টে ও খামার সফর',
    villageHomestayDesc: 'গ্রামের পরিবারের সাথে সময় কাটান ও ট্র্যাক্টর রাইড',

    aiRecommended: 'AI প্রস্তাবিত',
    saveItinerary: 'ট্রিপ সংরক্ষণ করুন',
    tripStats: 'আপনার ভ্রমণ স্কোর',
    tripsPlanned: 'পরিকল্পিত ট্রিপ',
    destinations: 'পরিদর্শিত শহর',
    states: 'ভ্রমণকৃত রাজ্য',
    helpAndSupport: 'সাহায্য ও সহায়তা',
    aboutApp: 'ট্রাভেল সাথী সম্পর্কে',
    oneAiCompanion: 'প্রতিটি ভারতীয় গন্তব্যের জন্য অনন্য AI সঙ্গী',
  },

  ta: {
    appName: 'டிராவல் சாத்தி AI',
    tagline: 'இந்தியா முழுவதும் உங்கள் ஸ்மார்ட் பயணத் தோழன்',
    builtInHaryana: 'ஹரியானாவில் உருவானது, இந்தியாவுக்காக வடிவமைக்கப்பட்டது',
    bharatKiKhoj: 'இந்தியாவை அறிவது இனி மிக எளிது',
    namasteGreeting: 'வணக்கம்!',
    whereToGoToday: 'இன்று நீங்கள் எங்கு செல்ல விரும்புகிறீர்கள்?',
    searchPlaceholder: 'நகரங்கள், இடங்களை தேடுங்கள்...',
    exploreNow: 'இப்போதே தொடங்குங்கள்',

    home: 'முகப்பு',
    exploreIndia: 'பாரத உலா',
    planTrip: 'பயணம் திட்டமிடுங்கள்',
    planMyTrip: 'என் பயணத்தை உருவாக்குங்கள்',
    hotels: 'ஹோட்டல்கள்',
    restaurants: 'உணவகங்கள் & தாபா',
    taxis: 'டாக்ஸி',
    hiddenGems: 'மறைந்திருக்கும் அழகு இடங்கள்',
    advertise: 'வணிக பதிவு',
    myTrips: 'என் பயணங்கள்',
    aiAssistant: 'AI உதவியாளர்',
    saved: 'சேமிக்கப்பட்டவை',
    settings: 'அமைப்புகள்',
    profile: 'சுயவிவரம்',
    dashboard: 'டாஷ்போர்டு',
    language: 'மொழி / Language',

    whereDoYouWantToGo: 'எங்கு செல்ல விரும்புகிறீர்கள்?',
    whereDoYouWantToGoDesc: 'எ.கா: ஹரியானா, ராஜஸ்தான், கேரளா, இமாச்சல பிரதேசம்...',
    budgetLabel: 'உங்கள் பட்ஜெட் எவ்வளவு?',
    budgetSub: 'பட்ஜெட் தேர்வு செய்க',
    interestsLabel: 'உங்கள் விருப்பங்கள் என்ன?',
    interestsSub: 'விருப்பங்களை தேர்வு செய்க',
    daysLabel: 'எத்தனை நாட்கள்?',
    daysSub: 'நாட்களை தேர்வு செய்க',
    generateTripBtn: 'என் பயணத்தை உருவாக்குங்கள் ✨',
    suggestedDuration: 'பரிந்துரைக்கப்படும் நாட்கள்: 3 - 5 நாட்கள்',

    experienceRealIndia: 'உண்மையான இந்தியாவை உணருங்கள்',
    experienceSub: 'மக்களை சந்தியுங்கள் | சுவையுங்கள் | கலாச்சாரத்தை வாழுங்கள்',
    all: 'அனைத்தும்',
    food: 'உணவு',
    culture: 'கலாச்சாரம்',
    adventure: 'சாகசம்',
    nature: 'இயற்கை',
    ruralLife: 'கிராம வாழ்க்கை & விவசாயம்',
    heritage: 'பாரம்பரிய கோட்டைகள்',

    foodTourTitle: 'பாரம்பரிய தாபா உணவு உலா',
    foodTourDesc: 'உள்ளூர் சுவையான உணவுகள் மற்றும் லஸ்ஸி',
    folkShowTitle: 'நாட்டுப்புற நடனம் & இசை நிகழ்ச்சி',
    folkShowDesc: 'பாரம்பரிய கிராமிய கலைகளின் சங்கமம்',
    villageHomestayTitle: 'கிராமப்புற தங்குமிடம் & டிராக்டர் சவாரி',
    villageHomestayDesc: 'கிராமத்து குடும்பங்களுடன் தங்கி மகிழுங்கள்',

    aiRecommended: 'AI பரிந்துரைத்தது',
    saveItinerary: 'பயணத்தை சேமிக்கவும்',
    tripStats: 'உங்கள் பயண விவரங்கள்',
    tripsPlanned: 'திட்டமிட்ட பயணங்கள்',
    destinations: 'பார்த்த இடங்கள்',
    states: 'பயணித்த மாநிலங்கள்',
    helpAndSupport: 'உதவி மற்றும் ஆதரவு',
    aboutApp: 'டிராவல் சாத்தி பற்றி',
    oneAiCompanion: 'ஒவ்வொரு இந்திய பயணத்திற்கும் ஒரே AI தோழன்',
  },

  te: {
    appName: 'ట్రావెల్ సాథీ AI',
    tagline: 'భారతదేశమంతటా మీ స్మార్ట్ ప్రయాణ నేస్తం',
    builtInHaryana: 'హర్యానాలో తయారైంది, భారత్ కోసం రూపొందించబడింది',
    bharatKiKhoj: 'భారతదేశ దర్శనం ఇప్పుడు మరింత సులభం',
    namasteGreeting: 'నమస్కారం!',
    whereToGoToday: 'ఈ రోజు మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు?',
    searchPlaceholder: 'నగరాలు, ప్రదేశాలను వెతకండి...',
    exploreNow: 'ఇప్పుడే అన్వేషించండి',

    home: 'హోమ్',
    exploreIndia: 'భారత అన్వేషణ',
    planTrip: 'ట్రిప్ ప్లాన్ చేయండి',
    planMyTrip: 'నా ట్రిప్ సిద్ధం చేయండి',
    hotels: 'హోటళ్ళు',
    restaurants: 'రెస్టారెంట్లు & ధాబాలు',
    taxis: 'ట్యాక్సీ',
    hiddenGems: 'అద్భుత రహస్య ప్రదేశాలు',
    advertise: 'వ్యాపార భాగస్వామ్యం',
    myTrips: 'నా ట్రిప్పులు',
    aiAssistant: 'AI సహాయకుడు',
    saved: 'సేవ్ చేసినవి',
    settings: 'సెట్టింగ్‌లు',
    profile: 'ప్రొఫైల్',
    dashboard: 'డాష్‌బోర్డ్',
    language: 'భాష / Language',

    whereDoYouWantToGo: 'మీరు ఎక్కడికి వెళ్లాలనుకుంటున్నారు?',
    whereDoYouWantToGoDesc: 'ఉదా: హర్యానా, రాజస్థాన్, కేరళ, హిమాచల్ ప్రదేశ్...',
    budgetLabel: 'మీ బడ్జెట్ ఎంత?',
    budgetSub: 'బడ్జెట్ పరిధిని ఎంచుకోండి',
    interestsLabel: 'మీకు ఏవి ఇష్టం?',
    interestsSub: 'ఆసక్తులను ఎంచుకోండి',
    daysLabel: 'ఎన్ని రోజులు?',
    daysSub: 'వ్యవధిని ఎంచుకోండి',
    generateTripBtn: 'నా ట్రిప్ సిద్ధం చేయండి ✨',
    suggestedDuration: 'సూచించిన సమయం: 3 - 5 రోజులు',

    experienceRealIndia: 'నిజమైన భారతదేశాన్ని అనుభవించండి',
    experienceSub: 'స్థానికులను కలవండి | రుచులను ఆస్వాదించండి',
    all: 'అన్నీ',
    food: 'ఆహారం',
    culture: 'సంస్కృతి',
    adventure: 'సాహసం',
    nature: 'ప్రకృతి',
    ruralLife: 'గ్రామీణ జీవనం & వ్యవసాయం',
    heritage: 'చారిత్రక కోటలు',

    foodTourTitle: 'సాంప్రదాయ దేశీ ధాబా ఫుడ్ టూర్',
    foodTourDesc: 'రుచికరమైన దేశీ వంటకాలు మరియు లస్సీ',
    folkShowTitle: 'జానపద నృత్యం & సంగీత వేదిక',
    folkShowDesc: 'భారతీయ సాంప్రదాయ నృత్య సంబరాలు',
    villageHomestayTitle: 'గ్రామీణ హోమ్‌స్టే & ట్రాక్టర్ సవారీ',
    villageHomestayDesc: 'రైతు కుటుంబాలతో కలసి ఉండండి',

    aiRecommended: 'AI సిఫార్సు చేసినవి',
    saveItinerary: 'ప్రయాణాన్ని భద్రపరచండి',
    tripStats: 'మీ ప్రయాణ గణాంకాలు',
    tripsPlanned: 'ప్లాన్ చేసిన ట్రిప్పులు',
    destinations: 'చూసిన ప్రదేశాలు',
    states: 'తిరిగిన రాష్ట్రాలు',
    helpAndSupport: 'సహాయం & మద్దతు',
    aboutApp: 'ట్రావెల్ సాథీ గురించి',
    oneAiCompanion: 'ప్రతి భారతీయ ప్రయాణానికి ఏకైక AI నేస్తం',
  },

  gu: {
    appName: 'ટ્રાવેલ સાથી AI',
    tagline: 'સમગ્ર ભારતમાં તમારો સ્માર્ટ પ્રવાસ સાથી',
    builtInHaryana: 'હરિયાણામાં બનેલું, સમગ્ર ભારત માટે',
    bharatKiKhoj: 'ભારતની ખોજ હવે વધુ સરળ',
    namasteGreeting: 'નમસ્તે!',
    whereToGoToday: 'આજે તમે ક્યાં જવા માંગો છો?',
    searchPlaceholder: 'શહેરો, ફરવાના સ્થળો શોધો...',
    exploreNow: 'હમણાં જ પ્રવાસ કરો',

    home: 'હોમ',
    exploreIndia: 'ભારત દર્શન',
    planTrip: 'ટ્રિપ પ્લાન કરો',
    planMyTrip: 'મારી ટ્રિપ બનાવો',
    hotels: 'હોટેલ્સ',
    restaurants: 'ઢાબા અને રેસ્ટોરન્ટ્સ',
    taxis: 'ટેક્સી',
    hiddenGems: 'અદભુત અજાણ્યા સ્થળો',
    advertise: 'બિઝનેસ જોડો',
    myTrips: 'મારી યાત્રાઓ',
    aiAssistant: 'AI સહાયક',
    saved: 'સાચવેલા સ્થળો',
    settings: 'સેટિંગ્સ',
    profile: 'પ્રોફાઇલ',
    dashboard: 'ડેશબોર્ડ',
    language: 'ભાષા / Language',

    whereDoYouWantToGo: 'તમે ક્યાં જવા માંગો છો?',
    whereDoYouWantToGoDesc: 'દા.ત. હરિયાણા, રાજસ્થાન, કેરળ, હિમાચલ...',
    budgetLabel: 'તમારું બજેટ કેટલું છે?',
    budgetSub: 'બજેટ પસંદ કરો',
    interestsLabel: 'તમને શું ગમે છે?',
    interestsSub: 'પસંદગીઓ પસંદ કરો',
    daysLabel: 'કેટલા દિવસ?',
    daysSub: 'સમયગાળો પસંદ કરો',
    generateTripBtn: 'મારી ટ્રિપ બનાવો ✨',
    suggestedDuration: 'સૂચિત સમય: 3 - 5 દિવસ',

    experienceRealIndia: 'અસલી ભારતનો અનુભવ કરો',
    experienceSub: 'સ્થાનિક લોકોને મળો | સ્વાદિષ્ટ ભોજન માણો',
    all: 'બધા',
    food: 'ખાન-પાન',
    culture: 'સંસ્કૃતિ',
    adventure: 'સાહસ',
    nature: 'કુદરત',
    ruralLife: 'ગ્રામીણ જીવન અને ખેતી',
    heritage: 'ઐતિહાસિક કિલ્લાઓ',

    foodTourTitle: 'પરંપરાગત દેશી ઢાબા ફૂડ ટૂર',
    foodTourDesc: 'શુદ્ધ ઘી, બાજરીનો રોટલો અને તાજી લસ્સી',
    folkShowTitle: 'લોક નૃત્ય અને સંગીત કાર્યક્રમ',
    folkShowDesc: 'પરંપરાગત લોકગીતો અને નૃત્યની રમઝટ',
    villageHomestayTitle: 'ગ્રામીણ હોમસ્ટે અને ટ્રેક્ટર સફારી',
    villageHomestayDesc: 'ગામડાના પરિવારો સાથે રોકાણ અને ખેતરની મજા',

    aiRecommended: 'AI ભલામણ કરેલ',
    saveItinerary: 'યાત્રા સાચવો',
    tripStats: 'તમારા યાત્રા આંકડા',
    tripsPlanned: 'પ્લાન કરેલી ટ્રિપ',
    destinations: 'જોયેલા શહેરો',
    states: 'ફરેલા રાજ્યો',
    helpAndSupport: 'મદદ અને સંપર્ક',
    aboutApp: 'ટ્રાવેલ સાથી વિશે',
    oneAiCompanion: 'દરેક ભારતીય પ્રવાસ માટે એક ઉત્તમ AI સાથી',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  formatDayTitle: (dayNumber: number, title?: string) => string;
  formatSlotTitle: (slotKey: string, defaultTitle: string) => string;
  formatStopType: (stopType: string) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('travelsaathi_lang');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('travelsaathi_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const tripDict = TRIP_TRANSLATIONS[language];
    if (tripDict && tripDict[key]) {
      return tripDict[key];
    }
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallbacks
    if (TRIP_TRANSLATIONS.en && TRIP_TRANSLATIONS.en[key]) {
      return TRIP_TRANSLATIONS.en[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  const formatDayTitle = (dayNumber: number, title?: string): string => {
    const dayWord = t('dayLabel', 'Day');
    if (!title) return `${dayWord} ${dayNumber}`;
    return title.replace(/^Day\s+(\d+)/i, `${dayWord} $1`);
  };

  const formatSlotTitle = (slotKey: string, defaultTitle: string): string => {
    if (slotKey === 'Morning') return t('slotMorningTitle', defaultTitle);
    if (slotKey === 'Afternoon') return t('slotAfternoonTitle', defaultTitle);
    if (slotKey === 'Evening') return t('slotEveningTitle', defaultTitle);
    if (slotKey === 'Night') return t('slotNightTitle', defaultTitle);
    return defaultTitle;
  };

  const formatStopType = (stopType: string): string => {
    const map: Record<string, string> = {
      BREAKFAST: t('catFood', 'Breakfast / Meal'),
      LUNCH: t('aiLunchTitle', 'Lunch'),
      DINNER: t('aiDinnerTitle', 'Dinner'),
      HOTEL: t('catAccommodation', 'Hotel Stay'),
      HIDDEN_GEM: t('hiddenGems', 'Hidden Gem'),
      ATTRACTION: t('heritage', 'Attraction'),
      ACTIVITY: t('catActivities', 'Activity'),
    };
    return map[stopType] || stopType.replace('_', ' ');
  };

  const currentLanguageOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatDayTitle,
        formatSlotTitle,
        formatStopType,
        languages: LANGUAGES,
        currentLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
