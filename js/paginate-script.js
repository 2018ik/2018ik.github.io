const table = document.getElementById("data-table");
const rows = table.querySelectorAll("tbody tr");
const rowsPerPage = 50; // magic hardcoded number

let currentPage = 1;

function displayRows(page) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  rows.forEach((row, index) => {
    if (index >= start && index < end) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  });
}

function updatePaginationButtons() {
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", function () {
      currentPage = i;
      displayRows(currentPage);
      updatePaginationButtons();
    });
    if (i === currentPage) {
      button.classList.add("active");
    }
    pagination.appendChild(button);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  displayRows(currentPage);
  updatePaginationButtons();
});

export function reloadPagination(){ 
  displayRows(currentPage);
  updatePaginationButtons();
}