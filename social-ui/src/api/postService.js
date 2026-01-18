import api from "./axios";

export const createPost = (content) =>
    api.post("/posts", { content });

export const getFeed = () =>
    api.get("/posts/feed/personal?page=0&size=20");
