import type { ParsedDish, LlmIngredientRaw, LlmDishContext } from "../types.ts";
import { normalizeCookingMethodSlug } from "./normalize-cooking-method.ts";

export function parseLlmDishResponse(raw: unknown): ParsedDish | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  
  // Extract context
  let dish_context: LlmDishContext | null = null;
  if (record.dish_context && typeof record.dish_context === "object") {
    const ctx = record.dish_context as Record<string, unknown>;
    const defaultMethod = ctx.default_cooking_method ?? ctx.defaultCookingMethod;
    dish_context = {
      default_cooking_method: defaultMethod ? normalizeCookingMethodSlug(defaultMethod) : undefined,
      preparation: typeof ctx.preparation === "string" ? ctx.preparation : undefined,
    };
  }

  // Extract ingredients array
  let arrayToParse: unknown;
  if (Array.isArray(raw)) {
    arrayToParse = raw;
  } else if (Array.isArray(record.ingredients)) {
    arrayToParse = record.ingredients;
  } else {
    const firstValue = Object.values(record)[0];
    if (Array.isArray(firstValue)) {
      arrayToParse = firstValue;
    }
  }

  if (!Array.isArray(arrayToParse)) {
    return null;
  }

  const ingredients: LlmIngredientRaw[] = [];

  for (const item of arrayToParse) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;

    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name) continue;

    let weight_g = 0;
    if (typeof rec.weight_g === "number") {
      weight_g = rec.weight_g;
    } else if (typeof rec.weight_g === "string") {
      weight_g = parseFloat(rec.weight_g);
    }

    if (isNaN(weight_g) || weight_g <= 0) continue;

    const ingredient: LlmIngredientRaw = {
      name,
      weight_g,
    };

    if (typeof rec.display_name === "string") ingredient.display_name = rec.display_name;
    if (typeof rec.name_pl === "string") ingredient.name_pl = rec.name_pl;
    if (Array.isArray(rec.search_aliases)) {
      ingredient.search_aliases = rec.search_aliases.filter((a) => typeof a === "string");
    }

    if (typeof rec.requires_thermal_processing === "boolean") {
      ingredient.requires_thermal_processing = rec.requires_thermal_processing;
    }

    const method = rec.cooking_method ?? rec.cookingMethod ?? rec.method;
    if (typeof method === "string") {
      ingredient.cooking_method = method;
    }

    if (typeof rec.cooked_weight_g === "number") ingredient.cooked_weight_g = rec.cooked_weight_g;
    else if (typeof rec.cooked_weight_g === "string") ingredient.cooked_weight_g = parseFloat(rec.cooked_weight_g);

    if (rec.external_nutrition_per_100g && typeof rec.external_nutrition_per_100g === "object") {
      const ext = rec.external_nutrition_per_100g as Record<string, unknown>;
      const cal = Number(ext.calories_kcal);
      const pro = Number(ext.protein_g);
      const fat = Number(ext.fat_g);
      const car = Number(ext.carbs_g);
      if (!isNaN(cal) && !isNaN(pro) && !isNaN(fat) && !isNaN(car)) {
        ingredient.external_nutrition_per_100g = {
          calories_kcal: Math.max(0, cal),
          protein_g: Math.max(0, pro),
          fat_g: Math.max(0, fat),
          carbs_g: Math.max(0, car),
        };
      }
    }

    if (typeof rec.nutrition_source === "string") ingredient.nutrition_source = rec.nutrition_source;

    ingredients.push(ingredient);
  }

  if (ingredients.length === 0) {
    return null;
  }

  return {
    dish_context,
    ingredients,
  };
}
