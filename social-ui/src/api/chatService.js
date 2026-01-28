import api from "./axios";

export const sendMessage = (username, content) =>
    api.post(`/chat/send/${username}`, { content });

export const getConversation = (username) =>
    api.get(`/chat/conversation/${username}`);

export const getInbox = () =>
    api.get("/chat/inbox");

export const sendMessageWithImage = (username, content, imageFile) => {
    const formData = new FormData();
    if (content) formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);
    return api.post(`/chat/send/${username}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};
