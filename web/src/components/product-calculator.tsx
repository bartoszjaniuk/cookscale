import {
  type Food,
  type Method,
  type Macros,
  METHOD_LABEL,
  FOODS,
  macrosForGrams,
  r1,
} from "@/lib/cookscale-data";
import { useMemo, useState } from "react";

const METHODS: Method[] = ["boiling", "frying", "baking"];

export function ProductCalculator() {
  const [query, setQuery] = useState("");
  const [food, setFood] = useState<Food | null>(FOODS[0]);
  const [method, setMethod] = useState<Method>("baking");
  const [grams, setGrams] = useState<string>("150");
  const [reverse, setReverse] = useState(false);

  const results = useMemo(
    () => compute(food, method, grams, reverse),
    [food, method, grams, reverse],
  );

  const filtered =
    query.length >= 2
      ? FOODS.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.pl.toLowerCase().includes(query.toLowerCase()),
        )
      : FOODS;

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-12">
      {/* Inputs */}
      <div>
        <label
          className="block text-[14px] mb-2"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Wyszukaj produkt
        </label>
        <input
          className="input-search"
          placeholder="np. kurczak, ryż, brokuł…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2 max-h-36 md:max-h-44 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-[14px] py-2" style={{ color: "var(--color-muted-foreground)" }}>
              Brak wyników. Spróbuj innej nazwy.
            </p>
          ) : (
            filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => setFood(f)}
                data-active={food?.id === f.id}
                className="pill-tab"
              >
                {f.pl}
              </button>
            ))
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[14px]" style={{ color: "var(--color-muted-foreground)" }}>
              Metoda obróbki
            </label>
            <button
              onClick={() => setReverse((v) => !v)}
              className="text-[13px] underline-offset-4 hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              {reverse ? "← tryb standardowy" : "tryb odwrotny →"}
            </button>
          </div>
          <div className="inline-flex w-full sm:w-auto p-1 rounded-full border border-[var(--color-border)] bg-white">
            {METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                data-active={method === m}
                className="pill-tab pill-tab-green !bg-transparent"
              >
                {METHOD_LABEL[m].pl}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <label
            className="block text-[14px] mb-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {reverse ? "Gramatura po obróbce (g)" : "Gramatura surowa (g)"}
          </label>
          <input
            type="number"
            min="1"
            inputMode="decimal"
            className="input-underline text-[28px] font-serif"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
          {results.error && (
            <p className="mt-2 text-[13px]" style={{ color: "var(--color-destructive)" }}>
              {results.error}
            </p>
          )}
        </div>
      </div>

      {/* Result panel */}
      <div className="card-soft p-7 md:p-9 self-start">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[13px] uppercase tracking-widest"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Wynik
            </p>
            <h3 className="font-serif text-[28px] mt-1">{food?.pl ?? "—"}</h3>
          </div>
          <span
            className="text-[12px] px-3 py-1 rounded-full"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}
          >
            {METHOD_LABEL[method].pl}
          </span>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <Tile
            label={reverse ? "Surowo" : "Po obróbce"}
            value={`${r1(results.outputGrams)} g`}
            big
            highlight
          />
          <Tile
            label={reverse ? "Po obróbce" : "Surowo"}
            value={`${r1(results.inputGrams)} g`}
            big
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <p className="text-[13px]" style={{ color: "var(--color-muted-foreground)" }}>
            Na 100g surowego
          </p>
          <p className="text-[13px]" style={{ color: "var(--color-muted-foreground)" }}>
            Na porcję (surowo)
          </p>
          <MacroRow
            label="Kalorie"
            unit="kcal"
            per100={results.per100.kcal}
            portion={results.portion.kcal}
          />
          <MacroRow
            label="Białko"
            unit="g"
            per100={results.per100.protein}
            portion={results.portion.protein}
          />
          <MacroRow
            label="Tłuszcze"
            unit="g"
            per100={results.per100.fat}
            portion={results.portion.fat}
          />
          <MacroRow
            label="Węglowodany"
            unit="g"
            per100={results.per100.carbs}
            portion={results.portion.carbs}
          />
        </div>

        <button className="btn-primary w-full mt-8">Zapisz w historii</button>
        <p
          className="text-[12px] mt-3 text-center"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Tryb anonimowy: 1–2 obliczenia. Zarejestruj się, aby zapisywać wyniki.
        </p>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  big,
  highlight,
}: {
  label: string;
  value: string;
  big?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: highlight ? "var(--color-primary-light)" : "var(--color-primary-muted)",
      }}
    >
      <p
        className="text-[12px] uppercase tracking-widest"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </p>
      <p
        className={`font-serif mt-2 ${big ? "text-[32px]" : "text-[22px]"}`}
        style={{ color: highlight ? "var(--color-primary)" : "var(--color-foreground)" }}
      >
        {value}
      </p>
    </div>
  );
}

function MacroRow({
  label,
  unit,
  per100,
  portion,
}: {
  label: string;
  unit: string;
  per100: number;
  portion: number;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
        <span className="text-[14px]" style={{ color: "var(--color-muted-foreground)" }}>
          {label}
        </span>
        <span className="text-[15px]">
          {r1(per100)} {unit}
        </span>
      </div>
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
        <span className="text-[14px]" style={{ color: "var(--color-muted-foreground)" }}>
          {label}
        </span>
        <span className="text-[15px] font-medium">
          {r1(portion)} {unit}
        </span>
      </div>
    </>
  );
}

function compute(food: Food | null, method: Method, gramsStr: string, reverse: boolean) {
  const g = Number(gramsStr);
  if (!food) {
    return blank("Wybierz produkt.");
  }
  if (!Number.isFinite(g) || g <= 0) {
    return blank("Podaj liczbę większą od 0.");
  }
  const yieldF = food.yields[method];
  const rawGrams = reverse ? g / yieldF : g;
  const cookedGrams = reverse ? g : g * yieldF;
  const portion = macrosForGrams(food, rawGrams);
  const per100: Macros = {
    kcal: food.kcal,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs,
  };
  return {
    error: null as string | null,
    inputGrams: rawGrams,
    outputGrams: cookedGrams,
    per100,
    portion,
  };
}

function blank(error: string) {
  return {
    error,
    inputGrams: 0,
    outputGrams: 0,
    per100: { kcal: 0, protein: 0, fat: 0, carbs: 0 } as Macros,
    portion: { kcal: 0, protein: 0, fat: 0, carbs: 0 } as Macros,
  };
}
