import { useTranslation } from "react-i18next";
import {
  Target,
  ShieldCheck,
  Droplets,
  Flame,
  ThermometerSun,
  Sparkles,
  Calculator,
  Scale,
  Leaf,
  Users,
  PieChart,
} from "lucide-react";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full">
      {/* Hero */}
      <section className="relative py-10 md:py-16 overflow-x-clip">
        {/* Radial Gradient */}
        <div
          className="absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 w-250 h-250 sm:w-375 sm:h-375 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, var(--color-primary-light) 0%, transparent 60%)",
            opacity: 1,
            zIndex: 0,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 flex flex-col items-center text-center">
          <h1 className="mt-2 md:mt-4 max-w-4xl tracking-tight">
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
            <div className="relative z-10 mx-auto max-w-70 sm:max-w-[320px]">
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

      {/* Solutions / Features */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-medium mb-6 shadow-sm"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <Target size={14} style={{ color: "var(--color-primary)" }} />
            <span>{t("HOME.SOLUTIONS_BADGE")}</span>
          </div>
          <h2 className="text-[32px] md:text-[42px] font-bold tracking-tight max-w-2xl leading-tight">
            {t("HOME.SOLUTIONS_TITLE")}
          </h2>
          <p
            className="mt-4 md:mt-6 text-[16px] md:text-[18px] max-w-2xl leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("HOME.SOLUTIONS_DESC")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 */}
          <div
            className="flex flex-col rounded-[2rem] overflow-hidden border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="h-56 relative flex items-center justify-center p-6 overflow-hidden"
              style={{ background: "var(--color-primary-muted)" }}
            >
              {/* Abstract composition for calculator */}
              <div
                className="absolute w-44 h-28 rounded-2xl shadow-lg border transform -rotate-6 flex flex-col gap-3 p-4"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div
                    className="w-1/2 h-2.5 rounded-full"
                    style={{
                      background: "var(--color-muted-foreground)",
                      opacity: 0.3,
                    }}
                  ></div>
                  <div
                    className="w-1/4 h-2.5 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                  ></div>
                </div>
                <div
                  className="w-full h-10 rounded-lg"
                  style={{ background: "var(--color-secondary)" }}
                ></div>
              </div>
              <div
                className="absolute w-44 h-28 rounded-2xl shadow-xl border transform rotate-6 flex flex-col gap-3 p-4 translate-y-12 translate-x-12"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div
                    className="w-1/2 h-2.5 rounded-full"
                    style={{
                      background: "var(--color-muted-foreground)",
                      opacity: 0.3,
                    }}
                  ></div>
                  <div
                    className="w-1/3 h-2.5 rounded-full"
                    style={{ background: "var(--color-foreground)" }}
                  ></div>
                </div>
                <div
                  className="w-full h-8 rounded-lg"
                  style={{ background: "var(--color-primary-light)" }}
                ></div>
              </div>
            </div>
            <div className="p-8 pt-8 flex-1 flex flex-col">
              <h3 className="text-[20px] md:text-[22px] font-bold mb-3">
                {t("HOME.SOLUTION_1_TITLE")}
              </h3>
              <p
                className="text-[15px] leading-relaxed flex-1"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {t("HOME.SOLUTION_1_DESC")}
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="flex flex-col rounded-[2rem] overflow-hidden border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="h-56 relative flex items-center justify-center p-6 overflow-hidden"
              style={{ background: "var(--color-secondary)" }}
            >
              {/* Abstract composition for AI */}
              <div
                className="absolute w-56 h-20 rounded-2xl shadow-lg border flex items-center gap-4 p-4 transform -translate-y-6 -translate-x-4"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--color-primary-light)" }}
                >
                  <Sparkles
                    style={{ color: "var(--color-primary)" }}
                    size={20}
                  />
                </div>
                <div className="flex-1 space-y-2.5">
                  <div
                    className="h-2.5 rounded-full w-full"
                    style={{
                      background: "var(--color-muted-foreground)",
                      opacity: 0.2,
                    }}
                  ></div>
                  <div
                    className="h-2.5 rounded-full w-4/5"
                    style={{
                      background: "var(--color-muted-foreground)",
                      opacity: 0.2,
                    }}
                  ></div>
                </div>
              </div>
              <div
                className="absolute w-48 h-14 rounded-2xl shadow-lg border flex items-center gap-3 p-3 transform translate-y-10 translate-x-10"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  opacity: 0.9,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 border-2"
                  style={{
                    background: "var(--color-secondary)",
                    borderColor: "var(--color-primary)",
                  }}
                ></div>
                <div
                  className="h-2.5 rounded-full w-full"
                  style={{
                    background: "var(--color-foreground)",
                    opacity: 0.8,
                  }}
                ></div>
              </div>
            </div>
            <div className="p-8 pt-8 flex-1 flex flex-col">
              <h3 className="text-[20px] md:text-[22px] font-bold mb-3">
                {t("HOME.SOLUTION_2_TITLE")}
              </h3>
              <p
                className="text-[15px] leading-relaxed flex-1"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {t("HOME.SOLUTION_2_DESC")}
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="flex flex-col rounded-[2rem] overflow-hidden border"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="h-56 relative flex items-center justify-center p-6 overflow-hidden"
              style={{ background: "var(--color-primary-light)" }}
            >
              {/* Abstract composition for Chart/Data */}
              <div
                className="relative w-36 h-36 rounded-full border-[12px] flex items-center justify-center shadow-sm"
                style={{ borderColor: "var(--color-background)" }}
              >
                <div
                  className="absolute w-full h-full rounded-full border-[12px] border-t-transparent border-r-transparent transform -rotate-12"
                  style={{ borderColor: "var(--color-primary)" }}
                ></div>
                <div className="flex flex-col items-center">
                  <ShieldCheck
                    size={28}
                    style={{ color: "var(--color-primary)" }}
                    className="mb-1"
                  />
                  <div className="text-[15px] font-bold tracking-tight">
                    USDA
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 pt-8 flex-1 flex flex-col">
              <h3 className="text-[20px] md:text-[22px] font-bold mb-3">
                {t("HOME.SOLUTION_3_TITLE")}
              </h3>
              <p
                className="text-[15px] leading-relaxed flex-1"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {t("HOME.SOLUTION_3_DESC")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Powered Section */}
      <section className="w-full relative overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex flex-col items-center text-center mb-12 md:mb-20 relative z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[13px] font-medium mb-6 shadow-sm"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
              <span>{t("HOME.AI_SECTION_BADGE")}</span>
            </div>
            <h2 className="text-[32px] md:text-[46px] font-bold tracking-tight max-w-3xl leading-tight text-foreground">
              {t("HOME.AI_SECTION_TITLE")}
            </h2>
            <p
              className="mt-4 md:mt-6 text-[16px] md:text-[18px] max-w-2xl leading-relaxed"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("HOME.AI_SECTION_DESC")}
            </p>
          </div>

          <div className="relative w-full">
            {/* Background Concentric Circles / Lines */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] xl:w-[700px] xl:h-[700px] rounded-full border opacity-20 hidden lg:block pointer-events-none"
              style={{ borderColor: "var(--color-primary)" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] xl:w-[950px] xl:h-[950px] rounded-full border border-dashed opacity-10 hidden lg:block pointer-events-none"
              style={{ borderColor: "var(--color-primary)" }}
            ></div>

            <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center relative z-10 w-full">
              {/* Left Col */}
              <div className="flex flex-col gap-6 w-full lg:max-w-[400px] mx-auto lg:ms-auto">
                <div
                  className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <Scale
                        style={{ color: "var(--color-primary)" }}
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[18px] mb-2">
                        {t("HOME.AI_CARD_1_TITLE")}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {t("HOME.AI_CARD_1_DESC")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="inline-flex self-start sm:ml-16 px-3 py-1 mt-1 text-[12px] font-semibold rounded-full"
                    style={{
                      background: "var(--color-primary-muted)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {t("HOME.AI_CARD_1_BADGE")}
                  </div>
                </div>

                <div
                  className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <Leaf
                        style={{ color: "var(--color-primary)" }}
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[18px] mb-2">
                        {t("HOME.AI_CARD_2_TITLE")}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {t("HOME.AI_CARD_2_DESC")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="inline-flex self-start sm:ml-16 px-3 py-1 mt-1 text-[12px] font-semibold rounded-full"
                    style={{
                      background: "var(--color-primary-muted)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {t("HOME.AI_CARD_2_BADGE")}
                  </div>
                </div>
              </div>

              {/* Center Phone */}
              <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:my-0 my-10 z-20">
                <img
                  src="/assets/mockup.png"
                  alt="AI Przeliczenia Preview"
                  className="w-full h-auto drop-shadow-2xl relative z-10"
                  style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.3))" }}
                />
              </div>

              {/* Right Col */}
              <div className="flex flex-col gap-6 w-full lg:max-w-[400px] mx-auto lg:mr-auto">
                <div
                  className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <Users
                        style={{ color: "var(--color-primary)" }}
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[18px] mb-2">
                        {t("HOME.AI_CARD_3_TITLE")}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {t("HOME.AI_CARD_3_DESC")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="inline-flex self-start sm:ml-16 px-3 py-1 mt-1 text-[12px] font-semibold rounded-full"
                    style={{
                      background: "var(--color-primary-muted)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {t("HOME.AI_CARD_3_BADGE")}
                  </div>
                </div>

                <div
                  className="rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm border"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--color-primary-light)" }}
                    >
                      <PieChart
                        style={{ color: "var(--color-primary)" }}
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-[18px] mb-2">
                        {t("HOME.AI_CARD_4_TITLE")}
                      </h3>
                      <p
                        className="text-[14px] leading-relaxed"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {t("HOME.AI_CARD_4_DESC")}
                      </p>
                    </div>
                  </div>
                  <div
                    className="inline-flex self-start sm:ml-16 px-3 py-1 mt-1 text-[12px] font-semibold rounded-full"
                    style={{
                      background: "var(--color-primary-muted)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {t("HOME.AI_CARD_4_BADGE")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
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
