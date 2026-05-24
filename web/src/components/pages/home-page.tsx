import { useTranslation } from "react-i18next";
import {
  Zap,
  Target,
  ShieldCheck,
  Droplets,
  Flame,
  ThermometerSun,
  Sparkles,
  Calculator,
} from "lucide-react";
import { ProductCalculator } from "@/components/product-calculator";
import { HomeCalculatorPreview } from "@/components/home-calculator-preview";

export function HomePage() {
  const { t } = useTranslation();

  const features = [
    t("HOME.FEATURE_1"),
    t("HOME.FEATURE_2"),
    t("HOME.FEATURE_3"),
  ];

  const stats = [
    {
      icon: Zap,
      value: t("HOME.STAT_TIME_VALUE"),
      label: t("HOME.STAT_TIME_LABEL"),
    },
    {
      icon: Target,
      value: t("HOME.STAT_ERROR_VALUE"),
      label: t("HOME.STAT_ERROR_LABEL"),
    },
    {
      icon: ShieldCheck,
      value: t("HOME.STAT_TRUST_VALUE"),
      label: t("HOME.STAT_TRUST_LABEL"),
    },
  ];

  const macros: [string, string][] = [
    ["240", t("HOME.MACRO_KCAL")],
    ["45", t("HOME.MACRO_PROTEIN_SHORT")],
    ["5.2", t("HOME.MACRO_FAT_SHORT")],
    ["0", t("HOME.MACRO_CARBS_SHORT")],
  ];

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="relative pt-12 md:pt-24 pb-16 md:pb-24 overflow-hidden">
        {/* Radial Gradient */}
        <div
          className="absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] sm:w-[1500px] sm:h-[1500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, var(--color-primary-light) 0%, transparent 60%)",
            opacity: 1,
            zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 text-[13px] px-4 py-1.5 rounded-full"
            style={{
              background: "var(--color-background)",
              boxShadow: "0 0 0 1px var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--color-primary)" }}
            />
            {t("HOME.BADGE")}
          </span>

          <h1 className="mt-6 md:mt-8 max-w-4xl tracking-tight">
            {t("HOME.TITLE")}{" "}
            <em className="italic font-light">{t("HOME.TITLE_EM")}</em>
          </h1>

          <p
            className="mt-5 md:mt-6 max-w-2xl text-[16px] md:text-[18px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("HOME.DESCRIPTION")}
            <span
              style={{
                color: "var(--color-primary)",
                fontWeight: 500,
                marginLeft: "4px",
              }}
            >
              {t("HOME.DESCRIPTION_HIGHLIGHT")}
            </span>
          </p>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <a
              href="/calculator"
              className="btn-primary text-center flex items-center justify-center gap-2"
            >
              {t("HOME.CTA_PRIMARY")}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="/ai"
              className="btn-outline text-center flex items-center justify-center"
            >
              {t("HOME.CTA_SECONDARY")}
            </a>
          </div>

          <div className="relative w-full mt-16 md:mt-24">
            {/* Center "Phone" Card - Replaced with Mockup */}
            <div className="relative z-10 mx-auto max-w-[280px] sm:max-w-[320px]">
              <img
                src="/assets/mockup.png"
                alt="CookScale App Preview"
                className="w-full h-auto drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.15))" }}
              />
            </div>

            {/* Floating Top Left Card: Boiling */}
            <div
              className="absolute top-16 left-0 xl:-left-12 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-4deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Droplets size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("COOKING_METHODS.BOILING")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_BOILING_DESC")}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Top Right Card: Baking */}
            <div
              className="absolute top-12 right-0 xl:-right-16 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(6deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ThermometerSun size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("COOKING_METHODS.BAKING")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_BAKING_DESC")}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Bottom Left Card: Frying */}
            <div
              className="absolute bottom-16 -left-4 xl:-left-16 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(3deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Flame size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("COOKING_METHODS.FRYING")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_FRYING_DESC")}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Bottom Right Card: Calculator */}
            <div
              className="absolute bottom-12 -right-4 xl:-right-12 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-5deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Calculator size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("HOME.HERO_CARD_CALC_TITLE")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_CALC_DESC")}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Middle Left Card: AI */}
            <div
              className="absolute top-[40%] -left-8 xl:-left-24 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(4deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("HOME.HERO_CARD_AI_TITLE")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_AI_DESC")}
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Middle Right Card: Data */}
            <div
              className="absolute top-[50%] -right-8 xl:-right-20 hidden lg:flex flex-col gap-2 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-3deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left max-w-[140px]">
                  <p className="text-[13px] font-bold">
                    {t("HOME.HERO_CARD_DATA_TITLE")}
                  </p>
                  <p
                    className="text-[11px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_DATA_DESC")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-20">
        <div
          className="rounded-2xl md:rounded-2xl px-6 md:px-14 py-10 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          style={{ background: "var(--color-primary-light)" }}
        >
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 md:gap-6 text-left"
            >
              <Icon
                size={54}
                strokeWidth={1.5}
                className="shrink-0"
                style={{ color: "var(--color-primary)" }}
              />
              <div>
                <p className="font-serif text-[22px] md:text-[26px] leading-none">
                  {value}
                </p>
                <p
                  className="mt-1 md:mt-2 text-[13px] md:text-[14px]"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-20">
        <div className="max-w-2xl mb-10 md:mb-16">
          <h2>{t("HOME.HOW_IT_WORKS_TITLE")}</h2>
          <p
            className="mt-3 md:mt-4 text-[15px] md:text-[16px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("HOME.HOW_IT_WORKS_SUBTITLE")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col">
            {[
              {
                step: 1,
                title: t("HOME.STEP_1_TITLE"),
                desc: t("HOME.STEP_1_DESC"),
              },
              {
                step: 2,
                title: t("HOME.STEP_2_TITLE"),
                desc: t("HOME.STEP_2_DESC"),
              },
              {
                step: 3,
                title: t("HOME.STEP_3_TITLE"),
                desc: t("HOME.STEP_3_DESC"),
              },
            ].map(({ step, title, desc }, index, arr) => (
              <div
                key={step}
                className={`flex items-center gap-6 md:gap-8 py-6 md:py-8 ${
                  index !== arr.length - 1 ? "border-b" : ""
                } ${index === 0 ? "pt-0" : ""} ${
                  index === arr.length - 1 ? "pb-0" : ""
                }`}
                style={{ borderColor: "var(--color-primary-muted)" }}
              >
                <div
                  className="font-bold text-[56px] md:text-[72px] leading-none shrink-0 tracking-tighter opacity-20"
                  style={{ color: "var(--color-primary)" }}
                >
                  {String(step).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-[20px] md:text-[24px] font-bold">
                    {title}
                  </h3>
                  <p
                    className="mt-1 md:mt-2 text-[14px] md:text-[16px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <HomeCalculatorPreview />
        </div>
      </section>

      {/* Inline calculator */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-20">
        <div className="max-w-2xl">
          <h2>
            <em className="italic font-light">{t("HOME.INLINE_HEADING_EM")}</em>
            {t("HOME.INLINE_HEADING")}
          </h2>
          <p
            className="mt-3 md:mt-4 text-[15px] md:text-[16px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("HOME.INLINE_DESC")}
          </p>
        </div>
        <div className="mt-8 md:mt-10">
          <ProductCalculator />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-20">
        <div
          className="rounded-2xl md:rounded-2xl px-6 md:px-14 py-10 md:py-16 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
          style={{ background: "var(--color-primary-light)" }}
        >
          <div>
            <h2 className="max-w-2xl">
              {t("HOME.CTA_AI_HEADING")}{" "}
              <em className="italic font-light">
                {t("HOME.CTA_AI_HEADING_EM")}
              </em>
            </h2>
            <p
              className="mt-3 text-[15px] md:text-[16px] max-w-2xl"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("HOME.CTA_AI_DESC")}
            </p>
          </div>
          <a href="/ai" className="btn-dark w-full md:w-auto whitespace-nowrap">
            {t("HOME.CTA_AI_BUTTON")}
          </a>
        </div>
      </section>
    </main>
  );
}
