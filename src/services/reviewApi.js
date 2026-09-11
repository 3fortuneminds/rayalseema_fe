import api from "./api";

export const listReviews = (restaurantSlug) => api.get("/reviews/", { params: { restaurant: restaurantSlug } });

export const createReview = (payload) => api.post("/reviews/", payload);

export const respondToReview = (id, response) => api.post(`/reviews/${id}/respond/`, { response });
