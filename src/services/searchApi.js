import api from "./api";

export const search = (q) => api.get("/search/", { params: { q } });
