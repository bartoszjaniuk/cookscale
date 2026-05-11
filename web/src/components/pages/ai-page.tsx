import { useTranslation } from "react-i18next";
import { AiCalculator } from "@/components/ai-calculator";

export function AiPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-16">
      <div className="flex items-center gap-3">
        <span
          className="text-[13px] uppercase tracking-widest"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("PAGES.AI_TITLE")}
        </span>
        <span
          className="text-[12px] px-3 py-1 rounded-full"
          style={{ background: "var(--color-announcement)" }}
        >
          {t("PAGES.AI_BADGE")}
        </span>
      </div>
      <h1 className="mt-2 md:mt-3">
        {t("PAGES.AI_HEADING")}{" "}
        <em className="italic font-light">{t("PAGES.AI_HEADING_EM")}</em>
      </h1>
      <p
        className="mt-3 md:mt-4 text-[15px] md:text-[16px] max-w-2xl"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("PAGES.AI_DESC")}
      </p>
      <AiCalculator />
    </main>
  );
}
