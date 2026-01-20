import api from "./axios";

export const searchUsers = (q) =>
    api.get(`/users/search?q=${q}&page=0&size=10`);
