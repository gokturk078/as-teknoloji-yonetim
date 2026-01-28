
import { showToast, showLoading } from '../ui/notifications.js';

// Excel Manager Module
// Handles reading and writing of Excel files using SheetJS (XLSX)

export const ExcelManager = {
    // Read Excel File
    readExcel: async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Assume first sheet is the one we want
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        raw: false, // Parse dates/numbers
                        dateNF: 'yyyy-mm-dd'
                    });

                    resolve(jsonData);
                } catch (error) {
                    console.error('Excel Parsing Error:', error);
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    // Map Excel columns to our internal partial schema
    // This is a "Smart Mapping" heuristic
    mapData: (rawData) => {
        const mappedData = [];

        rawData.forEach((row, index) => {
            // normalizing keys to lowercase and removing spaces for safer matching
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.trim().toLowerCase()] = row[key];
            });

            // Create a clean object based on our schema
            // We look for common variances in headers
            const cleanObj = {
                sira_no: parseInt(row['Sıra No'] || row['S.No'] || row['NO'] || index + 1),
                odeme_kalemleri: row['Ödeme Kalemleri'] || row['ÖDEME KALEMİ'] || row['AÇIKLAMA'] || 'Bilinmiyor',
                firma_fatura_ismi: row['Firma Fatura İsmi'] || row['FİRMA'] || null,
                isin_nevi: row['İşin Nevi'] || row['KATEGORİ'] || 'Diğer',
                fatura_durumu: (row['Fatura Durumu'] || '').toUpperCase().includes('SIZ') ? 'FATURASIZ' : 'FATURALI',
                isin_adi: row['İşin Adı'] || row['PROJE'] || null,
                para_birimi: detectCurrency(row['Para Birimi'] || row['DÖVİZ'] || 'TL'),

                // Financials - Ensure numbers
                onceki_donemden_kalan_borc: parseMoney(row['Önceki Dönemden Kalan Borç'] || row['DEVİR'] || 0),
                bu_ayki_borc: parseMoney(row['Bu Ayki Borç'] || row['BORÇ'] || 0),
                bu_ay_odenen: parseMoney(row['Bu Ay Ödenen'] || row['ÖDENEN'] || 0),

                // Status defaults
                odeme_durumu: 'BEKLEMEDE',
                donem: 'OCAK 2026' // Default or dynamic?
            };

            // Calculated fields
            cleanObj.toplam_borc = cleanObj.onceki_donemden_kalan_borc + cleanObj.bu_ayki_borc;
            cleanObj.kalan = cleanObj.toplam_borc - cleanObj.bu_ay_odenen;

            // Determine Status Logic if not explicitly set
            if (cleanObj.kalan <= 0 && cleanObj.toplam_borc > 0) cleanObj.odeme_durumu = 'ÖDENDİ';
            else if (cleanObj.bu_ay_odenen > 0) cleanObj.odeme_durumu = 'KISMEN ÖDENDİ';
            else cleanObj.odeme_durumu = 'ÖDENMEDİ';

            mappedData.push(cleanObj);
        });

        return mappedData;
    },

    // Export to Excel
    exportToExcel: (data, filename = 'odeme_listesi.xlsx') => {
        try {
            // Flatten/Format data for export
            const exportData = data.map(item => ({
                'Sıra No': item.sira_no,
                'Ödeme Kalemleri': item.odeme_kalemleri,
                'Firma': item.firma_fatura_ismi,
                'İşin Nevi': item.isin_nevi,
                'Fatura Durumu': item.fatura_durumu,
                'İş Adı': item.isin_adi,
                'Para Birimi': item.para_birimi,
                'Önceki Borç': item.onceki_donemden_kalan_borc,
                'Bu Ayki Borç': item.bu_ayki_borc,
                'Toplam Borç': item.toplam_borc,
                'Ödenen': item.bu_ay_odenen,
                'Kalan': item.kalan,
                'Durum': item.odeme_durumu
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Ödemeler");

            // Auto-width columns
            const max_width = exportData.reduce((w, r) => Math.max(w, r['Ödeme Kalemleri']?.length || 10), 10);
            worksheet["!cols"] = [{ wch: 5 }, { wch: max_width }]; // Simple heuristic

            XLSX.writeFile(workbook, filename);
            showToast('Başarılı', 'Excel dosyası indirildi', 'success');
        } catch (error) {
            console.error('Export Error:', error);
            showToast('Hata', 'Excel oluşturulamadı', 'error');
        }
    }
};

// Helpers
function parseMoney(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Remove symbols and convert comma to dot if needed (TR locale)
    const clean = value.toString().replace(/[^0-9,.-]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

function detectCurrency(val) {
    if (!val) return 'TL';
    const v = val.toString().toUpperCase();
    if (v.includes('USD') || v.includes('DOLAR')) return 'USD';
    if (v.includes('EUR') || v.includes('EURO')) return 'EUR';
    if (v.includes('STG') || v.includes('STERLIN')) return 'STG';
    return 'TL';
}
