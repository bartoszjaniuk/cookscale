# CookScale — Sesja planistyczna bazy danych PostgreSQL (MVP)

> Dokument zawiera pełen zapis sesji planistycznej: pytania, odpowiedzi, decyzje i finalne zalecenia gotowe do implementacji schematu.

---

## Kontekst projektu

**Aplikacja:** CookScale — kalkulator wartości odżywczych uwzględniający ubytki/przyrosty gramatury podczas obróbki termicznej produktów.

**Stack techniczny:**

- Mobile: Expo React Native + Expo Router + TypeScript + NativeWind
- Backend: Supabase Edge Functions (Deno/TypeScript)
- Baza danych: Supabase Postgres (RLS, pg_trgm)
- AI: OpenRouter API
- Auth: Supabase Auth (email + hasło w MVP, Google OAuth post-MVP)
- Monetyzacja: RevenueCat

---

## Runda 1 — Pierwsze pytania i odpowiedzi

### P1: Struktura yield factors — osobna tabela czy JSONB?

**Odpowiedź:** Osobna tabela `cooking_methods` + `product_cooking_factors`.  
**Decyzja:** Relacyjna struktura zamiast JSONB — łatwiejsze dodawanie metod post-MVP i prostsze zapytania agregujące.

---

### P2: Czy tabela `products` powinna już zawierać pola `ean`, `source`, `created_by_user_id`?

**Odpowiedź:** Tak, powinna już zawierać te pola w MVP.  
**Decyzja:** Kolumny `ean` (nullable) i `created_by_user_id` (nullable) wchodzą do schematu od razu — logika dla nich aktywna post-MVP.

---

### P3: Struktura kolumn `input` i `result` w tabeli `calculations`

**Odpowiedź:** `result` jako JSONB z ustaloną strukturą (walidowany przez CHECK/trigger). Pole `type` jako enum Postgres (`'product'`, `'dish'`).  
**Decyzja:** Ustrukturyzowany JSONB zamiast swobodnego JSON — umożliwia eksport i analitykę bez migracji.

---

### P4: Czy obliczenia anonimowych użytkowników zapisywać w bazie?

**Odpowiedź:** Pominięte.  
**Decyzja:** Obliczenia anonimowych użytkowników nie są zapisywane w bazie danych.

---

### P5: Atrybuty tabeli `profiles`

**Propozycja użytkownika:** `preferred_language`, `trial_ai_used`, `revenuecat_customer_id`, `avatar`.

**Analiza i rekomendacja:**

- ✅ `preferred_language TEXT` z CHECK (`'pl'`, `'en'`) — TEXT zamiast enum (łatwiejsze dodawanie języków)
- ⚠️ `trial_ai_used` → zmienione na `trial_ai_used_at TIMESTAMPTZ` (nullable) — NULL = trial nieużyty, wartość = timestamp pierwszego użycia (analityka konwersji gratis)
- ✅ `revenuecat_customer_id TEXT` (nullable)
- ⚠️ `avatar` → zmienione na `avatar_url TEXT` — URL do Supabase Storage, nie raw bytes

**Dodatkowe pola zalecone:**

- `is_premium BOOLEAN NOT NULL DEFAULT FALSE`
- `premium_expires_at TIMESTAMPTZ` (nullable) — wiadomo kiedy wygasa bez odpytywania RevenueCat
- `anonymous_calc_count SMALLINT NOT NULL DEFAULT 0` — egzekwowanie limitu obliczeń przed rejestracją

**Odpowiedź:** Zgoda na wszystkie rekomendacje.  
**Decyzja:** Finalna lista kolumn `profiles` jak powyżej.

---

### P6: Rate limiting — in-memory w Edge Functions czy tabela Postgres?

**Analiza:**
In-memory w Edge Functions to zły wybór — Supabase Edge Functions działają jako izolowane instancje Deno. Każde wywołanie może trafić na inną instancję bez dostępu do pamięci poprzedniej. Licznik byłby resetowany — limit per IP/user byłby nieskuteczny.

