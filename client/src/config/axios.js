import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401) {
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register');

      // Avoid redirect loop/reload on login/register pages.
      const isOnLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

      if (!isAuthEndpoint && !isOnLoginPage) {
        // Token expired or invalid during protected API usage
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // For auth endpoints or while already on /login, let caller handle the error (e.g., show popup)
    }
    return Promise.reject(error);
  }
);

export default api;
