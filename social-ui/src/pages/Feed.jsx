import { useEffect, useRef, useState } from "react";
import { getFeedPage } from "../api/postService";
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

    const observer = useRef();

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

    return (
        <Layout>
            <Navbar />

            <div className="mt-4">
                <CreatePost onPost={refreshFeed} />

                {posts.map((p, i) => {
                    const isLast = i === posts.length - 1;

                    return (
                        <div
                            ref={isLast ? lastPostRef : null}
                            key={p.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 transition-colors duration-200"
                        >
                            <div className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">
                                <Link to={`/profile/${p.authorUsername}`} className="hover:underline">
                                    {p.authorUsername}
                                </Link>
                            </div>

                            <p className="text-gray-800 dark:text-gray-300 mb-3">{p.content}</p>

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
