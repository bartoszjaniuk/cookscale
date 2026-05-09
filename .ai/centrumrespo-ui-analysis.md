# Analiza wizualna — centrumrespo.pl
> Przeanalizowane strony: Strona główna, Oferta (kobiety/mężczyźni/dzieci/dla dwóch), Metamorfozy, Metoda Respo, O nas, Blog, Kalkulator kalorii, Kontakt, Voucher

---

## 1. Kolorystyka

### Paleta główna

| Nazwa | Wartość | Zastosowanie |
|-------|---------|--------------|
| **Zielony główny (Primary Green)** | `rgb(3, 109, 81)` / `#036D51` | CTA przyciski (filled), akcenty, checkmarki, bordery outline-buttonów, active states |
| **Zielony jasny (Light Green BG)** | `rgb(220, 241, 226)` / `#DCF1E2` | Tła sekcji (np. "Pyszna dieta"), tła banerów, active tab w selektorze okresu |
| **Zielony bardzo jasny** | `rgb(241, 249, 243)` / `#F1F9F3` | Delikatne tła sekcji content |
| **Czarny** | `rgb(0, 0, 0)` / `#000000` | Tekst nagłówków, body text, hero CTA secondary, nawigacja |
| **Biały** | `rgb(255, 255, 255)` / `#FFFFFF` | Tło strony, footerowy tekst, karty offert |
| **Szary bardzo jasny** | `rgb(238, 238, 238)` / `#EEEEEE` | Bordery, dividers, tła inputów, nieaktywne elementy |
| **Szary mid** | `rgb(218, 218, 218)` / `#DADADA` | Border period-selector tab container |
| **Szary tło** | `rgb(246, 246, 246)` / `#F6F6F6` | Tło przycisku "Zaloguj" w nawigacji |
| **Szary overlay** | `rgba(0, 0, 0, 0.05)` | Cień/nakładka na elementy |
| **Pomarańczowy (Announcement)** | `rgb(255, 224, 195)` / `#FFE0C3` | Top announcement bar |
| **Fioletowy (Promo)** | `rgb(63, 50, 180)` / `#3F32B4` | Aktywny baner promocyjny (offer-active-banner) |
| **Czarny footer** | `rgb(0, 0, 0)` / `#000000` | Tło stopki |

### Hierarchia kolorów funkcjonalnych

```
Background:     #FFFFFF (domyślne) / #000000 (footer) / #F1F9F3 (sekcje)
Primary:        #036D51 (zielony — akcja, CTA, checkbox, active)
Secondary:      #000000 (czarny — outline CTA, nagłówki)
Muted/Surface:  #EEEEEE / #F6F6F6 / #DCF1E2
Alert/Promo:    #FFE0C3 (pomarańcz) / #3F32B4 (fiolet)
Text Primary:   #000000
Text Inverse:   #FFFFFF (na ciemnych bg)
Border:         #EEEEEE / #DADADA
```

---

## 2. Typografia

### Kroje pisma

| Krój | Zastosowanie |
|------|-------------|
| **Tiempos Headline** | Nagłówki H1–H4 (seryfy, editorial, wysokiej klasy) |
| **Basier Circle** | Tekst UI — przyciski, nawigacja, body, labels, meta |
| **sans-serif** (fallback) | Generyczny fallback dla body |

### Skala typograficzna

| Element | Font | Rozmiar | Waga | Line-height | Letter-spacing |
|---------|------|---------|------|-------------|----------------|
| H1 | Tiempos Headline | 48px | 300 (light) | 63.84px (~1.33) | -0.4px |
| H2 | Tiempos Headline | 40px | 300 (light) | 54px (1.35) | -0.4px |
| H3 | Tiempos Headline | 18px | 300 (light) | 23px (~1.27) | -0.3px |
| H4 | Tiempos Headline | 24px | 300 (light) | 36px (1.5) | -0.3px |
| Body / Paragraf | Basier Circle / sans-serif | 15–16px | 400 (regular) | 24px (1.6) | 0 |
| Nawigacja link | Basier Circle | 16px | 400 | auto | -0.2 do -0.32px |
| CTA / Button | Basier Circle | 16–18px | 400 | auto | -0.2px |
| Caption / Meta | Basier Circle | 14px | 400 | auto | 0 |
| Footer link | Basier Circle | 18px | 400 | auto | 0 |

