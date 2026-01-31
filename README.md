# Ödeme Yönetim Sistemi

Profesyonel, modern ve tamamen web tabanlı ödeme yönetim sistemi. Supabase backend ile tam entegre çalışan, ultra-smooth UI deneyimi sunan uygulama.

## ✨ Özellikler

### 🎨 Modern Arayüz
- Glassmorphism tasarım dilinde profesyonel UI
- Ultra-smooth animasyonlar ve geçişler
- Responsive tasarım (mobil, tablet, desktop)
- Yüksek kontrast ve erişilebilirlik
- Print-friendly tasarım

### 📊 Analytics & Raporlama 🆕
- **Chart.js Grafikleri**: 4 farklı interaktif grafik
  - **Ödeme Trendi (Aylık)**: Son 6/12/24 aylık ödeme ve borç trendi (Line chart)
  - **Ödeme Durumu Dağılımı**: Ödenmiş, kısmen, ödenmemiş ve beklemede durumları (Doughnut chart)
  - **İşin Nevi Analizi**: İş türlerine göre kayıt dağılımı (Bar chart)
  - **Para Birimi Dağılımı**: TL/USD/EUR/STG dağılımı (Pie chart)
- **Dinamik Güncelleme**: Veriler değiştikçe grafikler otomatik güncellenir
- **Responsive Grafikler**: Tüm ekran boyutlarında mükemmel görünüm
- **Interaktif Tooltips**: Grafikler üzerinde detaylı bilgi gösterimi

### 🔍 Gelişmiş Filtreleme
- **Tarih Aralığı Seçici (Flatpickr)**: Başlangıç ve bitiş tarihi seçme
- **Multi-Filtreleme**: Birden fazla filtre aynı anda kullanılabilir
- **Anlık Arama**: Ödeme kalemi, firma veya iş adına göre anlık filtreleme
- **Debounce**: Arama performansını artırmak için debounce mekanizması

### 📥 Excel Dışa Aktarım (SheetJS) 🆕
- **Tüm Kayıtları Aktar**: Filtrelenmiş veya tüm kayıtları Excel'e aktar
- **Seçili Kayıtları Aktar**: Sadece seçili kayıtları Excel'e aktar
- **Otomatik Dosya Adı**: Tarih ile otomatik dosya adı oluşturma
- **Türkçe Sütun Adları**: Excel dosyasında Türkçe sütun başlıkları
- **Biçimlendirilmiş Sayı**: Para birimleri ve tarihler düzgün biçimlendirilmiş

### ✅ Toplu İşlemler (Bulk Operations) 🆕
- **Toplu Seçim**: Birden fazla kaydı aynı anda seçme
- **Toplu Silme**: Seçili kayıtları tek seferde silme
- **Toplu Dışa Aktarım**: Seçili kayıtları Excel'e aktarma
- **Sticky Action Bar**: Altta sabit action bar ile kolay erişim
- **Hepsini Seç**: Tek tıkla tüm kayıtları seçme

### 🧮 Otomatik Hesaplama 🆕
- **Toplam Borç Hesabı**: Önceki borç + bu ayki borc = toplam borc
- **Kalan Borç Hesabı**: Toplam borç - ödenen = kalan
- **Otomatik Durum Belirleme**: Borç durumuna göre ödeme durumu otomatik güncellenir
  - Borç = 0 → ÖDENDİ
  - Ödenen > 0 ve kalan > 0 → KISMEN ÖDENDİ
  - Ödenen = 0 ve borç > 0 → ÖDENMEDİ

### ✅ Veri Yönetimi
- **Supabase Entegrasyonu**: Gerçek zamanlı veri senkronizasyonu
- **Demo Modu**: Supabase bağlantısı yoksa otomatik demo modu
- **CRUD İşlemleri**: Tam ekleme, düzenleme ve silme yeteneği
- **Gelişmiş Filtreleme**: Çoklu filtre desteği (fatura durumu, para birimi, ödeme durumu)
- **Canlı Arama**: Anlık filtreleme ve arama özelliği
- **Sıralama**: Tüm sütunlara göre artan/azalan sıralama

### ✅ Özellikler
- **Kur Yönetimi**: USD, EUR ve STG için güncel kur bilgileri
- **Döküman Yükleme**: PDF/JPG döküman yükleme ve görüntüleme
- **Otomatik Hesaplama**: Toplam borç ve kalan tutarların otomatik hesaplanması
- **Otomatik Durum Güncelleme**: Ödeme durumunun otomatik belirlenmesi
- **Form Tasarrufu**: Yarıda kalan form verilerini localStorage'a kaydetme
- **Loading Overlay**: İşlem sırasında yükleniyor göstergesi
- **Klavye Kısayolları**: Hızlı işlem için kısayol desteği

