import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FOODS, macrosForGrams, r1, type Method } from "@/lib/cookscale-data";

const MAX = 800;

export type TranslationFunction = TFunction;
export type TranslationKey = Parameters<TranslationFunction>[0];

type EstimateResult = ReturnType<typeof mockEstimate>;

export function AiCalculator() {
  const { t } = useTranslation();
  const [text, setText] = useState(
    "makaron 200g gotowany, mięso mielone 150g smażone, przecier pomidorowy 100g, oliwa łyżka",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portions, setPortions] = useState<number>(1);

  const left = MAX - text.length;
  const counterColor =
    left < 50
      ? "var(--color-destructive)"
      : left < 100
        ? "var(--color-warning)"
        : "var(--color-muted-foreground)";

  const examples = [
    "makaron 200g gotowany, mięso mielone 150g smażone, przecier pomidorowy 100g",
    "ryż 180g gotowany, pierś z kurczaka 160g smażona, oliwa łyżka",
    "ziemniaki 250g gotowane, masło 10g, jogurt 50g",
  ] as const;

  const submit = async () => {
    // Normalizacja inputu: collapse whitespace & trim
    const normalizedText = text.replace(/\s+/g, " ").trim();

    if (normalizedText.length === 0 || normalizedText.length > MAX) {
      if (normalizedText.length === 0) {
        setError(
          t(
            "AI.EMPTY_INPUT",
            "Wpisz składniki (np. wybierz przykład poniżej).",
          ),
        );
      }
      if (normalizedText.length > MAX) {
        setError(t("AI.CHAR_LIMIT_EXCEEDED", { max: MAX }));
      }
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setPortions(1);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Na razie mock data, wywołujemy API ale możemy używać mockEstimate
        body: JSON.stringify({ text: normalizedText }),
      });

      console.log("API response", res);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? t("ERRORS.GENERIC"));
        return;
      }

      const data = (await res.json()) as EstimateResult;
      setResult(data);
    } catch {
      setError(t("ERRORS.NO_CONNECTION"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 md:mt-10 card-soft p-5 md:p-8">
        <div className="flex flex-col gap-3 mb-4">
          <p className="text-[14px] leading-relaxed text-(--color-muted-foreground)">
            {t(
              "AI.INSTRUCTIONS",
              "Wpisz składniki z ilością i obróbką (gotowane/smażone/pieczone). Oddzielaj przecinkami lub nową linią.",
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, idx) => (
              <button
                key={ex}
                type="button"
                className="pill-tab"
                onClick={() => setText(ex)}
              >
                {`${t("AI.EXAMPLE")} ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
        <textarea
          rows={5}
          maxLength={MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("AI.PLACEHOLDER")}
          className="w-full text-[16px] leading-relaxed bg-transparent outline-none resize-none border-b border-(--color-border) focus:border-(--color-primary) pb-3"
        />
        <div className="flex items-center justify-between mt-4 gap-3">
          <span
            className="text-[13px] shrink-0"
            style={{ color: counterColor }}
          >
            {t("AI.CHAR_LEFT", "Pozostało")}: {left}/{MAX}
          </span>
          <button
            onClick={submit}
            disabled={loading || text.length === 0}
            className="btn-primary disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? t("AI.LOADING_BUTTON") : t("AI.SUBMIT")}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mt-6 rounded-2xl px-5 py-4 text-[14px]"
          style={{
            background: "var(--color-destructive)",
            color: "var(--color-destructive-foreground)",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div className="mt-10 grid md:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="card-soft p-6 sm:p-8">
              {/* Top Section: Weight comparison */}
              <div>
                <p className="text-[13px] uppercase tracking-widest text-(--color-muted-foreground) mb-6">
                  {t("AI.AFTER_COOKING", "Po obróbce otrzymasz")}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="m-0 block p-0 text-[12px] tracking-wide leading-none font-medium text-(--color-muted-foreground)">
                      {t("AI.RAW", "Surowe")}
                    </p>
                    <p className="m-0 block p-0 font-serif text-[48px] sm:text-[52px] md:text-[56px] leading-none text-(--color-foreground)">
                      {r1(result.rawTotalGrams)} g
                    </p>
                    <p className="text-[12px] text-(--color-muted-foreground) mt-1">
                      suma składników
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full border border-(--color-border) flex items-center justify-center shrink-0 shadow-sm mx-4 bg-transparent">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-(--color-muted-foreground)"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>

                  <div className="text-right">
                    <p className="m-0 block p-0 text-[12px] tracking-wide leading-none font-medium text-(--color-muted-foreground)">
                      {t("AI.COOKED", "Po obróbce")}
                    </p>
                    <p className="m-0 block p-0 font-serif text-[48px] sm:text-[52px] md:text-[56px] leading-none text-(--color-primary)">
                      {r1(result.totalGrams)} g
                    </p>
                    <p className="text-[13px] font-medium text-(--color-primary) mt-1">
                      {result.totalGrams - result.rawTotalGrams > 0 ? "+" : ""}
                      {r1(result.totalGrams - result.rawTotalGrams)} g •{" "}
                      {r1(
                        ((result.totalGrams - result.rawTotalGrams) /
                          result.rawTotalGrams) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-t border-(--color-border)" />

              {/* Całe danie / Na 1 porcję */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-[12px] uppercase tracking-widest font-semibold text-(--color-foreground)">
                    {t("AI.VALUES_FOR", "Wartości dla")} (
                    {r1(result.totalGrams / portions)} g)
                  </p>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-(--color-secondary) text-(--color-secondary-foreground) font-medium">
                    {portions > 1
                      ? t("AI.ONE_PORTION", "1 porcja")
                      : t("AI.FULL_MEAL_BADGE", "Całe danie")}
                  </span>
                </div>
                <MacroTiles
                  kcal={result.total.kcal / portions}
                  protein={result.total.protein / portions}
                  fat={result.total.fat / portions}
                  carbs={result.total.carbs / portions}
                />
              </div>

              <hr className="my-8 border-t border-(--color-border)" />

              {/* Portions */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-[15px] text-(--color-foreground)">
                  {t("AI.PORTIONS_LABEL", "Podział na porcje")}
                </span>
                <input
                  type="number"
                  min={1}
                  value={portions || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setPortions(!isNaN(val) && val > 0 ? val : 1);
                  }}
                  className="px-4 py-2 border border-(--color-border) rounded-2xl w-24 text-center bg-transparent focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) outline-none transition-all"
                />
              </div>
            </div>

            {/* Educational tip matching the dark theme if appropriate */}
            <div
              className="card-soft p-6 rounded-2xl flex gap-5 items-start border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-primary-muted)",
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full shrink-0"
                style={{
                  background: "var(--color-announcement)",
                  color: "var(--color-primary)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
                </svg>
              </div>
              <div className="text-(--color-foreground)">
                <h4 className="font-semibold text-[15px]">
                  Co się stało z wagą?
                </h4>
                <p className="text-[14px] leading-relaxed mt-1 opacity-80">
                  Podczas obróbki termicznej, struktura i woda w produktach
                  zmieniają się, dlatego całe danie zmienia swoją wagę końcową.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="card-soft p-6 sm:p-8">
              <p className="text-[12px] uppercase tracking-widest font-semibold text-(--color-foreground) mb-4">
                {t("AI.FOR_100G", "Dla 100 g")}
              </p>
              <MacroTiles
                kcal={result.per100.kcal}
                protein={result.per100.protein}
                fat={result.per100.fat}
                carbs={result.per100.carbs}
              />
            </div>

            <div className="card-soft p-6 sm:p-8">
              <h4 className="font-medium text-[15px] mb-4 text-(--color-foreground)">
                {t("AI.RECOGNIZED_ITEMS", "Rozpoznane składniki")}
              </h4>
              <ul className="flex flex-col">
                {result.items.map((it, i) => {
                  const diff = it.grams - it.rawGrams;
                  const diffText =
                    diff > 0 ? `+${diff} g` : diff < 0 ? `${diff} g` : `0 g`;
                  const diffColor =
                    diff !== 0
                      ? "text-(--color-primary)"
                      : "text-(--color-foreground)";

                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between py-4 border-b border-(--color-border) last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-medium text-(--color-foreground)">
                            {it.name}
                          </span>
                          {import.meta.env.DEV && it.source === "USDA" && (
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                              USDA
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] mt-1 text-(--color-muted-foreground)">
                          {it.rawGrams} g · {getMethodLabel(t, it.method)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6">
                        <span
                          className={`text-[13px] font-medium ${diffColor} text-right w-12`}
                        >
                          {diffText}
                        </span>
                        <span className="text-[15px] font-medium text-(--color-foreground) text-right w-16 whitespace-nowrap">
                          {r1(it.macros.kcal)} kcal
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {result.unrecognized.length > 0 && (
                <div
                  className="mt-4 rounded-2xl px-5 py-4 text-[14px]"
                  style={{ background: "var(--color-announcement)" }}
                >
                  {t("AI.UNRECOGNIZED_PREFIX")}{" "}
                  <strong>{result.unrecognized.join(", ")}</strong>.{" "}
                  {t("AI.PARTIAL_RESULT")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MacroTile({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border flex flex-col ${
        highlight
          ? "border-primary/30 bg-(--color-primary-muted)"
          : "border-(--color-border) bg-white"
      } p-3.5`}
    >
      <span className="text-[12px] uppercase tracking-wide font-medium leading-tight mb-2 text-(--color-muted-foreground)">
        {label}
      </span>
      <p
        className={`font-bold leading-none text-[22px] ${
          highlight ? "text-(--color-primary)" : "text-(--color-foreground)"
        }`}
      >
        <span className="tabular-nums">{value}</span>
      </p>
      {unit && (
        <p className="text-[12px] mt-1 text-(--color-muted-foreground)">
          {unit}
        </p>
      )}
    </div>
  );
}

function MacroTiles({
  kcal,
  protein,
  fat,
  carbs,
}: {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <MacroTile
        label={t("RESULTS.CALORIES", "Kalorie")}
        value={r1(kcal)}
        unit="kcal"
        highlight
      />
      <MacroTile
        label={t("RESULTS.PROTEIN", "Białko")}
        value={r1(protein)}
        unit="g"
      />
      <MacroTile
        label={t("RESULTS.FAT_PLURAL", "Tłuszcze")}
        value={r1(fat)}
        unit="g"
      />
      <MacroTile
        label={t("RESULTS.CARBS", "Węglowodany")}
        value={r1(carbs)}
        unit="g"
      />
    </div>
  );
}

function getMethodLabel(
  t: TranslationFunction,
  m: Method | null | undefined,
): string {
  if (!m) return t("AI.METHOD_RAW");
  return m === "boiling"
    ? t("AI.METHOD_BOILED")
    : m === "frying"
      ? t("AI.METHOD_FRIED")
      : t("AI.METHOD_BAKED");
}

function methodPL(m: Method) {
  return m === "boiling" ? "gotowane" : m === "frying" ? "smażone" : "pieczone";
}

// Fallback local mock — used only if the API route is unavailable in development.
function mockEstimate(input: string) {
  const text = input.toLowerCase();
  const items: {
    name: string;
    grams: number;
    rawGrams: number;
    method: Method | null;
    macros: { kcal: number; protein: number; fat: number; carbs: number };
    source?: "Lokalna Baza" | "USDA";
  }[] = [];
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
      // MOCK behaviour: if it has 'wołowina' or 'ciecierzyca' act as if USDA retrieved it.
      if (label && /(wołowina|ciecierzyca)/i.test(label) && grams > 0) {
        items.push({
          name: label.charAt(0).toUpperCase() + label.slice(1),
          grams: grams,
          rawGrams: grams,
          method,
          macros: {
            kcal: grams * 2.5,
            protein: grams * 0.2,
            fat: grams * 0.1,
            carbs: 0,
          },
          source: "USDA",
        });
        continue;
      }
      if (label) unrecognized.push(label);
      continue;
    }

    const cookedGrams = method ? grams * food.yields[method] : grams;
    items.push({
      name: food.pl,
      grams: Math.round(cookedGrams),
      rawGrams: grams,
      method,
      macros: macrosForGrams(food, grams),
      source: "Lokalna Baza",
    });
  }

  if (/oliw|olej/.test(text) && !items.find((i) => /oliw|olej/i.test(i.name))) {
    const g = /łyżka|łyżk/.test(text) ? 12 : 10;
    items.push({
      name: "Oliwa",
      grams: g,
      rawGrams: g,
      method: null,
      macros: { kcal: 9 * g, protein: 0, fat: g, carbs: 0 },
    });
  }

  const total = items.reduce(
    (a, b) => ({
      kcal: a.kcal + b.macros.kcal,
      protein: a.protein + b.macros.protein,
      fat: a.fat + b.macros.fat,
      carbs: a.carbs + b.macros.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const totalGrams = items.reduce((a, b) => a + b.grams, 0);
  const rawTotalGrams = items.reduce((a, b) => {
    // Odwracamy wagę używając wydajności z mocka
    if (b.method && b.grams > 0) {
      const food = FOODS.find((f) => f.pl === b.name);
      if (food && food.yields[b.method]) {
        return a + b.grams / food.yields[b.method];
      }
    }
    return a + b.grams;
  }, 0);

  const per100 =
    totalGrams > 0
      ? {
          kcal: (total.kcal / totalGrams) * 100,
          protein: (total.protein / totalGrams) * 100,
          fat: (total.fat / totalGrams) * 100,
          carbs: (total.carbs / totalGrams) * 100,
        }
      : { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  const rawPer100 =
    rawTotalGrams > 0
      ? {
          kcal: (total.kcal / rawTotalGrams) * 100,
          protein: (total.protein / rawTotalGrams) * 100,
          fat: (total.fat / rawTotalGrams) * 100,
          carbs: (total.carbs / rawTotalGrams) * 100,
        }
      : { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  return {
    items,
    unrecognized,
    total,
    totalGrams,
    rawTotalGrams,
    per100,
    rawPer100,
  };
}
