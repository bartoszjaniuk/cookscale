import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "../../../shared/locales/en.json";
import pl from "../../../shared/locales/pl.json";

const SUPPORTED_LANGUAGES = ["pl", "en"] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
    },
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: { escapeValue: false },
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      lookupLocalStorage: "app_language",
      lookupCookie: "app_language",
      caches: ["localStorage", "cookie"],
      cookieOptions: { path: "/", sameSite: "lax" },
    },
  });

export { SUPPORTED_LANGUAGES };
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export default i18n;
