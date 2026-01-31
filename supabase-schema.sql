-- ============================================
-- ÖDEME YÖNETİM SİSTEMİ - SUPABASE SCHEMA
-- Tam Uyumlu - 26 Kayıt Dahil
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS currency_rates CASCADE;

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sira_no INTEGER,
    odeme_kalemleri TEXT,
    firma_fatura_ismi TEXT,
    firma_ibanlari TEXT,
    isin_nevi TEXT,
    fatura_durumu TEXT CHECK (fatura_durumu IN ('FATURALI', 'FATURASIZ')),
    isin_adi TEXT,
    para_birimi TEXT CHECK (para_birimi IN ('TL', 'USD', 'EUR', 'STG')),
    onceki_donemden_kalan_borc DECIMAL(15,2) DEFAULT 0,
    bu_ayki_borc DECIMAL(15,2) DEFAULT 0,
    toplam_borc DECIMAL(15,2) DEFAULT 0,
    bu_ay_odenen DECIMAL(15,2) DEFAULT 0,
    kalan DECIMAL(15,2) DEFAULT 0,
    odeme_durumu TEXT CHECK (odeme_durumu IN ('ÖDENDİ', 'ÖDENMEDİ', 'KISMEN ÖDENDİ', 'BEKLEMEDE')),
    ekrak_yukleme_url TEXT, -- File URL from storage
    donem TEXT DEFAULT 'OCAK 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create currency_rates table for conversion rates
CREATE TABLE currency_rates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donem TEXT NOT NULL,
    usd_to_tl DECIMAL(10,4) DEFAULT 1,
    eur_to_tl DECIMAL(10,4) DEFAULT 1,
    stg_to_tl DECIMAL(10,4) DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default currency rate for current period
INSERT INTO currency_rates (donem, usd_to_tl, eur_to_tl, stg_to_tl)
VALUES ('OCAK 2026', 34.50, 37.20, 43.80);

-- Create index for faster queries
CREATE INDEX idx_payments_donem ON payments(donem);
CREATE INDEX idx_payments_odeme_durumu ON payments(odeme_durumu);
CREATE INDEX idx_payments_fatura_durumu ON payments(fatura_durumu);
CREATE INDEX idx_payments_sira_no ON payments(sira_no);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for demo - adjust as needed)
CREATE POLICY "Enable all access for payments" ON payments
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for currency_rates" ON currency_rates
    FOR ALL USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currency_rates_updated_at
    BEFORE UPDATE ON currency_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-documents', 'payment-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage policies
CREATE POLICY "Anyone can upload payment documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'payment-documents');

CREATE POLICY "Anyone can view payment documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'payment-documents');

CREATE POLICY "Anyone can delete payment documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'payment-documents');

-- ============================================
-- ALL 26 PAYMENT RECORDS FROM EXCEL
-- ============================================

