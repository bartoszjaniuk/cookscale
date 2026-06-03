import { assertEquals } from "@std/assert";
import { round1, roundMacros, roundCalculateDishResponse } from "../lib/round-macros.ts";

Deno.test("round1 rounds to one decimal", () => {
  assertEquals(round1(86.75505617977528), 86.8);
  assertEquals(round1(7.709999999999999), 7.7);
});

Deno.test("roundCalculateDishResponse rounds response fields", () => {
  const result = roundCalculateDishResponse({
    calculation_id: null,
    total_weight_g: 445.2,
    total: {
      calories_kcal: 386.06,
      protein_g: 52.77,
      fat_g: 4.16,
      carbs_g: 37.32,
    },
    per_100g: {
      calories_kcal: 86.75505617977528,
      protein_g: 11.858426966292136,
      fat_g: 0.9348314606741573,
      carbs_g: 8.386516853932584,
    },
    items: [
      {
        product_id: "1",
        name_en: "Chicken",
        name_pl: "Kurczak",
        product_name: "Chicken",
        cooking_method_slug: "baking",
        raw_weight_g: 200.4,
        cooked_weight_g: 154.2,
        yield_factor_used: 0.77,
        yield_source: "db",
        matched_confidence: 0.999,
        macros: {
          calories_kcal: 212.06,
          protein_g: 45.06,
          fat_g: 3.86,
          carbs_g: 0,
        },
      },
    ],
    warnings: null,
  });

  assertEquals(result.total_weight_g, 445);
  assertEquals(result.per_100g.calories_kcal, 86.8);
  assertEquals(result.items[0].cooked_weight_g, 154);
  assertEquals(result.items[0].matched_confidence, 1);
});
