import { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/axios";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { getCurrentUser } from "../api/userService";
import { deletePost as deletePostAPI } from "../api/postService";

export default function PostList({ endpoint, queryKey, canCreate = false, createPlaceholder, extraCreateData = {}, getPostMenuActions }) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const observer = useRef();

    useEffect(() => {
        loadUser();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        // Reset when endpoint/queryKey changes
        setPage(0);
        setPosts([]);
        setHasMore(true);
        loadPosts(0, true);
        // eslint-disable-next-line
    }, [endpoint, queryKey]);

    const loadUser = async () => {
        try {
            const userRes = await getCurrentUser();
            setCurrentUser(userRes.data.username);
        } catch (e) {
            console.error("Failed to load user");
        }
    };

    const loadPosts = async (pageNum, isReset = false) => {
        if (!isReset && (loading || !hasMore)) return;
        setLoading(true);
        try {
            // Check if endpoint already has query params
            const separator = endpoint.includes('?') ? '&' : '?';
            const url = `${endpoint}${separator}page=${pageNum}&size=10`;
            const res = await api.get(url);

            if (isReset) {
                setPosts(res.data.content);
            } else {
                setPosts(prev => [...prev, ...res.data.content]);
            }

            setHasMore(!res.data.last);
            if (isReset) setPage(1);
            else setPage(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const lastPostRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadPosts(page);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, page]);

    const handlePostCreated = () => {
        loadPosts(0, true);
    };

    const updatePost = (postId, updater) => {
        setPosts(prev => prev.map(p => p.id === postId ? updater(p) : p));
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePostAPI(postId);
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    const PostSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 space-y-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    );

    return (
        <div className="space-y-4">
            {canCreate && (
                <CreatePost
                    onPost={handlePostCreated}
                    placeholder={createPlaceholder}
                    extraData={extraCreateData}
                />
            )}

            {posts.map((p, i) => {
                const isLast = i === posts.length - 1;
                return (
                    <div ref={isLast ? lastPostRef : null} key={p.id}>
                        <PostCard
                            post={p}
                            currentUser={currentUser}
                            onDelete={handleDelete}
                            onUpdate={updatePost}
                            menuActions={getPostMenuActions ? getPostMenuActions(p) : []}
                        />
                    </div>
                );
            })}

            {loading && (
                <div className="space-y-4 mt-4">
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">All caught up! 🎉</div>
            )}
            {!loading && posts.length === 0 && (
                <div className="text-center py-10 text-gray-500">No posts yet.</div>
            )}
        </div>
    );
}
