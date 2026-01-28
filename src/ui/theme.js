
import { showToast } from './notifications.js';

export function initTheme() {
    console.log('🎨 Initializing theme...');

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    console.log(`✅ Theme initialized: ${savedTheme}`);
}

export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);

    showToast('Tema', `${newTheme === 'dark' ? 'Karanlık' : 'Aydınlık'} mod aktif`, 'info');
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        // Animation triggers
        icon.style.animation = 'none';
        icon.offsetHeight; /* trigger reflow */
        icon.style.animation = 'iconSpin 0.5s ease';
    }
}
