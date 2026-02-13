import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, Search, Users, Bell } from "lucide-react";
import { useWebSocket } from "../context/WebSocketContext";

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { unreadCount } = useWebSocket();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/feed", icon: Home, label: "Feed" },
        { path: "/explore", icon: Search, label: "Explore" },
        { path: "/groups", icon: Users, label: "Groups" },
        { path: "/inbox", icon: MessageCircle, label: "Inbox" },
        { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
            <nav className="flex justify-around items-center h-16" role="navigation" aria-label="Mobile Navigation">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={isActive(item.path) ? "page" : undefined}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                    >
                        <div className="relative">
                            <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} aria-hidden="true" />
                            {item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white dark:ring-gray-900" aria-hidden="true">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium" aria-hidden="true">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
