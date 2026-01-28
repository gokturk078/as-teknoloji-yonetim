
// Filter Manager
// Handles the "Advanced Filter" side drawer and logic

let activeFilters = {
    dateStart: null,
    dateEnd: null,
    companies: [],
    projects: [],
    currencies: [],
    statuses: [],
    minAmount: null,
    maxAmount: null
};

let allData = [];
let onFilterApplyCallback = null;

let isInitialized = false;

export function initFilters(data, callback) {
    allData = data;
    onFilterApplyCallback = callback;

    // Populate Options
    populateOptions(data);

    // Event Listeners - Attach only once
    if (!isInitialized) {
        // document.getElementById('btnOpenFilters').addEventListener('click', openDrawer);
        // document.getElementById('btnCloseFilters').addEventListener('click', closeDrawer);
        document.getElementById('backdropFilters').addEventListener('click', closeDrawer);

        document.getElementById('btnApplyFilters').addEventListener('click', applyFilters);
        document.getElementById('btnResetFilters').addEventListener('click', resetFilters);

        isInitialized = true;
    }

    // Range Sliders (Optional enhancement, using Inputs for now)
}

export function filterData(data) {
    // This function is exposed to be used by main.js if needed, 
    // but main logic is usually: applyFilters -> calls callback(filtered)

    return data.filter(item => {
        // Date Logic (Assuming 'created_at' or 'donem' parsing needed if strict date)
        // For now, let's skip strict date parsing unless needed.

        // Multi-Selects
        if (activeFilters.companies.length && !activeFilters.companies.includes(item.firma_fatura_ismi)) return false;
        if (activeFilters.projects.length && !activeFilters.projects.includes(item.isin_adi)) return false;
        if (activeFilters.currencies.length && !activeFilters.currencies.includes(item.para_birimi)) return false;
        if (activeFilters.statuses.length && !activeFilters.statuses.includes(item.odeme_durumu)) return false;

        // Amount
        const amount = item.toplam_borc || 0;
        if (activeFilters.minAmount !== null && amount < activeFilters.minAmount) return false;
        if (activeFilters.maxAmount !== null && amount > activeFilters.maxAmount) return false;

        return true;
    });
}

export function openDrawer() {
    document.getElementById('filterDrawer').classList.add('open');
    document.getElementById('backdropFilters').classList.add('visible');
}

export function closeDrawer() {
    document.getElementById('filterDrawer').classList.remove('open');
    document.getElementById('backdropFilters').classList.remove('visible');
}

function populateOptions(data) {
    // Extract Unique Values
    const companies = [...new Set(data.map(i => i.firma_fatura_ismi).filter(Boolean))].sort();
    const projects = [...new Set(data.map(i => i.isin_adi).filter(Boolean))].sort();

    renderMultiSelect('filterCompany', companies);
    renderMultiSelect('filterProject', projects);
}

function renderMultiSelect(elementId, options) {
    const container = document.getElementById(elementId);
    if (!container) return; // Guard

    container.innerHTML = options.map(opt => `
        <label class="checkbox-item">
            <input type="checkbox" value="${opt}">
            <span>${opt}</span>
        </label>
    `).join('');
}

function applyFilters() {
    // Read UI State
    activeFilters.companies = getCheckedValues('filterCompany');
    activeFilters.projects = getCheckedValues('filterProject');
    activeFilters.currencies = getCheckedValues('filterCurrency'); // Manual HTML checkboxes
    activeFilters.statuses = getCheckedValues('filterStatus');     // Manual HTML checkboxes

    const minStr = document.getElementById('filterMinAmount').value;
    const maxStr = document.getElementById('filterMaxAmount').value;

    activeFilters.minAmount = minStr ? parseFloat(minStr) : null;
    activeFilters.maxAmount = maxStr ? parseFloat(maxStr) : null;

    // Apply
    const filtered = filterData(allData);

    // Update Main State
    if (onFilterApplyCallback) onFilterApplyCallback(filtered);

    // Visual Feedback
    closeDrawer();

    // Show badge count?
    const totalActive = activeFilters.companies.length + activeFilters.projects.length + activeFilters.currencies.length; // + others
}

function resetFilters() {
    // Clear UI
    document.querySelectorAll('#filterDrawer input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('filterMinAmount').value = '';
    document.getElementById('filterMaxAmount').value = '';

    // Reset State
    activeFilters = {
        dateStart: null,
        dateEnd: null,
        companies: [],
        projects: [],
        currencies: [],
        statuses: [],
        minAmount: null,
        maxAmount: null
    };

    applyFilters();
}

function getCheckedValues(containerId) {
    const checkboxes = document.querySelectorAll(`#${containerId} input:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}
