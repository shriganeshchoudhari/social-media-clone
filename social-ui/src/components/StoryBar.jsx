import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getFeedStories, createStory } from '../api/storyService';
import StoryViewer from './StoryViewer';

export default function StoryBar({ currentUser }) {
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [groupedStories, setGroupedStories] = useState({});
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = () => {
        getFeedStories()
            .then(res => {
                setStories(res.data);
                groupStoriesByUser(res.data);
            })
            .catch(err => console.error("Failed to load stories", err));
    };

    const groupStoriesByUser = (storyList) => {
        const groups = {};
        storyList.forEach(story => {
            const username = story.user.username;
            if (!groups[username]) {
                groups[username] = {
                    user: story.user,
                    stories: []
                };
            }
            groups[username].stories.push(story);
        });
        setGroupedStories(groups);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await createStory(file);
            loadStories(); // Refresh
        } catch (err) {
            console.error("Failed to upload story", err);
            alert("Failed to upload story");
        } finally {
            setUploading(false);
        }
    };

    const openViewer = (username) => {
        setSelectedUserStories(groupedStories[username].stories);
        setViewerOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* Create Story Button */}
                <div className="flex flex-col items-center min-w-[72px] cursor-pointer group">
                    <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700 group-hover:bg-gray-100 transition-colors">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        ) : (
                            <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                <Plus size={24} className="text-blue-500" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        )}
                    </div>
                    <span className="text-xs mt-2 text-gray-500 font-medium">Add Story</span>
                </div>

                {/* Story Items */}
                {Object.values(groupedStories).map((group, index) => (
                    <div
                        key={group.user.id}
                        className="flex flex-col items-center min-w-[72px] cursor-pointer"
                        onClick={() => openViewer(group.user.username)}
                    >
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600 hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-200">
                                <img
                                    src={group.user.profileImageUrl || `https://ui-avatars.com/api/?name=${group.user.username}&background=random`}
                                    alt={group.user.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-xs mt-2 text-gray-700 dark:text-gray-300 font-medium truncate w-16 text-center">
                            {group.user.username === currentUser ? 'Your Story' : group.user.username}
                        </span>
                    </div>
                ))}
            </div>

            {/* Viewer Modal */}
            {viewerOpen && selectedUserStories && (
                <StoryViewer
                    stories={selectedUserStories}
                    onClose={() => setViewerOpen(false)}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}
