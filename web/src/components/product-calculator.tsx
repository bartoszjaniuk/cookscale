import {
  findDefaultProduct,
  type ProductWithFactors,
} from "@/api/products/products";
import { useAllProductsQuery } from "@/api/products/hooks/useAllProductsQuery";
import { useProductSearch } from "@/api/products/hooks/useProductSearch";
import { AppProviders } from "@/providers/AppProviders";
import { r1 } from "@/lib/cookscale-data";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getLocaleName } from "@/lib/utils";
import { TranslationKey } from "./ai-calculator";

const METHOD_LABEL_KEYS: Record<string, TranslationKey> = {
  boiling: "COOKING_METHODS.BOILING",
  frying: "COOKING_METHODS.FRYING",
  baking: "COOKING_METHODS.BAKING",
};

const COOKED_STATE_LABEL_KEYS: Record<string, TranslationKey> = {
  boiling: "RESULTS.STATE_BOILED",
  frying: "RESULTS.STATE_FRIED",
  baking: "RESULTS.STATE_BAKED",
};

type Macros = { kcal: number; protein: number; fat: number; carbs: number };

type ProductCalculatorProps = {
  variant?: "default" | "steps";
};

export function ProductCalculator({
  variant = "default",
}: ProductCalculatorProps) {
  return (
    <AppProviders>
      <ProductCalculatorInner variant={variant} />
    </AppProviders>
  );
}

function ProductCalculatorInner({ variant }: { variant: "default" | "steps" }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithFactors | null>(null);
  const [cookingMethodSlug, setCookingMethodSlug] = useState("");
  const [grams, setGrams] = useState("100");
  const [reverse, setReverse] = useState(false);

  const { products: displayedProducts, isLoading } = useProductSearch(query);
  const { data: allProducts = [], isLoading: allProductsLoading } =
    useAllProductsQuery();

  useEffect(() => {
    if (selectedProduct !== null || allProductsLoading) return;

    const defaultProduct = findDefaultProduct(allProducts);
    if (!defaultProduct) return;

    setSelectedProduct(defaultProduct);
    const availableSlugs = defaultProduct.product_cooking_factors.map(
      (f) => f.cooking_methods.slug,
    );
    setCookingMethodSlug((current) =>
      availableSlugs.includes(current) ? current : (availableSlugs[0] ?? ""),
    );
  }, [allProducts, allProductsLoading, selectedProduct]);

  const handleSelectProduct = (p: ProductWithFactors) => {
    setSelectedProduct(p);
    const availableSlugs = p.product_cooking_factors.map(
      (f) => f.cooking_methods.slug,
    );
    if (!availableSlugs.includes(cookingMethodSlug)) {
      setCookingMethodSlug(availableSlugs[0] ?? "");
    }
  };

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

  const step2Enabled = !!selectedProduct;
  const step3Enabled =
    !!selectedProduct && availableMethods.length > 0 && !!cookingMethodSlug;

  const inputs =
    variant === "steps" ? (
      <StepsInputs
        t={t}
        i18nLanguage={i18n.language}
        query={query}
        setQuery={setQuery}
        displayedProducts={displayedProducts}
        isLoading={isLoading}
        selectedProduct={selectedProduct}
        handleSelectProduct={handleSelectProduct}
        availableMethods={availableMethods}
        cookingMethodSlug={cookingMethodSlug}
        setCookingMethodSlug={setCookingMethodSlug}
        grams={grams}
        setGrams={setGrams}
        reverse={reverse}
        setReverse={setReverse}
        resultsError={results.error}
        step2Enabled={step2Enabled}
        step3Enabled={step3Enabled}
      />
    ) : (
      <DefaultInputs
        t={t}
        i18nLanguage={i18n.language}
        query={query}
        setQuery={setQuery}
        displayedProducts={displayedProducts}
        isLoading={isLoading}
        selectedProduct={selectedProduct}
        handleSelectProduct={handleSelectProduct}
        availableMethods={availableMethods}
        cookingMethodSlug={cookingMethodSlug}
        setCookingMethodSlug={setCookingMethodSlug}
        grams={grams}
        setGrams={setGrams}
        reverse={reverse}
        resultsError={results.error}
      />
    );

  return (
    <div className="grid w-full min-w-0 grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12 lg:overflow-visible">
      {inputs}
      <ResultsPanel
        t={t}
        i18nLanguage={i18n.language}
        selectedProduct={selectedProduct}
        cookingMethodSlug={cookingMethodSlug}
        reverse={reverse}
        setReverse={setReverse}
        results={results}
        variant={variant}
      />
    </div>
  );
}

