import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
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
  Zap,
  Search,
  ScanLine,
  CheckCircle,
  Heart,
  ArrowRight,
} from "lucide-react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  FloatingElement,
  HeroFloatingCard,
} from "../../../animations/motion";

export const AiPoweredSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="w-full relative overflow-hidden py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <FadeIn delay={0.1}>
            <div className="flex flex-col items-center text-center mb-12 md:mb-20 relative z-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: "var(--color-primary-muted)",
                  border: "1px solid var(--color-primary-light)",
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
          </FadeIn>

          <div className="relative w-full">
            {/* Background Concentric Circles / Lines */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] xl:w-[700px] xl:h-[700px] rounded-full border opacity-20 hidden lg:block pointer-events-none motion-safe:animate-[spin_40s_linear_infinite]"
              style={{ borderColor: "var(--color-primary)" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] xl:w-[950px] xl:h-[950px] rounded-full border border-dashed opacity-10 hidden lg:block pointer-events-none motion-safe:animate-[spin_60s_linear_infinite_reverse]"
              style={{ borderColor: "var(--color-primary)" }}
            ></div>

            <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center relative z-10 w-full">
              {/* Left Col */}
              <StaggerContainer
                staggerDelay={0.2}
                className="flex flex-col gap-6 w-full lg:max-w-[400px] mx-auto lg:ms-auto"
              >
                <StaggerItem direction="left">
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
                </StaggerItem>

                <StaggerItem direction="left">
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
                        <Zap
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
                </StaggerItem>
              </StaggerContainer>

              {/* Center Phone */}
              <FadeIn delay={0.3} direction="up">
                <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:my-0 my-10 z-20">
                  <img
                    src="/assets/mockup.png"
                    alt="AI Przeliczenia Preview"
                    className="w-full h-auto drop-shadow-2xl relative z-10"
                    style={{
                      filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.3))",
                    }}
                  />
                </div>
              </FadeIn>

              {/* Right Col */}
              <StaggerContainer
                staggerDelay={0.2}
                className="flex flex-col gap-6 w-full lg:max-w-[400px] mx-auto lg:mr-auto"
              >
                <StaggerItem direction="right">
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
                        <Search
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
                </StaggerItem>

                <StaggerItem direction="right">
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
                        <ScanLine
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
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
