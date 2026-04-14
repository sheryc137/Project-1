import api from './axios';

export const portfolioApi = {
  current: () => api.get('/portfolio/current').then((r) => r.data),
  snapshots: () => api.get('/portfolio/snapshots').then((r) => r.data),
  snapshot: (id) => api.get(`/portfolio/snapshots/${id}`).then((r) => r.data),
  sync: () => api.post('/portfolio/sync').then((r) => r.data),
  pnlHistory: (period = '7d') =>
    api.get('/portfolio/pnl/history', { params: { period } }).then((r) => r.data),
};
