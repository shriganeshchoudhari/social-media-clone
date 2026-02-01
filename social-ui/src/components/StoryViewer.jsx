import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { API_BASE_URL } from '../api/config';
import { viewStory } from '../api/storyService';
import StoryViewList from './StoryViewList';

export default function StoryViewer({ stories, onClose, currentUser }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const [paused, setPaused] = useState(false);

    // Local view count state to allow updates without full reload
    const currentStory = stories[currentIndex];
    const [realtimeViewCount, setRealtimeViewCount] = useState(currentStory.viewCount || 0);

    // Reset local count when story changes
    useEffect(() => {
        setRealtimeViewCount(currentStory.viewCount || 0);
    }, [currentIndex, currentStory]);

    const isOwner = currentUser === currentStory.user.username;

    // Image helper
    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http")) return url;
        return `${API_BASE_URL}${url}`;
    };

    // Mark as viewed
    useEffect(() => {
        if (currentStory && !isOwner) {
            viewStory(currentStory.id).catch(err => console.error("Failed to mark viewed", err));
        }
    }, [currentIndex, currentStory, isOwner]);

    // Auto-advance
    useEffect(() => {
        if (paused || showViewers) return;

        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100) {
                    return 100;
                }
                return oldProgress + 2;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [currentIndex, paused, showViewers]);

    // Handle progress completion
    useEffect(() => {
        if (progress >= 100) {
            handleNext();
        }
    }, [progress]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
                <X size={32} />
            </button>

            <div className="relative w-full max-w-md h-[80vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col">

                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
                    {stories.map((story, idx) => (
                        <div key={story.id} className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx === currentIndex ? '' : (idx < currentIndex ? 'w-full' : 'w-0')}`}
                                style={{ width: idx === currentIndex ? `${progress}%` : undefined }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* User Info */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                        <img
                            src={currentStory.user.profileImageUrl || `https://ui-avatars.com/api/?name=${currentStory.user.username}`}
                            alt={currentStory.user.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-white font-semibold text-sm shadow-black drop-shadow-md">
                        {currentStory.user.username}
                    </span>
                    <span className="text-gray-300 text-xs shadow-black drop-shadow-md">
                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Image */}
                <div
                    className="flex-1 flex items-center justify-center bg-black"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => setPaused(false)}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => setPaused(false)}
                >
                    <img
                        src={getImageUrl(currentStory.imageUrl)}
                        alt="Story"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                {/* View Count (Owner Only) */}
                {isOwner && (
                    <div className="absolute bottom-4 left-4 z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowViewers(true);
                                setPaused(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition"
                        >
                            <Eye size={16} />
                            <span className="text-sm font-medium">{realtimeViewCount}</span>
                        </button>
                    </div>
                )}

                {/* Controls (Overlay) */}
                {!showViewers && (
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="h-full w-1/3 opacity-0 hover:opacity-10 disabled:hover:opacity-0 transition-opacity flex items-center justify-start pl-4 pointer-events-auto"
                        >
                            {currentIndex > 0 && <ChevronLeft className="text-white bg-black/50 rounded-full" size={32} />}
                        </button>
                        <button
                            onClick={handleNext}
                            className="h-full w-1/3 opacity-0 hover:opacity-10 transition-opacity flex items-center justify-end pr-4 pointer-events-auto"
                        >
                            <ChevronRight className="text-white bg-black/50 rounded-full" size={32} />
                        </button>
                    </div>
                )}

                {/* Viewers List Modal */}
                {showViewers && (
                    <StoryViewList
                        storyId={currentStory.id}
                        onClose={() => {
                            setShowViewers(false);
                            setPaused(false);
                        }}
                        onViewersLoaded={(count) => setRealtimeViewCount(count)}
                    />
                )}
            </div>
        </div>
    );
}
