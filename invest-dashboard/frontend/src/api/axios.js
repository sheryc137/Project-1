import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30_000,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.detail || error.message || 'Unknown error';

    if (status >= 500) {
      toast.error(`Server error: ${message}`);
    }

    return Promise.reject(error);
  }
);

export default api;
