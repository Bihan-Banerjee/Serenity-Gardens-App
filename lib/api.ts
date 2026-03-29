import axios from 'axios';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://serenity-gardens.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
  _token = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/me'),
};

// ── Items ─────────────────────────────────────────────────
export const itemsAPI = {
  getAll: (category?: string) =>
    api.get('/items', { params: category ? { category } : {} }),
  getOne: (id: string) => api.get(`/items/${id}`),
};

// ── Orders ────────────────────────────────────────────────
export const ordersAPI = {
  create: (orderData: object) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my'),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  create: (data: { name: string; message: string; rating: number }) =>
    api.post('/reviews', data),
};

export default api;
