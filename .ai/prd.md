# Dokument wymagań produktu (PRD) - CookScale – Raw to Cooked Calculator

## 1. Przegląd produktu

CookScale to produkt dostępny na dwóch platformach: aplikacja mobilna (Expo React Native) oraz aplikacja webowa (Astro.js + React), skierowany do osób liczących kalorie i makroskładniki. Rozwiązuje problem niedokładnej estymacji wartości odżywczych produktów po obróbce termicznej — umożliwia przeliczanie gramatury i makro między stanem surowym a ugotowanym/usmażonym/upieczonym w oparciu o współczynniki zmiany gramatury z tabel USDA yield tables.

Obie platformy oferują pełen parytet funkcjonalny i współdzielą:

- **Backend**: Supabase Edge Functions (Deno/TypeScript) + Supabase PostgreSQL
- **Autentykację**: Supabase Auth — jedno konto działa zarówno na mobile, jak i na web
- **Historię obliczeń**: przechowywana w Supabase, dostępna z obu platform
- **AI**: wywołania LLM realizowane przez OpenRouter przez te same Edge Functions

Produkt działa w modelu freemium:

- Plan Free: tryb „produktu" (bez limitu dla zalogowanych) + 1 darmowy trial trybu AI
- Plan Premium: tryb „dania z AI" bez limitu wywołań

Monetyzacja:

- **Mobile**: RevenueCat zintegrowany z App Store (iOS) i Google Play (Android)
- **Web**: Stripe (lub inny web payment provider) — do wyboru w późniejszym etapie
- Flaga `is_premium` w Supabase aktualizowana przez webhooks obu providerów; subskrypcja zakupiona na jednej platformie obowiązuje na obu

Interfejs dostępny w języku polskim i angielskim (i18next + react-i18next na mobile; analogiczne tłumaczenia na web). Baza produktów dla trybu „produktu" jest budowana jako własna baza `canonical foods` skupiona na produktach surowych (raw, bez obróbki termicznej).

### Struktura repozytorium (monorepo)

```
rn-kcal-companion/
├── mobile/          # Expo React Native app (iOS + Android)
├── web/             # Astro.js + React app (SSR, Node adapter)
└── supabase/        # Wspólne migracje DB, Edge Functions, typy
```

### Stack technologiczny

| Warstwa         | Mobile                          | Web                            | Wspólne                       |
| --------------- | ------------------------------- | ------------------------------ | ----------------------------- |
| Framework       | Expo ~54 / React Native 0.81    | Astro 6 + React 19             | —                             |
| Routing         | Expo Router ~6                  | Astro file-based routing       | —                             |
| Styling         | NativeWind v5 / Tailwind CSS v4 | Tailwind CSS v4                | —                             |
| Komponenty UI   | Własne (tw/ wrapper)            | shadcn/ui + Radix UI           | —                             |
| Animacje        | Reanimated ~4                   | CSS / Framer Motion (post-MVP) | —                             |
| Auth            | Supabase Auth (supabase-js)     | Supabase Auth (@supabase/ssr)  | Supabase Auth                 |
| Baza danych     | —                               | —                              | Supabase PostgreSQL           |
| AI backend      | —                               | —                              | Supabase Edge Fn + OpenRouter |
| Monetyzacja     | RevenueCat (IAP)                | Stripe (web payments)          | Flaga `is_premium` w Supabase |
| i18n            | i18next + react-i18next         | i18next (lub analogiczne)      | Pliki pl.json, en.json        |
| Package manager | bun                             | bun                            | —                             |

Zakres dokumentu obejmuje wersję MVP obu platform (mobile i web).

---

## 2. Problem użytkownika

Osoby aktywnie liczące kalorie i makroskładniki stają przed następującymi trudnościami:

a) Dane na opakowaniach produktów i w popularnych aplikacjach dietetycznych odnoszą się niemal wyłącznie do produktów surowych (100g surowego ryżu, surowego kurczaka itp.). Tymczasem użytkownik je produkt po obróbce termicznej i waży go już ugotowany.

b) Gramatura produktu zmienia się podczas obróbki termicznej w zależności od metody (gotowanie w wodzie powoduje inną zmianę niż pieczenie czy smażenie na tłuszczu), co jest trudne do przewidzenia bez specjalistycznej wiedzy.

