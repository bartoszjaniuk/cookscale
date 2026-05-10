import { type ProductWithFactors } from "@/api/products/products";
import { useInitialProductsQuery } from "@/api/products/hooks/useInitialProductsQuery";
import { useProductsSearchQuery } from "@/api/products/hooks/useProductsSearchQuery";
import { AppProviders } from "@/providers/AppProviders";
import { r1 } from "@/lib/cookscale-data";
import { useEffect, useMemo, useRef, useState } from "react";

const METHOD_LABEL: Record<string, string> = {
  boiling: "Gotowanie",
  frying: "Smażenie",
  baking: "Pieczenie",
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
          Wyszukaj produkt
        </label>
        <input
          className="input-search"
          placeholder="np. kurczak, ryż, brokuł…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2 max-h-36 md:max-h-44 overflow-y-auto pr-1">
          {isSearching ? (
            <p
              className="text-[14px] py-2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Szukam…
            </p>
          ) : displayedProducts.length === 0 && debouncedQuery.length >= 2 ? (
            <p
              className="text-[14px] py-2"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Brak wyników. Spróbuj innej nazwy.
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
              Metoda obróbki
            </label>
            <button
              onClick={() => setReverse((v) => !v)}
              className="text-[13px] underline-offset-4 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {reverse ? "← tryb standardowy" : "tryb odwrotny →"}
            </button>
          </div>
          <div className="inline-flex w-full sm:w-auto p-1 rounded-full border border-(--color-border) bg-white">
            {availableMethods.length === 0 ? (
              <span
                className="text-[13px] px-4 py-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Wybierz produkt
              </span>
            ) : (
              availableMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCookingMethodSlug(m.slug)}
                  data-active={cookingMethodSlug === m.slug}
                  className="pill-tab pill-tab-green bg-transparent!"
                >
                  {METHOD_LABEL[m.slug] ?? m.slug}
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
            {reverse ? "Gramatura po obróbce (g)" : "Gramatura surowa (g)"}
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
              {results.error}
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
              Wynik
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
              {METHOD_LABEL[cookingMethodSlug] ?? cookingMethodSlug}
            </span>
          )}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <Tile
            label="Surowo"
            value={`${r1(results.inputGrams)} g`}
            big
            highlight={reverse}
          />
          <Tile
            label="Po obróbce"
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
            Na porcję ({r1(results.inputGrams)}g surowych)
          </p>
          <MacroRow label="Kalorie" unit="kcal" value={results.portion.kcal} />
          <MacroRow label="Białko" unit="g" value={results.portion.protein} />
          <MacroRow label="Tłuszcze" unit="g" value={results.portion.fat} />
          <MacroRow label="Węglowodany" unit="g" value={results.portion.carbs} />
        </div>

        <button className="btn-primary w-full mt-8">Zapisz w historii</button>
        <p
          className="text-[12px] mt-3 text-center"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Tryb anonimowy: 1–2 obliczenia. Zarejestruj się, aby zapisywać wyniki.
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
  if (!product) return blank("Wybierz produkt.");
  if (!Number.isFinite(g) || g <= 0) return blank("Podaj liczbę większą od 0.");

  const factor = product.product_cooking_factors.find(
    (f) => f.cooking_methods.slug === methodSlug,
  );
  if (!factor) return blank("Metoda obróbki niedostępna dla tego produktu.");

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
