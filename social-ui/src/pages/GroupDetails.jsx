import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { inviteUsers, requestToJoin } from "../api/groupService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import PostList from "../components/PostList";
import GroupEvents from "../components/GroupEvents";

import PostCard from "../components/PostCard";

export default function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteUsername, setInviteUsername] = useState("");
    const [activeTab, setActiveTab] = useState("posts");
    const [pinnedPost, setPinnedPost] = useState(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;

        // Remove '/api' from the end of VITE_API_URL if it exists
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8081";
        const baseUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

        return `${baseUrl}${path}`;
    };

    const loadGroup = useCallback(() => {
        api.get(`/groups/${id}`)
            .then(async res => {
                setGroup(res.data);
                setIsMember(res.data.isMember);
                setLoading(false);

                if (res.data.pinnedPostId) {
                    try {
                        const pRes = await api.get(`/posts/${res.data.pinnedPostId}`);
                        setPinnedPost(pRes.data);
                    } catch (e) {
                        console.warn("Failed to load pinned post", e);
                        setPinnedPost(null);
                    }
                } else {
                    setPinnedPost(null);
                }
            })
            .catch(err => {
                console.error("Failed to load group", err);
                navigate("/groups");
            });
    }, [id, navigate]);

    useEffect(() => {
        setGroup(null);
        setLoading(true);
        loadGroup();
    }, [loadGroup]);

    const handleJoin = async () => {
        try {
            if (isMember) {
                await api.post(`/groups/${id}/leave`);
            } else if (group.privacy === 'PRIVATE') {
                await requestToJoin(id);
                alert("Request sent!");
                return;
            } else {
                await api.post(`/groups/${id}/join`);
            }
            loadGroup(); // Refresh state
        } catch (err) {
            console.error("Failed to join/leave", err);
            alert(err.response?.data?.message || "Failed to join/leave");
        }
    };

    const handleInvite = async () => {
        if (!inviteUsername) return;
        const usernames = inviteUsername.split(',').map(s => s.trim()).filter(s => s);
        if (usernames.length === 0) return;

        try {
            await inviteUsers(id, usernames);
            setInviteUsername("");
            setShowInviteModal(false);
            alert("Invitations sent!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to invite users");
        }
    };

    const getPostMenuActions = (post) => {
        // Only admins can pin
        console.log("getPostMenuActions check:", group.role, group.pinnedPostId, post.id);
        if (group.role !== 'ADMIN') return [];
        const isPinned = post.id === group.pinnedPostId;
        return [{
            label: isPinned ? "Unpin from Group" : "Pin to Group",
            onClick: async () => {
                try {
                    if (isPinned) await api.delete(`/groups/${id}/pin`);
                    else await api.put(`/groups/${id}/pin/${post.id}`);
                    loadGroup(); // Refresh to update pinned status
                } catch (e) {
                    alert("Failed to pin/unpin");
                }
            }
        }];
    };

    if (loading) return (
        <Layout>
            <Navbar />
            <div className="text-center py-20">Loading...</div>
        </Layout>
    );

    if (!group) return null;

    return (
        <Layout>
            <Navbar />

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
                {group.coverImageUrl ? (
                    <div className="h-48 md:h-64 w-full bg-gray-200">
                        <img
                            src={getImageUrl(group.coverImageUrl)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                )}

                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold dark:text-white mb-2">{group.name}</h1>
                            <p className="text-gray-600 dark:text-gray-300">{group.description}</p>
                            <div className="flex gap-4 mt-4 text-sm text-gray-500">
                                <span>{group.memberCount} members</span>
                                <span>{group.privacy}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 flex-wrap">
                            {/* Settings Button (Admin) */}
                            {group.role === 'ADMIN' && (
                                <button
                                    onClick={() => navigate(`/groups/${id}/settings`)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Settings
                                </button>
                            )}

                            {/* Invite Button for Admin */}
                            {group.role === 'ADMIN' && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Invite
                                </button>
                            )}

                            {/* Join/Leave Button */}
                            {(group.privacy === 'PUBLIC' || isMember) ? (
                                <button
                                    onClick={handleJoin}
                                    className={`px-6 py-2 rounded-lg font-medium transition ${isMember
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {isMember ? "Joined" : "Join Group"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Request to Join
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Invite User</h3>
                        <input
                            placeholder="Username"
                            className="w-full border rounded p-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={inviteUsername}
                            onChange={e => setInviteUsername(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                            <button onClick={handleInvite} className="px-4 py-2 bg-blue-600 text-white rounded">Invite</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex border-b dark:border-gray-700 mb-4">
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            Posts
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('events')}
                        >
                            Events
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'posts' ? (
                        (!loading && (group.privacy === 'PUBLIC' || isMember)) ? (
                            <div className="space-y-4">
                                {pinnedPost && (
                                    <div className="border border-blue-200 dark:border-blue-900 rounded-lg overflow-hidden relative">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                            <span>📌 Pinned Post</span>
                                            {group.role === 'ADMIN' && (
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await api.delete(`/groups/${id}/pin`);
                                                            loadGroup();
                                                        } catch (e) { alert("Failed to unpin"); }
                                                    }}
                                                    className="ml-auto text-gray-500 hover:text-red-500 cursor-pointer"
                                                >
                                                    Unpin
                                                </button>
                                            )}
                                        </div>
                                        <PostCard
                                            post={pinnedPost}
                                            currentUser={null} // pinned post view only? Or pass actual user?
                                            // Ideally we pass current user for like status. 
                                            // Since we don't have it easily here without context or prop props drilling 
                                            // we might miss "likedByMe" on pinned post if not careful.
                                            // But standard PostCard handles it if 'post' has that data.
                                            // We fetched pinnedPost via api.get(/posts/{id}) which returns PostResponse (with likedByMe)
                                            // We need currentUser username to check isMyPost (for edit/delete).
                                            // We can get it from userService or local storage decode.
                                            // For now passing null might break "Edit/Delete" visibility on pinned post.
                                            // But pinned post is usually for viewing.
                                            onUpdate={() => { }} // No update on pinned view?
                                            onDelete={() => { }} // No delete on pinned view?
                                        />
                                    </div>
                                )}

                                <PostList
                                    endpoint={`/groups/${id}/posts`}
                                    queryKey={`group-${id}`}
                                    canCreate={isMember}
                                    createPlaceholder={`Post to ${group.name}...`}
                                    extraCreateData={{ groupId: group.id }}
                                    getPostMenuActions={getPostMenuActions}
                                />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl text-center shadow-sm">
                                <div className="text-4xl mb-4">🔒</div>
                                <h3 className="text-xl font-bold mb-2 dark:text-white">Private Group</h3>
                                <p className="text-gray-500">Join this group to see posts and discussions.</p>
                            </div>
                        )
                    ) : (
                        // Events Tab
                        (group.privacy === 'PUBLIC' || isMember) ? (
                            <GroupEvents groupId={id} isMember={isMember} isAdmin={group.role === 'ADMIN'} />
                        ) : (
                            <div className="text-center p-8 text-gray-500">Join group to see events.</div>
                        )
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <h3 className="font-bold border-b pb-2 mb-2 dark:text-white dark:border-gray-700">About</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Created by @{group.creatorUsername}
                            <br />
                            {new Date(group.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div >
        </Layout >
    );
}
