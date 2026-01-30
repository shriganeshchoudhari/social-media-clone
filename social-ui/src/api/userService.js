import api from "./axios";

export const updateProfile = (profile, avatarFile) => {
    const form = new FormData();

    if (profile.bio !== null && profile.bio !== undefined) {
        form.append("bio", profile.bio);
    }

    if (profile.interests && profile.interests.length > 0) {
        profile.interests.forEach(interest => {
            form.append("interests", interest);
        });
    }

    if (avatarFile) {
        form.append("avatar", avatarFile);
    }

    return api.put("/users/me", form, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const changePassword = (passwordData) =>
    api.post("/users/me/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
    });

export const getCurrentUser = () =>
    api.get("/users/me");

export const getMyInterests = () =>
    api.get("/users/me/interests");

export const getUserProfile = (username) =>
    api.get(`/users/${username}`);

export const togglePrivacy = () =>
    api.post("/users/me/privacy").then(res => res.data);

export const deleteAccount = () =>
    api.delete("/users/me");
