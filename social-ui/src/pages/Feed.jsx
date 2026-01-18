import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Feed() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        api.get("/posts/feed/personal?page=0&size=10")
            .then(res => setPosts(res.data.content));
    }, []);

    return (
        <div>
            {posts.map(p => (
                <div key={p.id}>
                    <b>{p.authorUsername}</b>
                    <p>{p.content}</p>
                </div>
            ))}
        </div>
    );
}
