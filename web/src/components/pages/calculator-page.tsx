import { useTranslation } from "react-i18next";
import { ProductCalculator } from "@/components/product-calculator";

export function CalculatorPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-16">
      <div className="max-w-2xl">
        <p
          className="text-[13px] uppercase tracking-widest"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("PAGES.CALCULATOR_TITLE")}
        </p>
        <h1 className="mt-2 md:mt-3">{t("PAGES.CALCULATOR_HEADING")}</h1>
        <p
          className="mt-3 md:mt-4 text-[15px] md:text-[16px]"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("PAGES.CALCULATOR_DESC")}
        </p>
      </div>
      <div className="mt-8 md:mt-10">
        <ProductCalculator />
      </div>
    </main>
  );
}
