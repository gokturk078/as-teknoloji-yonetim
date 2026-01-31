
import { showToast, showLoading } from '../ui/notifications.js';
import { generateUUID } from '../utils/helpers.js';

// Supabase Configuration
const SUPABASE_URL = 'https://anlwfmnibmzuffokzelx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubHdmbW5pYm16dWZmb2t6ZWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODg5MTQsImV4cCI6MjA4NDI2NDkxNH0.URWAphkOgfcrghNs1olm1F-mvUC5PJp872MZHLTT78M';

let supabaseClient = null;

// ============================================
// REQUEST TRACKING - PREVENTS DUPLICATE API CALLS
// ============================================
const pendingRequests = new Map();
const recentRequests = new Map();

function generateRequestKey(operation, data) {
    // Create a unique key based on operation and data
    const dataKey = JSON.stringify({
        operation,
        sira_no: data.sira_no,
        firma: data.firma_fatura_ismi,
        odeme: data.odeme_kalemleri,
        toplam: data.toplam_borc
    });
    return dataKey;
}

function isRequestBlocked(key) {
    // Block if exact request is pending
    if (pendingRequests.has(key)) {
        console.log('🚫 Blocked: Request already pending');
        return true;
    }

    // Block if same request completed in last 2 seconds
    const recentTime = recentRequests.get(key);
    if (recentTime && (Date.now() - recentTime) < 2000) {
        console.log('🚫 Blocked: Too soon after recent request');
        return true;
    }

    return false;
}

function markPending(key) {
    pendingRequests.set(key, Date.now());
}

function markComplete(key) {
    pendingRequests.delete(key);
    recentRequests.set(key, Date.now());

    // Cleanup after 5 seconds
    setTimeout(() => recentRequests.delete(key), 5000);
}

// ============================================
// SUPABASE INITIALIZATION
// ============================================

// Initialize Supabase (Uses Global Client from supabase-init.js)
export function initSupabase() {
    console.log('🔧 Initializing Supabase client (Module)...');

    // Check global client first
    if (window.supabaseClient) {
        supabaseClient = window.supabaseClient;
        console.log('✅ Used global Supabase client');
        return supabaseClient;
    }

    try {
        if (window.supabase) {
            // Fallback: Create new client if global not found (defensive)
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Created local Supabase client (Fallback)');
            window.supabaseClient = supabaseClient; // Set global
            return supabaseClient;
        } else {
            console.error('❌ Supabase SDK not loaded');
            return null;
        }
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

export function getSupabaseClient() {
    return supabaseClient || window.supabaseClient;
}

export { supabaseClient as supabase };

// ============================================
// DATA FETCHING
// ============================================

export async function fetchPayments() {
    const client = getSupabaseClient();
    if (!client) return getDemoData();

    try {
        const { data, error } = await client
            .from('payments')
            .select('*')
            .order('sira_no', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
}

export async function fetchCurrencyRates() {
    const client = getSupabaseClient();
    if (!client) {
        return { usd_to_tl: 34.50, eur_to_tl: 37.20, stg_to_tl: 43.80 }; // Defaults
    }

    try {
        const { data, error } = await client
            .from('currency_rates')
            .select('*')
            .eq('donem', 'OCAK 2026')
            .single();

        if (error || !data) throw error;

        return {
            usd_to_tl: data.usd_to_tl,
            eur_to_tl: data.eur_to_tl,
            stg_to_tl: data.stg_to_tl
        };
    } catch (error) {
        console.log('Using default currency rates');
        return { usd_to_tl: 34.50, eur_to_tl: 37.20, stg_to_tl: 43.80 };
    }
}

// ============================================
// CRUD OPERATIONS - WITH DUPLICATE PREVENTION
// ============================================

export async function savePayment(paymentData, isNew) {
    const client = getSupabaseClient();
    if (!client) {
        // Demo mode simulation
        console.log('💾 [DEMO] Saving to demo data:', paymentData);
        await new Promise(r => setTimeout(r, 500));
        return { error: null };
    }

    // DUPLICATE PREVENTION: Generate request key
    const requestKey = generateRequestKey(isNew ? 'INSERT' : 'UPDATE', paymentData);

    // Check if this exact request is blocked
    if (isRequestBlocked(requestKey)) {
        console.log('⚠️ savePayment: Duplicate request blocked');
        return { error: { message: 'İşlem zaten devam ediyor, lütfen bekleyin' } };
    }

    // Mark as pending
    markPending(requestKey);

    try {
        console.log(`💾 savePayment: ${isNew ? 'INSERT' : 'UPDATE'}`, paymentData.firma_fatura_ismi || 'N/A');

        if (isNew) {
            const { error } = await client.from('payments').insert([paymentData]);
            if (error) throw error;
        } else {
            const { error } = await client
                .from('payments')
                .update(paymentData)
                .eq('id', paymentData.id);
            if (error) throw error;
        }

        console.log('✅ savePayment: Success');
        markComplete(requestKey);
        return { error: null };
    } catch (error) {
        console.error('❌ savePayment: Error', error);
        markComplete(requestKey); // Still mark complete to allow retry
        return { error };
    }
}

export async function deletePaymentRecord(id) {
    const client = getSupabaseClient();
    if (!client) return { error: null };

    try {
        const { error } = await client.from('payments').delete().eq('id', id);
        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error };
    }
}

export async function updateCurrencyRates(rates) {
    const client = getSupabaseClient();
    if (!client) return { error: null };

    try {
        const { error } = await client
            .from('currency_rates')
            .upsert({
                donem: 'OCAK 2026',
                ...rates
            });
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error updating rates:', error);
        return { error };
    }
}

// ============================================
// FILE UPLOAD
// ============================================

export async function uploadDocument(file) {
    const client = getSupabaseClient();
    if (!client) {
        // Demo mode: Return fake URL
        await new Promise(r => setTimeout(r, 1000));
        return URL.createObjectURL(file);
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 'documents' bucket assumed
        const { error: uploadError } = await client.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = client.storage
            .from('documents')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

// ============================================
// REALTIME SUBSCRIPTION
// ============================================

export function subscribeToPayments(callback) {
    const client = getSupabaseClient();
    if (!client) return null;

    console.log('📡 Subscribing to payments table...');

    // Unique channel name per tab/client to avoid conflicts if needed, but 'public:payments' is fine for broad listening
    const subscription = client
        .channel('public:payments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
            console.log('🔔 Realtime update received:', payload.eventType);
            if (callback) callback(payload);
        })
        .subscribe((status) => {
            console.log('📡 Subscription status:', status);
        });

    return subscription;
}

// ============================================
// DEMO DATA HELPER
// ============================================

function getDemoData() {
    return [];
}
