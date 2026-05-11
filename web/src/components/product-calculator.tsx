import { type ProductWithFactors } from "@/api/products/products";
import { useInitialProductsQuery } from "@/api/products/hooks/useInitialProductsQuery";
import { useProductsSearchQuery } from "@/api/products/hooks/useProductsSearchQuery";
import { AppProviders } from "@/providers/AppProviders";
import { r1 } from "@/lib/cookscale-data";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const METHOD_LABEL_KEYS: Record<string, string> = {
  boiling: "COOKING_METHODS.BOILING",
  frying: "COOKING_METHODS.FRYING",
  baking: "COOKING_METHODS.BAKING",
};

type Macros = { kcal: number; protein: number; fat: number; carbs: number };

export function ProductCalculator() {
  return (
    <AppProviders>
      <ProductCalculatorInner />
    </AppProviders>
  );
}

function ProductCalculatorInner() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithFactors | null>(null);
  const [cookingMethodSlug, setCookingMethodSlug] = useState("");
  const [grams, setGrams] = useState("100");
  const [reverse, setReverse] = useState(false);

  const { data: initialProducts = [] } = useInitialProductsQuery();
  const { data: searchResults = [], isFetching: isSearching } =
    useProductsSearchQuery(debouncedQuery);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelectProduct = (p: ProductWithFactors) => {
    setSelectedProduct(p);
    const availableSlugs = p.product_cooking_factors.map(
      (f) => f.cooking_methods.slug,
    );
    if (!availableSlugs.includes(cookingMethodSlug)) {
      setCookingMethodSlug(availableSlugs[0] ?? "");
    }
  };

  const displayedProducts =
    debouncedQuery.length >= 2 ? searchResults : initialProducts;

  const availableMethods = selectedProduct
    ? selectedProduct.product_cooking_factors.map((f) => ({
        id: f.cooking_method_id,
        slug: f.cooking_methods.slug,
      }))
    : [];

  const results = useMemo(
    () => compute(selectedProduct, cookingMethodSlug, grams, reverse),
    [selectedProduct, cookingMethodSlug, grams, reverse],
  );

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12">
      {/* Inputs */}
      <div>
        <label
          className="block text-[14px] mb-2"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("CALCULATOR.SEARCH_LABEL")}
        </label>
        <input
          className="input-search"
          placeholder={t("CALCULATOR.SEARCH_PLACEHOLDER")}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2 max-h-36 md:max-h-44 overflow-y-auto pr-1">
          {isSearching ? (
            <p
              className="text-[14px] py-2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.SEARCHING")}
            </p>
          ) : displayedProducts.length === 0 && debouncedQuery.length >= 2 ? (
            <p
              className="text-[14px] py-2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.NO_RESULTS")}
            </p>
          ) : (
            displayedProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                data-active={selectedProduct?.id === p.id}
                className="pill-tab"
              >
                {p.name}
              </button>
            ))
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <label
              className="text-[14px]"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.METHOD_LABEL")}
            </label>
            <button
              onClick={() => setReverse((v) => !v)}
              className="text-[13px] underline-offset-4 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {reverse
                ? t("CALCULATOR.STANDARD_MODE_LABEL")
                : t("CALCULATOR.REVERSE_MODE_LABEL")}
            </button>
          </div>
          <div className="inline-flex w-full sm:w-auto p-1 rounded-full border border-(--color-border) bg-white">
            {availableMethods.length === 0 ? (
              <span
                className="text-[13px] px-4 py-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {t("CALCULATOR.SELECT_PRODUCT")}
              </span>
            ) : (
              availableMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCookingMethodSlug(m.slug)}
                  data-active={cookingMethodSlug === m.slug}
                  className="pill-tab pill-tab-green bg-transparent!"
                >
                  {t(
                    (METHOD_LABEL_KEYS[m.slug] as any) ??
                      `COOKING_METHODS.${m.slug.toUpperCase()}`,
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-10">
          <label
            className="block text-[14px] mb-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {reverse
              ? t("CALCULATOR.COOKED_WEIGHT")
              : t("CALCULATOR.RAW_WEIGHT")}
          </label>
          <input
            type="number"
            min="1"
            inputMode="decimal"
            className="input-underline text-[28px] font-serif"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
          {results.error && (
            <p
              className="mt-2 text-[13px]"
              style={{ color: "var(--color-destructive)" }}
            >
              {t(results.error as any)}
            </p>
          )}
        </div>
      </div>

      {/* Result panel */}
      <div className="card-soft p-7 md:p-9 self-start">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[13px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.RESULT_TITLE")}
            </p>
            <h3 className="font-serif text-[28px] mt-1">
              {selectedProduct?.name ?? "—"}
            </h3>
          </div>
          {cookingMethodSlug && (
            <span
              className="text-[12px] px-3 py-1 rounded-full"
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              {t(
                (METHOD_LABEL_KEYS[cookingMethodSlug] as any) ??
                  `COOKING_METHODS.${cookingMethodSlug.toUpperCase()}`,
              )}
            </span>
          )}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <Tile
            label={t("RESULTS.RAW_WEIGHT")}
            value={`${r1(results.inputGrams)} g`}
            big
            highlight={reverse}
          />
          <Tile
            label={t("RESULTS.COOKED_WEIGHT")}
            value={`${r1(results.outputGrams)} g`}
            big
            highlight={!reverse}
          />
        </div>

        <div className="mt-6 flex flex-col gap-0">
          <p
            className="text-[13px] mb-3"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("RESULTS.PER_PORTION")} ({r1(results.inputGrams)}g{" "}
            {t("RESULTS.RAW_WEIGHT")})
          </p>
          <MacroRow
            label={t("RESULTS.CALORIES")}
            unit="kcal"
            value={results.portion.kcal}
          />
          <MacroRow
            label={t("RESULTS.PROTEIN")}
            unit="g"
            value={results.portion.protein}
          />
          <MacroRow
            label={t("RESULTS.FAT")}
            unit="g"
            value={results.portion.fat}
          />
          <MacroRow
            label={t("RESULTS.CARBS")}
            unit="g"
            value={results.portion.carbs}
          />
        </div>

        <button className="btn-primary w-full mt-8">
          {t("RESULTS.SAVE_TO_HISTORY")}
        </button>
        <p
          className="text-[12px] mt-3 text-center"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("CALCULATOR.ANONYMOUS_MODE")}
        </p>
      </div>
    </div>
  );
}

