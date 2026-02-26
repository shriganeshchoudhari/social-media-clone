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

    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["Yes", "No"]);
    const [showPollInput, setShowPollInput] = useState(false);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = () => {
        getFeedStories()
            .then(res => {
                setStories(res.data);
                if (res.data) groupStoriesByUser(res.data);
            })
            .catch(err => console.error("Failed to load stories", err));
    };

    const groupStoriesByUser = (storyList) => {
        if (!storyList) return;
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setCreationModalOpen(true);
            // Reset poll state
            setShowPollInput(false);
            setPollQuestion("");
            setPollOptions(["Yes", "No"]);
        }
    };

    const handleCreateStory = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const pollData = showPollInput ? {
                question: pollQuestion,
                options: pollOptions.filter(o => o.trim() !== "")
            } : null;

            await createStory(selectedFile, pollData);
            setCreationModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
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
                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                            <Plus size={24} className="text-blue-500" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </label>
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

            {/* Creation Modal */}
            {creationModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">New Story</h3>
                            <button onClick={() => setCreationModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                            <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden flex items-center justify-center">
                                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />}

                                {/* Poll Preview Overlay */}
                                {showPollInput && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 bg-white rounded-lg p-4 shadow-xl">
                                        <p className="font-bold text-center text-lg mb-4">{pollQuestion || "Ask a question..."}</p>
                                        <div className="flex flex-col gap-2">
                                            {pollOptions.map((opt, i) => (
                                                <div key={i} className="bg-gray-100 p-2 rounded text-center text-sm font-medium">
                                                    {opt || `Option ${i + 1}`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showPollInput}
                                        onChange={e => setShowPollInput(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium dark:text-white">Add Poll</span>
                                </label>

                                {showPollInput && (
                                    <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <input
                                            type="text"
                                            placeholder="Ask a question..."
                                            value={pollQuestion}
                                            onChange={e => setPollQuestion(e.target.value)}
                                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <div className="space-y-2">
                                            {pollOptions.map((opt, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...pollOptions];
                                                        newOpts[i] = e.target.value;
                                                        setPollOptions(newOpts);
                                                    }}
                                                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={handleCreateStory}
                                disabled={uploading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? "Sharing..." : "Share to Story"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
