import api from "./api";

export const createOrder = (payload) => api.post("/orders/", payload);

export const getOrder = (id) => api.get(`/orders/${id}/`);

export const listOrders = () => api.get("/orders/");
