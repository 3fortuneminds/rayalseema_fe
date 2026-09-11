import api from "./api";

export const listNotifications = () => api.get("/notifications/");

export const markNotificationRead = (id) => api.post(`/notifications/${id}/read/`);

export const markAllNotificationsRead = () => api.post("/notifications/read-all/");

export const getUnreadNotificationCount = () => api.get("/notifications/unread-count/");
