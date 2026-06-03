import { assertEquals } from "jsr:@std/assert@0.224.0";
import { MacroCalculatorService } from "../services/macro-calculator.service.ts";
import type { MatchedIngredient } from "../types.ts";

Deno.test("MacroCalculatorService - aggregate", () => {
  const service = new MacroCalculatorService();

  const items: MatchedIngredient[] = [
    {
      product_id: "1",
      name_en: "Chicken",
      name_pl: "Kurczak",
      product_name: "Chicken",
      cooking_method_slug: "boiling",
      raw_weight_g: 200,
      cooked_weight_g: 150,
      yield_factor_used: 0.75,
      yield_source: "db",
      matched_confidence: 0.9,
      macros: {
        calories_kcal: 220,
        protein_g: 41,
        fat_g: 4.8,
        carbs_g: 0,
      },
    },
    {
      product_id: "2",
      name_en: "Potato",
      name_pl: "Ziemniak",
      product_name: "Potato",
      cooking_method_slug: "boiling",
      raw_weight_g: 300,
      cooked_weight_g: 300,
      yield_factor_used: 1.0,
      yield_source: "db",
      matched_confidence: 0.9,
      macros: {
        calories_kcal: 231,
        protein_g: 6,
        fat_g: 0.3,
        carbs_g: 53,
      },
    },
  ];

  const result = service.aggregate(items);

  assertEquals(result.total_weight_g, 450);
  assertEquals(result.total.calories_kcal, 451);
  assertEquals(result.total.protein_g, 47);
  assertEquals(result.total.fat_g, 5.1);
  assertEquals(result.total.carbs_g, 53);

  // per 100g = total / 4.5
  assertEquals(Math.round(result.per_100g.calories_kcal), 100);
  assertEquals(Math.round(result.per_100g.protein_g), 10);
});
