
import { formatCurrency } from '../utils/formatters.js';
import { openModal } from './modal.js';
import { deletePayment } from '../main.js'; // Cyclic dependency? We'll inject or event bus later.
// Actually, better to expose a setup function or use custom events.
// For simplicity, let's attach global handlers in main.js or use event delegation.

export function renderTable(payments) {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');

    if (!payments || payments.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex'; // Changed to flex for centering
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tableBody.innerHTML = payments.map(payment => `
        <tr class="clickable-row" data-id="${payment.id}">
            <td class="checkbox-cell" onclick="event.stopPropagation()">
                <input type="checkbox" class="row-checkbox" value="${payment.id}">
            </td>
            <td>${payment.sira_no || '-'}</td>
            <td><strong>${payment.odeme_kalemleri || '-'}</strong></td>
            <td>${payment.firma_fatura_ismi || '-'}</td>
            <td>${payment.isin_nevi || '-'}</td>
            <td>${getFaturaBadge(payment.fatura_durumu)}</td>
            <td>${payment.isin_adi || '-'}</td>
            <td>${getParaBirimiBadge(payment.para_birimi)}</td>
            <td>${formatCurrency(payment.onceki_donemden_kalan_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.bu_ayki_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.toplam_borc, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.bu_ay_odenen, payment.para_birimi)}</td>
            <td>${formatCurrency(payment.kalan, payment.para_birimi)}</td>
            <td>${getOdemeBadge(payment.odeme_durumu)}</td>
            <td>${getDocumentLink(payment.ekrak_yukleme_url)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" data-id="${payment.id}" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${payment.id}" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getFaturaBadge(status) {
    const badges = {
        'FATURALI': '<span class="badge badge-success">Faturalı</span>',
        'FATURASIZ': '<span class="badge badge-warning">Faturasız</span>'
    };
    return badges[status] || '<span class="badge badge-gray">-</span>';
}

function getParaBirimiBadge(currency) {
    const colors = {
        'TL': 'info',
        'USD': 'success',
        'EUR': 'purple',
        'STG': 'danger'
    };
    const color = colors[currency] || 'gray';
    return `<span class="badge badge-${color}">${currency}</span>`;
}

function getOdemeBadge(status) {
    const badges = {
        'ÖDENDİ': '<span class="badge badge-success"><i class="fas fa-check"></i> Ödenmiş</span>',
        'KISMEN ÖDENDİ': '<span class="badge badge-warning"><i class="fas fa-clock"></i> Kısmen</span>',
        'ÖDENMEDİ': '<span class="badge badge-danger"><i class="fas fa-times"></i> Ödenmemiş</span>',
        'BEKLEMEDE': '<span class="badge badge-gray"><i class="fas fa-hourglass-half"></i> Beklemede</span>'
    };
    return badges[status] || '<span class="badge badge-gray">-</span>';
}

function getDocumentLink(url) {
    if (!url) return '<span class="text-muted text-xs">Yok</span>';
    return `
        <a href="${url}" target="_blank" class="link-primary text-xs" title="Dökümanı görüntüle">
            <i class="fas fa-file-pdf"></i> Görüntüle
        </a>
    `;
}
