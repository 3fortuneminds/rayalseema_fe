import api from "./api";

export const listRestaurantOrders = () => api.get("/orders/restaurant/");

export const getRestaurantOrder = (id) => api.get(`/orders/restaurant/${id}/`);

export const acceptOrder = (id) => api.post(`/orders/restaurant/${id}/accept/`);

export const rejectOrder = (id) => api.post(`/orders/restaurant/${id}/reject/`);

export const advanceOrder = (id) => api.post(`/orders/restaurant/${id}/advance/`);
