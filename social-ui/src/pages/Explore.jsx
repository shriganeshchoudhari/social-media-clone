import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import LikeButton from "../components/LikeButton";
import CommentList from "../components/CommentList";
import { Link } from "react-router-dom";

export default function Explore() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef();

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const res = await api.get("/posts/explore?page=0&size=10");
            setPosts(res.data.content);
            setHasMore(!res.data.last);
            setPage(1);
            setLoading(false);
        };
        init();
    }, []);

    // Intersection Observer for infinite scroll
    const lastPostRef = (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const fetchNext = async () => {
                    setLoading(true);
                    const res = await api.get(`/posts/explore?page=${page}&size=10`);
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

    return (
        <Layout>
            <Navbar />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">✨ Recommended for you</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Posts based on your interests</p>
            </div>

            {posts.map((p, i) => {
                const isLast = i === posts.length - 1;

                return (
                    <div
                        ref={isLast ? lastPostRef : null}
                        key={p.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 transition-colors duration-200"
                    >
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                            <Link to={`/profile/${p.authorUsername}`} className="hover:underline">
                                {p.authorUsername}
                            </Link>
                        </div>

                        <p className="text-gray-800 dark:text-gray-300 mb-3">{p.content}</p>

                        {/* Images */}
                        {p.images && p.images.length > 0 && (
                            <div className={`grid gap-2 mt-2 mb-3 ${p.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {p.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={`http://localhost:8081${img}`}
                                        alt={`post image ${idx + 1}`}
                                        className={`rounded-lg object-cover border border-gray-100 dark:border-gray-700 ${p.images.length === 1 ? 'max-h-96 w-full' : 'h-48 w-full'}`}
                                    />
                                ))}
                            </div>
                        )}

                        <LikeButton post={p} onToggle={async () => {
                            // Optimistic update
                            setPosts(prev => prev.map(post => post.id === p.id ? {
                                ...post,
                                likedByMe: !post.likedByMe,
                                likeCount: post.likedByMe ? post.likeCount - 1 : post.likeCount + 1
                            } : post));

                            try {
                                await api.post(`/likes/toggle/${p.id}`);
                            } catch {
                                // Rollback on failure
                                setPosts(prev => prev.map(post => post.id === p.id ? {
                                    ...post,
                                    likedByMe: !post.likedByMe,
                                    likeCount: post.likedByMe ? post.likeCount - 1 : post.likeCount + 1
                                } : post));
                            }
                        }} />

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
                    You've reached the end of trending posts
                </div>
            )}
        </Layout>
    );
}
