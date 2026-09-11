import api from "./api";

export const registerRestaurant = (payload) => api.post("/restaurants/register/", payload);

export const verifyRestaurantRegistration = (payload) =>
  api.post("/restaurants/verify-registration/", payload);

export const getMyRestaurant = () => api.get("/restaurants/me/");

export const updateMyRestaurant = (payload) => {
  const isFormData = payload instanceof FormData;
  return api.patch("/restaurants/me/", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const updateMyOpeningHours = (hours) => api.put("/restaurants/me/opening-hours/", hours);
