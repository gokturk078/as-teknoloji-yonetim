-- ============================================
-- ŞİRKET BAZLI BORÇ TAKİP SİSTEMİ - SQL ŞEMASI
-- Ultra Professional Company Debt Tracking
-- ============================================

-- ============================================
-- 1. ŞİRKETLER TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    iban TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    initial_debt DECIMAL(15,2) DEFAULT 0,  -- Başlangıç borcu
    currency TEXT CHECK (currency IN ('TL', 'USD', 'EUR', 'STG')) DEFAULT 'TL',
    status TEXT CHECK (status IN ('AKTIF', 'PASIF')) DEFAULT 'AKTIF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- ============================================
-- 2. ŞİRKET ÖDEME HAREKETLERİ TABLOSU
-- ============================================

CREATE TABLE IF NOT EXISTS company_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('BORÇ', 'ÖDEME')),
    currency TEXT CHECK (currency IN ('TL', 'USD', 'EUR', 'STG')) DEFAULT 'TL',
    description TEXT,
    document_url TEXT,
    reference_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'Sistem'
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_company_payments_company_id ON company_payments(company_id);
CREATE INDEX IF NOT EXISTS idx_company_payments_date ON company_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_company_payments_type ON company_payments(payment_type);

-- ============================================
-- 3. ŞİRKET ÖZET VIEW
-- ============================================

CREATE OR REPLACE VIEW company_summary AS
SELECT 
    c.id,
    c.name,
    c.iban,
    c.contact_person,
    c.phone,
    c.email,
    c.currency,
    c.status,
    c.initial_debt,
    c.created_at,
    -- Yeni eklenen borçların toplamı
    COALESCE(SUM(CASE WHEN cp.payment_type = 'BORÇ' THEN cp.amount ELSE 0 END), 0) as total_new_debt,
    -- Yapılan ödemelerin toplamı
    COALESCE(SUM(CASE WHEN cp.payment_type = 'ÖDEME' THEN cp.amount ELSE 0 END), 0) as total_paid,
    -- Toplam borç = Başlangıç borcu + Yeni borçlar
    c.initial_debt + COALESCE(SUM(CASE WHEN cp.payment_type = 'BORÇ' THEN cp.amount ELSE 0 END), 0) as total_debt,
    -- Kalan borç = Toplam borç - Ödemeler
    c.initial_debt + 
        COALESCE(SUM(CASE WHEN cp.payment_type = 'BORÇ' THEN cp.amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN cp.payment_type = 'ÖDEME' THEN cp.amount ELSE 0 END), 0) as remaining_debt,
    -- Ödeme yüzdesi
    CASE 
        WHEN (c.initial_debt + COALESCE(SUM(CASE WHEN cp.payment_type = 'BORÇ' THEN cp.amount ELSE 0 END), 0)) > 0 
        THEN ROUND(
            (COALESCE(SUM(CASE WHEN cp.payment_type = 'ÖDEME' THEN cp.amount ELSE 0 END), 0) * 100.0) / 
            (c.initial_debt + COALESCE(SUM(CASE WHEN cp.payment_type = 'BORÇ' THEN cp.amount ELSE 0 END), 0)), 
            2
        )
        ELSE 0 
    END as payment_percentage,
    -- İşlem sayısı
    COUNT(cp.id) as transaction_count,
    -- Son işlem tarihi
    MAX(cp.payment_date) as last_transaction_date
FROM companies c
LEFT JOIN company_payments cp ON c.id = cp.company_id
GROUP BY c.id, c.name, c.iban, c.contact_person, c.phone, c.email, c.currency, c.status, c.initial_debt, c.created_at;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_payments ENABLE ROW LEVEL SECURITY;

-- Policies (demo için tam erişim)
CREATE POLICY "Enable all access for companies" ON companies
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for company_payments" ON company_payments
    FOR ALL USING (true)
    WITH CHECK (true);

-- ============================================
-- 5. UPDATED_AT TRİGGER
-- ============================================

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ÖRNEK VERİLER (DEMO)
-- ============================================

