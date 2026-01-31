
import { initSupabase, fetchPayments, fetchCurrencyRates, savePayment, deletePaymentRecord, subscribeToPayments } from './api/supabase.js';
import { renderTable } from './ui/table.js';
import { initCharts, updateCharts } from './ui/charts.js';
import { openModal, closeModal, populatePaymentForm, resetPaymentForm, handleFileSelect } from './ui/modal.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { showToast, showLoading } from './ui/notifications.js';
import { debounce } from './utils/helpers.js';
import { fetchLiveRates } from './api/currency.js';
import { initReports } from './ui/reports.js';
import { initAuth } from './ui/auth.js';
import { initFilters, openDrawer, closeDrawer } from './ui/filters.js';
import { initBulkActions, toggleSelection, toggleAll, deleteSelected, updateStatusSelected, updateFieldSelected } from './ui/bulk-actions.js';
import { AppState } from './state/store.js';

// ============================================
// STATE MANAGEMENT - ULTRA PROFESSIONAL
// ============================================
// All state is now managed by AppState singleton (src/state/store.js)
// This ensures consistent data access across all modules

// FORM SUBMISSION STATE - PREVENTS DUPLICATE SUBMISSIONS
const formState = {
    isSubmitting: false,
    lastSubmitTime: 0,
    COOLDOWN_MS: 2000 // 2 second cooldown between submissions
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        initAuth(); // Lock screen check
        initTheme();
        setupEventListeners();

        showLoading(true);
        await initApp();
    } catch (error) {
        console.error('Initialization Error:', error);
        showToast('Kritik Hata', 'Sistem başlatılamadı: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
});

