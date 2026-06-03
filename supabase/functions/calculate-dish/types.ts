import { z } from "zod";
import { CalculateDishRequestSchema } from "./schemas.ts";
import type { Database } from "../../types/database.types.ts";
import type { CookingMethodSlug } from "./lib/normalize-cooking-method.ts";

export type CalculateDishRequest = z.infer<typeof CalculateDishRequestSchema>;

export type AppLanguage = "pl" | "en";

export interface CalculateDishCommand {
  description: string;
  userId: string | null;
  ipHash: string;
  language: AppLanguage;
}

export interface AuthContext {
  userId: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  trialAiUsedAt: string | null;
  preferredLanguage: AppLanguage;
}

export interface MacroTotals {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface DishWarning {
  ingredient: string;
  issue: "unrecognized" | "yield_source_ai" | "external_nutrition" | "cooking_method_required";
  yield_factor_estimated?: number;
  nutrition_source?: string;
}

export interface MatchedIngredient {
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
  macros: MacroTotals;
  /** Set when macros come from LLM external lookup (USDA etc.). */
  nutrition_source?: string | null;
}

export interface CalculateDishResponse {
  calculation_id: string | null;
  total_weight_g: number;
  total: MacroTotals;
  per_100g: MacroTotals;
  items: MatchedIngredient[];
  warnings: DishWarning[] | null;
}

export type CalculationsInsert = Database["public"]["Tables"]["calculations"]["Insert"];
export type AiUsageLogInsert = Database["public"]["Tables"]["ai_usage_log"]["Insert"];
export type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export interface LlmDishContext {
  default_cooking_method?: CookingMethodSlug;
  preparation?: string;
}

export interface LlmNutritionPer100g {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface LlmIngredientRaw {
  name: string;
  display_name?: string;
  name_pl?: string;
  search_aliases?: string[];
  cooking_method?: string;
  requires_thermal_processing?: boolean;
  weight_g: number;
  cooked_weight_g?: number;
  external_nutrition_per_100g?: LlmNutritionPer100g;
  nutrition_source?: string;
}

export interface LlmIngredient extends LlmIngredientRaw {
  cooking_method: CookingMethodSlug | null;
}

export interface ParsedDish {
  dish_context: LlmDishContext | null;
  ingredients: LlmIngredientRaw[];
}
