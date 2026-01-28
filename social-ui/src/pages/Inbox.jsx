import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { getInbox } from "../api/chatService";

export default function Inbox() {

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getInbox()
            .then(res => {
                setChats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load inbox", err);
                setLoading(false);
            });
    }, []);

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

            <h2 className="text-2xl font-bold mb-6 px-4">Messages</h2>

            <div className="max-w-2xl mx-auto px-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading conversations...</div>
                ) : chats.length === 0 ? (
                    <div className="text-center py-10">
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
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {c.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {c.username}
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
        </Layout>
    );
}
