<conversation_summary>

## Decyzje podjęte przez użytkownika

1. Aplikacja skierowana do osób liczących kalorie i odchudzających się
2. MVP jako aplikacja mobilna Expo React Native
3. Własna baza produktów ogólnych (kurczak, ryż, ziemniaki itp.) zbudowana na Open Food Facts + USDA FoodData Central; architektura gotowa na produkty markowe (EAN) i ręczne dodawanie przez użytkownika w post-MVP
4. Współczynniki zmiany gramatury z USDA yield tables
5. Backend: Node.js + Supabase; LLM przez OpenRouter (model do ustalenia)
6. Model freemium: Free = tryb „produktu", Premium = tryb „dania z AI"
7. Trial AI: 1 darmowe wywołanie powiązane z device ID (mobile) / IP (przeglądarka), dostępne **przed** rejestracją
8. Po wyczerpaniu trialu → ekran rejestracji z komunikatem „Zarejestruj się, aby odblokować więcej obliczeń"
9. Onboarding: „najpierw wartość, potem rejestracja" – 1–2 obliczenia w trybie produktu bez konta
10. Limity AI: IP jako zabezpieczenie przed abuse (np. 20 wywołań/24h per IP) + właściwy limit produktowy egzekwowany przez backend na podstawie JWT user ID
11. Monetyzacja: RevenueCat + App Store / Google Play subscriptions; flaga `is_premium` w Supabase aktualizowana przez webhooks
12. Tryb „produktu": wybór produktu z bazy → gramatura surowa → metoda obróbki → gramatura po obróbce + makro
13. Tryb odwrotny (MVP): gramatura po obróbce + metoda → gramatura surowa + makro surowego produktu
14. Tryb „dania z AI": użytkownik wpisuje opis dania tekstem (max 200 znaków); wynik = całkowita masa dania po obróbce + makro na całe danie + makro na 100g
15. Limit 200 znaków z możliwością podniesienia dla premium w przyszłości; licznik znaków widoczny progresywnie w polu tekstowym
16. Obsługa błędów AI: częściowy wynik z ostrzeżeniem przy nierozpoznanym składniku
17. 6 metod obróbki w MVP: gotowanie w wodzie, gotowanie na parze, smażenie na patelni (z tłuszczem), smażenie bez tłuszczu, pieczenie w piekarniku, grillowanie
18. Historia obliczeń (tryb produktu i dania) dostępna w MVP dla zalogowanych użytkowników
19. i18n: biblioteka `i18next` + `react-i18next`, pliki JSON per język (pl/en), tłumaczony tylko interfejs + etykiety metod + komunikaty błędów; baza produktów pozostaje w języku angielskim
20. Kalkulator zapotrzebowania kalorycznego: do ustalenia w osobnej sesji z dietetykiem
21. Design / styl wizualny: do ustalenia osobno, nie wchodzi do PRD na tym etapie
22. Inspiracja: SizzleScale (istniejąca aplikacja); docelowi konkurenci post-MVP: Fitatu, Yazio

</conversation_summary>

<matched_recommendations>

1. **Architektura limitów AI** – hybrydowy model: limit IP (abuse prevention) + limit produktowy per user ID z JWT egzekwowany przez własny backend; zmiana limitów nie wymaga zmian w OpenRouter
2. **i18n przy minimalnych kosztach** – `i18next` + `react-i18next`, pliki JSON per język, baza produktów w j. angielskim, architektura gotowa na rozszerzenie przez dodanie pliku
3. **Wyróżnik planów freemium** – Free: tryb produktu (bez limitu) / Premium: tryb dania z AI; czytelny paywall niefrustujący użytkownika podstawowym use-case'em
4. **Trial przed rejestracją** – 1 wywołanie AI przed założeniem konta (device ID / IP), po wyczerpaniu → ekran rejestracji; maksymalizacja konwersji z instalacji
5. **Tryb odwrotny w MVP** – niski koszt implementacji (ta sama logika, odwrócone parametry); naturalny use-case: użytkownik waży ugotowany produkt na talerzu
6. **200 znaków jako limit startowy** – pokrywa 3–5 składników; ~400–600 tokenów per wywołanie = niski koszt; progresywny licznik znaków w UI
7. **RevenueCat** – natywna integracja z Expo + Supabase przez webhooks; aktualizacja flagi `is_premium` w bazie
8. **Historia obliczeń – schemat bazy od razu** – tabela `calculations` z polami `user_id`, `created_at`, `type` (product/dish), `input`, `result`; UI historii w MVP
9. **6 metod obróbki z USDA yield tables** – gotowanie w wodzie, na parze, smażenie z/bez tłuszczu, pieczenie, grillowanie
10. **Obsługa błędów AI** – częściowy wynik z ostrzeżeniem przy nierozpoznanym składniku; nie blokuje całego wyniku

</matched_recommendations>

<prd_planning_summary>

## Główne wymagania funkcjonalne

### Tryb „produktu" (Free)