type InputsProps = {
  t: TFunction;
  i18nLanguage: string;
  query: string;
  setQuery: (v: string) => void;
  displayedProducts: ProductWithFactors[];
  isLoading: boolean;
  selectedProduct: ProductWithFactors | null;
  handleSelectProduct: (p: ProductWithFactors) => void;
  availableMethods: { id: string; slug: string }[];
  cookingMethodSlug: string;
  setCookingMethodSlug: (slug: string) => void;
  grams: string;
  setGrams: (v: string) => void;
  reverse?: boolean;
  resultsError: string | null;
};

function DefaultInputs({
  t,
  i18nLanguage,
  query,
  setQuery,
  displayedProducts,
  isLoading,
  selectedProduct,
  handleSelectProduct,
  availableMethods,
  cookingMethodSlug,
  setCookingMethodSlug,
  grams,
  setGrams,
  reverse,
  resultsError,
}: InputsProps) {
  return (
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
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <ProductPills
          t={t}
          i18nLanguage={i18nLanguage}
          displayedProducts={displayedProducts}
          isLoading={isLoading}
          query={query}
          selectedProduct={selectedProduct}
          onSelect={handleSelectProduct}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <label
            className="text-[14px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("CALCULATOR.METHOD_LABEL")}
          </label>
        </div>
        <MethodPicker
          t={t}
          selectedProduct={selectedProduct}
          availableMethods={availableMethods}
          cookingMethodSlug={cookingMethodSlug}
          onSelectMethod={setCookingMethodSlug}
        />
      </div>

      <div className="mt-10">
        <label
          className="block text-[14px] mb-1"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {reverse ? t("CALCULATOR.COOKED_WEIGHT") : t("CALCULATOR.RAW_WEIGHT")}
        </label>
        <input
          type="number"
          min="1"
          inputMode="decimal"
          className="input-underline text-[28px] font-serif"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />
        <WeightError t={t} error={resultsError} />
      </div>
    </div>
  );
}

type StepsInputsProps = InputsProps & {
  reverse: boolean;
  setReverse: (fn: (v: boolean) => boolean) => void;
  step2Enabled: boolean;
  step3Enabled: boolean;
};

