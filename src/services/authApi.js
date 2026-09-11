import api from "./api";

export const register = (payload) => api.post("/accounts/register/", payload);

export const verifyRegistration = (payload) =>
  api.post("/accounts/verify-registration/", payload);

export const forgotPassword = (payload) => api.post("/accounts/forgot-password/", payload);

export const resetPassword = (payload) => api.post("/accounts/reset-password/", payload);

export const googleLogin = (payload) => api.post("/accounts/google/", payload);

export const getProfile = () => api.get("/accounts/profile/");

export const updateProfile = (payload) => {
  const isFormData = payload instanceof FormData;
  return api.patch("/accounts/profile/", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};
