document.addEventListener("DOMContentLoaded", function() {

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');
    const verseContent = document.getElementById('verseContent');
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

    function createBatches(references, maxBatchSize) {
        const batches = [];
        const batchMetadata = [];
        
        let currentBatch = [];
        let currentMetadata = [];
        
        for (let i = 0; i < references.length; i++) {
            const chunk = references[i];
            
            if (chunk.length === 0) {
                // Handle empty chunks - add to metadata but don't add to batch
                currentMetadata.push({
                    originalIndex: i,
                    references: [],
                    isEmpty: true
                });
            } else {
                // Add non-empty chunk to current batch
                currentBatch.push(...chunk);
                currentMetadata.push({
                    originalIndex: i,
                    references: [...chunk],
                    isEmpty: false
                });
            }
            
            // Check if we should finalize this batch
            if (currentBatch.length >= maxBatchSize || i === references.length - 1) {
                if (currentBatch.length > 0 || currentMetadata.some(m => m.isEmpty)) {
                    batches.push(currentBatch.join(', '));
                    batchMetadata.push(currentMetadata);
                    currentBatch = [];
                    currentMetadata = [];
                }
            }
        }
        
        return { batches, batchMetadata };
    }

    function normalizeReference(ref) {
        const bookMappings = {'genesis':'gen','exodus':'exo','leviticus':'lev','numbers':'num','deuteronomy':'deut','joshua':'josh','judges':'judg','ruth':'ruth','1 samuel':'1 sam','2 samuel':'2 sam','1 kings':'1 kings','2 kings':'2 kings','1 chronicles':'1 chron','2 chronicles':'2 chron','ezra':'ezra','nehemiah':'neh','esther':'esth','job':'job','psalm':'psa','psalms':'psa','proverbs':'prov','ecclesiastes':'eccl','song of songs':'s. s.','isaiah':'isa','jeremiah':'jer','lamentations':'lam','ezekiel':'ezek','daniel':'dan','hosea':'hos','joel':'joel','amos':'amos','obadiah':'obad','jonah':'jonah','micah':'mic','nahum':'nah','habakkuk':'hab','zephaniah':'zeph','haggai':'hag','zechariah':'zech','malachi':'mal','matthew':'matt','mark':'mark','luke':'luke','john':'john','acts':'acts','romans':'rom','1 corinthians':'1 cor','2 corinthians':'2 cor','galatians':'gal','ephesians':'eph','philippians':'phil','colossians':'col','1 thessalonians':'1 thes','2 thessalonians':'2 thes','1 timothy':'1 tim','2 timothy':'2 tim','titus':'titus','philemon':'philem','hebrews':'heb','james':'james','1 peter':'1 pet','2 peter':'2 pet','1 john':'1 john','2 john':'2 john','3 john':'3 john','jude':'jude','revelation':'rev'};

        let normalized = ref.trim().toLowerCase();
        
        // Handle common variations and clean up
        normalized = normalized.replace(/\s+/g, ' '); // normalize whitespace
        normalized = normalized.replace(/\./, ''); // remove trailing period
        
        // Extract book name and chapter:verse portion
        const match = normalized.match(/^(.+?)\s+(\d+.*)$/);
        if (!match) return normalized; // Return as-is if no match
        
        let bookName = match[1].trim();
        const chapterVerse = match[2];
        
        // Handle numbered books (1 cor, 2 cor, etc.)
        const numberedMatch = bookName.match(/^(\d+)\s+(.+)$/);
        if (numberedMatch) {
            const number = numberedMatch[1];
            const baseBook = numberedMatch[2];
            const mappedBook = bookMappings[baseBook] || baseBook;
            return `${number} ${mappedBook} ${chapterVerse}`;
        }
        
        // Map full book name to abbreviation
        const mappedBook = bookMappings[bookName] || bookName;
        
        return `${mappedBook} ${chapterVerse}`;
    }

    function mapVersesToOriginalOrder(batchVerses, batchMetadata) {
        const result = [];
        
        for (const metadata of batchMetadata) {
            for (const chunkMeta of metadata) {
                if (chunkMeta.isEmpty) {
                    // Empty chunk gets empty array
                    result[chunkMeta.originalIndex] = [];
                } else {
                    // Find verses that match this chunk's references
                    const chunkVerses = [];
                    
                    for (const expectedRef of chunkMeta.references) {
                        const normalizedExpected = normalizeReference(expectedRef);
                        
                        // Find matching verses from the batch
                        const matchingVerses = batchVerses.filter(verse => {
                            const normalizedVerseRef = normalizeReference(verse.ref);
                            
                            // Direct match
                            if (normalizedVerseRef === normalizedExpected) {
                                return true;
                            }
                            
                            // Handle range matching (e.g., "rev 19:7-9" should match "rev 19:7", "rev 19:8", "rev 19:9")
                            // Check if the verse ref is within the expected range
                            const expectedMatch = normalizedExpected.match(/^(.+)\s+(\d+):(\d+)(?:-(\d+))?$/);
                            const verseMatch = normalizedVerseRef.match(/^(.+)\s+(\d+):(\d+)$/);
                            
                            if (expectedMatch && verseMatch) {
                                const [, expectedBook, expectedChapter, expectedStartVerse, expectedEndVerse] = expectedMatch;
                                const [, verseBook, verseChapter, verseNum] = verseMatch;
                                
                                if (expectedBook === verseBook && expectedChapter === verseChapter) {
                                    const verseNumber = parseInt(verseNum);
                                    const startVerse = parseInt(expectedStartVerse);
                                    const endVerse = expectedEndVerse ? parseInt(expectedEndVerse) : startVerse;
                                    
                                    return verseNumber >= startVerse && verseNumber <= endVerse;
                                }
                            }
                            
                            return false;
                        });
                        
                        chunkVerses.push(...matchingVerses);
                    }
                    
                    // Remove duplicates while preserving order
                    const uniqueVerses = [];
                    const seenRefs = new Set();
                    for (const verse of chunkVerses) {
                        if (!seenRefs.has(verse.ref)) {
                            seenRefs.add(verse.ref);
                            uniqueVerses.push(verse);
                        }
                    }
                    
                    result[chunkMeta.originalIndex] = uniqueVerses;
                }
            }
        }
        
        return result;
    }

    async function fetchVerses(references, maxBatchSize = 20) {
        verseContent.innerHTML = '<div class="loading">Loading verses...</div>';
        const progressBar = document.getElementById('progressBar');
        
        try {
            // Create batches
            const { batches, batchMetadata } = createBatches(references, maxBatchSize);
            console.log(`Created ${batches.length} batches from ${references.length} chunks`);
            
            let allBatchVerses = [];
            
            // Process each batch
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                
                if (batch.trim() === '') {
                    // Skip empty batches
                    allBatchVerses.push([]);
                } else {
                    const response = await sendLsmRequest(batch);
                    const data = await response.json();
                    allBatchVerses.push(data.verses || []);
                }
                
                // Update progress bar
                const progress = ((batchIndex + 1) / batches.length) * 100;
                progressBar.style.width = `${progress}%`;
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Map verses back to original order
            const mappedVerses = [];
            for (let batchIndex = 0; batchIndex < allBatchVerses.length; batchIndex++) {
                const batchVerses = allBatchVerses[batchIndex];
                const metadata = batchMetadata[batchIndex];
                
                const mappedBatch = mapVersesToOriginalOrder(batchVerses, [metadata]);
                
                // Merge results maintaining original indices
                for (let originalIndex in mappedBatch) {
                    if (mappedBatch[originalIndex]) {
                        if (!mappedVerses[originalIndex]) {
                            mappedVerses[originalIndex] = [];
                        }
                        mappedVerses[originalIndex].push(...mappedBatch[originalIndex]);
                    }
                }
            }
            
            // Fill any missing indices with empty arrays
            for (let i = 0; i < references.length; i++) {
                if (!mappedVerses[i]) {
                    mappedVerses[i] = [];
                }
            }
            
            if (mappedVerses.length === 0 || mappedVerses.every(verses => verses.length === 0)) {
                verseContent.innerHTML = '<div style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px;">No verses found for the given references.</div>';
                return;
            }
            
            // Display outline points with verses
            let html = '';
            const text_array = textInput.value.split('\n').map(line => line.trim()).filter(line => line !== '');

            for (let i = 0; i < mappedVerses.length; i++) {
                const groupClass = `outline-group-${i % 5}`;
                const groupId = `group-${i}`;

                html += `<div class="outline-point ${groupClass}" data-target="${groupId}">${text_array[i]}</div>`;
                html += `<div class="verse-group ${groupClass}" id="${groupId}">`;
                
                for (const verse of mappedVerses[i]) {
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
                    const targetId = point.dataset.target;
                    const targetGroup = document.getElementById(targetId);
                    targetGroup.classList.toggle('collapsed');
                    point.classList.toggle('active');
                });
            });

            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 800);
            
            return mappedVerses;
            
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

        const references = extractReferences(text);
        output.textContent = references.flat().join('; ');
        // Fetch and display verse content
        await fetchVerses(references);
        processBtn.disabled = false;
    }

    function normalizeWhitespace(str) {
        return str.replace(/\s+/g, ' ').trim();
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
            'Prov\\.?', 'Proverbs', 'Eccl\\.?', 'Ecclesiastes', 'S. S.', 'Song of Songs',
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
            line = normalizeWhitespace(line);
            line = normalizeSingleChapterRefs(line);
            // Skip lines that don't contain verse references
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
            
            for (let i = 0; i < refGroups.length; i++) {
                let group = refGroups[i].trim();
                
                // Remove "cf." prefix if present
                group = group.replace(/^\s*cf\\.\s+/i, '');
                // remove "verse" prefix if present
                group = group.replace(/^\s*v+\\.\s+/i, '');
                
                // Check if this group has a book name
                const bookMatch = group.match(fullRegex);
                if (bookMatch) {
                    // This group has a book name - update lastBook and process
                    const bookName = bookMatch[1].replace(/\.$/, '').trim();
                    lastBook = bookName;
                    
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