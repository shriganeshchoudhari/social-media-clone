import api from "./axios";
import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/stories`;

// Get stories for current user's feed
export const getFeedStories = () => {
    return api.get(API_URL);
};

// Get stories for a specific user
export const getUserStories = (userId) => {
    return api.get(`${API_URL}/users/${userId}`);
};

// Upload a new story
export const createStory = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post(API_URL, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Mark story as viewed
export const viewStory = (storyId) => {
    return api.post(`${API_URL}/${storyId}/view`);
};

// Get viewers (owner only)
export const getStoryViewers = (storyId) => {
    return api.get(`${API_URL}/${storyId}/viewers`);
};
