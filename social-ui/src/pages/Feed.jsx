import CommentList from "../components/CommentList";
import { useEffect, useState } from "react";
import { getFeed } from "../api/postService";
import { Link } from "react-router-dom";
import CreatePost from "../components/CreatePost";
import LikeButton from "../components/LikeButton";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

export default function Feed() {
    const [posts, setPosts] = useState([]);

    const loadFeed = () => {
        getFeed().then(res => setPosts(res.data.content));
    };

    useEffect(() => {
        loadFeed();
    }, []);

    return (
        <Layout>
            <Navbar />
            <div className="mt-4">
                <CreatePost onPost={loadFeed} />

                {posts.map(p => (
                    <div
                        key={p.id}
                        className="bg-white rounded-lg shadow-sm p-4 mb-4"
                    >
                        <div className="font-semibold text-sm mb-1 text-gray-900">
                            <Link to={`/profile/${p.authorUsername}`} className="hover:underline">
                                {p.authorUsername}
                            </Link>
                        </div>

                        <p className="text-gray-800 mb-3">
                            {p.content}
                        </p>

                        <LikeButton post={p} onToggle={loadFeed} />
                        <CommentList postId={p.id} />
                    </div>
                ))}
            </div>
        </Layout>
    );
}
