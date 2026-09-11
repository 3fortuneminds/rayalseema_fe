import api from "./api";

export const createPayment = (orderId) => api.post("/payments/create/", { order_id: orderId });

export const verifyPayment = (payload) => api.post("/payments/verify/", payload);
