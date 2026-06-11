import type { Method } from "@/lib/cookscale-data";

export interface CalculateDishApiMacros {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface CalculateDishApiItem {
  product_id: string | null;
  name_en: string;
  name_pl: string | null;
  product_name: string;
  cooking_method_slug: string | null;
  raw_weight_g: number;
  cooked_weight_g: number;
  yield_factor_used: number;
  yield_source: "db" | "ai" | "external";
  matched_confidence: number;
  macros: CalculateDishApiMacros;
  nutrition_source?: string | null;
}

export interface CalculateDishApiWarning {
  ingredient: string;
  issue:
    | "unrecognized"
    | "yield_source_ai"
    | "external_nutrition"
    | "cooking_method_required"
    | "low_confidence"
    | "medium_confidence"
    | "name_mismatch";
  yield_factor_estimated?: number;
  nutrition_source?: string;
}

export interface CalculateDishApiResponse {
  calculation_id: string | null;
  total_weight_g: number;
  total: CalculateDishApiMacros;
  per_100g: CalculateDishApiMacros;
  items: CalculateDishApiItem[];
  warnings: CalculateDishApiWarning[] | null;
}

export interface CalculateDishApiError {
  error: string;
  message?: string;
  reset_at?: string;
}

export type AiEstimateItem = {
  productId: string | null;
  nameEn: string;
  namePl: string | null;
  grams: number;
  rawGrams: number;
  method: Method | null;
  macros: { kcal: number; protein: number; fat: number; carbs: number };
  yieldSource?: "db" | "ai" | "external";
  nutritionSource?: string | null;
};

export type AiEstimateResult = {
  items: AiEstimateItem[];
  unrecognized: string[];
  total: { kcal: number; protein: number; fat: number; carbs: number };
  totalGrams: number;
  rawTotalGrams: number;
  per100: { kcal: number; protein: number; fat: number; carbs: number };
  rawPer100: { kcal: number; protein: number; fat: number; carbs: number };
  calculationId: string | null;
};

function toUiMacros(m: CalculateDishApiMacros) {
  return {
    kcal: m.calories_kcal,
    protein: m.protein_g,
    fat: m.fat_g,
    carbs: m.carbs_g,
  };
}

function slugToMethod(slug: string | null): Method | null {
  if (
    slug === "boiling" ||
    slug === "frying" ||
    slug === "baking" ||
    slug === "none"
  ) {
    return slug;
  }
  return null;
}

export function mapCalculateDishToEstimate(
  api: CalculateDishApiResponse,
): AiEstimateResult {
  const items: AiEstimateItem[] = api.items.map((it) => ({
    productId: it.product_id,
    nameEn: it.name_en,
    namePl: it.name_pl,
    grams: it.cooked_weight_g,
    rawGrams: it.raw_weight_g,
    method: slugToMethod(it.cooking_method_slug),
    macros: toUiMacros(it.macros),
    yieldSource: it.yield_source,
    nutritionSource: it.nutrition_source,
  }));

  const unrecognized =
    api.warnings
      ?.filter((w) => w.issue === "unrecognized")
      .map((w) => w.ingredient) ?? [];

  const total = toUiMacros(api.total);
  const totalGrams = api.total_weight_g;
  const rawTotalGrams = api.items.reduce((sum, it) => sum + it.raw_weight_g, 0);

  const per100 = toUiMacros(api.per_100g);
  const rawPer100 =
    rawTotalGrams > 0
      ? {
          kcal: (total.kcal / rawTotalGrams) * 100,
          protein: (total.protein / rawTotalGrams) * 100,
          fat: (total.fat / rawTotalGrams) * 100,
          carbs: (total.carbs / rawTotalGrams) * 100,
        }
      : { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  return {
    items,
    unrecognized,
    total,
    totalGrams,
    rawTotalGrams,
    per100,
    rawPer100,
    calculationId: api.calculation_id,
    rawApiResponse: api,
  };
}

export async function calculateDish(
  description: string,
  options?: { accessToken?: string | null; language?: "pl" | "en" },
): Promise<{ data: AiEstimateResult } | { error: CalculateDishApiError }> {
  const accessToken = options?.accessToken;
  const language = options?.language ?? "pl";
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !anonKey) {
    return {
      error: { error: "internal_error", message: "Missing Supabase config" },
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: anonKey,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/calculate-dish`, {
    method: "POST",
    headers,
    body: JSON.stringify({ description, language }),
  });

  const body = (await response.json().catch(() => ({}))) as
    | CalculateDishApiResponse
    | CalculateDishApiError;

  if (!response.ok) {
    return {
      error: {
        error: "error" in body ? body.error : "internal_error",
        message: "message" in body ? body.message : undefined,
        reset_at: "reset_at" in body ? body.reset_at : undefined,
      },
    };
  }

  return { data: mapCalculateDishToEstimate(body as CalculateDishApiResponse) };
}
