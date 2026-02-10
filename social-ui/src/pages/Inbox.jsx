import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { getInbox, getMyGroups, createGroup } from "../api/chatService";
import VerificationBadge from "../components/VerificationBadge";
import GroupCreationModal from "../components/GroupCreationModal";

export default function Inbox() {

    const [chats, setChats] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const [chatRes, groupRes] = await Promise.all([getInbox(), getMyGroups()]);
            setChats(chatRes.data);
            setGroups(groupRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load inbox", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreateGroup = async (name, participants) => {
        try {
            await createGroup(name, participants);
            setShowCreateGroupModal(false);
            load();
        } catch (e) {
            alert("Failed to create group");
            console.error(e);
        }
    };

    // Format timestamp helper
    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Layout>
            <Navbar />

            <div className="flex justify-between items-center px-4 mb-6">
                <h2 className="text-2xl font-bold">Messages</h2>
                <button
                    onClick={() => setShowCreateGroupModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700"
                >
                    + New Group
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 space-y-6">

                {/* Groups Section */}
                {groups.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Groups</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {groups.map(g => (
                                <div
                                    key={g.id}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between group"
                                    onClick={() => navigate(`/chat/group/${g.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg overflow-hidden relative">
                                            {g.imageUrl ? (
                                                <img
                                                    src={g.imageUrl.startsWith("http") ? g.imageUrl : `http://localhost:8081${g.imageUrl}`}
                                                    className="w-full h-full object-cover"
                                                    alt={g.name}
                                                />
                                            ) : (
                                                g.name.substring(0, 1).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                                {g.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {g.participants.length} members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Direct Messages */}
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Direct Messages</h3>
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading conversations...</div>
                    ) : chats.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                            <p className="text-gray-500 mb-4">No conversations yet.</p>
                            <p className="text-sm text-gray-400">Visit a profile to start chatting!</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {chats.map(c => (
                                <div
                                    key={c.username}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between group"
                                    onClick={() => navigate(`/chat/${c.username}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={c.profileImage
                                                ? (c.profileImage.startsWith("http") ? c.profileImage : `http://localhost:8081${c.profileImage}`)
                                                : `https://ui-avatars.com/api/?name=${c.username}&background=random`}
                                            alt={c.username}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                                {c.username}
                                                {c.verified && <VerificationBadge className="w-4 h-4" />}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1 h-5">
                                                {c.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                        {formatTime(c.lastTime)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showCreateGroupModal && (
                <GroupCreationModal
                    onClose={() => setShowCreateGroupModal(false)}
                    onCreate={handleCreateGroup}
                />
            )}
        </Layout>
    );
}
