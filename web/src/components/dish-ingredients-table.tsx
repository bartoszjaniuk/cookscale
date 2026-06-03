import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { r1, type Method } from "@/lib/cookscale-data";
import { ChevronDown, Loader2, Save, Search, Trash2 } from "lucide-react";
import type { AiEstimateItem, AiEstimateResult } from "@/lib/calculate-dish";
import { saveDishCalculation } from "@/lib/calculate-dish-api-extras";
import { recalculateDishLocally } from "@/lib/dish-recalculate";
import { useAllProductsQuery } from "@/api/products/hooks/useAllProductsQuery";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getLocaleName } from "@/lib/utils";

type TranslationFunction = ReturnType<typeof useTranslation>["t"];

function getMethodLabel(t: TranslationFunction, m: Method | null | undefined): string {
  if (!m) return t("AI.SELECT_METHOD", "Wybierz...");
  return m === "boiling"
    ? t("AI.METHOD_BOILED", "Gotowane")
    : m === "frying"
      ? t("AI.METHOD_FRIED", "Smażone")
      : m === "baking"
        ? t("AI.METHOD_BAKED", "Pieczone")
        : t("AI.METHOD_NONE", "Bez obróbki");
}

function getMethodList(t: TranslationFunction) {
  return [
    { value: "boiling" as Method, label: t("AI.METHOD_BOILED", "Gotowane") },
    { value: "frying" as Method, label: t("AI.METHOD_FRIED", "Smażone") },
    { value: "baking" as Method, label: t("AI.METHOD_BAKED", "Pieczone") },
    { value: "none" as Method, label: t("AI.METHOD_NONE", "Bez obróbki") },
  ];
}

const supabase = createSupabaseBrowserClient();

export function DishIngredientsTable({
  result,
  description,
  onUpdateResult,
}: {
  result: AiEstimateResult;
  description: string;
  onUpdateResult: (newResult: AiEstimateResult) => void;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "pl";
  const [items, setItems] = useState<AiEstimateItem[]>(result.items);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [session, setSession] = useState<any>(null);

  const { data: allProducts = [] } = useAllProductsQuery();
  const productsById = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Sync state if a new result comes from the parent (e.g., new LLM call)
  useEffect(() => {
    setItems(result.items);
    setSaveSuccess(false);
  }, [result]);

  const hasMissingMethods = useMemo(() => {
    return items.some((it) => it.method === null);
  }, [items]);

  const doRecalculate = (newItems: AiEstimateItem[]) => {
    setSaveSuccess(false);
    const outcome = recalculateDishLocally(newItems, productsById, result.unrecognized);
    setItems(outcome.items);
    onUpdateResult(outcome);
  };

  const changeMethod = (index: number, method: Method) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], method };
    doRecalculate(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    doRecalculate(newItems);
  };

  const handleSave = async () => {
    if (!session?.access_token || !result.rawApiResponse || hasMissingMethods) return;
    
    setSaving(true);
    try {
      const outcome = await saveDishCalculation(description, result.rawApiResponse, {
        accessToken: session.access_token,
        language
      });
      if ("data" in outcome) {
        setSaveSuccess(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-soft p-6 sm:p-8">
      <h4 className="font-medium text-[15px] mb-4 text-(--color-foreground)">
        {t("AI.INGREDIENTS", "Składniki")}
      </h4>
      <ul className="flex flex-col">
        {items.map((it, i) => {
          const diff = it.grams - it.rawGrams;
          const diffText = diff > 0 ? `+${diff} g` : diff < 0 ? `${diff} g` : `0 g`;
          const diffColor = diff !== 0 ? "text-(--color-primary)" : "text-(--color-foreground)";

          const isMissingMethod = it.method === null;

          const prod = it.productId ? productsById.get(it.productId) : null;
          const availableSlugs = prod
            ? prod.product_cooking_factors.map((f) => f.cooking_methods.slug)
            : ["boiling", "frying", "baking", "none"];
          
          // Zawsze pozwalaj na 'none' w UI jeśli to external lub jeśli ma to w DB
          if (it.yieldSource === "external" || !prod) {
            if (!availableSlugs.includes("none")) availableSlugs.push("none");
          } else if (prod && !availableSlugs.includes("none")) {
            // "none" is allowed if product has it, else not allowed.
            // Oh actually, we allow 'none' to be added for any product anyway if user wants it raw.
            availableSlugs.push("none");
          }

          const methodsToShow = getMethodList(t).filter((m) => availableSlugs.includes(m.value));

          return (
            <li
              key={i}
              className={`flex flex-col py-4 border-b border-(--color-border) last:border-0 ${
                isMissingMethod ? "bg-destructive/5 -mx-4 px-4 rounded-xl" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-(--color-foreground)">
                      {getLocaleName(language, it.nameEn, it.namePl)}
                    </span>
                    {import.meta.env.DEV && it.yieldSource === "ai" && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                        AI yield
                      </span>
                    )}
                    {import.meta.env.DEV && it.yieldSource === "external" && it.nutritionSource && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                        {t("AI.DEV_NUTRITION_SOURCE", {
                          source: it.nutritionSource,
                          defaultValue: "{{source}}",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] mt-1 text-(--color-muted-foreground)">
                    {it.rawGrams} g (surowe)
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  {!isMissingMethod && (
                    <span className={`text-[13px] font-medium ${diffColor} text-right w-12 hidden sm:block`}>
                      {diffText}
                    </span>
                  )}
                  <span className="text-[15px] font-medium text-(--color-foreground) text-right w-16 whitespace-nowrap">
                    {r1(it.macros.kcal)} kcal
                  </span>
                  <button
                    onClick={() => removeItem(i)}
                    className="p-1.5 text-(--color-muted-foreground) hover:text-(--color-destructive) hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Method Selector */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-[12px] text-(--color-muted-foreground)">Obróbka:</span>
                <div className="flex flex-wrap gap-1.5">
                  {methodsToShow.map((m) => {
                    const isSelected = it.method === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => changeMethod(i, m.value)}
                        className={`text-[12px] px-3 py-1.5 rounded-full transition-all border ${
                          isSelected
                            ? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground) font-medium shadow-sm"
                            : isMissingMethod 
                              ? "bg-white border-destructive/30 text-(--color-muted-foreground) hover:bg-destructive/5"
                              : "bg-white border-(--color-border) text-(--color-muted-foreground) hover:bg-gray-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {isMissingMethod && (
                <p className="text-[12px] text-(--color-destructive) mt-2 font-medium">
                  {t("AI.COOKING_METHOD_REQUIRED", "Wybierz metodę obróbki dla tego składnika.")}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {result.unrecognized.length > 0 && (
        <div
          className="mt-4 rounded-2xl px-5 py-4 text-[14px]"
          style={{ background: "var(--color-announcement)" }}
        >
          {t("AI.UNRECOGNIZED_PREFIX", "Nie udało się rozpoznać:")}{" "}
          <strong>{result.unrecognized.join(", ")}</strong>.{" "}
          {t("AI.PARTIAL_RESULT", "Wynik bez uwzględnienia tych produktów.")}
        </div>
      )}

      {session && (
        <div className="mt-6 pt-6 border-t border-(--color-border) flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || hasMissingMethods || saveSuccess}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-medium transition-all ${
              saveSuccess
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-white border border-(--color-border) text-(--color-foreground) shadow-sm hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Save className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess 
              ? t("AI.SAVED", "Zapisano")
              : t("AI.SAVE_TO_HISTORY", "Zapisz do historii")}
          </button>
        </div>
      )}
      
    </div>
  );
}
