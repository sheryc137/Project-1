import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

let _accessToken = null;
let _refreshing = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// Silent token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!_refreshing) {
        _refreshing = axios.post('/api/auth/refresh', {}, { withCredentials: true })
          .then((r) => { setAccessToken(r.data.accessToken); return r.data.accessToken; })
          .catch(() => { clearAccessToken(); window.location.href = '/login'; })
          .finally(() => { _refreshing = null; });
      }
      const newToken = await _refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
