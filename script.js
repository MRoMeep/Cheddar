/**
 * CHEDDAR - Intelligent Typing & Fact Learning
 * Features:
 * - Full Multilingual UI Localization (PL, EN, DE, FR, SV, RU)
 * - Micro-interactions: Gear rotation on hover, Letter hover pop/lift animation
 * - Smooth transition for Virtual Keyboard
 * - Smart Weakness Engine (Bigram & transition error tracking)
 * - Category Multi-Select Filtering
 * - Real-time Visual Keyboard with Layout Hinting (Russian Cyrillic, Polish diacritics, German, French, Swedish)
 * - 3 Keyboard Geometries: Ergonomic Alice Split, Standard ANSI, Columnar Ortho
 * - WebHID VIA / QMK Auto-Detection
 * - Modern Results Screen & Global Shortcuts
 * - Records, Statistics & Persistence (localStorage)
 */

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const textContent = document.getElementById('TextContent');
const progressBar = document.getElementById('ProgressBar');
const userInput = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');
const hudWpm = document.getElementById('hudWpm');
const hudStreak = document.getElementById('hudStreak');
const langSelect = document.getElementById('langSelect');
const modeSelect = document.getElementById('modeSelect');
const categoriesBar = document.getElementById('categoriesBar');

// Visual Keyboard Elements
const kbToggleBtn = document.getElementById('kbToggleBtn');
const visualKeyboardContainer = document.getElementById('visualKeyboardContainer');
const visualKeyboard = document.getElementById('visualKeyboard');
const kbEnableToggle = document.getElementById('kbEnableToggle');
const btnDetectVia = document.getElementById('btnDetectVia');
const viaStatusMsg = document.getElementById('viaStatusMsg');

// Modals
const resultsModal = document.getElementById('resultsModal');
const settingsModal = document.getElementById('settingsModal');
const helpModal = document.getElementById('helpModal');

