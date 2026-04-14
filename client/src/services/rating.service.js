import api from './api';

export const submitRating = (data) => api.post('/ratings', data);
export const getRatingsForUser = (userId) => api.get(`/ratings/user/${userId}`);
export const getRatingsForOrder = (orderId) => api.get(`/ratings/order/${orderId}`);
