const textDisplay = document.getElementById('TextDisplay');
const userInput = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');

let sentences = [];
let startTime = null;
let timerInterval = null;

async function loadData() {
    const response = await fetch('data.json');
    const data = await response.json();
    sentences = data.sentences;
    startNewRound(true);
}

function startNewRound(resetTimer = true) {
    if (resetTimer) {
        clearInterval(timerInterval);
        startTime = null;
        timerInterval = null;
        timerDisplay.innerText = "0:00";
    }
    userInput.value = "";
    renderText();
}

function renderText() {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    textDisplay.innerHTML = '';
    
    randomSentence.split('').forEach(char => {
        const span = document.createElement('span');
        span.innerText = char;
        span.classList.add('letter');
        if (char === ' ') {
            span.classList.add('space');
        }
        textDisplay.appendChild(span);
    });
}

userInput.addEventListener('input', () => {
    const arrayQuote = textDisplay.querySelectorAll('span');
    const arrayValue = userInput.value.split('');

    if (!startTime && userInput.value.length > 0) {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }

    let allCorrect = true;
    
    arrayQuote.forEach((span, index) => {
        const char = arrayValue[index];
        if (char == null) {
            span.classList.remove('correct', 'incorrect');
            allCorrect = false;
        } else if (char === span.innerText) {
            span.classList.add('correct');
            span.classList.remove('incorrect');
        } else {
            span.classList.add('incorrect');
            span.classList.remove('correct');
            allCorrect = false;
        }
    });

    if (allCorrect && arrayValue.length === arrayQuote.length) {
        setTimeout(() => startNewRound(false), 300);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        startNewRound(true);
    }
    if (e.key === "Enter") {
        startNewRound(false);
    }
});

function updateTimer() {
    if (!startTime) return;
    const diff = Math.floor((new Date() - startTime) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

loadData();