import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong';
    err.userMessage = msg;
    return Promise.reject(err);
  }
);

export default api;

export const setStoredAuth = (payload) => {
  localStorage.setItem('auth', JSON.stringify(payload));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('auth');
};

export const getStoredAuth = () => {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
