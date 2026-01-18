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
        <div>
            {comments.map(c => (
                <div key={c.id}>
                    <b>{c.authorUsername}</b> {c.content}
                </div>
            ))}

            <form onSubmit={submit}>
                <input
                    placeholder="Write a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
            </form>
        </div>
    );
}
