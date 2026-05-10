// Canonical foods (raw, per 100g) — names in English; UI translates if needed.
// Macros are illustrative MVP values inspired by USDA. Replace with sourced data in production.

export type Method = "boiling" | "frying" | "baking";

export type Food = {
  id: string;
  name: string; // canonical EN
  pl: string;
  category: string;
  // per 100g raw
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  // yield factor: cooked weight / raw weight, per method
  yields: Record<Method, number>;
};

export const FOODS: Food[] = [
  {
    id: "chicken-breast",
    name: "Chicken breast",
    pl: "Pierś z kurczaka",
    category: "Meat",
    kcal: 120,
    protein: 22.5,
    fat: 2.6,
    carbs: 0,
    yields: { boiling: 0.72, frying: 0.71, baking: 0.75 },
  },
  {
    id: "beef-mince",
    name: "Beef mince (lean)",
    pl: "Mięso mielone wołowe",
    category: "Meat",
    kcal: 187,
    protein: 19.4,
    fat: 12,
    carbs: 0,
    yields: { boiling: 0.73, frying: 0.72, baking: 0.76 },
  },
  {
    id: "salmon",
    name: "Salmon fillet",
    pl: "Filet z łososia",
    category: "Fish",
    kcal: 208,
    protein: 20.4,
    fat: 13.4,
    carbs: 0,
    yields: { boiling: 0.84, frying: 0.81, baking: 0.78 },
  },
  {
    id: "white-rice",
    name: "White rice",
    pl: "Ryż biały",
    category: "Grains",
    kcal: 360,
    protein: 6.6,
    fat: 0.6,
    carbs: 79,
    yields: { boiling: 2.7, frying: 2.5, baking: 2.6 },
  },
  {
    id: "pasta",
    name: "Pasta (dry)",
    pl: "Makaron",
    category: "Grains",
    kcal: 371,
    protein: 13,
    fat: 1.5,
    carbs: 75,
    yields: { boiling: 2.4, frying: 2.3, baking: 2.4 },
  },
  {
    id: "potato",
    name: "Potato",
    pl: "Ziemniaki",
    category: "Vegetables",
    kcal: 77,
    protein: 2,
    fat: 0.1,
    carbs: 17,
    yields: { boiling: 0.95, frying: 0.6, baking: 0.78 },
  },
  {
    id: "broccoli",
    name: "Broccoli",
    pl: "Brokuł",
    category: "Vegetables",
    kcal: 34,
    protein: 2.8,
    fat: 0.4,
    carbs: 7,
    yields: { boiling: 0.88, frying: 0.7, baking: 0.75 },
  },
  {
    id: "lentils",
    name: "Lentils (dry)",
    pl: "Soczewica",
    category: "Legumes",
    kcal: 352,
    protein: 25,
    fat: 1,
    carbs: 63,
    yields: { boiling: 2.5, frying: 2.4, baking: 2.3 },
  },
  {
    id: "egg",
    name: "Egg",
    pl: "Jajko",
    category: "Dairy & eggs",
    kcal: 143,
    protein: 12.6,
    fat: 9.5,
    carbs: 0.7,
    yields: { boiling: 1.0, frying: 0.92, baking: 0.95 },
  },
  {
    id: "tofu",
    name: "Tofu",
    pl: "Tofu",
    category: "Legumes",
    kcal: 144,
    protein: 17,
    fat: 8.7,
    carbs: 2.8,
    yields: { boiling: 0.95, frying: 0.78, baking: 0.85 },
  },
];

export const METHOD_LABEL: Record<Method, { pl: string; en: string }> = {
  boiling: { pl: "Gotowanie", en: "Boiling" },
  frying: { pl: "Smażenie", en: "Frying" },
  baking: { pl: "Pieczenie", en: "Baking" },
};

export type Macros = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export function macrosForGrams(food: Food, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: food.kcal * k,
    protein: food.protein * k,
    fat: food.fat * k,
    carbs: food.carbs * k,
  };
}

export function r1(n: number) {
  return Math.round(n * 10) / 10;
}
