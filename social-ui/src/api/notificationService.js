import api from "./axios";

export const getNotifications = () =>
    api.get("/notifications");

export const getUnreadCount = () =>
    api.get("/notifications/unread-count");

export const markAllRead = () =>
    api.post("/notifications/mark-all-read");

export const markOneRead = (id) =>
    api.post(`/notifications/${id}/read`);
