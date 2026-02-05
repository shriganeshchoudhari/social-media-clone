import api from "./axios";

export const getAllGroups = () =>
    api.get("/groups");

export const getGroup = (id) =>
    api.get(`/groups/${id}`);

export const createGroup = (data) =>
    api.post("/groups", data);

export const joinGroup = (id) =>
    api.post(`/groups/${id}/join`);

export const leaveGroup = (id) =>
    api.post(`/groups/${id}/leave`);

export const getGroupPosts = (id, page = 0, size = 10) =>
    api.get(`/groups/${id}/posts?page=${page}&size=${size}`);

export const searchGroups = (query) =>
    api.get(`/groups/search?q=${query}`);

export const inviteUsers = (groupId, usernames) =>
    api.post(`/groups/invitations/invite`, { groupId, usernames });

export const requestToJoin = (groupId) =>
    api.post(`/groups/invitations/request`, { groupId });

export const approveJoinRequest = (id) =>
    api.post(`/groups/invitations/${id}/approve`);

export const acceptInvitation = (id) =>
    api.post(`/groups/invitations/${id}/accept`);

export const rejectInvitation = (id) =>
    api.post(`/groups/invitations/${id}/reject`);

export const getMyInvitations = () =>
    api.get("/groups/invitations/my");
