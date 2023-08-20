document.addEventListener("DOMContentLoaded", function() {
    const getHrefValue = tr => {
        const linkElement = tr.querySelector('td:first-child a');
        return linkElement ? linkElement.getAttribute('href') : null;
    };

    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    
    const textComparer = (asc, idx) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    const linkComparer = (asc, idx) => (a, b) => {
        const hrefA = getHrefValue(a);
        const hrefB = getHrefValue(b);

        if (hrefA === null || hrefB === null) {
            return originalComparer(asc, idx)(a, b);
        }

        return asc ? hrefA.localeCompare(hrefB) : hrefB.localeCompare(hrefA);
    };

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        const currentAsc = th.getAttribute('data-asc') === 'true';
        if (th.innerHTML === 'Name') {
            Array.from(tbody.querySelectorAll('tr'))
            .sort(linkComparer(currentAsc, Array.from(th.parentNode.children).indexOf(th)))
            .forEach(tr => tbody.appendChild(tr));
        } else {
            Array.from(tbody.querySelectorAll('tr'))
            .sort(textComparer(currentAsc, Array.from(th.parentNode.children).indexOf(th)))
            .forEach(tr => tbody.appendChild(tr));
        }
        
        th.setAttribute('data-asc', !currentAsc);
    })));
});
