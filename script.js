const textDisplay = document.getElementById('TextDisplay');
const userInput = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');

let sentences = [];
let startTime = null;
let timerInterval = null;
let previousSentence = "";

let totalKeystrokes = 0;
let errorsMade = 0;
let previousInputLength = 0;

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
        totalKeystrokes = 0;
        errorsMade = 0;
    }
    userInput.value = "";
    previousInputLength = 0;
    renderText();
}

function renderText() {
    let randomSentence;
    do {
        randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    } while (randomSentence === previousSentence && sentences.length > 1);
    
    previousSentence = randomSentence;
    textDisplay.innerHTML = '';
    
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
        
        textDisplay.appendChild(wordDiv);
    });
}

userInput.addEventListener('input', () => {
    const arrayQuote = textDisplay.querySelectorAll('span.letter');
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

    if (allCorrect && arrayValue.length === arrayQuote.length) {
        setTimeout(() => startNewRound(false), 300);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if (startTime) {
            let accuracy = 100;
            if (totalKeystrokes > 0) {
                accuracy = Math.max(0, ((totalKeystrokes - errorsMade) / totalKeystrokes) * 100).toFixed(2);
            }
            alert(`Czas pisania: ${timerDisplay.innerText}\nDokładność: ${accuracy}%`);
        }
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