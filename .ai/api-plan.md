# REST API Plan — CookScale (MVP)

## 1. Resources

CookScale uses two API layers within Supabase:

- **PostgREST** (`/rest/v1/`) — auto-generated CRUD with RLS for standard data access
- **Edge Functions** (`/functions/v1/`) — Deno/TypeScript for business logic requiring LLM calls, webhook verification, or `service_role` operations

| Resource                | Primary Table                   | API Layer            | Auth Required  |
| ----------------------- | ------------------------------- | -------------------- | -------------- |
| Auth                    | `auth.users`                    | Supabase Auth native | —              |
| Products                | `products`                      | PostgREST            | No (anon key)  |
| Categories              | `categories`                    | PostgREST            | No (anon key)  |
| Cooking Methods         | `cooking_methods`               | PostgREST            | No (anon key)  |
| Product Cooking Factors | `product_cooking_factors`       | PostgREST            | No (anon key)  |
| Calculations            | `calculations`                  | PostgREST            | Yes (JWT)      |
| Profiles                | `profiles`                      | PostgREST            | Yes (JWT)      |
| AI Dish Calculation     | `calculations` + `ai_usage_log` | Edge Function        | Optional (JWT) |
| RevenueCat Webhook      | `profiles`                      | Edge Function        | Signature      |

---

## 2. Endpoints

### 2.1 Authentication — Supabase Auth (`/auth/v1/`)

All auth operations are handled natively by Supabase Auth. The mobile client uses the official Supabase JS SDK.

---

#### `POST /auth/v1/signup`

Register a new user with email and password.

**Request body:**

```json
{
	"email": "user@example.com",
	"password": "securepassword123"
}
```

**Success 200:**

```json
{
	"access_token": "<jwt>",
	"token_type": "bearer",
	"expires_in": 3600,
	"refresh_token": "<token>",
	"user": {
		"id": "uuid",
		"email": "user@example.com",
		"created_at": "2026-05-08T10:00:00Z"
	}
}
```

**Errors:**

- `400` — Email already registered or invalid format
- `422` — Password too short (< 8 characters)

> After successful signup the `trg_create_profile_on_signup` DB trigger automatically inserts a row into `profiles`.

---

#### `POST /auth/v1/token?grant_type=password`

Login with email and password.

**Request body:**

```json
{
	"email": "user@example.com",
	"password": "securepassword123"
}
```

**Success 200:** Same shape as signup response.

**Errors:**

- `400` — `{ "error": "invalid_grant", "error_description": "Invalid email or password" }` — generic message (no field disclosure)

---

#### `POST /auth/v1/logout`

Invalidate the current JWT session.

**Headers:** `Authorization: Bearer <jwt>`

**Success 204:** No content.

---

#### `POST /auth/v1/recover`

Request a password reset email.

**Request body:**

```json
{ "email": "user@example.com" }
```

**Success 200:** Always returns 200 regardless of whether the email exists (privacy protection per US-007).

---

### 2.2 Products — PostgREST (`/rest/v1/products`)

RLS policy: `SELECT` allowed for `anon` and `authenticated` where `deleted_at IS NULL`.

---

#### `GET /rest/v1/products`

Search products by name with trigram partial match. Used in product-mode search (US-008).

**Headers:** `apikey: <anon_key>` (or Bearer JWT for authenticated users)

**Query parameters:**

| Param         | Type    | Description                                                                       |
| ------------- | ------- | --------------------------------------------------------------------------------- |
| `select`      | string  | Fields to return (see below)                                                      |
| `name`        | filter  | `ilike.*{query}*` — case-insensitive partial match using `idx_products_name_trgm` |
| `category_id` | filter  | `eq.{uuid}` — filter by category                                                  |
| `order`       | string  | `name.asc`                                                                        |
| `limit`       | integer | Max results, default `20`                                                         |
| `offset`      | integer | Pagination offset, default `0`                                                    |

Recommended `select`:

```
id,name,calories_kcal,protein_g,fat_g,carbs_g,fiber_g,category_id,
product_cooking_factors(cooking_method_id,yield_factor,cooking_methods(id,slug))
```

**Success 200:**

