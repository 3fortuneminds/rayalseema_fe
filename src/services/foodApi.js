import api from "./api";

export const listFoods = (params) => api.get("/foods/", { params });

export const getFood = (id) => api.get(`/foods/${id}/`);

export const getFoodCategories = (restaurantSlug) =>
  api.get("/foods/categories/", { params: { restaurant: restaurantSlug } });

export const wishlistFood = (id) => api.post(`/foods/${id}/wishlist/`);

export const unwishlistFood = (id) => api.delete(`/foods/${id}/wishlist/`);

export const listWishlist = () => api.get("/foods/wishlist/");
