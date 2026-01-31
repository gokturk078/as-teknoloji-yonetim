# 🚀 Hızlı Kurulum Rehberi

## ⚡ 5 Adımda Başlayın

### 1. Supabase Projesi Oluştur (2 dakika)
- [x] https://supabase.com adresine git
- [x] Ücretsiz hesap oluştur
- [x] "New Project" butonuna tıkla
- [x] Proje oluştur (bekle 2-3 dakika)

### 2. SQL'i Çalıştır (1 dakika)
- [x] Supabase Dashboard'da **SQL Editor**'e git
- [x] `supabase-schema.sql` dosyasının tamamını kopyala
- [x] SQL Editor'a yapıştır
- [x] **Run** butonuna tıkla
- [x] ✅ Tüm tablolar hazır!

### 3. API Bilgilerini Al (30 saniye)
- [x] Supabase Dashboard'da **Settings > API**'ye git
- [x] **Project URL**'i kopyala
- [x] **anon public** key'ini kopyala

### 4. Uygulamayı Yapılandır (1 dakika)
- [x] `app.js` dosyasını aç
- [x] Şu satırları bul:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
- [x] Kopyaladığın bilgileri yapıştır:
```javascript
const SUPABASE_URL = 'https://abc123xyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. Uygulamayı Başlat (10 saniye)
```bash
# Terminal'i bu klasörde aç ve şu komutu çalıştır:
python3 -m http.server 8000
```
- [x] Tarayıcında `http://localhost:8000` adresini aç
- [x] 🎉 Hazır!

## 🎯 Test Et

Demo modunda çalıştığı için Supabase'i hemen bağlamasanız da test edebilirsiniz:

1. `index.html` dosyasını çift tıklayarak tarayıcıda açın
2. Demo verilerle tüm özellikleri test edin
3. Sonra Supabase'i bağlayın

## 📱 Kullanım

- **Yeni Ödeme**: Sağ üstteki "Yeni Ödeme" butonu
- **Düzenle**: Tablodaki ✏️ ikonu
- **Sil**: Tablodaki 🗑️ ikonu
- **Arama**: Üstteki arama kutusu
- **Filtreler**: Aşağı açılır menüler
- **Sıralama**: Sütun başlıklarına tıkla

## 🎨 Özellikler

✅ Tam CRUD (Ekle, Düzenle, Sil, Görüntüle)
✅ Gerçek zamanlı filtreleme ve arama
✅ Sıralama (artan/azalan)
✅ Döviz kuru dönüşümü
✅ Döküman yükleme (PDF/JPG)
✅ İstatistikler ve özetler
✅ Responsive tasarım
✅ Ultra-smooth animasyonlar
✅ Toast bildirimleri
✅ Demo modu

## 🆘 Yardım

Detaylı bilgi için `README.md` dosyasını okuyun.

**İyi çalışmalar! 🚀**