**Rekomendacja:** Tabela `ai_usage_log` w Postgres z indeksem na `(ip_hash, called_at)`. Czyszczenie przez pg_cron co 24h (DELETE rekordów > 48h). IP przechowywany jako SHA-256 hash (GDPR).

**Odpowiedź:** Zgoda na rekomendację.  
**Decyzja:** Tabela `ai_usage_log` w Postgres.

---

### P7: Yield factor — globalny czy per produkt + metoda?

**Odpowiedź:** Współczynnik różni się zależnie od produktu i metody.  
**Decyzja:** Tabela `product_cooking_factors` z UNIQUE(`product_id`, `cooking_method_id`).

---

### P8: Limit historii obliczeń per user

**Odpowiedź:** Ostatnie 100 obliczeń, trigger DB.  
**Decyzja:** Trigger po INSERT na `calculations` usuwa rekordy spoza TOP 100 per `user_id` (destruktywne, nieodwracalne — świadoma decyzja).

---

### P9: RLS dla tabeli `products`

**Odpowiedź:** Tylko odczyt dla wszystkich (anon + authenticated). Mutacje tylko przez `service_role`.  
**Decyzja:** SELECT policy dla `anon` i `authenticated`. INSERT/UPDATE/DELETE wyłącznie przez `service_role`.

---

### P10: RLS dla `ai_usage_log`

**Rekomendacja i decyzja:** Brak polityk dla użytkowników — wyłącznie `service_role`. Tabela niewidoczna przez PostgREST.

---

### P11: Webhook RevenueCat — `service_role` vs Edge Function?

**Wyjaśnienie `service_role`:**
Supabase ma dwa tryby dostępu:

- `anon` key — klucz publiczny, dostęp przechodzi przez RLS
- `service_role` key — klucz administracyjny, całkowicie omija RLS. Jeśli ktoś go zdobędzie, ma pełny dostęp do bazy

**Kiedy używać `service_role`:** wyłącznie po stronie serwerowej (Edge Functions, Vault), nigdy w kliencie mobilnym.

**Rekomendacja i decyzja:** Dedykowana Edge Function:

1. Weryfikuje sygnaturę webhooka RevenueCat (shared secret w nagłówku HTTP)
2. Parsuje event (zakup, wygaśnięcie, przywrócenie)
3. Używa `service_role` do aktualizacji `profiles.is_premium` i `profiles.premium_expires_at`

---

### P12 & P13: Dane makro (źródło do ustalenia w późniejszym etapie)

**Pola dostępne w obu źródłach (per 100g):**

| Składnik    |     | Pole               |
| ----------- | --- | ------------------ |
| Energia     |     | kcal_100g          |
| Białko      |     | proteins_100g      |
| Tłuszcze    |     | fat_100g           |
| Węglowodany |     | carbohydrates_100g |
| Cukry       |     | sugars_100g        |
| Błonnik     |     | fiber_100g         |
| Sód         |     | sodium_100g        |

**Decyzja — kolumny w MVP:**

- Obowiązkowe: `kcal_100g`, `protein_g`, `fat_g`, `carbs_g`
- Zalecone: `fiber_g`, `sugar_g`, `sodium_mg`
- Typ danych: `NUMERIC(6,2)` (dokładność do 0.01g, brak błędów float)
- Opcjonalne post-MVP: `saturated_fat_g`

---

### P14: Identyfikacja produktów z różnych źródeł

**Odpowiedź:** `source` enum.  
**Decyzja:** UNIQUE(`source`) zapobiega duplikatom.

---

## Runda 2 — Pytania uzupełniające i odpowiedzi

---

### P2: Tabela `cooking_methods` — statyczna czy z flagą `is_active`?

**Odpowiedź:** Tabela statyczna.  
**Decyzja:** 6 metod seedowanych raz. Brak flagi `is_active` — prostszy schemat.

---