function StepsInputs({
  t,
  i18nLanguage,
  query,
  setQuery,
  displayedProducts,
  isLoading,
  selectedProduct,
  handleSelectProduct,
  availableMethods,
  cookingMethodSlug,
  setCookingMethodSlug,
  grams,
  setGrams,
  reverse,
  setReverse,
  resultsError,
  step2Enabled,
  step3Enabled,
}: StepsInputsProps) {
  const [openStep, setOpenStep] = useState<1 | 2 | 3 | null>(1);

  useEffect(() => {
    if (!step2Enabled && openStep !== 1) {
      setOpenStep(1);
      return;
    }

    if (!step3Enabled && openStep === 3) {
      setOpenStep(2);
    }
  }, [openStep, step2Enabled, step3Enabled]);

  const cookedStateLabel = cookingMethodSlug
    ? getCookedStateLabel(t, cookingMethodSlug)
    : t("RESULTS.COOKED_WEIGHT");

  return (
    <div className="flex w-full min-w-0 flex-col">
      <CalculatorStep
        step={1}
        title={t("CALCULATOR.STEP_1_TITLE")}
        description={t("CALCULATOR.STEP_1_DESC")}
        isLast={false}
        mobileExpanded={openStep === 1}
        onMobileToggle={() =>
          setOpenStep((current) => (current === 1 ? null : 1))
        }
      >
        <input
          className="input-search block w-full max-w-none"
          placeholder={t("CALCULATOR.SEARCH_PLACEHOLDER")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-4 w-full">
          {query.length < 2 && (
            <p
              className="text-[13px] uppercase tracking-widest mb-3"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.POPULAR_PRODUCTS")}
            </p>
          )}
          <div className="flex w-full flex-wrap gap-2">
            <ProductPills
              t={t}
              i18nLanguage={i18nLanguage}
              displayedProducts={displayedProducts}
              isLoading={isLoading}
              query={query}
              selectedProduct={selectedProduct}
              onSelect={handleSelectProduct}
            />
          </div>
        </div>
      </CalculatorStep>

      <CalculatorStep
        step={2}
        title={t("CALCULATOR.STEP_2_TITLE")}
        description={t("CALCULATOR.STEP_2_DESC")}
        disabled={!step2Enabled}
        isLast={false}
        mobileExpanded={openStep === 2}
        onMobileToggle={() => {
          if (!step2Enabled) return;
          setOpenStep((current) => (current === 2 ? null : 2));
        }}
      >
        <label
          className="block text-[14px] mb-3"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {t("CALCULATOR.METHOD_LABEL")}
        </label>
        <MethodPicker
          t={t}
          selectedProduct={selectedProduct}
          availableMethods={availableMethods}
          cookingMethodSlug={cookingMethodSlug}
          onSelectMethod={setCookingMethodSlug}
          fullWidth
        />
      </CalculatorStep>

      <CalculatorStep
        step={3}
        title={t("CALCULATOR.STEP_3_TITLE")}
        description={t("CALCULATOR.STEP_3_DESC")}
        disabled={!step3Enabled}
        isLast
        mobileExpanded={openStep === 3}
        onMobileToggle={() => {
          if (!step3Enabled) return;
          setOpenStep((current) => (current === 3 ? null : 3));
        }}
      >
        <label
          className="block text-[14px] font-medium mb-2"
          style={{ color: "var(--color-foreground)" }}
        >
          {t("CALCULATOR.PRODUCT_WEIGHT_LABEL")}
        </label>
        <GramsInput
          value={grams}
          onChange={setGrams}
          unitLabel={t("CALCULATOR.GRAMS_UNIT")}
          disabled={!step3Enabled}
        />
        <WeightError t={t} error={resultsError} />
        <div className="mt-4">
          <WeightDirectionToggle
            t={t}
            reverse={reverse}
            onReverseChange={setReverse}
            disabled={!step3Enabled}
            cookedStateLabel={cookedStateLabel}
          />
        </div>
      </CalculatorStep>
    </div>
  );
}

function CalculatorStep({
  step,
  title,
  description,
  children,
  disabled = false,
  isLast,
  mobileExpanded = true,
  onMobileToggle,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
  disabled?: boolean;
  isLast: boolean;
  mobileExpanded?: boolean;
  onMobileToggle?: () => void;
}) {
  const titleId = `calc-step-${step}-title`;
  const contentId = `calc-step-${step}-content`;

  return (
    <section
      aria-labelledby={titleId}
      aria-disabled={disabled || undefined}
      className={`grid w-full min-w-0 grid-cols-[auto_1fr] gap-x-3 md:gap-x-6 gap-y-4 py-6 md:py-8 ${
        !isLast ? "border-b" : ""
      } ${step === 1 ? "pt-0" : ""} ${isLast ? "pb-0" : ""} ${
        disabled ? "opacity-50" : ""
      }`}
      style={{ borderColor: "var(--color-primary-muted)" }}
    >
      <div
        className="row-start-1 col-start-1 self-start font-bold text-[56px] md:text-[72px] leading-none tracking-tighter opacity-20 lg:row-span-2"
        style={{ color: "var(--color-primary)" }}
        aria-hidden
      >
        {String(step).padStart(2, "0")}
      </div>
      <div className="row-start-1 col-start-2 min-w-0 pt-1 md:pt-2">
        <div className="flex items-start justify-between gap-3">
          <h3
            id={titleId}
            className="text-[20px] md:text-[24px] font-bold leading-tight"
          >
            {title}
          </h3>
          {onMobileToggle && (
            <button
              type="button"
              onClick={onMobileToggle}
              disabled={disabled}
              className="md:hidden mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white text-(--color-primary) disabled:opacity-50"
              aria-controls={contentId}
              aria-expanded={mobileExpanded}
              aria-label={title}
            >
              {mobileExpanded ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          )}
        </div>
        {description && (
          <p
            className="mt-1 md:mt-2 text-[14px] md:text-[16px] leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {description}
          </p>
        )}
      </div>
      <div
        id={contentId}
        className={`row-start-2 col-span-2 lg:col-span-1 lg:col-start-2 w-full min-w-0 ${
          mobileExpanded ? "block" : "hidden"
        } md:block`}
      >
        <div className="card-soft w-full min-w-0 p-5 md:p-6">{children}</div>
      </div>
    </section>
  );
}

function ProductPills({
  t,
  i18nLanguage,
  displayedProducts,
  isLoading,
  query,
  selectedProduct,
  onSelect,
}: {
  t: InputsProps["t"];
  i18nLanguage: string;
  displayedProducts: ProductWithFactors[];
  isLoading: boolean;
  query: string;
  selectedProduct: ProductWithFactors | null;
  onSelect: (p: ProductWithFactors) => void;
}) {
  if (isLoading) {
    return (
      <p
        className="text-[14px] py-2"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("CALCULATOR.SEARCHING")}
      </p>
    );
  }
  if (displayedProducts.length === 0 && query.length >= 2) {
    return (
      <p
        className="text-[14px] py-2"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("CALCULATOR.NO_RESULTS")}
      </p>
    );
  }
  return (
    <>
      {displayedProducts.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p)}
          data-active={selectedProduct?.id === p.id}
          className="pill-tab"
        >
          {getLocaleName(i18nLanguage, p.name_en, p.name_pl)}
        </button>
      ))}
    </>
  );
}