### Charakterystyka typografii

- **Nagłówki**: bardzo lekka waga (300), duże rozmiary, ujemny letter-spacing → elegancki, editorial feel
- **Body**: regularna waga (400), komfortowy line-height 1.6
- **Brak pogrubień** w nagłówkach — styl minimalistyczny, luksusowy
- **TextTransform**: brak (żadne elementy nie używają uppercase)
- **Serif + Sans-serif** kontrast: headings (Tiempos = serif) vs. UI (Basier Circle = geometric sans)

---

## 3. Button

### Typy przycisków

#### Primary (Filled) — Zielony
```
Tło:            rgb(3, 109, 81)   #036D51
Kolor tekstu:   rgb(255, 255, 255) #FFFFFF
Border:         1px solid rgb(3, 109, 81)
Border-radius:  48px (fully rounded / pill)
Padding:        17.5px 24px
Font-size:      16px
Font-weight:    400
Box-shadow:     none
```
Przykład: "Sprawdź ofertę" (hero section, offer page)

#### Secondary (Outline) — Zielony obrys
```
Tło:            rgba(0, 0, 0, 0) / transparent
Kolor tekstu:   rgb(3, 109, 81)   #036D51
Border:         1px solid rgb(3, 109, 81)
Border-radius:  48px (pill)
Padding:        17.5px 24px
Font-size:      16px
Font-weight:    400
Box-shadow:     none
```
Przykład: "Zobacz metamorfozy" (hero section)

#### Secondary (Filled) — Czarny
```
Tło:            rgb(0, 0, 0)      #000000
Kolor tekstu:   rgb(255, 255, 255) #FFFFFF
Border:         0px (brak)
Border-radius:  200px (pill, większy niż primary)
Padding:        14px 32px
Font-size:      18px
Font-weight:    400
Box-shadow:     none
```
Przykład: "Sprawdź dietę" (sekcje podstron, karty ofert)

#### Ghost / Minimal — "Zaloguj"
```
Tło:            rgb(246, 246, 246) #F6F6F6
Kolor tekstu:   rgb(0, 0, 0)       #000000
Border-radius:  8px
Padding:        4px 12px
Font-size:      14px
Box-shadow:     none
```
Przykład: Przycisk "Zaloguj" w nagłówku nawigacji

#### Active Tab (period selector)
```
Tło:            rgb(220, 241, 226) #DCF1E2
Border:         2px solid rgb(3, 109, 81)
Border-radius:  80px
Box-shadow:     rgba(0, 0, 0, 0.12) 0px 4px 12px 0px
Padding:        8px 12px
```

### Podsumowanie przycisków

- **Dominuje kształt pill** (`border-radius: 48px–200px`) — miękkość, nowoczesność
- **Brak box-shadow** na głównych przyciskach (poza active tab)
- **Font-weight 400** — nie bold; elegancja przez kształt, nie wagę
- **Dwa główne kolory CTA**: zielony (`#036D51`) i czarny (`#000000`)

---

## 4. Input

Strona używa głównie customowych komponentów formularza (np. kalkulator z hidden inputami, Gravity Forms). Widoczne wzorce:

### Pole tekstowe / email / telefon (Gravity Forms / kontakt)
```
Tło:            rgb(255, 255, 255) #FFFFFF lub rgb(238, 238, 238) #EEEEEE
Border:         brak górnego/lewego/prawego — tylko borderBottom
Border-bottom:  1px–2px solid rgb(0, 0, 0) lub rgb(238, 238, 238)
Border-radius:  0px (pola bez zaokrąglenia) lub 4px (minimalne)
Padding:        12px 0px lub 8px 16px
Font-size:      15–16px
Line-height:    24px
Height:         auto / 48px
Outline:        none (usunięty)
Color:          rgb(0, 0, 0)
```
> Styl **underline-only** (bottom border) — minimalny, elegancki

