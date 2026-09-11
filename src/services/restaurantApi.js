import api from "./api";

export const listRestaurants = (params) => api.get("/restaurants/", { params });

export const getRestaurant = (slug) => api.get(`/restaurants/${slug}/`);

export const getRestaurantCategories = () => api.get("/restaurants/categories/");

export const favoriteRestaurant = (slug) => api.post(`/restaurants/${slug}/favorite/`);

export const unfavoriteRestaurant = (slug) => api.delete(`/restaurants/${slug}/favorite/`);

export const listFavoriteRestaurants = () => api.get("/restaurants/favorites/");
