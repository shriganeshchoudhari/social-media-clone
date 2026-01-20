import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [q, setQ] = useState("");
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const submit = (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
    };

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

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
            background: "#1a1a1a",
            borderBottom: "1px solid #333",
            marginBottom: "20px"
        }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <button onClick={() => navigate("/feed")}>Feed</button>
                <form onSubmit={submit} style={{ display: "flex", gap: "5px" }}>
                    <input
                        placeholder="Search users..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                {username && <span style={{ fontWeight: "bold" }}>{username}</span>}
                <button onClick={logout}>Logout</button>
            </div>
        </nav>
    );
}
