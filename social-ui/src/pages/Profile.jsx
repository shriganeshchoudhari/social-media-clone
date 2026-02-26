import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfile, toggleFollow, toggleBlock, getFollowers, getFollowing } from "../api/profileService";
import { useCall } from "../context/CallContext";
import { getPostsByUser } from "../api/postService";
import { API_BASE_URL } from "../api/config";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import VerificationBadge from "../components/VerificationBadge";

export default function Profile() {
    const navigate = useNavigate();
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const postsRef = useRef(null);
    const [error, setError] = useState(null);
    const { startCall } = useCall();

    const scrollToPosts = () => {
        postsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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

    // User List Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [userList, setUserList] = useState([]);


    const [activeTab, setActiveTab] = useState("posts");
    const [savedPosts, setSavedPosts] = useState([]);

    const load = useCallback(() => {
        getProfile(username).then(res => {
            setProfile(res.data);
            const isMe = currentUser === res.data.username;

            if (!res.data.isPrivate || res.data.following || isMe) {
                // Load User Posts
                getPostsByUser(username).then(pRes => {
                    setPosts(pRes.data);
                }).catch(err => console.error("Failed to load posts", err));

                // Load Saved Posts if it's my profile
                if (isMe) {
                    import("../api/postService").then(({ getSavedPosts }) => {
                        getSavedPosts().then(sRes => {
                            setSavedPosts(sRes.data.content);
                        }).catch(err => console.error("Failed to load saved posts", err));
                    });
                }
            } else {
                setPosts([]);
            }
        }).catch(err => {
            console.error(err);
            setError(err.response?.status === 404 ? "User not found" : "Failed to load profile");
        });
    }, [username, currentUser]);

    useEffect(() => {
        load();
        setActiveTab("posts"); // Reset tab on profile change
    }, [load]);

    if (error === "User not found") return (
        <Layout>
            <Navbar />
            <div className="text-center py-20">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">User not found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">The user @{username} does not exist.</p>
                <button
                    onClick={() => navigate("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go Home
                </button>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <Navbar />
            <div className="text-center mt-10 text-red-500">{error}</div>
        </Layout>
    );

    if (!profile) return (
        <Layout>
            <Navbar />
            <div className="text-center mt-10 text-gray-500">Loading...</div>
        </Layout>
    );

    const isMe = currentUser === profile.username;

    const openFollowers = async () => {
        try {
            const res = await getFollowers(profile.username);
            setUserList(res.data);
            setModalTitle("Followers");
            setShowUserModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const openFollowing = async () => {
        try {
            const res = await getFollowing(profile.username);
            setUserList(res.data);
            setModalTitle("Following");
            setShowUserModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Layout>
            <Navbar />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 transition-colors duration-200">
                {/* Banner */}
                <div className="h-32 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden relative">
                    {profile.bannerImage ? (
                        <img
                            src={`${API_BASE_URL}${profile.bannerImage}`}
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-75"></div>
                    )}
                </div>

                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
                            {/* Avatar */}
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-md shrink-0 z-10">
                                {profile.profileImageUrl ? (
                                    <img
                                        src={`${API_BASE_URL}${profile.profileImageUrl}`}
                                        alt={profile.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold bg-white dark:bg-gray-800">
                                        {profile.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="text-center md:text-left mt-2 md:mt-0 md:mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                                    {profile.username}
                                    {profile.verified && <VerificationBadge className="w-6 h-6" />}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm">
                                    {profile.bio || "No bio available"}
                                </p>
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline block mt-1">
                                        🔗 {profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === "posts"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                        onClick={() => setActiveTab("posts")}
                    >
                        My Posts
                    </button>
                    <button
                        className={`py-3 px-6 font-medium text-sm transition-colors border-b-2 ${activeTab === "saved"
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved
                    </button>
                </div>
            </div>



            {/* Privacy / Posts Section */}
            {/* Privacy / Posts / Saved Section */}
            {(profile.isPrivate && !profile.following && !isMe) ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        🔒 This account is private
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Follow to see their posts.</p>
                </div>
            ) : (
                <div ref={postsRef} className="grid grid-cols-3 gap-2 mt-4">
                    {(activeTab === 'posts' ? posts : savedPosts).map(post => (
                        <div key={post.id} className="relative aspect-square group cursor-pointer"
                            onClick={() => setSelected(post)}>
                            {post.images && post.images.length > 0 ? (
                                <img src={`${API_BASE_URL}${post.images[0]}`} alt="Post" className="w-full h-full object-cover rounded shadow-sm hover:opacity-90 transition-opacity" />
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
                    {(activeTab === 'posts' ? posts : savedPosts).length === 0 && (
                        <div className="col-span-3 text-center py-10 text-gray-500 dark:text-gray-400">
                            {activeTab === 'posts' ? "No posts yet." : "No saved posts."}
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
                                {selected.authorVerified && <VerificationBadge />}
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
                                        src={`${API_BASE_URL}${img}`}
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
                                        fetch(`${API_BASE_URL}/api/moderation/posts/${selected.id}/report?reason=Spam`, {
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

            {/* User List Modal */}
            {showUserModal && (
                <div
                    className="fixed inset-0 bg-black/50 z-[70] flex justify-center items-center backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setShowUserModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">{modalTitle}</h3>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                ✕
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-2">
                            {userList.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No users found.</p>
                            ) : (
                                userList.map((u, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                        onClick={() => {
                                            navigate(`/profile/${u}`);
                                            setShowUserModal(false);
                                        }}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold shrink-0">
                                            {u[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{u}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
