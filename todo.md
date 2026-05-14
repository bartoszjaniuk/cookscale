1. Wygenerowanie typów supabase gen types typescript --local > supabase/types/database.types.ts

// supabase db reset --linked usunięcie remote db

## Brakujące grafiki (Assets) - Do zrobienia

### 1. Twoje zadanie: przygotowanie plików

Przygotuj poniższe grafiki i skopiuj je do folderu `web/public/assets/`:

- `apple-touch-icon.png` (wymiary: 180x180 px) – ikona Apple
- `android-chrome-192x192.png` (wymiary: 192x192 px) – ikona PWA / Android
- `android-chrome-512x512.png` (wymiary: 512x512 px) – duża ikona PWA / Android
- `og-image.png` lub `og-image.jpg` (wymiary: 1200x630 px) – miniatura z logo do udostępniania w social mediach (Karta Open Graph)

### 2. Gotowa instrukcja dla AI

Kiedy już wrzucisz te pliki do katalogu, wklej mi poniższą komendę w czacie, a ja zakoduję całą resztę:

> Wrzuciłem brakujące pliki ikon PWA (192, 512), apple-touch-icon oraz og-image do folderu `web/public/assets/`. Skonfiguruj teraz tagi meta Open Graph w `BaseLayout.astro`, dodaj odpowiednie linki do ikon (rel="apple-touch-icon") oraz wygeneruj i podepnij prosty plik `manifest.json` do obsługi PWA na podstawie tych ikon.
