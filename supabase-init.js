// ============================================
// ORTAK SUPABASE BAŞLATMA MODÜLÜ
// Global Supabase Client Initialization
// ============================================

const SUPABASE_URL = 'https://anlwfmnibmzuffokzelx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubHdmbW5pYm16dWZmb2t6ZWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2ODg5MTQsImV4cCI6MjA4NDI2NDkxNH0.URWAphkOgfcrghNs1olm1F-mvUC5PJp872MZHLTT78M';

// Global Supabase Client
window.supabaseClient = null;

/**
 * Supabase client'ı başlat ve global olarak erişilebilir yap
 * @returns {Object|null} Supabase client veya null
 */
function initSupabaseGlobal() {
    console.log('🔧 Initializing Global Supabase client...');

    try {
        // Supabase SDK yüklü mü kontrol et
        if (!window.supabase) {
            console.error('❌ Supabase SDK not loaded!');
            return null;
        }

        // Zaten başlatılmış mı kontrol et
        if (window.supabaseClient) {
            console.log('✅ Supabase client already initialized');
            return window.supabaseClient;
        }

        // Client oluştur ve global yap
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        console.log('✅ Global Supabase client initialized successfully');
        return window.supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

/**
 * Global Supabase client'ı al
 * @returns {Object|null} Supabase client veya null
 */
function getSupabaseClient() {
    return window.supabaseClient;
}

// Sayfa yüklendiğinde otomatik başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseGlobal);
} else {
    initSupabaseGlobal();
}
