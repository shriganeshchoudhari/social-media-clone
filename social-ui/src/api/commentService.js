import api from "./axios";

export const getComments = (postId) =>
    api.get(`/posts/${postId}/comments`);

export const addComment = (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content });
