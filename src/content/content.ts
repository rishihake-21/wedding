/**
 * Single source of truth for every guest-facing string and fact.
 *
 * !! Sample Maharashtrian wedding details below can be edited here before the family's content freeze. !!
 * Marathi text should be proofread by a fluent reader and an elder before launch.
 * Late changes to date, time or venue happen here only — no scene code changes.
 *
 * Devanagari is always rendered as an HTML overlay, never as WebGL text.
 */

import type { Lang } from '../core/types';

/** A string in every supported language. */
export type L10n = Record<Lang, string>;

export interface PersonEntry {
  /** Honorific, e.g. चि. (groom) or चि.सौ.कां. (bride). */
  prefix?: L10n;
  name: L10n;
  /** Short initial used in the union monogram. */
  initial: L10n;
  /** Family line shown with the name reveal. */
  family: L10n;
}

export interface HostEntry {
  relation: L10n;
  name: L10n;
}

export interface EventEntry {
  id: string;
  name: L10n;
  /** ISO 8601 with the IST offset, e.g. 2027-01-24T11:32:00+05:30. */
  startIso: string;
  endIso?: string;
  venue?: L10n;
  dressCode?: L10n;
  note?: L10n;
}

export interface Helpline {
  label: L10n;
  /** International format, digits and leading +. */
  phone: string;
}

export type UiKey =
  | 'enter'
  | 'entering'
  | 'loading'
  | 'skip'
  | 'sound'
  | 'soundOn'
  | 'soundOff'
  | 'language'
  | 'menu'
  | 'close'
  | 'date'
  | 'venue'
  | 'schedule'
  | 'families'
  | 'rsvp'
  | 'scrollHint'
  | 'liteMode'
  | 'full3dMode'
  | 'reducedMotion'
  | 'weddingDayMode'
  | 'viewFullInvite'
  | 'dearGuest'
  | 'muhuratTitle'
  | 'countdownDays'
  | 'countdownHours'
  | 'countdownMinutes'
  | 'countdownSeconds'
  | 'celebratingNow'
  | 'addToCalendar'
  | 'downloadIcs'
  | 'googleCalendar'
  | 'openInMaps'
  | 'copyAddress'
  | 'copied'
  | 'callVenue'
  | 'landmarkLabel'
  | 'parkingLabel'
  | 'stayLabel'
  | 'dressCodeLabel'
  | 'scheduleTitle'
  | 'scheduleSubtitle'
  | 'prevEvent'
  | 'nextEvent'
  | 'rsvpTitle'
  | 'rsvpSubtitle'
  | 'rsvpNameLabel'
  | 'rsvpNamePlaceholder'
  | 'rsvpGuestsLabel'
  | 'rsvpEventsLabel'
  | 'rsvpMessageLabel'
  | 'rsvpMessagePlaceholder'
  | 'rsvpSubmit'
  | 'rsvpSubmitting'
  | 'rsvpWhatsapp'
  | 'rsvpSuccessTitle'
  | 'rsvpSuccessBody'
  | 'rsvpErrorName'
  | 'rsvpErrorGuests'
  | 'rsvpErrorSubmit'
  | 'rsvpReset'
  | 'shareTitle'
  | 'shareWhatsapp'
  | 'copyLink'
  | 'linkCopied'
  | 'nativeShare'
  | 'saveTheDate'
  | 'helplinesTitle'
  | 'inAppBanner'
  | 'inAppAction'
  | 'webglLostTitle'
  | 'webglLostBody'
  | 'switchToLite'
  | 'weddingDayTitle'
  | 'weddingDaySubtitle'
  | 'liveStreamButton'
  | 'tapFluteHint'
  | 'lightDiyaHint'
  | 'diyaLitFeedback'
  | 'replayOpening';