- Wyszukiwanie produktu w bazie (produkty ogólne: mięso, ryż, warzywa itp.)
- Wprowadzenie gramatury surowej **lub** po obróbce (tryb odwrotny)
- Wybór metody obróbki (6 metod z USDA yield tables)
- Wynik: gramatura po obróbce (lub surowa w trybie odwrotnym) + makro (kalorie, białko, tłuszcze, węglowodany) na 100g i na całą porcję
- Dostępny bez rejestracji (1–2 obliczenia), pełny dostęp po rejestracji (konto Free)

### Tryb „dania z AI" (Premium + 1 trial)

- Pole tekstowe z limitem 200 znaków + progresywny licznik
- Użytkownik wpisuje opis dania lub przepis w języku naturalnym
- LLM (OpenRouter) oblicza gramaturę całego dania po obróbce
- Wynik: całkowita masa dania + makro na całe danie + makro na 100g
- Obsługa błędów: częściowy wynik + ostrzeżenie przy nierozpoznanym składniku
- 1 darmowy trial powiązany z device ID (mobile) / IP (przeglądarka), dostępny przed rejestracją

### Historia obliczeń (zalogowani użytkownicy)

- Dostępna w MVP dla obu trybów
- Tabela `calculations`: `user_id`, `created_at`, `type`, `input`, `result`

### Onboarding i rejestracja

- 1–2 obliczenia w trybie produktu bez konta
- Trial AI (1x) przed rejestracją
- Po wyczerpaniu trialu lub przy próbie zapisu → ekran rejestracji z komunikatem

### Monetyzacja

- RevenueCat + App Store / Google Play
- Flaga `is_premium` w Supabase aktualizowana przez webhooks
- Free: tryb produktu bez limitu + 1 trial AI
- Premium: tryb dania z AI bez limitu (limit znaków do ewentualnego podniesienia)

### Bezpieczeństwo i limity API

- Limit per IP: ~20 wywołań AI / 24h (abuse prevention, konfiguracja backendowa)
- Limit produktowy: egzekwowany przez backend na podstawie JWT user ID

### Baza danych produktów

- Źródła: Open Food Facts + USDA FoodData Central
- Zakres MVP: produkty ogólne (bez EAN)
- Architektura gotowa na: produkty markowe z EAN, ręczne dodawanie przez użytkownika (post-MVP)

### Wielojęzyczność

- Biblioteka: `i18next` + `react-i18next`
- Języki MVP: polski + angielski (pliki `pl.json`, `en.json`)
- Tłumaczone: interfejs, etykiety metod obróbki, komunikaty błędów
- Baza produktów: język angielski (bez tłumaczenia w MVP)

---

## Kluczowe ścieżki użytkownika

**Ścieżka 1 – Nowy użytkownik (tryb produktu, bez konta)**
Otwarcie aplikacji → 1–2 obliczenia w trybie produktu bez rejestracji → zachęta do rejestracji

**Ścieżka 2 – Trial AI (przed rejestracją)**
Wybór trybu dania z AI → 1 wywołanie LLM (device ID / IP) → wynik → ekran rejestracji

**Ścieżka 3 – Użytkownik Free (zalogowany)**
Logowanie → tryb produktu (bez limitu) → historia obliczeń → upsell do Premium przy próbie użycia AI

**Ścieżka 4 – Użytkownik Premium**
Logowanie → tryb dania z AI → opis przepisu (max 200 znaków) → wynik z makro → historia

**Ścieżka 5 – Tryb odwrotny**
Wybór trybu odwrotnego → gramatura po obróbce + metoda → wynik: gramatura surowa + makro

---

## Kryteria sukcesu

| Kryterium                       | Cel                                                     |
| ------------------------------- | ------------------------------------------------------- |
| Czas do wyniku (tryb produktu)  | < 10 sekund od wyboru produktu                          |
| Błąd estymacji makro po obróbce | < 10–15% vs. wartości referencyjne                      |
| Retencja                        | Użytkownik wraca co najmniej kilka razy w tygodniu      |
| Walidacja AI                    | Funkcja „danie z AI" realnie upraszcza liczenie kalorii |
| Konwersja trial → rejestracja   | Do ustalenia po pierwszych danych                       |

</prd_planning_summary>

<unresolved_issues>

1. **Model LLM** – konkretny model przez OpenRouter do wskazania przez właściciela projektu
2. **Limity wywołań AI dla planu Premium** – dokładna liczba wywołań/dzień lub miesiąc do ustalenia
3. **Kalkulator zapotrzebowania kalorycznego** – zakres i logika do ustalenia w osobnej sesji z dietetykiem; tymczasowo poza zakresem PRD
4. **Design i styl wizualny** – do ustalenia osobno; nie wchodzi do PRD na tym etapie
5. **Limit znaków dla Premium** – czy i o ile zostaje podniesiony powyżej 200 znaków; do decyzji przed post-MVP
6. **Metryki walidacji błędu estymacji (<10–15%)** – metodologia pomiaru i walidacji do ustalenia osobno
7. **Dokładny limit IP** – wartość „~20 wywołań/24h per IP" jako tymczasowa; wymaga kalibracji po obserwacji ruchu
8. **Zakres języków post-MVP** – które języki po polskim i angielskim, w jakiej kolejności

</unresolved_issues>
