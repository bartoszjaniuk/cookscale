## Aplikacja - CookScale – Raw to Cooked Calculator (MVP)

## Główny problem

Osoby liczące kalorie oraz makroskładniki mają trudność z dokładnym określeniem wartości odżywczych potraw po obróbce termicznej. Dane na opakowaniach i w popularnych aplikacjach odnoszą się najczęściej do produktów surowych, co prowadzi do błędów w estymacji kalorii i makro po gotowaniu, smażeniu czy pieczeniu. Dodatkowo, zmiana gramatury (np. utrata wody lub absorpcja tłuszczu) jest trudna do przewidzenia bez specjalistycznej wiedzy.

## Najmniejszy zestaw funkcjonalności

- Baza danych produktów spożywczych z wartościami odżywczymi (kalorie, białko, tłuszcze, węglowodany)
- Dane o współczynnikach zmiany gramatury w zależności od metody obróbki (np. kurczak: -25% po smażeniu)
- Możliwość wyboru produktu i metody obróbki oraz ręcznego sprawdzenia zmiany gramatury
- Przeliczanie wartości odżywczych po obróbce (na podstawie zmienionej masy)
- Prosty kalkulator dla całego dania (sumowanie składników + zastosowanie obróbki)
- Integracja z LLM do automatycznego obliczania zmiany gramatury całego dania (np. risotto z kurczakiem: "200g kurczaka smażonego + 100g ryżu gotowanego")
- Intuicyjny, czytelny interfejs mobilny (input → wynik)
- Obliczanie zapotrzebowania kalorycznego
- Wsparcie dla wielu języków

## Co NIE wchodzi w zakres MVP

- Zaawansowane śledzenie diety (historia posiłków, cele kaloryczne, dashboardy)
- Personalizacja pod użytkownika (np. dieta, alergie, rekomendacje)
- Integracje z urządzeniami (np. smart wagi, Apple Health, Google Fit)
- Rozpoznawanie obrazów (np. analiza zdjęcia posiłku)
- Zaawansowane modele predykcji zmian masy (np. zależne od czasu, temperatury, techniki)
- Tryb społecznościowy (udostępnianie przepisów)

## Kryteria sukcesu

- Użytkownik jest w stanie w mniej niż 10 sekund obliczyć zmianę gramatury produktu po obróbce
- Błąd estymacji kalorii/makro po obróbce jest istotnie niższy niż w popularnych aplikacjach (np. <10–15%)
- Użytkownik wraca do aplikacji co najmniej kilka razy w tygodniu (retencja)
- Walidacja, że funkcja „całe danie + LLM” realnie upraszcza proces liczenia kalorii
