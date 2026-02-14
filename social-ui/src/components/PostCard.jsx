import { useState } from "react";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";
import CommentList from "./CommentList";
import RichText from "./RichText";
import MediaGallery from "./MediaGallery";
import { editPost, toggleSavePost } from "../api/postService";

import CreatePost from "./CreatePost";
import VerificationBadge from "./VerificationBadge";
import { API_BASE_URL } from "../api/config";

const SharedPostPreview = ({ post }) => {
    if (!post) return null;
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mt-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
                <img
                    src={post.authorProfileImage
                        ? (post.authorProfileImage.startsWith("http") ? post.authorProfileImage : `${API_BASE_URL}${post.authorProfileImage}`)
                        : `https://ui-avatars.com/api/?name=${post.author}&background=random`}
                    alt={post.authorUsername}
                    className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{post.authorUsername}</span>
                <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                <RichText text={post.content} disableLinks={true} />
            </div>
            {post.images && post.images.length > 0 && (
                <div className="h-40 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img src={post.images[0]} alt="Shared content" className="w-full h-full object-cover" />
                </div>
            )}
        </div>
    );
};

export default function PostCard({ post, currentUser, onDelete, onUpdate, menuActions }) {
    const isMyPost = post.authorUsername === currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showMenu, setShowMenu] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleSaveEdit = async () => {
        try {
            const response = await editPost(post.id, editContent);
            onUpdate(post.id, () => response.data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to edit post", error);
            alert("Failed to edit post");
        }
    };

    const handleToggleSave = async () => {
        try {
            // Optimistic update
            onUpdate(post.id, (p) => ({ ...p, isSaved: !p.isSaved }));
            await toggleSavePost(post.id);
        } catch (error) {
            // Rollback
            onUpdate(post.id, (p) => ({ ...p, isSaved: !p.isSaved }));
            console.error("Failed to toggle save", error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 transition-colors duration-200">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${post.authorUsername}`}>
                        <img
                            src={post.authorProfileImage
                                ? (post.authorProfileImage.startsWith("http") ? post.authorProfileImage : `${API_BASE_URL}${post.authorProfileImage}`)
                                : `https://ui-avatars.com/api/?name=${post.author}&background=random`}
                            alt={post.authorUsername}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                    </Link>
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        <Link to={`/profile/${post.authorUsername}`} className="hover:underline">
                            {post.authorUsername}
                            {post.authorVerified && <VerificationBadge />}
                        </Link>
                        <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Three-dot menu */}
                {/* Three-dot menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="More options"
                        aria-haspopup="true"
                        aria-expanded={showMenu}
                    >
                        ⋮
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setShowMenu(false)}
                            ></div>
                            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-700 rounded shadow-lg border dark:border-gray-600 z-40 min-w-[120px] py-1" role="menu">
                                {isMyPost ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditContent(post.content);
                                                setShowMenu(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            role="menuitem"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                onDelete(post.id);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            role="menuitem"
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            fetch(`${API_BASE_URL}/api/moderation/posts/${post.id}/report?reason=Spam`, {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                            }).then(() => alert('Reported'));
                                            setShowMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                        role="menuitem"
                                    >
                                        Report
                                    </button>
                                )}
                                {menuActions && menuActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            action.onClick();
                                            setShowMenu(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${action.className || 'text-gray-700 dark:text-gray-200'}`}
                                        role="menuitem"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="mb-3">
                    <textarea
                        className="w-full border rounded p-2 text-sm resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows="3"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        aria-label="Edit post content"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleSaveEdit}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(post.content);
                            }}
                            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mb-3">
                    <RichText text={post.content} />
                </div>
            )}

            {post.linkUrl && (
                <a
                    href={post.linkUrl.startsWith("http") ? post.linkUrl : `https://${post.linkUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 mb-3 border rounded-lg overflow-hidden hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-750 transition-colors group/link"
                    aria-label={`Link preview for ${post.linkTitle || post.linkUrl}`}
                >
                    {post.linkImage && (
                        <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                                src={post.linkImage}
                                alt=""
                                className="w-full h-full object-cover group-hover/link:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.style.display = 'none' }}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                            {post.linkTitle || post.linkUrl}
                        </h4>
                        {post.linkDescription && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-1">
                                {post.linkDescription}
                            </p>
                        )}
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                            {new URL(post.linkUrl).hostname}
                        </span>
                    </div>
                </a>
            )}

            {/* Poll Rendering */}
            {post.poll && (
                <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/30 dark:border-gray-700" role="group" aria-label={`Poll: ${post.poll.question}`}>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 ml-1">{post.poll.question}</h4>
                    <div className="space-y-2">
                        {post.poll.options.map((option) => {
                            const hasVoted = post.poll.userVotedOptionId !== null;
                            const isExpired = new Date(post.poll.expiryDateTime) < new Date();
                            const canVote = !hasVoted && !isExpired && !post.poll.isClosed;
                            const isSelected = post.poll.userVotedOptionId === option.id;

                            const handleVote = async () => {
                                if (!canVote) return;
                                try {
                                    // Optimistic update
                                    onUpdate(post.id, (prevPost) => {
                                        const newTotalVotes = prevPost.poll.totalVotes + 1;
                                        const newOptions = prevPost.poll.options.map(o => {
                                            if (o.id === option.id) {
                                                return { ...o, voteCount: o.voteCount + 1, percentage: ((o.voteCount + 1) / newTotalVotes) * 100 };
                                            } else {
                                                return { ...o, percentage: (o.voteCount / newTotalVotes) * 100 };
                                            }
                                        });
                                        return {
                                            ...prevPost,
                                            poll: {
                                                ...prevPost.poll,
                                                options: newOptions,
                                                totalVotes: newTotalVotes,
                                                userVotedOptionId: option.id
                                            }
                                        };
                                    });

                                    const { votePoll } = await import("../api/postService");
                                    await votePoll(post.poll.id, option.id);
                                } catch (error) {
                                    console.error("Vote failed", error);
                                    alert("Vote failed");
                                    // Revert would be complex, maybe just refresh parent?
                                }
                            };

                            return (
                                <div key={option.id} className="relative">
                                    {/* Background Bar for results */}
                                    {(hasVoted || isExpired || post.poll.isClosed) && (
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded transition-all duration-500 ${isSelected ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-200 dark:bg-gray-600'}`}
                                            style={{ width: `${option.percentage}%` }}
                                            aria-hidden="true"
                                        />
                                    )}

                                    <button
                                        onClick={handleVote}
                                        disabled={!canVote}
                                        aria-label={`${option.text}, ${Math.round(option.percentage)} percent, ${isSelected ? 'selected' : ''}`}
                                        aria-pressed={isSelected}
                                        className={`relative w-full text-left px-3 py-2 rounded border transition-colors flex justify-between items-center z-10 
                                            ${canVote
                                                ? 'hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                                : 'border-transparent cursor-default'
                                            }`}
                                    >
                                        <span className={`font-medium text-sm ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {option.text}
                                            {isSelected && <span className="ml-2 text-xs" aria-hidden="true">✓</span>}
                                        </span>
                                        {(hasVoted || isExpired || post.poll.isClosed) && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium" aria-hidden="true">
                                                {Math.round(option.percentage)}%
                                            </span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
                        <span>{post.poll.totalVotes} votes</span>
                        <span>
                            {new Date(post.poll.expiryDateTime) < new Date() ? "Closed" : `Ends ${new Date(post.poll.expiryDateTime).toLocaleDateString()}`}
                        </span>
                    </div>
                </div>
            )}

            {post.sharedPost && (
                <Link to={`/post/${post.sharedPost.id}`} className="block" aria-label={`View shared post by ${post.sharedPost.authorUsername}`}>
                    <SharedPostPreview post={post.sharedPost} />
                </Link>
            )}

            <MediaGallery images={post.images} />

            <div className="flex justify-between items-center mt-2">
                <LikeButton
                    post={post}
                    onToggle={async () => {
                        try {
                            const { toggleLike } = await import("../api/likeService");
                            // Optimistic update logic
                            onUpdate(post.id, (p) => ({
                                ...p,
                                likedByMe: !p.likedByMe,
                                likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1
                            }));
                            await toggleLike(post.id);
                        } catch {
                            // rollback
                            onUpdate(post.id, (p) => ({
                                ...p,
                                likedByMe: !p.likedByMe,
                                likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1
                            }));
                        }
                    }}
                />

                <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors group"
                    aria-label="Share post"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                    </svg>
                    <span className="text-sm">Share</span>
                </button>

                <button
                    onClick={handleToggleSave}
                    className="text-gray-400 hover:text-blue-500"
                    title={post.isSaved ? "Unsave" : "Save"}
                    aria-label={post.isSaved ? "Unsave post" : "Save post"}
                >
                    {post.isSaved ? (
                        // Filled bookmark
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500" aria-hidden="true">
                            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        // Outline bookmark
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 11.186 0Z" />
                        </svg>
                    )}
                </button>
            </div>

            <CommentList postId={post.id} />

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-4 shadow-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <h3 className="font-bold text-lg dark:text-white">Share Post</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <SharedPostPreview post={post} />
                        </div>
                        <CreatePost
                            onPost={() => {
                                setShowShareModal(false);
                                if (onUpdate) onUpdate(post.id, p => ({ ...p, shareCount: (p.shareCount || 0) + 1 })); // Optional optimistic update
                                alert("Post shared successfully!");
                            }}
                            extraData={{ sharedPostId: post.id }}
                            placeholder="Add a comment..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
