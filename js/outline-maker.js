const { jsPDF } = window.jspdf;

document.addEventListener("DOMContentLoaded", () => {
    const outlineContainer = document.getElementById("outline");
    const addRomanNumeralBtn = document.getElementById("addRomanNumeral");
    const exportButton = document.getElementById("exportButton");
    const initialLabel = document.querySelector(".outline-label");
    initialLabel.addEventListener("click", () => toggleSubpoints(initialLabel.parentElement));

    let romanNumeralCounter = 1;

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
        return String.fromCharCode(64 + num);
    }

    function toLowerAlpha(num) {
        return String.fromCharCode(96 + num);
    }

    function deletePoint(point) {
        const subpoints = point.querySelectorAll(".outline-section");
        if (subpoints.length > 0) {
            const confirmDelete = confirm(
                `Deleting this point will also delete ${subpoints.length} subpoints. Are you sure?`
            );
            if (!confirmDelete) return;
        }
        point.remove();
    }

    function toggleSubpoints(point) {
        const subpoints = Array.from(point.children).filter(child => 
            child.classList.contains("outline-section")
        );
        const isHidden = subpoints[0]?.style.display === "none";
        subpoints.forEach(subpoint => {
            subpoint.style.display = isHidden ? "block" : "none";
        });
    }
    
    function addNestedPoint(button) {
        const parent = button.parentElement;
        const currentLevel = parseInt(parent.getAttribute("data-level"));
        if (currentLevel >= 4) return;
    
        const siblings = parent.querySelectorAll(`.outline-section[data-level="${currentLevel + 1}"]`);
        const nextNumber = siblings.length + 1;
    
        const newLevel = currentLevel + 1;
        const newPoint = document.createElement("div");
        newPoint.className = "outline-section";
        newPoint.setAttribute("data-level", newLevel);
    
        let label;
        let clickable = "";
        switch (newLevel) {
            case 2: label = `${toUpperAlpha(nextNumber)}.`; clickable = "clickable"; break;
            case 3: label = `${nextNumber}.`; clickable = "clickable"; break;
            case 4: label = `${toLowerAlpha(nextNumber)}.`; break;
            default: label = "";
        }
    
        newPoint.innerHTML = `
            <span class="outline-label ${clickable}">${label}</span>
            <input type="text" class="outline-point">
            ${newLevel < 4 ? '<button class="add-nested">+</button>' : ''}
            <button class="delete-point">🗑️</button>
        `;
    
        parent.appendChild(newPoint);
    
        if (newLevel < 4) {
            const nestedButton = newPoint.querySelector(".add-nested");
            nestedButton.addEventListener("click", () => addNestedPoint(nestedButton));
        }
    
        const deleteButton = newPoint.querySelector(".delete-point");
        deleteButton.addEventListener("click", () => deletePoint(newPoint));
    
        const outlineLabel = newPoint.querySelector(".outline-label");
        outlineLabel.addEventListener("click", () => toggleSubpoints(newPoint));
    }
    
    // Update this block where new sections are created:
    function addRomanNumeral() {
        romanNumeralCounter += 1;
    
        const newSection = document.createElement("div");
        newSection.className = "outline-section";
        newSection.setAttribute("data-level", "1");
    
        newSection.innerHTML = `
            <span class="outline-label clickable">${toRoman(romanNumeralCounter)}.</span>
            <input type="text" class="outline-point">
            <button class="add-nested">+/button>
            <button class="delete-point">🗑️</button>
        `;
    
        outlineContainer.appendChild(newSection);
    
        const nestedButton = newSection.querySelector(".add-nested");
        nestedButton.addEventListener("click", () => addNestedPoint(nestedButton));
    
        const deleteButton = newSection.querySelector(".delete-point");
        deleteButton.addEventListener("click", () => deletePoint(newSection));
    
        const label = newSection.querySelector(".outline-label");
        label.addEventListener("click", () => toggleSubpoints(newSection));
    }

    function exportToTex() {
        const title = document.getElementById("messageTitle").value.trim();
        const scripture = document.getElementById("scriptureReading").value.trim();
        let latex = `\\documentclass[11pt]{article}
\\usepackage{geometry}
\\usepackage{enumitem}
\\usepackage{setspace}
\\geometry{a4paper, margin=1in}
% Adjust the indentation and spacing for each level
\\setlist[enumerate, 1]{label=\\Roman*., left=0pt, labelsep=1em, itemsep=2pt}
\\setlist[enumerate, 2]{label=\\Alph*., left=0pt, labelsep=1em, itemsep=2pt}
\\setlist[enumerate, 3]{label=\\arabic*., left=0pt, labelsep=1em, itemsep=2pt}
\\setlist[enumerate, 4]{label=\\alph*., left=0pt, labelsep=1em, itemsep=2pt}
\\begin{document}
\\begin{center}
`;
        
            // Title and scripture reading
        latex += `\\Large\\textbf{${title}}\\\\[4pt]\n`;
        latex += `\\normalsize\\textbf{Scripture Reading:} ${scripture}\n`;
        latex += `\\end{center}`

        // Function to recursively process the outline
        const processSection = (section, depth = 1) => {
            const children = Array.from(section.children).filter(child =>
                child.classList.contains("outline-section")
            );

            const label = section.querySelector(".outline-label").innerText.trim();
            const content = section.querySelector(".outline-point").value.trim();

            if (content) {
                if (depth === 1) {
                    latex += `\\begin{enumerate}\n\\item \\textbf{${content}}\n`;
                } else {
                    latex += `\\item ${content}\n`;
                }
            }

            // Process child sections recursively
            if (children.length > 0) {
                latex += `\\begin{enumerate}\n`;
                children.forEach(child => processSection(child, depth + 1));
                latex += `\\end{enumerate}\n`;
            }

            if (depth === 1) {
                latex += `\\end{enumerate}\n`;
            }
        };

        // Loop through all the Roman numeral sections
        const romanNumeralSections = document.querySelectorAll(".outline-section[data-level='1']");
        romanNumeralSections.forEach(section => processSection(section));

        latex += "\\end{document}";

        // Trigger file download
        const blob = new Blob([latex], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title || "outline"}.tex`;
        link.click();
    }
    
    

    addRomanNumeralBtn.addEventListener("click", addRomanNumeral);
    exportButton.addEventListener("click", exportToTex);
    document.querySelector(".add-nested").addEventListener("click", () => addNestedPoint(document.querySelector(".add-nested")));
});
