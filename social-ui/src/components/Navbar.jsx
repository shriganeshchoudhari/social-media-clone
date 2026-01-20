import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const [q, setQ] = useState("");
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        navigate(`/search?q=${q}`);
    };

    return (
        <nav style={{ display: "flex", gap: "10px" }}>
            <form onSubmit={submit}>
                <input
                    placeholder="Search users..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
            </form>

            <button onClick={() => navigate("/feed")}>Feed</button>
        </nav>
    );
}
