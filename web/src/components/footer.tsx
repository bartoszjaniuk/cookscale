import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./language-switcher";

export function FooterComponent() {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white mt-16 md:mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Mobile: stacked | Desktop: 4-column grid */}
        <div className="flex flex-col gap-10 md:grid md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-baseline">
              <span className="font-serif text-[28px]">CookScale</span>
              <span
                className="text-[28px]"
                style={{ color: "var(--color-primary)" }}
              >
                .
              </span>
            </div>
            <p className="mt-3 text-white/60 text-[14px] leading-relaxed">
              {t("FOOTER.DESCRIPTION")}
            </p>
          </div>

          {/* Produkt */}
          <div>
            <h4
              className="font-serif text-[18px] mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {t("FOOTER.PRODUCT_SECTION")}
            </h4>
            <ul className="space-y-3 text-[15px] text-white/80">
              <li>
                <a
                  href="/calculator"
                  className="hover:text-white transition-colors"
                >
                  {t("FOOTER.LINK_CALCULATOR")}
                </a>
              </li>
              <li>
                <a href="/ai" className="hover:text-white transition-colors">
                  {t("FOOTER.LINK_AI")}
                </a>
              </li>
              <li>
                <a
                  href="/history"
                  className="hover:text-white transition-colors"
                >
                  {t("FOOTER.LINK_HISTORY")}
                </a>
              </li>
            </ul>
          </div>

          {/* Pomoc */}
          <div>
            <h4
              className="font-serif text-[18px] mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {t("FOOTER.HELP_SECTION")}
            </h4>
            <ul className="space-y-3 text-[15px] text-white/80">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("FOOTER.LINK_FAQ")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("FOOTER.LINK_CONTACT")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("FOOTER.LINK_PRIVACY")}
                </a>
              </li>
            </ul>
          </div>

          {/* Język */}
          <div>
            <h4
              className="font-serif text-[18px] mb-4"
              style={{ color: "var(--color-primary)" }}
            >
              {t("FOOTER.LANGUAGE_SECTION")}
            </h4>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 text-[13px] text-white/40">
          {t("FOOTER.COPYRIGHT")}
        </div>
      </div>
    </footer>
  );
}
