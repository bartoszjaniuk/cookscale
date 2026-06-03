import type { ProductWithFactors } from "@/api/products/products";
import type { AiEstimateItem, AiEstimateResult, CalculateDishApiResponse, CalculateDishApiItem } from "./calculate-dish";

export function recalculateDishLocally(
  items: AiEstimateItem[],
  productsById: Map<string, ProductWithFactors>,
  unrecognized: string[] = []
): AiEstimateResult {
  const newItems: AiEstimateItem[] = [];

  for (const item of items) {
    if (!item.productId) {
      if (item.yieldSource === "external" && item.macros) {
        const yieldFactor = item.method === "none" ? 1.0 : (item.grams / item.rawGrams || 1.0);
        newItems.push({
          ...item,
          grams: item.rawGrams * yieldFactor,
        });
      } else {
        newItems.push({ ...item });
      }
      continue;
    }

    const prod = productsById.get(item.productId);
    if (!prod) {
      newItems.push({ ...item });
      continue;
    }

    let yieldFactor = 1.0;
    let yieldSource = "db" as "db" | "ai" | "external";

    if (item.method === "none" || item.method === null) {
      yieldFactor = 1.0;
      yieldSource = "db";
    } else {
      const factorObj = prod.product_cooking_factors?.find(
        (f) => f.cooking_methods.slug === item.method
      );
      if (factorObj) {
        yieldFactor = factorObj.yield_factor;
      } else {
        yieldSource = "ai";
        const fallback = prod.product_cooking_factors?.[0];
        if (fallback) {
          yieldFactor = fallback.yield_factor;
        }
      }
    }

    const k = item.rawGrams / 100;
    newItems.push({
      ...item,
      nameEn: prod.name_en,
      namePl: prod.name_pl ?? prod.name_en,
      grams: item.rawGrams * yieldFactor,
      yieldSource,
      macros: {
        kcal: (prod.calories_kcal || 0) * k,
        protein: (prod.protein_g || 0) * k,
        fat: (prod.fat_g || 0) * k,
        carbs: (prod.carbs_g || 0) * k,
      },
    });
  }

  let totalWeightG = 0;
  let rawTotalGrams = 0;
  const total = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  for (const item of newItems) {
    totalWeightG += item.grams;
    rawTotalGrams += item.rawGrams;
    total.kcal += item.macros.kcal;
    total.protein += item.macros.protein;
    total.fat += item.macros.fat;
    total.carbs += item.macros.carbs;
  }

  const per100 = { kcal: 0, protein: 0, fat: 0, carbs: 0 };
  if (totalWeightG > 0) {
    const k = 100 / totalWeightG;
    per100.kcal = total.kcal * k;
    per100.protein = total.protein * k;
    per100.fat = total.fat * k;
    per100.carbs = total.carbs * k;
  }

  const rawPer100 = rawTotalGrams > 0
    ? {
        kcal: (total.kcal / rawTotalGrams) * 100,
        protein: (total.protein / rawTotalGrams) * 100,
        fat: (total.fat / rawTotalGrams) * 100,
        carbs: (total.carbs / rawTotalGrams) * 100,
      }
    : { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  const result: AiEstimateResult = {
    items: newItems,
    unrecognized,
    total,
    totalGrams: totalWeightG,
    rawTotalGrams,
    per100,
    rawPer100,
    calculationId: null, // we lose calculation_id because it is unsaved local recalculation
  };

  result.rawApiResponse = buildApiResponseFromEstimate(result);

  return result;
}

function buildApiResponseFromEstimate(result: AiEstimateResult): CalculateDishApiResponse {
  const apiItems: CalculateDishApiItem[] = result.items.map(it => {
    return {
      product_id: it.productId,
      name_en: it.nameEn,
      name_pl: it.namePl,
      product_name: it.nameEn, // Fallback/compatibility
      cooking_method_slug: it.method,
      raw_weight_g: it.rawGrams,
      cooked_weight_g: it.grams,
      yield_factor_used: it.rawGrams > 0 ? it.grams / it.rawGrams : 1.0,
      yield_source: it.yieldSource || "db",
      matched_confidence: 1.0, // pseudo
      macros: {
        calories_kcal: it.macros.kcal,
        protein_g: it.macros.protein,
        fat_g: it.macros.fat,
        carbs_g: it.macros.carbs,
      },
      nutrition_source: it.nutritionSource,
    };
  });

  return {
    calculation_id: result.calculationId,
    total_weight_g: result.totalGrams,
    total: {
      calories_kcal: result.total.kcal,
      protein_g: result.total.protein,
      fat_g: result.total.fat,
      carbs_g: result.total.carbs,
    },
    per_100g: {
      calories_kcal: result.per100.kcal,
      protein_g: result.per100.protein,
      fat_g: result.per100.fat,
      carbs_g: result.per100.carbs,
    },
    items: apiItems,
    warnings: result.unrecognized.length > 0 ? result.unrecognized.map(u => ({
      ingredient: u,
      issue: "unrecognized" as const,
    })) : null,
  };
}
