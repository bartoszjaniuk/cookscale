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

export const CtaSection = () => {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
};
