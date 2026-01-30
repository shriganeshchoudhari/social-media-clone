import api from "./axios";

export const createPost = async (content, imageFiles) => {
    const formData = new FormData();
    formData.append("content", content);

    if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => formData.append("images", file));
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
    const formData = new FormData();
    formData.append("content", content);
    return api.put(`/posts/${postId}`, formData);
};

export const getPostsByUser = (username, page = 0, size = 10) =>
    api.get(`/posts/user/${username}?page=${page}&size=${size}`);
