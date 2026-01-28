// ============================================
// ŞİRKET API FONKSİYONLARI
// Payments tablosundan şirket özeti çeker
// ULTRA PROFESSIONAL - Duplicate Prevention Built-in
// ============================================

// Request tracking to prevent duplicate submissions
const pendingRequests = new Map();
const recentRequests = new Map(); // Track recent successful requests

function getSupabase() {
    return window.supabaseClient || null;
}

/**
 * Generate a unique request ID based on operation parameters
 */
function generateRequestId(operation, params) {
    const key = `${operation}_${JSON.stringify(params)}`;
    return key;
}

/**
 * Check if a request is already pending or was recently completed
 */
function isRequestPending(requestId) {
    // Check if exact request is currently pending
    if (pendingRequests.has(requestId)) {
        console.log('⚠️ Duplicate request blocked (pending):', requestId);
        return true;
    }

    // Check if same request was completed in last 2 seconds (debounce)
    const recentTime = recentRequests.get(requestId);
    if (recentTime && (Date.now() - recentTime) < 2000) {
        console.log('⚠️ Duplicate request blocked (recent):', requestId);
        return true;
    }

    return false;
}

/**
 * Mark request as pending
 */
function markRequestPending(requestId) {
    pendingRequests.set(requestId, Date.now());
}

/**
 * Mark request as completed
 */
function markRequestComplete(requestId) {
    pendingRequests.delete(requestId);
    recentRequests.set(requestId, Date.now());

    // Clean up old recent requests after 5 seconds
    setTimeout(() => {
        recentRequests.delete(requestId);
    }, 5000);
}

// Tüm şirketleri getir (payments tablosundan özet)
async function fetchCompanies() {
    const client = getSupabase();
    if (!client) {
        console.log('📦 Demo mode: Using demo companies');
        return getDemoCompanies();
    }

    // DIRECT CALL: Bypass View to ensure 1-to-1 mapping
    return await fetchCompaniesFromPayments();
}

// Fallback: Doğrudan payments tablosundan şirket özeti (AGGREGATION YOK - 1'e 1 EŞLEME)
async function fetchCompaniesFromPayments() {
    const client = getSupabase();
    if (!client) return getDemoCompanies();

    try {
        const { data, error } = await client
            .from('payments')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // 1 Payment = 1 Company Card logic
        const companies = (data || []).map(payment => {
            const totalDebt = parseFloat(payment.toplam_borc) || 0;
            const totalPaid = parseFloat(payment.bu_ay_odenen) || 0;
            const remaining = parseFloat(payment.kalan) || 0;

            // Percentage calc
            let percentage = 0;
            if (totalDebt > 0) {
                percentage = Math.round((totalPaid / totalDebt) * 100 * 100) / 100;
            }

            return {
                id: payment.id, // Use Payment UUID as Company ID so each record is distinct
                name: payment.firma_fatura_ismi || 'İsimsiz', // Visual Label
                contact_person: payment.firma_fatura_ismi, // Fallback contact
                currency: payment.para_birimi || 'TL',

                // Financials specific to THIS record
                total_debt: totalDebt,
                total_paid: totalPaid,
                remaining_debt: remaining,
                previous_debt: parseFloat(payment.onceki_donemden_kalan_borc) || 0,
                current_month_debt: parseFloat(payment.bu_ayki_borc) || 0,

                // Stats
                payment_percentage: percentage,
                payment_count: 1,
                transaction_count: 1,
                last_transaction_date: payment.updated_at || payment.created_at
            };
        });

        console.log(`✅ Fetched ${companies.length} records (mapped to cards) from payments`);
        return companies;
    } catch (error) {
        console.error('❌ Error fetching from payments:', error);
        return getDemoCompanies();
    }
}

// Tek şirket getir
async function fetchCompanyById(companyId) {
    const companies = await fetchCompanies();
    return companies.find(c => c.id === companyId || c.name === companyId) || null;
}

