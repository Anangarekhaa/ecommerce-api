import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth endpoints
  register: (email, password) =>
    api.post('/auth/register', { email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  
  getMe: () =>
    api.get('/auth/me'),

  // Products endpoints
  getProducts: (page = 1, size = 10, filters = {}) =>
    api.get('/products/', {
      params: {
        page: Math.max(1, page || 1),
        size,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        search: filters.search,
        sort_by: filters.sortBy || 'id',
        order: filters.order || 'asc',
      },
    }),

  getProductById: (productId) =>
    api.get(`/products/${productId}`),

  createProduct: (productData) =>
    api.post('/products/', productData),

  updateProduct: (productId, productData) =>
    api.put(`/products/${productId}`, productData),

  deleteProduct: (productId) =>
    api.delete(`/products/${productId}`),

  // Orders endpoints
  createOrder: (items) =>
    api.post('/orders/', { items }),

  getMyOrders: () =>
    api.get('/orders/me'),

  getAllOrders: () =>
    api.get('/orders/'),

  updateOrderStatus: (orderId, status) =>
    api.put(`/orders/${orderId}/status`, { status }),
};

export default apiService;
