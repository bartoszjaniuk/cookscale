import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: "pl", label: t("FOOTER.LANG_PL") || "Polski" },
    { code: "en", label: t("FOOTER.LANG_EN") || "English" },
  ] as const;

  return (
    <ul className="space-y-3 text-[15px] text-white/80">
      {languages.map(({ code, label }) => (
        <li key={code}>
          <button
            onClick={() => changeLanguage(code as "pl" | "en")}
            className={`cursor-pointer transition-colors ${
              currentLanguage === code ? "text-white" : "hover:text-white"
            }`}
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
