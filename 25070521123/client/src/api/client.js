import axios from 'axios';

export const TOKEN_KEY = 'melody_token';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Where uploaded audio is served from (baseURL minus the /api suffix).
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set the multipart boundary itself.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

/** Absolute URL for a song's audio file, or '' when it has none. */
export function audioSrc(song) {
  const url = song?.audioUrl;
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}

/** Human readable file size, e.g. "4.2 MB". */
export function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (!value) return '0 KB';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

/** Pull a readable message out of an axios error. */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

export default api;
