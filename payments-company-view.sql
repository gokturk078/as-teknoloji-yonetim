-- ============================================
-- PAYMENTS TABLOSUNDAN ŞİRKET BAZLI ÖZET VIEW
-- Mevcut 26 kayıttan şirket borçlarını hesaplar
-- ============================================

-- Mevcut view varsa sil
DROP VIEW IF EXISTS payments_company_summary;

-- Yeni şirket özet view oluştur
CREATE OR REPLACE VIEW payments_company_summary AS
SELECT 
    -- Şirket adını hem ID hem name olarak kullan
    firma_fatura_ismi as id,
    firma_fatura_ismi as name,
    
    -- İletişim bilgisi (ilk kayıttan)
    firma_fatura_ismi as contact_person,
    
    -- Kayıt sayısı
    COUNT(*) as payment_count,
    
    -- Önceki dönemden kalan borç toplamı
    COALESCE(SUM(onceki_donemden_kalan_borc), 0) as previous_debt,
    
    -- Bu ayki borç toplamı
    COALESCE(SUM(bu_ayki_borc), 0) as current_month_debt,
    
    -- Toplam borç
    COALESCE(SUM(toplam_borc), 0) as total_debt,
    
    -- Bu ay ödenen toplam
    COALESCE(SUM(bu_ay_odenen), 0) as total_paid,
    
    -- Kalan borç
    COALESCE(SUM(kalan), 0) as remaining_debt,
    
    -- Ödeme yüzdesi hesaplama
    CASE 
        WHEN COALESCE(SUM(toplam_borc), 0) > 0 
        THEN ROUND(
            (COALESCE(SUM(bu_ay_odenen), 0) * 100.0) / 
            NULLIF(COALESCE(SUM(toplam_borc), 0), 0), 
            2
        )
        ELSE 0 
    END as payment_percentage,
    
    -- Para birimi (en çok kullanılan)
    MODE() WITHIN GROUP (ORDER BY para_birimi) as currency,
    
    -- İşlem sayısı (transaction_count için)
    COUNT(*) as transaction_count,
    
    -- Son güncelleme tarihi
    MAX(updated_at) as last_transaction_date,
    
    -- Oluşturulma tarihi (ilk kayıt)
    MIN(created_at) as created_at

FROM payments
WHERE 
    firma_fatura_ismi IS NOT NULL 
    AND firma_fatura_ismi != ''
    AND TRIM(firma_fatura_ismi) != ''
GROUP BY firma_fatura_ismi
ORDER BY remaining_debt DESC;

-- ============================================
-- NOT: Bu SQL'i Supabase SQL Editor'da çalıştırın
-- View otomatik olarak payments tablosundan
-- şirket bazlı özet oluşturur
-- ============================================
