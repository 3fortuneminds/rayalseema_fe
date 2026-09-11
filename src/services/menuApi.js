import api from "./api";

export const listMyFoods = () => api.get("/foods/", { params: { mine: "true" } });

export const createFood = (payload) => {
  const isFormData = payload instanceof FormData;
  return api.post("/foods/", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const updateFood = (id, payload) => {
  const isFormData = payload instanceof FormData;
  return api.patch(`/foods/${id}/`, payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const deleteFood = (id) => api.delete(`/foods/${id}/`);

export const toggleFoodAvailability = (id) => api.post(`/foods/${id}/toggle-availability/`);

export const listMyCategories = (restaurantSlug) =>
  api.get("/foods/categories/", { params: { restaurant: restaurantSlug } });

export const createMyCategory = (payload) => api.post("/foods/my-categories/", payload);

export const updateMyCategory = (id, payload) => api.patch(`/foods/my-categories/${id}/`, payload);

export const deleteMyCategory = (id) => api.delete(`/foods/my-categories/${id}/`);

export const createVariant = (payload) => api.post("/foods/my-variants/", payload);

export const updateVariant = (id, payload) => api.patch(`/foods/my-variants/${id}/`, payload);

export const deleteVariant = (id) => api.delete(`/foods/my-variants/${id}/`);