```json
[
	{
		"id": "uuid",
		"name": "chicken breast",
		"calories_kcal": 110.0,
		"protein_g": 23.1,
		"fat_g": 1.2,
		"carbs_g": 0.0,
		"fiber_g": 0.0,
		"category_id": "uuid",
		"product_cooking_factors": [
			{
				"cooking_method_id": "uuid",
				"yield_factor": 0.84,
				"cooking_methods": { "id": "uuid", "slug": "baking" }
			},
			{
				"cooking_method_id": "uuid",
				"yield_factor": 0.75,
				"cooking_methods": { "id": "uuid", "slug": "boiling" }
			}
		]
	}
]
```

**Response headers:** `Content-Range: 0-19/143`

**Errors:**

- `400` — Invalid filter syntax

> The mobile client uses this endpoint for real-time search (after ≥ 2 characters). The embedded `product_cooking_factors` join eliminates a second round trip. The list of available `cooking_methods` within factors allows the UI to show only supported methods for a given product (no row in `product_cooking_factors` = method unsupported).

---

#### `GET /rest/v1/products?id=eq.{uuid}`

Fetch a single product by ID (e.g. when re-loading from calculation history).

Same `select` as above. Returns an array with one element.

---

### 2.3 Categories — PostgREST (`/rest/v1/categories`)

RLS: `SELECT` public.

#### `GET /rest/v1/categories`

List all product categories. Fetched once on app startup and cached client-side.

**Query:** `select=id,name,slug&order=name.asc`

**Success 200:**

```json
[
	{ "id": "uuid", "name": "Dairy", "slug": "dairy" },
	{ "id": "uuid", "name": "Fish", "slug": "fish" },
	{ "id": "uuid", "name": "Grains", "slug": "grains" },
	{ "id": "uuid", "name": "Legumes", "slug": "legumes" },
	{ "id": "uuid", "name": "Meat", "slug": "meat" },
	{ "id": "uuid", "name": "Vegetables", "slug": "vegetables" }
]
```

---

### 2.4 Cooking Methods — PostgREST (`/rest/v1/cooking_methods`)

RLS: `SELECT` public.

#### `GET /rest/v1/cooking_methods`

List all cooking methods. Fetched once on app startup and cached client-side.

**Query:** `select=id,slug&order=slug.asc`

**Success 200:**

```json
[
	{ "id": "uuid", "slug": "baking" },
	{ "id": "uuid", "slug": "boiling" },
	{ "id": "uuid", "slug": "frying" }
]
```

> Names displayed in UI are resolved via i18n keys (`cooking_methods.baking`, `cooking_methods.boiling`, `cooking_methods.frying`) — not stored in DB.

---

### 2.5 Product Cooking Factors — PostgREST (`/rest/v1/product_cooking_factors`)

RLS: `SELECT` public. This data is embedded in product responses (see §2.2), but may be fetched independently.

#### `GET /rest/v1/product_cooking_factors?product_id=eq.{uuid}`

Get all yield factors for a product.

**Query:** `select=id,yield_factor,cooking_method_id,cooking_methods(id,slug)&product_id=eq.{uuid}`

**Success 200:**

```json
[
	{
		"id": "uuid",
		"yield_factor": 0.84,
		"cooking_method_id": "uuid",
		"cooking_methods": { "id": "uuid", "slug": "baking" }
	}
]
```

---

### 2.6 Calculations — PostgREST (`/rest/v1/calculations`)

RLS: Authenticated users may `SELECT` and `INSERT` their own rows only. `UPDATE` and `DELETE` are explicitly denied. A DB trigger (`trg_limit_calculations_per_user`) automatically evicts the oldest record when the per-user count exceeds 100.

---

#### `GET /rest/v1/calculations`

Retrieve calculation history for the authenticated user. RLS automatically scopes results to `auth.uid() = user_id` — no explicit filter needed.

**Headers:** `Authorization: Bearer <jwt>` (required)

**Query:**

```
select=id,type,direction,created_at,input,result,warnings,product_id,cooking_method_id,input_text
&order=created_at.desc
&limit=50
&offset=0
```

**Success 200:**

```json
[
	{
		"id": "uuid",
		"type": "product",
		"direction": "raw_to_cooked",
		"created_at": "2026-05-08T10:00:00Z",
		"input": {
			"weight_g": 200,
			"product_name": "chicken breast",
			"cooking_method_slug": "baking"
		},
		"result": {
			"product_id": "uuid",
			"product_name": "chicken breast",
			"cooking_method_slug": "baking",
			"direction": "raw_to_cooked",
			"input_weight_g": 200,
			"output_weight_g": 168,
			"yield_factor": 0.84,
			"macros_per_100g": {
				"calories_kcal": 110.0,
				"protein_g": 23.1,
				"fat_g": 1.2,
				"carbs_g": 0.0
			},
			"macros_total": {
				"calories_kcal": 184.8,
				"protein_g": 38.8,
				"fat_g": 2.0,
				"carbs_g": 0.0
			}
		},
		"warnings": null,
		"product_id": "uuid",
		"cooking_method_id": "uuid",
		"input_text": null
	}
]
```

