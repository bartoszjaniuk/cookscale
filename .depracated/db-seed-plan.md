# CookScale — Plan seedu bazy danych (MVP)

## 0. Cel i zakres

Celem seedu jest wypełnienie tabel `products` i `product_cooking_factors` produktami ogólnymi
(bez EAN, bez `created_by_user_id`) pokrywającymi 6 kategorii MVP:
**Meat, Fish, Vegetables, Legumes, Grains, Dairy**.

Dane makroskładnikowe pochodzą z dwóch źródeł:

- **USDA FoodData Central** (`source = 'usda'`) — priorytetowe, wygrywa przy konflikcie
- **Open Food Facts** (`source = 'openfoodfacts'`) — uzupełniające dla produktów nieobecnych w USDA

Dane yield factors (współczynniki zmiany gramatury) są zakodowane statycznie w kodzie skryptu
(`scripts/seed/data/yield-factors.ts`) na podstawie wartości z USDA Agriculture Handbook No. 102 (AH-102).
Nie są pobierane z żadnego API ani parsowane z plików zewnętrznych — patrz §2.3 i §12.

Seed jest **jednorazowy** i wykonywany przez skrypt po stronie `service_role` (omija RLS).
Tabele `categories` i `cooking_methods` są już wypełnione przez migrację `20260503121002`.

---

## 1. Docelowa liczba produktów

| Kategoria  | Produkty USDA | Produkty OFF (uzupełnienie) | Razem  |
| ---------- | :-----------: | :-------------------------: | :----: |
| Meat       |      12       |              3              |   15   |
| Fish       |      10       |              2              |   12   |
| Vegetables |      20       |              5              |   25   |
| Legumes    |       8       |              2              |   10   |
| Grains     |      10       |              2              |   12   |
| Dairy      |       8       |              2              |   10   |
| **Razem**  |    **68**     |           **16**            | **84** |

Dla każdego produktu seedowane są yield factors dla wszystkich metod obróbki, dla których
USDA publikuje dane. Brak wiersza w `product_cooking_factors` = metoda niedostępna dla produktu.

---

## 2. Źródła danych

### 2.1 USDA FoodData Central

