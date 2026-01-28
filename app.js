// ============================================
// ÖDEME YÖNETİM SİSTEMİ - ULTRA PROFESSIONAL JAVASCRIPT
// Supabase Integration • Dark Mode • Advanced Interactions
// Performance Optimized • Keyboard Shortcuts
// ============================================

// Supabase Configuration
const SUPABASE_URL = 'https://anlwfmnibmzuffokzelx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubHdmbW5pYm16dWZmb2t6ZWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODg5MTQsImV4cCI6MjA4NDI2NDkxNH0.URWAphkOgfcrghNs1olm1F-mvUC5PJp872MZHLTT78M';

// Global state
let supabaseClient = null;
let payments = [];
let filteredPayments = [];
let currentSort = { field: 'sira_no', order: 'asc' };
let currencyRates = {
    usd_to_tl: 34.50,
    eur_to_tl: 37.20,
    stg_to_tl: 43.80
};
let selectedPayments = new Set();
let dateRange = { start: null, end: null };

// Chart instances
let trendChart = null;
let distributionChart = null;
let categoryChart = null;
let currencyChart = null;
let dateRangePicker = null;

// Initialize Supabase client with detailed error handling
function initSupabase() {
    console.log('🔧 Initializing Supabase client...');
    console.log('📋 Supabase URL:', SUPABASE_URL);
    console.log('🔑 Supabase Key present:', !!SUPABASE_ANON_KEY);
    
    try {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            console.error('❌ Supabase URL or ANON_KEY is missing!');
            console.error('❌ URL:', SUPABASE_URL);
            console.error('❌ Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');
            return null;
        }
        
        if (!SUPABASE_URL.startsWith('https://')) {
            console.error('❌ Invalid Supabase URL format. Must start with https://');
            console.error('❌ Current URL:', SUPABASE_URL);
            return null;
        }
        
        if (!window.supabase) {
            console.error('❌ Supabase library not loaded!');
            console.error('❌ window.supabase is undefined');
            console.error('❌ Check if → CDN script is properly loaded in index.html');
            return null;
        }
        
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase client initialized successfully');
        console.log('✅ Client object created:', !!supabaseClient);
        
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        console.error('❌ Error details:', error.message);
        return null;
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM Content Loaded');
    
    initTheme();
    initSupabase();
    initRippleEffects();
    initKeyboardShortcuts();
    
    await initializeApp();
    
    console.log('✅ Application ready');
});

// ===== THEME MANAGEMENT =====
function initTheme() {
    console.log('🎨 Initializing theme...');
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    console.log(`✅ Theme initialized: ${savedTheme}`);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
    
    console.log(`🎨 Theme changed: ${currentTheme} → ${newTheme}`);
    showToast('Tema', `${newTheme === 'dark' ? 'Karanlık' : 'Aydınlık'} mod aktif`, 'info');
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        icon.style.animation = 'iconSpin 0.5s ease';
        setTimeout(() => {
            icon.style.animation = '';
        }, 500);
    }
}

// ===== RIPPLE EFFECT =====
function initRippleEffects() {
    const buttons = document.querySelectorAll('.btn, .theme-toggle');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboardShortcuts() {
    console.log('⌨️ Initializing keyboard shortcuts...');
    
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal('add');
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        if (e.key === 'Escape') {
            closeModal();
            closeCurrencyModal();
        }
    });
    
    console.log('✅ Keyboard shortcuts initialized');
}

// Initialize application - Fail-safe version
async function initializeApp() {
    console.log('🚀 Starting application initialization...');
    
    const loadingTimeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout - forcing hide');
        forceHideLoading();
    }, 5000);
    
    try {
        showLoading(true);
        
        console.log('📦 Loading demo data...');
        payments = getDemoData();
        
        try {
            if (supabaseClient) {
                console.log('🔄 Attempting Supabase connection...');
                
                const { data, error } = await supabaseClient
                    .from('payments')
                    .select('*')
                    .order('sira_no', { ascending: true });
                
                if (!error && data && data.length > 0) {
                    console.log(`✅ Successfully loaded ${data.length} payments from Supabase`);
                    payments = data;
                    showToast('Başarılı', 'Veriler Supabase\'den yüklendi', 'success');
                } else {
                    console.log('⚠️ Using demo data (Supabase unavailable or empty)');
                    showToast('Bilgi', 'Demo modunda çalışıyor', 'info');
                }
            } else {
                console.log('⚠️ Supabase not configured, using demo data');
            }
        } catch (supabaseError) {
            console.error('❌ Supabase error:', supabaseError);
            console.log('📦 Continuing with demo data');
            showToast('Uyarı', 'Supabase bağlantısı başarısız, demo mod aktif', 'warning');
        }
        
        try {
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('currency_rates')
                    .select('*')
                    .eq('donem', 'OCAK 2026')
                    .single();
                
                if (!error && data) {
                    currencyRates = {
                        usd_to_tl: data.usd_to_tl,
                        eur_to_tl: data.eur_to_tl,
                        stg_to_tl: data.stg_to_tl
                    };
                    console.log('✅ Currency rates loaded from Supabase');
                }
            }
        } catch (rateError) {
            console.log('Using default currency rates');
        }
        
        updateCurrencyDisplay();
        filterData();
        updateStats();
        
        clearTimeout(loadingTimeout);
        
        showLoading(false);
        
        console.log('✅ Application initialized successfully');
        
                // Initialize charts AFTER data is loaded
        console.log('🔍 Checking before charts initialization...');
        console.log('📊 Payments loaded:', payments.length);
        console.log('📊 Filtered payments:', filteredPayments.length);
        console.log('📊 Chart.js available:', typeof Chart !== 'undefined');
        console.log('📊 Chart global:', !!window.Chart);
        console.log('📊 initializeCharts function:', typeof initializeCharts);
        
        if (typeof initializeCharts === 'function') {
            try {
                console.log('📊 Calling initializeCharts()...');
                initializeCharts();
            } catch (chartError) {
                console.error('❌ Charts initialization error:', chartError);
                console.error('❌ Error stack:', chartError.stack);
                console.log('⚠️ Continuing without charts');
            }
        } else {
            console.error('❌ initializeCharts is not a function!');
        }
        
    } catch (error) {
        console.error('❌ Fatal initialization error:', error);
        
        clearTimeout(loadingTimeout);
        
        payments = getDemoData();
        filterData();
        updateStats();
        
        forceHideLoading();
        
        console.log('✅ Application running in demo mode');
    }
}

