import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchUsers } from "../api/searchService";
import { searchPosts } from "../api/postService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

export default function Search() {
    const [params] = useSearchParams();
    const query = params.get("q");

    const [activeTab, setActiveTab] = useState("users"); // 'users' or 'posts'
    const [userResults, setUserResults] = useState([]);
    const [postResults, setPostResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get current user for PostCard
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

    useEffect(() => {
        if (!query) {
            setUserResults([]);
            setPostResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        if (activeTab === "users") {
            searchUsers(query)
                .then(res => setUserResults(res.data.content))
                .catch(() => setError("Failed to search users."))
                .finally(() => setLoading(false));
        } else {
            searchPosts(query)
                .then(res => setPostResults(res.data.content))
                .catch(() => setError("Failed to search posts."))
                .finally(() => setLoading(false));
        }
    }, [query, activeTab]);

    // Helper for optimistic update on search page (if needed for likes)
    const updatePostResult = (postId, updater) => {
        setPostResults(prev =>
            prev.map(p => p.id === postId ? updater(p) : p)
        );
    };

    return (
        <Layout>
            <Navbar />
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Results for "{query}"
                </h3>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    <button
                        className={`mr-6 py-2 font-medium ${activeTab === "users" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                        onClick={() => setActiveTab("users")}
                    >
                        People
                    </button>
                    <button
                        className={`py-2 font-medium ${activeTab === "posts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                        onClick={() => setActiveTab("posts")}
                    >
                        Posts
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    <>
                        {activeTab === "users" && userResults.length === 0 && (
                            <p className="text-gray-500">No users found.</p>
                        )}
                        {activeTab === "posts" && postResults.length === 0 && (
                            <p className="text-gray-500">No posts found.</p>
                        )}
                    </>
                )}

                <div className="space-y-4">
                    {/* User Results */}
                    {activeTab === "users" && userResults.map(u => (
                        <div
                            key={u.username}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col transition-colors duration-200"
                        >
                            <Link to={`/profile/${u.username}`} className="text-lg font-bold text-gray-900 dark:text-white hover:underline">
                                {u.username}
                            </Link>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{u.bio || "No bio"}</p>
                        </div>
                    ))}

                    {/* Post Results */}
                    {activeTab === "posts" && postResults.map(p => (
                        <PostCard
                            key={p.id}
                            post={p}
                            currentUser={currentUser}
                            onDelete={() => { }} // No delete in search for now
                            onUpdate={updatePostResult}
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
}