### P3: Yield factor — pojedyncza liczba czy zakres (min/max/typical)?

**Odpowiedź:** Pojedyncza liczba.  
**Decyzja:** `yield_factor NUMERIC(5,4)` — np. `0.7500`. Brak pól min/max/typical.

---

### P4: Struktura `input` i `result` dla trybu `dish`

**Odpowiedź:** Separacja `input_text TEXT` + `input JSONB` + `result JSONB`.  
**Decyzja:**

- `input_text` — surowy tekst użytkownika (analityka błędów AI)
- `input JSONB` — ustrukturyzowany input (gramatura, tryb)
- `result JSONB` — ustrukturyzowany wynik z tablicą składników

---

### P5: Tabela `categories` — płaska lista czy dedykowana tabela?

**Odpowiedź:** Dedykowana tabela `categories`.  
**Decyzja:** Osobna tabela z `name` (EN) i `slug`. Tłumaczenia po stronie i18n aplikacji mobilnej (nie w DB) — mniej migracji przy dodawaniu języków.

---

## Runda 3 — Pytania domykające i odpowiedzi

### PA: Brakujące kombinacje w `product_cooking_factors`

**Opcja A:** Brak wiersza = metoda niedostępna, UI nie pokazuje tej metody (filtrowanie po istniejących wierszach).  
**Opcja B:** Wiersz z `yield_factor = NULL` i flagą `is_applicable`.

**Odpowiedź:** Opcja A.  
**Decyzja:** Brak wiersza = metoda niedostępna dla produktu. Edge Function zwraca błąd. UI filtruje dostępne metody na podstawie istniejących rekordów w `product_cooking_factors`.

---

### PB: Tryb `dish` — skąd pochodzi metoda obróbki?

**Obserwacja użytkownika:** Metoda obróbki powinna wynikać z przepisu. Baza produktów + yield factors mogą być wykorzystane przez AI.

**Rekomendacja i decyzja — Podejście 1 + elementy Podejścia 2:**

1. Użytkownik podaje tekst/zdjęcie przepisu
2. Edge Function wysyła do AI (OpenRouter) prompt z enumem 6 slugów z `cooking_methods`
3. AI zwraca ustrukturyzowaną listę: `[{ingredient_name, cooking_method_slug, raw_weight_g, cooked_weight_g}]`
4. Edge Function mapuje `ingredient_name → product_id` przez pg_trgm search
5. Dla każdego składnika:
   - Znaleziony `yield_factor` w `product_cooking_factors` → `yield_source: 'db'` (priorytet)
   - Nieznaleziony → `yield_source: 'ai'`, oblicza z `cooked/raw`, loguje do `warnings`
6. Makro liczone deterministycznie z tabeli `products`
7. Wynik trafia do `calculations.result JSONB`

**Post-MVP:** migracja szczegółów per składnik do tabeli `dish_calculation_items`.

**Odpowiedź:** Zgoda.

---

### PC: Kolumna `direction` dla trybu `dish`

**Decyzja:** `direction direction_enum` jako osobna kolumna zamiast chowania w JSONB — łatwiejsze zapytania analityczne. NULL dla trybu `dish`.

---

### PD: Pole `warnings` dla częściowych wyników AI

**Odpowiedź:** Zgoda.  
**Decyzja:** `warnings JSONB` (nullable) obok `result JSONB`. Przykład:

```json
[{ "ingredient": "trufia", "issue": "unrecognized" }]
```

---

## Finalne decyzje — Schemat bazy danych

### Rozszerzenia PostgreSQL

| Rozszerzenie  | Cel                                      |
| ------------- | ---------------------------------------- |
| `pg_trgm`     | Full-text search na `products.name`      |
| `moddatetime` | Auto-update kolumny `updated_at`         |
| `pg_cron`     | Scheduled job czyszczenia `ai_usage_log` |

---

### Typy wyliczeniowe (Enums)