### Search input (blog)
```
Tło:            rgb(255, 255, 255) #FFFFFF
Border:         1px solid rgb(238, 238, 238)
Border-radius:  8px lub 48px (pill)
Padding:        8px 16px
Font-size:      15px
```

### Checkbox
```
Tło:            transparent
Border:         brak (custom styled)
Customowy styl: zielony check-mark rgb(3, 109, 81) po zaznaczeniu
```

### Placeholder
- Kolor: `rgb(150, 150, 150)` / szary
- Font-size: identyczny jak input (nie zmniejszony)

---

## 5. Typography — szczegóły

### Linki
```
Kolor (default):     rgb(0, 0, 0) — brak konwencji niebieskiego
Kolor (nav aktywny): rgb(3, 109, 81)
Text-decoration:     none (na większości linków)
Hover:               kolor zmienia się na zielony #036D51
```

### Kategorie / tagi (blog)
```
Tło:            rgb(238, 238, 238) lub rgb(220, 241, 226)
Border-radius:  16px–24px (zaokrąglone pill)
Padding:        4px 12px
Font-size:      13–14px
Font-weight:    400
Color:          rgb(0, 0, 0) lub rgb(3, 109, 81)
```

### Aktywna kategoria (blog)
```
Tło:            rgb(0, 0, 0)
Color:          rgb(255, 255, 255)
Border-radius:  24px (pill)
Padding:        4px 16px
```

---

## 6. Card

### Karta oferty (pricing card)
```
Background:     rgb(255, 255, 255) #FFFFFF
Border-radius:  16px
Border:         brak lub 1px solid #EEEEEE
Box-shadow:     none (shadow zastąpiona kontrastem tła)
Padding:        0px (padding wewnątrz sub-elementów)
Overflow:       hidden
```

### Karta blog / artykuł
```
Background:     rgb(255, 255, 255) #FFFFFF
Border-radius:  8px–12px
Box-shadow:     rgba(0, 0, 0, 0.08) 0px 0px 80px 0px (duże, miękkie)
Border:         brak
Padding:        16px–24px
```
> Layout: zdjęcie + tytuł (Tiempos Headline) + meta (autor, data) + excerpt

### Karta transformacji (metamorfozy)
```
Background:     transparent / rgba(0,0,0,0)
Border-radius:  0px
Box-shadow:     none
```
Zawartość: zdjęcia before/after side-by-side, wynik wagowy, opis. Slider (Swiper.js).

### Baner / Promo card
```
Background:     rgb(220, 241, 226) #DCF1E2 (zielony jasny)
Border-radius:  12px–16px
Padding:        24px 48px
```

---

## 7. Modal / Dialog

Na stronie widoczny jest cookie consent modal (Cookiebot) — własna biblioteka, nie odzwierciedla designu Respo.

### Cookie modal (Cookiebot — system)
```
Background:     rgb(255, 255, 255)
Border-radius:  4px
Box-shadow:     obecny (standardowy shadow)
Overlay:        szary półprzezroczysty backdrop
```

### Chat widget (support)
```
Kształt:        okrągły FAB (Floating Action Button)
Background:     rgb(63, 50, 180) #3F32B4 (fioletowy)
Rozmiar:        ~56px × 56px
Pozycja:        fixed, bottom-right
Border-radius:  50%
```

### Wzorzec modal (Respo design)
Brak własnego modala bezpośrednio wykrytego. Na podstawie designu systemu można przyjąć:
```
Background:     rgb(255, 255, 255)
Border-radius:  16px
Box-shadow:     rgba(0, 0, 0, 0.12) 0px 16px 48px 0px
Overlay:        rgba(0, 0, 0, 0.4)
Padding:        32px
```

---

## 8. Form

### Kontakt / formularz kontaktowy
```
Struktura:      pola z bottom-border only (underline style)
Layout:         single column, full-width fields
Label:          font-size 15px, font-weight 400, margin-bottom ~8px
Input gap:      24px–32px między polami
Submit button:  Primary (zielony pill) lub czarny pill
Brak:           żadnych kart / boxów wokół formularza — formularz jest "floating"
```

