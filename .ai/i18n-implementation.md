# i18n — Implementacja wielojęzyczności (Mobile & Web)

## Stack

| Platforma | Biblioteki                                                     |
| --------- | -------------------------------------------------------------- |
| Mobile    | `i18next`, `react-i18next`, `expo-localization`                |
| Web       | `i18next`, `react-i18next`, `i18next-browser-languagedetector` |

Języki MVP: `pl` (polski), `en` (angielski).

---

## Współdzielone pliki tłumaczeń

Oba projekty korzystają z tych samych plików JSON. Rekomendowana lokalizacja:

```
rn-kcal-companion/
└── shared/
    └── locales/
        ├── pl.json
        └── en.json
```

Każda platforma importuje pliki przez ścieżki relatywne lub symlinki.

### Przykładowa struktura `pl.json`

```json
{
	"cooking_methods": {
		"boiling": "Gotowanie",
		"frying": "Smażenie",
		"baking": "Pieczenie"
	},
	"calculator": {
		"raw_weight": "Gramatura surowa (g)",
		"cooked_weight": "Gramatura po obróbce (g)",
		"calculate": "Oblicz",
		"reverse_mode": "Tryb odwrotny"
	},
	"results": {
		"per_100g": "Na 100g",
		"per_portion": "Na porcję",
		"calories": "Kalorie (kcal)",
		"protein": "Białko (g)",
		"fat": "Tłuszcze (g)",
		"carbs": "Węglowodany (g)"
	},
	"errors": {
		"invalid_weight": "Podaj wartość większą od 0",
		"no_connection": "Brak połączenia z internetem",
		"ai_failed": "Nie udało się przetworzyć opisu dania. Spróbuj ponownie.",
		"rate_limit": "Przekroczono limit wywołań. Spróbuj ponownie za {{time}}.",
		"unknown_ingredient": "Nie rozpoznano: {{name}} – pomiń go lub spróbuj z inną nazwą"
	},
	"auth": {
		"sign_in": "Zaloguj się",
		"sign_up": "Zarejestruj się",
		"sign_out": "Wyloguj się",
		"email": "Adres e-mail",
		"password": "Hasło",
		"forgot_password": "Zapomniałem hasła",
		"invalid_credentials": "Nieprawidłowy e-mail lub hasło"
	},
	"ai": {
		"placeholder": "np. pierś z kurczaka 200g pieczona, ziemniaki 300g gotowane",
		"char_count": "{{current}}/{{max}}",
		"submit": "Oblicz makro",
		"trial_exhausted": "Zarejestruj się, aby odblokować więcej obliczeń"
	},
	"history": {
		"title": "Historia",
		"empty": "Brak zapisanych obliczeń",
		"type_product": "Produkt",
		"type_dish": "Danie"
	},
	"settings": {
		"language": "Język",
		"restore_purchases": "Przywróć zakupy"
	}
}
```

---

## Mobile (Expo React Native)

### Instalacja

```bash
cd mobile
bun add i18next react-i18next expo-localization
```

### Struktura plików

```
mobile/src/
├── i18n/
│   ├── index.ts          # konfiguracja i inicjalizacja
│   └── locales/          # symlinki lub kopie z shared/locales/
│       ├── pl.json
│       └── en.json
└── hooks/
    └── use-language.ts   # hook do zmiany języka
```

### Konfiguracja (`src/i18n/index.ts`)

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import pl from "./locales/pl.json";
import en from "./locales/en.json";

const systemLanguage = getLocales()[0]?.languageCode ?? "en";
const supportedLanguage = ["pl", "en"].includes(systemLanguage)
	? systemLanguage
	: "en";

i18n.use(initReactI18next).init({
	resources: {
		pl: { translation: pl },
		en: { translation: en },
	},
	lng: supportedLanguage,
	fallbackLng: "en",
	interpolation: { escapeValue: false },
});

export default i18n;
```

### Bootstrap w `_layout.tsx`

```tsx
import "@/i18n"; // musi być zaimportowane przed pierwszym renderem
```

### Hook do zmiany języka (`src/hooks/use-language.ts`)

```ts
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const SUPPORTED_LANGUAGES = ["pl", "en"] as const;
type Language = (typeof SUPPORTED_LANGUAGES)[number];

