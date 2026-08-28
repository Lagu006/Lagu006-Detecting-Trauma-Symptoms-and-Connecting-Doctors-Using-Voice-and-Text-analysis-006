import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LangCode } from "./languages";

type Dict = Record<string, string>;

// Curated translations for the top few Indian languages; others fall back to English.
const dictionaries: Partial<Record<LangCode, Dict>> = {
  en: {
    "app.title": "TraumaGuard AI",
    "app.tagline": "Trust in precision.",
    "auth.chooseLang": "Choose your language",
    "auth.langHint": "You can change this later in Settings.",
    "auth.signin": "Sign In",
    "auth.signup": "Create Account",
    "auth.signout": "Sign out",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm password",
    "auth.fullName": "Full name",
    "auth.phone": "Phone number",
    "auth.gender": "Gender",
    "auth.male": "Male",
    "auth.female": "Female",
    "auth.other": "Other",
    "auth.forgot": "Forgot password?",
    "auth.resetSent": "Reset instructions sent to your email.",
    "auth.orContinue": "Or continue with",
    "auth.google": "Continue with Google",
    "auth.haveAccount": "Already have an account?",
    "auth.noAccount": "New here?",
    "auth.otp": "Verification code",
    "auth.otpHint": "We'll email a 6-digit code to verify your account.",
    "auth.sendOtp": "Send code",
    "auth.verifyOtp": "Verify",
    "auth.sms.note":
      "SMS OTP requires a paid provider (Twilio etc.). Email & Google work out of the box.",
    "nav.dashboard": "Dashboard",
    "nav.chat": "AI Chat",
<<<<<<< HEAD
    "nav.chat_history": "Previous Chats",
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    "nav.records": "Records",
    "nav.reports": "Reports",
    "nav.doctors": "Doctors",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",
    "nav.emergency": "Emergency",
    "dash.protocolActive": "Protocol active",
    "dash.risk": "Weekly Stability Index",
    "dash.improving": "Improving",
    "dash.recentSession": "Recent Session",
    "dash.careNetwork": "Care Network",
    "dash.quickActions": "Quick Actions",
    "dash.startChat": "Start AI Session",
    "dash.logMood": "Log Mood",
    "dash.viewDoctors": "View Doctors",
    "chat.placeholder": "Type your message…",
    "chat.new": "New session",
    "chat.threads": "Sessions",
    "chat.send": "Send",
    "chat.voice": "Voice",
    "chat.stopVoice": "Stop",
    "chat.empty": "How are you feeling today?",
    "emerg.title": "Emergency Support",
    "emerg.subtitle": "If you are in immediate danger, please contact emergency services.",
    "emerg.activate": "ACTIVATE SOS",
    "emerg.call": "Call Emergency Services",
    "emerg.crisis": "Contact Crisis Line",
    "emerg.locate": "Locate care near you",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.profile": "Profile",
    "settings.save": "Save",
  },
  hi: {
    "app.title": "ट्रॉमागार्ड AI",
    "app.tagline": "सटीकता पर भरोसा।",
    "auth.chooseLang": "अपनी भाषा चुनें",
    "auth.langHint": "आप इसे बाद में सेटिंग्स में बदल सकते हैं।",
    "auth.signin": "साइन इन",
    "auth.signup": "खाता बनाएँ",
    "auth.signout": "साइन आउट",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
    "auth.fullName": "पूरा नाम",
    "auth.phone": "फ़ोन नंबर",
    "auth.gender": "लिंग",
    "auth.male": "पुरुष",
    "auth.female": "महिला",
    "auth.other": "अन्य",
    "auth.forgot": "पासवर्ड भूल गए?",
    "auth.resetSent": "रीसेट निर्देश आपके ईमेल पर भेजे गए।",
    "auth.orContinue": "या इसके साथ जारी रखें",
    "auth.google": "Google के साथ जारी रखें",
    "auth.haveAccount": "पहले से खाता है?",
    "auth.noAccount": "नए हैं?",
    "auth.otp": "सत्यापन कोड",
    "auth.otpHint": "हम आपके खाते को सत्यापित करने के लिए 6 अंकों का कोड ईमेल करेंगे।",
    "auth.sendOtp": "कोड भेजें",
    "auth.verifyOtp": "सत्यापित करें",
    "auth.sms.note": "SMS OTP के लिए Twilio जैसे भुगतान प्रदाता की आवश्यकता है।",
    "nav.dashboard": "डैशबोर्ड",
    "nav.chat": "AI चैट",
<<<<<<< HEAD
    "nav.chat_history": "पिछली बातचीत",
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    "nav.records": "रिकॉर्ड",
    "nav.reports": "रिपोर्ट",
    "nav.doctors": "डॉक्टर",
    "nav.notifications": "सूचनाएँ",
    "nav.settings": "सेटिंग्स",
    "nav.emergency": "आपातकाल",
    "dash.protocolActive": "प्रोटोकॉल सक्रिय",
    "dash.risk": "साप्ताहिक स्थिरता सूचकांक",
    "dash.improving": "सुधार हो रहा है",
    "dash.recentSession": "हाल का सत्र",
    "dash.careNetwork": "देखभाल नेटवर्क",
    "dash.quickActions": "त्वरित क्रियाएँ",
    "dash.startChat": "AI सत्र शुरू करें",
    "dash.logMood": "मूड लॉग करें",
    "dash.viewDoctors": "डॉक्टर देखें",
    "chat.placeholder": "अपना संदेश लिखें…",
    "chat.new": "नया सत्र",
    "chat.threads": "सत्र",
    "chat.send": "भेजें",
    "chat.voice": "आवाज़",
    "chat.stopVoice": "रोकें",
    "chat.empty": "आज आप कैसा महसूस कर रहे हैं?",
    "emerg.title": "आपातकालीन सहायता",
    "emerg.subtitle": "यदि आप तत्काल खतरे में हैं, तो कृपया आपातकालीन सेवाओं से संपर्क करें।",
    "emerg.activate": "SOS सक्रिय करें",
    "emerg.call": "आपातकालीन सेवाओं को कॉल करें",
    "emerg.crisis": "क्राइसिस लाइन से संपर्क करें",
    "emerg.locate": "आस-पास देखभाल खोजें",
    "settings.title": "सेटिंग्स",
    "settings.language": "भाषा",
    "settings.profile": "प्रोफ़ाइल",
    "settings.save": "सहेजें",
  },
  te: {
    "app.title": "ట్రామాగార్డ్ AI",
    "app.tagline": "ఖచ్చితత్వంపై నమ్మకం.",
    "auth.chooseLang": "మీ భాషను ఎంచుకోండి",
    "auth.langHint": "మీరు దీన్ని తర్వాత సెట్టింగ్‌లలో మార్చవచ్చు.",
    "auth.signin": "సైన్ ఇన్",
    "auth.signup": "ఖాతా సృష్టించండి",
    "auth.signout": "సైన్ అవుట్",
    "auth.email": "ఇమెయిల్",
    "auth.password": "పాస్‌వర్డ్",
    "auth.confirmPassword": "పాస్‌వర్డ్ నిర్ధారించండి",
    "auth.fullName": "పూర్తి పేరు",
    "auth.phone": "ఫోన్ నంబర్",
    "auth.gender": "లింగం",
    "auth.male": "పురుషుడు",
    "auth.female": "స్త్రీ",
    "auth.other": "ఇతర",
    "auth.forgot": "పాస్‌వర్డ్ మర్చిపోయారా?",
    "auth.resetSent": "రీసెట్ సూచనలు మీ ఇమెయిల్‌కి పంపబడ్డాయి.",
    "auth.orContinue": "లేదా దీనితో కొనసాగండి",
    "auth.google": "Googleతో కొనసాగండి",
    "auth.haveAccount": "ఇప్పటికే ఖాతా ఉందా?",
    "auth.noAccount": "కొత్తవారా?",
    "auth.otp": "ధృవీకరణ కోడ్",
    "auth.otpHint": "మీ ఖాతాను ధృవీకరించడానికి 6 అంకెల కోడ్‌ను ఇమెయిల్ చేస్తాము.",
    "auth.sendOtp": "కోడ్ పంపండి",
    "auth.verifyOtp": "ధృవీకరించండి",
    "auth.sms.note": "SMS OTPకి Twilio వంటి చెల్లింపు ప్రొవైడర్ అవసరం.",
    "nav.dashboard": "డాష్‌బోర్డ్",
    "nav.chat": "AI చాట్",
<<<<<<< HEAD
    "nav.chat_history": "గత సంభాషణలు",
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    "nav.records": "రికార్డులు",
    "nav.reports": "నివేదికలు",
    "nav.doctors": "వైద్యులు",
    "nav.notifications": "నోటిఫికేషన్లు",
    "nav.settings": "సెట్టింగ్‌లు",
    "nav.emergency": "అత్యవసరం",
    "dash.protocolActive": "ప్రోటోకాల్ యాక్టివ్",
    "dash.risk": "వారపు స్థిరత్వ సూచిక",
    "dash.improving": "మెరుగుపడుతోంది",
    "dash.recentSession": "ఇటీవలి సెషన్",
    "dash.careNetwork": "సంరక్షణ నెట్‌వర్క్",
    "dash.quickActions": "త్వరిత చర్యలు",
    "dash.startChat": "AI సెషన్ ప్రారంభించండి",
    "dash.logMood": "మూడ్ లాగ్ చేయండి",
    "dash.viewDoctors": "వైద్యులను చూడండి",
    "chat.placeholder": "మీ సందేశాన్ని టైప్ చేయండి…",
    "chat.new": "కొత్త సెషన్",
    "chat.threads": "సెషన్‌లు",
    "chat.send": "పంపండి",
    "chat.voice": "వాయిస్",
    "chat.stopVoice": "ఆపు",
    "chat.empty": "ఈరోజు మీరు ఎలా అనుభూతి చెందుతున్నారు?",
    "emerg.title": "అత్యవసర మద్దతు",
    "emerg.subtitle": "మీరు తక్షణ ప్రమాదంలో ఉన్నట్లయితే, దయచేసి అత్యవసర సేవలను సంప్రదించండి.",
    "emerg.activate": "SOS యాక్టివేట్",
    "emerg.call": "అత్యవసర సేవలకు కాల్ చేయండి",
    "emerg.crisis": "క్రైసిస్ లైన్‌ను సంప్రదించండి",
    "emerg.locate": "మీ దగ్గర సంరక్షణ కనుగొనండి",
    "settings.title": "సెట్టింగ్‌లు",
    "settings.language": "భాష",
    "settings.profile": "ప్రొఫైల్",
    "settings.save": "సేవ్",
  },
};

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? (localStorage.getItem("tg_lang") as LangCode | null) : null;
    if (stored) setLangState(stored);
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("tg_lang", l);
  };

  const t = (key: string): string => {
    return dictionaries[lang]?.[key] ?? dictionaries.en?.[key] ?? key;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
