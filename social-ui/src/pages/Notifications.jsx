import { useNavigate } from "react-router-dom";
import { markOneRead } from "../api/notificationService";
import { useWebSocket } from "../context/WebSocketContext";

export default function Notifications() {
    const navigate = useNavigate();
    const { notifications, clearNotifications, markNotificationAsRead } = useWebSocket();

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={clearNotifications}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium hover:underline"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notifications yet.</p>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={async () => {
                                if (!n.read) {
                                    markOneRead(n.id).catch(console.error); // Update DB
                                    markNotificationAsRead(n.id); // Update UI
                                }

                                // Navigate based on type
                                if (n.type === "LIKE" || n.type === "COMMENT") {
                                    navigate(`/post/${n.referenceId}`);
                                } else if (n.type === "FOLLOW") {
                                    navigate(`/profile/${n.actorUsername}`);
                                } else if (n.type === "MESSAGE") {
                                    navigate(`/chat/${n.actorUsername}`);
                                }
                            }}
                            className={`p-4 rounded-lg shadow-sm border flex gap-4 cursor-pointer transition-colors
                    ${!n.read
                                    ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 border-gray-100 dark:border-gray-700'
                                    : 'bg-gray-50 dark:bg-gray-900 border-transparent opacity-75'}`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <span className="text-2xl">📣</span>
                            </div>
                            <div className="flex-1">
                                <p className={`text-gray-800 dark:text-gray-200 ${!n.read ? 'font-semibold' : ''}`}>{n.message}</p>
                                <p className="text-xs text-gray-500 mt-2">{formatTime(n.createdAt)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