const useLanguage = () => {
	const { i18n } = useTranslation();

	const changeLanguage = useCallback(
		(lang: Language) => {
			i18n.changeLanguage(lang); // natychmiastowa zmiana, bez restartu
		},
		[i18n],
	);

	return {
		currentLanguage: i18n.language as Language,
		changeLanguage,
		supportedLanguages: SUPPORTED_LANGUAGES,
	};
};

export { useLanguage };
```

### Użycie w komponentach

```tsx
import { useTranslation } from "react-i18next";

const CookingMethodPicker = () => {
	const { t } = useTranslation();

	return (
		<>
			<Text>{t("cooking_methods.boiling")}</Text>
			<Text>{t("cooking_methods.frying")}</Text>
			<Text>{t("cooking_methods.baking")}</Text>
		</>
	);
};
```

### Persystencja wybranego języka

Domyślnie i18next nie zapamiętuje zmiany po restarcie aplikacji. Aby zachować wybór:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// zapis przy zmianie
const changeLanguage = async (lang: Language) => {
	await AsyncStorage.setItem("app_language", lang);
	i18n.changeLanguage(lang);
};

// odczyt przy starcie (w i18n/index.ts)
const savedLanguage = await AsyncStorage.getItem("app_language");
const lng = savedLanguage ?? supportedLanguage;
```

---

## Web (Astro SSR + React)

### Instalacja

```bash
cd web
bun add i18next react-i18next i18next-browser-languagedetector
```

### Struktura plików

```
web/src/
├── i18n/
│   ├── index.ts          # konfiguracja client-side
│   └── locales/          # symlinki lub kopie z shared/locales/
│       ├── pl.json
│       └── en.json
```

### Konfiguracja client-side (`src/i18n/index.ts`)

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pl from "./locales/pl.json";
import en from "./locales/en.json";

i18n
	.use(LanguageDetector) // wykrywa z localStorage → navigator
	.use(initReactI18next)
	.init({
		resources: {
			pl: { translation: pl },
			en: { translation: en },
		},
		fallbackLng: "en",
		interpolation: { escapeValue: false },
		detection: {
			order: ["localStorage", "navigator"],
			lookupLocalStorage: "app_language",
			caches: ["localStorage"], // zapamiętuje wybór użytkownika
		},
	});

export default i18n;
```

### Wykrycie języka po stronie serwera (Astro middleware)

Dodać do istniejącego `src/middleware.ts`:

```ts
// wykrycie języka z Accept-Language header (SSR)
const acceptLanguage = context.request.headers.get("accept-language") ?? "";
const serverLang = acceptLanguage.toLowerCase().startsWith("pl") ? "pl" : "en";
context.locals.lang = serverLang;
```

### Inicjalizacja w React Provider

```tsx
// src/providers/AppProviders.tsx
import "@/i18n"; // inicjalizacja przed drzewem komponentów
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
	<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);
```

### Zmiana języka na web

```ts
import i18n from "@/i18n";

// zapisuje do localStorage automatycznie (przez LanguageDetector)
i18n.changeLanguage("pl");
```

---

## Porównanie platform

| Aspekt               | Mobile                               | Web                                           |
| -------------------- | ------------------------------------ | --------------------------------------------- |
| Wykrycie języka      | `expo-localization` (OS)             | `Accept-Language` header + `LanguageDetector` |
| Zmiana języka        | `i18n.changeLanguage()`              | `i18n.changeLanguage()`                       |
| Persystencja         | `AsyncStorage`                       | `localStorage` (auto przez LanguageDetector)  |
| Przeładowanie strony | Nie wymagane                         | Nie wymagane                                  |
| SSR                  | Nie dotyczy                          | Wymaga obsługi w Astro middleware             |
| API                  | identyczne (`useTranslation`, `t()`) | identyczne (`useTranslation`, `t()`)          |

---

## Dodanie nowego języka

1. Dodaj plik `shared/locales/<kod>.json` z tłumaczeniami
2. Zarejestruj go w `resources` w obu konfiguracjach i18next
3. Dodaj kod języka do listy `supportedLanguages` w hooku

Nie wymaga żadnych zmian w komponentach.
