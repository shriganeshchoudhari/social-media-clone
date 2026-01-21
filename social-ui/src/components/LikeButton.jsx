export default function LikeButton({ post, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="text-sm hover:opacity-80 transition-opacity text-gray-600 dark:text-gray-300"
        >
            {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
        </button>
    );
}
