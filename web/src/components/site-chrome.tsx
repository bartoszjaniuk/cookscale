import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link
      to={to}
      className="text-[15px] tracking-[-0.01em] transition-colors"
      style={{
        color:
          pathname === to ? "var(--color-primary)" : "var(--color-foreground)",
      }}
    >
      {label}
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background:
          "color-mix(in oklab, var(--color-background) 80%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-baseline">
          <span className="font-serif text-[26px] leading-none">CookScale</span>
          <span
            className="text-[26px] leading-none"
            style={{ color: "var(--color-primary)" }}
          >
            .
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {link("/", t("NAVIGATION.START"))}
          {link("/calculator", t("NAVIGATION.CALCULATOR"))}
          {link("/ai", t("NAVIGATION.AI_MODE"))}
          {link("/history", t("NAVIGATION.HISTORY"))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="btn-ghost hidden sm:inline-flex py-2.5! px-5! text-[14px]!"
          >
            {t("NAVIGATION.LOGIN")}
          </Link>
          <Link to="/login" className="btn-primary py-2.5! px-5! text-[14px]!">
            {t("NAVIGATION.SIGN_UP")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-black text-white mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 grid md:grid-cols-4 gap-12">
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
          <p className="mt-4 text-white/70 text-[14px] leading-relaxed">
            {t("FOOTER.DESCRIPTION")}
          </p>
        </div>
        <div>
          <h4 className="font-serif text-[18px] mb-4">
            {t("FOOTER.PRODUCT_SECTION")}
          </h4>
          <ul className="space-y-3 text-[16px] text-white/80">
            <li>
              <Link to="/calculator">{t("FOOTER.LINK_CALCULATOR")}</Link>
            </li>
            <li>
              <Link to="/ai">{t("FOOTER.LINK_AI")}</Link>
            </li>
            <li>
              <Link to="/history">{t("FOOTER.LINK_HISTORY")}</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-[18px] mb-4">
            {t("FOOTER.HELP_SECTION")}
          </h4>
          <ul className="space-y-3 text-[16px] text-white/80">
            <li>{t("FOOTER.LINK_FAQ")}</li>
            <li>{t("FOOTER.LINK_CONTACT")}</li>
            <li>{t("FOOTER.LINK_PRIVACY")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-[18px] mb-4">
            {t("FOOTER.LANGUAGE_SECTION")}
          </h4>
          <ul className="space-y-3 text-[16px] text-white/80">
            <li>{t("FOOTER.LANG_PL")}</li>
            <li>{t("FOOTER.LANG_EN")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 text-[13px] text-white/60">
          {t("FOOTER.COPYRIGHT")}
        </div>
      </div>
    </footer>
  );
}
