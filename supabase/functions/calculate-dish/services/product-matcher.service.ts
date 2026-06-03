import { getSupabaseAdmin } from "../lib/supabase-admin.ts";
import type { AppLanguage, LlmIngredient, MatchedIngredient, MacroTotals } from "../types.ts";

const PRODUCT_MATCH_MIN_SIMILARITY = 0.25;

type DbMatchRow = {
  id: string;
  name_en: string;
  name_pl: string;
  product_name: string;
  calories_kcal: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  matched_confidence: number;
};

export class ProductMatcherService {
  private supabase = getSupabaseAdmin();

  private collectSearchTerms(ingredient: LlmIngredient): string[] {
    const terms = new Set<string>();
    const add = (value?: string) => {
      const normalized = value?.trim().toLowerCase();
      if (normalized) terms.add(normalized);
    };

    add(ingredient.display_name);
    add(ingredient.name);
    add(ingredient.name_pl);
    for (const alias of ingredient.search_aliases ?? []) {
      add(alias);
    }

    return [...terms];
  }

  private async findBestDbMatch(
    terms: string[],
    locale: AppLanguage,
  ): Promise<DbMatchRow | null> {
    let best: DbMatchRow | null = null;

    for (const term of terms) {
      const { data, error } = await this.supabase.rpc("match_product_by_name", {
        p_ingredient: term,
        p_locale: locale,
      });

      if (error) {
        console.error("Error matching product:", error, { term });
        continue;
      }

      const row = data?.[0] as DbMatchRow | undefined;
      if (!row) continue;

      if (!best || row.matched_confidence > best.matched_confidence) {
        best = row;
      }
    }

    return best;
  }

  private macrosFromPer100g(
    per100: MacroTotals,
    rawWeightG: number,
  ): MacroTotals {
    const k = rawWeightG / 100;
    return {
      calories_kcal: per100.calories_kcal * k,
      protein_g: per100.protein_g * k,
      fat_g: per100.fat_g * k,
      carbs_g: per100.carbs_g * k,
    };
  }

  private buildExternalItem(
    ingredient: LlmIngredient,
    locale: AppLanguage,
  ): MatchedIngredient | null {
    const ext = ingredient.external_nutrition_per_100g;
    if (!ext || !ingredient.nutrition_source) return null;

    const displayName =
      ingredient.display_name ??
      (locale === "pl" ? ingredient.name_pl : undefined) ??
      ingredient.name;

    const yieldFactor =
      ingredient.cooked_weight_g && ingredient.weight_g
        ? ingredient.cooked_weight_g / ingredient.weight_g
        : 1;

    const per100: MacroTotals = {
      calories_kcal: ext.calories_kcal,
      protein_g: ext.protein_g,
      fat_g: ext.fat_g,
      carbs_g: ext.carbs_g,
    };

    return {
      product_id: null,
      name_en: ingredient.name,
      name_pl: ingredient.name_pl ?? ingredient.display_name ?? ingredient.name,
      product_name: displayName,
      cooking_method_slug: ingredient.cooking_method,
      raw_weight_g: ingredient.weight_g,
      cooked_weight_g: ingredient.weight_g * yieldFactor,
      yield_factor_used: yieldFactor,
      yield_source: "external",
      matched_confidence: 0,
      macros: this.macrosFromPer100g(per100, ingredient.weight_g),
      nutrition_source: ingredient.nutrition_source,
    };
  }

  async matchIngredient(
    ingredient: LlmIngredient,
    locale: AppLanguage,
  ): Promise<{
    match?: MatchedIngredient;
    warning?: {
      issue: "unrecognized" | "yield_source_ai" | "external_nutrition" | "cooking_method_required";
      ingredient: string;
      yield_factor_estimated?: number;
      nutrition_source?: string;
    };
  }> {
    const displayLabel =
      ingredient.display_name ?? ingredient.name_pl ?? ingredient.name;
    const terms = this.collectSearchTerms(ingredient);
    const match = await this.findBestDbMatch(terms, locale);

    if (!match || match.matched_confidence < PRODUCT_MATCH_MIN_SIMILARITY) {
      const external = this.buildExternalItem(ingredient, locale);
      if (external) {
        return {
          match: external,
          warning: {
            issue: "external_nutrition",
            ingredient: displayLabel,
            nutrition_source: ingredient.nutrition_source,
          },
        };
      }
      return { warning: { issue: "unrecognized", ingredient: displayLabel } };
    }

    const { data: yieldData, error: yieldError } = await this.supabase
      .from("product_cooking_factors")
      .select(`
        yield_factor,
        cooking_methods!inner(slug)
      `)
      .eq("product_id", match.id)
      .eq("cooking_methods.slug", ingredient.cooking_method)
      .single();

    if (yieldError && yieldError.code !== "PGRST116") {
      console.error("Error fetching yield factor:", yieldError);
    }

    let yieldFactor = 1.0;
    let yieldSource: "db" | "ai" = "db";
    let issue: "yield_source_ai" | "cooking_method_required" | undefined;

    if (ingredient.cooking_method === "none") {
      yieldFactor = 1.0;
      yieldSource = "db";
    } else if (ingredient.cooking_method === null) {
      yieldFactor = 1.0;
      yieldSource = "db";
      issue = "cooking_method_required";
    } else {
      if (yieldData) {
        yieldFactor = yieldData.yield_factor;
      } else {
        // Try to find ANY yield factor for this product as fallback
        const { data: fallbackData } = await this.supabase
          .from("product_cooking_factors")
          .select(`yield_factor, cooking_methods!inner(slug)`)
          .eq("product_id", match.id)
          .limit(1)
          .maybeSingle();

        yieldSource = "ai";
        issue = "yield_source_ai";
        if (ingredient.cooked_weight_g && ingredient.weight_g) {
          yieldFactor = ingredient.cooked_weight_g / ingredient.weight_g;
        } else if (fallbackData) {
          yieldFactor = fallbackData.yield_factor;
        }
      }
    }

    const cookedWeightG = ingredient.weight_g * yieldFactor;
    const k = ingredient.weight_g / 100;
    const macros: MacroTotals = {
      calories_kcal: (match.calories_kcal || 0) * k,
      protein_g: (match.protein_g || 0) * k,
      fat_g: (match.fat_g || 0) * k,
      carbs_g: (match.carbs_g || 0) * k,
    };

    const result: MatchedIngredient = {
      product_id: match.id,
      name_en: match.name_en,
      name_pl: match.name_pl ?? match.name_en,
      product_name: match.product_name,
      cooking_method_slug: ingredient.cooking_method,
      raw_weight_g: ingredient.weight_g,
      cooked_weight_g: cookedWeightG,
      yield_factor_used: yieldFactor,
      yield_source: yieldSource,
      matched_confidence: match.matched_confidence,
      macros,
      nutrition_source: null,
    };

    if (issue) {
      return {
        match: result,
        warning: {
          issue,
          ingredient: displayLabel,
          yield_factor_estimated: yieldFactor,
        },
      };
    }

    return { match: result };
  }
}
