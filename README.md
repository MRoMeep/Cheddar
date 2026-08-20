#  CHEDDAR

<p align="center">
  <strong>Inteligenty program do nauki i doskonalenia szybkiego pisania na klawiaturze z wartościowymi ciekawostkami ze świata.</strong><br>
  <em>An intelligent typing speed trainer powered by fascinating real-world trivia, ergonomics, and smart analytics.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-PL%20%7C%20EN%20%7C%20DE%20%7C%20FR%20%7C%20SV%20%7C%20RU-F39C12?style=for-the-badge" alt="Languages">
  <img src="https://img.shields.io/badge/Keyboards-Alice%2098%20%7C%20ANSI%20%7C%20Ortho-D35400?style=for-the-badge" alt="Keyboards">
  <img src="https://img.shields.io/badge/VIA%20%2F%20QMK-USB%20Auto--Detect-2ecc71?style=for-the-badge" alt="VIA Detection">
  <img src="https://img.shields.io/badge/Themes-10%20Curated%20Styles-38bdf8?style=for-the-badge" alt="10 Themes">
  <img src="https://img.shields.io/badge/License-MIT-8B4513?style=for-the-badge" alt="MIT License">
</p>

---

##  O projekcie / About

**Cheddar** to nowoczesna, responsywna aplikacja desktopowa i webowa stworzona, aby nauka szybkiego pisania była nie tylko efektywna, ale i rozwijająca. Zamiast pisać losowe, wyrwane z kontekstu ciągi słów, przepisujesz **fascynujące, zweryfikowane fakty i ciekawostki** z dziedziny natury, nauki, kosmosu, historii, ludzkiego ciała oraz języka.

Program posiada zaawansowany **Inteligentny Trener Błędów**, wizualną klawiaturę z obsługą układów ergonomicznych (**Alice**, **Kolumnowa Ortho**, **ANSI**) oraz autodetekcję klawiatur przez USB (WebHID VIA/QMK).

---

##  Główne Funkcje / Key Features

###  1. Wartościowe Ciekawostki zamiast Losowych Słów
* Ponad **140 ciekawostek po polsku** oraz setki w innych językach, podzielonych na kategorie tematyczne:
  *  **Natura & Zwierzęta**
  *  **Nauka & Kosmos**
  *  **Ciało & Zdrowie**
  *  **Historia & Świat**
  *  **Język & Trudne Słowa**
* **Filtrowanie wielokrotne**: Możliwość ćwiczenia tylko wybranych dziedzin wiedzy.

### ⌨️ 2. Wirtualna Klawiatura i Układy Ergonomiczne
* **3 geometrie klawiatury**:
  * **Ergonomiczna Alice**: Dzielony układ pod naturalnym kątem dla dłoni, F-rząd i dzielona spacja.
  * **Standardowa ANSI**: Klasyczny prosty układ rzędowy.
  * **Kolumnowa (Ortholinear)**: Proste, pionowe kolumny klawiszy.
* **Podpowiedzi klawiszy w locie**: Podświetlanie kolejnego wymaganego znaku, klawisza `Shift` oraz `AltGr`.
* **Mapowanie alfabetów obcych**: Przy języku rosyjskim (cyrylica) program wyświetla fizyczne litery QWERTY jako podpowiedź, gdzie na klawiaturze znajduje się dany znak.
* **Autodetekcja USB (VIA / QMK)**: Automatyczne wykrywanie podłączonej klawiatury przez WebHID.

###  3. Inteligentny Trener Błędów (Smart Weakness Engine)
* Aplikacja w czasie rzeczywistym analizuje litery i przejścia (bigramy), przy których popełniasz pomyłki.
* Algorytm priorytetyzuje i podsuwa zdania zawierające Twoje najsłabsze kombinacje klawiszy, aby skutecznie eliminować błędy.

###  4. Wskaźnik Passy (STREAK Flame)
* Specjalny wskaźnik ognika, który zapala się i pulsuje przy bezbłędnym przepisywaniu kolejnych zdań.

###  5. 10 Dopracowanych Motywów Kolorystycznych
* **Cheddar Classic** — Ciepły, złocisto-serowy motyw z głębokim brązem.
* **Roquefort Night** — Nocny, ciemny grafit ze szmaragdowym akcentem.
* **Gouda Cream** — Delikatne, kremowe latte i ciepły karmel.
* **Swiss Pine** — Alpejska, ciemna sosna z bursztynem.
* **Vintage Paper** — Pergamin maszyny do pisania z atramentowym granatem.
* **Nordic Aurora** — Nocny fiord, arktyczny błękit i zorza polarna.
* **Matcha Garden** — Spokojna zieleń japońskiej herbaty matcha i bambus.
* **Sunset Lavender** — Zmierzchowy fiolet i koralowy zachód słońca.
* **Cyber Neon** — Głęboki synthwave z neonowym błękitem i fuksją.
* **Espresso Mocha** — Palona kawa, aksamitna mocha i cynamon.

###  6. Pełna Wielojęzyczność (UI & Sentences)
* Interfejs oraz teksty w **6 językach**: Polski, English, Deutsch, Français, Svenska, Русский.
* Możliwość automatycznego dopasowania języka interfejsu do ćwiczonego języka lub wyboru na stałe.

---

##  Skróty Klawiszowe / Keyboard Shortcuts

| Skrót | Działanie |
|---|---|
| <kbd>ESC</kbd> | Zakończenie sesji i wyświetlenie podsumowania (lub reset) |
| <kbd>Enter ↵</kbd> | Następne zdanie (na ekranie wyników) |
| <kbd>Tab ↹</kbd> | Powtórzenie bieżącego zdania (na ekranie wyników) |

---

##  Uruchamianie / Getting Started

### Wersja Wykonywalna (Standalone EXE)
Pobierz i uruchom plik `Cheddar.exe` z katalogu `dist/` — nie wymaga instalacji Pythona ani żadnych bibliotek!

### Uruchamianie ze Źródeł (Python)
Wymagany Python 3.9+.

```bash
# 1. Klonowanie repozytorium
git clone https://github.com/MRoMeep/WritingProgram.git
cd WritingProgram

# 2. Instalacja zależności
pip install pywebview

# 3. Uruchomienie aplikacji
python main.py
```

### Budowanie pliku EXE (PyInstaller)
Aby samodzielnie wyeksportować aplikację do pojedynczego pliku wykonywalnego:

```bash
pip install pyinstaller pywebview
python -m PyInstaller --noconfirm --onefile --windowed --icon=logo.ico --add-data "index.html;." --add-data "style.css;." --add-data "script.js;." --add-data "data.json;." --add-data "logo.ico;." --add-data "MRMeepe.png;." --name Cheddar main.py
```
Gotowy plik `Cheddar.exe` pojawi się w folderze `dist/`.

---

##  Licencja / License

Projekt udostępniany jest na warunkach licencji [MIT](LICENSE).
Created with passion by **MRoMeep**.
