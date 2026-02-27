import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { API_BASE_URL } from '../api/config';
import { viewStory, voteStory } from '../api/storyService';
import StoryViewList from './StoryViewList';

export default function StoryViewer({ stories, onClose, currentUser }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const [paused, setPaused] = useState(false);

    // Local view count state to allow updates without full reload
    const currentStory = stories[currentIndex];
    const [realtimeViewCount, setRealtimeViewCount] = useState(currentStory.viewCount || 0);

    // Poll state
    const [votedOptionId, setVotedOptionId] = useState(currentStory.poll?.userVotedOptionId || null);
    const [pollOptions, setPollOptions] = useState(currentStory.poll?.options || []);

    // Reset local state when story changes
    useEffect(() => {
        setRealtimeViewCount(currentStory.viewCount || 0);
        setVotedOptionId(currentStory.poll?.userVotedOptionId || null);
        setPollOptions(currentStory.poll?.options || []);
    }, [currentIndex, currentStory]);

    const isOwner = currentUser === currentStory.username;

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

    const handleVote = async (optionId) => {
        if (votedOptionId) return; // Already voted
        setPaused(true);
        try {
            await voteStory(currentStory.id, optionId);
            setVotedOptionId(optionId);

            // Update local counts
            setPollOptions(prev => prev.map(opt => {
                if (opt.id === optionId) {
                    return { ...opt, voteCount: opt.voteCount + 1 };
                }
                return opt;
            }));
        } catch (err) {
            console.error("Failed to vote", err);
        } finally {
            setPaused(false);
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
                            src={currentStory.userProfileImage || `https://ui-avatars.com/api/?name=${currentStory.username}`}
                            alt={currentStory.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-white font-semibold text-sm shadow-black drop-shadow-md">
                        {currentStory.username}
                    </span>
                    <span className="text-gray-300 text-xs shadow-black drop-shadow-md">
                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Image */}
                <div
                    className="flex-1 flex items-center justify-center bg-black relative"
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

                    {/* Poll Overlay */}
                    {currentStory.poll && (
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-xs bg-white rounded-xl p-4 shadow-2xl z-20"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-center font-bold text-lg mb-4 text-gray-900">{currentStory.poll.question}</h3>
                            <div className="space-y-2">
                                {pollOptions.map(opt => {
                                    const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.voteCount, 0);
                                    const percent = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                                    const isVoted = votedOptionId === opt.id;

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleVote(opt.id)}
                                            disabled={!!votedOptionId}
                                            className={`relative w-full p-3 rounded-lg overflow-hidden border-2 transition-all ${votedOptionId
                                                ? (isVoted ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50")
                                                : "border-gray-200 hover:bg-gray-50 bg-white"
                                                }`}
                                        >
                                            {/* Progress Bar Background */}
                                            {votedOptionId && (
                                                <div
                                                    className={`absolute top-0 left-0 bottom-0 transition-all duration-500 ${isVoted ? "bg-blue-100" : "bg-gray-200"}`}
                                                    style={{ width: `${percent}%`, zIndex: 0 }}
                                                />
                                            )}

                                            <div className="relative z-10 flex justify-between items-center w-full">
                                                <span className={`font-medium ${isVoted ? "text-blue-700" : "text-gray-800"}`}>
                                                    {opt.text}
                                                </span>
                                                {votedOptionId && (
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {percent}%
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
