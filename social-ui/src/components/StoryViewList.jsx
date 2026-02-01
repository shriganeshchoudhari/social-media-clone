import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getStoryViewers } from '../api/storyService';
import { API_BASE_URL } from '../api/config';

export default function StoryViewList({ storyId, onClose, onViewersLoaded }) {
    const [viewers, setViewers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStoryViewers(storyId)
            .then(res => {
                setViewers(res.data);
                setLoading(false);
                if (onViewersLoaded) {
                    onViewersLoaded(res.data.length);
                }
            })
            .catch(err => {
                console.error("Failed to load viewers", err);
                setLoading(false);
            });
    }, [storyId, onViewersLoaded]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm max-h-[60vh] rounded-xl flex flex-col shadow-2xl relative overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Viewers</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-custom">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : viewers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No views yet
                        </div>
                    ) : (
                        viewers.map(viewer => (
                            <div key={viewer.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <img
                                    src={getImageUrl(viewer.profileImageUrl) || `https://ui-avatars.com/api/?name=${viewer.username}&background=random`}
                                    alt={viewer.username}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {viewer.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