// Load payments from Supabase
async function loadPayments() {
    try {
        if (!supabaseClient) {
            console.warn('Supabase not configured, using demo data');
            payments = getDemoData();
            return;
        }
        
        const { data, error } = await supabaseClient
            .from('payments')
            .select('*')
            .order('sira_no', { ascending: true });
        
        if (error) throw error;
        
        payments = data || [];
        console.log(`Loaded ${payments.length} payments`);
    } catch (error) {
        console.error('Error loading payments:', error);
        payments = getDemoData();
        showToast('Uyarı', 'Sunucu verileri yüklenemedi, demo veriler kullanılıyor', 'warning');
    }
}

// Load currency rates from Supabase
async function loadCurrencyRates() {
    try {
        if (!supabaseClient) {
            console.warn('Supabase not configured, using default rates');
            updateCurrencyDisplay();
            return;
        }
        
        const { data, error } = await supabaseClient
            .from('currency_rates')
            .select('*')
            .eq('donem', 'OCAK 2026')
            .single();
        
        if (error) {
            console.warn('Currency rates not found, using defaults');
            updateCurrencyDisplay();
            return;
        }
        
        if (data) {
            currencyRates = {
                usd_to_tl: data.usd_to_tl,
                eur_to_tl: data.eur_to_tl,
                stg_to_tl: data.stg_to_tl
            };
        }
        
        updateCurrencyDisplay();
    } catch (error) {
        console.error('Error loading currency rates:', error);
        updateCurrencyDisplay();
    }
}

// Update currency display
function updateCurrencyDisplay() {
    document.getElementById('usdRate').textContent = currencyRates.usd_to_tl.toFixed(4);
    document.getElementById('eurRate').textContent = currencyRates.eur_to_tl.toFixed(4);
    document.getElementById('stgRate').textContent = currencyRates.stg_to_tl.toFixed(4);
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedFilterData = debounce(filterData, 300);

// Filter data based on search and filters
function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const faturaFilter = document.getElementById('faturaFilter').value;
    const paraBirimiFilter = document.getElementById('paraBirimiFilter').value;
    const odemeFilter = document.getElementById('odemeFilter').value;
    
    filteredPayments = payments.filter(payment => {
        const matchesSearch = !searchTerm || 
            payment.odeme_kalemleri?.toLowerCase().includes(searchTerm) ||
            payment.firma_fatura_ismi?.toLowerCase().includes(searchTerm) ||
            payment.isin_adi?.toLowerCase().includes(searchTerm);
        
        const matchesFatura = !faturaFilter || payment.fatura_durumu === faturaFilter;
        const matchesParaBirimi = !paraBirimiFilter || payment.para_birimi === paraBirimiFilter;
        const matchesOdeme = !odemeFilter || payment.odeme_durumu === odemeFilter;
        
        return matchesSearch && matchesFatura && matchesParaBirimi && matchesOdeme;
    });
    
    sortData(currentSort.field, currentSort.order);
    renderTable();
    updateStats();
    refreshCharts();
}

// Sort data
function sortData(field, order) {
    currentSort = { field, order };
    
    filteredPayments.sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        if (valueA == null) return 1;
        if (valueB == null) return -1;
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return order === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
        
        if (order === 'asc') {
            return valueA.localeCompare(valueB);
        } else {
            return valueB.localeCompare(valueA);
        }
    });
    
    renderTable();
}

// Sort table by column
function sortTable(field) {
    if (currentSort.field === field) {
        sortData(field, currentSort.order === 'asc' ? 'desc' : 'asc');
    } else {
        sortData(field, 'asc');
    }
}

// Render table
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredPayments.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    tableBody.innerHTML = filteredPayments.map(payment => `
        <tr>
            <td>${payment.sira_no || '-'}</td>
            <td><strong>${payment.odeme_kalemleri || '-'}</strong></td>
            <td>${payment.firma_fatura_ismi || '-'}</td>
            <td>${payment.isin_nevi || '-'}</td>
            <td>${getFaturaBadge(payment.fatura_durumu)}</td>
            <td>${payment.isin_adi || '-'}</td>
            <td>${getParaBirimiBadge(payment.para_birimi)}</td>
            <td>${formatCurrency(payment.onceki_donemden_kalan_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.bu_ayki_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.toplam_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.bu_ay_odenen, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.kalan, payment.para_birimi)}</td>
            <td>${getOdemeBadge(payment.odeme_durumu)}</td>
            <td>${getDocumentLink(payment.ekrak_yukleme_url)}</td>
            <td>
                <button class="action-btn action-btn-edit" onclick="openModal('edit', '${payment.id}')" title="Düzenle">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn action-btn-delete" onclick="deletePayment('${payment.id}')" title="Sil">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get fatura badge HTML
function getFaturaBadge(status) {
    const badges = {
        'FATURALI': '<span class="badge badge-success">Faturalı</span>',
        'FATURASIZ': '<span class="badge badge-warning">Faturasız</span>'
    };
    return badges[status] || '<span class="badge badge-gray">-</span>';
}

// Get para birimi badge HTML
function getParaBirimiBadge(currency) {
    const colors = {
        'TL': 'info',
        'USD': 'success',
        'EUR': 'purple',
        'STG': 'danger'
    };
    const color = colors[currency] || 'gray';
    return `<span class="badge badge-${color}">${currency}</span>`;
}

// Get ödeme badge HTML
function getOdemeBadge(status) {
    const badges = {
        'ÖDENDİ': '<span class="badge badge-success"><i class="fas fa-check"></i> Ödenmiş</span>',
        'KISMEN ÖDENDİ': '<span class="badge badge-warning"><i class="fas fa-clock"></i> Kısmen</span>',
        'ÖDENMEDİ': '<span class="badge badge-danger"><i class="fas fa-times"></i> Ödenmemiş</span>',
        'BEKLEMEDE': '<span class="badge badge-gray"><i class="fas fa-hourglass-half"></i> Beklemede</span>'
    };
    return badges[status] || '<span class="badge badge-gray">-</span>';
}

// Get document link HTML
function getDocumentLink(url) {
    if (!url) return '<span class="no-doc">Yok</span>';
    return `
        <a href="${url}" target="_blank" class="doc-link" title="Dökümanı görüntüle">
            <i class="fas fa-file-pdf"></i>
            Görüntüle
        </a>
    `;
}

// Format currency
function formatCurrency(value, currency = 'TL') {
    if (value == null) return '-';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';
    
    const formatted = numValue.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${currency} ${formatted}`;
}

