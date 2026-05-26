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

export const SolutionsSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-16">
        <FadeIn delay={0.1}>
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
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 */}
          <StaggerItem direction="up">
            <div
              className="flex flex-col rounded-[2rem] overflow-hidden border h-full group hover:-translate-y-2 transition-transform duration-300"
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
          </StaggerItem>

          {/* Card 2 */}
          <StaggerItem direction="up">
            <div
              className="flex flex-col rounded-[2rem] overflow-hidden border h-full group hover:-translate-y-2 transition-transform duration-300"
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
          </StaggerItem>

          {/* Card 3 */}
          <StaggerItem direction="up">
            <div
              className="flex flex-col rounded-[2rem] overflow-hidden border h-full group hover:-translate-y-2 transition-transform duration-300"
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
          </StaggerItem>
        </StaggerContainer>
      </section>
    </>
  );
};