**Response headers:** `Content-Range: 0-49/82`

**Errors:**

- `401` — Missing or invalid JWT

---

#### `POST /rest/v1/calculations`

Save a product-mode calculation result. The client performs the calculation locally (using cached yield factors), then persists the result here.

**Headers:** `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `Prefer: return=representation`

**Request body:**

```json
{
	"user_id": "uuid",
	"type": "product",
	"direction": "raw_to_cooked",
	"product_id": "uuid",
	"cooking_method_id": "uuid",
	"input": {
		"weight_g": 200,
		"product_name": "chicken breast",
		"cooking_method_slug": "baking"
	},
	"result": {
		"product_id": "uuid",
		"product_name": "chicken breast",
		"cooking_method_slug": "baking",
		"direction": "raw_to_cooked",
		"input_weight_g": 200,
		"output_weight_g": 168,
		"yield_factor": 0.84,
		"macros_per_100g": {
			"calories_kcal": 110.0,
			"protein_g": 23.1,
			"fat_g": 1.2,
			"carbs_g": 0.0
		},
		"macros_total": {
			"calories_kcal": 184.8,
			"protein_g": 38.8,
			"fat_g": 2.0,
			"carbs_g": 0.0
		}
	}
}
```

**Success 201:** Returns the inserted row (same shape as GET history item).

**Errors:**

- `401` — Missing or invalid JWT
- `403` — `user_id` does not match `auth.uid()` (RLS violation)
- `422` — Constraint violation (`chk_calc_product_fields` — missing `product_id`, `direction`, or `cooking_method_id`)

> For `direction = "cooked_to_raw"` (reverse mode, US-010), swap the semantics in `input` and `result` but keep the same JSON structure — `input_weight_g` becomes the cooked weight and `output_weight_g` becomes the computed raw weight.

---

### 2.7 Profiles — PostgREST (`/rest/v1/profiles`)

RLS: Authenticated users may `SELECT` and `UPDATE` their own row only. Premium-related columns (`is_premium`, `premium_expires_at`, `revenuecat_customer_id`, `trial_ai_used_at`, `anonymous_calc_count`) are only writable via `service_role`.

---

#### `GET /rest/v1/profiles`

Get the authenticated user's profile. RLS scopes the result to the requesting user.

**Headers:** `Authorization: Bearer <jwt>`

**Query:** `select=id,is_premium,premium_expires_at,preferred_language,trial_ai_used_at,avatar_url,created_at`

**Success 200:**

```json
[
	{
		"id": "uuid",
		"is_premium": false,
		"premium_expires_at": null,
		"preferred_language": "pl",
		"trial_ai_used_at": null,
		"avatar_url": null,
		"created_at": "2026-05-08T10:00:00Z"
	}
]
```

**Errors:**

- `401` — Missing JWT

> The client reads `trial_ai_used_at` to know whether the free AI trial has been consumed. `is_premium` and `premium_expires_at` gate the AI mode access.

---

#### `PATCH /rest/v1/profiles?id=eq.{uuid}`

Update user-editable profile fields: `preferred_language` and `avatar_url` only.

**Headers:** `Authorization: Bearer <jwt>`, `Content-Type: application/json`

**Request body (one or both fields):**

```json
{
	"preferred_language": "en"
}
```

**Success 200:** Updated profile row.

**Errors:**

- `401` — Missing JWT
- `403` — Attempting to write `is_premium` or other service_role-only columns (RLS)
- `400` — `preferred_language` not in `('pl', 'en')` (DB CHECK constraint)

---

### 2.8 AI Dish Calculation — Edge Function

#### `POST /functions/v1/calculate-dish`

Core business logic endpoint. Handles LLM call via OpenRouter, product matching, macro calculation, rate limiting, and trial gating.

**Headers:**

- `apikey: <anon_key>` (required)
- `Authorization: Bearer <jwt>` (optional — omit for anonymous trial)
- `Content-Type: application/json`

**Request body:**

```json
{
	"description": "pierś z kurczaka 200g pieczona, ziemniaki 300g gotowane, brokuł 150g"
}
```

| Field         | Type   | Constraints                |
| ------------- | ------ | -------------------------- |
| `description` | string | Required, 1–200 characters |

**Internal processing flow:**

```
1. Validate description (Zod: min 1, max 200 chars)
2. Extract JWT → user_id (null for anonymous)
3. Hash client IP with salt from Supabase Vault → ip_hash
4. Lazy cleanup: DELETE FROM ai_usage_log WHERE called_at < now() - interval '48h'
5. Rate-limit check: COUNT(*) FROM ai_usage_log WHERE ip_hash = ? AND called_at > now() - interval '24h'
   → if count >= 20: return 429
