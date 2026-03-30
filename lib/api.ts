import axios from 'axios';

// Change this to your backend URL
const BASE_URL = __DEV__
  ? 'http://192.168.1.X:5000/api'
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
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
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
  verifyPayment: (paymentData: { 
    razorpay_payment_id: string; 
    razorpay_order_id: string; 
    razorpay_signature: string 
  }) => api.post('/orders/verify', paymentData),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewsAPI = {
  // Assuming your backend mounts this router at /api/reviews
  getAll: () => api.get('/reviews'),
  
  // Backend expects 'review' instead of 'message', and route is /submit
  create: (data: { name: string; review: string; rating?: number }) =>
    api.post('/reviews/submit', data),
};

export const adminItemsAPI = {
  // Uses GET /items/all to fetch unfinalized items too
  getAllAdmin: () => api.get('/items/all'),
  
  // Uses FormData for multer
  create: (formData: any) => 
    api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    
  // Updates only price and stock as per your backend
  update: (id: string, data: { price?: number; stock?: number }) => 
    api.patch(`/items/${id}`, data),
    
  delete: (id: string) => api.delete(`/items/${id}`),
  
  finalize: (id: string) => api.patch(`/items/finalize/${id}`),
};

export const adminOrdersAPI = {
  getAllAdmin: () => api.get('/orders'),
  
  // Updates the paid status
  updatePaymentStatus: (id: string, paid: boolean) => 
    api.patch(`/orders/${id}`, { paid }),
    
  delete: (id: string) => api.delete(`/orders/${id}`),
};

export default api;
