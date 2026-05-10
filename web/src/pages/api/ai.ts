import type { APIRoute } from "astro";
import { FOODS, macrosForGrams, type Method } from "@/lib/cookscale-data";
import { z } from "zod";

const RequestSchema = z.object({
  text: z.string().min(1).max(200),
});

type IngredientItem = {
  name: string;
  grams: number;
  method: Method | null;
  macros: { kcal: number; protein: number; fat: number; carbs: number };
};

type EstimateResult = {
  items: IngredientItem[];
  unrecognized: string[];
  total: { kcal: number; protein: number; fat: number; carbs: number };
  totalGrams: number;
  per100: { kcal: number; protein: number; fat: number; carbs: number };
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Nieprawidłowe dane wejściowe." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { text } = parsed.data;
  const openrouterKey = import.meta.env.OPENROUTER_API_KEY as
    | string
    | undefined;

  // Use LLM if key is present, otherwise fall back to local heuristic parser.
  const result = openrouterKey
    ? await estimateWithLLM(text, openrouterKey)
    : estimateLocally(text);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// ---------------------------------------------------------------------------
// Local heuristic parser (no LLM key required — POC / fallback)
// ---------------------------------------------------------------------------
function estimateLocally(input: string): EstimateResult {
  const text = input.toLowerCase();
  const items: IngredientItem[] = [];
  const unrecognized: string[] = [];

  const parts = text
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    const gramsMatch = part.match(/(\d+(?:[.,]\d+)?)\s*g/);
    const tbspMatch = !gramsMatch && /łyżka|łyżk/.test(part);
    const grams = gramsMatch
      ? Number(gramsMatch[1].replace(",", "."))
      : tbspMatch
        ? 12
        : 0;

    const method: Method | null = /piecz|pieczone/.test(part)
      ? "baking"
      : /smaż|smażone/.test(part)
        ? "frying"
        : /gotow/.test(part)
          ? "boiling"
          : null;

    const food = FOODS.find(
      (f) =>
        part.includes(f.pl.toLowerCase()) ||
        part.includes(f.name.toLowerCase()),
    );

    if (!food || grams <= 0) {
      const label = part.replace(/\d+\s*g/, "").trim();
      if (label) unrecognized.push(label);
      continue;
    }

    const cookedGrams = method ? grams * food.yields[method] : grams;
    items.push({
      name: food.pl,
      grams: Math.round(cookedGrams),
      method,
      macros: macrosForGrams(food, grams),
    });
  }

  // Oil heuristic
  if (/oliw|olej/.test(text) && !items.find((i) => /oliw|olej/i.test(i.name))) {
    const g = /łyżka|łyżk/.test(text) ? 12 : 10;
    items.push({
      name: "Oliwa",
      grams: g,
      method: null,
      macros: { kcal: 9 * g, protein: 0, fat: g, carbs: 0 },
    });
  }

  return aggregateItems(items, unrecognized);
}

// ---------------------------------------------------------------------------
// LLM-based estimation via Openrouter.ai
// ---------------------------------------------------------------------------
async function estimateWithLLM(
  input: string,
  apiKey: string,
): Promise<EstimateResult> {
  const foodList = FOODS.map((f) => `${f.id}: ${f.pl} / ${f.name}`).join("\n");

  const systemPrompt = `Jesteś asystentem do analizy składników dań. Twoim zadaniem jest parsowanie tekstu i zwrócenie JSON.
Dostępne produkty z bazy (id: nazwa_pl / name_en):
${foodList}

Zwróć TYLKO obiekt JSON (bez markdown) w formacie:
{
  "items": [{ "foodId": "string", "grams": number, "method": "boiling"|"frying"|"baking"|null }],
  "unrecognized": ["string"]
}
Gdzie grams to gramatura SUROWEGO produktu wpisana przez użytkownika.`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cookscale.app",
        "X-Title": "CookScale",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
        temperature: 0.1,
        max_tokens: 512,
      }),
    },
  );

  if (!response.ok) {
    // Graceful fallback to local parser on LLM error
    return estimateLocally(input);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = json.choices?.[0]?.message?.content ?? "";

  let parsed: {
    items: { foodId: string; grams: number; method: Method | null }[];
    unrecognized: string[];
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    return estimateLocally(input);
  }

  const items: IngredientItem[] = [];
  const unrecognized: string[] = parsed.unrecognized ?? [];

  for (const item of parsed.items ?? []) {
    const food = FOODS.find((f) => f.id === item.foodId);
    if (!food || item.grams <= 0) continue;

    const cookedGrams = item.method
      ? item.grams * food.yields[item.method]
      : item.grams;
    items.push({
      name: food.pl,
      grams: Math.round(cookedGrams),
      method: item.method,
      macros: macrosForGrams(food, item.grams),
    });
  }

  return aggregateItems(items, unrecognized);
}

// ---------------------------------------------------------------------------
// Shared aggregation logic
// ---------------------------------------------------------------------------
function aggregateItems(
  items: IngredientItem[],
  unrecognized: string[],
): EstimateResult {
  const total = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.macros.kcal,
      protein: acc.protein + item.macros.protein,
      fat: acc.fat + item.macros.fat,
      carbs: acc.carbs + item.macros.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const totalGrams = items.reduce((acc, item) => acc + item.grams, 0);

  const per100 =
    totalGrams > 0
      ? {
          kcal: (total.kcal / totalGrams) * 100,
          protein: (total.protein / totalGrams) * 100,
          fat: (total.fat / totalGrams) * 100,
          carbs: (total.carbs / totalGrams) * 100,
        }
      : { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  return { items, unrecognized, total, totalGrams, per100 };
}
