import api from "./axios";

export const createPost = (content) =>
    api.post("/posts", { content });

export const getPostById = (id) =>
    api.get(`/posts/${id}`);

export const getFeed = () =>
    api.get("/posts/feed/personal?page=0&size=20");

export const getFeedPage = (page, size = 10) =>
    api.get(`/posts/feed/personal?page=${page}&size=${size}`);
