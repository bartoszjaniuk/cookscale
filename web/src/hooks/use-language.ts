import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type Language, SUPPORTED_LANGUAGES } from "@/i18n";

const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
    },
    [i18n],
  );

  return {
    currentLanguage: i18n.language as Language,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
};

export { useLanguage };
