import api from './axios';

export const analysisApi = {
  list: (params) => api.get('/analysis', { params }).then((r) => r.data),
  latest: () => api.get('/analysis/latest').then((r) => r.data),
  get: (id) => api.get(`/analysis/${id}`).then((r) => r.data),
  run: () => api.post('/analysis/run').then((r) => r.data),
  cost: () => api.get('/analysis/cost').then((r) => r.data),
};