```sql
CREATE TYPE source_enum AS ENUM ('usda', 'openfoodfacts');
CREATE TYPE calculation_type_enum AS ENUM ('product', 'dish');
CREATE TYPE direction_enum AS ENUM ('raw_to_cooked', 'cooked_to_raw');
```

---

### Tabela `categories`

Statyczna, seedowana raz. Tłumaczenia w i18n aplikacji.

| Kolumna      | Typ                  | Uwagi                        |
| ------------ | -------------------- | ---------------------------- |
| `id`         | UUID                 | PRIMARY KEY                  |
| `name`       | TEXT NOT NULL UNIQUE | Po angielsku                 |
| `slug`       | TEXT NOT NULL UNIQUE | np. `'meat'`, `'vegetables'` |
| `created_at` | TIMESTAMPTZ          | DEFAULT now()                |

---

### Tabela `products`

Soft delete przez `deleted_at`. Widok `active_products WHERE deleted_at IS NULL`.

| Kolumna              | Typ                  | Uwagi                       |
| -------------------- | -------------------- | --------------------------- |
| `id`                 | UUID                 | PRIMARY KEY                 |
| `external_id`        | TEXT NOT NULL        | ID z USDA lub OFF           |
| `source`             | source_enum NOT NULL |                             |
| `ean`                | TEXT                 | nullable, post-MVP          |
| `created_by_user_id` | UUID                 | nullable, post-MVP          |
| `name`               | TEXT NOT NULL        |                             |
| `category_id`        | UUID                 | FK → categories             |
| `calories_kcal`      | NUMERIC(6,2)         |                             |
| `protein_g`          | NUMERIC(6,2)         |                             |
| `fat_g`              | NUMERIC(6,2)         |                             |
| `carbs_g`            | NUMERIC(6,2)         |                             |
| `fiber_g`            | NUMERIC(6,2)         |                             |
| `sugar_g`            | NUMERIC(6,2)         |                             |
| `sodium_mg`          | NUMERIC(7,2)         |                             |
| `deleted_at`         | TIMESTAMPTZ          | nullable, soft delete       |
| `created_at`         | TIMESTAMPTZ          | DEFAULT now()               |
| `updated_at`         | TIMESTAMPTZ          | DEFAULT now(), auto-trigger |

**Constraints:** `UNIQUE(external_id, source)`

---

### Tabela `cooking_methods`

Statyczna, 6 metod, seedowana raz.

| Kolumna      | Typ                  | Uwagi                                             |
| ------------ | -------------------- | ------------------------------------------------- |
| `id`         | UUID                 | PRIMARY KEY                                       |
| `slug`       | TEXT NOT NULL UNIQUE | np. `'boiling'`, `'steaming'`, `'pan_frying_fat'` |
| `created_at` | TIMESTAMPTZ          | DEFAULT now()                                     |

---

### Tabela `product_cooking_factors`

Brak wiersza = metoda niedostępna = Edge Function zwraca błąd.

| Kolumna             | Typ                   | Uwagi                           |
| ------------------- | --------------------- | ------------------------------- |
| `id`                | UUID                  | PRIMARY KEY                     |
| `product_id`        | UUID                  | FK → products ON DELETE CASCADE |
| `cooking_method_id` | UUID                  | FK → cooking_methods            |
| `yield_factor`      | NUMERIC(5,4) NOT NULL | np. `0.7500`                    |

**Constraints:** `UNIQUE(product_id, cooking_method_id)`

---

### Tabela `profiles`

Rozszerzenie `auth.users`. Kolumny premium tylko przez `service_role`.

