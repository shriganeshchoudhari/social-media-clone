import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useTheme from "../hooks/useTheme";

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [q, setQ] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setUsername(payload.sub);
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

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
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 rounded-lg transition-colors duration-200">
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
