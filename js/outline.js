document.addEventListener("DOMContentLoaded", function() {
    let sentences = [];
    let blankIndices = [];
    let currentSentenceIndex = -1;
    let previousSentenceIndex = -1;
    let revealed = false;
    let score = 0;
    let rounds = 0;
    let hardLimit = 50;
    let isOrderedMode = false;
    let completedSentences = [];
    let bannedWords = [
        "-", "a", "about", "after", "all", "also", "among", "an", "any", "also", "and", "are",
        "as", "at", "be", "because", "before", "being", "between", "both", "but", "by",
        "can", "could", "did", "do", "does", "for", "from", "had", "has", "have",
        "having", "He", "he", "her", "him", "his", "how", "if", "in", "into",
        "is", "it", "its", "just", "like", "may", "merely", "more", "most", "no",
        "not", "of", "on", "only", "or", "other", "our", "out", "over", "she",
        "should", "since", "so", "such", "than", "that", "the", "their", "them",
        "then", "there", "these", "they", "this", "through", "to", "under",
        "until", "us", "very", "was", "we", "were", "what", "when", "where",
        "which", "while", "who", "whom", "why", "will", "with", "within",
        "would", "yes", "yet", "you", "your", "—"
      ]
      
    function loadSentences() {
        var settingsText = document.getElementById("settingsInput").value;
        sentences = settingsText
            .split('\n')
            .map(sentence => sentence.trim().replace(/(\S)—(\S)/g, '$1 — $2')) // treat emdash as its own word
            .filter(sentence => sentence.length > 0);
        if (sentences.length == 0) {
            resetOutline();
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
        completedSentences = [];
        showNextSentence();
    }
    
    // Function to toggle ordered mode
    function toggleOrderedMode() {
        isOrderedMode = !isOrderedMode;
        document.getElementById('orderedModeBtn').classList.toggle('active', isOrderedMode);
        
        // Reset the game when toggling modes
        blankIndices = [];
        currentSentenceIndex = -1;
        previousSentenceIndex = -1;
        revealed = false;
        score = 0;
        rounds = 0;
        completedSentences = [];
        
        document.getElementById('score').innerText = score + "/" + rounds;
        showNextSentence();
    }
    
    // Function to update display for ordered mode
    function updateOrderedModeDisplay() {
        if (isOrderedMode) {
            // In ordered mode, display all completed sentences
            document.getElementById('prevSentence').innerHTML = completedSentences.join('<br><br>');
            document.getElementById('nextSentence').innerText = "";
        } else {
            // In random mode, show previous and next sentence for context
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
        }
    }
    
    // Function to show the next sentence
    function showNextSentence() {
        rounds += 1;
        document.getElementById('guess').value = "";
        
        if (isOrderedMode) {
            // In ordered mode, proceed sequentially
            currentSentenceIndex += 1;
            
            // Reset to beginning if we've reached the end
            if (currentSentenceIndex >= sentences.length) {
                currentSentenceIndex = 0;
                completedSentences = [];
            }
        } else {
            // In random mode, select randomly
            if (sentences.length == 1) {
                currentSentenceIndex = 0;
            } else {
                while (currentSentenceIndex === previousSentenceIndex) {
                    currentSentenceIndex = Math.floor(Math.random() * sentences.length);
                }
            }
        }
        
        blankIndices = [];
        let sentence = sentences[currentSentenceIndex];
        let words = sentence.split(/\s+/);
        let blanksCount = Math.max(1, Math.floor(words.length / 4));
        let iterations = 0;
        
        while (blankIndices.length < blanksCount) {
            if (iterations > hardLimit) {
                console.log("Hit hard limit, breaking out of loop!");
                break;
            }
            let index = words.length == 1 ? 0 : Math.floor(1 + Math.random() * (words.length - 1));
            if (!blankIndices.includes(index) && 
            !/[^a-zA-Z]/.test(words[index]) &&
            !bannedWords.includes(words[index].replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').toLowerCase())) {
                blankIndices.push(index);
            }
            iterations += 1;
        }
        
        let maskedSentence = '';
        for (let i = 0; i < words.length; i++) {
            if (blankIndices.includes(i)) {
                let pointer = 0;
                while (pointer < words[i].length && !/^[a-zA-Z']+$/.test(words[i].charAt(pointer))) { // Check for misc. chars like [("' that precede a word
                    maskedSentence += words[i].charAt(pointer);
                    pointer += 1;
                }
                while (pointer < words[i].length && /^[a-zA-Z']+$/.test(words[i].charAt(pointer))) { // Check for misc. chars like [("' that proceed a word
                    maskedSentence += "_" 
                    pointer += 1;
                }
                while (pointer < words[i].length && !/^[a-zA-Z']+$/.test(words[i].charAt(pointer))) { // Check for misc. chars like [("' that proceed a word
                    maskedSentence += words[i].charAt(pointer);
                    pointer += 1; 
                }
                maskedSentence += ' ';
            } else {
                maskedSentence += words[i] + ' ';
            }
        }
        
        document.getElementById('sentence').innerText = maskedSentence;
        updateOrderedModeDisplay();
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
            
            // For ordered mode, add the completed sentence to the list
            if (isOrderedMode) {
                completedSentences.push(document.getElementById('sentence').innerHTML);
            }
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
        // Create ordered mode button
        const orderedModeBtn = document.createElement('button');
        orderedModeBtn.id = 'orderedModeBtn';
        orderedModeBtn.textContent = 'Ordered Mode';
        orderedModeBtn.addEventListener('click', toggleOrderedMode);
        
        // Insert it next to settings button
        const settingsBtn = document.getElementById('settings-button');
        settingsBtn.parentNode.insertBefore(orderedModeBtn, settingsBtn.nextSibling);
        
        // Set placeholder text with line breaks
        loadSentences();
        
        // Space key press to reveal words
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && !event.repeat) {
                const guessInput = document.getElementById('guess');
                const settingsModal = document.getElementById('settingsModal');
                
                // Only handle space if not focused in the input field and modal not visible
                if (!guessInput.matches(':focus') && settingsModal.style.display === "") { 
                    event.preventDefault(); // Prevent default space behavior
                    revealWords();
                }
            }
        });

        document.addEventListener('click', function(event) {
            const clickedElement = event.target;
            if (hasParentWithClass(clickedElement, 'site-header') 
                || ['guess', 'settings-button', 'orderedModeBtn'].includes(clickedElement.id)
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

function resetOutline() {
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
    document.getElementById('settingsInput').value = "";
}