| Kolumna                  | Typ               | Uwagi                                    |
| ------------------------ | ----------------- | ---------------------------------------- |
| `id`                     | UUID              | PRIMARY KEY, FK → auth.users             |
| `is_premium`             | BOOLEAN NOT NULL  | DEFAULT FALSE                            |
| `premium_expires_at`     | TIMESTAMPTZ       | nullable                                 |
| `revenuecat_customer_id` | TEXT              | nullable                                 |
| `preferred_language`     | TEXT              | DEFAULT `'en'`, CHECK IN (`'pl'`,`'en'`) |
| `trial_ai_used_at`       | TIMESTAMPTZ       | nullable, NULL = nieużyty                |
| `avatar_url`             | TEXT              | nullable, Supabase Storage               |
| `anonymous_calc_count`   | SMALLINT NOT NULL | DEFAULT 0                                |
| `created_at`             | TIMESTAMPTZ       | DEFAULT now()                            |
| `updated_at`             | TIMESTAMPTZ       | DEFAULT now(), auto-trigger              |

---

### Tabela `calculations`

Trigger usuwa rekordy poza TOP 100 per `user_id` po każdym INSERT.

| Kolumna             | Typ                            | Uwagi                                             |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| `id`                | UUID                           | PRIMARY KEY                                       |
| `user_id`           | UUID                           | FK → auth.users ON DELETE CASCADE                 |
| `type`              | calculation_type_enum NOT NULL |                                                   |
| `direction`         | direction_enum                 | nullable (NULL dla dish)                          |
| `product_id`        | UUID                           | FK → products ON DELETE SET NULL, nullable        |
| `cooking_method_id` | UUID                           | FK → cooking_methods ON DELETE SET NULL, nullable |
| `input_text`        | TEXT                           | nullable, surowy tekst dla dish                   |
| `input`             | JSONB NOT NULL                 | ustrukturyzowany input                            |
| `result`            | JSONB NOT NULL                 | ustrukturyzowany wynik                            |
| `warnings`          | JSONB                          | nullable, nierozpoznane składniki                 |
| `created_at`        | TIMESTAMPTZ                    | DEFAULT now()                                     |

**Struktura `result` dla trybu `dish`:**

```json
{
	"total": { "calories_kcal": 0, "protein_g": 0, "fat_g": 0, "carbs_g": 0 },
	"items": [
		{
			"product_id": "uuid",
			"product_name": "chicken breast",
			"cooking_method_slug": "boiling",
			"raw_weight_g": 200,
			"cooked_weight_g": 150,
			"yield_factor_used": 0.75,
			"yield_source": "db",
			"matched_confidence": 0.95,
			"macros": {
				"calories_kcal": 165,
				"protein_g": 31,
				"fat_g": 3.6,
				"carbs_g": 0
			}
		}
	]
}
```

---

### Tabela `ai_usage_log`

Tylko `service_role`. Niewidoczna przez PostgREST.

| Kolumna     | Typ                  | Uwagi                                        |
| ----------- | -------------------- | -------------------------------------------- |
| `id`        | BIGSERIAL            | PRIMARY KEY                                  |
| `user_id`   | UUID                 | FK → auth.users ON DELETE SET NULL, nullable |
| `ip_hash`   | TEXT NOT NULL        | SHA-256 z solą (GDPR)                        |
| `called_at` | TIMESTAMPTZ NOT NULL | DEFAULT now()                                |
| `success`   | BOOLEAN NOT NULL     | DEFAULT TRUE                                 |

---

### Indeksy

```sql
-- Full-text search na products.name
CREATE INDEX idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

CREATE INDEX idx_products_name_fts
  ON products USING GIN (to_tsvector('english', name));

-- Filtrowanie aktywnych produktów (partial index)
CREATE INDEX idx_products_active
  ON products (source, category_id)
  WHERE deleted_at IS NULL;

-- Historia obliczeń użytkownika
CREATE INDEX idx_calculations_user_created
  ON calculations (user_id, created_at DESC);

-- Rate limiting AI per IP
CREATE INDEX idx_ai_log_ip_time
  ON ai_usage_log (ip_hash, called_at);

-- Rate limiting AI per user
CREATE INDEX idx_ai_log_user_time
  ON ai_usage_log (user_id, called_at);
```

---

### Triggery

**Auto `updated_at`** (rozszerzenie moddatetime) na tabelach: `profiles`, `products`