const settingsBtn = document.getElementById('settingsBtn');
const helpBtn = document.getElementById('helpBtn');
const closeModal = document.getElementById('closeModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const closeResultsModal = document.getElementById('closeResultsModal');

const btnNextSentence = document.getElementById('btnNextSentence');
const btnRepeatSentence = document.getElementById('btnRepeatSentence');

// Results Modal Elements
const resWpm = document.getElementById('resWpm');
const resCpm = document.getElementById('resCpm');
const resAccuracy = document.getElementById('resAccuracy');
const resErrors = document.getElementById('resErrors');
const resTime = document.getElementById('resTime');
const resChars = document.getElementById('resChars');
const roundWeaknessInfo = document.getElementById('roundWeaknessInfo');
const roundWeaknessText = document.getElementById('roundWeaknessText');

// Records & Settings Elements
const recBestWpm = document.getElementById('recBestWpm');
const recBestCpm = document.getElementById('recBestCpm');
const recAvgAcc = document.getElementById('recAvgAcc');
const recCompleted = document.getElementById('recCompleted');
const trainerToggle = document.getElementById('trainerToggle');
const weaknessChips = document.getElementById('weaknessChips');
const btnResetWeakness = document.getElementById('btnResetWeakness');
const btnResetAllStats = document.getElementById('btnResetAllStats');
const uiLangSelect = document.getElementById('uiLangSelect');

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let allData = {};
let currentLanguage = 'polish';
let uiLanguageSetting = 'auto'; // 'auto' or 'polish', 'english', 'german', 'french', 'swedish', 'russian'
let currentMode = 'endless'; // 'endless' or 'single'
let selectedCategories = new Set(['all', 'nature', 'science', 'human', 'history', 'language']);
let currentSentenceObj = null;
let previousSentenceText = "";

let keyboardGeometry = 'alice'; // 'alice', 'standard', 'ortho'
let isKeyboardEnabled = true;

let startTime = null;
let timerInterval = null;
let totalKeystrokes = 0;
let errorsMade = 0;
let previousInputLength = 0;
let perfectStreak = 0;
let currentSentenceErrors = 0;
let roundMistakes = new Set();

// ==========================================================================
// 1. UI LOCALIZATION DICTIONARY (ALL 6 LANGUAGES)
// ==========================================================================
const UI_TRANSLATIONS = {
    polish: {
        lblLangSelect: "Język:",
        lblModeSelect: "Tryb:",
        modeEndless: "Endless (Ciągły)",
        modeSingle: "Single (Pojedynczy)",
        kbToggleTitle: "Włącz/Wyłącz klawiaturę ekranową",
        settingsBtnTitle: "Ustawienia, Rekordy i Klawiatura",
        catAll: "Wszystkie",
        catNature: "Natura",
        catScience: "Nauka & Kosmos",
        catHuman: "Ciało & Zdrowie",
        catHistory: "Historia & Świat",
        catLanguage: "Język & Trudne",
        hudWpm: "WPM:",
        hudTimer: "CZAS:",
        hudStreak: "STREAK:",
        placeholder: "Naciśnij ESC aby zakończyć / zrestartować",
        resHeading: "Podsumowanie Sesji",
        resTitleWpm: "WPM",
        resSubWpm: "słów/min",
        resTitleCpm: "CPM",
        resSubCpm: "znaków/min",
        resTitleAcc: "DOKŁADNOŚĆ",
        resErrors: (n) => `${n} ${n === 1 ? 'błąd' : (n >= 2 && n <= 4 ? 'błędy' : 'błędów')}`,
        resTitleTime: "CZAS",
        resChars: (n) => `${n} znaków`,
        roundWeaknessDefault: "Trener odnotował trudniejsze momenty.",
        roundWeaknessDetected: (list) => `Wykryto trudniejsze momenty: ${list}. Trener uwzględni je w kolejnych zdaniach.`,
        btnNext: "Następne zdanie",
        btnRepeat: "Powtórz to zdanie",
        settingsTitle: "Ustawienia & Rekordy",
        tabRecords: "Rekordy & Trener",
        tabKeyboard: "Klawiatura & VIA",
        tabThemes: "Motywy & Język",
        lblRecBestWpm: "Najlepszy WPM",
        lblRecBestCpm: "Najlepszy CPM",
        lblRecAvgAcc: "Średnia Dokładność",
        lblRecCompleted: "Ukończone Zdania",
        trainerTitle: "Inteligentny Trener Błędów",
        trainerDesc: "Automatycznie dobiera zdania zawierające Twoje trudne kombinacje liter.",
        weaknessTitle: "Twoje najczęstsze pomyłki:",
        noWeakness: "Brak zarejestrowanych słabych punktów. Pisz dalej!",
        btnResetWeakness: "Resetuj dane Trenera",
        btnResetAllStats: "Wyczyść wszystkie statystyki",
        kbShowTitle: "Pokaż wirtualną klawiaturę",
        kbShowDesc: "Wyświetla podpowiedzi klawiszy w czasie rzeczywistym.",
        kbGeomTitle: "Kształt / Układ fizyczny klawiatury:",
        geomAliceTitle: "Ergonomiczna Alice",
        geomAliceDesc: "Dzielona, klawisze pod kątem dla dłoni",
        geomStandardTitle: "Standardowa ANSI",
        geomStandardDesc: "Klasyczny prosty układ rzędów",
        geomOrthoTitle: "Kolumnowa (Ortho)",
        geomOrthoDesc: "Pionowe proste kolumny",
        viaTitle: "Autodetekcja USB (VIA / QMK)",
        viaDesc: "Podłącz klawiaturę przez USB, a aplikacja automatycznie rozpozna model i dopasuje geometrię.",
        btnDetectVia: "Wykryj przez USB",
        uiLangTitle: "Język interfejsu (UI)",
        uiLangDesc: "Wybierz język menu i opisów.",
        uiLangAuto: "Auto (Dopasuj do ćwiczenia)",
        themeTitle: "Motyw kolorystyczny:",
        fontSizeTitle: "Rozmiar tekstu:",
        btnFontNormal: "Standardowy (2rem)",
        btnFontLarge: "Duży (2.4rem)",
        helpTitle: "Jak korzystać z CHEDDAR",
        helpItems: [
            "<strong>Wartościowe ciekawostki:</strong> Pisz prawdziwe fakty ze świata zamiast losowych słów.",
            "<strong>Klawiatura ekranowa:</strong> Podświetla aktualnie wymagany klawisz, a przy obcych alfabetach (np. rosyjskim) pokazuje fizyczny odpowiednik QWERTY.",
            "<strong>Układ Alice & Ortho:</strong> W ustawieniach możesz dopasować kształt klawiatury do ergonomicznej <em>Alice</em> lub wykryć ją automatycznie przez USB (VIA).",
            "<strong>Tryby pisania:</strong> W trybie <em>Endless</em> piszesz ciągle bez przerw, a w <em>Single</em> po każdym zdaniu widzisz wynik.",
            "<strong>Inteligentny Trener Błędów:</strong> Aplikacja uczy się Twoich błędów i priorytetowo podsuwa zdania z trudnymi dla Ciebie znakami.",
            "<strong>Skróty klawiszowe:</strong> Naciśnij <kbd>ESC</kbd>, aby zobaczyć podsumowanie sesji. Na ekranie wyników <kbd>Enter</kbd> daje nowe zdanie, a <kbd>Tab</kbd> powtarza obecne."
        ]
    },
    english: {
        lblLangSelect: "Language:",
        lblModeSelect: "Mode:",
        modeEndless: "Endless (Continuous)",
        modeSingle: "Single (Sentence by sentence)",
        kbToggleTitle: "Toggle on-screen keyboard",
        settingsBtnTitle: "Settings, Records & Keyboard",
        catAll: "All",
        catNature: "Nature",
        catScience: "Science & Space",
        catHuman: "Body & Health",
        catHistory: "History & World",
        catLanguage: "Language & Typing",
        hudWpm: "WPM:",
        hudTimer: "TIME:",
        hudStreak: "STREAK:",
        placeholder: "Press ESC to finish / restart",
        resHeading: "Session Summary",
        resTitleWpm: "WPM",
        resSubWpm: "words/min",
        resTitleCpm: "CPM",
        resSubCpm: "chars/min",
        resTitleAcc: "ACCURACY",
        resErrors: (n) => `${n} ${n === 1 ? 'error' : 'errors'}`,
        resTitleTime: "TIME",
        resChars: (n) => `${n} characters`,
        roundWeaknessDefault: "Trainer recorded challenging keystrokes.",
        roundWeaknessDetected: (list) => `Challenging transitions detected: ${list}. Trainer will prioritize them in future sentences.`,
        btnNext: "Next sentence",
        btnRepeat: "Repeat this sentence",
        settingsTitle: "Settings & Records",
        tabRecords: "Records & Trainer",
        tabKeyboard: "Keyboard & VIA",
        tabThemes: "Themes & Language",
        lblRecBestWpm: "Best WPM",
        lblRecBestCpm: "Best CPM",
        lblRecAvgAcc: "Average Accuracy",
        lblRecCompleted: "Completed Sentences",
        trainerTitle: "Smart Weakness Engine",
        trainerDesc: "Automatically serves sentences featuring your difficult letter combinations.",
        weaknessTitle: "Your most frequent mistakes:",
        noWeakness: "No weaknesses registered yet. Keep typing!",
        btnResetWeakness: "Reset Trainer Data",
        btnResetAllStats: "Clear All Statistics",
        kbShowTitle: "Show Virtual Keyboard",
        kbShowDesc: "Displays real-time key hints and visual feedback.",
        kbGeomTitle: "Keyboard Form Factor / Geometry:",
        geomAliceTitle: "Ergonomic Alice",
        geomAliceDesc: "Split angled layout for natural hand position",
        geomStandardTitle: "Standard ANSI",
        geomStandardDesc: "Classic straight row layout",
        geomOrthoTitle: "Columnar (Ortho)",
        geomOrthoDesc: "Straight vertical columns",
        viaTitle: "USB Auto-Detection (VIA / QMK)",
        viaDesc: "Connect your keyboard via USB to automatically detect its layout and geometry.",
        btnDetectVia: "Detect via USB",
        uiLangTitle: "Interface Language (UI)",
        uiLangDesc: "Choose interface menu and help language.",
        uiLangAuto: "Auto (Match exercise)",
        themeTitle: "Color Theme:",
        fontSizeTitle: "Font Size:",
        btnFontNormal: "Standard (2rem)",
        btnFontLarge: "Large (2.4rem)",
        helpTitle: "How to use CHEDDAR",
        helpItems: [
            "<strong>Fascinating Facts:</strong> Type engaging real-world trivia instead of meaningless random words.",
            "<strong>Visual Keyboard:</strong> Highlights required keys in real-time and shows physical QWERTY hints for foreign alphabets (e.g. Russian).",
            "<strong>Alice & Ortho Layouts:</strong> Adjust keyboard geometry to your ergonomic <em>Alice</em> split or detect it via USB (VIA).",
            "<strong>Typing Modes:</strong> <em>Endless</em> mode for continuous typing, or <em>Single</em> mode for sentence-by-sentence evaluation.",
            "<strong>Smart Weakness Engine:</strong> Learns your mistyped transitions and adapts future sentences to improve your accuracy.",
            "<strong>Shortcuts:</strong> Press <kbd>ESC</kbd> to view session results. On results screen press <kbd>Enter</kbd> for next fact or <kbd>Tab</kbd> to retry."
        ]
    },
    german: {
        lblLangSelect: "Sprache:",
        lblModeSelect: "Modus:",
        modeEndless: "Endless (Fortlaufend)",
        modeSingle: "Single (Satz für Satz)",
        kbToggleTitle: "Bildschirmtastatur ein-/ausschalten",
        settingsBtnTitle: "Einstellungen, Rekorde & Tastatur",
        catAll: "Alle",
        catNature: "Natur",
        catScience: "Wissenschaft & Raum",
        catHuman: "Körper & Gesundheit",
        catHistory: "Geschichte & Welt",
        catLanguage: "Sprache & Tippen",
        hudWpm: "WPM:",
        hudTimer: "ZEIT:",
        hudStreak: "SERIE:",
        placeholder: "Drücke ESC zum Beenden / Neustarten",
        resHeading: "Sitzungsübersicht",
        resTitleWpm: "WPM",
        resSubWpm: "Wörter/Min",
        resTitleCpm: "CPM",
        resSubCpm: "Zeichen/Min",
        resTitleAcc: "GENAUIGKEIT",
        resErrors: (n) => `${n} ${n === 1 ? 'Fehler' : 'Fehler'}`,
        resTitleTime: "ZEIT",
        resChars: (n) => `${n} Zeichen`,
        roundWeaknessDefault: "Trainer hat schwierige Tastenanschläge erfasst.",
        roundWeaknessDetected: (list) => `Schwierige Übergänge erkannt: ${list}. Der Trainer wird diese priorisieren.`,
        btnNext: "Nächster Satz",
        btnRepeat: "Satz wiederholen",
        settingsTitle: "Einstellungen & Rekorde",
        tabRecords: "Rekorde & Trainer",
        tabKeyboard: "Tastatur & VIA",
        tabThemes: "Motive & Sprache",
        lblRecBestWpm: "Beste WPM",
        lblRecBestCpm: "Beste CPM",
        lblRecAvgAcc: "Durchschn. Genauigkeit",
        lblRecCompleted: "Abgeschlossene Sätze",
        trainerTitle: "Intelligenter Fehlertrainer",
        trainerDesc: "Wählt automatisch Sätze mit deinen schwierigen Buchstabenkombinationen.",
        weaknessTitle: "Häufigste Fehler:",
        noWeakness: "Noch keine Schwachstellen erfasst. Tippe weiter!",
        btnResetWeakness: "Trainerdaten zurücksetzen",
        btnResetAllStats: "Alle Statistiken löschen",
        kbShowTitle: "Virtuelle Tastatur anzeigen",
        kbShowDesc: "Zeigt Tastatur-Tipps in Echtzeit an.",
        kbGeomTitle: "Tastatur-Geometrie:",
        geomAliceTitle: "Ergonomische Alice",
        geomAliceDesc: "Geteiltes, abgewinkeltes Layout",
        geomStandardTitle: "Standard ANSI",
        geomStandardDesc: "Klassisches gerades Layout",
        geomOrthoTitle: "Spaltenförmig (Ortho)",
        geomOrthoDesc: "Vertikale Tastenreihen",
        viaTitle: "USB-Autodetection (VIA / QMK)",
        viaDesc: "Schließe deine Tastatur über USB an, um das Modell automatisch zu erkennen.",
        btnDetectVia: "Über USB erkennen",
        uiLangTitle: "Oberflächensprache (UI)",
        uiLangDesc: "Wähle die Sprache der Menüs und Hilfetexte.",
        uiLangAuto: "Auto (An Übung anpassen)",
        themeTitle: "Farbthema:",
        fontSizeTitle: "Schriftgröße:",
        btnFontNormal: "Standard (2rem)",
        btnFontLarge: "Groß (2.4rem)",
        helpTitle: "Wie man CHEDDAR benutzt",
        helpItems: [
            "<strong>Wissenswerte Fakten:</strong> Tippe echte Fakten aus aller Welt statt sinnloser Zufallswörter.",
            "<strong>Bildschirmtastatur:</strong> Hebt erforderliche Tasten in Echtzeit hervor und zeigt QWERTY-Hinweise für fremde Alphabete.",
            "<strong>Alice- & Ortho-Layouts:</strong> Passe die Tastaturgeometrie an deine ergonomische <em>Alice</em> an oder erkenne sie via USB.",
            "<strong>Tippmodi:</strong> <em>Endless</em> für kontinuierliches Tippen oder <em>Single</em> für Auswertung nach jedem Satz.",
            "<strong>Intelligenter Fehlertrainer:</strong> Lernt deine Tippfehler und passt künftige Sätze gezielt an.",
            "<strong>Tastaturkürzel:</strong> Drücke <kbd>ESC</kbd> für Ergebnisse. Im Ergebnisbildschirm: <kbd>Enter</kbd> für nächsten Satz, <kbd>Tab</kbd> zum Wiederholen."
        ]
    },
    french: {
        lblLangSelect: "Langue :",
        lblModeSelect: "Mode :",
        modeEndless: "Endless (Continu)",
        modeSingle: "Single (Phrase par phrase)",
        kbToggleTitle: "Activer/désactiver le clavier visuel",
        settingsBtnTitle: "Paramètres, Records & Clavier",
        catAll: "Tout",
        catNature: "Nature",
        catScience: "Science & Espace",
        catHuman: "Corps & Santé",
        catHistory: "Histoire & Monde",
        catLanguage: "Langue & Frappe",
        hudWpm: "MPM :",
        hudTimer: "TEMPS :",
        hudStreak: "SÉRIE :",
        placeholder: "Appuyez sur Échap pour terminer / redémarrer",
        resHeading: "Résumé de la session",
        resTitleWpm: "MPM",
        resSubWpm: "mots/min",
        resTitleCpm: "CPM",
        resSubCpm: "caractères/min",
        resTitleAcc: "PRÉCISION",
        resErrors: (n) => `${n} ${n === 1 ? 'erreur' : 'erreurs'}`,
        resTitleTime: "TEMPS",
        resChars: (n) => `${n} caractères`,
        roundWeaknessDefault: "L'entraîneur a enregistré des moments difficiles.",
        roundWeaknessDetected: (list) => `Transitions difficiles détectées : ${list}. L'entraîneur les ciblera en priorité.`,
        btnNext: "Phrase suivante",
        btnRepeat: "Répéter cette phrase",
        settingsTitle: "Paramètres & Records",
        tabRecords: "Records & Entraîneur",
        tabKeyboard: "Clavier & VIA",
        tabThemes: "Thèmes & Langue",
        lblRecBestWpm: "Meilleur MPM",
        lblRecBestCpm: "Meilleur CPM",
        lblRecAvgAcc: "Précision moyenne",
        lblRecCompleted: "Phrases terminées",
        trainerTitle: "Entraîneur Intelligent d'Erreurs",
        trainerDesc: "Sélectionne automatiquement des phrases contenant vos combinaisons de lettres difficiles.",
        weaknessTitle: "Vos erreurs les plus fréquentes :",
        noWeakness: "Aucun point faible enregistré. Continuez à taper !",
        btnResetWeakness: "Réinitialiser l'entraîneur",
        btnResetAllStats: "Effacer toutes les statistiques",
        kbShowTitle: "Afficher le clavier virtuel",
        kbShowDesc: "Affiche des indications de touches en temps réel.",
        kbGeomTitle: "Disposition physique du clavier :",
        geomAliceTitle: "Alice Ergonomique",
        geomAliceDesc: "Disposition scindée et inclinée pour les mains",
        geomStandardTitle: "Standard ANSI",
        geomStandardDesc: "Disposition droite classique",
        geomOrthoTitle: "Ortholineaire (Ortho)",
        geomOrthoDesc: "Colonnes verticales droites",
        viaTitle: "Détection USB (VIA / QMK)",
        viaDesc: "Connectez votre clavier par USB pour détecter automatiquement son modèle.",
        btnDetectVia: "Détecter via USB",
        uiLangTitle: "Langue de l'interface (UI)",
        uiLangDesc: "Choisissez la langue des menus et de l'aide.",
        uiLangAuto: "Auto (Adapter à l'exercice)",
        themeTitle: "Thème de couleur :",
        fontSizeTitle: "Taille du texte :",
        btnFontNormal: "Standard (2rem)",
        btnFontLarge: "Grand (2.4rem)",
        helpTitle: "Comment utiliser CHEDDAR",
        helpItems: [
            "<strong>Faits captivants :</strong> Tapez de vraies anecdotes du monde entier au lieu de mots aléatoires.",
            "<strong>Clavier virtuel :</strong> Met en surbrillance les touches en temps réel avec indices QWERTY pour les alphabets étrangers.",
            "<strong>Dispositions Alice & Ortho :</strong> Ajustez la géométrie à votre clavier ergonomique <em>Alice</em> ou détectez-le via USB.",
            "<strong>Modes de frappe :</strong> Mode <em>Endless</em> pour taper en continu ou <em>Single</em> pour évaluer chaque phrase.",
            "<strong>Entraîneur Intelligent :</strong> Apprend de vos erreurs et cible vos faiblesses dans les phrases suivantes.",
            "<strong>Raccourcis :</strong> Appuyez sur <kbd>Échap</kbd> pour afficher les résultats. Dans l'écran de résultats : <kbd>Entrée</kbd> pour continuer, <kbd>Tab</kbd> pour réessayer."
        ]
    },
    swedish: {
        lblLangSelect: "Språk:",
        lblModeSelect: "Läge:",
        modeEndless: "Endless (Kontinuerligt)",
        modeSingle: "Single (Mening för mening)",
        kbToggleTitle: "Slå på/av skärmtangentbord",
        settingsBtnTitle: "Inställningar, Rekord & Tangentbord",
        catAll: "Alla",
        catNature: "Natur",
        catScience: "Vetenskap & Rymd",
        catHuman: "Kropp & Hälsa",
        catHistory: "Historia & Värld",
        catLanguage: "Språk & Skrivande",
        hudWpm: "WPM:",
        hudTimer: "TID:",
        hudStreak: "SVIT:",
        placeholder: "Tryck på ESC för att avsluta / starta om",
        resHeading: "Sessionssammanfattning",
        resTitleWpm: "WPM",
        resSubWpm: "ord/min",
        resTitleCpm: "CPM",
        resSubCpm: "tecken/min",
        resTitleAcc: "NOGGRANNHET",
        resErrors: (n) => `${n} ${n === 1 ? 'fel' : 'fel'}`,
        resTitleTime: "TID",
        resChars: (n) => `${n} tecken`,
        roundWeaknessDefault: "Tränaren registrerade svårare tangentkombinationer.",
        roundWeaknessDetected: (list) => `Svåra övergångar upptäckta: ${list}. Tränaren kommer att prioritera dem.`,
        btnNext: "Nästa mening",
        btnRepeat: "Upprepa denna mening",
        settingsTitle: "Inställningar & Rekord",
        tabRecords: "Rekord & Tränare",
        tabKeyboard: "Tangentbord & VIA",
        tabThemes: "Teman & Språk",
        lblRecBestWpm: "Bästa WPM",
        lblRecBestCpm: "Bästa CPM",
        lblRecAvgAcc: "Genomsnittlig noggrannhet",
        lblRecCompleted: "Slutförda meningar",
        trainerTitle: "Intelligent Feltränare",
        trainerDesc: "Väljer automatiskt meningar med dina svåra bokstavskombinationer.",
        weaknessTitle: "Dina vanligaste misstag:",
        noWeakness: "Inga svagheter registrerade än. Fortsätt skriva!",
        btnResetWeakness: "Återställ tränardata",
        btnResetAllStats: "Rensa all statistik",
        kbShowTitle: "Visa virtuellt tangentbord",
        kbShowDesc: "Visar tangenttips i realtid.",
        kbGeomTitle: "Tangentbordslayout / Form:",
        geomAliceTitle: "Ergonomisk Alice",
        geomAliceDesc: "Delad vinklad layout för händerna",
        geomStandardTitle: "Standard ANSI",
        geomStandardDesc: "Klassisk rak radlayout",
        geomOrthoTitle: "Kolumnär (Ortho)",
        geomOrthoDesc: "Raka vertikala kolumner",
        viaTitle: "USB-autodetektering (VIA / QMK)",
        viaDesc: "Anslut ditt tangentbord via USB för att automatiskt identifiera modellen.",
        btnDetectVia: "Identifiera via USB",
        uiLangTitle: "Gränssnittsspråk (UI)",
        uiLangDesc: "Välj språk för menyer och hjälp.",
        uiLangAuto: "Auto (Anpassa till övning)",
        themeTitle: "Färgtema:",
        fontSizeTitle: "Textstorlek:",
        btnFontNormal: "Standard (2rem)",
        btnFontLarge: "Stor (2.4rem)",
        helpTitle: "Hur man använder CHEDDAR",
        helpItems: [
            "<strong>Fakta & Kunskap:</strong> Skriv intressanta fakta istället för slumpmässiga ord.",
            "<strong>Skärmtangentbord:</strong> Lyser upp rätt tangent i realtid och ger QWERTY-tips för främmande alfabet.",
            "<strong>Alice- & Ortho-layouter:</strong> Anpassa tangentbordsformen till din ergonomiska <em>Alice</em> eller anslut via USB.",
            "<strong>Skrivlägen:</strong> <em>Endless</em> för kontinuerligt skrivande eller <em>Single</em> för utvärdering mening för mening.",
            "<strong>Intelligent Feltränare:</strong> Lär sig av dina misstag och anpassar kommande meningar därefter.",
            "<strong>Kortkommandon:</strong> Tryck på <kbd>ESC</kbd> för resultat. På resultatskärmen: <kbd>Enter</kbd> för nästa mening, <kbd>Tab</kbd> för att försöka igen."
        ]
    },
    russian: {
        lblLangSelect: "Язык:",
        lblModeSelect: "Режим:",
        modeEndless: "Endless (Непрерывный)",
        modeSingle: "Single (По предложениям)",
        kbToggleTitle: "Вкл/Выкл экранную клавиатуру",
        settingsBtnTitle: "Настройки, Рекорды и Клавиатура",
        catAll: "Все",
        catNature: "Природа",
        catScience: "Наука и Космос",
        catHuman: "Тело и Здоровье",
        catHistory: "История и Мир",
        catLanguage: "Язык и Слова",
        hudWpm: "WPM:",
        hudTimer: "ВРЕМЯ:",
        hudStreak: "СЕРИЯ:",
        placeholder: "Нажмите ESC для завершения / перезапуска",
        resHeading: "Итоги сессии",
        resTitleWpm: "WPM",
        resSubWpm: "слов/мин",
        resTitleCpm: "CPM",
        resSubCpm: "знаков/мин",
        resTitleAcc: "ТОЧНОСТЬ",
        resErrors: (n) => `${n} ${n === 1 ? 'ошибка' : (n >= 2 && n <= 4 ? 'ошибки' : 'ошибок')}`,
        resTitleTime: "ВРЕМЯ",
        resChars: (n) => `${n} знаков`,
        roundWeaknessDefault: "Тренер зафиксировал трудные комбинации клавиш.",
        roundWeaknessDetected: (list) => `Обнаружены сложные моменты: ${list}. Тренер учтет их в следующих предложениях.`,
        btnNext: "Следующее предложение",
        btnRepeat: "Повторить предложение",
        settingsTitle: "Настройки и Рекорды",
        tabRecords: "Рекорды и Тренер",
        tabKeyboard: "Клавиатура и VIA",
        tabThemes: "Темы и Язык",
        lblRecBestWpm: "Лучший WPM",
        lblRecBestCpm: "Лучший CPM",
        lblRecAvgAcc: "Средняя точность",
        lblRecCompleted: "Завершено предложений",
        trainerTitle: "Интеллектуальный Тренер Ошибок",
        trainerDesc: "Автоматически подбирает предложения с вашими сложными сочетаниями букв.",
        weaknessTitle: "Ваши частые ошибки:",
        noWeakness: "Ошибок пока не зафиксировано. Продолжайте печатать!",
        btnResetWeakness: "Сбросить данные Тренера",
        btnResetAllStats: "Очистить всю статистику",
        kbShowTitle: "Показать виртуальную клавиатуру",
        kbShowDesc: "Отображает подсказки нужных клавиш в реальном времени.",
        kbGeomTitle: "Форма / Раскладка клавиатуры:",
        geomAliceTitle: "Эргономичная Alice",
        geomAliceDesc: "Раздельная раскладка под углом для кистей рук",
        geomStandardTitle: "Стандартная ANSI",
        geomStandardDesc: "Классические прямые ряды",
        geomOrthoTitle: "Ортолинейная (Ortho)",
        geomOrthoDesc: "Прямые вертикальные колонки",
        viaTitle: "Автоопределение по USB (VIA / QMK)",
        viaDesc: "Подключите клавиатуру по USB, и приложение автоматически распознает геометрию.",
        btnDetectVia: "Определить по USB",
        uiLangTitle: "Язык интерфейса (UI)",
        uiLangDesc: "Выберите язык меню и справочной информации.",
        uiLangAuto: "Авто (По языку упражнения)",
        themeTitle: "Цветовая тема:",
        fontSizeTitle: "Размер текста:",
        btnFontNormal: "Стандартный (2rem)",
        btnFontLarge: "Большой (2.4rem)",
        helpTitle: "Как пользоваться CHEDDAR",
        helpItems: [
            "<strong>Познавательные факты:</strong> Печатайте интересные факты со всего мира вместо бессмысленных наборов слов.",
            "<strong>Экранная клавиатура:</strong> Подсвечивает нужные клавиши в реальном времени и показывает QWERTY-подсказки для незнакомых раскладок.",
            "<strong>Раскладки Alice и Ortho:</strong> Настройте форму клавиатуры под эргономичную <em>Alice</em> или определите её через USB (VIA).",
            "<strong>Режимы печати:</strong> Режим <em>Endless</em> для непрерывной тренировки или <em>Single</em> с подведением итогов после каждого предложения.",
            "<strong>Интеллектуальный Тренер:</strong> Анализирует ваши ошибки и генерирует упражнения для тренировки слабых мест.",
            "<strong>Горячие клавиши:</strong> Нажмите <kbd>ESC</kbd> для подведения итогов. На экране результатов: <kbd>Enter</kbd> — следующее предложение, <kbd>Tab</kbd> — повторить текущее."
        ]
    }
};

function getActiveUiLanguage() {
    if (uiLanguageSetting === 'auto') {
        return currentLanguage;
    }
    return uiLanguageSetting;
}

function applyUiLocalization() {
    const lang = getActiveUiLanguage();
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.polish;

    // Header elements
    const lblLang = document.getElementById('lblLangSelect');
    if (lblLang) lblLang.innerText = t.lblLangSelect;

    const lblMode = document.getElementById('lblModeSelect');
    if (lblMode) lblMode.innerText = t.lblModeSelect;

    if (modeSelect) {
        modeSelect.options[0].text = t.modeEndless;
        modeSelect.options[1].text = t.modeSingle;
    }

    if (kbToggleBtn) kbToggleBtn.title = t.kbToggleTitle;
    if (settingsBtn) settingsBtn.title = t.settingsBtnTitle;

    // Categories
    const catLabelAll = document.getElementById('catLabelAll');
    if (catLabelAll) catLabelAll.innerText = t.catAll;
    const catLabelNature = document.getElementById('catLabelNature');
    if (catLabelNature) catLabelNature.innerText = t.catNature;
    const catLabelScience = document.getElementById('catLabelScience');
    if (catLabelScience) catLabelScience.innerText = t.catScience;
    const catLabelHuman = document.getElementById('catLabelHuman');
    if (catLabelHuman) catLabelHuman.innerText = t.catHuman;
    const catLabelHistory = document.getElementById('catLabelHistory');
    if (catLabelHistory) catLabelHistory.innerText = t.catHistory;
    const catLabelLanguage = document.getElementById('catLabelLanguage');
    if (catLabelLanguage) catLabelLanguage.innerText = t.catLanguage;

    // HUD labels
    const lblHudTimer = document.getElementById('lblHudTimer');
    if (lblHudTimer) lblHudTimer.innerText = t.hudTimer;
    const lblHudWpm = document.getElementById('lblHudWpm');
    if (lblHudWpm) lblHudWpm.innerText = t.hudWpm;
    const lblHudStreak = document.getElementById('lblHudStreak');
    if (lblHudStreak) lblHudStreak.innerText = t.hudStreak;

    // Input placeholder
    if (userInput) userInput.placeholder = t.placeholder;

    // Results modal
    const resultsHeading = document.getElementById('resultsHeading');
    if (resultsHeading) resultsHeading.innerText = t.resHeading;
    const resTitleWpm = document.getElementById('resTitleWpm');
    if (resTitleWpm) resTitleWpm.innerText = t.resTitleWpm;
    const resSubWpm = document.getElementById('resSubWpm');
    if (resSubWpm) resSubWpm.innerText = t.resSubWpm;
    const resTitleCpm = document.getElementById('resTitleCpm');
    if (resTitleCpm) resTitleCpm.innerText = t.resTitleCpm;
    const resSubCpm = document.getElementById('resSubCpm');
    if (resSubCpm) resSubCpm.innerText = t.resSubCpm;
    const resTitleAcc = document.getElementById('resTitleAcc');
    if (resTitleAcc) resTitleAcc.innerText = t.resTitleAcc;
    const resTitleTime = document.getElementById('resTitleTime');
    if (resTitleTime) resTitleTime.innerText = t.resTitleTime;
    const btnNextText = document.getElementById('btnNextText');
    if (btnNextText) btnNextText.innerText = t.btnNext;
    const btnRepeatText = document.getElementById('btnRepeatText');
    if (btnRepeatText) btnRepeatText.innerText = t.btnRepeat;

    // Settings Modal
    const settingsModalTitle = document.getElementById('settingsModalTitle');
    if (settingsModalTitle) settingsModalTitle.innerText = t.settingsTitle;
    const tabTitleRecords = document.getElementById('tabTitleRecords');
    if (tabTitleRecords) tabTitleRecords.innerText = t.tabRecords;
    const tabTitleKeyboard = document.getElementById('tabTitleKeyboard');
    if (tabTitleKeyboard) tabTitleKeyboard.innerText = t.tabKeyboard;
    const tabTitleThemes = document.getElementById('tabTitleThemes');
    if (tabTitleThemes) tabTitleThemes.innerText = t.tabThemes;

    const lblRecBestWpm = document.getElementById('lblRecBestWpm');
    if (lblRecBestWpm) lblRecBestWpm.innerText = t.lblRecBestWpm;
    const lblRecBestCpm = document.getElementById('lblRecBestCpm');
    if (lblRecBestCpm) lblRecBestCpm.innerText = t.lblRecBestCpm;
    const lblRecAvgAcc = document.getElementById('lblRecAvgAcc');
    if (lblRecAvgAcc) lblRecAvgAcc.innerText = t.lblRecAvgAcc;
    const lblRecCompleted = document.getElementById('lblRecCompleted');
    if (lblRecCompleted) lblRecCompleted.innerText = t.lblRecCompleted;

    const trainerHeaderTitle = document.getElementById('trainerHeaderTitle');
    if (trainerHeaderTitle) trainerHeaderTitle.innerText = t.trainerTitle;
    const trainerHeaderDesc = document.getElementById('trainerHeaderDesc');
    if (trainerHeaderDesc) trainerHeaderDesc.innerText = t.trainerDesc;
    const lblWeaknessTitle = document.getElementById('lblWeaknessTitle');
    if (lblWeaknessTitle) lblWeaknessTitle.innerText = t.weaknessTitle;
    const lblNoWeakness = document.getElementById('lblNoWeakness');
    if (lblNoWeakness) lblNoWeakness.innerText = t.noWeakness;
    if (btnResetWeakness) btnResetWeakness.innerText = t.btnResetWeakness;
    if (btnResetAllStats) btnResetAllStats.innerText = t.btnResetAllStats;

    const lblKbShowTitle = document.getElementById('lblKbShowTitle');
    if (lblKbShowTitle) lblKbShowTitle.innerText = t.kbShowTitle;
    const lblKbShowDesc = document.getElementById('lblKbShowDesc');
    if (lblKbShowDesc) lblKbShowDesc.innerText = t.kbShowDesc;
    const lblKbGeomTitle = document.getElementById('lblKbGeomTitle');
    if (lblKbGeomTitle) lblKbGeomTitle.innerText = t.kbGeomTitle;
    const lblGeomAliceTitle = document.getElementById('lblGeomAliceTitle');
    if (lblGeomAliceTitle) lblGeomAliceTitle.innerText = t.geomAliceTitle;
    const lblGeomAliceDesc = document.getElementById('lblGeomAliceDesc');
    if (lblGeomAliceDesc) lblGeomAliceDesc.innerText = t.geomAliceDesc;
    const lblGeomStandardTitle = document.getElementById('lblGeomStandardTitle');
    if (lblGeomStandardTitle) lblGeomStandardTitle.innerText = t.geomStandardTitle;
    const lblGeomStandardDesc = document.getElementById('lblGeomStandardDesc');
    if (lblGeomStandardDesc) lblGeomStandardDesc.innerText = t.geomStandardDesc;
    const lblGeomOrthoTitle = document.getElementById('lblGeomOrthoTitle');
    if (lblGeomOrthoTitle) lblGeomOrthoTitle.innerText = t.geomOrthoTitle;
    const lblGeomOrthoDesc = document.getElementById('lblGeomOrthoDesc');
    if (lblGeomOrthoDesc) lblGeomOrthoDesc.innerText = t.geomOrthoDesc;

    const lblViaTitle = document.getElementById('lblViaTitle');
    if (lblViaTitle) lblViaTitle.innerText = t.viaTitle;
    const lblViaDesc = document.getElementById('lblViaDesc');
    if (lblViaDesc) lblViaDesc.innerText = t.viaDesc;
    const btnDetectViaText = document.getElementById('btnDetectViaText');
    if (btnDetectViaText) btnDetectViaText.innerText = t.btnDetectVia;

    const lblUiLangTitle = document.getElementById('lblUiLangTitle');
    if (lblUiLangTitle) lblUiLangTitle.innerText = t.uiLangTitle;
    const lblUiLangDesc = document.getElementById('lblUiLangDesc');
    if (lblUiLangDesc) lblUiLangDesc.innerText = t.uiLangDesc;
    if (uiLangSelect && uiLangSelect.options[0]) {
        uiLangSelect.options[0].text = t.uiLangAuto;
    }

    const lblThemeTitle = document.getElementById('lblThemeTitle');
    if (lblThemeTitle) lblThemeTitle.innerText = t.themeTitle;
    const lblFontSizeTitle = document.getElementById('lblFontSizeTitle');
    if (lblFontSizeTitle) lblFontSizeTitle.innerText = t.fontSizeTitle;
    const btnFontNormal = document.getElementById('btnFontNormal');
    if (btnFontNormal) btnFontNormal.innerText = t.btnFontNormal;
    const btnFontLarge = document.getElementById('btnFontLarge');
    if (btnFontLarge) btnFontLarge.innerText = t.btnFontLarge;

    // Help modal
    const helpModalTitle = document.getElementById('helpModalTitle');
    if (helpModalTitle) helpModalTitle.innerText = t.helpTitle;
    const helpModalList = document.getElementById('helpModalList');
    if (helpModalList && t.helpItems) {
        helpModalList.innerHTML = t.helpItems.map(item => `<li>${item}</li>`).join('');
    }
}

// ==========================================================================
// 2. KEYBOARD LAYOUTS & MAPPINGS
// ==========================================================================
const KEY_MAPS = {
    russian: {
        'Backquote': { main: 'Ё', hint: '`' },
        'Digit1': { main: '1', hint: '1' }, 'Digit2': { main: '2', hint: '2' }, 'Digit3': { main: '3', hint: '3' },
        'Digit4': { main: '4', hint: '4' }, 'Digit5': { main: '5', hint: '5' }, 'Digit6': { main: '6', hint: '6' },
        'Digit7': { main: '7', hint: '7' }, 'Digit8': { main: '8', hint: '8' }, 'Digit9': { main: '9', hint: '9' },
        'Digit0': { main: '0', hint: '0' }, 'Minus': { main: '-', hint: '-' }, 'Equal': { main: '=', hint: '=' },

        'KeyQ': { main: 'Й', hint: 'Q' }, 'KeyW': { main: 'Ц', hint: 'W' }, 'KeyE': { main: 'У', hint: 'E' },
        'KeyR': { main: 'К', hint: 'R' }, 'KeyT': { main: 'Е', hint: 'T' }, 'KeyY': { main: 'Н', hint: 'Y' },
        'KeyU': { main: 'Г', hint: 'U' }, 'KeyI': { main: 'Ш', hint: 'I' }, 'KeyO': { main: 'Щ', hint: 'O' },
        'KeyP': { main: 'З', hint: 'P' }, 'BracketLeft': { main: 'Х', hint: '[' }, 'BracketRight': { main: 'Ъ', hint: ']' },

        'KeyA': { main: 'Ф', hint: 'A' }, 'KeyS': { main: 'Ы', hint: 'S' }, 'KeyD': { main: 'В', hint: 'D' },
        'KeyF': { main: 'А', hint: 'F' }, 'KeyG': { main: 'П', hint: 'G' }, 'KeyH': { main: 'Р', hint: 'H' },
        'KeyJ': { main: 'О', hint: 'J' }, 'KeyK': { main: 'Л', hint: 'K' }, 'KeyL': { main: 'Д', hint: 'L' },
        'Semicolon': { main: 'Ж', hint: ';' }, 'Quote': { main: 'Э', hint: "'" },

        'KeyZ': { main: 'Я', hint: 'Z' }, 'KeyX': { main: 'Ч', hint: 'X' }, 'KeyC': { main: 'С', hint: 'C' },
        'KeyV': { main: 'М', hint: 'V' }, 'KeyB': { main: 'И', hint: 'B' }, 'KeyN': { main: 'Т', hint: 'N' },
        'KeyM': { main: 'Ь', hint: 'M' }, 'Comma': { main: 'Б', hint: ',' }, 'Period': { main: 'Ю', hint: '.' },
        'Slash': { main: '.', hint: '/' }
    },
    polish: {
        'KeyQ': { main: 'Q' }, 'KeyW': { main: 'W' }, 'KeyE': { main: 'E' }, 'KeyR': { main: 'R' }, 'KeyT': { main: 'T' },
        'KeyY': { main: 'Y' }, 'KeyU': { main: 'U' }, 'KeyI': { main: 'I' }, 'KeyO': { main: 'O' }, 'KeyP': { main: 'P' },
        'KeyA': { main: 'A' }, 'KeyS': { main: 'S' }, 'KeyD': { main: 'D' }, 'KeyF': { main: 'F' }, 'KeyG': { main: 'G' },
        'KeyH': { main: 'H' }, 'KeyJ': { main: 'J' }, 'KeyK': { main: 'K' }, 'KeyL': { main: 'L' },
        'KeyZ': { main: 'Z' }, 'KeyX': { main: 'X' }, 'KeyC': { main: 'C' }, 'KeyV': { main: 'V' }, 'KeyB': { main: 'B' },
        'KeyN': { main: 'N' }, 'KeyM': { main: 'M' }
    },
    german: {
        'KeyQ': { main: 'Q' }, 'KeyW': { main: 'W' }, 'KeyE': { main: 'E' }, 'KeyR': { main: 'R' }, 'KeyT': { main: 'T' },
        'KeyY': { main: 'Z', hint: 'Y' }, 'KeyU': { main: 'U' }, 'KeyI': { main: 'I' }, 'KeyO': { main: 'O' }, 'KeyP': { main: 'P' },
        'BracketLeft': { main: 'Ü' },
        'KeyA': { main: 'A' }, 'KeyS': { main: 'S' }, 'KeyD': { main: 'D' }, 'KeyF': { main: 'F' }, 'KeyG': { main: 'G' },
        'KeyH': { main: 'H' }, 'KeyJ': { main: 'J' }, 'KeyK': { main: 'K' }, 'KeyL': { main: 'L' },
        'Semicolon': { main: 'Ö' }, 'Quote': { main: 'Ä' },
        'KeyZ': { main: 'Y', hint: 'Z' }, 'KeyX': { main: 'X' }, 'KeyC': { main: 'C' }, 'KeyV': { main: 'V' }, 'KeyB': { main: 'B' },
        'KeyN': { main: 'N' }, 'KeyM': { main: 'M' }, 'Minus': { main: 'ß' }
    },
    french: {
        'KeyQ': { main: 'A', hint: 'Q' }, 'KeyW': { main: 'Z', hint: 'W' }, 'KeyE': { main: 'E' }, 'KeyR': { main: 'R' }, 'KeyT': { main: 'T' },
        'KeyY': { main: 'Y' }, 'KeyU': { main: 'U' }, 'KeyI': { main: 'I' }, 'KeyO': { main: 'O' }, 'KeyP': { main: 'P' },
        'KeyA': { main: 'Q', hint: 'A' }, 'KeyS': { main: 'S' }, 'KeyD': { main: 'D' }, 'KeyF': { main: 'F' }, 'KeyG': { main: 'G' },
        'KeyH': { main: 'H' }, 'KeyJ': { main: 'J' }, 'KeyK': { main: 'K' }, 'KeyL': { main: 'L' }, 'Semicolon': { main: 'M' },
        'KeyZ': { main: 'W', hint: 'Z' }, 'KeyX': { main: 'X' }, 'KeyC': { main: 'C' }, 'KeyV': { main: 'V' }, 'KeyB': { main: 'B' },
        'KeyN': { main: 'N' }, 'KeyM': { main: ',' }
    },
    swedish: {
        'KeyQ': { main: 'Q' }, 'KeyW': { main: 'W' }, 'KeyE': { main: 'E' }, 'KeyR': { main: 'R' }, 'KeyT': { main: 'T' },
        'KeyY': { main: 'Y' }, 'KeyU': { main: 'U' }, 'KeyI': { main: 'I' }, 'KeyO': { main: 'O' }, 'KeyP': { main: 'P' },
        'BracketLeft': { main: 'Å' },
        'KeyA': { main: 'A' }, 'KeyS': { main: 'S' }, 'KeyD': { main: 'D' }, 'KeyF': { main: 'F' }, 'KeyG': { main: 'G' },
        'KeyH': { main: 'H' }, 'KeyJ': { main: 'J' }, 'KeyK': { main: 'K' }, 'KeyL': { main: 'L' },
        'Semicolon': { main: 'Ö' }, 'Quote': { main: 'Ä' },
        'KeyZ': { main: 'Z' }, 'KeyX': { main: 'X' }, 'KeyC': { main: 'C' }, 'KeyV': { main: 'V' }, 'KeyB': { main: 'B' },
        'KeyN': { main: 'N' }, 'KeyM': { main: 'M' }
    },
    english: {
        'KeyQ': { main: 'Q' }, 'KeyW': { main: 'W' }, 'KeyE': { main: 'E' }, 'KeyR': { main: 'R' }, 'KeyT': { main: 'T' },
        'KeyY': { main: 'Y' }, 'KeyU': { main: 'U' }, 'KeyI': { main: 'I' }, 'KeyO': { main: 'O' }, 'KeyP': { main: 'P' },
        'KeyA': { main: 'A' }, 'KeyS': { main: 'S' }, 'KeyD': { main: 'D' }, 'KeyF': { main: 'F' }, 'KeyG': { main: 'G' },
        'KeyH': { main: 'H' }, 'KeyJ': { main: 'J' }, 'KeyK': { main: 'K' }, 'KeyL': { main: 'L' },
        'KeyZ': { main: 'Z' }, 'KeyX': { main: 'X' }, 'KeyC': { main: 'C' }, 'KeyV': { main: 'V' }, 'KeyB': { main: 'B' },
        'KeyN': { main: 'N' }, 'KeyM': { main: 'M' }
    }
};

function getTargetKeyInfo(char, lang) {
    if (!char) return null;
    if (char === ' ') return { code: 'Space', shift: false, alt: false };

    const isUpper = char !== char.toLowerCase() && char === char.toUpperCase() && char.match(/[A-ZĄĆĘŁŃÓŚŹŻА-ЯЁÄÖÜ]/i);
    const lowChar = char.toLowerCase();

    // Język polski (AltGr + klawisz)
    if (lang === 'polish') {
        const polishAltMap = {
            'ą': 'KeyA', 'ć': 'KeyC', 'ę': 'KeyE', 'ł': 'KeyL',
            'ń': 'KeyN', 'ó': 'KeyO', 'ś': 'KeyS', 'ź': 'KeyX', 'ż': 'KeyZ'
        };
        if (polishAltMap[lowChar]) {
            return { code: polishAltMap[lowChar], alt: true, shift: !!isUpper };
        }
    }

    // Język rosyjski
    if (lang === 'russian') {
        const ruMap = {
            'ё': { code: 'Backquote' }, '1': { code: 'Digit1' }, '2': { code: 'Digit2' }, '3': { code: 'Digit3' },
            '4': { code: 'Digit4' }, '5': { code: 'Digit5' }, '6': { code: 'Digit6' }, '7': { code: 'Digit7' },
            '8': { code: 'Digit8' }, '9': { code: 'Digit9' }, '0': { code: 'Digit0' }, '-': { code: 'Minus' }, '=': { code: 'Equal' },
            'й': { code: 'KeyQ' }, 'ц': { code: 'KeyW' }, 'у': { code: 'KeyE' }, 'к': { code: 'KeyR' }, 'е': { code: 'KeyT' },
            'н': { code: 'KeyY' }, 'г': { code: 'KeyU' }, 'ш': { code: 'KeyI' }, 'щ': { code: 'KeyO' }, 'з': { code: 'KeyP' },
            'х': { code: 'BracketLeft' }, 'ъ': { code: 'BracketRight' },
            'ф': { code: 'KeyA' }, 'ы': { code: 'KeyS' }, 'в': { code: 'KeyD' }, 'а': { code: 'KeyF' }, 'п': { code: 'KeyG' },
            'р': { code: 'KeyH' }, 'о': { code: 'KeyJ' }, 'л': { code: 'KeyK' }, 'д': { code: 'KeyL' }, 'ж': { code: 'Semicolon' },
            'э': { code: 'Quote' },
            'я': { code: 'KeyZ' }, 'ч': { code: 'KeyX' }, 'с': { code: 'KeyC' }, 'м': { code: 'KeyV' }, 'и': { code: 'KeyB' },
            'т': { code: 'KeyN' }, 'ь': { code: 'KeyM' }, 'б': { code: 'Comma' }, 'ю': { code: 'Period' },
            '.': { code: 'Slash' }, ',': { code: 'Slash', shift: true }
        };
        if (ruMap[lowChar]) {
            const mapped = ruMap[lowChar];
            return { code: mapped.code, alt: false, shift: isUpper || mapped.shift || false };
        }
    }

    // Niemiecki / francuski / szwedzki
    if (lang === 'german') {
        const deMap = { 'ä': 'Quote', 'ö': 'Semicolon', 'ü': 'BracketLeft', 'ß': 'Minus', 'z': 'KeyY', 'y': 'KeyZ' };
        if (deMap[lowChar]) return { code: deMap[lowChar], alt: false, shift: !!isUpper };
    }

    if (lang === 'french') {
        const frMap = { 'a': 'KeyQ', 'q': 'KeyA', 'z': 'KeyW', 'w': 'KeyZ', 'm': 'Semicolon' };
        if (frMap[lowChar]) return { code: frMap[lowChar], alt: false, shift: !!isUpper };
    }

    if (lang === 'swedish') {
        const svMap = { 'å': 'BracketLeft', 'ä': 'Quote', 'ö': 'Semicolon' };
        if (svMap[lowChar]) return { code: svMap[lowChar], alt: false, shift: !!isUpper };
    }

    // Standardowe litery A-Z
    const upperChar = char.toUpperCase();
    if (upperChar >= 'A' && upperChar <= 'Z') {
        return { code: 'Key' + upperChar, alt: false, shift: !!isUpper };
    }

    if (char >= '0' && char <= '9') {
        return { code: 'Digit' + char, alt: false, shift: false };
    }

    const punctMap = {
        ',': 'Comma', '.': 'Period', '/': 'Slash', ';': 'Semicolon', "'": 'Quote',
        '[': 'BracketLeft', ']': 'BracketRight', '-': 'Minus', '=': 'Equal'
    };

    if (punctMap[char]) {
        return { code: punctMap[char], alt: false, shift: false };
    }

    return null;
}

// ==========================================================================
// 3. VISUAL KEYBOARD RENDERER (STANDARD, ALICE SPLIT, ORTHO)
// ==========================================================================
function renderVisualKeyboard() {
    if (!visualKeyboard) return;
    visualKeyboard.className = `visual-keyboard keyboard-${keyboardGeometry}`;
    visualKeyboard.innerHTML = '';

    const langMap = KEY_MAPS[currentLanguage] || KEY_MAPS.english;

    if (keyboardGeometry === 'alice') {
        renderAliceLayout(visualKeyboard, langMap);
    } else if (keyboardGeometry === 'ortho') {
        renderOrthoLayout(visualKeyboard, langMap);
    } else {
        renderStandardLayout(visualKeyboard, langMap);
    }

    updateHighlightedKey();
}

function createKeyElement(code, defaultLabel, extraClass = '') {
    const key = document.createElement('div');
    key.className = `kb-key ${extraClass}`;
    key.dataset.code = code;

    const langMap = KEY_MAPS[currentLanguage] || KEY_MAPS.english;
    const mapping = langMap[code];

    const mainLabel = mapping && mapping.main ? mapping.main : defaultLabel;
    const hintLabel = mapping && mapping.hint ? mapping.hint : '';

    const mainSpan = document.createElement('span');
    mainSpan.className = 'kb-main';
    mainSpan.textContent = mainLabel;
    key.appendChild(mainSpan);

    if (hintLabel) {
        const hintSpan = document.createElement('span');
        hintSpan.className = 'kb-hint';
        hintSpan.textContent = hintLabel;
        key.appendChild(hintSpan);
    }

    return key;
}

function renderStandardLayout(container, langMap) {
    const rows = [
        [
            { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' },
            { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' },
            { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' },
            { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' },
            { code: 'Equal', label: '=' }, { code: 'Backspace', label: '⌫', cls: 'key-wide' }
        ],
        [
            { code: 'Tab', label: 'Tab', cls: 'key-wide' }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' },
            { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' },
            { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' },
            { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' },
            { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\' }
        ],
        [
            { code: 'CapsLock', label: 'Caps', cls: 'key-wide' }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' },
            { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' },
            { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' },
            { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" },
            { code: 'Enter', label: '↵', cls: 'key-wider' }
        ],
        [
            { code: 'ShiftLeft', label: 'Shift', cls: 'key-wider' }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' },
            { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' },
            { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' },
            { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'Shift', cls: 'key-wider' }
        ],
        [
            { code: 'ControlLeft', label: 'Ctrl', cls: 'key-wide' }, { code: 'AltLeft', label: 'Alt', cls: 'key-wide' },
            { code: 'Space', label: 'Space', cls: 'key-space' },
            { code: 'AltRight', label: 'Alt', cls: 'key-wide' }, { code: 'ControlRight', label: 'Ctrl', cls: 'key-wide' }
        ]
    ];

    rows.forEach(r => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'kb-row';
        r.forEach(k => rowDiv.appendChild(createKeyElement(k.code, k.label, k.cls || '')));
        container.appendChild(rowDiv);
    });
}

function renderAliceLayout(container, langMap) {
    const aliceBoard = document.createElement('div');
    aliceBoard.className = 'alice-board-container';

    // 1. Lewa połówka kątowa (wraz z F-rzędem u góry)
    const leftHalf = document.createElement('div');
    leftHalf.className = 'alice-half alice-left';

    const leftRows = [
        [
            { code: 'Escape', label: 'Esc', cls: 'key-f' },
            { code: 'F1', label: 'F1', cls: 'key-f' }, { code: 'F2', label: 'F2', cls: 'key-f' },
            { code: 'F3', label: 'F3', cls: 'key-f' }, { code: 'F4', label: 'F4', cls: 'key-f' },
            { code: 'F5', label: 'F5', cls: 'key-f' }, { code: 'F6', label: 'F6', cls: 'key-f' }
        ],
        [
            { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' },
            { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' }
        ],
        [
            { code: 'Tab', label: 'Tab', cls: 'key-wide' }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' },
            { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' }
        ],
        [
            { code: 'CapsLock', label: 'Caps', cls: 'key-wide' }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' },
            { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' }
        ],
        [
            { code: 'ShiftLeft', label: 'Shift', cls: 'key-wider' }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' },
            { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' }
        ],
        [
            { code: 'ControlLeft', label: 'Ctrl' }, { code: 'MetaLeft', label: 'Win' }, { code: 'AltLeft', label: 'Alt' }, { code: 'SpaceLeft', label: 'Space', cls: 'key-space-left' }
        ]
    ];

    leftRows.forEach(r => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'kb-row';
        r.forEach(k => rowDiv.appendChild(createKeyElement(k.code, k.label, k.cls || '')));
        leftHalf.appendChild(rowDiv);
    });

    // 2. Prawa połówka kątowa (wraz z F-rzędem u góry)
    const rightHalf = document.createElement('div');
    rightHalf.className = 'alice-half alice-right';

    const rightRows = [
        [
            { code: 'F7', label: 'F7', cls: 'key-f' }, { code: 'F8', label: 'F8', cls: 'key-f' },
            { code: 'F9', label: 'F9', cls: 'key-f' }, { code: 'F10', label: 'F10', cls: 'key-f' },
            { code: 'F11', label: 'F11', cls: 'key-f' }, { code: 'F12', label: 'F12', cls: 'key-f' },
            { code: 'Delete', label: 'Del', cls: 'key-f' }
        ],
        [
            { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' }, { code: 'Digit9', label: '9' },
            { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' }, { code: 'Backspace', label: '⌫', cls: 'key-wide' }
        ],
        [
            { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' },
            { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' }, { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\' }
        ],
        [
            { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' },
            { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" }, { code: 'Enter', label: '↵', cls: 'key-wider' }
        ],
        [
            { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' },
            { code: 'Comma', label: ',' }, { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'Shift', cls: 'key-wide' }
        ],
        [
            { code: 'SpaceRight', label: 'Space', cls: 'key-space-right' }, { code: 'AltRight', label: 'Alt' }, { code: 'ControlRight', label: 'Ctrl' }
        ]
    ];

    rightRows.forEach(r => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'kb-row';
        r.forEach(k => rowDiv.appendChild(createKeyElement(k.code, k.label, k.cls || '')));
        rightHalf.appendChild(rowDiv);
    });

    aliceBoard.appendChild(leftHalf);
    aliceBoard.appendChild(rightHalf);
    container.appendChild(aliceBoard);
}

function renderOrthoLayout(container, langMap) {
    const rows = [
        [
            { code: 'Backquote', label: '`' }, { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' },
            { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' }, { code: 'Digit5', label: '5' },
            { code: 'Digit6', label: '6' }, { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' },
            { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' }, { code: 'Minus', label: '-' },
            { code: 'Equal', label: '=' }, { code: 'Backspace', label: '⌫', cls: 'key-wide' }
        ],
        [
            { code: 'Tab', label: 'Tab', cls: 'key-wide' }, { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' },
            { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' }, { code: 'KeyT', label: 'T' },
            { code: 'KeyY', label: 'Y' }, { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' },
            { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' }, { code: 'BracketLeft', label: '[' },
            { code: 'BracketRight', label: ']' }, { code: 'Backslash', label: '\\' }
        ],
        [
            { code: 'CapsLock', label: 'Caps', cls: 'key-wide' }, { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' },
            { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' }, { code: 'KeyG', label: 'G' },
            { code: 'KeyH', label: 'H' }, { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' },
            { code: 'KeyL', label: 'L' }, { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" },
            { code: 'Enter', label: '↵', cls: 'key-wider' }
        ],
        [
            { code: 'ShiftLeft', label: 'Shift', cls: 'key-wider' }, { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' },
            { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' }, { code: 'KeyB', label: 'B' },
            { code: 'KeyN', label: 'N' }, { code: 'KeyM', label: 'M' }, { code: 'Comma', label: ',' },
            { code: 'Period', label: '.' }, { code: 'Slash', label: '/' }, { code: 'ShiftRight', label: 'Shift', cls: 'key-wider' }
        ],
        [
            { code: 'ControlLeft', label: 'Ctrl', cls: 'key-wide' }, { code: 'AltLeft', label: 'Alt', cls: 'key-wide' },
            { code: 'Space', label: 'Space', cls: 'key-space' },
            { code: 'AltRight', label: 'Alt', cls: 'key-wide' }, { code: 'ControlRight', label: 'Ctrl', cls: 'key-wide' }
        ]
    ];

    rows.forEach(r => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'kb-row';
        r.forEach(k => rowDiv.appendChild(createKeyElement(k.code, k.label, k.cls || '')));
        container.appendChild(rowDiv);
    });
}

function updateHighlightedKey() {
    if (!visualKeyboard || !isKeyboardEnabled) return;

    document.querySelectorAll('.kb-key.key-target, .kb-key.key-modifier').forEach(k => {
        k.classList.remove('key-target', 'key-modifier');
    });

    const arrayQuote = textContent.querySelectorAll('span.letter');
    const currentIndex = userInput.value.length;

    if (!arrayQuote[currentIndex]) return;

    const targetChar = arrayQuote[currentIndex].textContent;
    const targetInfo = getTargetKeyInfo(targetChar, currentLanguage);

    if (!targetInfo) return;

    if (targetInfo.code === 'Space') {
        const spaceKeys = visualKeyboard.querySelectorAll('[data-code="Space"], [data-code="SpaceLeft"], [data-code="SpaceRight"]');
        spaceKeys.forEach(k => k.classList.add('key-target'));
        return;
    }

    const keyElem = visualKeyboard.querySelector(`[data-code="${targetInfo.code}"]`);
    if (keyElem) {
        keyElem.classList.add('key-target');
    }

    if (targetInfo.alt) {
        const altKey = visualKeyboard.querySelector('[data-code="AltRight"]') || visualKeyboard.querySelector('[data-code="AltLeft"]');
        if (altKey) altKey.classList.add('key-modifier');
    }

    if (targetInfo.shift) {
        const shiftKey = visualKeyboard.querySelector('[data-code="ShiftLeft"]') || visualKeyboard.querySelector('[data-code="ShiftRight"]');
        if (shiftKey) shiftKey.classList.add('key-modifier');
    }
}

function setKeyboardGeometry(geom) {
    keyboardGeometry = geom;
    localStorage.setItem('cheddar_keyboard_geom', geom);
    document.querySelectorAll('.layout-card').forEach(card => {
        card.classList.toggle('active', card.dataset.geometry === geom);
    });
    renderVisualKeyboard();
}

function toggleVisualKeyboard(enable) {
    isKeyboardEnabled = enable;
    localStorage.setItem('cheddar_keyboard_enabled', enable ? 'true' : 'false');
    if (visualKeyboardContainer) {
        visualKeyboardContainer.classList.toggle('hidden', !enable);
    }
    if (kbToggleBtn) {
        kbToggleBtn.classList.toggle('active', enable);
    }
    if (kbEnableToggle) {
        kbEnableToggle.checked = enable;
    }
    if (enable) updateHighlightedKey();
}

// WebHID VIA/QMK Autodetect
async function detectViaKeyboard() {
    if (!viaStatusMsg) return;

    if (!navigator.hid) {
        viaStatusMsg.innerText = "WebHID nie jest wspierany w tej przeglądarce. Wybierz układ ręcznie.";
        return;
    }

    try {
        viaStatusMsg.innerText = "Wybierz klawiaturę w oknie połączenia USB...";
        const devices = await navigator.hid.requestDevice({
            filters: []
        });

        if (devices && devices.length > 0) {
            const dev = devices[0];
            const name = (dev.productName || "Klawiatura USB").toLowerCase();
            let detected = 'standard';

            if (name.includes('alice') || name.includes('arisu') || name.includes('split') || name.includes('98') || name.includes('feker') || name.includes('akko')) {
                detected = 'alice';
            } else if (name.includes('ortho') || name.includes('planck') || name.includes('corne') || name.includes('ergodox')) {
                detected = 'ortho';
            }

            setKeyboardGeometry(detected);
            viaStatusMsg.innerText = `Wykryto: ${dev.productName || "Klawiatura USB"} → Ustawiono układ: ${detected.toUpperCase()}`;
        } else {
            viaStatusMsg.innerText = "Nie wybrano urządzenia.";
        }
    } catch (e) {
        viaStatusMsg.innerText = "Anulowano lub błąd połączenia USB.";
    }
}

// ==========================================================================
// 4. SMART WEAKNESS ENGINE
// ==========================================================================
class SmartWeaknessEngine {
    constructor() {
        this.storageKey = 'cheddar_weaknesses';
        this.data = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('Could not load weakness data', e);
        }
        return {
            enabled: true,
            chars: {},
            bigrams: {}
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {}
    }

    recordMistake(expectedChar, prevChar) {
        if (!expectedChar) return;
        const charLow = expectedChar.toLowerCase();
        
        this.data.chars[charLow] = (this.data.chars[charLow] || 0) + 1;

        if (prevChar && prevChar.trim().length > 0 && expectedChar.trim().length > 0) {
            const bigram = (prevChar + expectedChar).toLowerCase();
            this.data.bigrams[bigram] = (this.data.bigrams[bigram] || 0) + 1;
            roundMistakes.add(bigram);
        } else {
            roundMistakes.add(charLow);
        }

        this.save();
    }

    getScoreForText(text) {
        if (!this.data.enabled) return 1.0;
        const lower = text.toLowerCase();
        let score = 1.0;

        for (const [char, count] of Object.entries(this.data.chars)) {
            if (count > 0 && lower.includes(char)) {
                score += count * 1.2;
            }
        }

        for (const [bigram, count] of Object.entries(this.data.bigrams)) {
            if (count > 0 && lower.includes(bigram)) {
                score += count * 3.0;
            }
        }

        return score;
    }

    selectFact(factsPool) {
        if (!factsPool || factsPool.length === 0) return null;
        if (factsPool.length === 1) return factsPool[0];

        if (!this.data.enabled || (Object.keys(this.data.chars).length === 0 && Object.keys(this.data.bigrams).length === 0)) {
            let candidate;
            let attempts = 0;
            do {
                candidate = factsPool[Math.floor(Math.random() * factsPool.length)];
                attempts++;
            } while (candidate.text === previousSentenceText && attempts < 10);
            return candidate;
        }

        const scores = factsPool.map(fact => {
            if (fact.text === previousSentenceText && factsPool.length > 1) {
                return 0.05;
            }
            return this.getScoreForText(fact.text);
        });

        const totalScore = scores.reduce((sum, s) => sum + s, 0);
        let randomVal = Math.random() * totalScore;

        for (let i = 0; i < factsPool.length; i++) {
            randomVal -= scores[i];
            if (randomVal <= 0) {
                return factsPool[i];
            }
        }

        return factsPool[factsPool.length - 1];
    }

    getTopWeaknesses(limit = 10) {
        const list = [];
        for (const [bigram, count] of Object.entries(this.data.bigrams)) {
            list.push({ label: `"${bigram}"`, count });
        }
        for (const [char, count] of Object.entries(this.data.chars)) {
            list.push({ label: `'${char}'`, count });
        }
        list.sort((a, b) => b.count - a.count);
        return list.slice(0, limit);
    }

    reset() {
        this.data.chars = {};
        this.data.bigrams = {};
        this.save();
    }
}

const weaknessEngine = new SmartWeaknessEngine();

// ==========================================================================
// 5. STATS & RECORDS MANAGER
// ==========================================================================
class RecordsManager {
    constructor() {
        this.storageKey = 'cheddar_records';
        this.records = this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            bestWpm: 0,
            bestCpm: 0,
            totalKeystrokes: 0,
            totalErrors: 0,
            totalCompleted: 0
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.records));
        } catch (e) {}
    }

    recordSession(wpm, cpm, accuracy, keystrokes, errors, isCompleted) {
        if (wpm > this.records.bestWpm) this.records.bestWpm = wpm;
        if (cpm > this.records.bestCpm) this.records.bestCpm = cpm;
        this.records.totalKeystrokes += keystrokes;
        this.records.totalErrors += errors;
        if (isCompleted) this.records.totalCompleted++;
        this.save();
        this.updateUI();
    }

    updateUI() {
        if (recBestWpm) recBestWpm.innerText = this.records.bestWpm;
        if (recBestCpm) recBestCpm.innerText = this.records.bestCpm;
        if (recCompleted) recCompleted.innerText = this.records.totalCompleted;
        
        let avgAcc = 100;
        if (this.records.totalKeystrokes > 0) {
            avgAcc = Math.max(0, ((this.records.totalKeystrokes - this.records.totalErrors) / this.records.totalKeystrokes) * 100).toFixed(1);
        }
        if (recAvgAcc) recAvgAcc.innerText = `${avgAcc}%`;

        this.renderWeaknesses();
    }

    renderWeaknesses() {
        if (!weaknessChips) return;
        const top = weaknessEngine.getTopWeaknesses(12);
        if (top.length === 0) {
            const lang = getActiveUiLanguage();
            const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.polish;
            weaknessChips.innerHTML = `<span class="no-weakness">${t.noWeakness}</span>`;
            return;
        }

        weaknessChips.innerHTML = '';
        top.forEach(item => {
            const span = document.createElement('span');
            span.className = 'weakness-chip';
            span.textContent = `${item.label} (${item.count})`;
            weaknessChips.appendChild(span);
        });
    }

    resetAll() {
        this.records = {
            bestWpm: 0,
            bestCpm: 0,
            totalKeystrokes: 0,
            totalErrors: 0,
            totalCompleted: 0
        };
        this.save();
        weaknessEngine.reset();
        this.updateUI();
    }
}

const recordsManager = new RecordsManager();

// ==========================================================================
// 6. THEMES & SETTINGS
// ==========================================================================
function initTheme() {
    const savedNight = localStorage.getItem('cheddar_night_mode');
    const savedTheme = localStorage.getItem('cheddar_theme') || (savedNight === 'true' ? 'roquefort-night' : 'cheddar-classic');
    setTheme(savedTheme);

    const savedGeom = localStorage.getItem('cheddar_keyboard_geom') || 'alice';
    keyboardGeometry = savedGeom;
    document.querySelectorAll('.layout-card').forEach(c => c.classList.toggle('active', c.dataset.geometry === savedGeom));

    const savedKbEnabled = localStorage.getItem('cheddar_keyboard_enabled');
    isKeyboardEnabled = savedKbEnabled !== 'false';
    toggleVisualKeyboard(isKeyboardEnabled);

    const savedUiLang = localStorage.getItem('cheddar_ui_lang') || 'auto';
    uiLanguageSetting = savedUiLang;
    if (uiLangSelect) uiLangSelect.value = savedUiLang;
}

function updateStreakUI(didIncrease = false) {
    const statStreakUnit = document.getElementById('statStreakUnit');
    if (hudStreak) hudStreak.innerText = perfectStreak;
    if (statStreakUnit) {
        statStreakUnit.classList.toggle('active', perfectStreak > 0);
        if (didIncrease && perfectStreak > 0) {
            statStreakUnit.classList.remove('streak-bounce');
            void statStreakUnit.offsetWidth;
            statStreakUnit.classList.add('streak-bounce');
        }
    }
}

function setTheme(themeName) {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === themeName);
    });

    // Usuwanie wszystkich poprzednich klas motywów
    document.body.classList.remove(
        'theme-cheddar-classic',
        'theme-roquefort-night',
        'theme-gouda-cream',
        'theme-swiss-pine',
        'theme-vintage-paper',
        'theme-nordic-aurora',
        'theme-matcha-garden',
        'theme-sunset-lavender',
        'theme-cyber-neon',
        'theme-espresso-mocha',
        'night-mode'
    );

    document.body.classList.add(`theme-${themeName}`);

    if (themeName === 'roquefort-night') {
        document.body.classList.add('night-mode');
        localStorage.setItem('cheddar_night_mode', 'true');
    } else {
        localStorage.setItem('cheddar_night_mode', 'false');
    }
    localStorage.setItem('cheddar_theme', themeName);
}

// ==========================================================================
// 7. DATA LOADING & INITIALIZATION
// ==========================================================================
async function loadData() {
    try {
        const response = await fetch('data.json');
        allData = await response.json();
        
        const savedLang = localStorage.getItem('cheddar_lang') || 'polish';
        if (allData[savedLang]) {
            currentLanguage = savedLang;
            if (langSelect) langSelect.value = savedLang;
        }

        const savedMode = localStorage.getItem('cheddar_mode') || 'endless';
        currentMode = savedMode;
        if (modeSelect) modeSelect.value = savedMode;

        try {
            const savedCats = localStorage.getItem('cheddar_selected_categories');
            if (savedCats) selectedCategories = new Set(JSON.parse(savedCats));
        } catch (e) {}

        initTheme();
        applyUiLocalization();
        updateCategoryChipsUI();
        recordsManager.updateUI();
        startNewRound(true);
    } catch (e) {
        console.error('Error loading data.json:', e);
    }
}

// ==========================================================================
// 8. CATEGORY FILTERING
// ==========================================================================
function setupCategoryListeners() {
    if (!categoriesBar) return;

    categoriesBar.addEventListener('click', (e) => {
        const chip = e.target.closest('.cat-chip');
        if (!chip) return;

        const category = chip.dataset.category;
        const allCategories = ['nature', 'science', 'human', 'history', 'language'];

        if (category === 'all') {
            selectedCategories = new Set(['all', ...allCategories]);
        } else {
            if (selectedCategories.has('all') && selectedCategories.size > 1) {
                selectedCategories.clear();
                selectedCategories.add(category);
            } else {
                if (selectedCategories.has(category)) {
                    selectedCategories.delete(category);
                    selectedCategories.delete('all');
                    if (selectedCategories.size === 0) {
                        selectedCategories = new Set(['all', ...allCategories]);
                    }
                } else {
                    selectedCategories.add(category);
                    const allSelected = allCategories.every(c => selectedCategories.has(c));
                    if (allSelected) selectedCategories.add('all');
                }
            }
        }

        try {
            localStorage.setItem('cheddar_selected_categories', JSON.stringify(Array.from(selectedCategories)));
        } catch (err) {}

        updateCategoryChipsUI();
        startNewRound(true);
    });
}

function updateCategoryChipsUI() {
    const chips = document.querySelectorAll('.cat-chip');
    chips.forEach(chip => {
        const cat = chip.dataset.category;
        chip.classList.toggle('active', selectedCategories.has(cat));
    });
}

function getFilteredFactsPool() {
    const langData = allData[currentLanguage];
    if (!langData) return [];

    let facts = [];
    if (Array.isArray(langData.facts)) {
        facts = langData.facts;
    } else if (langData.easy || langData.hard) {
        const easy = (langData.easy || []).map(t => typeof t === 'string' ? { text: t, level: 'easy', category: 'nature' } : t);
        const hard = (langData.hard || []).map(t => typeof t === 'string' ? { text: t, level: 'hard', category: 'language' } : t);
        facts = [...easy, ...hard];
    }

    const currentLevel = perfectStreak >= 1 ? 'hard' : 'easy';

    let pool = facts.filter(f => f.level === currentLevel);
    if (pool.length === 0) pool = facts;

    if (!selectedCategories.has('all')) {
        const categoryFiltered = pool.filter(f => selectedCategories.has(f.category));
        if (categoryFiltered.length > 0) {
            pool = categoryFiltered;
        }
    }

    return pool;
}

// ==========================================================================
// 9. ROUND & TYPING CORE LOGIC
// ==========================================================================
function startNewRound(resetTimer = true, forceRepeat = false) {
    if (resetTimer) {
        clearInterval(timerInterval);
        startTime = null;
        timerInterval = null;
        timerDisplay.innerText = "0:00";
        if (hudWpm) hudWpm.innerText = "0";
        totalKeystrokes = 0;
        errorsMade = 0;
    }

    userInput.value = "";
    previousInputLength = 0;
    currentSentenceErrors = 0;
    roundMistakes.clear();
    updateProgressBar(0);
    updateStreakUI(false);

    renderText(forceRepeat);
    renderVisualKeyboard();
    userInput.focus();
}

function updateProgressBar(percent) {
    if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, percent)) + "%";
}

function renderText(forceRepeat = false) {
    const factsPool = getFilteredFactsPool();
    if (factsPool.length === 0) return;

    if (!forceRepeat || !currentSentenceObj) {
        currentSentenceObj = weaknessEngine.selectFact(factsPool);
    }

    if (!currentSentenceObj) return;
    previousSentenceText = currentSentenceObj.text;

    textContent.innerHTML = '';

    const cursorDiv = document.createElement('div');
    cursorDiv.id = 'cursor';
    textContent.appendChild(cursorDiv);

    const words = currentSentenceObj.text.split(' ');
    words.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.classList.add('word');

        word.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            span.classList.add('letter');
            wordDiv.appendChild(span);
        });

        if (index < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            spaceSpan.classList.add('letter', 'space');
            wordDiv.appendChild(spaceSpan);
        }

        textContent.appendChild(wordDiv);
    });

    setTimeout(updateCursorPosition, 0);
}

function updateCursorPosition() {
    const cursor = document.getElementById('cursor');
    const arrayQuote = textContent.querySelectorAll('span.letter');
    const currentIndex = userInput.value.length;

    if (!cursor || arrayQuote.length === 0) return;

    if (arrayQuote[currentIndex]) {
        const currentLetter = arrayQuote[currentIndex];
        cursor.style.width = currentLetter.offsetWidth + 'px';
        cursor.style.left = currentLetter.offsetLeft + 'px';
        cursor.style.top = (currentLetter.offsetTop + currentLetter.offsetHeight) + 'px';
        cursor.style.opacity = '1';
    } else {
        cursor.style.opacity = '0';
    }
}

function triggerErrorAnimation() {
    const cursor = document.getElementById('cursor');
    if (progressBar) progressBar.classList.remove('error-shake');
    if (cursor) cursor.classList.remove('error-shake');

    if (progressBar) void progressBar.offsetWidth;
    if (cursor) void cursor.offsetWidth;

    if (progressBar) progressBar.classList.add('error-shake');
    if (cursor) cursor.classList.add('error-shake');
}

// ==========================================================================
// 10. REAL-TIME INPUT LISTENER & KEYBOARD HIGHLIGHTING
// ==========================================================================
userInput.addEventListener('input', () => {
    const arrayQuote = textContent.querySelectorAll('span.letter');
    const arrayValue = userInput.value.split('');
    const currentLength = userInput.value.length;

    if (!startTime && currentLength > 0) {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 500);
    }

    if (currentLength > previousInputLength) {
        totalKeystrokes++;
        const charIndex = currentLength - 1;
        const expectedLetter = arrayQuote[charIndex] ? arrayQuote[charIndex].textContent : '';
        const typedLetter = arrayValue[charIndex];

        if (expectedLetter && typedLetter !== expectedLetter) {
            errorsMade++;
            currentSentenceErrors++;
            triggerErrorAnimation();

            const prevLetter = charIndex > 0 && arrayQuote[charIndex - 1] ? arrayQuote[charIndex - 1].textContent : null;
            weaknessEngine.recordMistake(expectedLetter, prevLetter);
        }
    }
    previousInputLength = currentLength;

    let allCorrect = true;

    arrayQuote.forEach((span, index) => {
        const char = arrayValue[index];
        if (char == null) {
            span.classList.remove('correct', 'incorrect');
            allCorrect = false;
        } else if (char === span.textContent) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            span.classList.add('incorrect');
            span.classList.remove('correct');
            allCorrect = false;
        }
    });

    const progress = (currentLength / arrayQuote.length) * 100;
    updateProgressBar(progress);
    updateCursorPosition();
    updateLiveWpm();
    updateHighlightedKey();

    // Ukończenie zdania
    if (allCorrect && arrayValue.length === arrayQuote.length) {
        if (currentSentenceErrors === 0) {
            perfectStreak++;
            updateStreakUI(true);
        } else {
            perfectStreak = 0;
            updateStreakUI(false);
        }

        if (currentMode === 'single') {
            setTimeout(() => {
                showResultsModal(true);
            }, 220);
        } else {
            setTimeout(() => {
                startNewRound(false);
            }, 300);
        }
    }
});

function calculateWpmAndCpm() {
    if (!startTime) return { wpm: 0, cpm: 0, timeSec: 0 };
    const timeInSeconds = Math.max(1, (new Date() - startTime) / 1000);
    const timeInMinutes = timeInSeconds / 60;
    const cpm = Math.round(totalKeystrokes / timeInMinutes);
    const wpm = Math.round((totalKeystrokes / 5) / timeInMinutes);
    return { wpm, cpm, timeSec: timeInSeconds };
}

function updateLiveWpm() {
    if (!startTime) return;
    const { wpm } = calculateWpmAndCpm();
    if (hudWpm) hudWpm.innerText = wpm;
}

function updateTimer() {
    if (!startTime) return;
    const diff = Math.floor((new Date() - startTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    updateLiveWpm();
}

// ==========================================================================
// 11. RESULTS MODAL LOGIC
// ==========================================================================
function showResultsModal(isCompleted = false) {
    clearInterval(timerInterval);
    const { wpm, cpm } = calculateWpmAndCpm();
    const lang = getActiveUiLanguage();
    const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.polish;

    let accuracy = 100;
    if (totalKeystrokes > 0) {
        accuracy = Math.max(0, ((totalKeystrokes - errorsMade) / totalKeystrokes) * 100).toFixed(1);
    }

    if (resWpm) resWpm.innerText = wpm;
    if (resCpm) resCpm.innerText = cpm;
    if (resAccuracy) resAccuracy.innerText = `${accuracy}%`;
    if (resErrors) resErrors.innerText = typeof t.resErrors === 'function' ? t.resErrors(errorsMade) : `${errorsMade} errors`;
    if (resTime) resTime.innerText = timerDisplay.innerText;
    if (resChars) resChars.innerText = typeof t.resChars === 'function' ? t.resChars(totalKeystrokes) : `${totalKeystrokes} chars`;

    if (roundWeaknessInfo && roundWeaknessText) {
        if (roundMistakes.size > 0) {
            const mistakesList = Array.from(roundMistakes).slice(0, 4).map(m => `"${m}"`).join(', ');
            roundWeaknessText.innerText = typeof t.roundWeaknessDetected === 'function' ? t.roundWeaknessDetected(mistakesList) : t.roundWeaknessDefault;
            roundWeaknessInfo.classList.add('visible');
        } else {
            roundWeaknessInfo.classList.remove('visible');
        }
    }

    recordsManager.recordSession(wpm, cpm, parseFloat(accuracy), totalKeystrokes, errorsMade, isCompleted);
    resultsModal.classList.add('open');
}

function hideResultsModal() {
    resultsModal.classList.remove('open');
}

// ==========================================================================
// 12. MODALS & CONTROLLERS
// ==========================================================================
function setupModalListeners() {
    if (helpBtn) helpBtn.addEventListener('click', () => helpModal.classList.add('open'));
    if (closeModal) closeModal.addEventListener('click', () => helpModal.classList.remove('open'));

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            recordsManager.updateUI();
            settingsModal.classList.add('open');
        });
    }
    if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => settingsModal.classList.remove('open'));

    if (closeResultsModal) {
        closeResultsModal.addEventListener('click', () => {
            hideResultsModal();
            startNewRound(true);
        });
    }

    if (btnNextSentence) {
        btnNextSentence.addEventListener('click', () => {
            hideResultsModal();
            startNewRound(true, false);
        });
    }

    if (btnRepeatSentence) {
        btnRepeatSentence.addEventListener('click', () => {
            hideResultsModal();
            startNewRound(true, true);
        });
    }

    // Toggle widoczności klawiatury
    if (kbToggleBtn) {
        kbToggleBtn.addEventListener('click', () => {
            toggleVisualKeyboard(!isKeyboardEnabled);
        });
    }

    if (kbEnableToggle) {
        kbEnableToggle.addEventListener('change', () => {
            toggleVisualKeyboard(kbEnableToggle.checked);
        });
    }

    // Wybór geometrii klawiatury
    document.querySelectorAll('.layout-card').forEach(card => {
        card.addEventListener('click', () => {
            setKeyboardGeometry(card.dataset.geometry);
        });
    });

    // Przycisk autodetekcji USB (VIA/QMK)
    if (btnDetectVia) {
        btnDetectVia.addEventListener('click', detectViaKeyboard);
    }

    // Zmiana języka interfejsu (UI)
    if (uiLangSelect) {
        uiLangSelect.addEventListener('change', () => {
            uiLanguageSetting = uiLangSelect.value;
            localStorage.setItem('cheddar_ui_lang', uiLanguageSetting);
            applyUiLocalization();
            recordsManager.updateUI();
        });
    }

    [helpModal, settingsModal, resultsModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('open');
                    if (modal === resultsModal) startNewRound(true);
                }
            });
        }
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(btn.dataset.tab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    if (trainerToggle) {
        trainerToggle.checked = weaknessEngine.data.enabled;
        trainerToggle.addEventListener('change', () => {
            weaknessEngine.data.enabled = trainerToggle.checked;
            weaknessEngine.save();
        });
    }

    if (btnResetWeakness) {
        btnResetWeakness.addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz zresetować dane Trenera Błędów?')) {
                weaknessEngine.reset();
                recordsManager.renderWeaknesses();
            }
        });
    }

    if (btnResetAllStats) {
        btnResetAllStats.addEventListener('click', () => {
            if (confirm('Czy na pewno chcesz wyczyścić wszystkie statystyki i rekordy?')) {
                recordsManager.resetAll();
            }
        });
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            setTheme(card.dataset.theme);
        });
    });

    document.querySelectorAll('.btn-font-size').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.fontsize;
            document.body.classList.toggle('font-large', size === 'large');
            document.querySelectorAll('.btn-font-size').forEach(b => b.classList.toggle('active', b === btn));
            setTimeout(updateCursorPosition, 50);
        });
    });
}

// ==========================================================================
// 13. GLOBAL KEYBOARD SHORTCUTS
// ==========================================================================
document.addEventListener('keydown', (event) => {
    if (resultsModal && resultsModal.classList.contains('open')) {
        if (event.key === 'Enter') {
            event.preventDefault();
            hideResultsModal();
            startNewRound(true, false);
            return;
        }
        if (event.key === 'Tab') {
            event.preventDefault();
            hideResultsModal();
            startNewRound(true, true);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            hideResultsModal();
            startNewRound(true);
            return;
        }
    }

    if (helpModal && helpModal.classList.contains('open')) {
        if (event.key === 'Escape') {
            helpModal.classList.remove('open');
            return;
        }
    }

    if (settingsModal && settingsModal.classList.contains('open')) {
        if (event.key === 'Escape') {
            settingsModal.classList.remove('open');
            return;
        }
    }

    // ESC w trakcie pisania
    if (event.key === "Escape") {
        event.preventDefault();
        if (startTime) {
            showResultsModal(false);
        } else {
            perfectStreak = 0;
            startNewRound(true);
        }
        return;
    }

    if (document.activeElement !== userInput) {
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            if (event.key.length === 1 || event.key === 'Backspace') {
                userInput.focus();
            }
        }
    }
});

// Zmiana języka
if (langSelect) {
    langSelect.addEventListener('change', () => {
        currentLanguage = langSelect.value;
        localStorage.setItem('cheddar_lang', currentLanguage);
        perfectStreak = 0;
        applyUiLocalization();
        startNewRound(true);
    });
}

// Zmiana trybu
if (modeSelect) {
    modeSelect.addEventListener('change', () => {
        currentMode = modeSelect.value;
        localStorage.setItem('cheddar_mode', currentMode);
        startNewRound(true);
    });
}

// ==========================================================================
// 14. EASTER EGG & WINDOW RESIZE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.interactive-img');

    images.forEach(img => {
        img.addEventListener('click', function(e) {
            if (this.classList.contains('hidden-placeholder')) return;

            const rect = this.getBoundingClientRect();
            const distanceToBottom = window.innerHeight - rect.top + 300;

            const wrapperX = document.createElement('div');
            wrapperX.classList.add('fly-wrapper-x');
            wrapperX.style.left = rect.left + 'px';
            wrapperX.style.top = rect.top + 'px';
            wrapperX.style.width = rect.width + 'px';
            wrapperX.style.height = rect.height + 'px';

            const wrapperY = document.createElement('div');
            wrapperY.classList.add('fly-wrapper-y');
            wrapperY.style.setProperty('--fall-dist', `${distanceToBottom}px`);

            const clone = this.cloneNode();
            clone.className = 'fly-content';
            clone.style.margin = '0';

            wrapperY.appendChild(clone);
            wrapperX.appendChild(wrapperY);
            document.body.appendChild(wrapperX);

            this.classList.add('hidden-placeholder');

            wrapperX.addEventListener('animationend', () => {
                wrapperX.remove();
            });
        });
    });
});

window.addEventListener('resize', updateCursorPosition);

// Inicjalizacja
setupCategoryListeners();
setupModalListeners();
loadData();