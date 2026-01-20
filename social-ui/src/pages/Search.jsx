import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchUsers } from "../api/searchService";

export default function Search() {

    const [params] = useSearchParams();
    const query = params.get("q");

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (query) {
            setLoading(true);
            setError(null);
            searchUsers(query)
                .then(res => setResults(res.data.content))
                .catch(err => setError("Failed to search users."))
                .finally(() => setLoading(false));
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div>
            <h3>Results for "{query}"</h3>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && results.length === 0 && (
                <p>No users found matching "{query}"</p>
            )}

            {results.map(u => (
                <div key={u.username} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
                    <Link to={`/profile/${u.username}`}>
                        <b style={{ fontSize: "1.1em" }}>{u.username}</b>
                    </Link>
                    <p style={{ margin: "5px 0", color: "#666" }}>{u.bio || "No bio"}</p>
                </div>
            ))}
        </div>
    );
}