export interface WeddingContent {
  meta: {
    title: L10n;
    description: L10n;
    /** 1200×630 preview image for WhatsApp / Open Graph. */
    ogImage: string;
  };
  /** Language names are shown in their own script in both languages. */
  languages: Record<Lang, string>;
  invocation: {
    primary: L10n;
    /** Kuladevata or other family-specific invocation. */
    family?: L10n;
  };
  radhaKrishna: {
    title: L10n;
    subtitle: L10n;
  };
  couple: {
    groom: PersonEntry;
    bride: PersonEntry;
    unionLine: L10n;
  };
  date: {
    timeZone: 'Asia/Kolkata';
    /** Start of the muhurat, ISO 8601 with +05:30. Drives the countdown and calendar file. */
    muhuratIso: string;
    endIso: string;
    muhuratLabel: L10n;
    tithi?: L10n;
  };
  venue: {
    name: L10n;
    address: L10n;
    mapsUrl: string;
    phone: string;
    landmark?: L10n;
    parking?: L10n;
    stay?: L10n;
  };
  events: EventEntry[];
  families: {
    invitationLine: L10n;
    hosts: HostEntry[];
    closingLine: L10n;
  };
  rsvp: {
    /** ISO date (YYYY-MM-DD); optional. */
    deadline?: string;
    /** WhatsApp number in international format without +, for wa.me links. */
    whatsappNumber: string;
    helplines: Helpline[];
    /** Google Apps Script web-app URL (leave empty to use local confirmation + WhatsApp fallback). */
    endpoint: string;
  };
  weddingDay: {
    /** Optional live stream URL activated on the wedding day. */
    liveStreamUrl: string;
  };
  ui: Record<UiKey, L10n>;
}

