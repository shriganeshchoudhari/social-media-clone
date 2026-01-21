import { useState } from "react";
import { createPost } from "../api/postService";

export default function CreatePost({ onPost }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await createPost(content);
            setContent("");
            onPost(); // refresh feed
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={submit}
            className="bg-white rounded-lg shadow-sm p-4 mb-6"
        >
            <textarea
                className="w-full border rounded p-2 text-sm mb-2 resize-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                rows="3"
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
            />

            <div className="text-right">
                <button
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 transition-colors font-medium"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
        </form>
    );
}
