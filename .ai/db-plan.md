# CookScale — Plan schematu bazy danych PostgreSQL (MVP)

## 1. Tabele, kolumny, typy danych i ograniczenia

---

### Rozszerzenia PostgreSQL

```sql
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "moddatetime";
```

---

### Typy wyliczeniowe (Enums)

```sql
CREATE TYPE source_enum AS ENUM ('system', 'user');
-- 'system' — produkty seedowane/kuratorowane przez system (USDA, OpenFoodFacts i inne kanoniczne źródła)
-- 'user'   — produkty dodane przez użytkownika (post-MVP, kolumna created_by_user_id aktywna)
CREATE TYPE calculation_type_enum AS ENUM ('product', 'dish');
CREATE TYPE direction_enum AS ENUM ('raw_to_cooked', 'cooked_to_raw');
```

---

### Tabela: `categories`

Statyczna tabela kategorii produktów. Seedowana jednorazowo. Tłumaczenia nazw realizowane po stronie i18n aplikacji mobilnej.

```sql
CREATE TABLE categories (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL UNIQUE,   -- Nazwa po angielsku, np. 'Meat'
  slug         TEXT        NOT NULL UNIQUE,   -- np. 'meat', 'vegetables'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed — 6 podstawowych kategorii MVP:**

| slug         | name       |
| ------------ | ---------- |
| `meat`       | Meat       |
| `fish`       | Fish       |
| `vegetables` | Vegetables |
| `legumes`    | Legumes    |
| `grains`     | Grains     |
| `dairy`      | Dairy      |

---

### Tabela: `products`

Produkty spożywcze importowane z USDA FoodData Central i Open Food Facts. Soft delete przez `deleted_at`. Mutacje wyłącznie przez `service_role`.

```sql
CREATE TABLE products (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id          TEXT,                                  -- nullable; NULL dla produktów dodanych przez użytkownika (post-MVP)
  source               source_enum   NOT NULL,
  ean                  TEXT,                                  -- nullable, post-MVP (skanowanie kodów kreskowych)
  created_by_user_id   UUID          REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable, post-MVP
  name                 TEXT          NOT NULL,
  category_id          UUID          REFERENCES categories(id) ON DELETE SET NULL,
  calories_kcal        NUMERIC(6,2),
  protein_g            NUMERIC(6,2),
  fat_g                NUMERIC(6,2),
  carbs_g              NUMERIC(6,2),
  fiber_g              NUMERIC(6,2),
  sugar_g              NUMERIC(6,2),
  sodium_mg            NUMERIC(7,2),
  deleted_at           TIMESTAMPTZ,                           -- nullable, soft delete
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);
-- Partial unique index zamiast UNIQUE constraint (NULL nie blokuje duplikatów w standardowym UNIQUE)
-- Zdefiniowany w sekcji Indeksy: uq_products_external_source
```

**Widok aktywnych produktów:**

```sql
CREATE VIEW active_products AS
  SELECT * FROM products WHERE deleted_at IS NULL;
