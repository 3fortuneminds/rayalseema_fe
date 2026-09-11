import api from "./api";

// Users
export const listUsers = (params) => api.get("/admin/users/", { params });
export const suspendUser = (id) => api.post(`/admin/users/${id}/suspend/`);
export const reactivateUser = (id) => api.post(`/admin/users/${id}/reactivate/`);

// Restaurants
export const listAdminRestaurants = (params) => api.get("/admin/restaurants/", { params });
export const approveRestaurant = (id) => api.post(`/admin/restaurants/${id}/approve/`);
export const suspendRestaurant = (id) => api.post(`/admin/restaurants/${id}/suspend/`);
export const reactivateRestaurant = (id) => api.post(`/admin/restaurants/${id}/reactivate/`);

// Delivery partners
export const listAdminDeliveryPartners = (params) => api.get("/admin/delivery-partners/", { params });
export const approveDeliveryPartner = (id) => api.post(`/admin/delivery-partners/${id}/approve/`);
export const suspendDeliveryPartner = (id) => api.post(`/admin/delivery-partners/${id}/suspend/`);
export const reactivateDeliveryPartner = (id) => api.post(`/admin/delivery-partners/${id}/reactivate/`);

// Orders
export const listAdminOrders = (params) => api.get("/admin/orders/", { params });
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}/`);

// Payments & refunds
export const listAdminPayments = (params) => api.get("/admin/payments/", { params });
export const issueRefund = (paymentId, payload) => api.post(`/admin/payments/${paymentId}/refund/`, payload);

// Coupons
export const listAdminCoupons = (params) => api.get("/admin/coupons/", { params });
export const createCoupon = (payload) => api.post("/admin/coupons/", payload);
export const updateCoupon = (id, payload) => api.patch(`/admin/coupons/${id}/`, payload);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}/`);
export const getCouponUsage = (id) => api.get(`/admin/coupons/${id}/usage/`);

// Audit log
export const listAuditLog = (params) => api.get("/admin/audit-log/", { params });

// Settings
export const getPlatformSettings = () => api.get("/admin/settings/");
export const updatePlatformSettings = (payload) => api.patch("/admin/settings/", payload);

// Platform analytics
export const getPlatformDashboard = () => api.get("/analytics/platform/dashboard/");
export const getPlatformDailySummary = (params) => api.get("/analytics/platform/daily-summary/", { params });