function GramsInput({
  value,
  onChange,
  unitLabel,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  unitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex w-full items-baseline gap-3 border-b border-(--color-border) focus-within:border-(--color-primary) pb-1 transition-colors"
      style={
        disabled ? { opacity: 0.5, pointerEvents: "none" as const } : undefined
      }
    >
      <input
        type="number"
        min="1"
        inputMode="decimal"
        className="flex-1 min-w-0 border-0 bg-transparent p-0 text-[28px] font-serif outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <span
        className="text-[18px] font-serif shrink-0 pb-1"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {unitLabel}
      </span>
    </div>
  );
}

function WeightDirectionToggle({
  t,
  reverse,
  onReverseChange,
  disabled,
  cookedStateLabel,
}: {
  t: TFunction;
  reverse: boolean;
  onReverseChange: (fn: (v: boolean) => boolean) => void;
  disabled?: boolean;
  cookedStateLabel: string;
}) {
  const rawLabel = t("RESULTS.STATE_RAW");

  return (
    <div
      className="flex items-center gap-3"
      style={
        disabled ? { opacity: 0.5, pointerEvents: "none" as const } : undefined
      }
      role="group"
      aria-label={`${rawLabel} / ${cookedStateLabel}`}
    >
      <span
        className={`text-[14px] ${!reverse ? "font-semibold" : ""}`}
        style={{
          color: !reverse
            ? "var(--color-primary)"
            : "var(--color-muted-foreground)",
        }}
      >
        {rawLabel}
      </span>
      <Switch
        checked={reverse}
        onCheckedChange={(checked) => onReverseChange(() => checked)}
        disabled={disabled}
        className="h-10 w-[4.25rem] data-[state=checked]:bg-primary data-[state=unchecked]:bg-input [&>span]:h-8 [&>span]:w-8 [&>span]:data-[state=checked]:translate-x-[2.15rem]"
      />
      <span
        className={`text-[14px] ${reverse ? "font-semibold" : ""}`}
        style={{
          color: reverse
            ? "var(--color-primary)"
            : "var(--color-muted-foreground)",
        }}
      >
        {cookedStateLabel}
      </span>
    </div>
  );
}