```

**Priorytety źródeł:** USDA wygrywa przy konflikcie (ten sam produkt w obu źródłach).

---

### Tabela: `cooking_methods`

Statyczna tabela metod obróbki termicznej. 3 metody seedowane jednorazowo. Brak flagi `is_active`.

```sql
CREATE TABLE cooking_methods (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT  NOT NULL UNIQUE,   -- np. 'boiling', 'frying', 'baking'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Seed — 6 metod MVP:**

| slug      | Opis (i18n) |
| --------- | ----------- |
| `boiling` | Gotowanie   |
| `frying`  | Smażenie    |
| `baking`  | Pieczenie   |

---

### Tabela: `product_cooking_factors`

Współczynniki zmiany gramatury (yield factors) per produkt + metoda obróbki. Brak wiersza = metoda niedostępna dla danego produktu — Edge Function zwraca błąd, UI filtruje dostępne metody.

```sql
CREATE TABLE product_cooking_factors (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cooking_method_id  UUID          NOT NULL REFERENCES cooking_methods(id) ON DELETE RESTRICT,
  yield_factor       NUMERIC(5,4)  NOT NULL,   -- np. 0.7500 (produkt traci 25% masy)

  CONSTRAINT uq_product_cooking_factors UNIQUE (product_id, cooking_method_id),
  CONSTRAINT chk_yield_factor_range CHECK (yield_factor > 0 AND yield_factor <= 10)
);
```

---

### Tabela: `profiles`

Rozszerzenie `auth.users` Supabase. Tworzone automatycznie po rejestracji przez trigger lub Edge Function. Kolumny premium (`is_premium`, `premium_expires_at`) aktualizowane wyłącznie przez `service_role` (webhook RevenueCat).

```sql
CREATE TABLE profiles (
  id                       UUID      PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_premium               BOOLEAN   NOT NULL DEFAULT FALSE,
  premium_expires_at       TIMESTAMPTZ,                        -- nullable, NULL = brak aktywnej subskrypcji
  revenuecat_customer_id   TEXT,                               -- nullable
  preferred_language       TEXT      NOT NULL DEFAULT 'en'
                             CHECK (preferred_language IN ('pl', 'en')),
  trial_ai_used_at         TIMESTAMPTZ,                        -- nullable, NULL = trial nieużyty
  avatar_url               TEXT,                               -- nullable, URL do Supabase Storage
  anonymous_calc_count     SMALLINT  NOT NULL DEFAULT 0,       -- licznik obliczeń przed rejestracją
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Kolumny możliwe do UPDATE przez użytkownika (RLS):** `preferred_language`, `avatar_url`.  
**Kolumny tylko `service_role`:** `is_premium`, `premium_expires_at`, `revenuecat_customer_id`, `trial_ai_used_at`, `anonymous_calc_count`.

---

### Tabela: `calculations`

Historia obliczeń zalogowanych użytkowników. Trigger usuwa rekordy poza TOP 100 per `user_id` po każdym INSERT. Brak UPDATE i DELETE dla użytkownika.

```sql
CREATE TABLE calculations (
  id                 UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID                      NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type               calculation_type_enum     NOT NULL,
  direction          direction_enum,                              -- nullable (NULL dla trybu 'dish')
  product_id         UUID                      REFERENCES products(id) ON DELETE SET NULL,   -- nullable
  cooking_method_id  UUID                      REFERENCES cooking_methods(id) ON DELETE SET NULL, -- nullable
  input_text         TEXT,                                        -- nullable, surowy tekst użytkownika (tryb dish)
  input              JSONB                     NOT NULL,          -- ustrukturyzowany input
  result             JSONB                     NOT NULL,          -- ustrukturyzowany wynik
  warnings           JSONB,                                       -- nullable, nierozpoznane składniki (tryb dish)
  created_at         TIMESTAMPTZ               NOT NULL DEFAULT now(),

  -- Spójność pól względem typu obliczenia
  CONSTRAINT chk_calc_product_fields CHECK (
    type != 'product' OR
    (product_id IS NOT NULL AND direction IS NOT NULL AND cooking_method_id IS NOT NULL)
  ),
  CONSTRAINT chk_calc_dish_fields CHECK (
    type != 'dish' OR
    (input_text IS NOT NULL AND direction IS NULL AND product_id IS NULL AND cooking_method_id IS NULL)
  ),
  -- Minimalna walidacja JSONB — pełny schemat egzekwowany przez Zod w Edge Function
  CONSTRAINT chk_calc_input_object  CHECK (jsonb_typeof(input)  = 'object'),
  CONSTRAINT chk_calc_result_object CHECK (jsonb_typeof(result) = 'object')
);
```

**Struktura `result` dla trybu `product`:**

```json
{
	"product_id": "uuid",
	"product_name": "chicken breast",
	"cooking_method_slug": "boiling",
	"direction": "raw_to_cooked",
	"input_weight_g": 200,
	"output_weight_g": 150,
	"yield_factor": 0.75,
	"macros_per_100g": {
		"calories_kcal": 110,
		"protein_g": 20.5,
		"fat_g": 2.4,
		"carbs_g": 0.0
	},
	"macros_total": {
		"calories_kcal": 165,
		"protein_g": 30.75,
		"fat_g": 3.6,
		"carbs_g": 0.0
	}
}
```

**Struktura `result` dla trybu `dish`:**

```json
{
	"total_weight_g": 650,
	"total": {
		"calories_kcal": 520,
		"protein_g": 62.5,
		"fat_g": 9.1,
		"carbs_g": 45.0
	},
	"per_100g": {
		"calories_kcal": 80,
		"protein_g": 9.6,
		"fat_g": 1.4,
		"carbs_g": 6.9
	},
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
				"protein_g": 31.0,
				"fat_g": 3.6,
				"carbs_g": 0.0
			}
		}
	]
}
```

**Struktura `warnings` (nullable):**

```json
[
	{ "ingredient": "trufia", "issue": "unrecognized" },
	{
		"ingredient": "mleko kokosowe",
		"issue": "yield_source_ai",
		"yield_factor_estimated": 1.0
	}
]
```

---

### Tabela: `ai_usage_log`

Rate limiting wywołań AI per IP i per user. Dostępna wyłącznie przez `service_role` — niewidoczna przez PostgREST dla użytkowników. IP przechowywany jako hash SHA-256 z solą (GDPR).

> **Bezpieczeństwo soli:** Stała sól przechowywana w **Supabase Vault** (`vault.create_secret('sól', 'ip_hash_salt')`). Nie jest rotowana w MVP — rotacja unieważniłaby wszystkie istniejące hashe i zresetowała historię rate-limitingu.

```sql
CREATE TABLE ai_usage_log (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     UUID         REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable (anonimowi)
  ip_hash     TEXT         NOT NULL,     -- SHA-256 z solą, nie raw IP (GDPR)
  called_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  success     BOOLEAN      NOT NULL DEFAULT TRUE
);
```

---

## 2. Relacje między tabelami

| Tabela A                  | Relacja | Tabela B          | Klucz obcy / uwagi                                                                  |
| ------------------------- | ------- | ----------------- | ----------------------------------------------------------------------------------- |
| `products`                | N:1     | `categories`      | `products.category_id → categories.id` ON DELETE SET NULL                           |
| `products`                | N:1     | `auth.users`      | `products.created_by_user_id → auth.users.id` ON DELETE SET NULL (post-MVP)         |
| `product_cooking_factors` | N:1     | `products`        | `product_cooking_factors.product_id → products.id` ON DELETE CASCADE                |
| `product_cooking_factors` | N:1     | `cooking_methods` | `product_cooking_factors.cooking_method_id → cooking_methods.id` ON DELETE RESTRICT |
| `profiles`                | 1:1     | `auth.users`      | `profiles.id → auth.users.id` ON DELETE CASCADE                                     |
| `calculations`            | N:1     | `auth.users`      | `calculations.user_id → auth.users.id` ON DELETE CASCADE                            |
| `calculations`            | N:1     | `products`        | `calculations.product_id → products.id` ON DELETE SET NULL                          |
| `calculations`            | N:1     | `cooking_methods` | `calculations.cooking_method_id → cooking_methods.id` ON DELETE SET NULL            |
| `ai_usage_log`            | N:1     | `auth.users`      | `ai_usage_log.user_id → auth.users.id` ON DELETE SET NULL                           |

**Relacja M:N** — `products` ↔ `cooking_methods` realizowana przez tabelę łączącą `product_cooking_factors`.

---

## 3. Indeksy

```sql
-- Full-text search na products.name (trigram — partial match, literówki)
CREATE INDEX idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

