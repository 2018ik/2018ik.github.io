document.addEventListener("DOMContentLoaded", function() {
    let sentences = [];
    let blankIndices = [];
    let currentSentenceIndex = -1;
    let previousSentenceIndex = -1;
    let revealed = false;
    let score = 0;
    let rounds = 0;
    let hardLimit = 50;
    let bannedWords = ["—", "-", "a", "an", "and", "are", "as", "at", "be", "being", "but", 
    "by", "for", "from", "having", "have", "if", "in", "is", "it", "its", "of", "on", "or", "than", "that", 
    "the", "their", "them", "there", "this", "to", "we", "what", "with"];

    function loadSentences() {
        var settingsText = document.getElementById("settingsInput").value;
        sentences = settingsText
            .split('\n')
            .map(sentence => sentence.trim().replace(/(\S)—(\S)/g, '$1 — $2')) // treat emdash as its own word
            .filter(sentence => sentence.length > 0);
        if (sentences.length == 0) {
            sentences = ["I. This is an example sentence",
                        "A. This is another example sentence",
                        "B. This is yet another example sentence",
                        "II. This is once again another example sentence",
                        "A. This is yet again another example sentence",
                        "B. This",
                        "C. Another one",
                        "D. Thanks",
                        "III. Example"]
        }
        blankIndices = [];
        currentSentenceIndex = -1;
        previousSentenceIndex = -1;
        revealed = false;
        score = 0;
        rounds = 0;
        showNextSentence();
    }
    // Function to show the next sentence
    function showNextSentence() {
        rounds += 1;
        document.getElementById('guess').value = "";
        if (sentences.length == 1) {
            currentSentenceIndex = 0
        } else {
            while (currentSentenceIndex === previousSentenceIndex) {
                currentSentenceIndex = Math.floor(Math.random() * sentences.length);
            }
        }
        blankIndices = [];
        let sentence = sentences[currentSentenceIndex]
        let words = sentence.split(/\s+/);
        let blanksCount = Math.max(1, Math.floor(words.length / 4))
        console.log(words);
        iterations = 0;
        while (blankIndices.length < blanksCount) {
            if (iterations > hardLimit) {
                console.log("Hit hard limit, breaking out of loop!")
                break;
            }
            let index = words.length == 1 ? 0 : Math.floor(1 + Math.random() * (words.length - 1));
            if (!blankIndices.includes(index) && !bannedWords.includes(words[index].toLowerCase())) {
                blankIndices.push(index);
            }
            iterations += 1;
        }
        let maskedSentence = '';
        for (let i = 0; i < words.length; i++) {
            if (blankIndices.includes(i)) {
                maskedSentence += '___';
                if (!/^[a-zA-Z]+$/.test(words[i].charAt(words[i].length-1))) {
                    maskedSentence += words[i].charAt(words[i].length-1);
                }
                maskedSentence += ' ';
            } else {
                maskedSentence += words[i] + ' ';
            }
        }
        document.getElementById('sentence').innerText = maskedSentence;
        if (currentSentenceIndex > 0) {
            document.getElementById('prevSentence').innerText = sentences[currentSentenceIndex-1];
        } else {
            document.getElementById('prevSentence').innerText = "";
        }
        if (currentSentenceIndex < sentences.length-1) {
            document.getElementById('nextSentence').innerText = sentences[currentSentenceIndex+1];
        } else {
            document.getElementById('nextSentence').innerText = "";
        }
        revealed = false;
    }

    // Function to reveal words
    function revealWords() {
        if (!revealed) {
            let guesses = document.getElementById('guess').value.trim().split(' ');
            let sentence = sentences[currentSentenceIndex];
            let words = sentence.split(' ');
            let unmaskedSentence = '';
            let j = 0;
            let win = true;
            const caseSensitive = document.getElementById('caseSensitiveCheckbox').checked;
            for (let i = 0; i < words.length; i++) {
                if (blankIndices.includes(i)) {
                    if (j >= guesses.length) {
                        win = false;
                        unmaskedSentence += "<strong id='wrong'>" + words[i] + "</strong> ";
                        j += 1;
                        continue;
                    }
                    guessWord = caseSensitive ? guesses[j].replace(/[^a-zA-Z]/g, '') : guesses[j].replace(/[^a-zA-Z]/g, '').toLowerCase();
                    correctWord = caseSensitive ? words[i].replace(/[^a-zA-Z]/g, '') : words[i].replace(/[^a-zA-Z]/g, '').toLowerCase();
                    if (guessWord === correctWord) {
                        unmaskedSentence += "<strong id='right'>" + words[i] + "</strong> ";
                    } else {
                        win = false;
                        unmaskedSentence += "<strong id='wrong'>" + words[i] + "</strong> ";
                    }
                    j += 1;
                } else {
                    unmaskedSentence += words[i] + ' ';
                }
            }
            if (win === true) {
                score += 1;
            }
            document.getElementById('score').innerText = score + "/" + rounds;
            document.getElementById('sentence').innerHTML = unmaskedSentence;
            revealed = true;
            previousSentenceIndex = currentSentenceIndex;
        } else {
            showNextSentence();
        }
    }
    // Function to check if an element or any of its parents has the 'site-header' class
    function hasParentWithClass(element, className) {
        while (element) {
            if (element.classList && element.classList.contains(className)) {
                return true;
            }
            element = element.parentElement;
        }
        return false;
    }

    window.onload = function() {
        // Set placeholder text with line breaks
        document.getElementById('settingsInput').placeholder = 
            "I. This is an example sentence\n" +
            "A. This is another example sentence\n" +
            "B. This is yet another example sentence\n" +
            "II. This is once again another example sentence\n" +
            "A. This is yet again another example sentence\n" +
            "B. This\n" +
            "C. Another one\n" +
            "D. Thanks\n" +
            "III. Example";
        loadSentences();
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space') {
                const guessInput = document.getElementById('guess');
                if (!guessInput.matches(':focus')) { 
                    revealWords();
                }
            }
        });
        document.addEventListener('click', function(event) {
            const clickedElement = event.target;
            if (hasParentWithClass(clickedElement, 'site-header') 
                || ['guess', 'settings-button'].includes(clickedElement.id)
                || document.getElementById("settingsModal").style.display !== "") {
                return; 
            }
            revealWords();
        });
        document.getElementById('guess').addEventListener('keydown', function(event) {
            if ((event.code === 'Enter' || event.key === 'Enter') && document.getElementById("settingsModal").style.display === "") {
                revealWords();
            }
        });
    };
    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        var modal = document.getElementById("settingsModal");
        var modal_close = document.getElementById("modal-close");
        if (event.target == modal || event.target == modal_close) {
            modal.style.display = "";
            loadSentences();
        }
    }
});

// function closeModal() {
//     var modal = document.getElementById("settingsModal");
//     modal.style.display = "";
//     loadSentences();
// }