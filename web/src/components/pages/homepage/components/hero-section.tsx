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

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
};