export const content: WeddingContent = {
  meta: {
    title: {
      mr: 'कृष्ण आणि देविका — शुभविवाह निमंत्रण',
      en: 'Krushna & Devika — Wedding Invitation',
    },
    description: {
      mr: 'श्रीकृष्णाच्या वृंदावनात आमच्या शुभविवाहाचे आपल्याला सस्नेह निमंत्रण.',
      en: 'Step into a moonlit Vrindavan — you are warmly invited to the wedding of Krushna & Devika.',
    },
    ogImage: '/og-card.svg',
  },

  languages: { mr: 'मराठी', en: 'English' },

  invocation: {
    primary: { mr: '॥ श्री गणेशाय नमः ॥', en: '॥ Shree Ganeshaya Namah ॥' },
    family: {
      mr: '॥ श्री कुलस्वामिनी प्रसन्न ॥',
      en: 'With the blessings of our Kuladevata and elders',
    },
  },

  radhaKrishna: {
    title: {
      mr: '॥ श्री राधाकृष्णाय नमः ॥',
      en: '॥ Shree Radha Krishnaya Namah ॥',
    },
    subtitle: {
      mr: 'कदंब वृक्षाखाली राधाकृष्णाचा दिव्य सहवास — प्रेम आणि भक्तीचे शाश्वत प्रतीक',
      en: 'Beneath the sacred Kadamba tree — eternal harmony of love & devotion',
    },
  },

  couple: {
    groom: {
      prefix: { mr: 'चि.', en: 'Chi.' },
      name: { mr: 'कृष्ण', en: 'Krushna' },
      initial: { mr: 'कृ', en: 'K' },
      family: {
        mr: 'श्री. राजेंद्र व सौ. सुजाता देशमुख यांचे ज्येष्ठ चिरंजीव, पुणे',
        en: 'Son of Shri Rajendra & Sau. Sujata Deshmukh, Pune',
      },
    },
    bride: {
      prefix: { mr: 'चि.सौ.कां.', en: 'Chi. Sau. Ka.' },
      name: { mr: 'देविका', en: 'Devika' },
      initial: { mr: 'दे', en: 'D' },
      family: {
        mr: 'श्री. विनय व सौ. माधवी कुलकर्णी यांची ज्येष्ठ कन्या, नाशिक',
        en: 'Daughter of Shri Vinay & Sau. Madhavi Kulkarni, Nashik',
      },
    },
    unionLine: {
      mr: 'दोन सूर, एक बासरी — दोन मने, एक जीवनप्रवास',
      en: 'Two melodies, one flute — two worlds uniting in love',
    },
  },

  date: {
    timeZone: 'Asia/Kolkata',
    muhuratIso: '2027-01-24T11:32:00+05:30',
    endIso: '2027-01-24T14:30:00+05:30',
    muhuratLabel: {
      mr: 'गोरज मुहूर्त · सकाळी ११ वाजून ३२ मिनिटांनी',
      en: 'Shubh Muhurat · 11:32 AM IST',
    },
    tithi: {
      mr: 'पौष कृष्ण द्वितीया · शके १९४८',
      en: 'Pausha Krishna Dwitiya · Shaka 1948',
    },
  },

  venue: {
    name: {
      mr: 'वृंदावन राजवाडा मंगल कार्यालय',
      en: 'Vrindavan Rajwada Lawns & Banquet',
    },
    address: {
      mr: 'बाणेर-पाषाण लिंक रोड, सुसगावजवळ, पुणे, महाराष्ट्र ४११०२१',
      en: 'Baner–Pashan Link Road, near Susgaon, Pune, Maharashtra 411021',
    },
    mapsUrl: 'https://maps.google.com/?q=Baner+Pashan+Link+Road+Pune+Maharashtra',
    phone: '+919822001008',
    landmark: {
      mr: 'पाषाण तलाव चौकापासून ५ मिनिटे अंतरावर',
      en: '5 minutes from Pashan Lake Chowk',
    },
    parking: {
      mr: 'मुख्य प्रवेशद्वाराजवळ व्हॅले पार्किंगची सोय उपलब्ध',
      en: 'Complimentary valet parking at the main gate',
    },
    stay: {
      mr: 'बाहेरगावच्या पाहुण्यांसाठी निवास व्यवस्था कार्यालयाजवळ आहे',
      en: 'Guest rooms reserved nearby for outstation family & friends',
    },
  },

  events: [
    {
      id: 'sakharpuda',
      name: { mr: 'साखरपुडा व मेहंदी', en: 'Sakharpuda & Mehendi' },
      startIso: '2027-01-23T11:00:00+05:30',
      endIso: '2027-01-23T14:00:00+05:30',
      venue: { mr: 'कदंब अंगण, वृंदावन राजवाडा', en: 'Kadamba Courtyard, Vrindavan Rajwada' },
      dressCode: { mr: 'मोरपंखी हिरवा किंवा पारंपरिक पोशाख', en: 'Peacock Green or Festive Traditional' },
    },
    {
      id: 'haldi',
      name: { mr: 'हळद समारंभ', en: 'Haldi Ceremony' },
      startIso: '2027-01-23T16:30:00+05:30',
      endIso: '2027-01-23T18:30:00+05:30',
      venue: { mr: 'झेंडू मंडप, वृंदावन राजवाडा', en: 'Marigold Pavilion, Vrindavan Rajwada' },
      dressCode: { mr: 'पिवळा व केशरी पोशाख', en: 'Shades of Marigold & Yellow' },
    },
    {
      id: 'sangeet',
      name: { mr: 'संगीत व सीमान्त पूजन', en: 'Sangeet & Simant Pujan' },
      startIso: '2027-01-23T19:30:00+05:30',
      endIso: '2027-01-23T22:30:00+05:30',
      venue: { mr: 'रास सभागृह, वृंदावन राजवाडा', en: 'Raas Hall, Vrindavan Rajwada' },
      dressCode: { mr: 'रात्रीचे निळे व सोनेरी पारंपरिक वस्त्र', en: 'Midnight Indigo & Gold Festive' },
    },
    {
      id: 'lagna',
      name: { mr: 'शुभमंगल (लग्न सोहळा)', en: 'Lagna (Wedding Ceremony)' },
      startIso: '2027-01-24T11:32:00+05:30',
      endIso: '2027-01-24T14:00:00+05:30',
      venue: { mr: 'मुख्य मंडप, वृंदावन राजवाडा', en: 'Main Mandap, Vrindavan Rajwada' },
      dressCode: { mr: 'पैठणी, नऊवारी किंवा पारंपरिक मराठी पोशाख', en: 'Paithani, Nauvari or Traditional Maharashtrian' },
    },
    {
      id: 'reception',
      name: { mr: 'स्वागत समारंभ (रिसेप्शन)', en: 'Reception' },
      startIso: '2027-01-24T19:00:00+05:30',
      endIso: '2027-01-24T22:00:00+05:30',
      venue: { mr: 'यमुना लॉन्स, वृंदावन राजवाडा', en: 'Yamuna Lawns, Vrindavan Rajwada' },
      dressCode: { mr: 'संध्याकाळचा पारंपरिक किंवा औपचारिक पोशाख', en: 'Evening Traditional or Formal' },
    },
  ],

  families: {
    invitationLine: {
      mr: 'सस्नेह निमंत्रण',
      en: 'With love and blessings, we invite you',
    },
    hosts: [
      {
        relation: { mr: 'वरपक्ष (आजोबा व आजी)', en: "Groom's Grandparents" },
        name: { mr: 'श्री. प्रभाकर व सौ. वसुधा देशमुख', en: 'Shri Prabhakar & Sau. Vasudha Deshmukh' },
      },
      {
        relation: { mr: 'वराचे आई-वडील', en: "Groom's Parents" },
        name: { mr: 'श्री. राजेंद्र व सौ. सुजाता देशमुख', en: 'Shri Rajendra & Sau. Sujata Deshmukh' },
      },
      {
        relation: { mr: 'वधूचे आई-वडील', en: "Bride's Parents" },
        name: { mr: 'श्री. विनय व सौ. माधवी कुलकर्णी', en: 'Shri Vinay & Sau. Madhavi Kulkarni' },
      },
      {
        relation: { mr: 'स्नेहांकित व निमंत्रक', en: 'Cordially Hosted By' },
        name: { mr: 'समस्त देशमुख व कुलकर्णी परिवार', en: 'The Deshmukh & Kulkarni Families' },
      },
    ],
    closingLine: {
      mr: 'आपल्या स्नेहपूर्ण उपस्थितीने व शुभाशीर्वादाने आमचा आनंद द्विगुणित होईल.',
      en: 'Your presence and heartfelt blessings will make this celebration complete.',
    },
  },

  rsvp: {
    deadline: '2027-01-10',
    whatsappNumber: '919822001008',
    helplines: [
      { label: { mr: 'श्री. राजेंद्र देशमुख (वरपक्ष)', en: 'Rajendra Deshmukh (Groom side)' }, phone: '+919822001008' },
      { label: { mr: 'श्री. विनय कुलकर्णी (वधूपक्ष)', en: 'Vinay Kulkarni (Bride side)' }, phone: '+919822001009' },
    ],
    endpoint: '',
  },

  weddingDay: {
    liveStreamUrl: 'https://youtube.com',
  },

  ui: {
    enter: { mr: 'निमंत्रणात प्रवेश करा', en: 'Enter Invitation' },
    entering: { mr: 'प्रवेश होत आहे…', en: 'Entering…' },
    loading: { mr: 'वृंदावन सज्ज होत आहे', en: 'Preparing Vrindavan' },
    skip: { mr: 'पुढे जा', en: 'Skip Intro' },
    sound: { mr: 'ध्वनी', en: 'Sound' },
    soundOn: { mr: 'ध्वनी चालू', en: 'Sound on' },
    soundOff: { mr: 'ध्वनी बंद', en: 'Muted' },
    language: { mr: 'भाषा', en: 'Language' },
    menu: { mr: 'मेनू', en: 'Menu' },
    close: { mr: 'बंद करा', en: 'Close' },
    date: { mr: 'दिनांक व मुहूर्त', en: 'Date' },
    venue: { mr: 'स्थळ', en: 'Venue' },
    schedule: { mr: 'कार्यक्रम', en: 'Schedule' },
    families: { mr: 'परिवार', en: 'Families' },
    rsvp: { mr: 'उपस्थिती कळवा', en: 'RSVP' },
    scrollHint: { mr: 'पुढे जाण्यासाठी खाली स्क्रोल करा', en: 'Scroll to explore the celebration' },
    liteMode: { mr: 'लाईट आवृत्ती (२D)', en: 'Lite Mode (2D)' },
    full3dMode: { mr: '३D अनुभव', en: '3D Experience' },
    reducedMotion: { mr: 'कमी हालचाल', en: 'Reduced Motion' },
    weddingDayMode: { mr: 'विवाहदिन दृश्य', en: 'Wedding Day View' },
    viewFullInvite: { mr: 'संपूर्ण निमंत्रण पहा', en: 'View Full Invitation' },
    dearGuest: { mr: 'सस्नेह नमस्कार', en: 'Dear' },
    muhuratTitle: { mr: 'शुभविवाह दिनांक', en: 'The Wedding Day' },
    countdownDays: { mr: 'दिवस', en: 'Days' },
    countdownHours: { mr: 'तास', en: 'Hours' },
    countdownMinutes: { mr: 'मिनिटे', en: 'Minutes' },
    countdownSeconds: { mr: 'सेकंद', en: 'Seconds' },
    celebratingNow: { mr: 'शुभमंगल सोहळा सुरू आहे!', en: 'The celebration is underway!' },
    addToCalendar: { mr: 'कॅलेंडरमध्ये जतन करा', en: 'Add to Calendar' },
    downloadIcs: { mr: '.ics फाईल डाउनलोड करा', en: 'Download .ics' },
    googleCalendar: { mr: 'Google Calendar', en: 'Google Calendar' },
    openInMaps: { mr: 'नकाशावर पहा', en: 'Open in Maps' },
    copyAddress: { mr: 'पत्ता कॉपी करा', en: 'Copy Address' },
    copied: { mr: 'कॉपी झाले', en: 'Copied' },
    callVenue: { mr: 'संपर्क साधा', en: 'Call Venue' },
    landmarkLabel: { mr: 'जवळची खूण', en: 'Landmark' },
    parkingLabel: { mr: 'पार्किंग', en: 'Parking' },
    stayLabel: { mr: 'निवास व्यवस्था', en: 'Guest Stay' },
    dressCodeLabel: { mr: 'पोशाख', en: 'Attire' },
    scheduleTitle: { mr: 'विवाह सोहळा कार्यक्रम', en: 'Ceremonies & Schedule' },
    scheduleSubtitle: { mr: 'प्रत्येक सोहळ्याची वेळ भारतीय प्रमाणवेळेनुसार (IST)', en: 'All timings in Indian Standard Time (IST)' },
    prevEvent: { mr: 'मागील कार्यक्रम', en: 'Previous event' },
    nextEvent: { mr: 'पुढील कार्यक्रम', en: 'Next event' },
    rsvpTitle: { mr: 'आपली उपस्थिती कळवा', en: 'RSVP & Blessings' },
    rsvpSubtitle: { mr: 'आपल्या आगमनाची माहिती देऊन आम्हाला आनंदित करा', en: 'Let us know you are coming so we can welcome you warmly' },
    rsvpNameLabel: { mr: 'आपले पूर्ण नाव', en: 'Your Full Name' },
    rsvpNamePlaceholder: { mr: 'उदा. श्री. व सौ. पाटील', en: 'e.g. Rohan & Priya Patil' },
    rsvpGuestsLabel: { mr: 'एकूण पाहुणे', en: 'Number of Guests' },
    rsvpEventsLabel: { mr: 'उपस्थित राहणारे कार्यक्रम', en: 'Events Attending' },
    rsvpMessageLabel: { mr: 'शुभाशीर्वाद / संदेश (ऐच्छिक)', en: 'Blessings or Message (optional)' },
    rsvpMessagePlaceholder: { mr: 'वधू-वरांना शुभेच्छा लिहा…', en: 'Share your wishes for Krushna & Devika…' },
    rsvpSubmit: { mr: 'उपस्थिती नोंदवा', en: 'Confirm Attendance' },
    rsvpSubmitting: { mr: 'नोंदणी सुरू आहे…', en: 'Sending…' },
    rsvpWhatsapp: { mr: 'WhatsApp वर कळवा', en: 'RSVP on WhatsApp' },
    rsvpSuccessTitle: { mr: 'मनःपूर्वक धन्यवाद!', en: 'Thank you for your RSVP!' },
    rsvpSuccessBody: { mr: 'आपली नोंद झाली आहे. आपल्या स्वागतासाठी आम्ही आतुर आहोत.', en: 'Your response has been recorded. We look forward to celebrating with you.' },
    rsvpErrorName: { mr: 'कृपया आपले नाव प्रविष्ट करा.', en: 'Please enter your name.' },
    rsvpErrorGuests: { mr: 'कृपया १ ते १० दरम्यान पाहुण्यांची संख्या निवडा.', en: 'Please choose between 1 and 10 guests.' },
    rsvpErrorSubmit: { mr: 'संदेश पाठवता आला नाही. कृपया WhatsApp द्वारे कळवा.', en: 'Could not reach the RSVP server. Please send via WhatsApp below.' },
    rsvpReset: { mr: 'पुन्हा नोंद करा', en: 'Update RSVP' },
    shareTitle: { mr: 'निमंत्रण शेअर करा', en: 'Share & Save' },
    shareWhatsapp: { mr: 'WhatsApp वर पाठवा', en: 'Share on WhatsApp' },
    copyLink: { mr: 'लिंक कॉपी करा', en: 'Copy Link' },
    linkCopied: { mr: 'लिंक कॉपी झाली', en: 'Link Copied' },
    nativeShare: { mr: 'शेअर करा', en: 'Share' },
    saveTheDate: { mr: 'सेव्ह-द-डेट कार्ड डाउनलोड करा', en: 'Download Save-the-Date' },
    helplinesTitle: { mr: 'कुटुंब संपर्क (मदतीसाठी)', en: 'Family Helplines' },
    inAppBanner: { mr: 'उत्तम ३D आणि ध्वनी अनुभवासाठी कृपया ब्राउझरमध्ये उघडा.', en: 'For the best 3D & audio experience, open this link in your browser.' },
    inAppAction: { mr: 'लिंक कॉपी करा', en: 'Copy Link' },
    webglLostTitle: { mr: '३D दृश्य तात्पुरते थांबले आहे', en: '3D graphics paused' },
    webglLostBody: { mr: 'आपण हलक्या २D आवृत्तीत संपूर्ण निमंत्रण सहज पाहू शकता.', en: 'You can continue reading the complete invitation smoothly in Lite Mode.' },
    switchToLite: { mr: 'लाईट आवृत्तीत जा', en: 'Open Lite Mode' },
    weddingDayTitle: { mr: 'शुभमंगल दिन — आजचा कार्यक्रम', en: 'Wedding Day — Live Schedule' },
    weddingDaySubtitle: { mr: 'आजच्या सर्व विधींच्या वेळा, दिशा आणि थेट प्रक्षेपण', en: "Today's ceremonies, directions to the mandap, and family contacts" },
    liveStreamButton: { mr: 'थेट प्रक्षेपण पहा', en: 'Watch Live Stream' },
    tapFluteHint: {
      mr: 'मधुर बासरीचे सूर ऐकण्यासाठी राधाकृष्णावर क्लिक करा',
      en: 'Tap Radha-Krishna to hear the sacred Bansuri',
    },
    lightDiyaHint: { mr: 'आशीर्वादाचा दिवा लावा', en: 'Light a blessing diya' },
    diyaLitFeedback: { mr: 'आपल्या नावाने एक दिवा प्रज्वलित झाला', en: 'A blessing diya has been lit' },
    replayOpening: { mr: 'सुरुवातीचा चित्रपट पुन्हा पहा', en: 'Replay Film' },
  },
};
