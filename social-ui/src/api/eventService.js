import api from "./axios";

export const createEvent = (data) =>
    api.post("/events", data);

export const getGroupEvents = (groupId, page = 0, size = 10) =>
    api.get(`/events/group/${groupId}?page=${page}&size=${size}`);

export const joinEvent = (eventId) =>
    api.post(`/events/${eventId}/join`);

export const leaveEvent = (eventId) =>
    api.post(`/events/${eventId}/leave`);

export const deleteEvent = (eventId) =>
    api.delete(`/events/${eventId}`);