### 🎯 Kullanıcı Deneyimi
- **0 Sürtünme**: Hızlı ve akıcı etkileşimler
- **Klavye Kısayolları**: 
  - `Ctrl/Cmd + D`: Dark Mode'a geç
  - `Ctrl/Cmd + N`: Yeni kayıt ekle
  - `Ctrl/Cmd + R`: Verileri yenile
  - `Ctrl/Cmd + F`: Arama kutusuna odaklan
  - `ESC`: Modalları kapat
- **Yükleme durumları ve progress göstergeleri**
- **Onay kutuları ve validation**

## 🚀 Kurulum

### 1. Gereksinimler
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Supabase hesabı (ücretsiz)

### 2. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com)'a gidin ve hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje adı girin (örn: "OdemeYonetimSistemi")
4. Veritabanı şifresi belirleyin
5. Region seçin (en yakın region'u seçin)
6. "Create new project" butonuna tıklayın
7. Projenin hazır olması için bekleyin (2-3 dakika)

### 3. Supabase SQL Schema Kurulumu

1. Supabase dashboard'ında **SQL Editor**'e gidin
2. `supabase-schema.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın
5. Tüm tabloların başarıyla oluşturulduğunu doğrulayın

### 4. Storage Bucket Kurulumu

SQL schema otomatik olarak storage bucket'ı oluşturacaktır. Eğer manuel olarak oluşturmak isterseniz:

1. Supabase dashboard'unda **Storage** sekmesine gidin
2. "New bucket" butonuna tıklayın
3. Bucket adı: `payment-documents`
4. Public bucket: **False** (özel bucket)
5. "Create bucket" butonuna tıklayın

### 5. Uygulamayı Yapılandırma

1. `app.js` dosyasını açın
2. Supabase URL ve Anon Key'inizi girin:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Bu bilgileri Supabase dashboard'unda **Settings > API** sekmesinden bulabilirsiniz.

### 6. Uygulamayı Çalıştırma

Uygulama statik bir web uygulamasıdır. Herhangi bir sunucu kurulumu gerektirmez:

**Seçenek 1: Doğrudan Açma**
```bash
# Sadece index.html dosyasını tarayıcınızda açın
open index.html
```

**Seçenek 2: Local Server (Önerilen)**
```bash
# Python ile
python3 -m http.server 8000

# Node.js ile (http-server paketi kullanarak)
npx http-server -p 8000

# PHP ile
php -S localhost:8000
```

Sonra tarayıcınızda `http://localhost:8000` adresini açın.

## 📖 Kullanım Kılavuzu

### Yeni Ödeme Kaydı Ekleme

1. **"Yeni Ödeme"** butonuna tıklayın
2. Formu doldurun:
   - Sıra No: Otomatik veya manuel numara
   - Ödeme Kalemi: Ödeme açıklaması
   - Firma Fatura İsmi: Firma adı (opsiyonel)
   - Firma IBAN: IBAN bilgisi (opsiyonel)
   - İşin Nevi: İş türünü seçin
   - Fatura Durumu: Faturalı/Faturasız
   - İş Adı: Proje veya iş adı
   - Para Birimi: TL/USD/EUR/STG
   - Finansal bilgiler: Borç, ödeme ve kalan tutarlar **otomatik hesaplanır**
   - Ödeme Durumu: Borç durumuna göre **otomatik belirlenir**
   - Döküman: PDF veya JPG dosyasını yükleyin
3. **"Kaydet"** butonuna tıklayın

### Kayıt Düzenleme

1. Tabloda düzenlemek istediğiniz kaydı bulun
2. **Düzenle** ikonuna (✏️) tıklayın
3. Gerekli değişiklikleri yapın
4. **"Kaydet"** butonuna tıklayın

### Kayıt Silme

1. Tabloda silmek istediğiniz kaydı bulun
2. **Sil** ikonuna (🗑️) tıklayın
3. Onay kutusunda **"Tamam"** butonuna tıklayın

### Filtreleme ve Arama

- **Arama**: Ödeme kalemi, firma veya iş adına göre anlık arama
- **Tarih Aralığı**: Başlangıç ve bitiş tarihi seçerek filtreleme
- **Fatura Durumu**: Faturalı/Faturasız filtreleme
- **Para Birimi**: TL/USD/EUR/STG filtreleme
- **Ödeme Durumu**: Ödenmiş/Ödenmiş/Kısmen/Beklemede filtreleme
- **Sıfırla**: Tüm filtreleri temizle

### Sıralama

Herhangi bir sütun başlığına tıklayarak sıralayabilirsiniz:
- İlk tıklama: Artan sıralama
- İkinci tıklama: Azalan sıralama

### 📊 Analytics Dashboard

Uygulamanın üst kısmında 4 farklı grafik görebilirsiniz:

1. **Ödeme Trendi (Aylık)**: 
   - Sol üstteki dropdown'dan periyodu seçin (6/12/24 ay)
   - Toplam ödenen ve toplam borç trendlerini görün
   - Mouse ile üzerine gelerek detaylı bilgileri görün

2. **Ödeme Durumu Dağılımı**: 
   - Ödeme durumlarının yüzdelik dağılımını görün
   - Doughnut chart ile görsel özet

3. **İşin Nevi Analizi**: 
   - İş türlerine göre kayıt sayılarını görün
   - Bar chart ile karşılaştırmalı görünüm

4. **Para Birimi Dağılımı**: 
   - Para birimlerine göre dağılımı görün
   - Pie chart ile görsel özet

### 📥 Excel Dışa Aktarım

Tüm kayıtları veya seçili kayıtları Excel'e aktarın:

1. **Tüm Kayıtları Aktar**: 
   - Sağ üstteki **"Excel'e Aktar"** butonuna tıklayın
   - Filtrelenmiş tüm kayıtlar Excel dosyasına aktarılır

2. **Seçili Kayıtları Aktar**: 
   - **"Toplu İşlem"** butonuna tıklayın
   - İstediğiniz kayıtları seçin (checkbox)
   - **"Excel'e Aktar"** butonuna tıklayın
   - Sadece seçili kayıtlar aktarılır
   - Excel dosyası otomatik indirilir

### ✅ Toplu İşlemler

Birden fazla kaydı aynı anda yönetin:

1. **Toplu İşlem** butonuna tıklayın
2. Kayıtların yanındaki checkbox'larla seçim yapın
3. **"Hepsini Seç"** ile tümünü seçebilirsiniz
4. Action bar'dan:
   - **Sil**: Seçili kayıtları sil
   - **Excel'e Aktar**: Seçili kayıtları dışa aktar
   - **İptal**: Seçimi temizle ve toplu işlem modundan çık

### 🧮 Otomatik Hesaplama

Sistem aşağı hesaplamaları otomatik yapar:

1. **Toplam Borç** = Önceki Dönemden Kalan Borç + Bu Ayki Borç
2. **Kalan Borç** = Toplam Borç - Bu Ay Ödenen
3. **Ödeme Durumu** otomatik olarak belirlenir:
   - Kalan ≤ 0 → ÖDENDİ
   - 0 < Kalan < Toplam ve Ödenen > 0 → KISMEN ÖDENDİ
   - Ödenen = 0 ve Toplam > 0 → ÖDENMEDİ

### Döviz Kurlarını Güncelleme

1. **"Güncel Kur Tablosu"** panelinde düzenle ikonuna tıklayın
2. USD, EUR ve STG kurlarını güncelleyin
3. **"Güncelle"** butonuna tıklayın
4. Tüm istatistikler otomatik olarak TL'ye dönüştürülerek güncellenecektir

### Döküman Görüntüleme

Yüklenen dökümanları görüntülemek için:
1. Tabloda **"Görüntüle"** linkine tıklayın
2. Döküman yeni sekmede açılacaktır

## 🎨 UI/UX Özellikleri

### Renk Paleti
- **Primary**: İndigo (#6366f1)
- **Success**: Yeşil (#10b981)
- **Warning**: Turuncu (#f59e0b)
- **Danger**: Kırmızı (#ef4444)
- **Info**: Mavi (#3b82f6)
- **Purple**: Mor (#8b5cf6)

### Animasyonlar
- Fade-in: Sayfa yüklenirken yumuşak giriş
- Slide-up: Kartların yukarı kayarak gelmesi
- Slide-down: Header'ın yukarıdan inmesi
- Modal: Yumuşak açılış/kapanış
- Hover: Buton ve satırlarda etkileşimli efektler
- Ripple: Butonlara tıklayınca ripple efekti
- Toast: Kayarak gelen bildirimler
- Chart: Grafiklerin yumuşak giriş animasyonu

### Responsive Breakpoints
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobil: < 768px

## 🔧 Gelişmiş Konfigürasyon

### Supabase RLS Policies

SQL schema'da zaten RLS (Row Level Security) policies tanımlanmıştır. Daha sıkı güvenlik için:

```sql
-- Sadece authenticated kullanıcıların verileri görmesine izin ver
CREATE POLICY "Only authenticated users can view payments"
ON payments FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Sadece authenticated kullanıcıların veri eklemesine izin ver
CREATE POLICY "Only authenticated users can insert payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Sadece authenticated kullanıcıların veri güncellemesine izin ver
CREATE POLICY "Only authenticated users can update payments"
ON payments FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Sadece authenticated kullanıcıların veri silmesine izin ver
CREATE POLICY "Only authenticated users can delete payments"
ON payments FOR DELETE
USING (auth.uid() IS NOT NULL);
```

### Otomatik Hesaplamalar

İsteğe bağlı, toplam borç ve kalan borç alanlarını otomatik hesaplayan bir trigger ekleyebilirsiniz:

```sql
CREATE OR REPLACE FUNCTION calculate_payment_totals()
RETURNS TRIGGER AS $$
BEGIN
    NEW.toplam_borc = COALESCE(NEW.onceki_donemden_kalan_borc, 0) + COALESCE(NEW.bu_ayki_borc, 0);
    NEW.kalan = NEW.toplam_borc - COALESCE(NEW.bu_ay_odenen, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_totals_before_insert
BEFORE INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION calculate_payment_totals();

CREATE TRIGGER calculate_totals_before_update
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION calculate_payment_totals();
```

## 📊 Veri Yapısı

### payments Tablosu
- `id`: UUID (Primary Key)
- `sira_no`: Integer
- `odeme_kalemleri`: Text
- `firma_fatura_ismi`: Text
- `firma_ibanlari`: Text
- `isin_nevi`: Text
- `fatura_durumu`: Text (FATURALI/FATURASIZ)
- `isin_adi`: Text
- `para_birimi`: Text (TL/USD/EUR/STG)
- `onceki_donemden_kalan_borc`: Decimal
- `bu_ayki_borc`: Decimal
- `toplam_borc`: Decimal
- `bu_ay_odenen`: Decimal
- `kalan`: Decimal
- `odeme_durumu`: Text
- `ekrak_yukleme_url`: Text
- `donem`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### currency_rates Tablosu
- `id`: UUID (Primary Key)
- `donem`: Text
- `usd_to_tl`: Decimal
- `eur_to_tl`: Decimal
- `stg_to_tl`: Decimal
- `updated_at`: Timestamp

## 🐛 Sorun Giderme

### Supabase Bağlantı Hatası
- URL ve Anon Key'in doğru olduğundan emin olun
- Supabase projenizin aktif olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin

### Dosya Yükleme Hatası
- Storage bucket'ın oluşturulduğundan emin olun
- Bucket policies'in doğru yapılandırıldığından emin olun
- Dosya boyutu limitlerini kontrol edin

### Demo Modu Çalışıyor
- `app.js` dosyasında Supabase URL ve key tanımlanmamışsa
- Uygulama otomatik olarak demo moduna geçer
- Demo verileriyle tüm özellikleri test edebilirsiniz

### Grafikler Görünmüyor
- Chart.js kütüphanesinin yüklendiğinden emin olun
- Browser console'da hata mesajlarını kontrol edin
- Canvas elementlerinin HTML'de olduğundan emin olun

### Excel Dışa Aktarım Çalışmıyor
- SheetJS kütüphanesinin yüklendiğinden emin olun
- Verilerin doğru formatlandığından emin olun
- Browser'in indirme izinlerini kontrol edin

## 📝 Lisans

Bu proje ücretsiz ve açık kaynaklıdır. Dilediğiniz gibi kullanabilir ve düzenleyebilirsiniz.

## 🤝 Katkıda Bulunma

Geliştirme önerileri ve hata raporları için lütfen issue açın.

## 📞 İletişim

Sorularınız için destek alabilirsiniz.

---

**Not**: Bu uygulama eğitim ve demonstrasyon amaçlıdır. Production kullanımı için ek güvenlik önlemleri almanız önerilir.
# as-teknoloji-yonetim
