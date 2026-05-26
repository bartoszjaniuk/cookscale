# Plan Implementacji Animacji (Landing Page)

## 1. Wybór technologii

Wybieramy bibliotekę **Framer Motion**. Zapewnia doskonałe narzędzia do złożonych animacji asynchronicznych (reveal, stagger) i prostych "pływających" elementów, z pełną kompatybilnością w świecie Reacta. Do prostych stanów `hover` korzystamy z klas TailwindCSS.

## 2. Architektura komponentów wielokrotnego użytku (Etap 1)

Stworzenie centralnych "wrapperów" animacyjnych w pliku `motion.tsx` redukujących powielanie kodu (DRY):

1. `<FadeIn />` – Uogólnione wejście z określeniem widoczności oraz kierunku (up, down, left, right).
2. `<StaggerContainer />` & `<StaggerItem />` – Para kontenera i elementu-dziecka służących do ujawniania sekwencyjnego np. we wdrożeniu siatki kart.
3. `<FloatingElement />` – Komponent zapętlający i unoszący dzieci (dla efektu unoszących się kafelków).

## 3. Plan dla poszczegółnych sekcji (Etap 2 do 4)

### A. Sekcja "Hero"

- **Tytuł, Opis, Przyciski CTA:** Kolejno ładujący się tekst (`fade up`), ułożony za pomocą Stagger/Delay.
- **Mockup telefonu:** Wejście po załadowaniu ze skalowania wg góry.
- **Lewitujące mikrokarty:** Natychmiastowe pojawienie się w formie ułamkowej po ekranie (Scale-up) wraz z uruchomieniem nieskończonej animacji ruchu pływającego we wskaźniku Y (różne opóźnienia i amplitudy dla dodania naturalności).

### B. Sekcja "Rozwiązania / Funkcje"

- **Nagłówek sekcji:** Łagodne wejście od dołu za pomocą `<FadeIn />`
- **Siatka trójdzielna (3 karty):** Animacja asynchroniczna z krokiem co np. `0.2s` za pomocą kontenera Stagger.
- **Hover na kartach:** Wykorzystanie standardowych efektów Tailwinda.

### C. Sekcja "Jak to działa" (Kroki i Kalkulator)

- Lista Kroków ukaże się najeżdżając z boku na osi X względem viewportu (Left -> In), Prawy kalkulator z prawej.

### D. Sekcja "AI Showcase"

- Środkowy mockup - `FadeIn` scale po pojawieniu się na ekranie.
- Wewnętrzne okręgi / koła i gradient - w tle będzie nałożona ciągła obiektywna nieskończona animacja rotacyjna CSS.
- Zjechanie bocznych paneli: 2 szt. z lewej (do centrum) oraz 2 z prawej.
- Dolne checkmarki/ikony: Kolejny prosty kaskadowy `StaggerContainer`.

### E. Ostatnie CTA

Złapanie wzroku powolną animacją wyostrzenia (Scalowania).