c) Szacowanie wartości odżywczych złożonych dań domowych (np. „makaron z sosem bolońskim") jest jeszcze bardziej skomplikowane i wymaga ręcznego sumowania składników – co jest żmudne i prowadzi do rezygnacji z rzetelnego liczenia kalorii.

Docelowy użytkownik to osoba dbająca o dietę, śledząca kalorie i makro, korzystająca zarówno z urządzeń mobilnych, jak i przeglądarki internetowej, oczekująca szybkiego, wiarygodnego wyniku bez konieczności ręcznych przeliczeń. Aplikacja jest inspirowana istniejącym rozwiązaniem SizzleScale, a jej docelowi konkurenci post-MVP to Fitatu i Yazio.

---

## 3. Wymagania funkcjonalne

### 3.1 Tryb „produktu" (Free)

- Wyszukiwanie produktu w bazie danych (produkty ogólne: mięso, ryż, warzywa, strączki itp.)
- Własna baza danych `canonical foods` (produkty ogólne, surowe/raw, bez EAN w MVP)
- Nazwy canonical przechowywane po angielsku (bez dopisku „raw"); mapowanie tłumaczeń po stronie klienta (mobile i web)
- Architektura bazy gotowa na produkty markowe z EAN i ręczne dodawanie przez użytkownika (post-MVP)
- Wprowadzenie gramatury surowej → obliczenie gramatury po obróbce + makro (tryb standardowy)
- Wprowadzenie gramatury po obróbce → obliczenie gramatury surowej + makro surowego produktu (tryb odwrotny)
- Wybór metody obróbki termicznej spośród 3 dostępnych w MVP:
  1. Gotowanie (boiling)
  2. Smażenie (frying)
  3. Pieczenie (baking)
- Współczynniki zmiany gramatury pobierane z USDA yield tables lub innych źródeł. (Do ustalenia w późniejszym etapie)
- Wynik: gramatura po obróbce (lub surowa w trybie odwrotnym) + makro (kalorie, białko, tłuszcze, węglowodany) na 100g i na całą porcję
- Dostęp do 1–2 obliczeń bez rejestracji (onboarding „najpierw wartość, potem rejestracja"); limit egzekwowany po stronie klienta (localStorage — mobile i web) — tryb produktu nie wymaga wywołania backendu
- Pełny dostęp do trybu produktu po rejestracji (konto Free, bez limitu obliczeń)

### 3.2 Tryb „dania z AI" (Premium + 1 trial)

- Pole tekstowe z limitem 200 znaków i progresywnym licznikiem znaków widocznym w polu tekstowym
- Użytkownik wpisuje opis dania lub przepis w języku naturalnym (np. „makaron 200g, mięso mielone 150g, przecier pomidorowy 100g, oliwa łyżka")
- Wywołanie LLM przez OpenRouter – konkretny model do wskazania przez właściciela projektu
- Wynik: całkowita masa dania po obróbce + makro na całe danie + makro na 100g
- Obsługa błędów AI: przy nierozpoznanym składniku zwracany jest częściowy wynik z ostrzeżeniem (nie blokuje całego obliczenia)
- 1 darmowy trial powiązany z device ID (mobile) / IP (przeglądarka), dostępny przed rejestracją
- Po wyczerpaniu trialu: ekran rejestracji z komunikatem „Zarejestruj się, aby odblokować więcej obliczeń"
- Pełny dostęp do trybu AI dla użytkowników Premium (limity do ustalenia po zebraniu pierwszych danych)

### 3.3 Historia obliczeń

- Dostępna w MVP dla zalogowanych użytkowników (Free i Premium)
- Przechowuje obliczenia z obu trybów (produkt i danie)
- Tabela `calculations` w Supabase: pola `user_id`, `created_at`, `type` (product/dish), `input`, `result`
- Użytkownik może przeglądać historię swoich obliczeń w aplikacji

### 3.4 Onboarding i rejestracja

- Nowy użytkownik może wykonać 1–2 obliczenia w trybie produktu bez zakładania konta
- Nowy użytkownik może wykonać 1 wywołanie AI (trial) przed rejestracją (device ID / IP)
- Po wyczerpaniu limitu anonimowego lub przy próbie zapisu danych → ekran zachęcający do rejestracji
- Rejestracja i logowanie przez Supabase Auth

### 3.5 Monetyzacja

**Mobile (iOS / Android)**

- RevenueCat zintegrowany z App Store (iOS) i Google Play (Android)
- Użytkownik może wybrać subskrypcję (miesięczna / roczna – opcje do ustalenia) i przejść przez natywny proces płatności App Store / Google Play
- Po pomyślnym zakupie flaga `is_premium` w Supabase jest aktualizowana przez webhook RevenueCat
- Opcja „Przywróć zakupy" dostępna w ustawieniach (RevenueCat sprawdza historię IAP)

**Web**

- Stripe (lub inny web payment provider — do finalnego wyboru przed implementacją) obsługuje zakup subskrypcji
- Flow zakupu na web kieruje użytkownika przez Stripe Checkout / Payment Element
- Po pomyślnym zakupie webhook Stripe aktualizuje flagę `is_premium` w Supabase
- Subskrypcja zakupiona na web jest honorowana na mobile i odwrotnie (wspólna flaga `is_premium` per `user_id`)

**Wspólne**

- Plan Free: tryb produktu bez limitu + 1 trial AI
- Plan Premium: tryb dania z AI bez limitu (dokładna liczba wywołań do ustalenia)
- Webhook mobile (RevenueCat) i webhook web (Stripe) zapisują do tej samej tabeli `profiles` w Supabase
- Po wygaśnięciu subskrypcji z dowolnej platformy flaga `is_premium` jest ustawiana na `false`

### 3.6 Bezpieczeństwo i limity API

- Limit per IP: ok. 20 wywołań AI / 24h (abuse prevention; wartość tymczasowa, do kalibracji po obserwacji ruchu; konfiguracja backendowa bez zmian w OpenRouter)
- Limit anonimowych obliczeń w trybie produktu egzekwowany po stronie klienta (localStorage, zarówno mobile jak i web) — brak wywołania backendu w trybie produktu
- Limit produktowy dla użytkowników Premium egzekwowany przez backend na podstawie JWT user ID
- Backend: Supabase Edge Functions (Deno/TypeScript); autoryzacja przez JWT — te same Edge Functions obsługują mobile i web
- Sól do haszowania adresu IP w logach AI (GDPR) przechowywana w **Supabase Vault** jako stały secret — nie rotowana w MVP
- Webhooks płatności (RevenueCat + Stripe) weryfikowane przez podpisane nagłówki (HMAC/secret) przed aktualizacją flagi `is_premium`

### 3.7 Wielojęzyczność

- Mobile: i18next + react-i18next; pliki tłumaczeń przechowywane lokalnie (`pl.json`, `en.json`)
- Web: i18next (lub analogiczne rozwiązanie kompatybilne z Astro/React); te same pliki tłumaczeń co mobile
- Języki MVP: polski (pl) i angielski (en) — na obu platformach
- Tłumaczone elementy: interfejs użytkownika, etykiety metod obróbki, komunikaty błędów, nazwy produktów
- Baza `canonical foods` przechowuje nazwy bazowe po angielsku, a UI korzysta z mapowań i18n (pl/en) po stronie klienta
- Web: język wykrywany z nagłówka `Accept-Language` przeglądarki; mobile: z ustawień systemowych urządzenia
- Architektura gotowa na dodanie kolejnych języków przez dodanie nowego pliku JSON

---

## 4. Granice produktu

Poza zakresem MVP (wersja 1.0):

- Produkty markowe z kodem EAN i skanowanie kodów kreskowych
- Ręczne dodawanie własnych produktów przez użytkownika do bazy
- Kalkulator zapotrzebowania kalorycznego (TDEE / BMR) – do ustalenia w osobnej sesji z dietetykiem
- Design system i szczegółowy styl wizualny – do opracowania osobno
- Języki inne niż polski i angielski
- Podwyższony limit znaków dla użytkowników Premium (rozważane post-MVP)
- Walidacja jakości estymacji AI metodologią ilościową (metodologia pomiaru błędu <10–15% do ustalenia)
- Integracja z zewnętrznymi aplikacjami dietetycznymi (Fitatu, Yazio, MyFitnessPal)
- Eksport historii obliczeń
- Powiadomienia push
- Finalny wybór web payment providera (Stripe jako domyślny kandydat; decyzja przed implementacją US-030)

---

## 5. Historyjki użytkowników

### Onboarding i dostęp anonimowy

US-001
Tytuł: Pierwsze obliczenie bez rejestracji (tryb produktu)
Opis: Jako nowy użytkownik, który właśnie pobrał aplikację mobilną lub otworzył stronę webową, chcę wykonać obliczenie w trybie produktu bez konieczności rejestracji, aby zobaczyć wartość aplikacji przed podjęciem decyzji o założeniu konta.
Kryteria akceptacji:

- Użytkownik może otworzyć aplikację (mobile) lub stronę (web) i przejść bezpośrednio do trybu produktu bez żadnego ekranu rejestracji
- Użytkownik może wykonać co najmniej 1 pełne obliczenie (wybór produktu, gramatura, metoda obróbki, wynik) bez zakładania konta
- Aplikacja nie wymaga podania e-maila ani żadnych danych osobowych przed pierwszym obliczeniem
- Po wykonaniu 1–2 obliczeń aplikacja wyświetla subtelną zachętę do rejestracji (nie blokuje dalszego przeglądania, ale sygnalizuje limit)
- Limit anonimowy egzekwowany przez localStorage — działa identycznie na mobile i na web

US-002
Tytuł: Trial trybu AI przed rejestracją
Opis: Jako nowy użytkownik bez konta, chcę wypróbować tryb „dania z AI" jeden raz za darmo, aby ocenić, czy funkcja AI jest dla mnie wystarczająco użyteczna, zanim zdecyduję się zarejestrować lub zapłacić.
Kryteria akceptacji:

- Nowy użytkownik (bez konta) może wykonać dokładnie 1 wywołanie AI w trybie dania
- Trial jest powiązany z device ID (mobile) lub adresem IP (przeglądarka) i egzekwowany przez backend
- Po wykonaniu trialu aplikacja wyświetla ekran z komunikatem „Zarejestruj się, aby odblokować więcej obliczeń" i przyciskiem rejestracji
- Próba wykonania drugiego wywołania AI bez rejestracji jest zablokowana i prowadzi do ekranu rejestracji
- Wynik trialu jest wyświetlany tak samo jak wynik dla Premium (masa dania + makro całego dania + makro na 100g)

US-003
Tytuł: Zachęta do rejestracji po wyczerpaniu limitu anonimowego
Opis: Jako anonimowy użytkownik, który wyczerpał darmowy limit obliczeń, chcę zobaczyć jasny komunikat wyjaśniający korzyści z rejestracji, aby podjąć świadomą decyzję o założeniu konta.
Kryteria akceptacji:

- Po wyczerpaniu limitu anonimowego aplikacja wyświetla dedykowany ekran/modal rejestracji
- Ekran zawiera komunikat wyjaśniający, co użytkownik zyskuje rejestrując się (np. historia obliczeń, brak limitu w trybie produktu)
- Ekran zawiera przycisk „Zarejestruj się" prowadzący do formularza rejestracji
- Ekran zawiera opcję „Zaloguj się" dla użytkowników mających już konto
- Użytkownik nie traci dostępu do już obliczonego wyniku – ekran pojawia się po wyświetleniu wyniku lub przy kolejnej próbie obliczenia

### Rejestracja i uwierzytelnianie

US-004
Tytuł: Rejestracja nowego konta
Opis: Jako nowy użytkownik, chcę zarejestrować się w aplikacji podając adres e-mail i hasło, aby uzyskać pełny dostęp do trybu produktu bez limitu i móc zapisywać historię obliczeń.
Kryteria akceptacji:

- Formularz rejestracji wymaga podania adresu e-mail i hasła (minimum 8 znaków)
- System waliduje format adresu e-mail przed wysłaniem formularza
- System informuje użytkownika o błędach walidacji (np. nieprawidłowy e-mail, zbyt krótkie hasło)
- Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i trafia do głównego ekranu aplikacji
- Rejestracja realizowana przez Supabase Auth
- System nie pozwala na rejestrację z już używanym adresem e-mail (wyświetla stosowny komunikat)

US-005
Tytuł: Logowanie do istniejącego konta
Opis: Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji używając e-maila i hasła, aby uzyskać dostęp do swojego konta, historii i subskrypcji.
Kryteria akceptacji:

- Formularz logowania przyjmuje adres e-mail i hasło
- Po pomyślnym logowaniu użytkownik jest przekierowany do głównego ekranu aplikacji
- W przypadku błędnych danych logowania aplikacja wyświetla stosowny komunikat błędu (bez ujawniania, które pole jest błędne – ze względów bezpieczeństwa: „Nieprawidłowy e-mail lub hasło")
- Sesja jest przechowywana lokalnie – użytkownik pozostaje zalogowany po zamknięciu aplikacji
- Logowanie realizowane przez Supabase Auth z JWT

US-006
Tytuł: Wylogowanie z konta
Opis: Jako zalogowany użytkownik, chcę mieć możliwość wylogowania się z aplikacji, aby zabezpieczyć swoje konto na urządzeniu współdzielonym.
Kryteria akceptacji:

- Opcja wylogowania jest dostępna w ustawieniach lub menu profilu
- Po wylogowaniu sesja JWT jest unieważniana
- Po wylogowaniu użytkownik jest przekierowany do ekranu powitalnego / logowania
- Historia obliczeń nie jest dostępna po wylogowaniu (dane przechowywane po stronie serwera)

US-007
Tytuł: Resetowanie hasła
Opis: Jako zarejestrowany użytkownik, który zapomniał hasła, chcę mieć możliwość jego zresetowania przez e-mail, aby odzyskać dostęp do swojego konta.
Kryteria akceptacji:

- Na ekranie logowania dostępny jest link „Zapomniałem hasła"
- Po podaniu zarejestrowanego e-maila system wysyła wiadomość z linkiem do resetowania hasła (Supabase Auth)
- Aplikacja wyświetla potwierdzenie wysłania e-maila niezależnie od tego, czy podany adres istnieje w bazie (ochrona prywatności)
- Link do resetu jest jednorazowy i wygasa po określonym czasie (standardowe zachowanie Supabase)

### Tryb produktu (Free)

US-008
Tytuł: Wyszukiwanie produktu w bazie
Opis: Jako użytkownik w trybie produktu, chcę szybko znaleźć interesujący mnie produkt spożywczy, wpisując jego nazwę w polu wyszukiwania, aby móc przejść do obliczania makro.
Kryteria akceptacji:

- Pole wyszukiwania jest widoczne jako pierwsze w trybie produktu
- Wyszukiwanie działa po wpisaniu co najmniej 2 znaków (podpowiedzi w czasie rzeczywistym lub po zatwierdzeniu)
- Wyniki wyszukiwania wyświetlają nazwy produktów z bazy (produkty ogólne: kurczak, ryż, ziemniaki itp.)
- Baza danych oparta na własnej tabeli `canonical foods` dla produktów surowych (raw)
- Użytkownik może wybrać produkt z listy wyników
- W przypadku braku wyników aplikacja wyświetla stosowny komunikat

US-009
Tytuł: Obliczenie gramatury i makro po obróbce (tryb standardowy)
Opis: Jako użytkownik w trybie produktu, chcę wprowadzić gramaturę surowego produktu i wybrać metodę obróbki termicznej, aby otrzymać gramaturę po obróbce i wartości makro dla tej porcji.
Kryteria akceptacji:

- Po wybraniu produktu użytkownik widzi pole do wprowadzenia gramatury surowej (w gramach)
- Użytkownik może wybrać metodę obróbki z listy 3 dostępnych metod: gotowanie (boiling), smażenie (frying), pieczenie (baking)
- Po zatwierdzeniu aplikacja wyświetla wynik: gramatura po obróbce + makro (kalorie, białko, tłuszcze, węglowodany) na 100g i na całą porcję
- Obliczenia oparte na współczynnikach z USDA yield tables
- Wynik jest wyświetlany w czasie krótszym niż 10 sekund od zatwierdzenia
- Pole gramatury akceptuje tylko wartości liczbowe dodatnie

US-010
Tytuł: Tryb odwrotny – obliczenie gramatury surowej na podstawie ugotowanego produktu
Opis: Jako użytkownik, który zważył produkt już po ugotowaniu na talerzu, chcę wprowadzić gramaturę po obróbce i wybrać metodę, aby dowiedzieć się, ile ważył surowy produkt i jakie są wartości makro surowca.
Kryteria akceptacji:

- Użytkownik może przełączyć się między trybem standardowym a odwrotnym (np. przyciskiem lub przełącznikiem w UI)
- W trybie odwrotnym użytkownik wprowadza gramaturę po obróbce i wybiera metodę obróbki
- Aplikacja oblicza gramaturę surową i wyświetla makro dla surowca (na 100g i na porcję)
- Obliczenia oparte na odwróconych współczynnikach z USDA yield tables
- Wynik jest wyświetlany w czasie krótszym niż 10 sekund od zatwierdzenia
- Interfejs jasno sygnalizuje użytkownikowi, że jest w trybie odwrotnym

US-011
Tytuł: Wybór metody obróbki termicznej
Opis: Jako użytkownik, chcę wybrać konkretną metodę obróbki termicznej (np. gotowanie w wodzie vs grillowanie), ponieważ różne metody inaczej wpływają na gramaturę i wartości odżywcze produktu.
Kryteria akceptacji:

- Lista metod zawiera dokładnie 3 pozycje MVP: gotowanie (boiling), smażenie (frying), pieczenie (baking)
- Etykiety metod są tłumaczone zgodnie z wybranym językiem interfejsu (i18n)
- Wybrana metoda jest wyraźnie zaznaczona w UI
- Użytkownik nie może zatwierdzić obliczenia bez wybrania metody (walidacja)

US-012
Tytuł: Wyświetlenie wyników obliczenia makro
Opis: Jako użytkownik, po wykonaniu obliczenia chcę zobaczyć czytelnie przedstawione wartości makroskładników, aby móc je wykorzystać w moim dzienniku kalorii.
Kryteria akceptacji:

- Wynik zawiera: gramaturę (g), kalorie (kcal), białko (g), tłuszcze (g), węglowodany (g)
- Wartości prezentowane są w dwóch kolumnach: na 100g produktu i na całą porcję
- Wyniki zaokrąglone do 1 miejsca po przecinku (lub liczby całkowitej – do ustalenia w designie)
- Ekran wyników umożliwia powrót do edycji danych wejściowych
- Ekran wyników zawiera przycisk/link do zapisu w historii (dla zalogowanych) lub zachęty do rejestracji (dla anonimowych)

### Tryb „dania z AI" (Premium)

US-013
Tytuł: Wprowadzenie opisu dania w języku naturalnym
Opis: Jako użytkownik Premium, chcę wpisać opis mojego dania w zwykłym języku (np. „pierś z kurczaka 200g pieczona, ziemniaki 300g gotowane, brokuł 150g na parze"), aby AI automatycznie obliczył makro całego posiłku.
Kryteria akceptacji:

- W trybie AI dostępne jest pole tekstowe z limitem 200 znaków
- Progresywny licznik znaków jest widoczny w polu tekstowym i zmienia kolor lub styl, gdy użytkownik zbliża się do limitu
- Użytkownik nie może wprowadzić więcej niż 200 znaków (blokada lub odcięcie na poziomie UI i backendu)
- Po zatwierdzeniu aplikacja wysyła opis do backendu, który wywołuje LLM przez OpenRouter
- Pole tekstowe wspiera wielowierszowy tekst

US-014
Tytuł: Wyświetlenie wyników AI dla dania
Opis: Jako użytkownik Premium po opisaniu dania, chcę otrzymać wynik zawierający całkowitą masę dania i makro, aby móc dokładnie zalogować posiłek w dzienniku kalorii.
Kryteria akceptacji:

- Wynik zawiera: całkowitą masę dania po obróbce (g), kalorie (kcal), białko (g), tłuszcze (g), węglowodany (g) – dla całego dania i na 100g
- Wynik jest wyświetlany w czytelnym formacie, analogicznym do wyniku trybu produktu
- Czas oczekiwania na odpowiedź AI jest sygnalizowany wskaźnikiem ładowania
- W przypadku błędu sieciowego lub braku odpowiedzi API aplikacja wyświetla stosowny komunikat błędu i umożliwia ponowienie próby

US-015
Tytuł: Obsługa częściowego wyniku AI przy nierozpoznanym składniku
Opis: Jako użytkownik Premium, gdy AI nie rozpoznaje jednego ze składników dania, chcę otrzymać częściowy wynik z ostrzeżeniem, zamiast całkowitego błędu, aby nie tracić obliczeń dla pozostałych składników.
Kryteria akceptacji:

- Gdy LLM nie rozpoznaje składnika, zwraca częściowy wynik dla pozostałych składników
- Aplikacja wyświetla wynik z widocznym ostrzeżeniem np. „Nie rozpoznano: [nazwa składnika] – pomiń go lub spróbuj ponownie z inną nazwą"
- Obliczenia dla rozpoznanych składników są kompletne i poprawne
- Użytkownik może zamknąć ostrzeżenie i korzystać z częściowego wyniku

US-016
Tytuł: Upsell Premium dla użytkownika Free próbującego użyć AI
Opis: Jako użytkownik Free, gdy próbuję skorzystać z trybu AI po wyczerpaniu trialu, chcę zobaczyć jasny ekran z propozycją uaktualnienia do Premium, aby móc podjąć świadomą decyzję o zakupie.
Kryteria akceptacji:

- Zalogowany użytkownik Free, który wyczerpał trial AI, widzi przy próbie użycia trybu AI ekran/modal upsell
- Ekran upsell zawiera opis korzyści Premium i przycisk „Przejdź na Premium"
- **Mobile**: przycisk „Przejdź na Premium" otwiera flow zakupu subskrypcji przez RevenueCat (natywny IAP)
- **Web**: przycisk „Przejdź na Premium" otwiera flow zakupu przez Stripe (web payment)
- Użytkownik może zamknąć ekran upsell i wrócić do trybu produktu

### Historia obliczeń

US-017
Tytuł: Przeglądanie historii obliczeń
Opis: Jako zalogowany użytkownik, chcę mieć dostęp do historii moich poprzednich obliczeń (z obu trybów), aby móc szybko powtórzyć często używane obliczenia lub sprawdzić wcześniejszy wynik.
Kryteria akceptacji:

- W aplikacji dostępna jest dedykowana sekcja „Historia" dla zalogowanych użytkowników
- Historia wyświetla listę obliczeń posortowaną od najnowszego do najstarszego
- Każdy wpis w historii zawiera: typ obliczenia (produkt/danie), datę i godzinę, nazwę produktu lub skrócony opis dania, kluczowe wyniki (kalorie, gramatura)
- Użytkownik może wybrać wpis z historii, aby zobaczyć pełny wynik
- Historia jest dostępna tylko dla zalogowanych użytkowników – anonimowi widzą zachętę do rejestracji w miejscu historii

US-018
Tytuł: Zapis obliczenia do historii
Opis: Jako zalogowany użytkownik, chcę aby moje obliczenia były automatycznie zapisywane w historii, abym nie musiał nic robić manualnie.
Kryteria akceptacji:

- Każde pomyślnie wykonane obliczenie (tryb produktu lub dania) jest automatycznie zapisywane w tabeli `calculations` w Supabase dla zalogowanego użytkownika
- Zapis zawiera pola: `user_id`, `created_at`, `type` (product/dish), `input` (dane wejściowe), `result` (wynik)
- Zapis następuje po wyświetleniu wyniku, nie blokuje jego wyświetlenia
- Dla anonimowych użytkowników zapis nie jest realizowany (dane sesji nie są przechowywane trwale)

### Monetyzacja i subskrypcje

US-019
Tytuł: Zakup subskrypcji Premium przez mobile
Opis: Jako użytkownik Free na iOS lub Androidzie, chcę kupić subskrypcję Premium przez App Store lub Google Play, aby uzyskać nieograniczony dostęp do trybu dania z AI.
Kryteria akceptacji:

- Flow zakupu subskrypcji obsługiwany przez RevenueCat
- Użytkownik może wybrać subskrypcję (miesięczna / roczna – opcje do ustalenia) i przejść przez natywny proces płatności App Store / Google Play
- Po pomyślnym zakupie flaga `is_premium` w Supabase jest aktualizowana przez webhook RevenueCat
- Użytkownik bez ponownego logowania uzyskuje dostęp do trybu AI (na mobile i na web)
- W przypadku niepowodzenia płatności aplikacja wyświetla stosowny komunikat

US-020
Tytuł: Przywrócenie zakupów (Restore Purchases)
Opis: Jako użytkownik Premium, który zainstalował aplikację ponownie lub zmienił urządzenie, chcę przywrócić swoje zakupy, aby nie tracić opłaconej subskrypcji.
Kryteria akceptacji:

- W ustawieniach dostępna jest opcja „Przywróć zakupy"
- Po wybraniu opcji RevenueCat sprawdza historię zakupów powiązanych z kontem App Store / Google Play
- Jeśli subskrypcja jest aktywna, flaga `is_premium` w Supabase jest aktualizowana
- Aplikacja wyświetla potwierdzenie przywrócenia zakupów lub komunikat, że nie znaleziono aktywnej subskrypcji

US-021
Tytuł: Utrata dostępu po wygaśnięciu subskrypcji
Opis: Jako użytkownik Premium, którego subskrypcja wygasła, chcę zobaczyć jasny komunikat o utracie dostępu do trybu AI, aby wiedzieć, że muszę odnowić subskrypcję.
Kryteria akceptacji:

- Po wygaśnięciu subskrypcji webhook (RevenueCat lub Stripe) aktualizuje flagę `is_premium` na false w Supabase
- Przy próbie użycia trybu AI użytkownik widzi komunikat o wygaśnięciu subskrypcji i przycisk odnowienia (na mobile: IAP, na web: Stripe)
- Użytkownik zachowuje dostęp do trybu produktu (Free) i historii obliczeń
- Historia obliczeń z okresu Premium jest nadal dostępna

### Monetyzacja webowa

US-030
Tytuł: Zakup subskrypcji Premium przez web
Opis: Jako użytkownik Free korzystający z aplikacji webowej, chcę kupić subskrypcję Premium przez stronę, aby uzyskać nieograniczony dostęp do trybu dania z AI bez potrzeby instalowania aplikacji mobilnej.
Kryteria akceptacji:

- Flow zakupu subskrypcji na web obsługiwany przez Stripe (lub wybrany web payment provider)
- Użytkownik może wybrać subskrypcję (miesięczna / roczna) i przejść przez Stripe Checkout
- Po pomyślnym zakupie webhook Stripe aktualizuje flagę `is_premium` w Supabase (ta sama flaga co dla IAP)
- Użytkownik bez ponownego logowania uzyskuje dostęp do trybu AI — zarówno na web, jak i na mobile
- W przypadku niepowodzenia płatności strona wyświetla stosowny komunikat
- Webhook Stripe weryfikowany przez podpisany sekret (Stripe webhook signature) przed aktualizacją danych

US-031
Tytuł: Cross-platform dostęp Premium (mobile ↔ web)
Opis: Jako użytkownik, który kupił subskrypcję Premium na jednej platformie (mobile lub web), chcę mieć automatyczny dostęp do trybu AI również na drugiej platformie, bez dodatkowych kroków.
Kryteria akceptacji:

- Subskrypcja zakupiona przez RevenueCat (mobile) jest honorowana na web — użytkownik loguje się tym samym e-mailem i ma pełny dostęp AI
- Subskrypcja zakupiona przez Stripe (web) jest honorowana na mobile — po zalogowaniu tym samym kontem użytkownik ma pełny dostęp AI
- Obie platformy czytają flagę `is_premium` z tabeli `profiles` w Supabase na podstawie JWT `user_id`
- Nie jest wymagane żadne dodatkowe działanie użytkownika po zalogowaniu — dostęp jest natychmiastowy

### Bezpieczeństwo i limity

US-022
Tytuł: Egzekwowanie limitu wywołań AI per IP
Opis: Jako administrator systemu, chcę aby backend egzekwował limit ok. 20 wywołań AI na 24h per adres IP, aby chronić system przed nadużyciami i nieoczekiwanymi kosztami API.
Kryteria akceptacji:

- Backend sprawdza liczbę wywołań AI z danego IP w ciągu ostatnich 24h przed każdym wywołaniem LLM
- Po przekroczeniu limitu (~20/24h) backend zwraca stosowny błąd HTTP (np. 429 Too Many Requests)
- Aplikacja wyświetla użytkownikowi zrozumiały komunikat o tymczasowym limicie i informuje, kiedy limit zostanie zresetowany
- Limit jest konfigurowany po stronie backendowej bez konieczności zmian w integracji OpenRouter
- Limit IP działa niezależnie od statusu zalogowania użytkownika (dotyczy też Premium jako zabezpieczenie przed abuse)

US-023
Tytuł: Egzekwowanie limitów produktowych per user ID przez JWT
Opis: Jako system backendowy, chcę egzekwować limity wywołań AI na podstawie JWT user ID dla zalogowanych użytkowników, aby właściwie różnicować dostęp między planami Free i Premium.
Kryteria akceptacji:

- Każde wywołanie AI przez zalogowanego użytkownika jest walidowane przez backend na podstawie JWT
- Backend sprawdza flagę `is_premium` powiązaną z `user_id` z tokenu JWT
- Użytkownik Free (po wyczerpaniu trialu) otrzymuje odpowiedź 403 Forbidden przy próbie wywołania AI
- Użytkownik Premium może wywoływać AI zgodnie z limitami planu Premium
- Token JWT jest weryfikowany po stronie backendu przy każdym chronionym żądaniu

### Wielojęzyczność

US-024
Tytuł: Zmiana języka interfejsu
Opis: Jako użytkownik, chcę mieć możliwość korzystania z aplikacji w preferowanym języku (polskim lub angielskim), aby interfejs był dla mnie intuicyjny.
Kryteria akceptacji:

- Aplikacja domyślnie wykrywa język systemowy urządzenia i ustawia odpowiedni język interfejsu (pl lub en)
- Użytkownik może zmienić język w ustawieniach aplikacji
- Po zmianie języka wszystkie etykiety interfejsu, etykiety metod obróbki i komunikaty błędów są wyświetlane w wybranym języku
- Baza produktów pozostaje w języku angielskim niezależnie od wybranego języka interfejsu
- Zmiana języka nie wymaga restartu aplikacji

US-025
Tytuł: Wyświetlanie komunikatów błędów w języku interfejsu
Opis: Jako użytkownik, chcę aby wszystkie komunikaty błędów (błędy sieci, błędy AI, błędy walidacji) były wyświetlane w moim języku, aby rozumieć, co poszło nie tak.
Kryteria akceptacji:

- Wszystkie komunikaty błędów są objęte systemem i18n (pliki pl.json i en.json)
- Komunikaty błędów wyświetlają się w języku aktualnie ustawionym w aplikacji
- Komunikaty są zrozumiałe i zawierają sugestię kolejnego kroku dla użytkownika

### Scenariusze brzegowe i obsługa błędów

US-026
Tytuł: Brak połączenia z internetem
Opis: Jako użytkownik bez dostępu do internetu, chcę zobaczyć czytelny komunikat o braku połączenia, aby wiedzieć, dlaczego obliczenie nie działa.
Kryteria akceptacji:

- Aplikacja wykrywa brak połączenia z internetem przed próbą wywołania API
- W przypadku braku połączenia wyświetlany jest komunikat „Brak połączenia z internetem" z opcją ponowienia próby
- Tryb produktu z lokalnie dostępną bazą danych może działać offline (jeśli technicznie wykonalne w MVP; w przeciwnym razie komunikat o wymaganiu połączenia)
- Tryb AI zawsze wymaga połączenia i wyświetla stosowny komunikat przy jego braku

US-027
Tytuł: Błąd wywołania LLM (timeout lub błąd serwera)
Opis: Jako użytkownik trybu AI, gdy wywołanie LLM zakończy się błędem lub przekroczy czas oczekiwania, chcę zobaczyć czytelny komunikat i móc ponowić próbę, aby nie tracić całego obliczenia.
Kryteria akceptacji:

- Backend ustawia timeout dla wywołań LLM i obsługuje błędy OpenRouter
- W przypadku błędu lub timeout aplikacja wyświetla komunikat „Nie udało się przetworzyć opisu dania. Spróbuj ponownie."
- Aplikacja oferuje przycisk „Spróbuj ponownie" bez konieczności ponownego wpisywania opisu dania
- Wywołanie zakończone błędem nie jest wliczane do limitu trialu użytkownika

US-028
Tytuł: Wprowadzenie nieprawidłowej gramatury
Opis: Jako użytkownik trybu produktu, gdy omyłkowo wprowadzę nieprawidłową wartość gramatury (np. 0, wartość ujemną lub tekst), chcę otrzymać jasny komunikat walidacyjny, aby poprawić dane wejściowe.
Kryteria akceptacji:

- Pole gramatury akceptuje wyłącznie liczby dodatnie większe od 0
- Próba zatwierdzenia formularza z nieprawidłową wartością powoduje wyświetlenie komunikatu walidacyjnego przy polu
- Komunikat walidacyjny jest zlokalizowany (zgodny z aktualnym językiem interfejsu)
- Przycisk zatwierdzenia jest nieaktywny lub walidacja blokuje przejście do wyniku do czasu podania poprawnej wartości

US-029
Tytuł: Przekroczenie limitu znaków w trybie AI
Opis: Jako użytkownik trybu AI, gdy próbuję wpisać opis dłuższy niż 200 znaków, chcę aby aplikacja jasno komunikowała limit, aby dostosować opis dania.
Kryteria akceptacji:

- Pole tekstowe wyświetla progresywny licznik znaków (np. „120/200") widoczny przez cały czas pisania
- Licznik zmienia kolor (np. na czerwony) gdy użytkownik zbliża się do limitu (np. przy >180 znaków)
- Po osiągnięciu 200 znaków pole przestaje przyjmować nowe znaki (blokada na poziomie UI)
- Backend również waliduje limit 200 znaków i odrzuca żądania z dłuższym opisem
- Komunikat o przekroczeniu limitu jest zlokalizowany

---

## 6. Metryki sukcesu

| Metryka                         | Cel / Próg                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Czas do wyniku (tryb produktu)  | Poniżej 10 sekund od zatwierdzenia danych wejściowych do wyświetlenia wyniku (mobile i web)                   |
| Błąd estymacji makro po obróbce | Poniżej 10–15% odchylenia vs. wartości referencyjne USDA (metodologia pomiaru do ustalenia)                   |
| Retencja tygodniowa             | Użytkownik powraca do aplikacji co najmniej kilka razy w tygodniu (mierzone łącznie dla mobile i web)         |
| Walidacja funkcji AI            | Tryb dania z AI realnie upraszcza liczenie kalorii dla złożonych posiłków (ocena jakościowa + metryki użycia) |
| Konwersja trial → rejestracja   | Do ustalenia po zebraniu pierwszych danych; punkt bazowy w pierwszym miesiącu po launchu                      |
| Konwersja Free → Premium        | Do ustalenia po zebraniu pierwszych danych; śledzony przez RevenueCat (mobile) i Stripe (web)                 |
| Wskaźnik błędów wywołań AI      | Poniżej 5% wywołań kończących się błędem (timeout, błąd parsowania, nierozpoznane danie)                      |
| Czas odpowiedzi AI              | Mediana poniżej 5 sekund dla wywołania LLM (od wysłania do odebrania wyniku)                                  |
| Nadużycia limitu IP             | Mniej niż 1% unikalnych IP blokowanych dziennie przez limit abuse (wskaźnik kalibracji limitu)                |
| Split platform                  | Stosunek sesji mobile vs web — do obserwacji po launchu; nie ma celu w MVP                                    |