**Limit 100 obliczeń per user** — po każdym INSERT na `calculations`:

```sql
DELETE FROM calculations
WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM calculations
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 100
  );
```

---

### Row Level Security (RLS)

| Tabela                    | anon            | authenticated          | service_role |
| ------------------------- | --------------- | ---------------------- | ------------ |
| `categories`              | SELECT          | SELECT                 | ALL          |
| `products`                | SELECT (active) | SELECT (active)        | ALL          |
| `cooking_methods`         | SELECT          | SELECT                 | ALL          |
| `product_cooking_factors` | SELECT          | SELECT                 | ALL          |
| `profiles`                | —               | SELECT/UPDATE własne\* | ALL          |
| `calculations`            | —               | SELECT/INSERT własne   | ALL          |
| `ai_usage_log`            | —               | —                      | ALL          |

\*Użytkownik może UPDATE: `preferred_language`, `avatar_url`, `anonymous_calc_count`.  
Kolumny `is_premium`, `premium_expires_at` — UPDATE wyłącznie przez `service_role`.

---

### Zadania operacyjne (pg_cron)

```sql
-- Czyszczenie logów AI starszych niż 48h — codziennie o 3:00 UTC
SELECT cron.schedule(
  'cleanup-ai-usage-log',
  '0 3 * * *',
  'DELETE FROM ai_usage_log WHERE called_at < now() - interval ''48 hours'''
);
```

---

### Architektura bezpieczeństwa — podsumowanie

| Element             | Zasada                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| `anon` key          | Używany w aplikacji mobilnej, przechodzi przez RLS                       |
| `service_role` key  | Wyłącznie w Edge Functions (Supabase Vault), omija RLS, nigdy w kliencie |
| Webhook RevenueCat  | Edge Function weryfikuje sygnaturę → `service_role` update `profiles`    |
| IP w `ai_usage_log` | SHA-256 hash z solą — nie raw IP (GDPR)                                  |
| Produkty            | Niemodyfikowalne przez użytkownika w MVP                                 |
| Historia obliczeń   | Brak UPDATE/DELETE dla użytkownika — tylko odczyt i zapis własnych       |

---

### Architektura trybu `dish` (AI) — przepływ danych

```
Użytkownik
    │ tekst / zdjęcie przepisu
    ▼
Edge Function
    │ prompt z enumem 6 cooking_method slugs
    ▼
OpenRouter AI
    │ [{ingredient_name, cooking_method_slug, raw_weight_g, cooked_weight_g}]
    ▼
Edge Function — mapowanie i walidacja
    ├─ pg_trgm search → product_id
    ├─ lookup product_cooking_factors
    │     ├─ znaleziony → yield_source: 'db' ✅
    │     └─ brak → yield_source: 'ai', dodaj do warnings ⚠️
    └─ kalkulacja makro z tabeli products
    │
    ▼
calculations (INSERT)
    result JSONB — tablica składników + total
    warnings JSONB — nierozpoznane składniki
```

---

## Decyzje odłożone na post-MVP

| Temat                                | Status                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| Tabela `dish_calculation_items`      | Migracja z `result JSONB` gdy potrzebna analityka per składnik |
| `products.created_by_user_id`        | Kolumna w schemacie (nullable), logika aktywna post-MVP        |
| `products.ean`                       | Kolumna w schemacie (nullable), skanowanie EAN post-MVP        |
| Google OAuth                         | Supabase Auth obsługuje bez zmian schematu DB                  |
| `saturated_fat_g` i inne mikro       | Migracja ADD COLUMN gdy potrzebne                              |
| Redis / zewnętrzny rate limiter      | Rewizja `ai_usage_log` przy skalowaniu ruchu                   |
| Produkty dodawane przez użytkowników | Architektura RLS do przeprojektowania przy aktywacji           |

---

_Dokument wygenerowany na podstawie sesji planistycznej. Gotowy do użycia jako kontekst przy generowaniu migracji SQL i polityk RLS._
