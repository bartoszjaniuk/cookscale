import type { MacroTotals, MatchedIngredient, CalculateDishResponse } from "../types.ts";

/** Round to one decimal place (matches web `r1`). */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function roundMacros(macros: MacroTotals): MacroTotals {
  return {
    calories_kcal: round1(macros.calories_kcal),
    protein_g: round1(macros.protein_g),
    fat_g: round1(macros.fat_g),
    carbs_g: round1(macros.carbs_g),
  };
}

export function roundMatchedIngredient(item: MatchedIngredient): MatchedIngredient {
  return {
    ...item,
    raw_weight_g: Math.round(item.raw_weight_g),
    cooked_weight_g: Math.round(item.cooked_weight_g),
    yield_factor_used: round1(item.yield_factor_used),
    matched_confidence: round1(item.matched_confidence),
    macros: roundMacros(item.macros),
  };
}

export function roundCalculateDishResponse(
  response: Omit<CalculateDishResponse, "total_weight_g" | "total" | "per_100g" | "items"> & {
    total_weight_g: number;
    total: MacroTotals;
    per_100g: MacroTotals;
    items: MatchedIngredient[];
  },
): CalculateDishResponse {
  return {
    ...response,
    total_weight_g: Math.round(response.total_weight_g),
    total: roundMacros(response.total),
    per_100g: roundMacros(response.per_100g),
    items: response.items.map(roundMatchedIngredient),
  };
}
