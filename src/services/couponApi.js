import api from "./api";

export const listActiveCoupons = () => api.get("/coupons/");

export const validateCoupon = (code, subtotal) => api.post("/coupons/validate/", { code, subtotal });
