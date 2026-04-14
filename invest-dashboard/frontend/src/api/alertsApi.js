import api from './axios';

export const alertsApi = {
  list: (params) => api.get('/alerts', { params }).then((r) => r.data),
  markRead: (id) => api.patch(`/alerts/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/alerts/read-all').then((r) => r.data),
  delete: (id) => api.delete(`/alerts/${id}`).then((r) => r.data),

  // Price alerts
  priceAlerts: () => api.get('/alerts/price-alerts').then((r) => r.data),
  createPriceAlert: (data) => api.post('/alerts/price-alerts', data).then((r) => r.data),
  updatePriceAlert: (id, data) =>
    api.patch(`/alerts/price-alerts/${id}`, data).then((r) => r.data),
  deletePriceAlert: (id) => api.delete(`/alerts/price-alerts/${id}`).then((r) => r.data),
};
