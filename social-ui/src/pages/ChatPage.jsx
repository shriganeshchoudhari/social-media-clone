import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { getConversation, sendMessageWithImage } from "../api/chatService";
import { getUserProfile } from "../api/userService";
import useChatSocket from "../hooks/useChatSocket";

export default function ChatPage() {

    const { username } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const lastTypedRef = useRef(0);

    // Get current user
    const getCurrentUser = () => {
        const token = localStorage.getItem("token");
        if (!token) return "";
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.sub;
        } catch (e) {
            return "";
        }
    };

    const myUsername = getCurrentUser();

    // Load conversation history and user profile
    const load = useCallback(() => {
        getConversation(username)
            .then(res => {
                setMessages(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load conversation", err);
                setLoading(false);
            });

        getUserProfile(username)
            .then(res => setOtherUser(res.data))
            .catch(err => console.error("Failed to load user profile", err));
    }, [username]);

    useEffect(() => {
        load();
    }, [load]);

    // Real-time WebSocket
    const { send, sendTyping, sendRead } = useChatSocket((message) => {
        // Only add if it's from the other person in this conversation
        // Don't add our own messages since they're already added optimistically
        if (message.sender === username && message.receiver === myUsername) {
            setMessages(prev => {
                // Check if this message already exists to prevent duplicates
                const isDuplicate = prev.some(m =>
                    m.content === message.content &&
                    m.sender === message.sender &&
                    Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000 // Within 1 second
                );

                if (isDuplicate) {
                    return prev;
                }

                return [...prev, message];
            });

            // If we are looking at the chat, mark as read immediately
            sendRead(username, message.id);
        }
    }, (event) => {
        if (event.type === "TYPING") {
            const payload = event.payload;
            if (payload.receiver === username) {
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            }
        } else if (event.type === "READ") {
            const payload = event.payload;
            if (payload.receiver === username) {
                // Mark messages as read
                setMessages(prev => prev.map(m => {
                    if (m.sender === myUsername && (m.id <= payload.messageId || !payload.messageId)) {
                        return { ...m, isRead: true };
                    }
                    return m;
                }));
            }
        }
    });

    // Mark messages as read when valid messages are loaded initially
    const handleOneTimeRead = useCallback(() => {
        if (messages.length > 0) {
            // Check if the last message from them is unread
            const lastMsgFromThem = [...messages].reverse().find(m => m.sender === username);
            if (lastMsgFromThem && !lastMsgFromThem.isRead) {
                sendRead(username, lastMsgFromThem.id);
            }
        }
    }, [messages, username, sendRead]);

    useEffect(() => {
        if (!loading) {
            handleOneTimeRead();
        }
    }, [loading, handleOneTimeRead]);


    const handleTyping = () => {
        const now = Date.now();
        if (now - lastTypedRef.current > 2000) {
            sendTyping(username);
            lastTypedRef.current = now;
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imageFile) return;

        // If there's an image, use HTTP instead of WebSocket
        if (imageFile) {
            try {
                await sendMessageWithImage(username, text, imageFile);
                setText("");
                setImageFile(null);
                // Reload conversation to see the new image message
                load();
            } catch (error) {
                console.error("Failed to send image", error);
            }
            return;
        }

        // Text-only messages continue using WebSocket
        if (!text.trim()) return;

        // Optimistic UI - add message immediately
        const optimisticMessage = {
            id: Date.now(),
            sender: myUsername,
            receiver: username,
            content: text,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMessage]);

        // Send via WebSocket
        send(username, text);

        setText("");
    };

    // Format timestamp
    const formatTime = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <Navbar />

            <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col">
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                            &larr;
                        </button>

                        {otherUser && (
                            <img
                                src={otherUser.profileImageUrl
                                    ? (otherUser.profileImageUrl.startsWith("http") ? otherUser.profileImageUrl : `http://localhost:8081${otherUser.profileImageUrl}`)
                                    : `https://ui-avatars.com/api/?name=${username}&background=random`}
                                alt={username}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            />
                        )}

                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {username}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 space-y-3">
                    {loading && messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm">Loading chat...</p>
                    ) : messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">
                            No messages yet. Say hi! 👋
                        </p>
                    ) : (
                        messages.map((m, index) => {
                            const isSelf = m.sender === myUsername;

                            return (
                                <div key={m.id || index} className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm text-sm ${isSelf
                                    ? 'bg-blue-600 text-white rounded-br-none ml-auto'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                                    }`}>
                                    {m.imageUrl && (
                                        <img
                                            src={`http://localhost:8081${m.imageUrl}`}
                                            alt="chat"
                                            className="rounded max-w-full mb-2"
                                        />
                                    )}
                                    {m.content && <p>{m.content}</p>}
                                    <div className={`flex items-center justify-end gap-1 mt-1`}>
                                        <span className={`text-[10px] ${isSelf ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {formatTime(m.createdAt)}
                                        </span>
                                        {isSelf && (
                                            <span className="text-[10px] text-blue-200 ml-1">
                                                {m.isRead ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {isTyping && (
                        <div className="text-xs text-gray-500 italic ml-4 animate-pulse">
                            {username} is typing...
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
                    {imageFile && (
                        <div className="mb-2 relative inline-block">
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={() => setImageFile(null)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                                ×
                            </button>
                        </div>
                    )}
                    <form onSubmit={submit} className="flex gap-2">
                        <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setImageFile(e.target.files[0])}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </label>
                        <input
                            className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Type a message..."
                            value={text}
                            onChange={e => {
                                setText(e.target.value);
                                handleTyping();
                            }}
                        />
                        <button
                            disabled={!text.trim() && !imageFile}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
