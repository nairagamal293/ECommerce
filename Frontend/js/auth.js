const AUTH_API_BASE = 'https://localhost:7118/api/Auth'; // Specific to auth endpoints

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    
    // Add logout event listener if logout button exists
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function checkAuthState() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('auth-links');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    
    if (token) {
        // User is logged in
        if (authLinks) authLinks.classList.add('d-none');
        if (profileLink) profileLink.classList.remove('d-none');
        if (logoutLink) logoutLink.classList.remove('d-none');
    } else {
        // User is not logged in
        if (authLinks) authLinks.classList.remove('d-none');
        if (profileLink) profileLink.classList.add('d-none');
        if (logoutLink) logoutLink.classList.add('d-none');
        
        // If on a protected page, redirect to login
        const protectedPages = ['cart.html', 'wishlist.html', 'orders.html', 'profile.html'];
        if (protectedPages.includes(window.location.pathname.split('/').pop())) {
            window.location.href = 'login.html';
        }
    }
}


async function handleLogin(email, password) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        showToast('Login successful', 'success');
        
        // Decode token immediately for quick redirect
        const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
        console.log('Login token payload:', tokenPayload);
        
        if (tokenPayload.role === 'Admin') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
        
        return true;
    } catch (error) {
        showToast(error.message, 'danger');
        return false;
    }
}


async function checkUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        // First try to decode from token directly
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload.role) {
            return { roles: [tokenPayload.role] };
        }

        // Fallback to API request if role not in token
        const response = await fetch(`${AUTH_API_BASE}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error checking user role:', error);
        throw error;
    }
}



async function handleRegister(userData) {
    try {
        const response = await fetch(`${AUTH_API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        showToast('Registration successful. Please login.', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        
        return true;
    } catch (error) {
        showToast(error.message, 'danger');
        return false;
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function getAuthToken() {
    return localStorage.getItem('token');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast show align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Export functions for use in other modules
// At the end of auth.js, update the exports:
window.auth = {
    handleLogin,
    handleRegister,
    handleLogout,
    getAuthToken,
    checkAuthState,
    checkUserRole,  // Make sure this is included
    showToast
};