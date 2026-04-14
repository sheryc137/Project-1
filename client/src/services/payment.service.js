import api from './api';

export const createPaymentIntent = (data) => api.post('/payments/create-intent', data);
export const getPayment = (orderId) => api.get(`/payments/${orderId}`);
