import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import useTheme from "../hooks/useTheme";
import { useWebSocket } from "../context/WebSocketContext";
import NotificationDropdown from "./NotificationDropdown";
import { getUnreadCount } from "../api/notificationService";
import useNotificationSocket from "../hooks/useNotificationSocket";

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { notifications } = useWebSocket(); // Keeping this if other parts use it, but moving to simpler hook approach as requested
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = React.useRef(null);
    const [q, setQ] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    // Get userId from token for WS subscription
    const getUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.userId;
        } catch (e) { return null; }
    };
    const userId = getUserId();

    // Live update via socket
    useNotificationSocket(userId, (notification) => {
        // Increment badge count
        setUnreadCount(prev => prev + 1);
        // Optionally show a toast/alert here
        // alert(notification.message); 
    });

    // Update badge from API
    useEffect(() => {
        getUnreadCount().then(res => setUnreadCount(res.data));
    }, []);

    // Close notifications when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const [username] = useState(() => {
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

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const submit = (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <div className="relative z-50 flex items-center justify-between mb-6 px-4 py-3 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 rounded-lg transition-colors duration-200">
            <h1
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate("/feed")}
            >
                Social
            </h1>

            <div className="flex gap-4 items-center">
                <form onSubmit={submit} className="relative hidden sm:block">
                    <input
                        className="border border-gray-300 dark:border-gray-600 rounded-full py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 w-48 transition-all bg-gray-50 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400"
                        placeholder="Search users..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </form>

                <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-300 items-center">
                    <button
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        onClick={() => navigate("/feed")}
                    >
                        Feed
                    </button>

                    <button
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors sm:hidden"
                        onClick={() => navigate("/search")}
                    >
                        Search
                    </button>

                    <button
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
                        onClick={() => navigate("/notifications")}
                    >
                        Notifications
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="relative" ref={notificationRef}>
                        <div
                            className="cursor-pointer hover:text-blue-600 transition-colors relative"
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <span className="text-xl">🔔</span>
                            {notifications && notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-white dark:border-gray-800">
                                    {notifications.length}
                                </span>
                            )}
                        </div>
                        {showNotifications && (
                            <NotificationDropdown onClose={() => setShowNotifications(false)} />
                        )}
                    </div>

                    {username && (
                        <button
                            onClick={() => navigate(`/profile/${username}`)}
                            className="text-gray-900 dark:text-gray-100 font-semibold hover:underline hidden md:inline"
                        >
                            {username}
                        </button>
                    )}

                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg leading-none"
                        title="Toggle Theme"
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>

                    <button
                        className="hover:text-red-500 transition-colors"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
