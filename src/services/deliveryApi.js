import api from "./api";

export const registerDeliveryPartner = (payload) => api.post("/delivery/register/", payload);

export const verifyDeliveryRegistration = (payload) => api.post("/delivery/verify-registration/", payload);

export const getMyDeliveryPartner = () => api.get("/delivery/me/");

export const updateMyDeliveryPartner = (payload) => api.patch("/delivery/me/", payload);

export const toggleOnline = () => api.post("/delivery/me/toggle-online/");

export const listAvailableOrders = (params) => api.get("/delivery/available-orders/", { params });

export const acceptDelivery = (orderId) => api.post(`/delivery/available-orders/${orderId}/accept/`);

export const listMyDeliveries = () => api.get("/delivery/my-deliveries/");

export const getMyDelivery = (assignmentId) => api.get(`/delivery/my-deliveries/${assignmentId}/`);

export const markPickedUp = (assignmentId) => api.post(`/delivery/my-deliveries/${assignmentId}/picked-up/`);

export const markDelivered = (assignmentId) => api.post(`/delivery/my-deliveries/${assignmentId}/delivered/`);

export const getEarningsSummary = () => api.get("/delivery/earnings/summary/");

export const pushLocation = (orderId, latitude, longitude) =>
  api.post("/tracking/location/", { order_id: orderId, latitude, longitude });
