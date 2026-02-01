import { useEffect, useRef, useState } from "react";
import { getFeedPage, deletePost as deletePostAPI } from "../api/postService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import StoryBar from "../components/StoryBar";
import { getCurrentUser } from "../api/userService";

export default function Feed() {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

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
            // Load User
            try {
                const userRes = await getCurrentUser();
                setCurrentUser(userRes.data.username);
            } catch (e) {
                console.error("Failed to load user");
            }

            // Load Posts
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

    return (
        <Layout>
            <Navbar />

            <div className="max-w-2xl mx-auto py-8 px-4">

                {/* Stories */}
                <StoryBar currentUser={currentUser} />

                {/* Create Post */}
                <CreatePost onPostCreated={refreshFeed} />

                {posts.map((p, i) => {
                    const isLast = i === posts.length - 1;

                    return (
                        <div
                            ref={isLast ? lastPostRef : null}
                            key={p.id}
                        >
                            <PostCard
                                post={p}
                                currentUser={currentUser}
                                onDelete={handleDelete}
                                onUpdate={updatePost}
                            />
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
