import api from './axios';

export const newsApi = {
  list: (params) => api.get('/news', { params }).then((r) => r.data),
  get: (id) => api.get(`/news/${id}`).then((r) => r.data),
  triggerIngest: () => api.post('/news/ingest/trigger').then((r) => r.data),
  topics: () => api.get('/news/topics').then((r) => r.data),
  sources: () => api.get('/news/sources').then((r) => r.data),
};