// Şirketin ödeme kayıtlarını getir (payments tablosundan)
async function fetchCompanyPayments(companyId) {
    const client = getSupabase();
    if (!client) return getDemoPayments(companyId);

    try {
        const { data, error } = await client
            .from('payments')
            .select('*')
            .eq('firma_fatura_ismi', companyId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // payments formatını detay formatına dönüştür
        return (data || []).map(p => ({
            id: p.id,
            company_id: p.firma_fatura_ismi,
            payment_date: p.updated_at || p.created_at,
            amount: p.toplam_borc,
            paid_amount: p.bu_ay_odenen,
            remaining: p.kalan,
            payment_type: p.bu_ay_odenen > 0 ? 'ÖDEME' : 'BORÇ',
            currency: p.para_birimi,
            description: p.odeme_kalemleri,
            status: p.odeme_durumu
        }));
    } catch (error) {
        console.error('❌ Error fetching company payments:', error);
        return [];
    }
}

// Yeni şirket ekle - payments tablosuna yeni kayıt (WITH DUPLICATE PREVENTION)
async function createCompany(companyData) {
    const requestId = generateRequestId('createCompany', {
        name: companyData.name,
        debt: companyData.initial_debt
    });

    // Check for duplicate request
    if (isRequestPending(requestId)) {
        return { success: false, error: 'İşlem zaten devam ediyor' };
    }

    markRequestPending(requestId);

    const client = getSupabase();
    if (!client) {
        markRequestComplete(requestId);
        return { success: true, id: generateUUID() };
    }

    try {
        // Yeni ödeme kaydı oluştur
        const payment = {
            firma_fatura_ismi: companyData.name,
            para_birimi: companyData.currency || 'TL',
            toplam_borc: companyData.initial_debt || 0,
            kalan: companyData.initial_debt || 0,
            odeme_durumu: 'ÖDENMEDİ',
            odeme_kalemleri: 'Başlangıç Borcu',
            donem: 'OCAK 2026'
        };

        const { data, error } = await client.from('payments').insert([payment]).select().single();

        markRequestComplete(requestId);

        if (error) throw error;
        console.log('✅ Company created successfully:', data?.id);
        return { success: true, data };
    } catch (error) {
        markRequestComplete(requestId);
        console.error('❌ Error creating company:', error);
        return { success: false, error: error.message };
    }
}

// Şirket güncelle (Aslında tekil ödeme kaydını güncelle)
async function updateCompany(companyId, companyData) {
    const requestId = generateRequestId('updateCompany', { id: companyId });

    if (isRequestPending(requestId)) {
        return { success: false, error: 'İşlem zaten devam ediyor' };
    }

    markRequestPending(requestId);

    const client = getSupabase();
    if (!client) {
        markRequestComplete(requestId);
        return { success: true };
    }

    try {
        const { error } = await client
            .from('payments')
            .update({
                firma_fatura_ismi: companyData.name,
                para_birimi: companyData.currency,
                toplam_borc: companyData.initial_debt,
                kalan: companyData.initial_debt
            })
            .eq('id', companyId);

        markRequestComplete(requestId);

        if (error) throw error;
        console.log('✅ Company updated successfully:', companyId);
        return { success: true };
    } catch (error) {
        markRequestComplete(requestId);
        console.error('❌ Error updating company:', error);
        return { success: false, error: error.message };
    }
}

// Şirket sil
async function deleteCompany(companyId) {
    const client = getSupabase();
    if (!client) return { success: true };

    try {
        const { error } = await client
            .from('payments')
            .delete()
            .eq('firma_fatura_ismi', companyId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Ödeme ekle - payments tablosuna yeni kayıt veya güncelleme (WITH DUPLICATE PREVENTION)
async function addCompanyPayment(paymentData) {
    // Generate unique request ID based on payment details
    const requestId = generateRequestId('addPayment', {
        company: paymentData.company_id,
        type: paymentData.payment_type,
        amount: paymentData.amount,
        timestamp: Math.floor(Date.now() / 1000) // Round to second to catch rapid duplicates
    });

    // CRITICAL: Block duplicate requests
    if (isRequestPending(requestId)) {
        console.log('🚫 Blocked duplicate payment request');
        return { success: false, error: 'İşlem zaten devam ediyor, lütfen bekleyin' };
    }

    markRequestPending(requestId);

    const client = getSupabase();
    if (!client) {
        markRequestComplete(requestId);
        return { success: true, id: generateUUID() };
    }

    try {
        console.log('💰 Processing payment:', paymentData.payment_type, paymentData.amount);

        if (paymentData.payment_type === 'ÖDEME') {
            // Mevcut kayıtlardan birini güncelle
            const { data: existing } = await client
                .from('payments')
                .select('*')
                .eq('firma_fatura_ismi', paymentData.company_id)
                .gt('kalan', 0)
                .order('kalan', { ascending: false })
                .limit(1);

            if (existing && existing.length > 0) {
                const record = existing[0];
                const newPaid = (record.bu_ay_odenen || 0) + paymentData.amount;
                const newRemaining = Math.max(0, (record.toplam_borc || 0) - newPaid);

                const { error } = await client
                    .from('payments')
                    .update({
                        bu_ay_odenen: newPaid,
                        kalan: newRemaining,
                        odeme_durumu: newRemaining === 0 ? 'ÖDENDİ' : 'KISMEN ÖDENDİ'
                    })
                    .eq('id', record.id);

                markRequestComplete(requestId);

                if (error) throw error;
                console.log('✅ Payment recorded (update):', record.id);
                return { success: true };
            } else {
                // No record to update
                markRequestComplete(requestId);
                console.log('⚠️ No debt record found to apply payment');
                return { success: false, error: 'Ödeme yapılacak borç kaydı bulunamadı' };
            }
        } else {
            // Yeni borç ekle
            const payment = {
                firma_fatura_ismi: paymentData.company_id,
                odeme_kalemleri: paymentData.description || 'Yeni Borç',
                para_birimi: paymentData.currency || 'TL',
                bu_ayki_borc: paymentData.amount,
                toplam_borc: paymentData.amount,
                kalan: paymentData.amount,
                odeme_durumu: 'ÖDENMEDİ',
                donem: 'OCAK 2026'
            };

            const { data, error } = await client.from('payments').insert([payment]).select().single();

            markRequestComplete(requestId);

            if (error) throw error;
            console.log('✅ New debt added:', data?.id);
            return { success: true, data };
        }
    } catch (error) {
        markRequestComplete(requestId);
        console.error('❌ Error in addCompanyPayment:', error);
        return { success: false, error: error.message };
    }
}

// Ödeme sil
async function deleteCompanyPayment(paymentId) {
    const client = getSupabase();
    if (!client) return { success: true };

    try {
        const { error } = await client.from('payments').delete().eq('id', paymentId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// UUID Generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Format Currency
function formatCompanyCurrency(value, currency = 'TL') {
    if (value == null) return '-';
    const symbols = { 'TL': '₺', 'USD': '$', 'EUR': '€', 'STG': '£' };
    return `${symbols[currency] || currency}${parseFloat(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format Date
function formatCompanyDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Demo Companies (Fallback)
function getDemoCompanies() {
    return [
        { id: 'DEMO1', name: 'Demo Şirket 1', contact_person: 'Demo', currency: 'TL', total_debt: 100000, total_paid: 50000, remaining_debt: 50000, payment_percentage: 50, transaction_count: 2, last_transaction_date: '2026-01-22' }
    ];
}

// Demo Payments (Fallback)
function getDemoPayments(companyId) {
    return [];
}