async function initApp() {
    initSupabase();

    // Load initial data & Live Rates
    const [fetchedPayments, messageData, liveRates] = await Promise.all([
        fetchPayments(),
        fetchCurrencyRates(), // Database rates (historical/fallback if needed)
        fetchLiveRates()      // Live API rates
    ]);

    // Update centralized state
    AppState.updatePayments(fetchedPayments);

    // Prioritize Live Rates -> Database Rates -> Defaults
    const mergedRates = { ...messageData, ...liveRates };
    AppState.updateCurrencyRates(mergedRates);

    renderTable(AppState.filteredPayments);
    initCharts(AppState.filteredPayments);
    updateStats();

    // Start Realtime Listener (with debounce)
    let realtimeDebounce = null;
    subscribeToPayments(async (payload) => {
        console.log('🔄 Dashboard: Realtime update receiving...', payload);

        // Debounce realtime updates to prevent rapid refreshes
        if (realtimeDebounce) {
            clearTimeout(realtimeDebounce);
        }

        realtimeDebounce = setTimeout(async () => {
            // Refresh data from API and update state
            const freshPayments = await fetchPayments();
            AppState.updatePayments(freshPayments);

            renderTable(AppState.filteredPayments);
            updateCharts(AppState.filteredPayments);
            updateStats();
            // Don't show toast for every realtime update - can be noisy
        }, 500);
    });


    updateTicker();
    updateUI();

    // Initialize Reports
    initReports(AppState.payments, AppState.currencyRates);

    // Initialize Filters
    initFilters(AppState.payments, (newFilteredData) => {
        AppState.updateFilteredPayments(newFilteredData);
        updateUI(); // Re-render table and stats
        showToast('Filtreler Uygulandı', `${AppState.filteredPayments.length} kayıt listeleniyor.`);

        // Re-init bulk actions with new list if we want filtering to clear selection?
        // Or keep it? Usually keep, but simpler to clear or warn.
        initBulkActions(AppState.filteredPayments, initApp);
    });

    // Initialize Bulk Actions
    initBulkActions(AppState.filteredPayments, initApp);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateTicker() {
    const elUsd = document.getElementById('rate-usd');
    const elEur = document.getElementById('rate-eur');
    const elStg = document.getElementById('rate-stg');

    const rates = AppState.currencyRates;
    if (elUsd) elUsd.innerText = `₺${(rates.USD || 34.50).toFixed(2)}`;
    if (elEur) elEur.innerText = `₺${(rates.EUR || 37.20).toFixed(2)}`;
    if (elStg) elStg.innerText = `₺${(rates.STG || 43.80).toFixed(2)}`;
}

function updateUI() {
    renderTable(AppState.filteredPayments);
    initCharts(AppState.filteredPayments); // Or updateCharts
    updateStats();
}

function updateStats() {
    const stateRates = AppState.currencyRates;
    const filtered = AppState.filteredPayments;
    const totalRecords = filtered.length;

    // Use fetched rates from state
    const rates = {
        'TL': 1,
        'USD': stateRates.USD || 34.50,
        'EUR': stateRates.EUR || 37.20,
        'STG': stateRates.STG || 43.80
    };

    let totalPaid = 0;
    let totalDebt = 0;
    let totalRemaining = 0;

    filtered.forEach(p => {
        const currency = p.para_birimi || 'TL';
        // Handle variations like "DOLAR", "EURO" just in case
        let rate = 1;
        if (currency.includes('USD')) rate = rates.USD;
        else if (currency.includes('EUR')) rate = rates.EUR;
        else if (currency.includes('STG')) rate = rates.STG;
        else rate = rates.TL;

        totalPaid += (p.bu_ay_odenen || 0) * rate;
        totalDebt += (p.toplam_borc || 0) * rate;
        totalRemaining += (p.kalan || 0) * rate;
    });

    // Update DOM
    document.getElementById('totalRecords').innerText = totalRecords;

    // Format helper
    const fmt = (val) => '₺' + val.toLocaleString('tr-TR', { maximumFractionDigits: 0 });

    document.getElementById('totalPaid').innerText = fmt(totalPaid);

    const elDebt = document.getElementById('totalDebt');
    if (elDebt) elDebt.innerText = fmt(totalDebt);

    const elRemaining = document.getElementById('totalRemaining');
    if (elRemaining) elRemaining.innerText = fmt(totalRemaining);
}


import { ExcelManager } from './utils/excel-manager.js';

// ============================================
// EVENT LISTENERS - WITH DUPLICATE PREVENTION
// ============================================

function setupEventListeners() {
    // Excel Integration
    const excelInput = document.getElementById('excelInput');
    const btnExport = document.getElementById('btnExportExcel');
    const dropZone = document.getElementById('dropZone');
    const tableCard = document.querySelector('.table-card');

    if (excelInput) {
        excelInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) await processExcelFile(file);
            e.target.value = ''; // Reset
        });
    }

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            // Export current view data
            ExcelManager.exportToExcel(filteredPayments);
        });
    }

    // Drag & Drop
    if (tableCard && dropZone) {
        // ... (existing d&d code)
    }

    // Filter Drawer Direct Listeners (More reliable than delegation)
    const btnOpenFilters = document.getElementById('btnOpenFilters');
    if (btnOpenFilters) {
        btnOpenFilters.addEventListener('click', (e) => {
            e.stopPropagation();
            openDrawer();
        });
    }

    const btnCloseFilters = document.getElementById('btnCloseFilters');
    if (btnCloseFilters) {
        btnCloseFilters.addEventListener('click', (e) => {
            e.stopPropagation();
            closeDrawer();
        });
    }

    const backdropFilters = document.getElementById('backdropFilters');
    if (backdropFilters) {
        backdropFilters.addEventListener('click', closeDrawer);
    }
    // Prevent default browser behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        tableCard.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight
    ['dragenter', 'dragover'].forEach(eventName => {
        tableCard.addEventListener(eventName, () => dropZone.classList.add('active'), false);
    });

    // Un-highlight
    ['dragleave', 'drop'].forEach(eventName => {
        tableCard.addEventListener(eventName, () => dropZone.classList.remove('active'), false);
    });

    // Handle Drop
    tableCard.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            await processExcelFile(files[0]);
        }
    }, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async function processExcelFile(file) {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            showToast('Hata', 'Lütfen geçerli bir Excel dosyası yükleyin (.xlsx)', 'error');
            return;
        }

        showLoading(true);
        try {
            showToast('Bilgi', 'Excel dosyası analizi yapılıyor...', 'info');

            const rawData = await ExcelManager.readExcel(file);
            const mappedData = ExcelManager.mapData(rawData);

            console.log('Parsed Excel Data:', mappedData);

            if (mappedData.length === 0) {
                showToast('Uyarı', 'Dosyada uygun veri bulunamadı', 'warning');
                showLoading(false);
                return;
            }

            // Sync with Supabase (Batch Insert/Update logic)
            // For now, we will just update local state and confirm with user?
            // Or auto-save? Let's auto-save for seamless experience for now, or replace state.

            // NOTE: In a real app we might ask "Append or Replace?". 
            // Here we will Append for safety, or we could Replace given it's a "Management System" based on the file.
            // Let's assume we want to import these records.

            // Parallel save (could be slow for large files, use batch if available in future)
            let successCount = 0;
            for (const item of mappedData) {
                const { error } = await savePayment(item, true); // true = isNew
                if (!error) successCount++;
            }

            showToast('Başarılı', `${successCount} kayıt başarıyla içe aktarıldı`, 'success');
            await initApp(); // Reload to refresh table stats

        } catch (error) {
            console.error(error);
            showToast('Hata', 'Excel işlenirken bir hata oluştu', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Navigation ... (rest of the function)
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            // If link has external href (not #), let it navigate normally
            const href = link.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('#')) {
                // External link - don't prevent default, let browser navigate
                return;
            }

            e.preventDefault();
            if (link.classList.contains('disabled')) return;

            // Active class management
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const viewKey = link.getAttribute('data-view');

            // Handle Navigation
            if (viewKey === 'view-reports') {
                // Switch to Reports
                document.getElementById('view-overview').style.display = 'none';
                const reportsView = document.getElementById('view-reports');
                reportsView.style.display = 'block';
                updateTitle('Finansal Raporlar', 'Detaylı analiz ve çıktılar');

            } else {
                // Default: Show Overview (which now contains the Table)
                document.getElementById('view-reports').style.display = 'none';
                document.getElementById('view-overview').style.display = 'block';

                if (viewKey === 'view-records') {
                    // Scroll to Table
                    const tableSection = document.getElementById('tableSection');
                    if (tableSection) tableSection.scrollIntoView({ behavior: 'smooth' });
                    updateTitle('Genel Bakış', 'Tüm kayıtlar ve analizler');
                } else {
                    // Scroll to Top
                    document.querySelector('.main-content').scrollTop = 0;
                    updateTitle('Genel Bakış', 'Finansal durum özeti ve analizler');
                }
            }
        });
    });

    function updateTitle(title, desc) {
        document.getElementById('pageTitle').innerText = title;
        document.getElementById('pageDesc').innerText = desc;
    }

    // Auto Calculate Form logic
    function calculateTotals() {
        const onceki = parseFloat(document.getElementById('oncekiBorc').value) || 0;
        const buAy = parseFloat(document.getElementById('buAykiBorc').value) || 0;
        const odenen = parseFloat(document.getElementById('buAyOdenen').value) || 0;

        const toplam = onceki + buAy;
        const kalan = toplam - odenen;

        document.getElementById('toplamBorc').value = toplam.toFixed(2);
        document.getElementById('kalan').value = kalan.toFixed(2);
    }

    const calcInputs = ['oncekiBorc', 'buAykiBorc', 'buAyOdenen'];
    calcInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculateTotals);
        }
    });

    // Global clicks
    document.addEventListener('click', (e) => {
        // Handle Buttons & Nav
        const targetBtn = e.target.closest('button') || e.target.closest('.nav-item');

        if (targetBtn) {
            if (targetBtn.id === 'btnAddObject') {
                resetPaymentForm();
                // Reset form state when opening modal
                formState.isSubmitting = false;
                openModal('modal');
            }

            if (targetBtn.classList.contains('modal-close')) {
                closeModal('modal');
                // Reset form state on close
                formState.isSubmitting = false;
            }

            if (targetBtn.classList.contains('btn-edit')) {
                const id = targetBtn.dataset.id;
                // Always get fresh data from centralized state
                const payment = AppState.getPaymentById(id);
                if (payment) {
                    populatePaymentForm(payment);
                    calculateTotals();
                    // Reset form state when opening modal
                    formState.isSubmitting = false;
                    openModal('modal');
                }
            }

            if (targetBtn.classList.contains('btn-delete')) {
                const id = targetBtn.dataset.id;
                handleDelete(id);
            }

            if (targetBtn.classList.contains('theme-toggle')) {
                toggleTheme();
            }
        }

        // Handle Row Checkbox Click
        if (e.target.classList.contains('row-checkbox')) {
            toggleSelection(e.target.value);
        }

        // Handle Master Checkbox
        if (e.target.id === 'checkboxAll') {
            toggleAll(e.target.checked);
        }

        // Handle Floating Bar Buttons
        const statusBtn = e.target.closest('button[data-status]');
        if (statusBtn) {
            updateStatusSelected(statusBtn.dataset.status);
        }

        if (e.target.id === 'btnBulkDelete' || e.target.closest('#btnBulkDelete')) {
            deleteSelected();
        }

        if (e.target.id === 'btnBulkEdit' || e.target.closest('#btnBulkEdit')) {
            openModal('bulkEditModal');
        }

        if (e.target.id === 'btnConfirmBulkEdit') {
            const field = document.getElementById('bulkFieldSelect').value;
            const value = document.getElementById('bulkValueInput').value;
            if (field) { // Value can be empty? Maybe not.
                updateFieldSelected(field, value);
                closeModal('bulkEditModal');
            }
        }

        // Generic Modal Close 
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            const btn = e.target.closest('.modal-close') || e.target;
            const target = btn.dataset.target || 'modal';
            closeModal(target);
            // Reset form state
            formState.isSubmitting = false;
        }

        // Handle Table Row Click (if NOT clicking a button/link OR Checkbox)
        const row = e.target.closest('.clickable-row');
        if (row && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('.checkbox-cell')) {
            const id = row.dataset.id;
            // Always get fresh data from centralized state
            const payment = AppState.getPaymentById(id);
            if (payment) {
                populatePaymentForm(payment);
                calculateTotals();
                // Reset form state when opening modal
                formState.isSubmitting = false;
                openModal('modal');
            }
        }
    });

    // ============================================
    // FORM SUBMIT - WITH DUPLICATE PREVENTION
    // ============================================
    const form = document.getElementById('paymentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const now = Date.now();

            // TRIPLE GUARD: Prevent duplicate submissions
            // 1. Check if already submitting
            if (formState.isSubmitting) {
                console.log('⚠️ Form already submitting, ignoring duplicate');
                return false;
            }

            // 2. Check cooldown period
            if ((now - formState.lastSubmitTime) < formState.COOLDOWN_MS) {
                console.log('⚠️ Cooldown active, ignoring rapid submit');
                showToast('Uyarı', 'Lütfen bekleyin...', 'warning');
                return false;
            }

            // 3. Mark as submitting IMMEDIATELY
            formState.isSubmitting = true;
            formState.lastSubmitTime = now;

            // 4. Disable submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
            }

            try {
                await handleFormSubmit();
            } finally {
                // Re-enable after completion
                formState.isSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Kaydet';
                }
            }

            return false;
        });
    }

    // File Upload
    const fileInput = document.getElementById('documentUpload');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase();
            const filtered = AppState.payments.filter(p =>
                (p.odeme_kalemleri || '').toLowerCase().includes(term) ||
                (p.firma_fatura_ismi || '').toLowerCase().includes(term) ||
                (p.isin_adi || '').toLowerCase().includes(term)
            );
            AppState.updateFilteredPayments(filtered);
            updateUI();
        }, 300));
    }
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

