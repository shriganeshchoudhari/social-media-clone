import { useState } from "react";
import { createPost } from "../api/postService";

export default function CreatePost({ onPost }) {
    const [content, setContent] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        await createPost(content);
        setContent("");
        onPost(); // refresh feed
    };

    return (
        <form onSubmit={submit}>
            <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button>Post</button>
        </form>
    );
}
