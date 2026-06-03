import type { MatchedIngredient, MacroTotals } from "../types.ts";

export class MacroCalculatorService {
  aggregate(items: MatchedIngredient[]): { total_weight_g: number; total: MacroTotals; per_100g: MacroTotals } {
    let totalWeightG = 0;
    const total: MacroTotals = {
      calories_kcal: 0,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
    };

    for (const item of items) {
      totalWeightG += item.cooked_weight_g;
      total.calories_kcal += item.macros.calories_kcal;
      total.protein_g += item.macros.protein_g;
      total.fat_g += item.macros.fat_g;
      total.carbs_g += item.macros.carbs_g;
    }

    const per100g: MacroTotals = {
      calories_kcal: 0,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
    };

    if (totalWeightG > 0) {
      const k = 100 / totalWeightG;
      per100g.calories_kcal = total.calories_kcal * k;
      per100g.protein_g = total.protein_g * k;
      per100g.fat_g = total.fat_g * k;
      per100g.carbs_g = total.carbs_g * k;
    }

    return {
      total_weight_g: totalWeightG,
      total,
      per_100g: per100g,
    };
  }
}