6. Authorization gate:
   a. Anonymous: count ai_usage_log entries for ip_hash (any time) >= 1 → return 403 trial_exhausted
   b. Authenticated Free (is_premium = false): trial_ai_used_at IS NOT NULL → return 403 premium_required
   c. Authenticated Premium: allow (is_premium = true AND premium_expires_at > now())
7. Call OpenRouter LLM (structured prompt, model from Vault secret OPENROUTER_MODEL)
8. Parse and validate LLM JSON response (Zod schema)
9. For each ingredient:
   a. Search products via pg_trgm: SELECT id, name, calories_kcal, … WHERE name % $ingredient ORDER BY similarity DESC LIMIT 1
   b. If no match (similarity < threshold): add to warnings with issue "unrecognized", skip
   c. Fetch yield_factor from product_cooking_factors for matched product + cooking_method_slug
   d. If no factor row: use yield_source "ai" (LLM-provided cooked weight), add warning
10. Calculate macros deterministically from products table values
11. Aggregate totals (total_weight_g, total macros, per_100g macros)
12. INSERT into calculations (service_role) — only if user is authenticated
13. UPDATE profiles SET trial_ai_used_at = now() — if first AI call for authenticated Free user (service_role)
14. INSERT into ai_usage_log (ip_hash, user_id, success = true) — via service_role
15. Return result
```

**Success 200:**

```json
{
	"calculation_id": "uuid-or-null",
	"total_weight_g": 618,
	"total": {
		"calories_kcal": 520.0,
		"protein_g": 62.5,
		"fat_g": 9.1,
		"carbs_g": 45.0
	},
	"per_100g": {
		"calories_kcal": 84.1,
		"protein_g": 10.1,
		"fat_g": 1.5,
		"carbs_g": 7.3
	},
	"items": [
		{
			"product_id": "uuid",
			"product_name": "chicken breast",
			"cooking_method_slug": "baking",
			"raw_weight_g": 200,
			"cooked_weight_g": 168,
			"yield_factor_used": 0.84,
			"yield_source": "db",
			"matched_confidence": 0.95,
			"macros": {
				"calories_kcal": 184.8,
				"protein_g": 38.8,
				"fat_g": 2.0,
				"carbs_g": 0.0
			}
		},
		{
			"product_id": "uuid",
			"product_name": "potato",
			"cooking_method_slug": "boiling",
			"raw_weight_g": 300,
			"cooked_weight_g": 270,
			"yield_factor_used": 0.9,
			"yield_source": "db",
			"matched_confidence": 0.99,
			"macros": {
				"calories_kcal": 231.0,
				"protein_g": 5.4,
				"fat_g": 0.3,
				"carbs_g": 52.9
			}
		}
	],
	"warnings": null
}
```

**Partial result with warnings** (US-015):

```json
{
  "calculation_id": null,
  "total_weight_g": 438,
  "total": { ... },
  "per_100g": { ... },
  "items": [ ... ],
  "warnings": [
    { "ingredient": "trufia",       "issue": "unrecognized" },
    { "ingredient": "mleko kokosowe", "issue": "yield_source_ai", "yield_factor_estimated": 1.0 }
  ]
}
```

> `calculation_id` is `null` when the user is anonymous (no DB save). A failed LLM call is **not** logged in `ai_usage_log` with `success = true` and does **not** count against the trial (US-027).

**Error responses:**

| Code  | `error` key            | Description                                  |
| ----- | ---------------------- | -------------------------------------------- |
| `400` | `description_required` | Empty description                            |
| `400` | `description_too_long` | Description exceeds 200 characters           |
| `401` | `invalid_token`        | JWT present but invalid or expired           |
| `403` | `trial_exhausted`      | Anonymous user already consumed 1 AI trial   |
| `403` | `premium_required`     | Authenticated Free user — trial already used |
| `429` | `rate_limit_exceeded`  | IP exceeded 20 AI calls in 24h               |
| `500` | `internal_error`       | Unexpected server error                      |
| `502` | `ai_service_error`     | OpenRouter unavailable or timeout            |

```json
{
	"error": "rate_limit_exceeded",
	"reset_at": "2026-05-09T10:00:00Z"
}
```

```json
{
	"error": "premium_required",
	"message": "Upgrade to Premium to use AI mode"
}
```

---

#### OpenRouter prompt design (internal)

The Edge Function sends a **system + user** prompt to OpenRouter:

```
System:
You are a nutritional parsing assistant. Given a dish description, extract each ingredient
and return ONLY a JSON array. Each element must have:
  - "name": ingredient name in English (lowercase)
  - "cooking_method": one of exactly ["boiling", "frying", "baking"]
  - "weight_g": numeric weight as described by user (assume raw weight unless explicitly stated as cooked)

