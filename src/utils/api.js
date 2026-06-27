const API_BASE = '/api';

// Get Firebase ID token for authenticated requests
async function getAuthToken() {
  const { auth } = await import('../firebase');
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
}

async function getHeaders() {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(endpoint, options = {}) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  syncUser: () => request('/auth/sync', { method: 'POST', body: JSON.stringify({}) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Treks
  getTreks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/treks${q ? `?${q}` : ''}`);
  },
  getTrek: (id) => request(`/treks/${id}`),
  getTrekReviews: (id) => request(`/treks/${id}/reviews`),
  addReview: (id, review) => request(`/treks/${id}/reviews`, { method: 'POST', body: JSON.stringify(review) }),

  // Bookings
  getBookings: () => request('/bookings'),
  createBooking: (booking) => request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  cancelBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Weather
  getWeather: () => request('/weather'),

  // SOS
  sendSOS: (data) => request('/sos', { method: 'POST', body: JSON.stringify(data) }),
  getSOSHistory: () => request('/sos'),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getActiveTrekkers: () => request('/dashboard/active-trekkers'),
  getAlerts: () => request('/dashboard/alerts'),
};

export default api;