// Update statistics
function updateStats() {
    const totalRecords = filteredPayments.length;
    let totalPaid = 0;
    let totalRemaining = 0;
    let totalDebt = 0;
    
    filteredPayments.forEach(payment => {
        const currency = payment.para_birimi || 'TL';
        const rate = getCurrencyRate(currency);
        
        const buAyOdenenTL = payment.bu_ay_odenen * rate;
        const kalanTL = payment.kalan * rate;
        const toplamBorcTL = payment.toplam_borc * rate;
        
        totalPaid += buAyOdenenTL;
        totalRemaining += kalanTL;
        totalDebt += toplamBorcTL;
    });
    
    document.getElementById('totalRecords').textContent = totalRecords;
    document.getElementById('totalPaid').textContent = `₺${formatNumber(totalPaid)}`;
    document.getElementById('totalRemaining').textContent = `₺${formatNumber(totalRemaining)}`;
    document.getElementById('totalDebt').textContent = `₺${formatNumber(totalDebt)}`;
}

// Get currency rate for conversion to TL
function getCurrencyRate(currency) {
    const rates = {
        'TL': 1,
        'USD': currencyRates.usd_to_tl,
        'EUR': currencyRates.eur_to_tl,
        'STG': currencyRates.stg_to_tl
    };
    return rates[currency] || 1;
}

// Format number
function formatNumber(value) {
    return value.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('faturaFilter').value = '';
    document.getElementById('paraBirimiFilter').value = '';
    document.getElementById('odemeFilter').value = '';
    filterData();
}

// Refresh data
async function refreshData() {
    showToast('Bilgi', 'Veriler yenileniyor...', 'info');
    showLoading(true);
    await Promise.all([
        loadPayments(),
        loadCurrencyRates()
    ]);
    filterData();
    showLoading(false);
    showToast('Başarılı', 'Veriler başarıyla yenilendi', 'success');
}

// Auto-save form data to localStorage
function saveFormDataToLocalStorage() {
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (value) {
            data[key] = value;
        }
    }
    
    localStorage.setItem('paymentFormDraft', JSON.stringify(data));
    console.log('💾 Form data saved to localStorage');
}

// Load form data from localStorage
function loadFormDataFromLocalStorage() {
    const savedData = localStorage.getItem('paymentFormDraft');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element && element.tagName === 'INPUT' && element.type !== 'hidden') {
                    element.value = data[key];
                }
            });
            
            console.log('📂 Form data loaded from localStorage');
        } catch (error) {
            console.error('❌ Error loading form data:', error);
        }
    }
}

// Clear form data from localStorage
function clearFormDataFromLocalStorage() {
    localStorage.removeItem('paymentFormDraft');
    console.log('🗑️ Form data cleared from localStorage');
}

