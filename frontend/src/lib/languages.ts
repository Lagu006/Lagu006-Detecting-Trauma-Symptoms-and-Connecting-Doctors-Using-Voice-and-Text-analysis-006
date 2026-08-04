export type LangCode = "en" | "hi" | "te" | "ta" | "gu" | "mr" | "pa" | "bn" | "kn" | "ml" | "ur";

export const LANGUAGES: { code: LangCode; native: string; english: string; fontClass?: string }[] =
  [
    { code: "en", native: "English", english: "English" },
    { code: "hi", native: "हिन्दी", english: "Hindi", fontClass: "font-hi" },
    { code: "te", native: "తెలుగు", english: "Telugu", fontClass: "font-te" },
    { code: "ta", native: "தமிழ்", english: "Tamil", fontClass: "font-ta" },
    { code: "gu", native: "ગુજરાતી", english: "Gujarati", fontClass: "font-gu" },
    { code: "mr", native: "मराठी", english: "Marathi", fontClass: "font-hi" },
    { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", fontClass: "font-pa" },
    { code: "bn", native: "বাংলা", english: "Bengali", fontClass: "font-bn" },
    { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", fontClass: "font-kn" },
    { code: "ml", native: "മലയാളം", english: "Malayalam", fontClass: "font-ml" },
    { code: "ur", native: "اردو", english: "Urdu" },
  ];

export function fontClassFor(code: string | null | undefined): string {
  return LANGUAGES.find((l) => l.code === code)?.fontClass ?? "";
}

export function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.english ?? code;
}
