import api from "./axios";

export const updateProfile = (bio, avatarFile) => {
    const form = new FormData();

    if (bio !== null && bio !== undefined) {
        form.append("bio", bio);
    }

    if (avatarFile) {
        form.append("avatar", avatarFile);
    }

    return api.put("/users/me", form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const changePassword = (oldPassword, newPassword) =>
    api.post("/users/me/change-password", {
        oldPassword,
        newPassword
    });

export const getCurrentUser = () =>
    api.get("/users/me");

export const getUserProfile = (username) =>
    api.get(`/users/${username}`);

export const togglePrivacy = () =>
    api.post("/users/me/privacy");

export const deleteAccount = () =>
    api.delete("/users/me");
