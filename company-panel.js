// ============================================
// ŞİRKET BORÇ TAKİP PANELİ - JAVASCRIPT
// Ultra Professional Company Panel Logic
// WITH DUPLICATE PREVENTION & DEBOUNCING
// ============================================

// Global State
let companies = [];
let filteredCompanies = [];
let selectedCompanyId = null;

// Submission State - Prevents ANY duplicate submissions
const submissionState = {
    company: { isSubmitting: false, lastSubmitTime: 0 },
    payment: { isSubmitting: false, lastSubmitTime: 0 }
};

// Minimum time between submissions (ms)
const SUBMIT_COOLDOWN = 2000;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Company Panel Loading...');
    initTheme();
    await loadCompanies();
    setupEventListeners();
    setupRealtimeSubscription();
    console.log('✅ Company Panel Ready');
});

// Realtime Subscription with Debounce
let realtimeDebounceTimer = null;

function setupRealtimeSubscription() {
    if (!window.supabaseClient) return;

    console.log('📡 Setting up realtime subscription for Company Panel...');

    window.supabaseClient
        .channel('company-panel-payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
            console.log('🔔 Realtime update received:', payload.eventType);

            // Debounce realtime updates to prevent rapid refreshes
            if (realtimeDebounceTimer) {
                clearTimeout(realtimeDebounceTimer);
            }

            realtimeDebounceTimer = setTimeout(() => {
                console.log('🔄 Applying realtime update...');
                loadCompanies();

                // If detail modal is open, refresh it
                if (selectedCompanyId) {
                    const modal = document.getElementById('detailModal');
                    if (modal && modal.classList.contains('active')) {
                        openDetailModal(selectedCompanyId);
                    }
                }
            }, 500); // Wait 500ms before applying update
        })
        .subscribe();
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('searchCompany').addEventListener('input', debounce(filterCompanies, 300));
    document.getElementById('statusFilter').addEventListener('change', filterCompanies);
    document.getElementById('sortBy').addEventListener('change', filterCompanies);

    // Set default date for payment
    document.getElementById('paymentDate').valueAsDate = new Date();

    // IMPORTANT: Remove any existing form listeners and add controlled ones
    const paymentForm = document.getElementById('paymentForm');
    const companyForm = document.getElementById('companyForm');

    // Clone and replace to remove all event listeners
    if (paymentForm) {
        const newPaymentForm = paymentForm.cloneNode(true);
        paymentForm.parentNode.replaceChild(newPaymentForm, paymentForm);
    }

    if (companyForm) {
        const newCompanyForm = companyForm.cloneNode(true);
        companyForm.parentNode.replaceChild(newCompanyForm, companyForm);
    }
}

// Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Load Companies
async function loadCompanies() {
    showLoading(true);
    try {
        companies = await fetchCompanies();
        filterCompanies();
        updateStats();
    } catch (error) {
        console.error('Error loading companies:', error);
        showToast('Hata', 'Şirketler yüklenemedi', 'error');
    }
    showLoading(false);
}

// Refresh Companies
async function refreshCompanies() {
    showToast('Bilgi', 'Veriler yenileniyor...', 'info');
    await loadCompanies();
    showToast('Başarılı', 'Veriler güncellendi', 'success');
}

// Filter Companies
function filterCompanies() {
    const searchTerm = document.getElementById('searchCompany').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    filteredCompanies = companies.filter(company => {
        const matchesSearch = !searchTerm || company.name.toLowerCase().includes(searchTerm);
        let matchesStatus = true;

        if (statusFilter === 'has_debt') {
            matchesStatus = company.remaining_debt > 0;
        } else if (statusFilter === 'paid') {
            matchesStatus = company.remaining_debt <= 0;
        }

        return matchesSearch && matchesStatus;
    });

    // Sort
    filteredCompanies.sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'remaining_debt') return (b.remaining_debt || 0) - (a.remaining_debt || 0);
        if (sortBy === 'last_transaction') {
            const dateA = a.last_transaction_date ? new Date(a.last_transaction_date) : new Date(0);
            const dateB = b.last_transaction_date ? new Date(b.last_transaction_date) : new Date(0);
            return dateB - dateA;
        }
        return 0;
    });

    renderCompanyCards();
}