### Kalkulator kalorii
```
Typ:            multi-step wizard (progress bar u góry — zielony #036D51)
Pola:           custom radio buttons + select
Układ:          centered, max-width ~600px
Submit:         zielony pill CTA "Oblicz"
Tło sekcji:     rgb(255, 255, 255)
Progress bar:   linia u góry, kolor #036D51, width proporcjonalna do kroku
```

---

## 9. Navigation

### Top announcement bar
```
Background:     rgb(255, 224, 195) #FFE0C3 (pomarańczowy pastelowy)
Color:          rgb(0, 0, 0) / link: rgb(0, 0, 238) (domyślny niebieski linku)
Font-size:      18px (Basier Circle)
Padding:        8px 32px
Tekst:          np. "Zamów dietę dziś, aby otrzymać swój plan już 17.05."
Ikona:          dzwonek (🔔 emoji lub SVG)
```

### Główna nawigacja (header)
```
Background:     transparent / rgba(0,0,0,0) (przy scrollu staje się biała)
Position:       sticky (top: 0)
Height:         71px (desktop)
Border-bottom:  brak
Box-shadow:     none
```

**Logo**: `Respo.` — czarny tekst + zielona kropka `•` (`#036D51`), font Tiempos Headline, font-size ~32px

**Linki menu (desktop)**:
```
Font-family:    Basier Circle
Font-size:      16px
Font-weight:    400
Color:          rgb(0, 0, 0)
Letter-spacing: -0.2px do -0.32px
Text-decoration: none
Hover:          kolor zielony #036D51 (zakładana)
```

**Dropdown menu**: rozwijane submenu przy hover (sub-menu lista), padding-left: 12px

**Przycisk "Zaloguj"** (prawy koniec navbaru):
```
Background:     rgb(246, 246, 246) #F6F6F6
Color:          rgb(0, 0, 0)
Border-radius:  8px
Padding:        4px 12px
Font-size:      14px
Ikona:          SVG ikona osoby (user/account)
```

**Przycisk "Sprawdź dietę" (mobile CTA w nav)**:
```
Background:     rgb(3, 109, 81) #036D51
Color:          rgb(255, 255, 255)
Border-radius:  200px (pill)
Padding:        ~10px 20px
Font-size:      16px
```

### Mobilna nawigacja
```
Hamburger:      trzy linie — ikona menu (SVG), kolor czarny
Mobile menu:    pełnoekranowy overlay, background: rgb(255, 255, 255)
Linki:          font-size 16px, font-weight 400, kolor czarny
Layout:         lista pionowa z dropdownami
```

### Tabs / Submenu nawigacyjne (np. Blog)
```
Typ:            horizontal pill tabs
Background (inactive): rgb(238, 238, 238) lub transparent
Background (active):   rgb(0, 0, 0)
Color (active): rgb(255, 255, 255)
Border-radius:  24px (pill)
Padding:        6px 16px
Font-size:      14px
Gap między tabami: 8px
```

---

## 10. List

### Lista z checkmarkami (hero / features)
```
Typ:            custom — brak natywnych bullet
Marker:         SVG checkmark w kolorze #036D51 (zielony)
Font-size:      16px
Font-weight:    400
Line-height:    1.5
Margin-bottom:  8px–12px (między itemami)
Color:          rgb(0, 0, 0)
```

### Lista nawigacyjna (menu)
```
list-style-type: none
padding-left:   0 (top level) / 12px (sub-menu)
margin:         0
display:        flex (horizontal nav) / block (mobile)
```

### Lista contentowa (metodologia, blog)
```
list-style-type: disc (natywny bullet)
padding-left:   ~24px (lub większy — 126px przy głębszych poziomach)
font-size:      16px
margin-bottom:  16px (między itemami)
color:          rgb(0, 0, 0)
```

