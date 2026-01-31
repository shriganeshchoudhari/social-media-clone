import api from "./axios";

export const getProfile = (username) =>
    api.get(`/users/${username}`);

export const toggleFollow = (username) =>
    api.post(`/users/${username}/follow`);

export const updateProfile = (bio, imageUrl) =>
    api.put(`/users/me`, null, { params: { bio, imageUrl } });

export const toggleBlock = (username) =>
    api.post(`/users/${username}/block`);

export const getFollowers = (username) =>
    api.get(`/users/${username}/followers`);

export const getFollowing = (username) =>
    api.get(`/users/${username}/following`);
