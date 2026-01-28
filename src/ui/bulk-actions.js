
// Bulk Actions Manager
// Handles row selection, floating action bar, and batch operations

import { deletePaymentRecord } from '../api/supabase.js';
import { supabase } from '../api/supabase.js';
import { showToast, showLoading } from './notifications.js';

let selectedIds = new Set();
let allDataCached = [];
let refreshCallback = null;

export function initBulkActions(data, onRefresh) {
    allDataCached = data;
    if (onRefresh) refreshCallback = onRefresh;

    selectedIds.clear();
    updateFloatingBar();
}

export function toggleSelection(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    updateFloatingBar();
    updateMasterCheckbox();
}

export function toggleAll(shouldSelect) {
    if (shouldSelect) {
        allDataCached.forEach(p => selectedIds.add(p.id));
    } else {
        selectedIds.clear();
    }

    // Update UI checkboxes
    document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.checked = shouldSelect;
    });

    updateFloatingBar();
}

function updateMasterCheckbox() {
    const master = document.getElementById('checkboxAll');
    if (!master) return;

    const count = selectedIds.size;
    const total = allDataCached.length;

    master.checked = total > 0 && count === total;
    master.indeterminate = count > 0 && count < total;
}

function updateFloatingBar() {
    const bar = document.getElementById('floatingActionBar');
    const countSpan = document.getElementById('selectedCount');

    if (selectedIds.size > 0) {
        bar.classList.add('visible');
        countSpan.textContent = `${selectedIds.size} Kayıt Seçildi`;
    } else {
        bar.classList.remove('visible');
    }
}

// Bulk Operations
export async function deleteSelected() {
    if (!confirm(`${selectedIds.size} kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    showLoading(true);
    try {
        const ids = Array.from(selectedIds);

        if (supabase) {
            const { error } = await supabase
                .from('payments')
                .delete()
                .in('id', ids);
            if (error) throw error;
        } else {
            // Demo Mode Simulation
            console.log('Demo Mode: Bulk Deleted', ids);
            await new Promise(r => setTimeout(r, 500));
        }

        showToast('Başarılı', `${ids.length} kayıt silindi`, 'success');

        // Reset and Reload
        selectedIds.clear();
        updateFloatingBar();

        if (refreshCallback) await refreshCallback();

    } catch (err) {
        console.error(err);
        showToast('Hata', 'Silme işlemi başarısız', 'error');
    } finally {
        showLoading(false);
    }
}

export async function updateStatusSelected(status) {
    await updateFieldSelected('odeme_durumu', status);
}

export async function updateFieldSelected(field, value) {
    if (!field) return;

    showLoading(true);
    try {
        const ids = Array.from(selectedIds);

        if (supabase) {
            const updateObj = {};
            updateObj[field] = value;

            const { error } = await supabase
                .from('payments')
                .update(updateObj)
                .in('id', ids);
            if (error) throw error;
        } else {
            // Demo Mode Simulation
            console.log(`Demo Mode: Bulk Update ${field}=${value}`, ids);
            await new Promise(r => setTimeout(r, 500));
        }

        showToast('Başarılı', `${ids.length} kayıt güncellendi`, 'success');

        selectedIds.clear();
        updateFloatingBar();
        if (refreshCallback) await refreshCallback();

    } catch (err) {
        console.error(err);
        showToast('Hata', 'Güncelleme başarısız', 'error');
    } finally {
        showLoading(false);
    }
}