### Lista artykułów (blog)
```
Layout:         CSS Grid / Flexbox
Gap:            24px–32px
Elementy:       thumbnail (1:1 lub 16:9) + tytuł + meta
Tytuł:          Tiempos Headline, 20–24px, font-weight 300
Meta:           Basier Circle, 13–14px, kolor szary
```

---

## 11. Feedback

### Oceny / statystyki
```
Element:        gwiazdki (⭐) — żółte/pomarańczowe emoji lub SVG
Wynik:          "4.8/5" — Basier Circle, font-weight 700, font-size 18–20px
Label:          "Ocena wsparcia dietetyka na czasie" — font-size 14px, kolor szary
```

### Alert bar (aktywna promocja)
```
Background:     rgb(63, 50, 180) #3F32B4 (fioletowy)
Color:          rgb(255, 255, 255)
Font-size:      16px
Padding:        12px 24px
```

### Komunikaty sukcesu / błędu (formularz)
- Brak bezpośrednio widocznych error states — architektura opart na Gravity Forms
- Zakładany wzorzec:
  ```
  Error:    kolor rgb(220, 53, 69) czerwony, border-bottom red
  Success:  kolor rgb(3, 109, 81) zielony, checkmark
  ```

### Progress indicator (kalkulator)
```
Typ:            thin progress bar (u góry strony)
Tło:            rgb(238, 238, 238)
Fill:           rgb(3, 109, 81) #036D51
Height:         4px
Border-radius:  0 lub 2px
```

### Social proof
```
Awatary:        małe okrągłe zdjęcia (36–40px) w rzędzie (overlap style)
Licznik:        "89 551 Podopiecznych" — duży, Tiempos Headline
Podtytuł:       "osiągnęło sukces" — Basier Circle, 16px
```

---

## 12. Layout

### Siatka i breakpointy

```
Max-width kontenera:  brak stałego max-width (fluid) lub ~1200–1440px
Marginesy:            0px (edge-to-edge sekcje) + padding wewnętrzny 32–64px
Kolumny:              CSS Grid lub Flexbox — 1/2/3 kolumny zależnie od sekcji
Gap:                  24px–48px
```

### Sekcje strony

| Sekcja | Tło | Padding |
|--------|-----|---------|
| Hero | biały / zdjęcie | 80–120px top/bottom |
| Stats | biały | 64–80px |
| Pyszna dieta | `#F1F9F3` jasny zielony | 64px |
| Oferta / Pricing | biały | 64–80px |
| Baner contentowy | `#DCF1E2` zielony jasny | 24px 48px |
| Footer | `#000000` czarny | 64px top |

### Sekcja hero (desktop)

```
Layout:         50% tekst lewy / 50% grafika prawa (split layout)
Albo:           centered text z tłem zdjęciowym (pełna szerokość)
Padding:        80–120px vertical
H1:             48px, Tiempos Headline, weight 300
CTA buttons:    flex row, gap 16px
```

### Sekcja hero (mobile — 390px)

```
Layout:         single column, centered
H1:             ~32–36px, Tiempos Headline, bold (700 na mobile)
CTA buttons:    full-width pills, stacked vertically, gap 12px
```

### Karty pricing (oferta)
```
Layout:         horizontal scroll (tabs) lub 3-kolumnowy grid
Gap:            16–24px
Border-radius:  16px
Padding wewnętrzny: 24–32px
```

### Footer
```
Background:     rgb(0, 0, 0) #000000
Color:          rgb(255, 255, 255)
Layout:         multi-column grid (logo + 3–4 kolumny linków)
Font-size:      18px (linki) / 14px (prawa autorskie)
Padding:        64px 32px
Logo:           biała wersja "Respo." + zielona kropka #036D51
Social icons:   Facebook, Instagram, YouTube — białe, okrągłe tło lub naked SVG
```

---

## 13. Iconography

### Styl ikon

| Cecha | Wartość |
|-------|---------|
| **Typ** | SVG inline + obrazy PNG/WebP (ikony produktów/ilustracji) |
| **Styl ogólny** | **Outlined / Line icons** — cienkie linie (1.5–2px stroke) |
| **Font Awesome** | NIE używany |
| **Icon fonts** | NIE używane |
| **Rozmiar nawigacyjny** | 18–24px |
| **Rozmiar large** | 48–64px (sekcje features) |

