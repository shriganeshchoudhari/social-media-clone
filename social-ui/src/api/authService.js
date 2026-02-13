import api from "./axios";

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const login = (credentials) => api.post("/auth/login", credentials);

export const register = (userData) => api.post("/auth/register", userData);

export const forgotPassword = (email) =>
    api.post("/auth/forgot-password", { email });

export const resetPassword = (email, otp, newPassword) =>
    api.post("/auth/reset-password", { email, otp, newPassword });
