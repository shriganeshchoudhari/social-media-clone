import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import PostList from "../components/PostList";
import StoryBar from "../components/StoryBar";
import { getCurrentUser } from "../api/userService";

export default function Feed() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        getCurrentUser().then(res => setCurrentUser(res.data.username)).catch(console.error);
    }, []);

    return (
        <Layout>
            <Navbar />
            <div className="max-w-2xl mx-auto py-8 px-4">
                <StoryBar currentUser={currentUser} />
                <PostList
                    endpoint="/posts/feed/personal"
                    queryKey="personal-feed"
                    canCreate={true}
                />
            </div>
        </Layout>
    );
}
