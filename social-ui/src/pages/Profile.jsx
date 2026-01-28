import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfile, toggleFollow, toggleBlock } from "../api/profileService";
import { getPostsByUser } from "../api/postService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

export default function Profile() {
    const navigate = useNavigate();
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);

    // Get current user on mount (lazy init)
    const [currentUser] = useState(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload.sub;
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
        return "";
    });

    const [selected, setSelected] = useState(null);

    const load = useCallback(() => {
        getProfile(username).then(res => {
            setProfile(res.data);

            const isMe = currentUser === res.data.username;

            if (!res.data.isPrivate || res.data.following || isMe) {
                getPostsByUser(username).then(pRes => {
                    // Backend now returns List<PostResponse> directly
                    setPosts(pRes.data);
                }).catch(err => {
                    console.error("Failed to load posts", err);
                });
            } else {
                setPosts([]);
            }
        });
    }, [username, currentUser]);

    useEffect(() => {
        load();
    }, [load]);

    if (!profile) return (
        <Layout>
            <Navbar />
            <div className="text-center mt-10 text-gray-500">Loading...</div>
        </Layout>
    );

    const isMe = currentUser === profile.username;

    return (
        <Layout>
            <Navbar />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.username}</h2>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                            {profile.bio || "No bio available"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 text-sm mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 text-gray-700 dark:text-gray-300">
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.postCount}</span> posts</div>
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.followersCount}</span> followers</div>
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.followingCount}</span> following</div>
                </div>

                {isMe ? (
                    <button
                        onClick={() => navigate("/settings")}
                        className="px-6 py-2 rounded font-medium transition-colors bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleFollow(profile.username).then(load)}
                            className={`px-6 py-2 rounded font-medium transition-colors ${profile.following
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {profile.following ? "Unfollow" : "Follow"}
                        </button>
                        <button
                            onClick={() => navigate(`/chat/${profile.username}`)}
                            className="px-6 py-2 rounded font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                        >
                            Message
                        </button>
                        <button
                            onClick={() => toggleBlock(profile.username).then(() => window.location.reload())}
                            className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                        >
                            Block
                        </button>
                    </div>
                )}

            </div>

            {/* Privacy / Posts Section */}
            {(profile.isPrivate && !profile.following && !isMe) ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        🔒 This account is private
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Follow to see their posts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {posts.map(post => (
                        <div key={post.id} className="relative aspect-square group cursor-pointer"
                            onClick={() => setSelected(post)}>
                            {post.images && post.images.length > 0 ? (
                                <img src={`http://localhost:8081${post.images[0]}`} alt="Post" className="w-full h-full object-cover rounded shadow-sm hover:opacity-90 transition-opacity" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 p-2 text-xs text-center border-2 border-dashed border-gray-200 dark:border-gray-600">
                                    <span className="line-clamp-3">{post.content}</span>
                                </div>
                            )}
                            {post.images && post.images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <span>+{post.images.length - 1}</span>
                                </div>
                            )}
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="col-span-3 text-center py-10 text-gray-500 dark:text-gray-400">
                            No posts yet.
                        </div>
                    )}
                </div>
            )}

            {/* Media Gallery Modal */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/90 z-[60] flex justify-center items-center backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
                                    {selected.authorUsername[0].toUpperCase()}
                                </div>
                                {selected.authorUsername}
                            </h3>
                            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
                                ✕
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {selected.images && selected.images.length > 0 ? (
                                selected.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={`http://localhost:8081${img}`}
                                        className="w-full rounded-lg shadow-md"
                                        alt={`Post image ${i + 1}`}
                                    />
                                ))
                            ) : null}

                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-lg leading-relaxed">
                                {selected.content}
                            </p>

                            <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 flex gap-4">
                                <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
                                <span>{selected.likeCount} likes</span>
                                <button
                                    onClick={() => {
                                        // Simple report for now
                                        fetch(`http://localhost:8081/api/moderation/posts/${selected.id}/report?reason=Spam`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                        }).then(() => alert('Reported'));
                                    }}
                                    className="text-red-500 hover:text-red-600 ml-auto"
                                >
                                    Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
