/**
 * CHEDDAR - Intelligent Typing & Fact Learning
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

// ==========================================================================
// STATE MANAGEMENT
// ==========================================================================
let allData = {};
let currentLanguage = 'polish';
let currentMode = 'endless'; // 'endless' or 'single'
let selectedCategories = new Set(['all', 'nature', 'science', 'human', 'history', 'language']);
let currentSentenceObj = null;
let previousSentenceText = "";

let startTime = null;
let timerInterval = null;
let totalKeystrokes = 0;
let errorsMade = 0;
let previousInputLength = 0;
let perfectStreak = 0;
let currentSentenceErrors = 0;
let roundMistakes = new Set();

// ==========================================================================
// 1. SMART WEAKNESS ENGINE
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
// 2. STATS & RECORDS MANAGER
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
            weaknessChips.innerHTML = '<span class="no-weakness">Brak zarejestrowanych słabych punktów. Pisz dalej!</span>';
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
// 3. THEME & NIGHT MODE
// ==========================================================================
function initNightMode() {
    const savedNight = localStorage.getItem('cheddar_night_mode');
    const savedTheme = localStorage.getItem('cheddar_theme') || (savedNight === 'true' ? 'roquefort-night' : 'cheddar-classic');
    setTheme(savedTheme);
}

function setTheme(themeName) {
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === themeName);
    });
    if (themeName === 'roquefort-night') {
        document.body.classList.add('night-mode');
        localStorage.setItem('cheddar_night_mode', 'true');
    } else {
        document.body.classList.remove('night-mode');
        localStorage.setItem('cheddar_night_mode', 'false');
    }
    localStorage.setItem('cheddar_theme', themeName);
}

// ==========================================================================
// 4. DATA LOADING & INITIALIZATION
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

        initNightMode();
        updateCategoryChipsUI();
        recordsManager.updateUI();
        startNewRound(true);
    } catch (e) {
        console.error('Error loading data.json:', e);
    }
}

// ==========================================================================
// 5. CATEGORY MULTI-SELECT FILTERING
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
// 6. ROUND & TYPING CORE LOGIC
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
    if (hudStreak) hudStreak.innerText = perfectStreak;

    renderText(forceRepeat);
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
// 7. REAL-TIME INPUT LISTENER & WPM
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

    // Ukończenie pojedynczego zdania
    if (allCorrect && arrayValue.length === arrayQuote.length) {
        if (currentSentenceErrors === 0) {
            perfectStreak++;
        } else {
            perfectStreak = 0;
        }

        if (hudStreak) hudStreak.innerText = perfectStreak;

        if (currentMode === 'single') {
            // W trybie pojedynczym natychmiast pokazujemy ekran wyników
            setTimeout(() => {
                showResultsModal(true);
            }, 220);
        } else {
            // W trybie nieskończonym (endless) płynnie przechodzimy do następnego zdania
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
// 8. RESULTS MODAL LOGIC
// ==========================================================================
function showResultsModal(isCompleted = false) {
    clearInterval(timerInterval);
    const { wpm, cpm } = calculateWpmAndCpm();

    let accuracy = 100;
    if (totalKeystrokes > 0) {
        accuracy = Math.max(0, ((totalKeystrokes - errorsMade) / totalKeystrokes) * 100).toFixed(1);
    }

    if (resWpm) resWpm.innerText = wpm;
    if (resCpm) resCpm.innerText = cpm;
    if (resAccuracy) resAccuracy.innerText = `${accuracy}%`;
    if (resErrors) resErrors.innerText = `${errorsMade} ${errorsMade === 1 ? 'błąd' : 'błędów'}`;
    if (resTime) resTime.innerText = timerDisplay.innerText;
    if (resChars) resChars.innerText = `${totalKeystrokes} znaków`;

    if (roundWeaknessInfo && roundWeaknessText) {
        if (roundMistakes.size > 0) {
            const mistakesList = Array.from(roundMistakes).slice(0, 4).map(m => `"${m}"`).join(', ');
            roundWeaknessText.innerText = `Wykryto trudniejsze momenty: ${mistakesList}. Trener uwzględni je w kolejnych zdaniach.`;
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
// 9. MODALS & CONTROLLERS
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
// 10. GLOBAL KEYBOARD SHORTCUTS
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
// 11. EASTER EGG & WINDOW RESIZE
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