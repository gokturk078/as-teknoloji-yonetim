
export function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    const iconEl = toast.querySelector('.toast-icon i');

    // Set content
    titleEl.textContent = title;
    messageEl.textContent = message;

    // Set type
    toast.className = `toast toast-${type} active`;

    // Set icon
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    iconEl.className = icons[type] || icons['info'];

    // Auto hide
    setTimeout(() => {
        hideToast();
    }, 3000);
}

export function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('active');
    }
}

export function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
        overlay.style.opacity = show ? '1' : '0';
    }
}

export function forceHideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
    }
}
