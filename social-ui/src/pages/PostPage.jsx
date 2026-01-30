import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import LikeButton from "../components/LikeButton";
import CommentList from "../components/CommentList";
import { getPostById } from "../api/postService";
import { toggleLike } from "../api/likeService";

export default function PostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        // setLoading(true); // Initial state is true, and we accept stale data on id change for now
        getPostById(id)
            .then(res => {
                setPost(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load post", err);
                setError("Post not found or unavailable.");
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <Layout>
                <Navbar />
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading post...</p>
                </div>
            </Layout>
        );
    }

    if (error || !post) {
        return (
            <Layout>
                <Navbar />
                <div className="max-w-2xl mx-auto p-4 text-center">
                    <p className="text-red-500 mb-4">{error || "Post not found"}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:underline"
                    >
                        Go Home
                    </button>
                </div>
            </Layout>
        );
    }

    const optimisticLike = async () => {
        // optimistic toggle
        setPost(prev => ({
            ...prev,
            likedByMe: !prev.likedByMe,
            likeCount: prev.likedByMe
                ? prev.likeCount - 1
                : prev.likeCount + 1
        }));

        try {
            await toggleLike(post.id);
        } catch {
            load(); // rollback by reload
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString();
    };

    return (
        <Layout>
            <Navbar />

            <div className="max-w-2xl mx-auto p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
                >
                    &larr; Back
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-4">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                                {post.authorUsername.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div
                                    className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                                    onClick={() => navigate(`/profile/${post.authorUsername}`)}
                                >
                                    {post.authorUsername}
                                </div>
                                <div className="text-xs text-gray-500">{formatTime(post.createdAt)}</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-800 dark:text-gray-200 mb-6 text-lg whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </p>

                    <div className="border-t dark:border-gray-700 pt-4">
                        <LikeButton post={post} onToggle={optimisticLike} showText={true} />
                    </div>
                </div>

                <div className="mt-6">
                    <CommentList postId={post.id} />
                </div>
            </div>
        </Layout>
    );
}
