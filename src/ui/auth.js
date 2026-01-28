
// Simple Auth Module
// Manages a full-screen lock overlay with password protection.

const AUTH_KEY = 'isLoggedIn';
const PASSWORD = 'admin123'; // Simple password for demo

export function initAuth() {
    const isLogged = sessionStorage.getItem(AUTH_KEY) === 'true';

    if (!isLogged) {
        showLockScreen();
    }
}

function showLockScreen() {
    // Check if overlay exists
    if (document.getElementById('authOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.className = 'auth-overlay';

    overlay.innerHTML = `
        <div class="auth-card">
            <div class="auth-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h2>AS Teknolojik</h2>
            <p>Sisteme erişmek için şifre girin</p>
            
            <div class="auth-input-group">
                <input type="password" id="authPassword" placeholder="Şifre" autofocus>
                <button id="btnLogin" class="btn-auth">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            <p id="authError" class="auth-error"></p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Events
    const btn = overlay.querySelector('#btnLogin');
    const input = overlay.querySelector('#authPassword');

    btn.addEventListener('click', () => attemptLogin(input.value));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin(input.value);
    });
}

function attemptLogin(pass) {
    const errorMsg = document.getElementById('authError');

    if (pass === PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');

        // Unlock Animation
        const overlay = document.getElementById('authOverlay');
        overlay.classList.add('unlocking');

        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 600);

    } else {
        errorMsg.textContent = 'Hatalı Şifre!';
        const card = document.querySelector('.auth-card');
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 400);
    }
}

export function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
}
