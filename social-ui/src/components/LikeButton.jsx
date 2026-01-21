import { useState } from "react";
import { toggleLike } from "../api/likeService";

export default function LikeButton({ post, onToggle }) {
    const [busy, setBusy] = useState(false);

    const click = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await toggleLike(post.id);
            onToggle();
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            onClick={click}
            disabled={busy}
            className="text-sm hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
            {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
        </button>
    );
}
