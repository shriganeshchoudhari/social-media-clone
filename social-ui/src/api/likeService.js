import api from "./axios";

export const toggleLike = (postId) =>
    api.post(`/posts/${postId}/like`);
