import { assertEquals } from "jsr:@std/assert";
import { CookingMethodResolverService } from "../services/cooking-method-resolver.service.ts";
import type { ParsedDish } from "../types.ts";

Deno.test("CookingMethodResolverService - resolves methods correctly", () => {
  const resolver = new CookingMethodResolverService();

  const parsedDish: ParsedDish = {
    dish_context: {
      default_cooking_method: "baking",
    },
    ingredients: [
      { name: "potato", weight_g: 100 }, // should use default
      { name: "chicken", cooking_method: "frying", weight_g: 200 }, // override
      { name: "beef", cooking_method: "roasted", weight_g: 300 }, // override and normalize
      { name: "salmon", cooking_method: "unknown", weight_g: 150 }, // override and normalize to boiling
      { name: "olive oil", requires_thermal_processing: false, weight_g: 15 }, // no thermal
    ],
  };

  const result = resolver.resolve(parsedDish);

  assertEquals(result.length, 5);
  assertEquals(result[0].cooking_method, "baking");
  assertEquals(result[1].cooking_method, "frying");
  assertEquals(result[2].cooking_method, "baking");
  assertEquals(result[3].cooking_method, "boiling");
  assertEquals(result[4].cooking_method, "none");
});

Deno.test("CookingMethodResolverService - falls back to null if no context", () => {
  const resolver = new CookingMethodResolverService();

  const parsedDish: ParsedDish = {
    dish_context: null,
    ingredients: [
      { name: "potato", weight_g: 100 },
    ],
  };

  const result = resolver.resolve(parsedDish);

  assertEquals(result.length, 1);
  assertEquals(result[0].cooking_method, null);
});
