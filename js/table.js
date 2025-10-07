/**
 * Table View Module
 * Handles table state management, rendering, and view toggle
 */

/**
 * Initialize table state from exhibitor data
 * @param {Array} exhibitors - Array of exhibitor objects from JSON
 * @returns {Object} TableState object
 */
function initTableState(exhibitors) {
    return {
        exhibitorsOriginal: exhibitors,
        exhibitorsFiltered: [...exhibitors],
        textFilters: {},
        arrayFilters: {},
        sortColumn: null,
        sortDirection: null,
        currentView: localStorage.getItem('exhibitorView') || 'table',
        isLoading: false,
        totalCount: exhibitors.length,
        filteredCount: exhibitors.length
    };
}

/**
 * Render table from exhibitor data
 * @param {Array} exhibitors - Array of exhibitor objects to render
 * @returns {string} HTML string for table rows
 */
function renderTable(exhibitors) {
    if (exhibitors.length === 0) {
        return '<tr><td colspan="5" class="empty-state">No exhibitors match your filters</td></tr>';
    }
    
    return exhibitors.map(exhibitor => {
        const categories = Array.isArray(exhibitor.categories) 
            ? exhibitor.categories.join(', ') 
            : '';
        const description = exhibitor.description || '';
        const url = exhibitor.url || '#';
        
        return `
            <tr data-exhibitor-id="${escapeHtml(exhibitor.name)}">
                <td class="name-cell">${escapeHtml(exhibitor.name)}</td>
                <td class="description-cell">${escapeHtml(description)}</td>
                <td class="categories-cell">${escapeHtml(categories)}</td>
                <td class="url-cell"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">View</a></td>
            </tr>
        `;
    }).join('');
}

/**
 * Update statistics display
 * @param {number} totalCount - Total number of exhibitors
 * @param {number} filteredCount - Number of filtered exhibitors
 */
function updateStats(totalCount, filteredCount) {
    const statsElement = document.querySelector('.table-stats');
    if (statsElement) {
        statsElement.innerHTML = `Showing <strong>${filteredCount}</strong> of <strong>${totalCount}</strong> exhibitors`;
    }
    
    // Update export button labels
    const exportFilteredBtn = document.getElementById('export-filtered');
    const exportAllBtn = document.getElementById('export-all');
    
    if (exportFilteredBtn) {
        exportFilteredBtn.textContent = `Export Filtered (${filteredCount})`;
    }
    if (exportAllBtn) {
        exportAllBtn.textContent = `Export All (${totalCount})`;
    }
}

/**
 * Attach event handlers to view toggle buttons
 */
function attachViewToggleHandlers() {
    const toggleButtons = document.querySelectorAll('.view-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active state
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Save preference
            localStorage.setItem('exhibitorView', view);
            
            // Toggle between table and card view
            const tableView = document.querySelector('.table-view');
            const cardView = document.querySelector('.card-view');
            
            if (view === 'table') {
                if (tableView) tableView.style.display = 'block';
                if (cardView) cardView.style.display = 'none';
            } else {
                if (tableView) tableView.style.display = 'none';
                if (cardView) cardView.style.display = 'block';
            }
        });
    });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Refresh the table display with current filtered data
 * @param {Object} tableState - Current table state
 */
function refreshTable(tableState) {
    const tbody = document.querySelector('.exhibitors-table tbody');
    if (tbody) {
        tbody.innerHTML = renderTable(tableState.exhibitorsFiltered);
    }
    updateStats(tableState.totalCount, tableState.filteredCount);
}
