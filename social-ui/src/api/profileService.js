import api from "./axios";

export const getProfile = (username) =>
    api.get(`/users/${username}`);

export const toggleFollow = (username) =>
    api.post(`/users/${username}/follow`);