// Open modal
function openModal(mode, id = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('paymentForm');
    
    form.reset();
    document.getElementById('paymentId').value = '';
    document.getElementById('filePreview').innerHTML = '';
    
    if (mode === 'add') {
        clearFormDataFromLocalStorage();
    }
    
    if (mode === 'edit' && id) {
        const payment = payments.find(p => p.id === id);
        if (payment) {
            modalTitle.textContent = 'Ödeme Kaydını Düzenle';
            document.getElementById('paymentId').value = payment.id;
            document.getElementById('siraNo').value = payment.sira_no || '';
            document.getElementById('odemeKalemleri').value = payment.odeme_kalemleri || '';
            document.getElementById('firmaFaturaIsmi').value = payment.firma_fatura_ismi || '';
            document.getElementById('firmaIbanlari').value = payment.firma_ibanlari || '';
            document.getElementById('isinNevi').value = payment.isin_nevi || '';
            document.getElementById('faturaDurumu').value = payment.fatura_durumu || '';
            document.getElementById('isinAdi').value = payment.isin_adi || '';
            document.getElementById('paraBirimi').value = payment.para_birimi || '';
            document.getElementById('oncekiBorc').value = payment.onceki_donemden_kalan_borc || 0;
            document.getElementById('buAykiBorc').value = payment.bu_ayki_borc || 0;
            document.getElementById('toplamBorc').value = payment.toplam_borc || 0;
            document.getElementById('buAyOdenen').value = payment.bu_ay_odenen || 0;
            document.getElementById('kalan').value = payment.kalan || 0;
            document.getElementById('odemeDurumu').value = payment.odeme_durumu || '';
            document.getElementById('ekrakYuklemeUrl').value = payment.ekrak_yukleme_url || '';
            
            if (payment.ekrak_yukleme_url) {
                document.getElementById('filePreview').innerHTML = `
                    <i class="fas fa-file-alt"></i> Mevcut döküman yüklü
                `;
            }
        }
    } else {
        modalTitle.textContent = 'Yeni Ödeme Kaydı';
    }
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    try {
        const paymentId = document.getElementById('paymentId').value;
        const paymentData = {
            sira_no: parseInt(document.getElementById('siraNo').value),
            odeme_kalemleri: document.getElementById('odemeKalemleri').value,
            firma_fatura_ismi: document.getElementById('firmaFaturaIsmi').value || null,
            firma_ibanlari: document.getElementById('firmaIbanlari').value || null,
            isin_nevi: document.getElementById('isinNevi').value,
            fatura_durumu: document.getElementById('faturaDurumu').value,
            isin_adi: document.getElementById('isinAdi').value || null,
            para_birimi: document.getElementById('paraBirimi').value,
            onceki_donemden_kalan_borc: parseFloat(document.getElementById('oncekiBorc').value) || 0,
            bu_ayki_borc: parseFloat(document.getElementById('buAykiBorc').value) || 0,
            toplam_borc: parseFloat(document.getElementById('toplamBorc').value) || 0,
            bu_ay_odenen: parseFloat(document.getElementById('buAyOdenen').value) || 0,
            kalan: parseFloat(document.getElementById('kalan').value) || 0,
            odeme_durumu: document.getElementById('odemeDurumu').value,
            ekrak_yukleme_url: document.getElementById('ekrakYuklemeUrl').value || null,
            donem: 'OCAK 2026'
        };
        
        showLoading(true);
        
        if (!supabaseClient) {
            if (paymentId) {
                const index = payments.findIndex(p => p.id === paymentId);
                if (index !== -1) {
                    payments[index] = { ...payments[index], ...paymentData };
                }
            } else {
                payments.push({
                    id: generateUUID(),
                    ...paymentData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
            
            showToast('Başarılı', paymentId ? 'Kayıt güncellendi' : 'Yeni kayıt oluşturuldu', 'success');
        } else {
            if (paymentId) {
                const { error } = await supabaseClient
                    .from('payments')
                    .update(paymentData)
                    .eq('id', paymentId);
                
                if (error) throw error;
                
                showToast('Başarılı', 'Kayıt başarıyla güncellendi', 'success');
            } else {
                const { error } = await supabaseClient
                    .from('payments')
                    .insert([paymentData]);
                
                if (error) throw error;
                
                showToast('Başarılı', 'Yeni kayıt başarıyla oluşturuldu', 'success');
            }
            
            await loadPayments();
        }
        
        closeModal();
        filterData();
        showLoading(false);
    } catch (error) {
        console.error('Error saving payment:', error);
        showToast('Hata', 'Kayıt kaydedilirken bir hata oluştu', 'error');
        showLoading(false);
    }
}

// Delete payment
async function deletePayment(id) {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        if (!supabaseClient) {
            payments = payments.filter(p => p.id !== id);
        } else {
            const { error } = await supabaseClient
                .from('payments')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            await loadPayments();
        }
        
        filterData();
        showToast('Başarılı', 'Kayıt başarıyla silindi', 'success');
        showLoading(false);
    } catch (error) {
        console.error('Error deleting payment:', error);
        showToast('Hata', 'Kayıt silinirken bir hata oluştu', 'error');
        showLoading(false);
    }
}

// Handle file upload
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('filePreview').innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> Yükleniyor: ${file.name}
    `;
    
    try {
        if (!supabaseClient) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            document.getElementById('ekrakYuklemeUrl').value = 'demo-file-url';
            document.getElementById('filePreview').innerHTML = `
                <i class="fas fa-check"></i> ${file.name} (Demo mod)
            `;
            showToast('Uyarı', 'Demo mod: dosya yüklenmedi', 'warning');
            return;
        }
        
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabaseClient.storage
            .from('payment-documents')
            .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: publicUrlData } = supabaseClient.storage
            .from('payment-documents')
            .getPublicUrl(fileName);
        
        document.getElementById('ekrakYuklemeUrl').value = publicUrlData.publicUrl;
        document.getElementById('filePreview').innerHTML = `
            <i class="fas fa-check"></i> ${file.name}
        `;
        
        showToast('Başarılı', 'Dosya başarıyla yüklendi', 'success');
    } catch (error) {
        console.error('Error uploading file:', error);
        document.getElementById('filePreview').innerHTML = '';
        showToast('Hata', 'Dosya yüklenirken bir hata oluştu', 'error');
    }
}

// Edit currency rates
function editCurrencyRates() {
    const modal = document.getElementById('currencyModal');
    document.getElementById('usdToTl').value = currencyRates.usd_to_tl;
    document.getElementById('eurToTl').value = currencyRates.eur_to_tl;
    document.getElementById('stgToTl').value = currencyRates.stg_to_tl;
    modal.classList.add('active');
}

// Close currency modal
function closeCurrencyModal() {
    const modal = document.getElementById('currencyModal');
    modal.classList.remove('active');
}

// Handle currency rate submission
async function handleCurrencySubmit(event) {
    event.preventDefault();
    
    try {
        currencyRates = {
            usd_to_tl: parseFloat(document.getElementById('usdToTl').value),
            eur_to_tl: parseFloat(document.getElementById('eurToTl').value),
            stg_to_tl: parseFloat(document.getElementById('stgToTl').value)
        };
        
        showLoading(true);
        
        if (!supabaseClient) {
            console.log('Currency rates updated (demo mode)');
        } else {
            const { error } = await supabaseClient
                .from('currency_rates')
                .upsert({
                    donem: 'OCAK 2026',
                    usd_to_tl: currencyRates.usd_to_tl,
                    eur_to_tl: currencyRates.eur_to_tl,
                    stg_to_tl: currencyRates.stg_to_tl
                });
            
            if (error) throw error;
        }
        
        updateCurrencyDisplay();
        updateStats();
        closeCurrencyModal();
        showLoading(false);
        showToast('Başarılı', 'Kur bilgileri güncellendi', 'success');
    } catch (error) {
        console.error('Error updating currency rates:', error);
        showToast('Hata', 'Kur bilgileri güncellenirken bir hata oluştu', 'error');
        showLoading(false);
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Force hide loading overlay (emergency function)
function forceHideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log('🔒 Loading force-hidden');
    }
}

// Show toast notification
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--info)'
    };
    
    toastIcon.className = `fas ${icons[type] || icons.success}`;
    toast.querySelector('.toast-icon').style.background = `${colors[type] || colors.success}20`;
    toast.querySelector('.toast-icon').style.color = colors[type] || colors.success;
    
    toast.classList.remove('hide');
    toast.style.display = 'flex';
    
    setTimeout(() => {
        hideToast();
    }, 4000);
}

// Hide toast notification
function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hide');
    setTimeout(() => {
        toast.style.display = 'none';
        toast.classList.remove('hide');
    }, 300);
}

// Generate UUID for demo mode
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Get demo data (fallback when Supabase is not configured)
function getDemoData() {
    return [
        {id: generateUUID(), sira_no: 1, odeme_kalemleri: 'SGK (REPSAM)', firma_fatura_ismi: 'KEMAL BATMAZOĞLU', isin_nevi: 'RESMİ KURUM HARÇLARI', fatura_durumu: 'FATURALI', isin_adi: 'GZ', para_birimi: 'TL', onceki_donemden_kalan_borc: 565, bu_ayki_borc: 0, toplam_borc: 0, bu_ay_odenen: 0, kalan: 0, odeme_durumu: 'ÖDENMEDİ', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 2, odeme_kalemleri: 'RESMİ MUHASEBE GİDERİ', firma_fatura_ismi: 'KEMAL BATMAZOĞLU', isin_nevi: 'RESMİ KURUM HARÇLARI', fatura_durumu: 'FATURASIZ', isin_adi: 'CNN', para_birimi: 'TL', onceki_donemden_kalan_borc: 565, bu_ayki_borc: 0, toplam_borc: 0, bu_ay_odenen: 0, kalan: 0, odeme_durumu: 'ÖDENMEDİ', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 3, odeme_kalemleri: 'SGK(CAPRA )', firma_fatura_ismi: 'ERGÜN DOLMACI & Co.', isin_nevi: 'RESMİ KURUM HARÇLARI', fatura_durumu: 'FATURALI', isin_adi: 'ASKERİYE', para_birimi: 'TL', onceki_donemden_kalan_borc: 565, bu_ayki_borc: 5000, toplam_borc: 5565, bu_ay_odenen: 150000, kalan: -144435, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 4, odeme_kalemleri: 'SU FATURALARI', firma_fatura_ismi: null, isin_nevi: 'RESMİ KURUM HARÇLARI', fatura_durumu: 'FATURASIZ', isin_adi: 'MERİT', para_birimi: 'TL', onceki_donemden_kalan_borc: 565, bu_ayki_borc: 5000, toplam_borc: 5565, bu_ay_odenen: 150000, kalan: -144435, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 5, odeme_kalemleri: 'ELEKTRİK FATURALARI', firma_fatura_ismi: null, isin_nevi: 'RESMİ KURUM HARÇLARI', fatura_durumu: 'FATURALI', isin_adi: 'BALO', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 6, odeme_kalemleri: 'ÖMER DİLMAÇ', firma_fatura_ismi: 'ÖMER DİLMAÇ', isin_nevi: 'NAKLİYE', fatura_durumu: 'FATURASIZ', isin_adi: 'KANER', para_birimi: 'USD', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 7, odeme_kalemleri: 'ÖMER DİLMAÇ', firma_fatura_ismi: 'ÖMER DİLMAÇ', isin_nevi: 'NAKLİYE', fatura_durumu: 'FATURALI', isin_adi: 'GZ', para_birimi: 'TL', onceki_donemden_kalan_borc: 25000, bu_ayki_borc: 154268, toplam_borc: 179268, bu_ay_odenen: 150000, kalan: 29268, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 8, odeme_kalemleri: 'TDA OTO (Honda & Yaris)', firma_fatura_ismi: null, isin_nevi: 'DEMİR BAŞ', fatura_durumu: 'FATURASIZ', isin_adi: 'GZ', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 9, odeme_kalemleri: 'ENVER DÜZKAR', firma_fatura_ismi: 'ENVER DÜZKAR', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURALI', isin_adi: 'ETKİNLİK MEYDANI', para_birimi: 'STG', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 10, odeme_kalemleri: 'EDİZ METAL', firma_fatura_ismi: 'KAİZ TRADING LTD', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'MUTFAK', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 11, odeme_kalemleri: 'ALİ ÇELİK (GZ OTEL BLOK DUVAR İŞLERİ)', firma_fatura_ismi: 'ALİ ÇELİK', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURALI', isin_adi: 'GZ', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 12, odeme_kalemleri: 'KEMAL GÜREŞÇİOĞLU', firma_fatura_ismi: null, isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'İŞÇİ LOJMAN', para_birimi: 'EUR', onceki_donemden_kalan_borc: 25000, bu_ayki_borc: 154268, toplam_borc: 179268, bu_ay_odenen: 150000, kalan: 29268, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 13, odeme_kalemleri: 'OYTUN YUNAK', firma_fatura_ismi: 'OYTUN YUNAK', isin_nevi: 'MALZEME TEDARİĞİ', fatura_durumu: 'FATURALI', isin_adi: 'DOME TAKSİ', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 14, odeme_kalemleri: 'CONAK ARD GERME', firma_fatura_ismi: null, isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'GZ', para_birimi: 'EUR', onceki_donemden_kalan_borc: 25000, bu_ayki_borc: 154268, toplam_borc: 179268, bu_ay_odenen: 150000, kalan: 29268, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 15, odeme_kalemleri: 'EDNA ERSOYOĞLU (İŞÇİ LOJMAN İNCE TEMİZLİK)', firma_fatura_ismi: 'EDNA ERSOYOĞLU', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: null, para_birimi: 'TL', onceki_donemden_kalan_borc: 25000, bu_ayki_borc: 154268, toplam_borc: 179268, bu_ay_odenen: 150000, kalan: 29268, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 16, odeme_kalemleri: 'DAP METAL LTD', firma_fatura_ismi: 'DAP METAL LTD', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURALI', isin_adi: 'GZ', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 17, odeme_kalemleri: 'CAHİT NECİPOĞLU', firma_fatura_ismi: 'CAHİT NECİPOĞLU', isin_nevi: 'MALZEME TEDARİĞİ', fatura_durumu: 'FATURASIZ', isin_adi: 'ETKİNLİK MEYDANI', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 18, odeme_kalemleri: 'HÜDAVERDİ ÇÖYGÜN', firma_fatura_ismi: 'HÜDAVERDİ ÇÖYGÜN', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'ETKİNLİK MEYDANI', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 19, odeme_kalemleri: 'ED&NA FORKLİFT VİNÇ', firma_fatura_ismi: null, isin_nevi: 'MAKİNE EKİPMAN', fatura_durumu: 'FATURALI', isin_adi: 'CASINO', para_birimi: 'USD', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 20, odeme_kalemleri: 'MEPAŞ', firma_fatura_ismi: 'MEPAŞ LTD', isin_nevi: 'MALZEME TEDARİĞİ', fatura_durumu: 'FATURASIZ', isin_adi: 'CASINO', para_birimi: 'USD', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 21, odeme_kalemleri: 'MEPAŞ', firma_fatura_ismi: 'MEPAŞ LTD', isin_nevi: 'MALZEME TEDARİĞİ', fatura_durumu: 'FATURALI', isin_adi: 'CASINO', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 22, odeme_kalemleri: 'MEPAŞ', firma_fatura_ismi: 'MEPAŞ LTD', isin_nevi: 'MALZEME TEDARİĞİ', fatura_durumu: 'FATURALI', isin_adi: 'CASINO', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 23, odeme_kalemleri: 'ANKASAV', firma_fatura_ismi: 'ANKASAV SAVUNMA ÇELİK YAPI TURİZM İNŞAAT SANAYİ VE TİCARET LTD', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURALI', isin_adi: 'MOCK-UP 2. ÜNİTE', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 24, odeme_kalemleri: 'ANKASAV', firma_fatura_ismi: 'ANKASAV SAVUNMA ÇELİK YAPI TURİZM İNŞAAT SANAYİ VE TİCARET LTD', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'CASINO', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 25, odeme_kalemleri: 'MTH FATİH AKALIN CASINO FATURA ÖDEMESİ', firma_fatura_ismi: 'MTH YAPI IMALAT ENERJI YAZILIM SANAYI TICARET LIMITED SIRKETI', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURALI', isin_adi: 'CASINO', para_birimi: 'TL', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
        {id: generateUUID(), sira_no: 26, odeme_kalemleri: 'MTH FATİH AKALIN CASINO AVANS ÖDEMESİ 2.HAKEDİŞ', firma_fatura_ismi: 'MTH YAPI IMALAT ENERJI YAZILIM SANAYI TICARET LIMITED SIRKETI', isin_nevi: 'TAŞERON', fatura_durumu: 'FATURASIZ', isin_adi: 'CASINO', para_birimi: 'EUR', onceki_donemden_kalan_borc: 150000, bu_ayki_borc: 5000, toplam_borc: 155000, bu_ay_odenen: 150000, kalan: 5000, odeme_durumu: 'BEKLEMEDE', donem: 'OCAK 2026', created_at: new Date().toISOString(), updated_at: new Date().toISOString()}
    ];
}

// ===== ANALYTICS CHARTS =====
// Global trend chart state for advanced features
let trendChartState = {
    data: [],
    filteredData: [],
    dateRange: { start: null, end: null },
    isReady: false,
    lastUpdate: null
};

function initializeCharts() {
    console.log('📊 Initializing charts...');
    
    // Verify Chart.js is available
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js is not loaded');
        console.warn('⚠️ Will retry when script is loaded');
        
        // Add script load listener for Chart.js
        document.addEventListener('DOMContentLoaded', checkChartJS);
        window.addEventListener('load', checkChartJS);
        
        // Check every 500ms if Chart.js is loaded
        const chartInterval = setInterval(() => {
            if (typeof Chart !== 'undefined' && !trendChartState.isReady) {
                console.log('✅ Chart.js detected after interval check');
                initTrendChart();
                clearInterval(chartInterval);
            }
        }, 500);
        
        // Clear interval after 10 seconds
        setTimeout(() => clearInterval(chartInterval), 10000);
        
        return;
    }
    
    if (typeof Chart !== 'function') {
        console.error('❌ Chart is not a function!');
        console.error('❌ Chart type:', typeof Chart);
        console.error('❌ Chart:', Chart);
        return;
    }
    
    console.log('✅ Chart.js is available and ready');
    
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    
    // Set Chart defaults
    try {
        Chart.defaults.color = textColor;
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.grid.color = gridColor;
        Chart.defaults.borderColor = gridColor;
    } catch (error) {
        console.error('❌ Error setting Chart defaults:', error);
    }
    
    // Initialize individual charts with error handling
    try {
        initTrendChart();
    } catch (error) {
        console.error('❌ Error initializing trend chart:', error);
    }
    
    try {
        initDistributionChart();
    } catch (error) {
        console.error('❌ Error initializing distribution chart:', error);
    }
    
    try {
        initCategoryChart();
    } catch (error) {
        console.error('❌ Error initializing category chart:', error);
    }
    
    try {
        initCurrencyChart();
    } catch (error) {
        console.error('❌ Error initializing currency chart:', error);
    }
    
    try {
        initDatePicker();
    } catch (error) {
        console.error('❌ Error initializing date picker:', error);
    }
    
    console.log('✅ Charts initialization completed');
}

// Check if Chart.js is loaded
function checkChartJS() {
    if (typeof Chart !== 'undefined' && !trendChartState.isReady) {
        console.log('✅ Chart.js is now loaded, initializing charts');
        trendChartState.isReady = true;
        initTrendChart();
        initDistributionChart();
        initCategoryChart();
        initCurrencyChart();
    }
}

function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.warn('⚠️ Trend chart canvas element not found');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded!');
        return;
    }
    
    const months = generateMonthLabels(6);
    const data = generateTrendData(6);
    
    if (trendChart) trendChart.destroy();
    
    try {
        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Toplam Ödenen (TL)',
                        data: data.paid,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Toplam Borç (TL)',
                        data: data.debt,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            callback: value => '₺' + value.toLocaleString()
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        console.log('✅ Trend chart initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing trend chart:', error);
    }
}

function initDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) {
        console.warn('⚠️ Distribution chart canvas element not found');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded!');
        return;
    }
    
    const data = calculatePaymentDistribution();
    
    if (distributionChart) distributionChart.destroy();
    
    try {
        distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ödenmiş', 'Kısmen Ödenmiş', 'Ödenmemiş', 'Beklemede'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#6b7280'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        console.log('✅ Distribution chart initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing distribution chart:', error);
    }
}

function initCategoryChart() {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    
    const ctx = document.getElementById('categoryChart');
    if (!ctx) {
        console.warn('⚠️ Category chart canvas element not found');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded!');
        return;
    }
    
    const data = calculateCategoryDistribution();
    
    if (categoryChart) categoryChart.destroy();
    
    try {
        categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Kayıt Sayısı',
                    data: Object.values(data),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
        
        console.log('✅ Category chart initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing category chart:', error);
    }
}

function initCurrencyChart() {
    const ctx = document.getElementById('currencyChart');
    if (!ctx) {
        console.warn('⚠️ Currency chart canvas element not found');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js is not loaded!');
        return;
    }
    
    const data = calculateCurrencyDistribution();
    
    if (currencyChart) currencyChart.destroy();
    
    try {
        currencyChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#8b5cf6',
                        '#ef4444'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        console.log('✅ Currency chart initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing currency chart:', error);
    }
}

function generateMonthLabels(months) {
    const labels = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        labels.push(monthNames[date.getMonth()] + ' ' + date.getFullYear());
    }
    
    return labels;
}

function generateTrendData(months) {
    const paid = [];
    const debt = [];
    
    for (let i = 0; i < months; i++) {
        paid.push(Math.floor(Math.random() * 500000) + 100000);
        debt.push(Math.floor(Math.random() * 300000) + 50000);
    }
    
    return { paid, debt };
}

function calculatePaymentDistribution() {
    const distribution = {
        'ÖDENDİ': 0,
        'KISMEN ÖDENDİ': 0,
        'ÖDENMEDİ': 0,
        'BEKLEMEDE': 0
    };
    
    payments.forEach(payment => {
        if (distribution[payment.odeme_durumu] !== undefined) {
            distribution[payment.odeme_durumu]++;
        }
    });
    
    return Object.values(distribution);
}

function calculateCategoryDistribution() {
    const distribution = {};
    
    payments.forEach(payment => {
        const category = payment.isin_nevi || 'Diğer';
        distribution[category] = (distribution[category] || 0) + 1;
    });
    
    return distribution;
}

function calculateCurrencyDistribution() {
    const distribution = {};
    
    payments.forEach(payment => {
        const currency = payment.para_birimi || 'TL';
        distribution[currency] = (distribution[currency] || 0) + 1;
    });
    
    return distribution;
}

function updateTrendChart() {
    const period = parseInt(document.getElementById('trendPeriod').value);
    if (!isNaN(period)) {
        initTrendChart();
    }
}

// Export chart data to CSV
function exportChartData() {
    console.log('📊 Exporting chart data to CSV...');
    
    try {
        // Generate payment statistics
        const stats = {
            totalPayments: payments.length,
            totalPaidTL: payments.reduce((sum, p) => sum + (p.bu_ay_odenen * getCurrencyRate(p.para_birimi)), 0),
            totalDebtTL: payments.reduce((sum, p) => sum + (p.toplam_borc * getCurrencyRate(p.para_birimi)), 0),
            totalRemainingTL: payments.reduce((sum, p) => sum + (p.kalan * getCurrencyRate(p.para_birimi)), 0),
            paymentStatus: {}
        };
        
        // Calculate payment status distribution
        payments.forEach(p => {
            const status = p.odeme_durumu || 'Bilinmiyor';
            stats.paymentStatus[status] = (stats.paymentStatus[status] || 0) + 1;
        });
        
        // Calculate category distribution
        const categoryStats = {};
        payments.forEach(p => {
            const category = p.isin_nevi || 'Diğer';
            categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        
        // Calculate currency distribution
        const currencyStats = {};
        payments.forEach(p => {
            const currency = p.para_birimi || 'TL';
            currencyStats[currency] = (currencyStats[currency] || 0) + 1;
        });
        
        // Create CSV content
        let csvContent = '📊 ÖDEME YÖNETİM SİSTEMİ - ANALYTİK RAPORU\n';
        csvContent += `📅 Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}\n`;
        csvContent += '\n';
        csvContent += '📈 TEMEL İSTATİSTİKLER\n';
        csvContent += '================================\n';
        csvContent += `Toplam Kayıt Sayısı: ${stats.totalPayments}\n`;
        csvContent += `Toplam Ödenen (TL): ₺${formatNumber(stats.totalPaidTL)}\n`;
        csvContent += `Toplam Borç (TL): ₺${formatNumber(stats.totalDebtTL)}\n`;
        csvContent += `Kalan Borç (TL): ₺${formatNumber(stats.totalRemainingTL)}\n`;
        csvContent += '\n';
        csvContent += '📊 ÖDEME DURUMU DAĞILIMI\n';
        csvContent += '================================\n';
        for (const [status, count] of Object.entries(stats.paymentStatus)) {
            const percentage = ((count / stats.totalPayments) * 100).toFixed(1);
            csvContent += `${status}: ${count} (${percentage}%)\n`;
        }
        csvContent += '\n';
        csvContent += '📋 İŞİN NEVİ ANALİZİ\n';
        csvContent += '================================\n';
        for (const [category, count] of Object.entries(categoryStats)) {
            csvContent += `${category}: ${count} kayıt\n`;
        }
        csvContent += '\n';
        csvContent += '💰 PARA BİRİMİ DAĞILIMI\n';
        csvContent += '================================\n';
        for (const [currency, count] of Object.entries(currencyStats)) {
            csvContent += `${currency}: ${count} kayıt\n`;
        }
        
        // Add detailed payment records
        csvContent += '\n';
        csvContent += '📋 DETAYLI KAYIT LİSTESİ\n';
        csvContent += '================================\n';
        csvContent += 'S.No;Ödeme Kalemi;Firma;İşin Nevi;Fatura Durumu;Para Birimi;Toplam Borç;Ödenen;Kalan;Durum\n';
        
        payments.forEach(p => {
            const row = [
                p.sira_no,
                p.odeme_kalemleri,
                p.firma_fatura_ismi || '-',
                p.isin_nevi,
                p.fatura_durumu,
                p.para_birimi,
                p.toplam_borc,
                p.bu_ay_odenen,
                p.kalan,
                p.odeme_durumu
            ].join(';');
            csvContent += row + '\n';
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `odeme_analitik_raporu_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Chart data exported successfully');
        showToast('Başarılı', 'Analitik raporu indirildi', 'success');
        
    } catch (error) {
        console.error('❌ Error exporting chart data:', error);
        showToast('Hata', 'Rapor indirilirken hata oluştu', 'error');
    }
}

