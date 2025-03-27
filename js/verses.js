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

const BLANK = '____';
const WRONG = 'wrong';
let verses = [];
let currentVerseIndex = 0;
let currentWordIndex = 0;
let currentStage = 0;
let currentAttempts = 0;
let blankVerse = [];
let totalStages = 3;
let maxAttempts = 3;
let totalKeystrokes = 0;
let totalWords = 0;
let skipFirstStage = false;

async function fetchVerses(inputString) {
    const response = await fetch(`https://silent-snow-4a5f.kang43.workers.dev/?q=${encodeURIComponent(inputString)}`);
    const data = await response.json();
    verses = data.verses;
    totalKeystrokes = 0;
    totalWords = 0;
    if (verses.length === 0 || verses[0]['urlpfx'] === '') {
        document.getElementById('message').innerHTML =`<span id='errorText'>Invalid reference!</span>`;
        setTimeout(() => {
            document.getElementById('message').innerHTML = 'Verse Memorizer';
        }, 3000);
    } else {
        currentVerseIndex = 0;
        currentStage = 1;
        startTypingExercise();
    }
}

function startTypingExercise() {
    const verseObj = verses[currentVerseIndex];
    displayVerse(verseObj.text, verseObj.ref, currentStage);
    setupTyping(verseObj.text);
}

function nextStage() {
    currentStage++;
    if (currentStage > totalStages) {
        currentVerseIndex++;
        if (currentVerseIndex >= verses.length) {
            displayCompletionMessage();
            return;
        }
        currentStage = 1;
    }
    startTypingExercise();
}
function displayVerse(verse, ref, stage) {
    currentWordIndex = 0;
    let words = verse.split(' ');
    console.log(skipFirstStage, stage, totalStages)
    if (stage >= totalStages) {
        blankVerse = words.map(() => BLANK);
    }
    else if (stage == 1 && !skipFirstStage) {
        blankVerse = words;
    } else {
        blankVerse = words.map(word => Math.random() < (stage+Number(skipFirstStage)-1)/totalStages ? BLANK : word);
    }
    const formattedWords = blankVerse.map((word) => {
        return word;
    });
    document.getElementById('verseText').innerHTML = formattedWords.join(' ');
    document.getElementById('stage').innerText = `Stage: ${currentStage}/${totalStages}, Verse: ${ref}`;
    document.getElementById('progress').innerText = `Progress: 0/${words.length}`;
}

function updateVerse(verse, wrong) {
    totalWords += 1;
    words = verse.split(' ');
    const formattedWords = blankVerse.map((word, index) => {
        if (index <= currentWordIndex) {
            if (word === WRONG) {
                return `<span class="wrongWord">${words[index]}</span>`;
            }
            return `<span class="seenWord">${words[index]}</span>`;
        }
        return word;
    });
    currentWordIndex++;
    document.getElementById('verseText').innerHTML = formattedWords.join(' ');
    document.getElementById('typingInput').value = '';
    document.getElementById('progress').innerText = `Progress: ${currentWordIndex}/${words.length}`;
}

function setupTyping() {
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
    if (currentWordIndex >= words.length) {
        console.log("Received invalid input: " + currentWordIndex);
        return;
    }
    totalKeystrokes += 1;
    const letter = words[currentWordIndex].replace(/[^a-zA-Z]/g, '')[0]
    let correct = letter === input;
    if (!document.getElementById('caseSensitiveCheckbox').checked) {
        correct = letter.toLowerCase() === input.toLowerCase();
    }
    if (correct) {
        updateVerse(verse);
        if (currentWordIndex >= words.length) {
            // Done with verse for particular stage
            setTimeout(()=> nextStage(), 1000);
        } else {
            currentAttempts = 0;
        }
    } else {
        currentAttempts += 1
        if (currentAttempts >= maxAttempts) {
            blankVerse[currentWordIndex] = WRONG;
            updateVerse(verse);
            currentAttempts = 0;
            if (currentWordIndex >= words.length) {
                // Done with verse for particular stage
                setTimeout(()=> nextStage(), 1000);
            }
        }
        // clear field
        document.getElementById('typingInput').value = '';
    }
}

function displayCompletionMessage() {
    console.log(totalWords, totalKeystrokes);
    document.getElementById('message').innerHTML = `Congrats! Your accuracy was: ${Math.floor(totalWords*100/totalKeystrokes)}%`;
    document.getElementById('typingExercise').style.display = 'none';
    document.getElementById('progress').innerText = '';
    document.getElementById('stringInput').value = '';
    setTimeout(() => {
        document.getElementById('message').innerHTML = 'Verse Memorizer';
    }, 5000);
}

//Settings

// Close the modal when clicking outside of it
window.onclick = function(event) {
    var modal = document.getElementById("settingsModal");
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    var modal = document.getElementById("settingsModal");
    modal.style.display = "";
    // apply settings
    totalStages = document.getElementById("stagesInput").value;
    maxAttempts = document.getElementById("attemptsInput").value;
    skipFirstStage = document.getElementById("skipFirstStageCheckbox").checked;
}