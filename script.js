const textContent = document.getElementById('TextContent');
const progressBar = document.getElementById('ProgressBar');
const userInput = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');
const langSelect = document.getElementById('langSelect');
const nightModeToggle = document.getElementById('nightModeInput');

nightModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('night-mode', nightModeToggle.checked);
});

let startTime = null;
let timerInterval = null;
let previousSentence = "";

let totalKeystrokes = 0;
let errorsMade = 0;
let previousInputLength = 0;

let allData = {};
let currentLanguageData = null;
let perfectStreak = 0;
let currentSentenceErrors = 0;

async function loadData() {
    const response = await fetch('data.json');
    allData = await response.json();
    updateLanguage();
}

const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeModal = document.getElementById('closeModal');

helpBtn.addEventListener('click', () => {
    helpModal.classList.add('open');
});

closeModal.addEventListener('click', () => {
    helpModal.classList.remove('open');
});

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.remove('open');
    }
});

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

document.addEventListener('keydown', (event) => {
    if (helpModal.classList.contains('open')) {
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

function updateLanguage() {
    currentLanguageData = allData[langSelect.value];
    perfectStreak = 0;
    startNewRound(true);
}

langSelect.addEventListener('change', updateLanguage);

function startNewRound(resetTimer = true) {
    if (resetTimer) {
        clearInterval(timerInterval);
        startTime = null;
        timerInterval = null;
        timerDisplay.innerText = "0:00";
        totalKeystrokes = 0;
        errorsMade = 0;
    }
    userInput.value = "";
    previousInputLength = 0;
    currentSentenceErrors = 0;
    updateProgressBar(0);
    renderText();
}

function updateProgressBar(percent) {
    progressBar.style.width = percent + "%";
}

function renderText() {
    if (!currentLanguageData) return;

    let pool = perfectStreak >= 1 ? currentLanguageData.hard : currentLanguageData.easy;
    let randomSentence;
    
    do {
        randomSentence = pool[Math.floor(Math.random() * pool.length)];
    } while (randomSentence === previousSentence && pool.length > 1);
    
    previousSentence = randomSentence;
    textContent.innerHTML = '';
    
    const cursorDiv = document.createElement('div');
    cursorDiv.id = 'cursor';
    textContent.appendChild(cursorDiv);

    const words = randomSentence.split(' ');
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
    progressBar.classList.remove('error-shake');
    if (cursor) cursor.classList.remove('error-shake');
    
    void progressBar.offsetWidth;
    if (cursor) void cursor.offsetWidth;

    progressBar.classList.add('error-shake');
    if (cursor) cursor.classList.add('error-shake');
}

userInput.addEventListener('input', () => {
    const arrayQuote = textContent.querySelectorAll('span.letter');
    const arrayValue = userInput.value.split('');
    const currentLength = userInput.value.length;

    if (!startTime && currentLength > 0) {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }

    if (currentLength > previousInputLength) {
        totalKeystrokes++;
        const charIndex = currentLength - 1;
        if (arrayQuote[charIndex] && arrayValue[charIndex] !== arrayQuote[charIndex].textContent) {
            errorsMade++;
            currentSentenceErrors++;
            triggerErrorAnimation();
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

    if (allCorrect && arrayValue.length === arrayQuote.length) {
        if (currentSentenceErrors === 0) {
            perfectStreak++;
        } else {
            perfectStreak = 0;
        }
        setTimeout(() => startNewRound(false), 300);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if (helpModal.classList.contains('open')) {
            helpModal.classList.remove('open');
            return;
        }
        if (startTime) {
            let accuracy = 100;
            let cpm = 0;
            
            if (totalKeystrokes > 0) {
                accuracy = Math.max(0, ((totalKeystrokes - errorsMade) / totalKeystrokes) * 100).toFixed(2);
            }
            
            const timeInSeconds = (new Date() - startTime) / 1000;
            const timeInMinutes = timeInSeconds / 60;
            
            if (timeInMinutes > 0) {
                cpm = Math.round(totalKeystrokes / timeInMinutes);
            }

            alert(`Time: ${timerDisplay.innerText}\nAccuracy: ${accuracy}%\nText Length: ${totalKeystrokes} characters\nErrors: ${errorsMade}\nCPM: ${cpm} characters/min`);
        }
        perfectStreak = 0;
        startNewRound(true);
    }
});

window.addEventListener('resize', updateCursorPosition);

function updateTimer() {
    if (!startTime) return;
    const diff = Math.floor((new Date() - startTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

loadData();