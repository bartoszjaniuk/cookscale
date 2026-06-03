import { assertEquals } from "jsr:@std/assert";
import { parseLlmDishResponse } from "../lib/parse-llm-dish-response.ts";

Deno.test("parseLlmDishResponse - valid JSON with dish_context", () => {
  const input = {
    dish_context: {
      default_cooking_method: "baking",
      preparation: "pieczone w piekarniku",
    },
    ingredients: [
      { name: "potato", weight_g: 100 },
      { name: "chicken", cooking_method: "frying", weight_g: 200 },
      { name: "beef", cookingMethod: "roasted", weight_g: 300 },
      { name: "olive oil", weight_g: 10, requires_thermal_processing: false },
    ],
  };

  const result = parseLlmDishResponse(input);

  assertEquals(result?.dish_context?.default_cooking_method, "baking");
  assertEquals(result?.dish_context?.preparation, "pieczone w piekarniku");
  assertEquals(result?.ingredients.length, 4);
  assertEquals(result?.ingredients[0].cooking_method, undefined);
  assertEquals(result?.ingredients[1].cooking_method, "frying");
  assertEquals(result?.ingredients[2].cooking_method, "roasted");
  assertEquals(result?.ingredients[3].requires_thermal_processing, false);
});

Deno.test("parseLlmDishResponse - handles missing dish_context", () => {
  const input = {
    ingredients: [
      { name: "potato", weight_g: 100 },
    ],
  };

  const result = parseLlmDishResponse(input);

  assertEquals(result?.dish_context, null);
  assertEquals(result?.ingredients.length, 1);
});

Deno.test("parseLlmDishResponse - handles invalid ingredients", () => {
  const input = {
    ingredients: [
      { name: "potato", weight_g: -10 }, // invalid weight
      { name: "", weight_g: 100 }, // invalid name
      { name: "chicken", weight_g: "200" }, // string weight
      null,
      "not an object",
    ],
  };

  const result = parseLlmDishResponse(input);

  assertEquals(result?.ingredients.length, 1);
  assertEquals(result?.ingredients[0].name, "chicken");
  assertEquals(result?.ingredients[0].weight_g, 200);
});

Deno.test("parseLlmDishResponse - returns null for empty or invalid root", () => {
  assertEquals(parseLlmDishResponse(null), null);
  assertEquals(parseLlmDishResponse("string"), null);
  assertEquals(parseLlmDishResponse({ ingredients: [] }), null);
  assertEquals(parseLlmDishResponse({ dish_context: {} }), null);
});
