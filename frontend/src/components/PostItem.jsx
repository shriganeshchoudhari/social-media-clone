import axios from "axios";

export default function PostItem({ post, refresh }) {
    const like = async () => {
        await axios.post(`http://localhost:8081/api/posts/${post.id}/like`);
        refresh();
    };
    const comment = async () => {
        const txt = prompt("Enter comment:");
        if (txt) {
            await axios.post(`http://localhost:8081/api/posts/${post.id}/comment`, txt, {
                headers: { "Content-Type": "text/plain" },
            });
            refresh();
        }
    };
    return (
        <div className="post-card">
            <p>{post.content}</p>
            <div>
                <button onClick={like}>❤️ {post.likes}</button>
                <button onClick={comment}>💬 {post.comments?.length || 0}</button>
            </div>
        </div>
    );
}
