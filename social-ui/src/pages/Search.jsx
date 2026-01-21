import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchUsers } from "../api/searchService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

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
        <Layout>
            <Navbar />
            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Results for "{query}"
                </h3>

                {loading && <p className="text-gray-500">Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && results.length === 0 && (
                    <p className="text-gray-500">No users found matching "{query}"</p>
                )}

                <div className="space-y-4">
                    {results.map(u => (
                        <div
                            key={u.username}
                            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col transition-colors duration-200"
                        >
                            <Link to={`/profile/${u.username}`} className="text-lg font-bold text-gray-900 dark:text-white hover:underline">
                                {u.username}
                            </Link>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{u.bio || "No bio"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