**API:** `https://api.nal.usda.gov/fdc/v1/`  
**Klucz:** bezpłatny klucz API (rejestracja na https://fdc.nal.usda.gov/api-key-signup.html)  
**Typ danych:** `Foundation Foods` i `SR Legacy` (produkty ogólne, bez marek)

Używane endpointy:

```
GET /fdc/v1/foods/search?query={nazwa}&dataType=Foundation,SR+Legacy&api_key={KEY}
GET /fdc/v1/food/{fdcId}?api_key={KEY}
```

Mapowanie pól USDA → kolumny `products`:

| Pole USDA                      | Kolumna DB      | Uwagi                   |
| ------------------------------ | --------------- | ----------------------- |
| `fdcId` (string)               | `external_id`   | Przechowywany jako TEXT |
| `'usda'`                       | `source`        | Enum stały              |
| `description`                  | `name`          | Oczyszczony (patrz §4)  |
| Nutrient 208 (Energy)          | `calories_kcal` | kcal per 100g           |
| Nutrient 203 (Protein)         | `protein_g`     | g per 100g              |
| Nutrient 204 (Total lipid/fat) | `fat_g`         | g per 100g              |
| Nutrient 205 (Carbohydrate)    | `carbs_g`       | g per 100g              |
| Nutrient 291 (Fiber)           | `fiber_g`       | g per 100g, nullable    |
| Nutrient 269 (Sugars)          | `sugar_g`       | g per 100g, nullable    |
| Nutrient 307 (Sodium)          | `sodium_mg`     | mg per 100g, nullable   |

> **Yield factors nie są pobierane przez API.** FDC API nie udostępnia yield factors,
> a kody SR używane w tabelach AH-102 różnią się od `fdcId` i nie mapują się niezawodnie
> automatycznie. Yield factors są traktowane jako dane statyczne w kodzie — patrz §2.3.

### 2.2 Open Food Facts

**API:** `https://world.openfoodfacts.org/api/v2/`  
**Klucz:** brak wymagany (open source)  
**Ograniczenia:** rate limit ~100 req/min; User-Agent wymagany

Używane endpointy:

```
GET https://world.openfoodfacts.org/cgi/search.pl
  ?search_terms={nazwa}
  &tagtype_0=categories
  &tag_contains_0=contains
  &tag_0={kategoria_off}
  &fields=code,product_name,nutriments
  &json=1
  &page_size=10
```

Mapowanie pól OFF → kolumny `products`:

| Pole OFF                        | Kolumna DB      | Uwagi                           |
| ------------------------------- | --------------- | ------------------------------- |
| `code`                          | `external_id`   | Kod EAN (TEXT)                  |
| `'openfoodfacts'`               | `source`        | Enum stały                      |
| `product_name`                  | `name`          | Oczyszczony                     |
| `nutriments.energy-kcal_100g`   | `calories_kcal` |                                 |
| `nutriments.proteins_100g`      | `protein_g`     |                                 |
| `nutriments.fat_100g`           | `fat_g`         |                                 |
| `nutriments.carbohydrates_100g` | `carbs_g`       |                                 |
| `nutriments.fiber_100g`         | `fiber_g`       | nullable                        |
| `nutriments.sugars_100g`        | `sugar_g`       | nullable                        |
| `nutriments.sodium_100g` × 1000 | `sodium_mg`     | OFF podaje w g, przelicz × 1000 |

OFF **nie dostarcza** yield factors — dla produktów z OFF współczynniki przypisywane są
na podstawie najbliższego odpowiednika USDA zgodnie z mapą w `yield-factors.ts` (§2.3).

### 2.3 Yield factors — dane statyczne w kodzie

**Źródło:** USDA Agriculture Handbook No. 102 (AH-102), wartości przepisane ręcznie.

**Uzasadnienie decyzji:** FDC API nie udostępnia yield factors. Kody SR używane w tabelach
AH-102 różnią się od `fdcId` z nowego FDC API i nie mapują się niezawodnie automatycznie —
parsowanie byłoby kruche i podatne na błędy. AH-102 to stabilny dokument naukowy
(ostatnia aktualizacja: lata 90.), którego wartości nie zmieniają się — zakodowanie ich
na twardo jest świadomą decyzją, nie długiem technicznym.

**Implementacja:** plik `scripts/seed/data/yield-factors.ts` zawiera kompletną mapę:

```typescript
// Klucz: externalId produktu (fdcId dla USDA, 'off_{slug}' dla OFF)
// Wartość: mapa slug-metody → yield_factor (z AH-102)
export const YIELD_FACTORS: Record<string, Record<string, number>> = {
	"171477": {
		// Chicken Breast — wartości z AH-102
		boiling: 0.74,
		steaming: 0.76,
		pan_frying_fat: 0.75,
		pan_frying_dry: 0.74,
		baking: 0.71,
		grilling: 0.72,
	},
	// ... pozostałe produkty
};
```

Produkty z OFF używają klucza `'off_{slug}'` (np. `'off_chicken_wings'`) zamiast fdcId,
z wartościami przepisanymi z najbliższego odpowiednika USDA wskazanego w kolumnie
"Yield z" w tabelach §3.

**Aktualizacja danych:** przy dodaniu nowego produktu — dopisanie wpisu do tej mapy ręcznie.
Nie wymaga zmian w żadnym innym pliku.

---

## 3. Lista produktów do seedowania

### 3.1 Meat (mięso)

| Nazwa produktu         | Źródło | external_id (USDA fdcId) | Metody obróbki                             |
| ---------------------- | ------ | ------------------------ | ------------------------------------------ |
| Chicken breast, raw    | usda   | 171477                   | boil, steam, pan_fat, pan_dry, bake, grill |
| Chicken thigh, raw     | usda   | 171478                   | boil, pan_fat, pan_dry, bake, grill        |
| Turkey breast, raw     | usda   | 171497                   | bake, grill, pan_dry                       |
| Beef, ground, 80% lean | usda   | 174036                   | pan_fat, pan_dry, bake, grill              |
| Beef, sirloin steak    | usda   | 174494                   | pan_fat, pan_dry, grill                    |
| Pork loin, raw         | usda   | 167903                   | bake, pan_fat, pan_dry, grill              |
| Pork tenderloin, raw   | usda   | 167905                   | bake, pan_fat, grill                       |
| Bacon, raw             | usda   | 168320                   | pan_fat, pan_dry                           |
| Lamb, ground, raw      | usda   | 174352                   | pan_fat, pan_dry, bake                     |
| Veal, loin, raw        | usda   | 172544                   | pan_fat, pan_dry, bake                     |
| Duck breast, raw       | usda   | 171490                   | pan_fat, bake, grill                       |
| Chicken liver, raw     | usda   | 172559                   | pan_fat, pan_dry                           |
| Chicken wings, raw     | off    | (OFF code)               | bake, grill                                |
| Beef ribeye steak, raw | off    | (OFF code)               | pan_fat, grill                             |
| Sausage, pork, raw     | off    | (OFF code)               | pan_fat, pan_dry, grill                    |

### 3.2 Fish (ryby)

| Nazwa produktu        | Źródło | external_id (USDA fdcId) | Metody obróbki                       |
| --------------------- | ------ | ------------------------ | ------------------------------------ |
| Salmon, Atlantic, raw | usda   | 175167                   | bake, pan_fat, pan_dry, steam, grill |
| Tuna, light, raw      | usda   | 175159                   | bake, pan_dry, grill                 |
| Cod, raw              | usda   | 175154                   | bake, steam, boil, pan_dry           |
| Tilapia, raw          | usda   | 175181                   | bake, pan_fat, pan_dry, grill        |
| Herring, raw          | usda   | 175142                   | bake, pan_fat, grill                 |
| Mackerel, raw         | usda   | 175149                   | bake, pan_fat, grill                 |
| Trout, raw            | usda   | 175176                   | bake, pan_fat, grill                 |
| Shrimp, raw           | usda   | 175177                   | boil, steam, pan_fat, pan_dry, grill |
| Pollock, raw          | usda   | 175158                   | bake, pan_dry, grill                 |
| Sardine, raw          | usda   | 175140                   | bake, grill                          |
| Tuna steak, raw       | off    | (OFF code)               | pan_dry, grill                       |
| Sea bass, raw         | off    | (OFF code)               | bake, pan_fat, grill                 |

### 3.3 Vegetables (warzywa)

| Nazwa produktu        | Źródło | external_id (USDA fdcId) | Metody obróbki                    |
| --------------------- | ------ | ------------------------ | --------------------------------- |
| Broccoli, raw         | usda   | 170379                   | boil, steam                       |
| Carrot, raw           | usda   | 170393                   | boil, steam, bake                 |
| Potato, raw           | usda   | 170026                   | boil, steam, bake                 |
| Sweet potato, raw     | usda   | 168483                   | boil, steam, bake                 |
| Onion, raw            | usda   | 170000                   | pan_fat, bake                     |
| Tomato, raw           | usda   | 170457                   | bake, pan_dry                     |
| Zucchini, raw         | usda   | 169291                   | boil, steam, bake, pan_fat, grill |
| Spinach, raw          | usda   | 168462                   | boil, steam, pan_fat              |
| Bell pepper, raw      | usda   | 170108                   | bake, pan_fat, grill              |
| Cauliflower, raw      | usda   | 170397                   | boil, steam, bake                 |
| Cabbage, raw          | usda   | 169975                   | boil, steam                       |
| Mushroom, white, raw  | usda   | 169251                   | pan_fat, pan_dry, bake            |
| Green beans, raw      | usda   | 169961                   | boil, steam                       |
| Asparagus, raw        | usda   | 168389                   | boil, steam, grill, bake          |
| Eggplant, raw         | usda   | 169228                   | bake, pan_fat, grill              |
| Leek, raw             | usda   | 169246                   | boil, pan_fat                     |
| Garlic, raw           | usda   | 169230                   | bake, pan_fat                     |
| Corn, raw             | usda   | 169997                   | boil, steam, grill                |
| Peas, green, raw      | usda   | 170420                   | boil, steam                       |
| Beet, raw             | usda   | 169145                   | boil, bake                        |
| Brussels sprouts, raw | off    | (OFF code)               | boil, steam, bake                 |
| Celery, raw           | off    | (OFF code)               | boil, pan_fat                     |
| Kale, raw             | off    | (OFF code)               | boil, steam, pan_fat              |
| Cucumber, raw         | off    | (OFF code)               | (brak — surowy produkt)           |
| Parsnip, raw          | off    | (OFF code)               | boil, bake                        |

### 3.4 Legumes (strączki)

| Nazwa produktu         | Źródło | external_id (USDA fdcId) | Metody obróbki |
| ---------------------- | ------ | ------------------------ | -------------- |
| Lentils, raw           | usda   | 172420                   | boil           |
| Chickpeas, raw         | usda   | 173756                   | boil           |
| Black beans, raw       | usda   | 173735                   | boil           |
| Kidney beans, red, raw | usda   | 173744                   | boil           |
| White beans, raw       | usda   | 175198                   | boil           |
| Pinto beans, raw       | usda   | 175199                   | boil           |
| Soybeans, raw          | usda   | 174270                   | boil, steam    |
| Green split peas, raw  | usda   | 174284                   | boil           |
| Edamame, raw           | off    | (OFF code)               | boil, steam    |
| Mung beans, raw        | off    | (OFF code)               | boil           |

### 3.5 Grains (zboża i kasze)

| Nazwa produktu          | Źródło | external_id (USDA fdcId) | Metody obróbki |
| ----------------------- | ------ | ------------------------ | -------------- |
| White rice, raw         | usda   | 169756                   | boil, steam    |
| Brown rice, raw         | usda   | 168878                   | boil, steam    |
| Pasta, dry              | usda   | 168934                   | boil           |
| Oats, rolled, dry       | usda   | 173904                   | boil           |
| Quinoa, raw             | usda   | 168917                   | boil, steam    |
| Buckwheat, raw          | usda   | 170284                   | boil           |
| Couscous, dry           | usda   | 169700                   | boil, steam    |
| Pearl barley, raw       | usda   | 170283                   | boil           |
| Bulgur, dry             | usda   | 170285                   | boil           |
| Millet, raw             | usda   | 169702                   | boil, steam    |
| Whole wheat pasta, dry  | off    | (OFF code)               | boil           |
| Polenta / cornmeal, dry | off    | (OFF code)               | boil           |

### 3.6 Dairy (nabiał)

| Nazwa produktu       | Źródło | external_id (USDA fdcId) | Metody obróbki         |
| -------------------- | ------ | ------------------------ | ---------------------- |
| Whole milk           | usda   | 171265                   | (brak—płyn)            |
| Yogurt, plain, whole | usda   | 171284                   | (brak)                 |
| Cottage cheese       | usda   | 173416                   | (brak)                 |
| Cheddar cheese       | usda   | 173414                   | (brak)                 |
| Mozzarella cheese    | usda   | 171241                   | (brak)                 |
| Egg, whole, raw      | usda   | 171287                   | boil, pan_fat, pan_dry |
| Butter, unsalted     | usda   | 173410                   | (brak)                 |
| Greek yogurt, plain  | usda   | 170903                   | (brak)                 |
| Cream cheese         | off    | (OFF code)               | (brak)                 |
| Parmesan cheese      | off    | (OFF code)               | (brak)                 |

> **Uwaga:** Produkty mleczne bez metod obróbki termicznej są seedowane wyłącznie z makrami
> (zerowa liczba wierszy w `product_cooking_factors`). Aplikacja obsłuży to przez brak
> wyświetlania selektora metody dla tych produktów (filtr po dostępnych metodach).

---

## 4. Zasady czyszczenia i normalizacji danych

### 4.1 Nazwa produktu (`name`)

- Usunięcie tagów opisujących stan (`", raw"`, `", cooked"`) — przechowujemy zawsze stan surowy
- Usunięcie przyrostków USDA (`"NFS"` = Not Further Specified)
- Zamiana na Title Case, max 80 znaków
- Usunięcie zbędnych przecinków i nawiasów
- Przykład: `"CHICKEN, BROILERS OR FRYERS, BREAST, MEAT ONLY, RAW"` → `"Chicken Breast"`

### 4.2 Wartości makroskładników

- Zaokrąglenie do 2 miejsc po przecinku (`NUMERIC(6,2)`)
- Wartości `null` / `undefined` / `0` dla fiber, sugar, sodium → `NULL` w DB (nie `0`)
- Kalorie, białko, tłuszcz, węglowodany są **wymagane** — produkty bez tych danych pomijane
- Wartość ujemna → `NULL` (błąd danych źródłowych)

### 4.3 Deduplikacja

- Produkty z USDA i OFF porównywane po znormalizowanej nazwie (lowercase, bez spacji)
- Jeśli ten sam produkt istnieje w obu źródłach: **USDA wygrywa**, wersja OFF pomijana
- Constraint `UNIQUE(external_id, source)` zabezpiecza przed ponownym importem

---

## 5. Yield factors — kompletne wartości statyczne (AH-102)

Yield factors wyrażają stosunek: `masa_po_obróbce / masa_przed_obróbką`.
Wszystkie wartości poniżej są przepisane z AH-102 i trafiają bezpośrednio
do `scripts/seed/data/yield-factors.ts` — nie są pobierane z żadnego API.

### 5.1 Przykładowe wartości kluczowych produktów

| Produkt                 | boiling | steaming | pan_frying_fat | pan_frying_dry | baking | grilling |
| ----------------------- | :-----: | :------: | :------------: | :------------: | :----: | :------: |
| Chicken breast          | 0.7400  |  0.7600  |     0.7500     |     0.7400     | 0.7100 |  0.7200  |
| Beef, ground 80%        |    —    |    —     |     0.7100     |     0.7000     | 0.6800 |  0.6900  |
| Salmon, Atlantic        |    —    |  0.8100  |     0.8400     |     0.8200     | 0.8500 |  0.8000  |
| Broccoli                | 0.9100  |  0.9300  |       —        |       —        |   —    |    —     |
| Potato                  | 0.9600  |  0.9800  |       —        |       —        | 0.9300 |    —     |
| White rice (dry→cooked) | 2.8000  |  2.6000  |       —        |       —        |   —    |    —     |
| Lentils (dry→cooked)    | 2.5000  |    —     |       —        |       —        |   —    |    —     |
| Egg, whole              | 0.9800  |    —     |     0.9600     |     0.9700     |   —    |    —     |

> **Uwaga dla ryżu i strączków:** yield factor > 1.0 oznacza przyrost masy (absorpcja wody).
> Schemat obsługuje to poprawnie — constraint `chk_yield_factor_positive` wymaga `> 0`.

### 5.2 Źródło i zasada przypisania

Wszystkie wartości pochodzą z **USDA Agriculture Handbook No. 102 (AH-102)**,
przepisane ręcznie do `yield-factors.ts`. Nie są parsowane z pliku ani pobierane przez API
(patrz decyzja w §2.3 i §12).

Produkty z OFF nie mają własnych yield factors w AH-102 — używają wartości z najbliższego
odpowiednika USDA dla tych samych metod obróbki:

- Chicken wings → wartości z Chicken thigh (171478)
- Beef ribeye → wartości z Beef sirloin (174494)
- Pork sausage → wartości z Pork loin (167903), obniżone o 5% (wyższy udział tłuszczu)
- Tuna steak → wartości z Tuna light (175159)
- Sea bass → wartości z Trout (175176)
- Brussels sprouts → wartości z Broccoli (170379)
- Celery → wartości z Leek (169246)
- Kale → wartości z Spinach (168462)
- Parsnip → wartości z Carrot (170393)
- Edamame → wartości z Peas green (170420)
- Mung beans → wartości z Black beans (173735)
- Whole wheat pasta → wartości z Pasta dry (168934)
- Polenta/cornmeal → osobna wartość (3.50) z literatury żywieniowej

---

## 6. Architektura skryptu seedującego

```
scripts/
├── seed/
│   ├── index.ts                  # główny entrypoint
│   ├── config.ts                 # SUPABASE_URL, SERVICE_ROLE_KEY, klucze API
│   ├── sources/
│   │   ├── usda.ts               # fetchUSDAProduct(fdcId) → NormalizedProduct
│   │   └── openfoodfacts.ts      # fetchOFFProduct(query) → NormalizedProduct
│   ├── transformers/
│   │   ├── normalize.ts          # czyszczenie nazw, zaokrąglenia, null handling
│   │   └── yieldFactors.ts       # lookup funkcja: externalId + methodSlug → yield_factor (z yield-factors.ts)
│   ├── loaders/
│   │   ├── products.ts           # upsert do public.products
│   │   └── cookingFactors.ts     # upsert do public.product_cooking_factors
│   ├── data/
│   │   ├── product-list.ts       # lista produktów z §3 jako tablica obiektów
│   │   └── yield-factors.ts      # statyczna mapa yield factors z §5
│   └── utils/
│       ├── retry.ts              # exponential backoff dla API calls
│       └── logger.ts             # progress logging
```

**Runtime:** Node.js (TypeScript via ts-node lub tsx)  
**Połączenie z DB:** Supabase JS Client z `service_role` key (omija RLS)  
**Uwierzytelnienie:** zmienne środowiskowe w `.env` (nie w repozytorium)

---

## 7. Algorytm wykonania seedu

```
1. INIT
   ├─ Połącz z Supabase (service_role)
   ├─ Pobierz UUID kategorii z public.categories (slug → id)
   └─ Pobierz UUID metod z public.cooking_methods (slug → id)

2. DLA KAŻDEGO produktu z product-list.ts:
   a. Jeśli source == 'usda':
      ├─ GET /fdc/v1/food/{fdcId} z retry (3x, backoff 1s/2s/4s)
      ├─ Zmapuj pola na NormalizedProduct
      └─ Przejdź do kroku 3
   b. Jeśli source == 'openfoodfacts':
      ├─ GET OFF search API z retry
      ├─ Wybierz pierwszy wynik z nutriments != null
      └─ Przejdź do kroku 3

3. WALIDACJA:
   ├─ calories_kcal, protein_g, fat_g, carbs_g != null → kontynuuj
   └─ W przeciwnym razie: log WARN i POMIŃ produkt

4. UPSERT products:
   INSERT INTO public.products (...)
   ON CONFLICT (external_id, source) DO UPDATE SET
     name = EXCLUDED.name,
     calories_kcal = EXCLUDED.calories_kcal,
     ... (wszystkie makro)
     updated_at = now()
   RETURNING id

5. UPSERT product_cooking_factors:
   ├─ Pobierz yield factors z yieldFactors.ts dla tego produktu
   └─ DLA KAŻDEJ dostępnej metody:
      INSERT INTO public.product_cooking_factors (product_id, cooking_method_id, yield_factor)
      ON CONFLICT (product_id, cooking_method_id) DO UPDATE SET
        yield_factor = EXCLUDED.yield_factor

6. LOG: produkt zapisany / pominięty / błąd

7. KONIEC: podsumowanie (N produktów, M yield factors, K błędów)
```

**Rate limiting:**

- USDA API: max 1000 req/hour przy kluczu — brak problemu dla ~84 produktów
- OFF API: max 100 req/min — dodaj delay 700ms między requestami

---

## 8. Plik konfiguracyjny produktów (struktura)

```typescript
// scripts/seed/data/product-list.ts

export interface ProductSeedEntry {
	name: string; // nazwa do logów, nie wpisywana do DB (pochodzi z API)
	source: "usda" | "openfoodfacts";
	externalId: string; // fdcId (USDA) lub szukana fraza dla OFF
	yieldKey: string; // klucz do YIELD_FACTORS: fdcId dla USDA, 'off_{slug}' dla OFF
	categorySlug: "meat" | "fish" | "vegetables" | "legumes" | "grains" | "dairy";
	cookingMethodSlugs: string[]; // metody, dla których istnieją yield factors w AH-102
}

export const PRODUCTS: ProductSeedEntry[] = [
	{
		name: "Chicken breast",
		source: "usda",
		externalId: "171477",
		categorySlug: "meat",
		cookingMethodSlugs: [
			"boiling",
			"steaming",
			"pan_frying_fat",
			"pan_frying_dry",
			"baking",
			"grilling",
		],
	},
	// ... pozostałe produkty
];
```

```typescript
// scripts/seed/data/yield-factors.ts

// Klucz: externalId (fdcId lub OFF code)
// Wartość: mapa slug metody → yield_factor
export const YIELD_FACTORS: Record<string, Record<string, number>> = {
	// --- USDA: klucz = fdcId ---
	"171477": {
		// Chicken Breast (AH-102)
		boiling: 0.74,
		steaming: 0.76,
		pan_frying_fat: 0.75,
		pan_frying_dry: 0.74,
		baking: 0.71,
		grilling: 0.72,
	},
	// --- OFF: klucz = 'off_{slug}', wartości z odpowiednika USDA ---
	off_chicken_wings: {
		// → yield z Chicken thigh (171478)
		baking: 0.71,
		grilling: 0.71,
	},
	// ... pozostałe produkty
};
```

---

## 9. Weryfikacja po seedzie

Po wykonaniu skryptu uruchom następujące zapytania w Supabase SQL Editor:

```sql
-- 1. Liczba produktów per kategoria i źródło
SELECT
  c.slug AS category,
  p.source,
  COUNT(*) AS product_count
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.deleted_at IS NULL
GROUP BY c.slug, p.source
ORDER BY c.slug, p.source;

-- 2. Liczba yield factors per metoda obróbki
SELECT
  cm.slug AS method,
  COUNT(*) AS factor_count
FROM public.product_cooking_factors pcf
JOIN public.cooking_methods cm ON pcf.cooking_method_id = cm.id
GROUP BY cm.slug
ORDER BY factor_count DESC;

-- 3. Produkty bez żadnych yield factors (nabiał i produkty surowe)
SELECT p.name, c.slug AS category
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.product_cooking_factors pcf ON pcf.product_id = p.id
WHERE pcf.id IS NULL AND p.deleted_at IS NULL
ORDER BY c.slug, p.name;

-- 4. Produkty z brakującymi makrami (powinno zwrócić 0 wierszy)
SELECT name, source
FROM public.products
WHERE
  calories_kcal IS NULL OR
  protein_g     IS NULL OR
  fat_g         IS NULL OR
  carbs_g       IS NULL;

-- 5. Test wyszukiwania trigramowego (pg_trgm)
SELECT name, source, calories_kcal
FROM public.active_products
WHERE name % 'chicken'
ORDER BY similarity(name, 'chicken') DESC
LIMIT 5;
```

**Akceptowane wyniki:**

- Zapytanie 1: min. 10 produktów w każdej kategorii, łącznie ~84
- Zapytanie 2: `boiling` i `baking` mają największą liczbę (pokrywają najwięcej produktów)
- Zapytanie 3: wyłącznie produkty z kategorii `dairy` (+ ewentualnie cucumber)
- Zapytanie 4: 0 wierszy
- Zapytanie 5: wyniki posortowane malejąco po podobieństwie

---

## 10. Kolejność wykonania i zależności

```
Migracje (już wykonane)
    │
    ▼
20260503121002 → categories + cooking_methods seed
    │
    ▼
Skrypt seed/index.ts
    ├─ Pobierz UUID kategorii i metod z DB
    ├─ Fetch makroskładników z USDA API (per produkt USDA, z retry)
    ├─ Fetch makroskładników z OFF API (per produkt OFF, z retry)
    ├─ Wczytaj yield factors z yield-factors.ts (dane statyczne, bez I/O)
    ├─ Upsert public.products
    └─ Upsert public.product_cooking_factors
```

Skrypt jest **idempotentny** — powtórne uruchomienie zaktualizuje dane zamiast tworzyć duplikaty
(`ON CONFLICT DO UPDATE`). Bezpieczne do uruchamiania wielokrotnie.

---

## 11. Zmienne środowiskowe wymagane do seedu

```env
# .env (nie commitować do repo)
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
USDA_API_KEY=<klucz_z_fdc.nal.usda.gov>
# OFF nie wymaga klucza, ale ustaw User-Agent:
OFF_USER_AGENT=CookScale/1.0 (contact@cookscale.app)
```

---

## 12. Decyzje i ograniczenia

| Decyzja                                                         | Uzasadnienie                                                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Yield factors jako dane statyczne w kodzie (`yield-factors.ts`) | FDC API nie udostępnia yield factors; kody SR z AH-102 nie mapują się 1:1 na `fdcId` — parsowanie byłoby kruche. AH-102 jest stabilny od lat 90. |
| OFF tylko jako uzupełnienie (16 z 84 produktów)                 | USDA ma lepszą jakość danych i jest autorytatywny dla yield factors                                                                              |
| Produkty mleczne bez yield factors                              | Nabiał spożywany jest zazwyczaj bez obróbki termicznej zmieniającej gramaturę                                                                    |
| Cucumber bez metod obróbki                                      | Ogórek jest produktem stricte surowym; brak USDA yield data                                                                                      |
| externalId przechowywany jako TEXT                              | Zachowuje spójność między USDA (liczby) i OFF (kody EAN z zerami wiodącymi)                                                                      |
| Upsert zamiast insert                                           | Bezpieczne ponowne seedowanie bez duplikatów; umożliwia aktualizację danych                                                                      |
