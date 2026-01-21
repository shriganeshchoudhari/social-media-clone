import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
    const navigate = useNavigate();
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
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white shadow-sm border-b border-gray-100 rounded-lg">
            <h1
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate("/feed")}
            >
                Social
            </h1>

            <div className="flex gap-4 items-center">
                <form onSubmit={submit} className="relative">
                    <input
                        className="border rounded-full py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 w-48 transition-all"
                        placeholder="Search users..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </form>

                <div className="flex gap-4 text-sm font-medium text-gray-600 items-center">
                    <button
                        className="hover:text-blue-600 transition-colors"
                        onClick={() => navigate("/feed")}
                    >
                        Feed
                    </button>

                    {username && (
                        <span className="text-gray-900 font-semibold cursor-default">
                            {username}
                        </span>
                    )}

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
