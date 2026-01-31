
import { uploadDocument } from '../api/supabase.js';
import { showToast } from './notifications.js';
import { AppState } from '../state/store.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

export function populatePaymentForm(payment) {
    // CRITICAL: Always get fresh data from centralized state to prevent stale data issues
    const freshPayment = AppState.getPaymentById(payment.id) || payment;

    document.getElementById('paymentId').value = freshPayment.id;
    document.getElementById('siraNo').value = freshPayment.sira_no || '';
    document.getElementById('odemeKalemleri').value = freshPayment.odeme_kalemleri || '';
    document.getElementById('firmaFaturaIsmi').value = freshPayment.firma_fatura_ismi || '';
    document.getElementById('firmaIbanlari').value = freshPayment.firma_ibanlari || '';
    document.getElementById('isinNevi').value = freshPayment.isin_nevi || '';
    document.getElementById('faturaDurumu').value = freshPayment.fatura_durumu || '';
    document.getElementById('isinAdi').value = freshPayment.isin_adi || '';
    document.getElementById('paraBirimi').value = freshPayment.para_birimi || '';
    document.getElementById('oncekiBorc').value = freshPayment.onceki_donemden_kalan_borc || 0;
    document.getElementById('buAykiBorc').value = freshPayment.bu_ayki_borc || 0;
    document.getElementById('toplamBorc').value = freshPayment.toplam_borc || 0;
    document.getElementById('buAyOdenen').value = freshPayment.bu_ay_odenen || 0;
    document.getElementById('kalan').value = freshPayment.kalan || 0;
    document.getElementById('odemeDurumu').value = freshPayment.odeme_durumu || '';
    document.getElementById('ekrakYuklemeUrl').value = freshPayment.ekrak_yukleme_url || '';

    // Update title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Ödeme Kaydını Düzenle';
}

export function resetPaymentForm() {
    const form = document.getElementById('paymentForm');
    if (form) form.reset();
    document.getElementById('paymentId').value = '';
    document.getElementById('modalTitle').textContent = 'Yeni Ödeme Kaydı';
}

// File Upload Handler
export async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const preview = document.getElementById('filePreview');
    if (preview) preview.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Yükleniyor...`;

    try {
        const url = await uploadDocument(file);
        document.getElementById('ekrakYuklemeUrl').value = url;
        if (preview) preview.innerHTML = `<i class="fas fa-check"></i> ${file.name}`;
        showToast('Başarılı', 'Dosya yüklendi');
    } catch (error) {
        console.error(error);
        if (preview) preview.innerHTML = `<span class="text-danger">Hata!</span>`;
        showToast('Hata', 'Dosya yüklenemedi', 'error');
    }
}
