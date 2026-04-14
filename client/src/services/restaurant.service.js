import api from './api';

export const listRestaurants = (params) => api.get('/restaurants', { params });
export const getRestaurant = (id) => api.get(`/restaurants/${id}`);
export const getMenu = (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`);
