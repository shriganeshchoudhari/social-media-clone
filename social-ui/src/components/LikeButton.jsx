export default function LikeButton({ post, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className="text-sm hover:opacity-80 transition-opacity text-gray-600 dark:text-gray-300"
            aria-label={post.likedByMe ? "Unlike post" : `Like post, ${post.likeCount} likes`}
            aria-pressed={post.likedByMe}
        >
            <span aria-hidden="true">{post.likedByMe ? "❤️" : "🤍"}</span> {post.likeCount}
        </button>
    );
}