// Render Company Cards
function renderCompanyCards() {
    const grid = document.getElementById('companyGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredCompanies.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = filteredCompanies.map(company => {
        const percentage = parseFloat(company.payment_percentage) || 0;
        const initial = company.name.charAt(0).toUpperCase();
        const progressClass = percentage >= 100 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
        const cardClass = percentage >= 100 ? 'paid' : percentage < 25 ? 'danger' : '';

        return `
            <div class="company-card ${cardClass}">
                <div class="card-header">
                    <div class="company-info">
                        <div class="company-avatar">${initial}</div>
                        <div>
                            <h3 class="company-name">${company.name}</h3>
                            <p class="company-contact">${company.contact_person || 'İletişim bilgisi yok'}</p>
                        </div>
                    </div>
                    <button class="card-menu" onclick="showCompanyMenu('${company.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                
                <div class="progress-section">
                    <div class="progress-header">
                        <span class="progress-label">Ödeme Durumu</span>
                        <span class="progress-value">${percentage.toFixed(1)}% Ödendi</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
                
                <div class="financial-summary">
                    <div class="summary-item">
                        <span class="summary-label"><i class="fas fa-file-invoice-dollar"></i> Toplam Borç</span>
                        <span class="summary-value debt">${formatCompanyCurrency(company.total_debt, company.currency)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label"><i class="fas fa-check-circle"></i> Ödenen</span>
                        <span class="summary-value paid">${formatCompanyCurrency(company.total_paid, company.currency)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label"><i class="fas fa-clock"></i> Kalan</span>
                        <span class="summary-value remaining">${formatCompanyCurrency(company.remaining_debt, company.currency)}</span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <span class="last-transaction">
                        <i class="fas fa-calendar-alt"></i>
                        ${company.last_transaction_date ? formatCompanyDate(company.last_transaction_date) : 'Henüz işlem yok'}
                    </span>
                    <div class="card-actions">
                        <button class="btn-icon primary" onclick="openPaymentModal('${company.id}')" title="Ödeme Ekle">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-icon secondary" onclick="openDetailModal('${company.id}')" title="Detaylar">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update Stats
function updateStats() {
    let totalDebt = 0, totalPaid = 0, totalRemaining = 0;

    companies.forEach(company => {
        totalDebt += parseFloat(company.total_debt) || 0;
        totalPaid += parseFloat(company.total_paid) || 0;
        totalRemaining += parseFloat(company.remaining_debt) || 0;
    });

    document.getElementById('totalCompanies').textContent = companies.length;
    document.getElementById('totalDebtAmount').textContent = formatCompanyCurrency(totalDebt, 'TL');
    document.getElementById('totalPaidAmount').textContent = formatCompanyCurrency(totalPaid, 'TL');
    document.getElementById('totalRemainingAmount').textContent = formatCompanyCurrency(totalRemaining, 'TL');
}

// ============================================
// COMPANY MODAL - WITH DUPLICATE PREVENTION
// ============================================

function openCompanyModal(companyId = null) {
    const modal = document.getElementById('companyModal');
    const title = document.getElementById('companyModalTitle');
    const form = document.getElementById('companyForm');

    form.reset();
    document.getElementById('companyId').value = '';

    // Reset submission state
    submissionState.company.isSubmitting = false;

    if (companyId) {
        const company = companies.find(c => c.id === companyId);
        if (company) {
            title.textContent = 'Şirket Düzenle';
            document.getElementById('companyId').value = company.id;
            document.getElementById('companyName').value = company.name || '';
            document.getElementById('contactPerson').value = company.contact_person || '';
            document.getElementById('phone').value = company.phone || '';
            document.getElementById('email').value = company.email || '';
            document.getElementById('iban').value = company.iban || '';
            document.getElementById('initialDebt').value = company.initial_debt || 0;
            document.getElementById('companyCurrency').value = company.currency || 'TL';
            document.getElementById('notes').value = company.notes || '';
        }
    } else {
        title.textContent = 'Yeni Şirket Ekle';
    }

    modal.classList.add('active');
}

function closeCompanyModal() {
    submissionState.company.isSubmitting = false;
    document.getElementById('companyModal').classList.remove('active');
}

async function handleCompanySubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();

    // TRIPLE CHECK: Prevent duplicate submissions
    // 1. Check isSubmitting flag
    if (submissionState.company.isSubmitting) {
        console.log('⚠️ Company submission blocked: already submitting');
        return false;
    }

    // 2. Check cooldown period
    if ((now - submissionState.company.lastSubmitTime) < SUBMIT_COOLDOWN) {
        console.log('⚠️ Company submission blocked: cooldown active');
        showToast('Uyarı', 'Lütfen bekleyin...', 'warning');
        return false;
    }

    // Mark as submitting
    submissionState.company.isSubmitting = true;
    submissionState.company.lastSubmitTime = now;

    // Disable submit button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
    }

    const companyId = document.getElementById('companyId').value;
    const companyData = {
        name: document.getElementById('companyName').value,
        contact_person: document.getElementById('contactPerson').value || null,
        phone: document.getElementById('phone').value || null,
        email: document.getElementById('email').value || null,
        iban: document.getElementById('iban').value || null,
        initial_debt: parseFloat(document.getElementById('initialDebt').value) || 0,
        currency: document.getElementById('companyCurrency').value,
        notes: document.getElementById('notes').value || null
    };

    showLoading(true);

    try {
        let result;
        if (companyId) {
            result = await updateCompany(companyId, companyData);
        } else {
            result = await createCompany(companyData);
        }

        if (result.success) {
            showToast('Başarılı', companyId ? 'Şirket güncellendi' : 'Şirket eklendi', 'success');
            closeCompanyModal();
            // Realtime will handle refresh, but we can also manually refresh
            await loadCompanies();
        } else {
            showToast('Hata', result.error || 'İşlem başarısız', 'error');
        }
    } catch (error) {
        console.error('❌ Company submit error:', error);
        showToast('Hata', 'Beklenmeyen bir hata oluştu', 'error');
    } finally {
        showLoading(false);
        submissionState.company.isSubmitting = false;

        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Kaydet';
        }
    }

    return false;
}

// ============================================
// PAYMENT MODAL - WITH DUPLICATE PREVENTION
// ============================================

function openPaymentModal(companyId) {
    const modal = document.getElementById('paymentModal');
    const company = companies.find(c => c.id === companyId);

    if (!company) return;

    // Reset submission state
    submissionState.payment.isSubmitting = false;

    document.getElementById('paymentForm').reset();
    document.getElementById('paymentCompanyId').value = company.name;
    document.getElementById('paymentCompanyLabel').textContent = `Şirket: ${company.name}`;
    document.getElementById('paymentCurrency').value = company.currency || 'TL';
    document.getElementById('paymentDate').valueAsDate = new Date();

    // Reset submit button state
    const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Kaydet';
    }

    modal.classList.add('active');
}

function closePaymentModal() {
    submissionState.payment.isSubmitting = false;
    document.getElementById('paymentModal').classList.remove('active');
}

async function handlePaymentSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();

    // TRIPLE CHECK: Prevent duplicate submissions
    // 1. Check isSubmitting flag
    if (submissionState.payment.isSubmitting) {
        console.log('⚠️ Payment submission blocked: already submitting');
        return false;
    }

    // 2. Check cooldown period
    if ((now - submissionState.payment.lastSubmitTime) < SUBMIT_COOLDOWN) {
        console.log('⚠️ Payment submission blocked: cooldown active');
        showToast('Uyarı', 'Lütfen bekleyin...', 'warning');
        return false;
    }

    // Mark as submitting IMMEDIATELY
    submissionState.payment.isSubmitting = true;
    submissionState.payment.lastSubmitTime = now;

    // Disable submit button IMMEDIATELY
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
    }

    const paymentData = {
        company_id: document.getElementById('paymentCompanyId').value,
        payment_type: document.getElementById('paymentType').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        payment_date: document.getElementById('paymentDate').value || new Date().toISOString().split('T')[0],
        currency: document.getElementById('paymentCurrency').value,
        description: document.getElementById('paymentDescription').value || null
    };

    console.log('💰 Submitting payment:', paymentData);

    showLoading(true);

    try {
        const result = await addCompanyPayment(paymentData);

        if (result.success) {
            const type = paymentData.payment_type === 'ÖDEME' ? 'Ödeme' : 'Borç';
            showToast('Başarılı', `${type} kaydedildi`, 'success');
            closePaymentModal();
            // Manual refresh in addition to realtime
            await loadCompanies();
        } else {
            showToast('Hata', result.error || 'İşlem başarısız', 'error');
        }
    } catch (error) {
        console.error('❌ Payment submit error:', error);
        showToast('Hata', 'Beklenmeyen bir hata oluştu', 'error');
    } finally {
        showLoading(false);
        submissionState.payment.isSubmitting = false;

        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Kaydet';
        }
    }

    return false;
}

// ============================================
// DETAIL MODAL
// ============================================

async function openDetailModal(companyId) {
    const modal = document.getElementById('detailModal');
    const company = companies.find(c => c.id === companyId);

    if (!company) return;

    // Track selected company for realtime updates
    selectedCompanyId = companyId;

    document.getElementById('detailModalTitle').textContent = company.name;

    // Render Summary
    document.getElementById('detailSummary').innerHTML = `
        <div class="detail-stat">
            <div class="detail-stat-label">Toplam Borç</div>
            <div class="detail-stat-value" style="color: #ef4444;">${formatCompanyCurrency(company.total_debt, company.currency)}</div>
        </div>
        <div class="detail-stat">
            <div class="detail-stat-label">Ödenen</div>
            <div class="detail-stat-value" style="color: #10b981;">${formatCompanyCurrency(company.total_paid, company.currency)}</div>
        </div>
        <div class="detail-stat">
            <div class="detail-stat-label">Kalan</div>
            <div class="detail-stat-value" style="color: #f59e0b;">${formatCompanyCurrency(company.remaining_debt, company.currency)}</div>
        </div>
        <div class="detail-stat">
            <div class="detail-stat-label">İşlem Sayısı</div>
            <div class="detail-stat-value">${company.transaction_count || 0}</div>
        </div>
    `;

    // Load Transactions
    const transactions = await fetchCompanyPayments(company.name);

    document.getElementById('transactionList').innerHTML = transactions.length > 0
        ? transactions.map(t => `
                <div class="transaction-item">
                    <div class="transaction-icon ${t.payment_type === 'ÖDEME' ? 'payment' : 'debt'}">
                        <i class="fas ${t.payment_type === 'ÖDEME' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-description">${t.description || (t.payment_type === 'ÖDEME' ? 'Ödeme' : 'Borç')}</div>
                        <div class="transaction-date">${formatCompanyDate(t.payment_date)}</div>
                    </div>
                    <div class="transaction-amount ${t.payment_type === 'ÖDEME' ? 'payment' : 'debt'}">
                        ${t.payment_type === 'ÖDEME' ? '-' : '+'}${formatCompanyCurrency(t.payment_type === 'ÖDEME' ? (t.paid_amount || t.amount) : t.amount, t.currency)}
                    </div>
                    <button class="btn-icon-sm delete-btn" onclick="deleteTransaction('${t.id}')" title="Kaydı Sil" style="margin-left: 1rem; color: #ef4444; background: none; border: none; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
        `).join('')
        : '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Henüz işlem bulunmuyor</p>';

    modal.classList.add('active');
}

function closeDetailModal() {
    selectedCompanyId = null;
    document.getElementById('detailModal').classList.remove('active');
}

// Transaction Delete
async function deleteTransaction(transactionId) {
    if (!confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?')) return;

    showLoading(true);
    try {
        const result = await deleteCompanyPayment(transactionId);
        if (result.success) {
            showToast('Başarılı', 'Kayıt silindi', 'success');
            await loadCompanies();

            // Refresh modal if still open
            const currentCompanyName = document.getElementById('detailModalTitle').textContent;
            const company = companies.find(c => c.name === currentCompanyName);
            if (company) {
                openDetailModal(company.id);
            } else {
                closeDetailModal();
            }
        } else {
            showToast('Hata', result.error || 'Silme işlemi başarısız', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Hata', 'Bir hata oluştu', 'error');
    } finally {
        showLoading(false);
    }
}

// Company Menu
function showCompanyMenu(companyId) {
    if (confirm('Şirketi düzenlemek ister misiniz?')) {
        openCompanyModal(companyId);
    }
}

// Loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

// Toast
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
