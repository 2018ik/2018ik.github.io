document.addEventListener("DOMContentLoaded", function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');
    const verseContent = document.getElementById('verseContent');
    const modeToggle = document.getElementById('modeToggle');
    const processBtn = document.getElementById('processButton');


    // Previous event listeners remain the same...
    dropZone.addEventListener('click', () => fileInput.click());
    processBtn.addEventListener('click', () => processInput());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handlePDFUpload(file);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handlePDFUpload(e.target.files[0]);
        }
    });

    async function handlePDFUpload(file) {
        // PDF handling remains the same...
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .reduce((text, item) => {
                        if (item.hasEOL) {
                            return text + item.str + '\n';
                        }
                        return text + item.str + ' ';
                    }, '');
                fullText += pageText;
            }
            
            textInput.value = fullText;
            processInput();
        } catch (error) {
            console.error('Error processing PDF:', error);
            output.textContent = 'Error processing PDF. Please try again.';
        }
    }

    function expandVerseRange(reference) {
        // Match the book, chapter, and verse parts
        const match = reference.match(/^((?:[123] )?[A-Za-z]+\.?\s+)(\d+):(\d+)(?:-(\d+))?$/);
        if (!match) return [reference];

        const [_, book, chapter, startVerse, endVerse] = match;
        if (!endVerse) return [reference]; // Single verse, no expansion needed

        // Create array of individual verse references
        const verses = [];
        for (let i = parseInt(startVerse); i <= parseInt(endVerse); i++) {
            verses.push(`${book}${chapter}:${i}`);
        }
        return verses;
    }

    function countTotalVerses(references) {
        return references.reduce((total, ref) => {
            const expandedVerses = expandVerseRange(ref);
            return total + expandedVerses.length;
        }, 0);
    }

    async function fetchVerses(references) {
        verseContent.innerHTML = '<div class="loading">Loading verses...</div>';
        
        // Expand all verse ranges and create a flat array of individual verse references
        const expandedRefs = references.flatMap(expandVerseRange);
        
        // Split into chunks of 30 verses
        const chunks = [];
        let currentChunk = [];
        let currentVerseCount = 0;
        
        for (const ref of expandedRefs) {
            const verseCount = expandVerseRange(ref).length;
            
            if (currentVerseCount + verseCount > 30) {
                chunks.push(currentChunk);
                currentChunk = [ref];
                currentVerseCount = verseCount;
            } else {
                currentChunk.push(ref);
                currentVerseCount += verseCount;
            }
        }
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }
        
        let allVerses = [];
        
        try {
            // Process each chunk
            for (const chunk of chunks) {
                const referenceString = chunk.join(', ');
                const response = await fetch(`https://silent-snow-4a5f.kang43.workers.dev/?q=${encodeURIComponent(referenceString)}`);
                const data = await response.json();
                if (data.verses) {
                    allVerses = allVerses.concat(data.verses);
                }
                
                // Add a small delay between requests to be nice to the API
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            if (allVerses.length === 0) {
                verseContent.innerHTML = '<div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px;">No verses found for the given references.</div>';
                return;
            }
            
            // Display verses
            verseContent.innerHTML = allVerses.map(verse => `
                <div class="verse-item">
                    <span class="verse-ref">${verse.ref}</span>
                    <div>${verse.text}</div>
                </div>
            `).join('');
            
        } catch (error) {
            verseContent.innerHTML = `
                <div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px;">
                    Error fetching verses: ${error.message}
                </div>`;
            console.error('Error:', error);
        }
    }
    async function processInput() {
        processBtn.disabled = true;
        const text = textInput.value;
        if (!text) {
            output.textContent = 'Please input text or upload a PDF.';
            return;
        }

        const references = extractReferences(text, modeToggle.checked);
        output.textContent = references.join('; ');
        
        // Fetch and display verse content
        await fetchVerses(references);
        processBtn.disabled = false;
    }

    // extractReferences function remains the same...
    function extractReferences(text, extractAll = false) {
        const references = [];
        let lastBook = '';
        let lastChapter = '';
        
        // Hardcode from Song of Songs since that book is formatted really weirdly
        const refRegex = /(?:(?:[123] )?(S\. S\.|\b[A-Za-z]+\.?)\s+\d+:\d+(?:-\d+)?)|(?:v\.\s+\d+)|(?:\d+:\d+)/g;
        
        // Always process Scripture Reading section
        const scriptureReadingMatch = text.match(/Scripture Reading:[\s\S]*?(?=\nI\.|$)/);
        if (scriptureReadingMatch) {
            const scriptureRefs = scriptureReadingMatch[0].match(refRegex);
            if (scriptureRefs) {
                processReferenceMatches(scriptureRefs);
            }
        }

        const lines = text.split('\n');
        for (let line of lines) {
            if (line.includes('Scripture Reading:')) continue;

            if (!extractAll && !line.includes('—')) continue;

            let lineText = line;
            if (!extractAll) {
                const parts = line.split('—');
                if (parts.length > 1) {
                    lineText = parts[1];
                } else {
                    continue;
                }
            }

            const matches = lineText.match(refRegex);
            if (matches) {
                processReferenceMatches(matches);
            }
        }

        function processReferenceMatches(matches) {
            matches.forEach(match => {
                if (match.startsWith('v.')) {
                    const verseNum = match.split('v.')[1].trim();
                    if (lastBook && lastChapter) {
                        references.push(`${lastBook} ${lastChapter}:${verseNum}`);
                    }
                } else if (match.match(/^\d+:\d+/)) {
                    if (lastBook) {
                        references.push(`${lastBook} ${match}`);
                    }
                } else {
                    references.push(match);
                    const bookMatch = match.match(/(?:[123] )?[A-Za-z]+/);
                    if (bookMatch) {
                        lastBook = bookMatch[0];
                        const chapterMatch = match.match(/\d+(?=:)/);
                        if (chapterMatch) {
                            lastChapter = chapterMatch[0];
                        }
                    }
                }
            });
        }

        return references.filter((ref, index, self) => 
            self.indexOf(ref) === index && ref.trim() !== ''
        );
    }
});