import CommentList from "../components/CommentList";
import { useEffect, useState } from "react";
import { getFeed } from "../api/postService";
import { Link } from "react-router-dom";
import CreatePost from "../components/CreatePost";
import LikeButton from "../components/LikeButton";

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
                    <Link to={`/profile/${p.authorUsername}`}>
                        <b>{p.authorUsername}</b>
                    </Link>
                    <p>{p.content}</p>

                    <LikeButton post={p} onToggle={loadFeed} />
                    <CommentList postId={p.id} />
                </div>
            ))}

        </div>
    );
}