-- Full-text search na products.name (FTS — dokładniejsze dopasowanie słów)
CREATE INDEX idx_products_name_fts
  ON products USING GIN (to_tsvector('english', name));

-- Filtrowanie aktywnych produktów z soft delete (partial index)
CREATE INDEX idx_products_active
  ON products (source, category_id)
  WHERE deleted_at IS NULL;

-- Historia obliczeń użytkownika posortowana od najnowszych
CREATE INDEX idx_calculations_user_created
  ON calculations (user_id, created_at DESC);

-- Filtrowanie obliczeń per typ (dla widoku historii)
CREATE INDEX idx_calculations_user_type
  ON calculations (user_id, type);

-- Rate limiting AI per IP (hash)
CREATE INDEX idx_ai_log_ip_time
  ON ai_usage_log (ip_hash, called_at DESC);

-- Rate limiting AI per user
CREATE INDEX idx_ai_log_user_time
  ON ai_usage_log (user_id, called_at DESC);

-- Lookup yield factor per produkt + metoda
CREATE INDEX idx_pcf_product_method
  ON product_cooking_factors (product_id, cooking_method_id);

-- Lookup wszystkich produktów dostępnych dla danej metody
CREATE INDEX idx_pcf_cooking_method
  ON product_cooking_factors (cooking_method_id);

-- Unikalność external_id per source (NULL dozwolony — produkty użytkownika post-MVP)
CREATE UNIQUE INDEX uq_products_external_source
  ON products (external_id, source)
  WHERE external_id IS NOT NULL;
```

---

## 4. Triggery

### 4.1 Auto-update `updated_at` (rozszerzenie moddatetime)

```sql
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 4.2 Limit 100 obliczeń per user (destruktywny, nieodwracalny)

```sql
CREATE OR REPLACE FUNCTION fn_limit_calculations_per_user()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM calculations
  WHERE id IN (
    SELECT id FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
      FROM calculations
      WHERE user_id = NEW.user_id
    ) ranked
    WHERE rn > 100
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_limit_calculations_per_user
  AFTER INSERT ON calculations
  FOR EACH ROW EXECUTE FUNCTION fn_limit_calculations_per_user();
```

