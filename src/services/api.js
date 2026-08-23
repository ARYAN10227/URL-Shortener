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