function refreshCharts() {
    console.log('🔄 Refreshing charts...');
    
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not available, skipping chart refresh');
        return;
    }
    
    // Update chart status
    const chartStatus = document.getElementById('chartStatus');
    if (chartStatus) {
        chartStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Yükleniyor...</span>';
    }
    
    try {
        // Refresh all charts with animation
        setTimeout(() => {
            initTrendChart();
            initDistributionChart();
            initCategoryChart();
            initCurrencyChart();
            
            // Update chart status
            if (chartStatus) {
                chartStatus.innerHTML = '<i class="fas fa-check-circle"></i> <span>Chart\'lar Hazır</span>';
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Error refreshing charts:', error);
        
        if (chartStatus) {
            chartStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span>Hata</span>';
        }
    }
}

// ===== DATE RANGE PICKER =====
function initDatePicker() {
    const picker = document.getElementById('dateRangePicker');
    if (!picker) {
        console.warn('⚠️ Date range picker element not found');
        return;
    }
    
    if (typeof flatpickr === 'undefined') {
        console.warn('⚠️ Flatpickr not available, skipping date picker initialization');
        console.warn('⚠️ Will retry when library is loaded');
        setTimeout(initDatePicker, 2000);
        return;
    }
    
    dateRangePicker = flatpickr(picker, {
        mode: 'range',
        dateFormat: 'd.m.Y',
        locale: 'tr',
        monthSelectorType: 'static',
        maxDate: new Date(),
        disable: [
            function(date) {
                return date > new Date();
            }
        ],
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                dateRange = {
                    start: selectedDates[0],
                    end: selectedDates[1]
                };
                console.log('📅 Date range selected:', dateRange);
                console.log('📅 Updating filtered payments...');
                filterData();
            }
        },
        onOpen: function(selectedDates, dateStr, instance) {
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDarkMode) {
                instance.calendarContainer.classList.add('dark-mode');
            }
        }
    });
    
    console.log('✅ Date picker initialized successfully');
}

