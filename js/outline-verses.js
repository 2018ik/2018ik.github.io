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
    /**
     * Parses a PDF file and extracts its text content
     * @param {File} file - PDF file object
     * @returns {Promise<string>} - Promise that resolves to the text content
     */
    async function handlePDFUpload(file) {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        const textItems = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageLines = textContent.items
            .map(item => item.str)
            .join('\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);
        textItems.push(...pageLines);
        }

        // Expanded regex: Roman numerals (upper/lower), letters (upper/lower), numbers
        const regex = /^(\b[IVXLCDMivxlcdm]+\b|[A-Za-z]|\d)\./;

        const result = [];
        let currentBlock = '';

        for (const line of textItems) {
        if (regex.test(line)) {
            if (currentBlock.trim()) {
            result.push(currentBlock.trim());
            }
            currentBlock = line;
            } else {
                currentBlock += ' ' + line;
            }
        }

        if (currentBlock.trim()) {
        result.push(currentBlock.trim());
        }

        const textarea = document.getElementById('textInput');
        if (textarea) {
        textarea.value = result.join('\n'); // Separate items with double line breaks
        }
        processInput();

        return result;
    }

    async function sendLsmRequest(referenceString) {
        const ref = referenceString;

        if (!ref) {
        return new Response("Missing 'q' parameter", { status: 400 });
        }

        // it literally takes just as much effort to decode this as it does to just apply for your own LSM API key so don't do it bro
        const prefix = 'web_'

        const hex = n => n.toString(16).padStart(2, '0');

        const section1 = [0xfb, 0x27, 0x30, 0x18].map(hex).join('');
        const section2 = [0x6f, 0xb9].map(hex).join('');
        const section3 = [0x45, 0xd6].map(hex).join('');
        const section4 = [0x87, 0xb4].map(hex).join('');
        const section5 = [0x6b, 0xbc, 0x1d, 0x77, 0x03, 0xa3].map(hex).join('');

        const key = [
            section1,
            section2,
            section3,
            section4,
            section5
        ].join('-');
        const API_APPID = "com.myapp.1";
        const API_TOKEN = prefix + key;


        const apiUrl = `https://api.lsm.org/recver/txo.php?String=${encodeURIComponent(ref)}&Out=json`;
        const auth = "Basic " + btoa(`${API_APPID}:${API_TOKEN}`);

        const response = await fetch(apiUrl, {
        headers: {
            Authorization: auth
        }
        });

        const body = await response.text();

        return new Response(body, {
        status: response.status,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": response.headers.get("content-type") || "text/plain"
        }
        });
    }

    async function fetchVerses(references) {
        verseContent.innerHTML = '<div class="loading">Loading verses...</div>';
        const progressBar = document.getElementById('progressBar');
        let allVerses = [];
        console.log(references);
        
        try {
            // Process each chunk
            for (let i = 0; i < references.length; i++) {
                const chunk = references[i];

                if (chunk.length === 0) {
                    allVerses.push([]);
                } else {
                    const referenceString = chunk.join(', ');
                    const response = await sendLsmRequest(referenceString);
                    const data = await response.json();
                    if (data.verses) {
                        allVerses.push(data.verses);
                    }
                }

                // Update progress bar
                const progress = ((i + 1) / references.length) * 100;
                progressBar.style.width = `${progress}%`;

                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (allVerses.length === 0) {
                verseContent.innerHTML = '<div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px;">No verses found for the given references.</div>';
                return;
            }
            // Display outline points with verses
            let html = '';
            const text_array = textInput.value.split('\n').map(line => line.trim()).filter(line => line !== '');
            console.log(text_array)
            console.log(allVerses)
            for (let i = 0; i < allVerses.length; i++) {
                const groupClass = `outline-group-${i % 5}`;
                const groupId = `group-${i}`;

                html += `<div class="outline-point ${groupClass}" data-target="${groupId}">${text_array[i]}</div>`;
                html += `<div class="verse-group ${groupClass}" id="${groupId}">`;
                for (const verse of allVerses[i]) {
                    html += `
                        <div class="verse-item ${groupClass}">
                            <span class="verse-ref">${verse.ref}</span>
                            <div>${verse.text}</div>
                        </div>`;
                }
                html += `</div>`;
            }
            verseContent.innerHTML = html;

            const outlinePoints = document.querySelectorAll('.outline-point');
            outlinePoints.forEach(point => {
                point.addEventListener('click', () => {
                    console.log('Clicked on outline point:', point.textContent);
                    const targetId = point.dataset.target;
                    const targetGroup = document.getElementById(targetId);
                    targetGroup.classList.toggle('collapsed');
                    point.classList.toggle('active');
                });
            });

            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 800);
            
        } catch (error) {
            verseContent.innerHTML = `
                <div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px;">
                    Error fetching verses: ${error.message}
                </div>`;
            console.error('Error:', error);
        }
        return allVerses;

    }
    async function processInput() {
        processBtn.disabled = true;
        const text = textInput.value;
        if (!text) {
            output.textContent = 'Please input text or upload a PDF.';
            return;
        }

        const references = extractReferences(text);
        console.log(references);
        output.textContent = references.flat().join('; ');
        // Fetch and display verse content
        await fetchVerses(references);
        processBtn.disabled = false;
    }
    function normalizeSingleChapterRefs(text) {
        const books = [
            { name: 'Obadiah', abbrs: ['Obad'] },
            { name: 'Philemon', abbrs: ['Philem', 'Phm'] },
            { name: '2 John', abbrs: [] },
            { name: '3 John', abbrs: [] },
            { name: 'Jude', abbrs: [] },
        ];

        for (const book of books) {
            const variants = book.abbrs.map(v => v.replace(/\s+/g, '\\s+')).join('|');
            const regex = new RegExp(`\\b(${variants})\\s+(\\d+)(?!:)\\b`, 'gi');
            text = text.replace(regex, (_, bookName, verseNum) => {
                return `${bookName} 1:${verseNum}`;
            });
        }

        return text;
    }
    /**
     * Extracts all Bible verse references from outline text
     * @param {string} text - The outline text to parse
     * @returns {string[string[]]} - Array of normalized verse references for each line
     */
    function extractReferences(text) {
        const references = [];
        let lastBook = '';
        
        // Common Bible book abbreviations (expanded list)
        const bookAbbreviations = [
            // Old Testament
            'Gen\\.?', 'Genesis', 'Exo\\.?', 'Exodus', 'Lev\\.?', 'Leviticus', 'Num\\.?', 'Numbers', 'Deut\\.?', 'Deuteronomy',
            'Josh\\.?', 'Joshua', 'Judg\\.?', 'Judges', 'Ruth',
            '1\\s*Sam\\.?', '1\\s*Samuel', '2\\s*Sam\\.?', '2\\s*Samuel',
            '1\\s*Kings?', '2\\s*Kings?', '1\\s*Chron\\.?', '1\\s*Chronicles', '2\\s*Chron\\.?', '2\\s*Chronicles',
            'Ezra', 'Neh\\.?', 'Nehemiah', 'Esth\\.?', 'Esther', 'Job', 'Psa\\.?', 'Ps\\.?', 'Psalms',
            'Prov\\.?', 'Proverbs', 'Eccl\\.?', 'Ecclesiastes', 'Song', 'Song of Songs',
            'Isa\\.?', 'Isaiah', 'Jer\\.?', 'Jeremiah', 'Lam\\.?', 'Lamentations', 'Ezek\\.?', 'Ezekiel', 'Dan\\.?', 'Daniel',
            'Hos\\.?', 'Hosea', 'Joel', 'Amos', 'Obad\\.?', 'Obadiah', 'Jonah', 'Mic\\.?', 'Micah', 'Nah\\.?', 'Nahum',
            'Hab\\.?', 'Habakkuk', 'Zeph\\.?', 'Zephaniah', 'Hag\\.?', 'Haggai', 'Zech\\.?', 'Zechariah', 'Mal\\.?', 'Malachi',
            
            // New Testament
            'Matt\\.?', 'Matthew', 'Mark', 'Luke', 'John', 'Acts',
            'Rom\\.?', 'Romans', '1\\s*Cor\\.?', '1\\s*Corinthians', '2\\s*Cor\\.?', '2\\s*Corinthians',
            'Gal\\.?', 'Galatians', 'Eph\\.?', 'Ephesians', 'Phil\\.?', 'Philippians', 'Col\\.?', 'Colossians',
            '1\\s*Thes\\.?', '1\\s*Thessalonians', '2\\s*Thes\\.?', '2\\s*Thessalonians',
            '1\\s*Tim\\.?', '1\\s*Timothy', '2\\s*Tim\\.?', '2\\s*Timothy', 'Titus', 'Philem\\.?', 'Philemon',
            'Heb\\.?', 'Hebrews', 'James', '1\\s*Pet\\.?', '1\\s*Peter', '2\\s*Pet\\.?', '2\\s*Peter',
            '1\\s*John', '2\\s*John', '3\\s*John', 'Jude', 'Rev\\.?', 'Revelation'
            ];

        const bookPattern = bookAbbreviations.sort((a, b) => b.length - a.length).join('|');
        const fullRegex = new RegExp(`(${bookPattern})\\s+\\d+`);
        
        // Process text line by line
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
        
        for (let line of lines) {
            referencesForThisLine = [];
            // Skip lines that don't contain verse references
            line = normalizeSingleChapterRefs(line);
            if (!/\d+:\d+/.test(line)) {
                // Update last book if the line contains a book name
                const bookMatch = line.match(fullRegex);
                if (bookMatch) {
                    lastBook = bookMatch[1].replace(/\.$/, '').trim();
                }
                references.push(referencesForThisLine);
                continue;
            }
            
            // Split by semicolons to handle different reference groups
            const refGroups = line.split(';');
            console.log(line);
            
            for (let i = 0; i < refGroups.length; i++) {
                let group = refGroups[i].trim();
                
                // Remove "cf." prefix if present
                group = group.replace(/^\s*cf\\.?\s+/i, '');
                
                // Check if this group has a book name
                const bookMatch = group.match(fullRegex);
                console.log(group, bookMatch);
                if (bookMatch) {
                    // This group has a book name - update lastBook and process
                    const bookName = bookMatch[1].replace(/\.$/, '').trim();
                    lastBook = bookName;
                console.log(lastBook);
                    
                    // Extract all chapter:verse patterns from this group
                    const chapterVerseRegex = /(\d+):(\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)/g;
                    let match;
                    
                    while ((match = chapterVerseRegex.exec(group)) !== null) {
                        const [, chapter, verses] = match;
                        const prefix = group.slice(0, match.index);
                        const wordsBefore = prefix.trim().split(/\s+/);
                        const prevWord = (wordsBefore[wordsBefore.length - 1] || '') + ` ${chapter}`;
                        const directBookMatch = prevWord.match(fullRegex);
                        if (directBookMatch) {
                            const directBookName = directBookMatch[1].replace(/\.$/, '').trim();
                            lastBook = lastBook.includes(directBookName) ? lastBook : directBookName;
                        }
                        const verseList = verses.split(',').map(v => v.trim());
                        
                        for (const verse of verseList) {
                            referencesForThisLine.push(`${lastBook} ${chapter}:${verse}`);
                        }
                    }
                } else {
                    // No book name in this group - use lastBook if available
                    if (lastBook) {
                        const chapterVerseRegex = /(\d+):(\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)/g;
                        let match;
                        
                        while ((match = chapterVerseRegex.exec(group)) !== null) {
                            const [, chapter, verses] = match;
                            const verseList = verses.split(',').map(v => v.trim());
                            
                            for (const verse of verseList) {
                                referencesForThisLine.push(`${lastBook} ${chapter}:${verse}`);
                            }
                        }
                    }
                }
            }
            references.push(referencesForThisLine);
        }
        return references;
    }
});