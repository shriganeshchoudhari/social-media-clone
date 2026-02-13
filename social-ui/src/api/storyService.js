import axios from "axios";
import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/api/stories`;

// Get stories for current user's feed
export const getFeedStories = () => {
    const token = localStorage.getItem('token');
    return axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Get stories for a specific user
export const getUserStories = (userId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Upload a new story
export const createStory = (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    return axios.post(API_URL, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Mark story as viewed
export const viewStory = (storyId) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/${storyId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Get viewers (owner only)
export const getStoryViewers = (storyId) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/${storyId}/viewers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