async function handleFormSubmit() {
    const formData = new FormData(document.getElementById('paymentForm'));
    const paymentData = Object.fromEntries(formData.entries());

    // CLEANUP: Remove ID if empty (crucial for UUID fields to auto-generate)
    if (!paymentData.id) {
        delete paymentData.id;
    }

    // SANITIZE: Ensure numeric fields are numbers, default to 0 if empty
    const numericFields = ['sira_no', 'onceki_donemden_kalan_borc', 'bu_ayki_borc', 'toplam_borc', 'bu_ay_odenen', 'kalan'];
    numericFields.forEach(field => {
        const val = paymentData[field];
        if (val === '' || val === null || val === undefined) {
            paymentData[field] = 0;
        } else {
            paymentData[field] = parseFloat(val);
        }
    });

    // Add ID if editing (and strictly present)
    const idInput = document.getElementById('paymentId');
    if (idInput && idInput.value) {
        paymentData.id = idInput.value;
    }

    showLoading(true);
    // isNew logic: if no ID in final object, it's new
    const isNew = !paymentData.id;

    console.log('💾 Saving payment:', isNew ? 'NEW' : 'UPDATE', paymentData);

    const result = await savePayment(paymentData, isNew);
    showLoading(false);

    if (!result.error) {
        showToast('Başarılı', isNew ? 'Yeni kayıt eklendi' : 'Kayıt güncellendi');
        closeModal('modal');
        // Small delay before refresh to let realtime catch up
        await new Promise(r => setTimeout(r, 300));
        await initApp(); // Reload data
    } else {
        console.error('Save Error:', result.error);
        showToast('Hata', 'Kayıt yapılamadı: ' + (result.error.message || result.error), 'error');
    }
}

async function handleDelete(id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;

    showLoading(true);
    const result = await deletePaymentRecord(id);
    showLoading(false);

    if (!result.error) {
        showToast('Başarılı', 'Kayıt silindi');
        await initApp();
    } else {
        showToast('Hata', 'Silinemedi', 'error');
    }
}

export { deletePaymentRecord as deletePayment }; // Export for other modules if needed