If a cooking method is unspecified, infer the most common method for that ingredient.
Return valid JSON only. No markdown. No explanation.

User:
{description}
```

The response is validated with a Zod schema before processing. Parsing failures surface as `ai_service_error`.

---

### 2.9 RevenueCat Webhook — Edge Function

#### `POST /functions/v1/revenuecat-webhook`

Internal webhook receiver. Updates `profiles.is_premium` based on RevenueCat subscription events.

**Headers:**

- `X-RevenueCat-Signature: <hmac-sha256>` — HMAC signature, verified against secret stored in Supabase Vault (`REVENUECAT_WEBHOOK_SECRET`)

**Request body:** RevenueCat webhook payload (standard format):

```json
{
	"event": {
		"type": "INITIAL_PURCHASE",
		"app_user_id": "user-uuid",
		"expiration_at_ms": 1767225600000,
		"product_id": "cookscale_premium_monthly"
	}
}
```

**Internal processing:**

| RevenueCat event type                           | Action                                                        |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `INITIAL_PURCHASE`, `RENEWAL`, `UNCANCELLATION` | `is_premium = true`, `premium_expires_at = expiration_at_ms`  |
| `CANCELLATION`                                  | No immediate change (grace period until `premium_expires_at`) |
| `EXPIRATION`, `BILLING_ISSUE`                   | `is_premium = false`                                          |

All DB updates use `service_role` to bypass RLS.

**Success 200:**

```json
{ "received": true }
```

**Errors:**

- `400` — Malformed payload or missing `app_user_id`
- `401` — Signature verification failed (replay/tamper protection)

---

## 3. Authentication and Authorization

### Mechanism

| Layer             | Credential         | Used by                                       |
| ----------------- | ------------------ | --------------------------------------------- |
| Public reads      | `anon` API key     | Product search, categories, cooking methods   |
| User operations   | JWT (`Bearer`)     | Calculations, profiles                        |
| Privileged writes | `service_role` key | Edge Functions only — never exposed to client |
| Webhook           | HMAC signature     | RevenueCat webhook verification               |

### JWT Verification in Edge Functions

Edge Functions verify the JWT using `supabase.auth.getUser(token)`. The `user_id` extracted from a verified token is the authoritative identity used for all DB operations — never trust a `user_id` from the request body directly.

### RLS Summary

| Table                     | `anon`          | `authenticated`    | `service_role` |
| ------------------------- | --------------- | ------------------ | -------------- |
| `categories`              | SELECT          | SELECT             | ALL            |
| `products`                | SELECT (active) | SELECT (active)    | ALL            |
| `cooking_methods`         | SELECT          | SELECT             | ALL            |
| `product_cooking_factors` | SELECT          | SELECT             | ALL            |
| `profiles`                | —               | SELECT/UPDATE own† | ALL            |
| `calculations`            | —               | SELECT/INSERT own  | ALL            |
| `ai_usage_log`            | —               | —                  | ALL            |

†Only `preferred_language` and `avatar_url` are client-writable. Premium columns are enforced via `service_role`-only writes from Edge Functions.

---

## 4. Validation and Business Logic

### 4.1 Products

| Rule                                               | Enforcement                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Only non-deleted products returned                 | RLS: `deleted_at IS NULL`                                        |
| Search minimum 2 characters                        | Client-side before request                                       |
| Trigram partial match                              | `name ilike.*{query}*` → uses `idx_products_name_trgm`           |
| No cooking method = method unavailable for product | No row in `product_cooking_factors` → UI filters out that method |

### 4.2 Product-Mode Calculations (PostgREST INSERT)

| Rule                                                                       | Enforcement                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `user_id` must equal authenticated user                                    | RLS `WITH CHECK (auth.uid() = user_id)`                      |
| `type = 'product'` requires `product_id`, `direction`, `cooking_method_id` | DB: `chk_calc_product_fields`                                |
| `input` and `result` must be JSON objects                                  | DB: `chk_calc_input_object`, `chk_calc_result_object`        |
| Max 100 calculations per user                                              | DB trigger `trg_limit_calculations_per_user` (evicts oldest) |
| No UPDATE or DELETE by users                                               | RLS explicit deny policies                                   |

### 4.3 AI Dish Calculation (Edge Function)

| Rule                                                                                   | Enforcement                                                                |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `description`: 1–200 characters                                                        | Zod validation in Edge Function (returns 400)                              |
| IP rate limit: max 20 calls / 24h                                                      | `ai_usage_log` query in Edge Function (returns 429)                        |
| Anonymous trial: 1 call per IP                                                         | `ai_usage_log` count check (returns 403 `trial_exhausted`)                 |
| Authenticated Free trial: 1 call per user                                              | `profiles.trial_ai_used_at IS NULL` check (returns 403 `premium_required`) |
| LLM response shape                                                                     | Zod schema validation (returns 502 on failure)                             |
| Failed LLM calls do not consume trial                                                  | `ai_usage_log` INSERT only on successful LLM response                      |
| `type = 'dish'` requires `input_text`, no `direction`/`product_id`/`cooking_method_id` | DB: `chk_calc_dish_fields`                                                 |
| IP stored as SHA-256 hash (GDPR)                                                       | Salt fetched from Supabase Vault (`IP_HASH_SALT`)                          |

### 4.4 Profiles

| Rule                                                       | Enforcement                                       |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `preferred_language` must be `'pl'` or `'en'`              | DB CHECK constraint                               |
| Only `preferred_language` and `avatar_url` client-writable | RLS + no other fields sent by SDK                 |
| `is_premium`, `premium_expires_at`, `trial_ai_used_at`     | Written only via `service_role` in Edge Functions |

### 4.5 RevenueCat Webhook

| Rule                                         | Enforcement                                                          |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Signature verified before any processing     | HMAC-SHA256 check against `REVENUECAT_WEBHOOK_SECRET` from Vault     |
| `app_user_id` maps directly to `profiles.id` | Supabase Auth UUID used as RevenueCat customer ID                    |
| Profile update uses `service_role`           | Bypasses RLS; only `is_premium` and `premium_expires_at` are touched |

### 4.6 Business Logic: Premium Access Gate

```
is_premium = true AND (premium_expires_at IS NULL OR premium_expires_at > now())
  → Full AI access

