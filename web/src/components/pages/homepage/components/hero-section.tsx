import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Droplets,
  Flame,
  ThermometerSun,
  Sparkles,
  Calculator,
} from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const mockupVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.4 },
  },
};

const microcardEnterVariants = (delay: number, startX: number): Variants => ({
  hidden: { opacity: 0, scale: 0.8, x: startX },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  },
});

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="relative py-10 md:py-16 overflow-x-clip">
        {/* Radial Gradient */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-none top-0 left-1/2 -translate-x-1/2 w-250 h-250 sm:w-375 sm:h-375 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, var(--color-primary-light) 0%, transparent 60%)",
            zIndex: 0,
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 flex flex-col items-center text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="mt-2 md:mt-4 max-w-4xl tracking-tight"
          >
            {t("HOME.TITLE")}{" "}
            <em className="italic font-light">{t("HOME.TITLE_EM")}</em>
          </motion.h1>

          <motion.p
            variants={itemVariants}
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
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
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
          </motion.div>

          <div className="relative w-full mt-16 md:mt-24">
            {/* Center "Phone" Card - Replaced with Mockup */}
            <motion.div
              variants={mockupVariants}
              className="relative z-10 mx-auto max-w-70 sm:max-w-[320px]"
            >
              <img
                src="/assets/mockup.png"
                alt="CookScale App Preview"
                className="w-full h-auto drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.15))" }}
              />
            </motion.div>

            {/* Floating Top Left Card: Boiling */}
            <motion.div
              variants={microcardEnterVariants(0.5, -30)}
              className="absolute top-16 left-0 xl:-left-12 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(8deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Droplets size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium">
                    {t("COOKING_METHODS.BOILING")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_BOILING_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Top Right Card: Baking */}
            <motion.div
              variants={microcardEnterVariants(0.6, 30)}
              className="absolute top-12 right-0 xl:-right-16 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-8deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ThermometerSun size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium">
                    {t("COOKING_METHODS.BAKING")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_BAKING_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Bottom Left Card: Frying */}
            <motion.div
              variants={microcardEnterVariants(0.7, -30)}
              className="absolute bottom-16 -left-4 xl:-left-16 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(3deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Flame size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium  ">
                    {t("COOKING_METHODS.FRYING")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.METHOD_FRYING_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Bottom Right Card: Calculator */}
            <motion.div
              variants={microcardEnterVariants(0.8, 30)}
              className="absolute bottom-12 -right-4 xl:-right-12 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-5deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Calculator size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium">
                    {t("HOME.HERO_CARD_CALC_TITLE")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_CALC_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Middle Left Card: AI */}
            <motion.div
              variants={microcardEnterVariants(0.55, -40)}
              className="absolute top-[40%] -left-8 xl:-left-24 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(4deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <Sparkles size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium">
                    {t("HOME.HERO_CARD_AI_TITLE")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_AI_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Middle Right Card: Data */}
            <motion.div
              variants={microcardEnterVariants(0.65, 40)}
              className="absolute top-[40%] -right-8 xl:-right-20 hidden lg:flex flex-col justify-center gap-2 min-h-30 rounded-2xl p-4 shadow-lg border z-0"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-card)",
                transform: "rotate(-3deg)",
                opacity: 0.95,
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  <ShieldCheck size={26} />
                </div>
                <div className="text-left w-50">
                  <p className="text-lg font-serif font-medium">
                    {t("HOME.HERO_CARD_DATA_TITLE")}
                  </p>
                  <p
                    className="text-[13px] leading-snug mt-0.5"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {t("HOME.HERO_CARD_DATA_DESC")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
};
