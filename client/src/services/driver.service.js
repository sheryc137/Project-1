import api from './api';

export const getAvailableOrders = () => api.get('/driver/available-orders');
export const acceptOrder = (id) => api.put(`/driver/orders/${id}/accept`);
export const markPickedUp = (id) => api.put(`/driver/orders/${id}/picked-up`);
export const markInTransit = (id) => api.put(`/driver/orders/${id}/in-transit`);
export const markDelivered = (id) => api.put(`/driver/orders/${id}/delivered`);
export const getDriverOrders = () => api.get('/driver/orders');
export const getEarnings = () => api.get('/driver/earnings');
export const startOnboarding = () => api.post('/payments/driver/onboard');
