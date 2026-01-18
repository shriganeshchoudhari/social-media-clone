import { toggleLike } from "../api/likeService";

export default function LikeButton({ post, onToggle }) {

    const click = async () => {
        await toggleLike(post.id);
        onToggle();
    };

    return (
        <button onClick={click}>
            {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
        </button>
    );
}
