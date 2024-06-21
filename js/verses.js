document.getElementById('fetchButton').addEventListener('click', () => {
    const inputString = document.getElementById('stringInput').value;
    fetchVerses(inputString);
});

document.getElementById('stringInput').addEventListener('keypress', (event) => {
    if (event.code === 'Enter' || event.key === 'Enter') {
        const inputString = document.getElementById('stringInput').value;
        fetchVerses(inputString);
    }
});

let verses = [];
let currentVerseIndex = 0;
let currentWordIndex = 0;
let currentStage = 0;
let blankVerse = [];

async function fetchVerses(inputString) {
    const response = await fetch(`https://api.lsm.org/recver.php?String=${encodeURIComponent(inputString)}&Out=json`);
    const data = await response.json();
    verses = data.verses;
    currentVerseIndex = 0;
    currentStage = 1;
    startTypingExercise();
}

function startTypingExercise() {
    if (currentStage > 3) {
        currentVerseIndex++;
        if (currentVerseIndex >= verses.length) {
            displayCompletionMessage();
            return;
        }
        currentStage = 1;
    }
    const verse = verses[currentVerseIndex];
    displayVerse(verse.text, verse.ref, currentStage);
    setupTyping(verse.text);
}

function displayVerse(verse, ref, stage) {
    currentWordIndex = 0;
    let words = verse.split(' ');
    if (stage == 1) {
        blankVerse = words;
    }
    else if (stage === 2) {
        blankVerse = words.map(word => Math.random() < 0.5 ? '____' : word);
    } else if (stage === 3) {
        blankVerse = words.map(() => '____');
    }
    const formattedWords = blankVerse.map((word, index) => {
        if (index === currentWordIndex) {
            return `<span class="current">${word}</span>`;
        }
        return word;
    });
    document.getElementById('verseText').innerHTML = formattedWords.join(' ');
    document.getElementById('stage').innerText = `Stage: ${currentStage}, Verse: ${ref}`;
    document.getElementById('progress').innerText = `Progress: ${currentWordIndex}/${words.length}`;
}

function updateVerse(verse) {
    words = verse.split(' ');
    const formattedWords = blankVerse.map((word, index) => {
        if (index === currentWordIndex) {
            return `<span class="current">${word}</span>`;
        } else if (index < currentWordIndex) {
            return words[index];
        }
        return word;
    });
    document.getElementById('verseText').innerHTML = formattedWords.join(' ');
}

function setupTyping(verse) {
    currentWordIndex = 0;
    document.getElementById('typingExercise').style.display = 'block';
    document.getElementById('typingInput').value = '';
    document.getElementById('typingInput').focus();
    document.getElementById('typingInput').removeEventListener('input', handleTypingInput); // Remove previous event listener
    document.getElementById('typingInput').addEventListener('input', handleTypingInput);
}

function handleTypingInput() {
    if (currentVerseIndex >= verses.length) return;
    const verse = verses[currentVerseIndex].text;
    checkInput(verse);
}

function checkInput(verse) {
    const input = document.getElementById('typingInput').value.trim();
    const words = verse.split(' ');
    const letter = words[currentWordIndex].replace(/[^a-zA-Z]/g, '')[0]
    let correct = letter === input;
    if (!document.getElementById('caseSensitiveCheckbox').checked) {
        correct = letter.toLowerCase() === input.toLowerCase();
    }
    if (correct) {
        currentWordIndex++;
        document.getElementById('typingInput').value = '';
        document.getElementById('progress').innerText = `Progress: ${currentWordIndex}/${words.length}`;
        if (currentWordIndex >= words.length) {
            // Done with verse for particular stage
            currentStage++;
            startTypingExercise();
        } else {
            updateVerse(verse);
        }
    }
}

function displayCompletionMessage() {
    document.getElementById('message').innerHTML = '<span class="current">Congrats!</span>';
    document.getElementById('typingExercise').style.display = 'none';
    document.getElementById('progress').innerText = '';
    document.getElementById('stringInput').value = '';
    setTimeout(() => {
        document.getElementById('message').innerHTML = 'Verse Memorizer';
    }, 3000);
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    var modal = document.getElementById("settingsModal");
    if (event.target == modal) {
        modal.style.display = "";
    }
}

function closeModal() {
    var modal = document.getElementById("settingsModal");
    modal.style.display = "";
}