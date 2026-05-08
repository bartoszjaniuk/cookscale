## Mobile

- Expo React Native
- Expo Router
- TypeScript
- NativeWind (Tailwind)
- Auth: Supabase Auth
  - MVP: email + hasło
  - Post-MVP: Google OAuth

## Backend

- Supabase Edge Functions (Deno/TypeScript)
  - Zastępuje własny serwer Node.js
  - Zero-config deployment, wbudowane zarządzanie sekretami
- Supabase (baza danych, auth, storage)
- Integracja z OpenRouter (klucz tylko po stronie Edge Functions)
- Hardening HTTP: CORS i bezpieczne nagłówki konfigurowane na poziomie Edge Functions
- Walidacja: Zod wyłącznie po stronie klienta mobilnego (walidacja danych wejściowych przed wysłaniem);
  po stronie Edge Functions – Supabase auto-generated types + selektywny Zod
  tylko dla wywołań zewnętrznych (OpenRouter response parsing)
- Rate limiting: per IP i per user przez Supabase Edge Functions
  (uwaga: bez Redis – OK na MVP z ograniczonym ruchem, do rewizji przy skalowaniu)

## Baza danych

- Supabase Postgres
- pg_trgm (trigram indexing) dla wyszukiwania produktów full-text
- Row Level Security (RLS) włączone na wszystkich tabelach użytkowników

## AI

- OpenRouter API (limity budżetowe na kluczach)

## Monetyzacja

- RevenueCat (iOS App Store + Google Play)
- Webhooks RevenueCat → Supabase (aktualizacja flagi `is_premium`)

## Hosting

- Supabase Edge Functions (backend)
- Expo Application Services / EAS (build i dystrybucja aplikacji mobilnej)