function MethodPicker({
  t,
  selectedProduct,
  availableMethods,
  cookingMethodSlug,
  onSelectMethod,
  fullWidth = false,
}: {
  t: InputsProps["t"];
  selectedProduct: ProductWithFactors | null;
  availableMethods: { id: string; slug: string }[];
  cookingMethodSlug: string;
  onSelectMethod: (slug: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex p-1 rounded-2xl border border-(--color-border) bg-white ${
        fullWidth ? "w-full flex-wrap" : "inline-flex w-full sm:w-auto"
      }`}
    >
      {availableMethods.length === 0 ? (
        <span
          className="text-[13px] px-4 py-2"
          style={{
            color: selectedProduct
              ? "var(--color-destructive)"
              : "var(--color-muted-foreground)",
          }}
        >
          {selectedProduct
            ? t("CALCULATOR.METHOD_UNAVAILABLE")
            : t("CALCULATOR.SELECT_PRODUCT")}
        </span>
      ) : (
        availableMethods.map((m) => {
          const methodKey = (METHOD_LABEL_KEYS[m.slug] ??
            `COOKING_METHODS.${m.slug.toUpperCase()}`) as "CALCULATOR.RAW_WEIGHT";
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMethod(m.slug)}
              data-active={cookingMethodSlug === m.slug}
              className="pill-tab pill-tab-green bg-transparent!"
            >
              {t(methodKey)}
            </button>
          );
        })
      )}
    </div>
  );
}

function WeightError({
  t,
  error,
}: {
  t: InputsProps["t"];
  error: string | null;
}) {
  if (!error) return null;
  const errorKey = error as "CALCULATOR.RAW_WEIGHT";
  return (
    <p
      className="mt-2 text-[13px]"
      style={{ color: "var(--color-destructive)" }}
    >
      {t(errorKey)}
    </p>
  );
}

type ComputeResult = ReturnType<typeof compute>;

function getMethodLabel(t: TFunction, slug: string): string {
  const methodKey = (METHOD_LABEL_KEYS[slug] ??
    `COOKING_METHODS.${slug.toUpperCase()}`) as "CALCULATOR.RAW_WEIGHT";
  return t(methodKey);
}

function getCookedStateLabel(t: TFunction, slug: string): string {
  const stateKey = (COOKED_STATE_LABEL_KEYS[slug] ??
    "RESULTS.COOKED_WEIGHT") as "RESULTS.STATE_RAW";
  return t(stateKey);
}

export function CalculatorSummaryCard({
  t,
  i18nLanguage,
  selectedProduct,
  cookingMethodSlug,
  reverse,
  results,
  showAccentCircle = true,
  showFooter = true,
  showPer100g = true,
  showMassChangeInfo = true,
}: {
  t: InputsProps["t"];
  i18nLanguage: string;
  selectedProduct: ProductWithFactors | null;
  cookingMethodSlug: string;
  reverse: boolean;
  results: ComputeResult;
  showAccentCircle?: boolean;
  showFooter?: boolean;
  showPer100g?: boolean;
  showMassChangeInfo?: boolean;
}) {
  const hasResult = !!selectedProduct && !!cookingMethodSlug && !results.error;

  const yieldFactor = selectedProduct?.product_cooking_factors.find(
    (f) => f.cooking_methods.slug === cookingMethodSlug,
  )?.yield_factor;

  const productName = selectedProduct
    ? getLocaleName(
        i18nLanguage,
        selectedProduct.name_en,
        selectedProduct.name_pl,
      )
    : "";

  const methodLabel = cookingMethodSlug
    ? getMethodLabel(t, cookingMethodSlug)
    : "";

  const cookedStateLabel = cookingMethodSlug
    ? getCookedStateLabel(t, cookingMethodSlug)
    : t("RESULTS.COOKED_WEIGHT");

  const changePct =
    yieldFactor != null ? Math.round(Math.abs((1 - yieldFactor) * 100)) : 0;
  const isMassLoss = (yieldFactor ?? 1) < 1;

  return (
    <div className="relative w-full min-w-0 self-start">
      {showAccentCircle && (
        <div
          className="pointer-events-none absolute -top-20 -right-24 z-0 hidden h-64 w-64 rounded-full lg:block xl:h-80 xl:w-80"
          style={{ background: "var(--color-primary)", opacity: 0.1 }}
          aria-hidden
        />
      )}

      <div className="card-soft relative z-10 w-full p-6 md:p-8">
        {cookingMethodSlug && (
          <span
            className="absolute top-6 right-6 md:top-8 md:right-8 text-[12px] px-3 py-1.5 rounded-2xl font-medium"
            style={{
              background: "var(--color-primary-muted)",
              color: "var(--color-foreground)",
            }}
          >
            {methodLabel}
          </span>
        )}

        <p
          className={`m-0 p-0 font-serif text-[26px] md:text-[28px] font-light leading-tight ${
            cookingMethodSlug ? "pr-28 md:pr-32" : ""
          }`}
        >
          {productName || "—"}
        </p>

        <p
          className="mt-6 m-0 p-0 text-[12px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          {t("RESULTS.SUMMARY_AFTER_PROCESSING")}
        </p>

        <div className="mt-3 flex items-baseline justify-start gap-2 sm:gap-4">
          <SummaryWeightValue
            label={reverse ? cookedStateLabel : t("RESULTS.STATE_RAW")}
            value={
              hasResult
                ? `${r1(reverse ? results.outputGrams : results.inputGrams)} g`
                : "—"
            }
          />
          <ArrowRight
            size={24}
            className="shrink-0 self-center"
            style={{ color: "var(--color-primary)" }}
            aria-hidden
          />
          <SummaryWeightValue
            label={reverse ? t("RESULTS.STATE_RAW") : cookedStateLabel}
            value={
              hasResult
                ? `${r1(reverse ? results.inputGrams : results.outputGrams)} g`
                : "—"
            }
            highlight
          />
        </div>

        {hasResult && (
          <>
            <p
              className="mt-8 text-[12px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              {String(
                t("RESULTS.SUMMARY_MACROS_FOR", {
                  grams: r1(results.outputGrams),
                }),
              )}
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MacroSummaryBox
                label={t("RESULTS.MACRO_CALORIES")}
                value={String(r1(results.portion.kcal))}
                unit="kcal"
              />
              <MacroSummaryBox
                label={t("RESULTS.MACRO_PROTEIN")}
                value={String(r1(results.portion.protein))}
                unit="g"
              />
              <MacroSummaryBox
                label={t("RESULTS.MACRO_FAT")}
                value={String(r1(results.portion.fat))}
                unit="g"
              />
              <MacroSummaryBox
                label={t("RESULTS.MACRO_CARBS")}
                value={String(r1(results.portion.carbs))}
                unit="g"
              />
            </div>

            {showPer100g && (
              <>
                <p
                  className="mt-8 text-[12px] uppercase tracking-widest font-semibold mb-3"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {t("RESULTS.SUMMARY_PER_100G_RAW")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MacroSummaryBox
                    label={t("RESULTS.MACRO_CALORIES")}
                    value={String(r1(results.per100.kcal))}
                    unit="kcal"
                    compact
                  />
                  <MacroSummaryBox
                    label={t("RESULTS.MACRO_PROTEIN")}
                    value={String(r1(results.per100.protein))}
                    unit="g"
                    compact
                  />
                  <MacroSummaryBox
                    label={t("RESULTS.MACRO_FAT")}
                    value={String(r1(results.per100.fat))}
                    unit="g"
                    compact
                  />
                  <MacroSummaryBox
                    label={t("RESULTS.MACRO_CARBS")}
                    value={String(r1(results.per100.carbs))}
                    unit="g"
                    compact
                  />
                </div>
              </>
            )}

            {showMassChangeInfo && (
              <div
                className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "var(--color-primary-light)" }}
              >
                {isMassLoss ? (
                  <TrendingDown
                    size={22}
                    style={{ color: "var(--color-primary)" }}
                    aria-hidden
                  />
                ) : (
                  <TrendingUp
                    size={22}
                    style={{ color: "var(--color-primary)" }}
                    aria-hidden
                  />
                )}
                <p className="text-[14px] leading-snug">
                  <span
                    className="font-bold text-[18px] mr-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {isMassLoss ? `-${changePct}%` : `+${changePct}%`}
                  </span>
                  <span style={{ color: "var(--color-foreground)" }}>
                    {isMassLoss
                      ? t("RESULTS.SUMMARY_MASS_LESS")
                      : t("RESULTS.SUMMARY_MASS_MORE")}
                  </span>
                </p>
              </div>
            )}
          </>
        )}

        {showFooter && (
          <>
            <button
              type="button"
              className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
            >
              <Bookmark size={18} aria-hidden />
              {t("RESULTS.SAVE_TO_HISTORY")}
            </button>
            <p
              className="text-[12px] mt-3 text-center"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("CALCULATOR.ANONYMOUS_MODE")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryResultsCard({
  t,
  i18nLanguage,
  selectedProduct,
  cookingMethodSlug,
  reverse,
  results,
}: {
  t: InputsProps["t"];
  i18nLanguage: string;
  selectedProduct: ProductWithFactors | null;
  cookingMethodSlug: string;
  reverse: boolean;
  setReverse: (fn: (v: boolean) => boolean) => void;
  results: ComputeResult;
}) {
  return (
    <CalculatorSummaryCard
      t={t}
      i18nLanguage={i18nLanguage}
      selectedProduct={selectedProduct}
      cookingMethodSlug={cookingMethodSlug}
      reverse={reverse}
      results={results}
    />
  );
}

function SummaryWeightValue({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="m-0 min-w-0 p-0 text-left">
      <span
        className="m-0 block p-0 text-[11px] tracking-wide leading-none font-medium"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <span
        className="m-0 block p-0 font-serif text-[48px] sm:text-[52px] md:text-[56px] leading-none"
        style={{
          color: highlight ? "var(--color-primary)" : "var(--color-foreground)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function MacroSummaryBox({
  label,
  value,
  unit,
  compact = false,
}: {
  label: string;
  value: string;
  unit: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-(--color-border) bg-white flex flex-col ${
        compact ? "p-3" : "p-3.5"
      }`}
    >
      <span
        className="text-[10px] uppercase tracking-wide font-medium leading-tight mb-2"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <p
        className={`font-bold leading-none ${
          compact ? "text-[18px]" : "text-[22px]"
        }`}
      >
        {value}
      </p>
      <p
        className="text-[11px] mt-1"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {unit}
      </p>
    </div>
  );
}

