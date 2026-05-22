import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CalculatorSummaryCard,
  computeProductResults,
} from "@/components/product-calculator";
import { useAllProductsQuery } from "@/api/products/hooks/useAllProductsQuery";
import { AppProviders } from "@/providers/AppProviders";
import { findDefaultProduct } from "@/api/products/products";

const PREVIEW_GRAMS = "100";
const PREVIEW_METHOD = "boiling";

export function HomeCalculatorPreview() {
  return (
    <AppProviders>
      <HomeCalculatorPreviewInner />
    </AppProviders>
  );
}

function HomeCalculatorPreviewInner() {
  const { t, i18n } = useTranslation();
  const { data: products = [], isLoading } = useAllProductsQuery();

  const potato = useMemo(() => findDefaultProduct(products), [products]);

  const cookingMethodSlug = useMemo(() => {
    if (!potato) return "";
    const hasBoiling = potato.product_cooking_factors.some(
      (f) => f.cooking_methods.slug === PREVIEW_METHOD,
    );
    if (hasBoiling) return PREVIEW_METHOD;
    return potato.product_cooking_factors[0]?.cooking_methods.slug ?? "";
  }, [potato]);

  const results = useMemo(
    () =>
      computeProductResults(
        potato ?? null,
        cookingMethodSlug,
        PREVIEW_GRAMS,
        false,
      ),
    [potato, cookingMethodSlug],
  );

  if (isLoading || !potato) {
    return (
      <div
        className="card-soft min-h-[360px] p-6 md:p-8 animate-pulse"
        aria-busy="true"
        aria-label={t("HOME.QUICK_PREVIEW")}
      />
    );
  }

  return (
    <div>
      <p
        className="text-[12px] uppercase tracking-widest mb-4"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("HOME.QUICK_PREVIEW")}
      </p>
      <CalculatorSummaryCard
        t={t}
        i18nLanguage={i18n.language}
        selectedProduct={potato}
        cookingMethodSlug={cookingMethodSlug}
        reverse={false}
        results={results}
        showAccentCircle={false}
        showFooter={false}
        showPer100g={false}
        showMassChangeInfo={false}
      />
      <a href="/calculator" className="btn-dark w-full mt-6 md:mt-8">
        {t("HOME.CALC_YOURS")}
      </a>
    </div>
  );
}