### 4.3 Auto-tworzenie profilu po rejestracji użytkownika

```sql
CREATE OR REPLACE FUNCTION fn_create_profile_on_signup()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_create_profile_on_signup();
```

---

## 5. Row Level Security (RLS)

### Włączenie RLS na wszystkich tabelach

```sql
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_methods         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_cooking_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log            ENABLE ROW LEVEL SECURITY;
```

---

### `categories` — publiczny odczyt

```sql
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);
```

---

### `products` — publiczny odczyt tylko aktywnych

```sql
CREATE POLICY "products_select_active_public"
  ON products FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);
```

---

### `cooking_methods` — publiczny odczyt

```sql
CREATE POLICY "cooking_methods_select_public"
  ON cooking_methods FOR SELECT
  TO anon, authenticated
  USING (true);
```

---

### `product_cooking_factors` — publiczny odczyt

```sql
CREATE POLICY "pcf_select_public"
  ON product_cooking_factors FOR SELECT
  TO anon, authenticated
  USING (true);
```

---

### `profiles` — użytkownik widzi i edytuje tylko swój profil

```sql
-- Odczyt własnego profilu
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE tylko bezpiecznych kolumn (premium zarządza service_role przez webhook)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Zabezpieczenie: kolumny premium nie mogą być zmieniane przez użytkownika
    -- Egzekwowane przez brak tych kolumn w UPDATE przez klienta + RLS na poziomie logiki
  );
```

> **Uwaga implementacyjna:** Kolumny `is_premium`, `premium_expires_at`, `revenuecat_customer_id`, `trial_ai_used_at` są modyfikowane wyłącznie przez Edge Functions używające klucza `service_role`, który omija RLS. Klient mobilny używa klucza `anon` i nie ma możliwości bezpośredniej modyfikacji tych kolumn.

---

### `calculations` — użytkownik widzi i zapisuje tylko swoje obliczenia

```sql
-- Odczyt własnych obliczeń
CREATE POLICY "calculations_select_own"
  ON calculations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Zapis tylko własnych obliczeń
CREATE POLICY "calculations_insert_own"
  ON calculations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Brak UPDATE i DELETE dla użytkownika (historia jest append-only, limit przez trigger)

-- Jawne blokowanie UPDATE i DELETE (defense-in-depth przy włączonym RLS)
CREATE POLICY "deny_update_calculations"
  ON calculations FOR UPDATE TO authenticated USING (false);

CREATE POLICY "deny_delete_calculations"
  ON calculations FOR DELETE TO authenticated USING (false);
```

---

### `ai_usage_log` — brak dostępu dla użytkowników, tylko `service_role`

```sql
-- Brak polityk dla anon i authenticated
-- Tabela dostępna wyłącznie przez service_role (omija RLS)
-- Niewidoczna przez PostgREST dla klientów mobilnych
```

---

### Podsumowanie RLS

| Tabela                    | `anon`          | `authenticated`        | `service_role` |
| ------------------------- | --------------- | ---------------------- | -------------- |
| `categories`              | SELECT          | SELECT                 | ALL            |
| `products`                | SELECT (active) | SELECT (active)        | ALL            |
| `cooking_methods`         | SELECT          | SELECT                 | ALL            |
| `product_cooking_factors` | SELECT          | SELECT                 | ALL            |
| `profiles`                | —               | SELECT/UPDATE własne\* | ALL            |
| `calculations`            | —               | SELECT/INSERT własne   | ALL            |
| `ai_usage_log`            | —               | —                      | ALL            |

\*Kolumny możliwe do UPDATE przez użytkownika: `preferred_language`, `avatar_url`. Kolumna `anonymous_calc_count` aktualizowana wyłącznie przez Edge Function (`service_role`).

---

## 6. Czyszczenie `ai_usage_log`

Zamiast pg_cron zastosowane jest **lazy cleanup** — czyszczenie rekordów starszych niż 48h wykonywane na początku każdego wywołania Edge Function obsługującej AI, przed sprawdzeniem rate limitu:

```typescript
// Na początku Edge Function, przed sprawdzeniem limitu:
await supabase
	.from("ai_usage_log")
	.delete()
	.lt("called_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());
```

> **Uzasadnienie:** Brak dodatkowej infrastruktury i konfiguracji. Wystarczające dla ruchu MVP. Rekordy są czyszczone przy każdym wywołaniu AI, więc tabela nie rośnie nieograniczenie.

---

## 7. Architektura bezpieczeństwa

