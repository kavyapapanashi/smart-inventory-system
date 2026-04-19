// js/script.js - Core Javascript for STOCKLINE

const API_BASE_URL = 'http://localhost:5000/api';

// --- Auth Utilities ---
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function isAuthenticated() {
  return !!getToken();
}

// --- API Helpers ---
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
}

// --- UI / RBAC Utilities ---
function enforceAuth(requiredRoles = []) {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return null;
  }
  const user = getUser();
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // 403 Forbidden handling
    alert('Access Denied');
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}

function updateNavbar() {
  const user = getUser();
  if (user) {
    const navRight = document.getElementById('nav-right');
    if (navRight) {
      navRight.innerHTML = `
        <div class="d-flex align-items-center gap-3">
          <span class="status-chip status-grey">${user.role}</span>
          <span class="fw-semibold">${user.name}</span>
          <button class="btn btn-sm btn-secondary-custom" onclick="logout()">Logout</button>
        </div>
      `;
    }
  }
}

function buildAlertUI(msg, type = 'error') {
  const bg = type === 'error' ? 'var(--error-container)' : 'var(--secondary-container)';
  const color = type === 'error' ? 'var(--on-error-container)' : 'var(--on-secondary-container)';
  return `
    <div class="alert text-center small mb-3 border-0 py-2" style="background-color: ${bg}; color: ${color}; border-radius: 0.5rem;" role="alert">
      ${msg}
    </div>
  `;
}

function formatCountdown(dateString) {
  if (!dateString) return "-";
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(target - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  if (target < now) return "Overdue";
  if (diffDays === 1) return `Tomorrow`;
  return `In ${diffDays} days`;
}

function getStockColor(stockCount) {
  if (stockCount > 20) return { class: 'status-green', label: 'In Stock' };
  if (stockCount > 0) return { class: 'status-yellow', label: 'Low Stock' };
  return { class: 'status-red', label: 'Out of Stock' };
}

// Ensure scripts only run once DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  // If navbar exists, init it
  if(document.getElementById('nav-right')) {
    updateNavbar();
  }
});
