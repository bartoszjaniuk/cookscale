import { assertEquals } from "jsr:@std/assert";
import { ProductMatcherService } from "../services/product-matcher.service.ts";
import type { LlmIngredient } from "../types.ts";

Deno.test("ProductMatcherService - returns unrecognized for completely unmatched ingredient", async () => {
  const service = new ProductMatcherService();

  // Mock the supabase client
  const mockSupabase = {
    rpc: () => Promise.resolve({ data: [] }),
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: "PGRST116" } }) }),
        }),
      }),
    }),
  };
  (service as any).supabase = mockSupabase;

  const ingredient: LlmIngredient = {
    name: "Unknown Exotic Berry",
    weight_g: 100,
    cooking_method: "none",
  };

  const result = await service.matchIngredient(ingredient, "en");

  assertEquals(result.match, undefined);
  assertEquals(result.warning?.issue, "unrecognized");
});

Deno.test("ProductMatcherService - pre-match validation rejects obvious name mismatch for small weights", async () => {
  const service = new ProductMatcherService();

  const ingredient: LlmIngredient = {
    name: "Salmon", // Main protein
    display_name: "Worcestershire", // Wildly different
    weight_g: 5, // Very small weight
    cooking_method: "none",
  };

  const result = await service.matchIngredient(ingredient, "en");

  assertEquals(result.match, undefined);
  assertEquals(result.warning?.issue, "name_mismatch");
  assertEquals(result.warning?.ingredient, "Worcestershire");
});

Deno.test("ProductMatcherService - accepts low confidence if external nutrition provided", async () => {
  const service = new ProductMatcherService();

  const mockSupabase = {
    rpc: () => Promise.resolve({
      data: [{ id: "1", name_en: "DB Match", matched_confidence: 0.3 }] // low confidence (0.25 - 0.4)
    }),
  };
  (service as any).supabase = mockSupabase;

  const ingredient: LlmIngredient = {
    name: "Special Sauce",
    weight_g: 50,
    cooking_method: "none",
    external_nutrition_per_100g: {
      calories_kcal: 100,
      protein_g: 2,
      fat_g: 5,
      carbs_g: 10,
    },
    nutrition_source: "OpenFoodFacts",
  };

  const result = await service.matchIngredient(ingredient, "en");

  // Should use external nutrition
  assertEquals(result.match?.yield_source, "external");
  assertEquals(result.match?.name_en, "Special Sauce");
  assertEquals(result.warning?.issue, "low_confidence");
  assertEquals(result.warning?.nutrition_source, "OpenFoodFacts");
});

Deno.test("ProductMatcherService - warns on medium confidence", async () => {
  const service = new ProductMatcherService();

  const mockSupabase = {
    rpc: () => Promise.resolve({
      data: [{ id: "1", name_en: "Wheat Flour", calories_kcal: 300, matched_confidence: 0.5 }] // medium confidence (0.4 - 0.75)
    }),
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: { yield_factor: 1 }, error: null }) }),
        }),
      }),
    }),
  };
  (service as any).supabase = mockSupabase;

  const ingredient: LlmIngredient = {
    name: "Wheat",
    display_name: "Mąka pszenna",
    weight_g: 100,
    cooking_method: "none",
  };

  const result = await service.matchIngredient(ingredient, "en");

  assertEquals(result.match?.name_en, "Wheat Flour");
  assertEquals(result.warning?.issue, "medium_confidence");
});

Deno.test("ProductMatcherService - accepts high confidence without warning", async () => {
  const service = new ProductMatcherService();

  const mockSupabase = {
    rpc: () => Promise.resolve({
      data: [{ id: "1", name_en: "Milk 2% Fat", calories_kcal: 50, matched_confidence: 0.95 }] // high confidence (> 0.75)
    }),
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: { yield_factor: 1 }, error: null }) }),
        }),
      }),
    }),
  };
  (service as any).supabase = mockSupabase;

  const ingredient: LlmIngredient = {
    name: "Milk 2% Fat",
    display_name: "Mleko 2%",
    weight_g: 240,
    cooking_method: "none",
  };

  const result = await service.matchIngredient(ingredient, "en");

  assertEquals(result.match?.name_en, "Milk 2% Fat");
  assertEquals(result.warning, undefined);
});