is_premium = false AND trial_ai_used_at IS NULL
  → 1 free AI trial allowed

is_premium = false AND trial_ai_used_at IS NOT NULL
  → Block AI; show Premium upsell (US-016)
```

### 4.7 Business Logic: AI Rate Limiting

The `ai_usage_log` table serves dual purpose:

1. **Abuse prevention**: max 20 calls / 24h per IP hash (applies to all users including Premium — US-022)
2. **Trial enforcement**: at least 1 entry for anonymous IP → trial consumed (US-002)

Cleanup of records older than 48h runs at the start of each `calculate-dish` invocation before the rate-limit check (lazy cleanup — no pg_cron required for MVP).

---

## 5. Secrets Management

All sensitive values are stored in Supabase Vault and accessed within Edge Functions only:

| Secret name                 | Used in              | Purpose                                                  |
| --------------------------- | -------------------- | -------------------------------------------------------- |
| `IP_HASH_SALT`              | `calculate-dish`     | GDPR-compliant IP hashing (constant, not rotated in MVP) |
| `OPENROUTER_API_KEY`        | `calculate-dish`     | OpenRouter API authentication                            |
| `OPENROUTER_MODEL`          | `calculate-dish`     | Configurable LLM model identifier                        |
| `REVENUECAT_WEBHOOK_SECRET` | `revenuecat-webhook` | HMAC signature verification                              |

The `service_role` key is injected automatically by the Supabase runtime into Edge Functions and is never referenced in client code.