// ===== EXCEL EXPORT =====
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        showToast('Hata', 'SheetJS kütüphanesi yüklü değil', 'error');
        return;
    }
    
    try {
        const dataToExport = filteredPayments.length > 0 ? filteredPayments : payments;
        
        const excelData = dataToExport.map(payment => ({
            'S.No': payment.sira_no,
            'Ödeme Kalemi': payment.odeme_kalemleri,
            'Firma Fatura İsmi': payment.firma_fatura_ismi,
            'Firma IBAN': payment.firma_ibanlari,
            'İşin Nevi': payment.isin_nevi,
            'Fatura Durumu': payment.fatura_durumu,
            'İş Adı': payment.isin_adi,
            'Para Birimi': payment.para_birimi,
            'Önceki Dönemden Kalan Borç': payment.onceki_donemden_kalan_borc,
            'Bu Ayki Borç': payment.bu_ayki_borc,
            'Toplam Borç': payment.toplam_borc,
            'Bu Ay Ödenen': payment.bu_ay_odenen,
            'Kalan': payment.kalan,
            'Ödeme Durumu': payment.odeme_durumu,
            'Döküman': payment.ekrak_yukleme_url ? 'Var' : 'Yok'
        }));
        
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ödeme Kayıtları');
        
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `odeme_kayitlari_${timestamp}.xlsx`);
        
        showToast('Başarılı', 'Excel dosyası başarıyla indirildi', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showToast('Hata', 'Excel dosyası oluşturulurken hata oluştu', 'error');
    }
}

