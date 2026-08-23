import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'https://url-shortener-api-h1dj.onrender.com';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for Render free tier cold starts
});

export const TOKEN_KEY = 'url_shortener_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('token');
  }
}

// Centralized Axios Request Interceptor for JWT authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized Axios Response Interceptor for handling 401 unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Only clear auth and trigger event if this isn't the login/register credential failure itself
      if (!requestUrl.includes('/api/auth/login') && !requestUrl.includes('/api/auth/register')) {
        setStoredToken(null);
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { error } }));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a clean user-friendly error message from Axios errors
 */
export function getErrorMessage(err) {
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err.code === 'ECONNABORTED') {
    return 'The request timed out. The server might be waking up (Render free tier). Please try again in a few seconds.';
  }
  if (!err.response && err.request) {
    return 'Unable to reach the server. The backend might be waking up (Render free tier) or check your connection.';
  }
  return err.message || 'An unexpected error occurred.';
}

/**
 * Formats full short URL for a given short code
 */
export function buildShortUrl(shortCode) {
  const base = API_BASE_URL.replace(/^http:\/\//, 'https://');
  return `${base}/${shortCode}`;
}

export const apiService = {
  // POST /api/auth/register
  register: async ({ name, email, password }) => {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  // POST /api/auth/login
  login: async ({ email, password }) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  // GET /api/auth/me
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // POST /api/urls
  shortenUrl: async ({ originalUrl, shortCode }) => {
    const payload = { originalUrl };
    if (shortCode && shortCode.trim()) {
      payload.shortCode = shortCode.trim();
    }
    const response = await apiClient.post('/api/urls', payload);
    return response.data;
  },

  // GET /api/urls
  getUrls: async (params = {}) => {
    const response = await apiClient.get('/api/urls', { params });
    return response.data;
  },

  // GET /api/urls/:shortCode
  getUrlDetails: async (shortCode) => {
    const response = await apiClient.get(`/api/urls/${shortCode}`);
    return response.data;
  },

  // PATCH /api/urls/:shortCode
  updateUrl: async (shortCode, updates) => {
    const response = await apiClient.patch(`/api/urls/${shortCode}`, updates);
    return response.data;
  },

  // DELETE /api/urls/:shortCode
  deleteUrl: async (shortCode) => {
    const response = await apiClient.delete(`/api/urls/${shortCode}`);
    return response.data;
  },

  // GET /api/urls/:shortCode/analytics
  getUrlAnalytics: async (shortCode, params = {}) => {
    const response = await apiClient.get(`/api/urls/${shortCode}/analytics`, { params });
    return response.data;
  },

  // GET /health
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiService;