const Tile = ({
  label,
  value,
  big,
  highlight,
}: {
  label: string;
  value: string;
  big?: boolean;
  highlight?: boolean;
}) => {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: highlight
          ? "var(--color-primary-light)"
          : "var(--color-primary-muted)",
      }}
    >
      <p
        className="text-[12px] uppercase tracking-widest"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </p>
      <p
        className={`font-serif mt-2 ${big ? "text-[32px]" : "text-[22px]"}`}
        style={{
          color: highlight ? "var(--color-primary)" : "var(--color-foreground)",
        }}
      >
        {value}
      </p>
    </div>
  );
};

const MacroRow = ({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: number;
}) => {
  return (
    <div className="flex items-baseline justify-between border-b border-(--color-border) py-2">
      <span
        className="text-[14px]"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <span className="text-[15px] font-medium">
        {r1(value)} {unit}
      </span>
    </div>
  );
};

const compute = (
  product: ProductWithFactors | null,
  methodSlug: string,
  gramsStr: string,
  reverse: boolean,
) => {
  const g = Number(gramsStr);
  if (!product) return blank("CALCULATOR.SELECT_PRODUCT");
  if (!Number.isFinite(g) || g <= 0) return blank("ERRORS.INVALID_WEIGHT");

  const factor = product.product_cooking_factors.find(
    (f) => f.cooking_methods.slug === methodSlug,
  );
  if (!factor) return blank("CALCULATOR.METHOD_UNAVAILABLE");

  const yieldF = factor.yield_factor;
  const rawGrams = reverse ? g / yieldF : g;
  const cookedGrams = reverse ? g : g * yieldF;
  const per100: Macros = {
    kcal: product.calories_kcal ?? 0,
    protein: product.protein_g ?? 0,
    fat: product.fat_g ?? 0,
    carbs: product.carbs_g ?? 0,
  };
  const k = rawGrams / 100;
  const portion: Macros = {
    kcal: per100.kcal * k,
    protein: per100.protein * k,
    fat: per100.fat * k,
    carbs: per100.carbs * k,
  };
  return {
    error: null as string | null,
    inputGrams: rawGrams,
    outputGrams: cookedGrams,
    per100,
    portion,
  };
};

const blank = (error: string) => ({
  error,
  inputGrams: 0,
  outputGrams: 0,
  per100: { kcal: 0, protein: 0, fat: 0, carbs: 0 } as Macros,
  portion: { kcal: 0, protein: 0, fat: 0, carbs: 0 } as Macros,
});
