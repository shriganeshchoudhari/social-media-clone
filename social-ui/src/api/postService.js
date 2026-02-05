import api from "./axios";

export const createPost = async (content, imageFiles, groupId) => {
    const formData = new FormData();
    formData.append("content", content);

    if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append("images", file));
    }

    if (groupId) {
        formData.append("groupId", groupId);
    }

    return api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
};

export const getPostById = (id) =>
    api.get(`/posts/${id}`);

export const getFeed = () =>
    api.get("/posts/feed/personal?page=0&size=20");

export const getFeedPage = (page, size = 10) =>
    api.get(`/posts/feed/personal?page=${page}&size=${size}`);

export const deletePost = (postId) =>
    api.delete(`/posts/${postId}`);

export const editPost = (postId, content) => {
    return api.put(`/posts/${postId}`, { content });
};

export const getPostsByUser = (username) =>
    api.get(`/posts/user/${username}`);

export const toggleSavePost = (postId) =>
    api.post(`/posts/${postId}/save`);

export const getSavedPosts = (page = 0) =>
    api.get(`/posts/saved?page=${page}`);

export const searchPosts = (query, page = 0, size = 10) =>
    api.get(`/posts/search?q=${query}&page=${page}&size=${size}`);