-- Şirketler
INSERT INTO companies (name, iban, contact_person, phone, initial_debt, currency) VALUES
('MEPAŞ LTD', 'TR12 0001 0000 0000 0000 0001', 'Mehmet Yılmaz', '+90 533 123 4567', 150000.00, 'TL'),
('ANKASAV SAVUNMA ÇELİK YAPI TURİZM', 'TR12 0001 0000 0000 0000 0002', 'Ahmet Kaya', '+90 532 234 5678', 300000.00, 'EUR'),
('MTH YAPI IMALAT ENERJI', 'TR12 0001 0000 0000 0000 0003', 'Fatih Akalın', '+90 531 345 6789', 305000.00, 'TL'),
('ÖMER DİLMAÇ NAKLİYE', 'TR12 0001 0000 0000 0000 0004', 'Ömer Dilmaç', '+90 530 456 7890', 179268.00, 'TL'),
('DAP METAL LTD', 'TR12 0001 0000 0000 0000 0005', 'Davut Polat', '+90 539 567 8901', 155000.00, 'EUR'),
('KEMAL BATMAZOĞLU', NULL, 'Kemal Batmazoğlu', '+90 538 678 9012', 1130.00, 'TL'),
('EDİZ METAL', 'TR12 0001 0000 0000 0000 0007', 'Ediz Karahan', '+90 537 789 0123', 155000.00, 'EUR'),
('ENVER DÜZKAR', NULL, 'Enver Düzkar', '+90 536 890 1234', 155000.00, 'STG'),
('ALİ ÇELİK', NULL, 'Ali Çelik', '+90 535 901 2345', 155000.00, 'TL'),
('HÜDAVERDİ ÇÖYGÜN', NULL, 'Hüdaverdi Çöygün', '+90 534 012 3456', 155000.00, 'TL')
ON CONFLICT (name) DO NOTHING;

-- Örnek ödeme hareketleri
INSERT INTO company_payments (company_id, payment_date, amount, payment_type, currency, description) VALUES
-- MEPAŞ LTD ödemeleri
((SELECT id FROM companies WHERE name = 'MEPAŞ LTD'), '2026-01-05', 25000.00, 'ÖDEME', 'TL', 'Ocak 2026 - 1. taksit ödemesi'),
((SELECT id FROM companies WHERE name = 'MEPAŞ LTD'), '2026-01-15', 30000.00, 'ÖDEME', 'TL', 'Ocak 2026 - 2. taksit ödemesi'),
((SELECT id FROM companies WHERE name = 'MEPAŞ LTD'), '2026-01-20', 20000.00, 'ÖDEME', 'TL', 'Ocak 2026 - 3. taksit ödemesi'),

-- MTH YAPI ödemeleri
((SELECT id FROM companies WHERE name = 'MTH YAPI IMALAT ENERJI'), '2026-01-10', 100000.00, 'ÖDEME', 'TL', 'Casino projesi avans ödemesi'),
((SELECT id FROM companies WHERE name = 'MTH YAPI IMALAT ENERJI'), '2026-01-18', 50000.00, 'ÖDEME', 'TL', 'Casino projesi 2. hakediş'),

-- ANKASAV ödemeleri
((SELECT id FROM companies WHERE name = 'ANKASAV SAVUNMA ÇELİK YAPI TURİZM'), '2026-01-12', 100000.00, 'ÖDEME', 'EUR', 'Mock-up 2. ünite ödemesi'),

-- Yeni borç eklemeleri
((SELECT id FROM companies WHERE name = 'MEPAŞ LTD'), '2026-01-22', 15000.00, 'BORÇ', 'TL', 'Ek malzeme siparişi'),
((SELECT id FROM companies WHERE name = 'MTH YAPI IMALAT ENERJI'), '2026-01-21', 45000.00, 'BORÇ', 'TL', 'Ek işçilik bedeli');

-- ============================================
-- END OF SCHEMA
-- ============================================
