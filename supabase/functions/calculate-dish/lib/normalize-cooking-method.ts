export type CookingMethodSlug = "boiling" | "frying" | "baking" | "none";

export function normalizeCookingMethodSlug(method: unknown): CookingMethodSlug {
  if (typeof method !== "string") {
    return "boiling";
  }

  const normalized = method.toLowerCase().trim();

  if (["none", "raw", "surowy", "bez obróbki"].includes(normalized)) {
    return "none";
  }

  if (["fried", "sauteed", "pan-fried", "pan-frying", "frying"].includes(normalized)) {
    return "frying";
  }

  if (["roasted", "grilled", "baked", "roasting", "grilling", "baking"].includes(normalized)) {
    return "baking";
  }

  // "steamed", "simmered", "poached", "cooking", "cooked", "raw", "none", "generic", "boiling"
  // and any other unknown value defaults to "boiling"
  return "boiling";
}

