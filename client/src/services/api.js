/**
 * EarnFlow Frontend API Client
 */

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('earnflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      // Clear token on expired credentials
      localStorage.removeItem('earnflow_token');
      localStorage.removeItem('earnflow_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = new Error(data.error || response.statusText || 'An unexpected error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${qs}`);
  },
  getTaskById: (id) => request(`/tasks/${id}`),
  submitTask: (id, payload) => request(`/tasks/${id}/submit`, { method: 'POST', body: JSON.stringify(payload) }),

  // Wallet & Transactions
  getWallet: () => request('/wallet'),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/wallet/transactions${qs}`);
  },

  // Withdrawals
  requestWithdrawal: (payload) => request('/withdrawals', { method: 'POST', body: JSON.stringify(payload) }),
  getWithdrawals: () => request('/withdrawals'),

  // Referrals
  getReferrals: () => request('/referrals'),

  // Profile, Activation & Notifications
  getProfile: () => request('/user/profile'),
  updateProfile: (data) => request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/user/password', { method: 'PUT', body: JSON.stringify(data) }),
  getNotifications: () => request('/user/notifications'),
  markNotificationRead: (id) => request(`/user/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/user/notifications/read-all', { method: 'PUT' }),
  initializeActivation: () => request('/user/activate/initialize', { method: 'POST' }),
  verifyActivation: (reference) => request('/user/activate/verify', { method: 'POST', body: JSON.stringify({ reference }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/users?${query.toString()}`);
  },
  updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  confirmUserActivation: (id) => request(`/admin/users/${id}/confirm-activation`, { method: 'PUT' }),
  getAdminTasks: () => request('/admin/tasks'),
  createAdminTask: (task) => request('/admin/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateAdminTask: (id, task) => request(`/admin/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  deleteAdminTask: (id) => request(`/admin/tasks/${id}`, { method: 'DELETE' }),
  getAdminSubmissions: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/submissions?${query.toString()}`);
  },
  reviewSubmission: (id, payload) => request(`/admin/submissions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminWithdrawals: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/withdrawals?${query.toString()}`);
  },
  processWithdrawal: (id, payload) => request(`/admin/withdrawals/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminTransactions: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/admin/transactions?${query.toString()}`);
  },
  getAdminAuditLogs: () => request('/admin/audit-logs'),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (data) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
