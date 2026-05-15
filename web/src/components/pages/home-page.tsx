import { useTranslation } from "react-i18next";
import { Zap, Target, ShieldCheck } from "lucide-react";
import { ProductCalculator } from "@/components/product-calculator";

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
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-24 pb-12 md:pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <span
              className="inline-flex items-center gap-2 text-[13px] px-3 py-1 rounded-full"
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              {t("HOME.BADGE")}
            </span>
            <h1 className="mt-5 md:mt-6">
              {t("HOME.TITLE")}{" "}
              <em className="italic font-light">{t("HOME.TITLE_EM")}</em>
            </h1>
            <p
              className="mt-4 md:mt-6 max-w-xl text-[16px] md:text-[17px]"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("HOME.DESCRIPTION")}
              <span style={{ color: "var(--color-primary)" }}>
                {t("HOME.DESCRIPTION_HIGHLIGHT")}
              </span>
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
              <a href="/calculator" className="btn-primary text-center">
                {t("HOME.CTA_PRIMARY")}
              </a>
              <a href="/ai" className="btn-outline text-center">
                {t("HOME.CTA_SECONDARY")}
              </a>
            </div>
            <ul className="mt-8 md:mt-10 space-y-3 text-[15px]">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 shrink-0"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="9"
                      fill="var(--color-primary-light)"
                    />
                    <path
                      d="M5 9l3 3 5-5"
                      stroke="var(--color-primary)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-soft p-5 md:p-8">
            <p
              className="text-[12px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("HOME.QUICK_PREVIEW")}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="font-serif text-[22px] md:text-[26px]">
                {t("HOME.PREVIEW_PRODUCT")}
              </h3>
              <span
                className="text-[12px] px-3 py-1 rounded-full shrink-0 ml-2"
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                }}
              >
                {t("COOKING_METHODS.BAKING")}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4 md:p-5"
                style={{ background: "var(--color-primary-muted)" }}
              >
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {t("HOME.PREVIEW_RAW")}
                </p>
                <p className="font-serif text-[24px] md:text-[28px] mt-2">
                  200 g
                </p>
              </div>
              <div
                className="rounded-2xl p-4 md:p-5"
                style={{ background: "var(--color-primary-light)" }}
              >
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {t("HOME.PREVIEW_AFTER_BAKING")}
                </p>
                <p
                  className="font-serif text-[24px] md:text-[28px] mt-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  150 g
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3 text-center">
              {macros.map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-xl py-3"
                  style={{ background: "var(--color-secondary)" }}
                >
                  <p className="font-serif text-[18px] md:text-[20px]">{v}</p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {l}
                  </p>
                </div>
              ))}
            </div>
            <a href="/calculator" className="btn-dark w-full mt-6 md:mt-8">
              {t("HOME.CALC_YOURS")}
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-12 md:pb-20">
        <div
          className="rounded-2xl md:rounded-3xl px-6 md:px-14 py-10 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
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

          <div className="card-soft p-5 md:p-8">
            <p
              className="text-[12px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("HOME.QUICK_PREVIEW")}
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <h3 className="font-serif text-[22px] md:text-[26px]">
                {t("HOME.PREVIEW_PRODUCT")}
              </h3>
              <span
                className="text-[12px] px-3 py-1 rounded-full shrink-0 ml-2"
                style={{
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                }}
              >
                {t("COOKING_METHODS.BAKING")}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-4 md:p-5"
                style={{ background: "var(--color-primary-muted)" }}
              >
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {t("HOME.PREVIEW_RAW")}
                </p>
                <p className="font-serif text-[24px] md:text-[28px] mt-2">
                  200 g
                </p>
              </div>
              <div
                className="rounded-2xl p-4 md:p-5"
                style={{ background: "var(--color-primary-light)" }}
              >
                <p
                  className="text-[11px] uppercase tracking-widest"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {t("HOME.PREVIEW_AFTER_BAKING")}
                </p>
                <p
                  className="font-serif text-[24px] md:text-[28px] mt-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  150 g
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3 text-center">
              {macros.map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-xl py-3"
                  style={{ background: "var(--color-secondary)" }}
                >
                  <p className="font-serif text-[18px] md:text-[20px]">{v}</p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {l}
                  </p>
                </div>
              ))}
            </div>
            <a href="/calculator" className="btn-dark w-full mt-6 md:mt-8">
              {t("HOME.CALC_YOURS")}
            </a>
          </div>
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
          className="rounded-2xl md:rounded-3xl px-6 md:px-14 py-10 md:py-16 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
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
