import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchUsers } from "../api/searchService";

export default function Search() {

    const [params] = useSearchParams();
    const query = params.get("q");

    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query) {
            searchUsers(query).then(res => setResults(res.data.content));
        }
    }, [query]);

    return (
        <div>
            <h3>Results for "{query}"</h3>

            {results.map(u => (
                <div key={u.username}>
                    <Link to={`/profile/${u.username}`}>
                        <b>{u.username}</b>
                    </Link>
                    <p>{u.bio}</p>
                </div>
            ))}
        </div>
    );
}
