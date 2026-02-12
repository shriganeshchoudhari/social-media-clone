import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import useTheme from "../hooks/useTheme";
import { useWebSocket } from "../context/WebSocketContext";
import NotificationDropdown from "./NotificationDropdown";
import { getCurrentUser } from "../api/userService";

import UserMenu from "./UserMenu";
import { Home, MessageCircle, Bell, Search, Sun, Moon, Users } from "lucide-react";



export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();

    // Notification Logic
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const { notifications, unreadCount } = useWebSocket();

    // Search Logic
    const [q, setQ] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);

    // User Logic
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

    useEffect(() => {
        if (username) {
            getCurrentUser().then(res => {
                setAvatarUrl(res.data.profileImageUrl);
            }).catch(err => console.error("Failed to fetch user in navbar", err));
        }
    }, [username]);

    const getUserId = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.userId;
        } catch (e) { return null; }
    };
    const userId = getUserId();

    const getUserRole = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.role;
        } catch (e) { return null; }
    };
    const userRole = getUserRole();





    // Click Outside Handler for Notifications
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const submitSearch = (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* LEFT: Logo */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/feed")}>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transform hover:scale-105 transition-transform">
                            Social
                        </h1>
                    </div>

                    {/* CENTER: Search & Navigation (Desktop) */}
                    <div className="hidden md:flex flex-1 justify-center items-center px-8 gap-8">

                        {/* Search Bar */}
                        <form onSubmit={submitSearch} className="relative w-full max-w-xs group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white placeholder-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-800"
                                placeholder="Search users..."
                                value={q}
                                onChange={e => setQ(e.target.value)}
                            />
                        </form>

                        {/* Nav Icons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/feed")}
                                className={`p-2 rounded-xl transition-all relative group ${isActive('/feed') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title="Feed"
                            >
                                <Home size={24} strokeWidth={isActive('/feed') ? 2.5 : 2} />
                                {isActive('/feed') && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full mb-1"></span>}
                            </button>

                            <button
                                onClick={() => navigate("/inbox")}
                                className={`p-2 rounded-xl transition-all relative group ${isActive('/inbox') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title="Inbox"
                            >
                                <MessageCircle size={24} strokeWidth={isActive('/inbox') ? 2.5 : 2} />
                            </button>

                            <button
                                onClick={() => navigate("/explore")}
                                className={`p-2 rounded-xl transition-all text-sm font-medium ${isActive('/explore') ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title="Explore Trending"
                            >
                                🔥
                            </button>

                            <button
                                onClick={() => navigate("/groups")}
                                className={`p-2 rounded-xl transition-all relative group ${isActive('/groups') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                title="Communities"
                            >
                                <Users size={24} strokeWidth={isActive('/groups') ? 2.5 : 2} />
                            </button>

                            {(userRole === 'ADMIN' || userRole === 'MODERATOR') && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className={`p-2 rounded-xl transition-all text-sm font-medium ${isActive('/admin') ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    title="Admin Dashboard"
                                >
                                    🛡️
                                </button>
                            )}

                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-2 rounded-xl transition-all relative group ${showNotifications ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    title="Notifications"
                                >
                                    <Bell size={24} strokeWidth={showNotifications ? 2.5 : 2} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold shadow-sm ring-2 ring-white dark:ring-gray-900">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <NotificationDropdown onClose={() => setShowNotifications(false)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Toggle Theme"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                        <UserMenu username={username} avatarUrl={avatarUrl} logout={logout} />
                    </div>

                </div>
            </div>


        </nav>
    );
}