| Element             | Zasada                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| `anon` key          | Klucz publiczny w aplikacji mobilnej — przechodzi przez RLS                        |
| `service_role` key  | Wyłącznie w Edge Functions (Supabase Vault) — omija RLS, nigdy w kliencie mobilnym |
| Webhook RevenueCat  | Edge Function weryfikuje sygnaturę → `service_role` aktualizuje `profiles`         |
| IP w `ai_usage_log` | SHA-256 hash z solą — nie raw IP (GDPR compliance)                                 |
| Produkty            | Niemodyfikowalne przez użytkownika w MVP                                           |
| Historia obliczeń   | Append-only dla użytkownika — brak UPDATE/DELETE, limit przez trigger DB           |
| Premium kolumny     | Aktualizacja wyłącznie przez `service_role` via Edge Function                      |

---

## 8. Architektura trybu `dish` — przepływ danych

```
Użytkownik
    │ tekst przepisu (max 200 znaków)
    ▼
Edge Function (Supabase Deno)
    │ Walidacja JWT + limit rate (ai_usage_log)
    │ Sprawdzenie is_premium / trial_ai_used_at
    │ Prompt z enumem 3 cooking_method slugs (boiling, frying, baking)
    ▼
OpenRouter AI (LLM)
    │ [{ingredient_name, cooking_method_slug, raw_weight_g, cooked_weight_g}]
    ▼
Edge Function — mapowanie i walidacja
    ├─ pg_trgm search → product_id (products.name)
    ├─ lookup product_cooking_factors
    │     ├─ znaleziony → yield_source: 'db' ✅
    │     └─ brak → yield_source: 'ai', cooked/raw, dodaj do warnings ⚠️
    └─ kalkulacja makro deterministycznie z tabeli products
    │
    ▼
calculations (INSERT via service_role)
    result JSONB — tablica items + total + per_100g
    warnings JSONB — nierozpoznane składniki
```

---

## 9. Decyzje projektowe i uzasadnienia

| Decyzja                                                  | Uzasadnienie                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Relacyjna tabela `product_cooking_factors` zamiast JSONB | Łatwiejsze zapytania agregujące, prostsze dodawanie metod post-MVP                  |
| `result` jako JSONB z ustaloną strukturą                 | Umożliwia eksport i analitykę bez migracji schematu                                 |
| Soft delete `deleted_at` w `products`                    | Zachowanie integralności FK w `calculations` po usunięciu produktu                  |
| `trial_ai_used_at TIMESTAMPTZ` zamiast `BOOLEAN`         | Darmowa analityka konwersji (kiedy trial był użyty)                                 |
| `avatar_url TEXT` zamiast bytes                          | URL do Supabase Storage — brak przechowywania binarnych danych w DB                 |
| `NUMERIC(6,2)` dla makroskładników                       | Dokładność do 0.01g bez błędów arytmetyki float                                     |
| Trigger (nie cron) do limitu 100 obliczeń                | Gwarancja natychmiastowego egzekwowania limitu, brak opóźnień                       |
| Tłumaczenia nazw poza DB (i18n)                          | Brak migracji przy dodawaniu nowych języków                                         |
| `source_enum ('system', 'user')` + partial UNIQUE index  | Zapobiega duplikatom produktów z różnych źródeł; NULL dla produktów user (post-MVP) |
| `ai_usage_log.ip_hash` jako SHA-256                      | GDPR compliance — brak przechowywania raw IP                                        |
| Brak `is_active` w `cooking_methods`                     | 3 metody MVP są stałe — prostszy schemat                                            |

---

## 10. Decyzje odłożone na post-MVP

| Temat                                | Notatka                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `dish_calculation_items`             | Migracja z `result JSONB` gdy wymagana analityka per składnik              |
| `products.created_by_user_id`        | Kolumna w schemacie (nullable), logika i RLS aktywne post-MVP              |
| `products.ean`                       | Kolumna w schemacie (nullable), skanowanie EAN i produkty markowe post-MVP |
| Google OAuth                         | Supabase Auth obsługuje bez zmian schematu DB                              |
| `saturated_fat_g` i mikroskładniki   | `ADD COLUMN` gdy potrzebne (NUMERIC(6,2))                                  |
| Redis / zewnętrzny rate limiter      | Rewizja `ai_usage_log` przy skalowaniu ruchu powyżej MVP                   |
| Produkty dodawane przez użytkowników | Architektura RLS do przeprojektowania przy aktywacji                       |
| Podwyższony limit znaków dla Premium | Zmiana walidacji w Edge Function + UI                                      |
