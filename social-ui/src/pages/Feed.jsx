import { useEffect, useState } from "react";
import { getFeed } from "../api/postService";
import CreatePost from "../components/CreatePost";

export default function Feed() {
    const [posts, setPosts] = useState([]);

    const loadFeed = () => {
        getFeed().then(res => setPosts(res.data.content));
    };

    useEffect(() => {
        loadFeed();
    }, []);

    return (
        <div>
            <CreatePost onPost={loadFeed} />

            {posts.map(p => (
                <div key={p.id}>
                    <b>{p.authorUsername}</b>
                    <p>{p.content}</p>
                </div>
            ))}
        </div>
    );
}