### Rodzaje ikon

1. **Nawigacja / UI** — SVG outline, np. user/account (ikona przy "Zaloguj"), strzałka, hamburger
2. **Checkmark / Success** — SVG zielony `#036D51`, styl "check" (✓) — używany przy bullet listach hero
3. **Kategorie (blog)** — małe ilustracyjne ikony przy tabbach (styl flat/filled kolorowy — np. kubek, atlas, kalkulator) w rozmiarze ~20px
4. **Social media** — Facebook, Instagram, YouTube — standard brand icons (SVG), kolor biały w footerze
5. **Gwiazdki ocen** — żółto-pomarańczowe (emoji lub SVG filled)
6. **Bell (dzwonek)** — w announcement bar, styl solid/emoji
7. **Ilustracje dekoracyjne** — custom ilustracje (kalkulator z warzywami, postaci), styl flat 2D colorful, nie line icons

### Charakterystyka

- Ikony są **minimalistyczne i cienkie** — pasują do ogólnego tone-of-voice (premium, minimalizm)
- **Brak heavy icon packs** — ikony custom lub nieliczne SVG
- **Zielony `#036D51`** jako domyślny kolor ikon akcji i sukcesu
- **Ilustracje** kontrastują ze stylem UI — są bardziej kolorowe i "ciepłe"

---

## Podsumowanie designu — profil estetyczny

| Wymiar | Charakter |
|--------|-----------|
| **Ogólny styl** | Premium minimalizm, editorial |
| **Feeling** | Trustworthy, health-focused, clean |
| **Kontrast** | Wysoki (czarny na białym, biały na czarnym) |
| **Zaokrąglenia** | Bardzo duże (pill 48–200px radius) — miękki, przyjazny |
| **Białe przestrzenie** | Bardzo dużo (generous whitespace) |
| **Animacje** | Swiper.js slidery, płynne przejścia CSS |
| **Zdjęcia** | Lifestyle, realistyczne, ciepłe tony |
| **Ilustracje** | Flat 2D colorful — wyróżniają sekcje narzędziowe |

---

## Wskazówki do odtworzenia w aplikacji mobilnej

### Kolory (CSS / NativeWind tokens)
```css
--color-primary:       #036D51;   /* Green */
--color-primary-light: #DCF1E2;   /* Light Green BG */
--color-primary-muted: #F1F9F3;   /* Very Light Green */
--color-black:         #000000;
--color-white:         #FFFFFF;
--color-gray-100:      #F6F6F6;
--color-gray-200:      #EEEEEE;
--color-gray-300:      #DADADA;
--color-announcement:  #FFE0C3;   /* Orange promo */
--color-promo:         #3F32B4;   /* Purple promo */
```

### Przyciski mobilne
- **Primary**: `backgroundColor: #036D51`, `borderRadius: 48`, `paddingVertical: 17.5`, `paddingHorizontal: 24`, `color: #fff`, `fontFamily: BasierCircle`, `fontSize: 16`
- **Outline**: transparent bg, `borderWidth: 1`, `borderColor: #036D51`, `color: #036D51`, same radius/padding
- **Black pill**: `backgroundColor: #000`, `borderRadius: 200`, `paddingVertical: 14`, `paddingHorizontal: 32`, `fontSize: 18`

### Typografia mobilna
- Nagłówki: Tiempos Headline, weight 300, color `#000000`
- UI / body: Basier Circle (lub Inter jako alternatywa), weight 400
- Zmniejszyć H1 do ok. 32–36px na mobile (desktop: 48px)

### Inputy mobilne
- Styl underline-only (tylko border-bottom)
- `borderBottomWidth: 1`, `borderBottomColor: #EEEEEE`, `borderRadius: 0`
- Focus state: `borderBottomColor: #036D51`

### Nawigacja mobilna
- Bottom tab bar lub hamburger drawer z białym tłem
- Aktywna tab: kolor `#036D51`
- Ikony: outline SVG, 24px
