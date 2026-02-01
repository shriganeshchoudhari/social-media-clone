import { useEffect, useState, useCallback, useMemo } from "react";
import { getComments, addComment } from "../api/commentService";
import { useWebSocket } from "../context/WebSocketContext";
import RichText from "./RichText";

export default function CommentList({ postId }) {

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // comment ID being replied to
    const [replyText, setReplyText] = useState("");

    const { stompClient } = useWebSocket();

    const load = useCallback(() => {
        getComments(postId).then(res => setComments(res.data.content));
    }, [postId]);

    useEffect(() => {
        load();

        if (stompClient && stompClient.connected) {
            console.log("Subscribing to comments for post " + postId);
            const sub = stompClient.subscribe(`/topic/posts/${postId}/comments`, (message) => {
                const newComment = JSON.parse(message.body);
                setComments(prev => {
                    // 1. If we already have this exact real ID, it matches the API response result.
                    if (prev.some(c => c.id === newComment.id)) return prev;

                    // 2. Check for optimistic comment (temp ID > 1 trillion) with same content/author
                    // We use a simple heuristic: new created optimistic comments have id Date.now()
                    // which is huge. Real IDs are sequential (e.g. 1, 2, 3...)
                    const optimisticMatch = prev.find(c =>
                        c.id > 1000000000000 &&
                        c.authorUsername === newComment.authorUsername &&
                        c.content === newComment.content
                    );

                    if (optimisticMatch) {
                        // Replace optimistic comment with the real one
                        return prev.map(c => c.id === optimisticMatch.id ? newComment : c);
                    }

                    // 3. Otherwise, append unique new comment
                    return [...prev, newComment];
                });
            });
            return () => sub.unsubscribe();
        }
    }, [load, stompClient, postId]);

    // Group comments by parentId
    const rootComments = useMemo(() => comments.filter(c => !c.parentId), [comments]);
    const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

    // Get current user from token
    const [currentUser, setCurrentUser] = useState("");
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                setCurrentUser(payload.sub);
            } catch (e) { }
        }
    }, []);

    const submit = async (e, parentId = null) => {
        e.preventDefault();
        const content = parentId ? replyText : text;
        if (!content.trim()) return;

        const tempComment = {
            id: Date.now(), // temp id
            authorUsername: currentUser || "you",
            content: content,
            parentId: parentId,
            createdAt: new Date().toISOString()
        };

        // optimistic add
        setComments(prev => [...prev, tempComment]);
        if (parentId) {
            setReplyText("");
            setReplyingTo(null);
        } else {
            setText("");
        }

        try {
            const res = await addComment(postId, content, parentId);

            // replace temp with real comment
            setComments(prev =>
                prev.map(c => c.id === tempComment.id ? res.data : c)
            );
        } catch {
            // rollback
            setComments(prev =>
                prev.filter(c => c.id !== tempComment.id)
            );
            alert("Failed to add comment");
        }
    };

    const CommentItem = ({ comment }) => {
        const replies = getReplies(comment.id);
        const isReplying = replyingTo === comment.id;

        return (
            <div className={`mb-2 ${comment.parentId ? "ml-6 border-l-2 border-gray-100 dark:border-gray-700 pl-2" : ""}`}>
                <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{comment.authorUsername}</span>{" "}
                    <span className="text-gray-700 dark:text-gray-400">
                        <RichText text={comment.content} />
                    </span>
                </div>

                <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <button
                        onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                        className="hover:text-blue-500"
                    >
                        Reply
                    </button>
                    {/* Could add timestamp here */}
                </div>

                {isReplying && (
                    <form onSubmit={(e) => submit(e, comment.id)} className="mt-2 mb-2">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                placeholder={`Reply to @${comment.authorUsername}...`}
                                autoFocus
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                )}

                {/* Recursive render for replies */}
                <div className="mt-1">
                    {replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-2">
            {rootComments.map(c => (
                <CommentItem key={c.id} comment={c} />
            ))}

            <form onSubmit={(e) => submit(e, null)} className="mt-2">
                <input
                    className="w-full border rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    placeholder="Write a comment..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
            </form>
        </div>
    );
}
