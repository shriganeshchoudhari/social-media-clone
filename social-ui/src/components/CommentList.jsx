import { useEffect, useState } from "react";
import { getComments, addComment } from "../api/commentService";

export default function CommentList({ postId }) {

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");

    const load = () => {
        getComments(postId).then(res => setComments(res.data.content));
    };

    useEffect(() => {
        load();
    }, [postId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        await addComment(postId, text);
        setText("");
        load();
    };

    return (
        <div className="mt-3 border-t pt-2">
            {comments.map(c => (
                <div key={c.id} className="text-sm mb-1">
                    <span className="font-medium">{c.authorUsername}</span>{" "}
                    <span className="text-gray-700">{c.content}</span>
                </div>
            ))}

            <form onSubmit={submit} className="mt-2">
                <input
                    className="w-full border rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-300"
                    placeholder="Write a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
            </form>
        </div>
    );
}
