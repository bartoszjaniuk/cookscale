---
name: i18n Translation Keys
description: Enforces SCREAMING_SNAKE_CASE for all i18next translation keys in JSON locale files and their usage in source code.
applyTo: "shared/locales/**/*.json"
---

# i18n Translation Key Convention

All translation keys **must** use `SCREAMING_SNAKE_CASE` — both in JSON locale files and in `t()` calls. This ensures visual distinction from code identifiers and consistent grep-ability across the codebase.

## Rules

- Top-level namespace: `SCREAMING_SNAKE_CASE` (e.g., `COOKING_METHODS`, `AUTH`, `ERRORS`)
- Nested keys: `SCREAMING_SNAKE_CASE` (e.g., `SIGN_IN`, `INVALID_CREDENTIALS`)
- Full key path in `t()`: dot-separated namespaces in `SCREAMING_SNAKE_CASE` (e.g., `t("AUTH.SIGN_IN")`)
- Never use camelCase, kebab-case, or lowercase for translation keys

## Examples

```json
// ✅ Correct — SCREAMING_SNAKE_CASE keys
{
  "AUTH": {
    "SIGN_IN": "Sign in",
    "SIGN_UP": "Sign up",
    "INVALID_CREDENTIALS": "Invalid email or password"
  },
  "COOKING_METHODS": {
    "BOILING": "Boiling",
    "FRYING": "Frying",
    "BAKING": "Baking"
  },
  "ERRORS": {
    "NO_CONNECTION": "No internet connection",
    "RATE_LIMIT": "Request limit exceeded. Try again in {{time}}."
  }
}

// ❌ Wrong — lowercase / camelCase / snake_case
{
  "auth": {
    "sign_in": "Sign in",
    "signUp": "Sign up",
    "invalid-credentials": "Invalid email or password"
  }
}
```

```tsx
// ✅ Correct usage in components
const { t } = useTranslation();
t("AUTH.SIGN_IN");
t("COOKING_METHODS.BOILING");
t("ERRORS.RATE_LIMIT", { time: "5 min" });

// ❌ Wrong
t("auth.sign_in");
t("cookingMethods.boiling");
```