INSERT INTO payments (sira_no, odeme_kalemleri, firma_fatura_ismi, isin_nevi, fatura_durumu, isin_adi, para_birimi, onceki_donemden_kalan_borc, bu_ayki_borc, toplam_borc, bu_ay_odenen, kalan, odeme_durumu) VALUES
(1, 'SGK (REPSAM)', 'KEMAL BATMAZOĞLU', 'RESMİ KURUM HARÇLARI', 'FATURALI', 'GZ', 'TL', 565.00, 0.00, 0.00, 0.00, 0.00, 'ÖDENMEDİ'),
(2, 'RESMİ MUHASEBE GİDERİ', 'KEMAL BATMAZOĞLU', 'RESMİ KURUM HARÇLARI', 'FATURASIZ', 'CNN', 'TL', 565.00, 0.00, 0.00, 0.00, 0.00, 'ÖDENMEDİ'),
(3, 'SGK(CAPRA )', 'ERGÜN DOLMACI & Co.', 'RESMİ KURUM HARÇLARI', 'FATURALI', 'ASKERİYE', 'TL', 565.00, 5000.00, 5565.00, 150000.00, -144435.00, 'BEKLEMEDE'),
(4, 'SU FATURALARI', NULL, 'RESMİ KURUM HARÇLARI', 'FATURASIZ', 'MERİT', 'TL', 565.00, 5000.00, 5565.00, 150000.00, -144435.00, 'BEKLEMEDE'),
(5, 'ELEKTRİK FATURALARI', NULL, 'RESMİ KURUM HARÇLARI', 'FATURALI', 'BALO', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(6, 'ÖMER DİLMAÇ', 'ÖMER DİLMAÇ', 'NAKLİYE', 'FATURASIZ', 'KANER', 'USD', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(7, 'ÖMER DİLMAÇ', 'ÖMER DİLMAÇ', 'NAKLİYE', 'FATURALI', 'GZ', 'TL', 25000.00, 154268.00, 179268.00, 150000.00, 29268.00, 'BEKLEMEDE'),
(8, 'TDA OTO (Honda & Yaris)', NULL, 'DEMİR BAŞ', 'FATURASIZ', 'GZ', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(9, 'ENVER DÜZKAR', 'ENVER DÜZKAR', 'TAŞERON', 'FATURALI', 'ETKİNLİK MEYDANI', 'STG', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(10, 'EDİZ METAL', 'KAİZ TRADING LTD', 'TAŞERON', 'FATURASIZ', 'MUTFAK', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(11, 'ALİ ÇELİK (GZ OTEL BLOK DUVAR İŞLERİ)', 'ALİ ÇELİK', 'TAŞERON', 'FATURALI', 'GZ', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(12, 'KEMAL GÜREŞÇİOĞLU', NULL, 'TAŞERON', 'FATURASIZ', 'İŞÇİ LOJMAN', 'EUR', 25000.00, 154268.00, 179268.00, 150000.00, 29268.00, 'BEKLEMEDE'),
(13, 'OYTUN YUNAK', 'OYTUN YUNAK', 'MALZEME TEDARİĞİ', 'FATURALI', 'DOME TAKSİ', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(14, 'CONAK ARD GERME', NULL, 'TAŞERON', 'FATURASIZ', 'GZ', 'EUR', 25000.00, 154268.00, 179268.00, 150000.00, 29268.00, 'BEKLEMEDE'),
(15, 'EDNA ERSOYOĞLU (İŞÇİ LOJMAN İNCE TEMİZLİK)', 'EDNA ERSOYOĞLU', 'TAŞERON', 'FATURASIZ', NULL, 'TL', 25000.00, 154268.00, 179268.00, 150000.00, 29268.00, 'BEKLEMEDE'),
(16, 'DAP METAL LTD', 'DAP METAL LTD', 'TAŞERON', 'FATURALI', 'GZ', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(17, 'CAHİT NECİPOĞLU', 'CAHİT NECİPOĞLU', 'MALZEME TEDARİĞİ', 'FATURASIZ', 'ETKİNLİK MEYDANI', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(18, 'HÜDAVERDİ ÇÖYGÜN', 'HÜDAVERDİ ÇÖYGÜN', 'TAŞERON', 'FATURASIZ', 'ETKİNLİK MEYDANI', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(19, 'ED&NA FORKLİFT VİNÇ', NULL, 'MAKİNE EKİPMAN', 'FATURALI', 'CASINO', 'USD', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(20, 'MEPAŞ', 'MEPAŞ LTD', 'MALZEME TEDARİĞİ', 'FATURASIZ', 'CASINO', 'USD', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(21, 'MEPAŞ', 'MEPAŞ LTD', 'MALZEME TEDARİĞİ', 'FATURALI', 'CASINO', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(22, 'MEPAŞ', 'MEPAŞ LTD', 'MALZEME TEDARİĞİ', 'FATURASIZ', 'CASINO', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(23, 'ANKASAV', 'ANKASAV SAVUNMA ÇELİK YAPI TURİZM İNŞAAT SANAYİ VE TİCARET LTD', 'TAŞERON', 'FATURALI', 'MOCK-UP 2. ÜNİTE', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(24, 'ANKASAV', 'ANKASAV SAVUNMA ÇELİK YAPI TURİZM İNŞAAT SANAYİ VE TİCARET LTD', 'TAŞERON', 'FATURASIZ', 'CASINO', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(25, 'MTH FATİH AKALIN CASINO FATURA ÖDEMESİ', 'MTH YAPI IMALAT ENERJI YAZILIM SANAYI TICARET LIMITED SIRKETI', 'TAŞERON', 'FATURALI', 'CASINO', 'TL', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE'),
(26, 'MTH FATİH AKALIN CASINO AVANS ÖDEMESİ 2.HAKEDİŞ', 'MTH YAPI IMALAT ENERJI YAZILIM SANAYI TICARET LIMITED SIRKETI', 'TAŞERON', 'FATURASIZ', 'CASINO', 'EUR', 150000.00, 5000.00, 155000.00, 150000.00, 5000.00, 'BEKLEMEDE');

-- ============================================
-- VIEW FOR CALCULATED TOTALS
-- ============================================

CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    donem,
    COUNT(*) as total_records,
    SUM(bu_ay_odenen) as total_paid,
    SUM(kalan) as total_remaining,
    SUM(toplam_borc) as total_debt
FROM payments
GROUP BY donem;

-- ============================================
-- END OF SCHEMA
-- Total: 26 Payment Records Inserted
-- ============================================
