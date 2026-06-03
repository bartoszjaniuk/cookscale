import type { LlmIngredient, ParsedDish } from "../types.ts";
import { normalizeCookingMethodSlug, type CookingMethodSlug } from "../lib/normalize-cooking-method.ts";

export class CookingMethodResolverService {
  resolve(parsedDish: ParsedDish): LlmIngredient[] {
    const defaultMethod = parsedDish.dish_context?.default_cooking_method;

    return parsedDish.ingredients.map((raw) => {
      let finalMethod: CookingMethodSlug | null = null;

      if (raw.requires_thermal_processing === false) {
        finalMethod = "none";
      } else if (raw.cooking_method) {
        finalMethod = normalizeCookingMethodSlug(raw.cooking_method);
      } else if (defaultMethod) {
        finalMethod = defaultMethod;
      }

      return {
        ...raw,
        cooking_method: finalMethod,
      };
    });
  }
}
