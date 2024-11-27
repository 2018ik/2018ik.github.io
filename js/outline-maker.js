document.addEventListener("DOMContentLoaded", () => {
    const outlineContainer = document.getElementById("outline");
    const addRomanNumeralBtn = document.getElementById("addRomanNumeral");
    const exportButton = document.getElementById("exportButton");

    let romanNumeralCounter = 1;

    // Helper functions to generate labels
    function toRoman(num) {
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = "";
        for (const i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }

    function toUpperAlpha(num) {
        return String.fromCharCode(64 + num); // A = 65 in ASCII
    }

    function toLowerAlpha(num) {
        return String.fromCharCode(96 + num); // a = 97 in ASCII
    }

    // Add nested outline point
    function addNestedPoint(button) {
        const parent = button.parentElement;
        const currentLevel = parseInt(parent.getAttribute("data-level"));
        if (currentLevel >= 4) return;

        // Count existing children at this level
        const siblings = parent.querySelectorAll(`.outline-section[data-level="${currentLevel + 1}"]`);
        const nextNumber = siblings.length + 1;

        const newLevel = currentLevel + 1;
        const newPoint = document.createElement("div");
        newPoint.className = "outline-section";
        newPoint.setAttribute("data-level", newLevel);

        let placeholder;
        switch (newLevel) {
            case 2: placeholder = `${toUpperAlpha(nextNumber)}.`; break;
            case 3: placeholder = `${nextNumber}.`; break;
            case 4: placeholder = `${toLowerAlpha(nextNumber)}.`; break;
            default: placeholder = "Enter outline point";
        }

        newPoint.style.marginLeft = `${(newLevel - 1) * 20}px`;
        newPoint.innerHTML = `
            <input type="text" class="outline-point" placeholder="${placeholder}">
            ${newLevel < 4 ? '<button class="add-nested">+ Add Nested</button>' : ''}
        `;

        parent.appendChild(newPoint);
        if (newLevel < 4) {
            const nestedButton = newPoint.querySelector(".add-nested");
            nestedButton.addEventListener("click", () => addNestedPoint(nestedButton));
        }
    }

    // Add new Roman numeral section
    function addRomanNumeral() {
        romanNumeralCounter += 1;

        const newSection = document.createElement("div");
        newSection.className = "outline-section";
        newSection.setAttribute("data-level", "1");
        newSection.style.marginLeft = "0";

        newSection.innerHTML = `
            <input type="text" class="outline-point" placeholder="${toRoman(romanNumeralCounter)}. Enter outline point">
            <button class="add-nested">+ Add Nested</button>
        `;

        outlineContainer.appendChild(newSection);
        newSection.querySelector(".add-nested").addEventListener("click", () => addNestedPoint(newSection.querySelector(".add-nested")));
    }

    // Export to LaTeX format
    function exportToLatex() {
        const messageTitle = document.getElementById("messageTitle").value;
        const scriptureReading = document.getElementById("scriptureReading").value;
        const latex = [];

        latex.push("\\documentclass{article}");
        latex.push("\\usepackage[utf8]{inputenc}");
        latex.push("\\begin{document}");
        latex.push(`\\section*{${messageTitle}}`);
        latex.push(`\\textbf{Scripture Reading:} ${scriptureReading}`);
        latex.push("\\begin{itemize}");

        const processSection = (section, level) => {
            const text = section.querySelector(".outline-point").value.trim();
            if (!text) return;

            if (level === 1) latex.push(`\\item \\textbf{${text}}`);
            else if (level === 2) latex.push(`\\begin{itemize}\\item ${text}`);
            else if (level === 3) latex.push(`\\begin{enumerate}\\item ${text}`);
            else if (level === 4) latex.push(`\\begin{enumerate}[label=\\alph*.]\\item ${text}`);
        };

        const sections = document.querySelectorAll(".outline-section");
        sections.forEach(section => {
            const level = parseInt(section.getAttribute("data-level"));
            processSection(section, level);
        });

        latex.push("\\end{itemize}");
        latex.push("\\end{document}");

        const blob = new Blob([latex.join("\n")], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "outline.tex";
        link.click();
    }

    // Event Listeners
    addRomanNumeralBtn.addEventListener("click", addRomanNumeral);
    exportButton.addEventListener("click", exportToLatex);

    // Initialize the first nested button
    document.querySelector(".add-nested").addEventListener("click", () => addNestedPoint(document.querySelector(".add-nested")));
});
