import { useEffect, useRef, useState } from "react";
import { getFeedPage, deletePost as deletePostAPI, editPost as editPostAPI } from "../api/postService";
import { toggleLike } from "../api/likeService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import LikeButton from "../components/LikeButton";
import CommentList from "../components/CommentList";
import CreatePost from "../components/CreatePost";
import { Link } from "react-router-dom";

export default function Feed() {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const observer = useRef();

    // Get current user
    const getCurrentUser = () => {
        const token = localStorage.getItem("token");
        if (!token) return "";
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.sub;
        } catch (e) {
            return "";
        }
    };

    const currentUser = getCurrentUser();

    // Helper to update a specific post in the list
    const updatePost = (postId, updater) => {
        setPosts(prev =>
            prev.map(p => p.id === postId ? updater(p) : p)
        );
    };



    // Initial load
    useEffect(() => {
        const init = async () => {
            if (loading || !hasMore) return;
            setLoading(true);
            const res = await getFeedPage(0);
            setPosts(res.data.content);
            setHasMore(!res.data.last);
            setPage(1);
            setLoading(false);
        };
        init();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Intersection Observer
    const lastPostRef = (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const fetchNext = async () => {
                    setLoading(true);
                    const res = await getFeedPage(page);
                    setPosts(prev => [...prev, ...res.data.content]);
                    setHasMore(!res.data.last);
                    setPage(prev => prev + 1);
                    setLoading(false);
                };
                fetchNext();
            }
        });

        if (node) observer.current.observe(node);
    };

    const refreshFeed = () => {
        setPage(0);
        setHasMore(true);
        const reset = async () => {
            setLoading(true);
            const res = await getFeedPage(0);
            setPosts(res.data.content);
            setHasMore(!res.data.last);
            setPage(1);
            setLoading(false);
        };
        reset();
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await deletePostAPI(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post");
        }
    };

    const startEdit = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const cancelEdit = () => {
        setEditingPostId(null);
        setEditContent("");
    };

    const saveEdit = async (postId) => {
        try {
            const response = await editPostAPI(postId, editContent);
            updatePost(postId, () => response.data);
            setEditingPostId(null);
            setEditContent("");
        } catch (error) {
            console.error("Failed to edit post", error);
            alert("Failed to edit post");
        }
    };

    return (
        <Layout>
            <Navbar />

            <div className="mt-4">
                <CreatePost onPost={refreshFeed} />

                {posts.map((p, i) => {
                    const isLast = i === posts.length - 1;
                    const isEditing = editingPostId === p.id;
                    const isMyPost = p.authorUsername === currentUser;

                    return (
                        <div
                            ref={isLast ? lastPostRef : null}
                            key={p.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 transition-colors duration-200"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                    <Link to={`/profile/${p.authorUsername}`} className="hover:underline">
                                        {p.authorUsername}
                                    </Link>
                                </div>

                                {/* Three-dot menu for own posts */}
                                {isMyPost && (
                                    <div className="relative group">
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                                            ⋮
                                        </button>
                                        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-700 rounded shadow-lg border dark:border-gray-600 hidden group-hover:block z-10">
                                            <button
                                                onClick={() => startEdit(p)}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Edit mode */}
                            {isEditing ? (
                                <div className="mb-3">
                                    <textarea
                                        className="w-full border rounded p-2 text-sm resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        rows="3"
                                        value={editContent}
                                        onChange={e => setEditContent(e.target.value)}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => saveEdit(p.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1 rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-800 dark:text-gray-300 mb-3">{p.content}</p>
                            )}

                            {/* Multiple Images Display */}
                            {p.images && p.images.length > 0 && (
                                <div className={`grid gap-2 mt-2 mb-3 ${p.images.length === 1 ? 'grid-cols-1' :
                                    p.images.length === 2 ? 'grid-cols-2' :
                                        'grid-cols-2'
                                    }`}>
                                    {p.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={`http://localhost:8081${img}`}
                                            alt={`post image ${idx + 1}`}
                                            className={`rounded-lg object-cover border border-gray-100 dark:border-gray-700 ${p.images.length === 1 ? 'max-h-96 w-full' : 'h-48 w-full'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <LikeButton
                                post={p}
                                onToggle={async () => {
                                    // optimistic update
                                    updatePost(p.id, post => ({
                                        ...post,
                                        likedByMe: !post.likedByMe,
                                        likeCount: post.likedByMe
                                            ? post.likeCount - 1
                                            : post.likeCount + 1
                                    }));

                                    try {
                                        await toggleLike(p.id);
                                    } catch {
                                        // rollback on failure
                                        updatePost(p.id, post => ({
                                            ...post,
                                            likedByMe: !post.likedByMe,
                                            likeCount: post.likedByMe
                                                ? post.likeCount - 1
                                                : post.likeCount + 1
                                        }));
                                    }
                                }}
                            />
                            <CommentList postId={p.id} />
                        </div>
                    );
                })}

                {loading && (
                    <div className="text-center text-sm text-gray-500 py-4">
                        Loading...
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <div className="text-center text-sm text-gray-400 py-4">
                        You’ve reached the end
                    </div>
                )}
            </div>
        </Layout>
    );
}
