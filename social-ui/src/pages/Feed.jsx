import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        api.get("/posts/feed/personal")
            .then(res => setPosts(res.data.content));
    }, []);

    return (
        <div>
            <h2>My Feed</h2>
            {posts.map(p => (
                <div key={p.id}>
                    <b>{p.authorUsername}</b>
                    <p>{p.content}</p>
                </div>
            ))}
        </div>
    );
}
