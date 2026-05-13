import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { FOODS, macrosForGrams, r1, type Method } from "@/lib/cookscale-data";

const MAX = 200;

export type TranslationFunction = TFunction;

type EstimateResult = ReturnType<typeof mockEstimate>;

export function AiCalculator() {
  const { t } = useTranslation();
  const [text, setText] = useState(
    "makaron 200g gotowany, mięso mielone 150g smażone, przecier pomidorowy 100g, oliwa łyżka",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const left = MAX - text.length;
  const counterColor =
    left < 20
      ? "var(--color-destructive)"
      : left < 40
        ? "var(--color-warning)"
        : "rgba(0,0,0,0.5)";

  const submit = async () => {
    if (text.trim().length === 0 || text.length > MAX) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

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
            {t("AI.CHAR_COUNT", { current: text.length, max: MAX })}
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
        <div className="mt-10 grid md:grid-cols-2 gap-5 md:gap-6">
          <div className="card-soft p-5 md:p-7">
            <p
              className="text-[12px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("AI.FULL_MEAL")}
            </p>
            <p
              className="font-serif text-[40px] mt-2"
              style={{ color: "var(--color-primary)" }}
            >
              {r1(result.totalGrams)} g
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
              <Row
                label={t("RESULTS.CALORIES")}
                v={`${r1(result.total.kcal)} kcal`}
              />
              <Row
                label={t("RESULTS.PROTEIN")}
                v={`${r1(result.total.protein)} g`}
              />
              <Row label={t("RESULTS.FAT")} v={`${r1(result.total.fat)} g`} />
              <Row
                label={t("RESULTS.CARBS")}
                v={`${r1(result.total.carbs)} g`}
              />
            </div>
          </div>
          <div className="card-soft p-5 md:p-7">
            <p
              className="text-[12px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {t("AI.PER_100G")}
            </p>
            <p className="font-serif text-[40px] mt-2">
              {r1(result.per100.kcal)} kcal
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3">
              <Row
                label={t("RESULTS.PROTEIN")}
                v={`${r1(result.per100.protein)} g`}
              />
              <Row label={t("RESULTS.FAT")} v={`${r1(result.per100.fat)} g`} />
              <Row
                label={t("RESULTS.CARBS")}
                v={`${r1(result.per100.carbs)} g`}
              />
              <Row
                label={t("RESULTS.CALORIES")}
                v={`${r1(result.per100.kcal)} kcal`}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-serif text-[22px] mb-4">
              {t("AI.RECOGNIZED_ITEMS")}
            </h4>
            <ul className="space-y-2">
              {result.items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-white border border-(--color-border) rounded-2xl px-5 py-3"
                >
                  <div>
                    <p className="text-[15px]">{it.name}</p>
                    <p
                      className="text-[12px]"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {it.grams} g · {getMethodLabel(t, it.method)}
                    </p>
                  </div>
                  <p className="text-[14px]">{r1(it.macros.kcal)} kcal</p>
                </li>
              ))}
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
      )}
    </>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-(--color-border) pb-2">
      <span
        className="text-[14px]"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
      <span className="text-[15px] font-medium">{v}</span>
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
    method: Method | null;
    macros: { kcal: number; protein: number; fat: number; carbs: number };
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

  if (/oliw|olej/.test(text) && !items.find((i) => /oliw|olej/i.test(i.name))) {
    const g = /łyżka|łyżk/.test(text) ? 12 : 10;
    items.push({
      name: "Oliwa",
      grams: g,
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
