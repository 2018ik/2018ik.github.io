document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-input");
    const dataTable = document.getElementById("data-table");
    const rows = dataTable.getElementsByTagName("tr");

    searchInput.addEventListener("keyup", function () {
        const filterText = searchInput.value.toLowerCase();

        for (let i = 1; i < rows.length; i++) { // Start from 1 to skip first header row
            const firstColumnText = rows[i].getElementsByTagName("td")[0].textContent.toLowerCase();
            const secondColumnText = rows[i].getElementsByTagName("td")[1].textContent.toLowerCase();
            if (firstColumnText.includes(filterText) || secondColumnText.includes(filterText)) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    });
});