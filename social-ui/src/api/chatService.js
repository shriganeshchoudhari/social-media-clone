import api from "./axios";

export const sendMessage = (username, content, voiceUrl) =>
    api.post(`/chat/send/${username}`, { content, voiceUrl });

export const getConversation = (username, page = 0, size = 20) =>
    api.get(`/chat/conversation/${username}?page=${page}&size=${size}`);

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

export const createGroup = (name, description, rules, isPublic, participants) =>
    api.post("/chat/group/create", { name, description, rules, isPublic, participants });

export const searchGroups = (query) =>
    api.get(`/chat/group/search?query=${query}`);

export const getMyGroups = () =>
    api.get("/chat/groups");

export const getGroup = (groupId) =>
    api.get(`/chat/group/${groupId}`);

export const sendGroupMessage = (groupId, content, voiceUrl) => {
    const data = { content };
    if (voiceUrl) data.voiceUrl = voiceUrl;
    return api.post(`/chat/group/${groupId}/send`, data);
};

export const sendGroupMessageWithImage = (groupId, content, imageFile) => {
    const formData = new FormData();
    if (content) formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);
    return api.post(`/chat/group/${groupId}/send/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getGroupMessages = (groupId, page = 0, size = 20) =>
    api.get(`/chat/group/${groupId}/messages?page=${page}&size=${size}`);

export const reactToMessage = (messageId, reaction) =>
    api.post(`/chat/message/${messageId}/react`, { reaction });

export const addGroupMember = (groupId, username) =>
    api.post(`/chat/group/${groupId}/add?username=${username}`);

export const removeGroupMember = (groupId, username) =>
    api.post(`/chat/group/${groupId}/remove?username=${username}`);

export const leaveGroup = (groupId) =>
    api.post(`/chat/group/${groupId}/leave`);

export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const updateGroup = (groupId, data) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.rules) formData.append("rules", data.rules);
    if (data.isPublic !== undefined) formData.append("isPublic", data.isPublic);
    if (data.image) formData.append("image", data.image);

    return api.put(`/chat/group/${groupId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};