function ResultsPanel({
  t,
  i18nLanguage,
  selectedProduct,
  cookingMethodSlug,
  reverse,
  setReverse,
  results,
  variant = "default",
}: {
  t: InputsProps["t"];
  i18nLanguage: string;
  selectedProduct: ProductWithFactors | null;
  cookingMethodSlug: string;
  reverse: boolean;
  setReverse: (fn: (v: boolean) => boolean) => void;
  results: ComputeResult;
  variant?: "default" | "steps";
}) {
  if (variant === "steps") {
    return (
      <SummaryResultsCard
        t={t}
        i18nLanguage={i18nLanguage}
        selectedProduct={selectedProduct}
        cookingMethodSlug={cookingMethodSlug}
        reverse={reverse}
        setReverse={setReverse}
        results={results}
      />
    );
  }

  return (
    <div className="card-soft w-full min-w-0 p-7 md:p-9 self-start">
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("CALCULATOR.RESULT_TITLE")}
          </p>
          <h3 className="font-serif text-[28px] mt-1">
            {selectedProduct
              ? getLocaleName(
                  i18nLanguage,
                  selectedProduct.name_en,
                  selectedProduct.name_pl,
                )
              : "—"}
          </h3>
        </div>
        {cookingMethodSlug &&
          (() => {
            const methodKey = (METHOD_LABEL_KEYS[cookingMethodSlug] ??
              `COOKING_METHODS.${cookingMethodSlug.toUpperCase()}`) as "CALCULATOR.RAW_WEIGHT";

            const yieldFactor = selectedProduct?.product_cooking_factors.find(
              (f) => f.cooking_methods.slug === cookingMethodSlug,
            )?.yield_factor;

            return (
              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] px-3 py-1 rounded-2xl font-medium"
                  style={{
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                  }}
                >
                  {yieldFactor && yieldFactor > 1
                    ? `+${Math.round((yieldFactor - 1) * 100)}%`
                    : `-${Math.round((1 - (yieldFactor || 1)) * 100)}%`}
                </span>
                {import.meta.env.DEV && yieldFactor && (
                  <span
                    className="text-[10px] font-mono px-2 py-1 rounded-2xl bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    title="Yield factor (Dev only)"
                  >
                    {yieldFactor}x
                  </span>
                )}
                <span
                  className="text-[12px] px-3 py-1 rounded-2xl"
                  style={{
                    background: "var(--color-primary-muted)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {t(methodKey)}
                </span>
              </div>
            );
          })()}
      </div>

      <div className="mt-7 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
        <Tile
          label={t("RESULTS.RAW_WEIGHT")}
          value={`${r1(results.inputGrams)} g`}
          big
          highlight={reverse}
        />
        <button
          type="button"
          onClick={() => setReverse((v) => !v)}
          className="shrink-0 justify-self-center p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          style={{ color: "var(--color-primary)" }}
          aria-label={t("CALCULATOR.TOGGLE_REVERSE")}
        >
          {reverse ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
        </button>
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

      <button type="button" className="btn-primary w-full mt-8">
        {t("RESULTS.SAVE_TO_HISTORY")}
      </button>
      <p
        className="text-[12px] mt-3 text-center"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {t("CALCULATOR.ANONYMOUS_MODE")}
      </p>
    </div>
  );
}

const Tile = ({
  label,
  value,
  big,
  large,
  highlight,
}: {
  label: string;
  value: string;
  big?: boolean;
  large?: boolean;
  highlight?: boolean;
}) => {
  const valueSize = large
    ? "text-[40px] sm:text-[44px]"
    : big
      ? "text-[32px]"
      : "text-[22px]";

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
        className={`font-serif mt-2 ${valueSize}`}
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
  per100: { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  portion: { kcal: 0, protein: 0, fat: 0, carbs: 0 },
});

export type ProductComputeResult = ReturnType<typeof compute>;

export function computeProductResults(
  product: ProductWithFactors | null,
  methodSlug: string,
  gramsStr: string,
  reverse: boolean,
): ProductComputeResult {
  return compute(product, methodSlug, gramsStr, reverse);
}