// ===== BULK OPERATIONS =====
function toggleBulkActions() {
    const selectAllCol = document.getElementById('selectAllCol');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const bulkActionsBtn = document.getElementById('bulkActionsBtn');
    
    const isActive = selectAllCol.style.display !== 'none';
    
    if (isActive) {
        selectAllCol.style.display = 'none';
        bulkActionsBar.style.display = 'none';
        bulkActionsBtn.classList.remove('active');
        selectedPayments.clear();
    } else {
        selectAllCol.style.display = 'table-cell';
        bulkActionsBar.style.display = 'flex';
        bulkActionsBtn.classList.add('active');
        renderTable();
    }
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.bulk-checkbox');
    
    if (selectAllCheckbox.checked) {
        filteredPayments.forEach(payment => {
            selectedPayments.add(payment.id);
        });
        checkboxes.forEach(cb => cb.checked = true);
    } else {
        selectedPayments.clear();
        checkboxes.forEach(cb => cb.checked = false);
    }
    
    updateSelectedCount();
}

function togglePaymentSelection(id) {
    if (selectedPayments.has(id)) {
        selectedPayments.delete(id);
    } else {
        selectedPayments.add(id);
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    selectedCount.textContent = `${selectedPayments.size} seçili`;
}

function clearBulkSelection() {
    selectedPayments.clear();
    document.getElementById('selectAllCheckbox').checked = false;
    const checkboxes = document.querySelectorAll('.bulk-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    updateSelectedCount();
    toggleBulkActions();
}

async function bulkDelete() {
    if (selectedPayments.size === 0) {
        showToast('Uyarı', 'Lütfen silinecek kayıtları seçin', 'warning');
        return;
    }
    
    if (!confirm(`${selectedPayments.size} kaydı silmek istediğinizden emin misiniz?`)) {
        return;
    }
    
    try {
        showLoading(true);
        
        if (!supabaseClient) {
            payments = payments.filter(p => !selectedPayments.has(p.id));
        } else {
            const ids = Array.from(selectedPayments);
            const { error } = await supabaseClient
                .from('payments')
                .delete()
                .in('id', ids);
            
            if (error) throw error;
            
            await loadPayments();
        }
        
        selectedPayments.clear();
        filterData();
        showToast('Başarılı', 'Kayıtlar başarıyla silindi', 'success');
        showLoading(false);
    } catch (error) {
        console.error('Bulk delete error:', error);
        showToast('Hata', 'Kayıtlar silinirken hata oluştu', 'error');
        showLoading(false);
    }
}

function bulkExport() {
    if (typeof XLSX === 'undefined') {
        showToast('Hata', 'SheetJS kütüphanesi yüklü değil', 'error');
        return;
    }
    
    if (selectedPayments.size === 0) {
        showToast('Uyarı', 'Lütfen dışa aktarılacak kayıtları seçin', 'warning');
        return;
    }
    
    try {
        const selectedData = payments.filter(p => selectedPayments.has(p.id));
        
        const excelData = selectedData.map(payment => ({
            'S.No': payment.sira_no,
            'Ödeme Kalemi': payment.odeme_kalemleri,
            'Firma Fatura İsmi': payment.firma_fatura_ismi,
            'İşin Nevi': payment.isin_nevi,
            'Fatura Durumu': payment.fatura_durumu,
            'Para Birimi': payment.para_birimi,
            'Toplam Borç': payment.toplam_borc,
            'Bu Ay Ödenen': payment.bu_ay_odenen,
            'Kalan': payment.kalan,
            'Ödeme Durumu': payment.odeme_durumu
        }));
        
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Seçilen Kayıtlar');
        
        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `secilen_kayitlar_${timestamp}.xlsx`);
        
        showToast('Başarılı', 'Seçilen kayıtlar dışa aktarıldı', 'success');
    } catch (error) {
        console.error('Bulk export error:', error);
        showToast('Hata', 'Dışa aktarılırken hata oluştu', 'error');
    }
}

// ===== AUTO CALCULATION =====
function autoCalculate() {
    const oncekiBorc = parseFloat(document.getElementById('oncekiBorc').value) || 0;
    const buAykiBorc = parseFloat(document.getElementById('buAykiBorc').value) || 0;
    const toplamBorc = oncekiBorc + buAykiBorc;
    
    document.getElementById('toplamBorc').value = toplamBorc.toFixed(2);
    
    const buAyOdenen = parseFloat(document.getElementById('buAyOdenen').value) || 0;
    const kalan = toplamBorc - buAyOdenen;
    
    document.getElementById('kalan').value = kalan.toFixed(2);
    
    const odemeDurumu = document.getElementById('odemeDurumu');
    if (kalan <= 0) {
        odemeDurumu.value = 'ÖDENDİ';
    } else if (kalan < toplamBorc && buAyOdenen > 0) {
        odemeDurumu.value = 'KISMEN ÖDENDİ';
    } else if (buAyOdenen === 0 && toplamBorc > 0) {
        odemeDurumu.value = 'ÖDENMEDİ';
    } else if (kalan >= toplamBorc && buAyOdenen > 0) {
        odemeDurumu.value = 'ÖDENDİ';
    } else {
        odemeDurumu.value = 'BEKLEMEDE';
    }
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    const currencyModal = document.getElementById('currencyModal');
    
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === currencyModal) {
        closeCurrencyModal();
    }
});

// Keyboard shortcuts for ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeCurrencyModal();
    }
});
