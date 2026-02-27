import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import {
    getConversation,
    sendMessageWithImage,
    sendMessage,
    getGroupMessages,
    sendGroupMessage,
    reactToMessage,
    uploadFile,
    getGroup,
    sendGroupMessageWithImage
} from "../api/chatService";
import { getUserProfile } from "../api/userService";
import useChatSocket from "../hooks/useChatSocket";
import VerificationBadge from "../components/VerificationBadge";
import VoiceMessage from "../components/VoiceMessage";
import GroupDetailsModal from "../components/GroupDetailsModal";
import { useCall } from "../context/CallContext";
import { API_BASE_URL } from "../api/config";

export default function ChatPage() {
    const { username, groupId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);

    const [group, setGroup] = useState(null);
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const { startCall } = useCall();

    // Voice Recording
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const lastTypedRef = useRef(0);
    const typingTimeoutRef = useRef(null);

    // ... (refs)

    const getCurrentUser = () => {
        // ... (existing)
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

    // Load conversation
    const load = useCallback(() => {
        setLoading(true);
        if (groupId) {
            // Load messages
            getGroupMessages(groupId)
                .then(res => {
                    const pageContent = res.data.content || [];
                    const reversedMessages = [...pageContent].reverse();
                    setMessages(reversedMessages);
                    setLoading(false);

                    // Mark unread messages as read
                    reversedMessages.forEach(m => {
                        const notMe = m.sender !== myUsername;
                        const notReadByMe = m.readBy && !m.readBy.includes(myUsername);
                        if (notMe && notReadByMe) {
                            // Send read receipt
                            // We don't have sendRead from hook here directly efficiently without refs, 
                            // but we can use the one from useChatSocket if we move this logic or use a ref.
                            // Actually, let's just do it in a useEffect that watches messages
                        }
                    });
                })
                .catch(err => {
                    console.error("Failed to load group chat", err);
                    setLoading(false);
                });

            // Load group details
            getGroup(groupId)
                .then(res => setGroup(res.data))
                .catch(err => console.error("Failed to load group details", err));

        } else if (username) {
            // ... (existing 1-on-1 logic)
            getConversation(username)
                .then(res => {
                    const pageContent = res.data.content || [];
                    setMessages([...pageContent].reverse());
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load conversation", err);
                    setLoading(false);
                });

            getUserProfile(username)
                .then(res => setOtherUser(res.data))
                .catch(err => console.error("Failed to load user profile", err));
        }
    }, [username, groupId]);

    useEffect(() => {
        load();
    }, [load]);



    // WebSocket handling
    const { send, sendTyping, sendRead } = useChatSocket((message) => {
        // Logic to filter incoming messages
        const isForThisChat = groupId
            ? (message.groupId == groupId)
            : (message.sender === username || (message.sender === myUsername && message.receiver === username));

        if (isForThisChat) {
            setMessages(prev => {
                const isDuplicate = prev.some(m => m.id === message.id);
                if (isDuplicate) return prev;
                return [...prev, message];
            });
            // Mark read logic
            if (message.sender !== myUsername) {
                // For group, we send read receipt if we are focusing on this group
                if (groupId && message.groupId == groupId) {
                    sendRead(message.sender, message.id, groupId);
                } else if (!groupId && message.sender === username) {
                    sendRead(username, message.id);
                }
            }
        }
    }, (event) => {
        // Typing/Read events logic
        // Typing/Read events logic
        if (event.type === "TYPING") {
            const isForThisGroup = groupId && event.payload.groupId == groupId;
            // For 1-on-1, the 'receiver' field in payload holds the person typing (sender)
            const isForThisPChat = !groupId && event.payload.receiver === username && !event.payload.groupId;


            if (isForThisGroup || isForThisPChat) {
                // Show typing indicator
                setTypingUser(event.payload.receiver);
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser(null);
                }, 3000);
            }
        } else if (event.type === "READ") {
            setMessages(prev => prev.map(m => {
                if (!groupId) {
                    // For 1-on-1, if the active chat user sent the read receipt,
                    // mark all messages sent by us as read, bypassing fake ID issues.
                    if (event.payload.receiver === username && m.sender === myUsername) {
                        return { ...m, isRead: true };
                    }
                } else if (m.id === event.payload.messageId) {
                    // For Group, add to readBy list
                    const reader = event.payload.receiver; // In READ event, receiver field is used for readerUsername
                    const existingReadBy = m.readBy || [];
                    if (!existingReadBy.includes(reader)) {
                        return { ...m, readBy: [...existingReadBy, reader] };
                    }
                }
                return m;
            }));
        }
    });

    // Mark messages as read when loaded or updated
    useEffect(() => {
        if (!messages.length) return;

        const unreadMessages = messages.filter(m => {
            if (m.sender === myUsername) return false;

            if (groupId && m.groupId == groupId) {
                // Check if I am in the readBy list
                return !(m.readBy && m.readBy.includes(myUsername));
            }
            // 1-on-1 check
            return !groupId && !m.groupId && !m.isRead;
        });

        if (unreadMessages.length > 0) {
            unreadMessages.forEach(m => {
                if (groupId) sendRead(m.sender, m.id, groupId);
                else sendRead(m.sender, m.id);
            });

            // Optimistic update
            setMessages(prev => prev.map(msg => {
                const isTarget = unreadMessages.some(u => u.id === msg.id);
                if (isTarget) {
                    if (groupId) {
                        return { ...msg, readBy: [...(msg.readBy || []), myUsername] };
                    } else {
                        return { ...msg, isRead: true };
                    }
                }
                return msg;
            }));
        }
    }, [messages, groupId, myUsername, sendRead]);

    const handleTyping = () => {
        const now = Date.now();
        if (now - lastTypedRef.current > 2000) {
            sendTyping(username, groupId); // username is receiver/null, groupId is set if group
            lastTypedRef.current = now;
        }
    };

    // Recording State
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingIntervalRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const isPressingRef = useRef(false);

    const startRecording = async () => {
        isPressingRef.current = true;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // If user released while we were getting permission/stream
            if (!isPressingRef.current) {
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            mediaStreamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Start timer
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            mediaRecorder.start();
            setIsRecording(true);
        } catch (e) {
            console.error("Microphone access denied", e);
            isPressingRef.current = false;
        }
    };

    const stopRecordingAndSend = () => {
        isPressingRef.current = false;

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.onstop = async () => {
                cleanupRecording();

                // Validation: Too short/empty
                if (audioChunksRef.current.length === 0 || recordingTime < 1) {
                    setIsRecording(false);
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size < 1000) {
                    setIsRecording(false);
                    return;
                }

                const audioFile = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });

                try {
                    const res = await uploadFile(audioFile);
                    const voiceUrl = res.data;

                    if (groupId) {
                        await sendGroupMessage(groupId, "", voiceUrl);
                    } else {
                        await sendMessage(username, "", voiceUrl);
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            sender: myUsername,
                            receiver: username,
                            content: "",
                            voiceUrl: voiceUrl,
                            createdAt: new Date().toISOString()
                        }]);
                    }
                    load();
                } catch (e) {
                    console.error("Failed to upload/send voice", e);
                }
                setIsRecording(false);
            };
            mediaRecorderRef.current.stop();
        } else {
            // If we get here, maybe recorder wasn't ready yet or already stopped
            cleanupRecording();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        isPressingRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.onstop = null; // Prevent sending
            mediaRecorderRef.current.stop();
        }
        cleanupRecording();
        setIsRecording(false);
    };

    const cleanupRecording = () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const formatDuration = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imageFile) return;

        try {
            if (groupId) {
                if (imageFile) {
                    await sendGroupMessageWithImage(groupId, text, imageFile);
                } else {
                    await sendGroupMessage(groupId, text);
                }
            } else {
                if (imageFile) {
                    await sendMessageWithImage(username, text, imageFile);
                } else {
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        sender: myUsername,
                        receiver: username,
                        content: text,
                        createdAt: new Date().toISOString()
                    }]);
                    send(username, text);
                }
            }
            setText("");
            setImageFile(null);
            if (groupId || imageFile) load();
        } catch (e) {
            console.error("Send failed", e);
            if (e.response) console.error("Error data:", e.response.data);
        }
    };

    const handleReaction = async (msgId, reaction) => {
        try {
            await reactToMessage(msgId, reaction);
            // Optimistic update
            setMessages(prev => prev.map(m => {
                if (m.id === msgId) {
                    // Remove existing reaction from me if any?
                    // Simply append for now
                    const newReaction = { id: Date.now(), username: myUsername, reaction };
                    const existingReactions = m.reactions || [];
                    // Replace if exists
                    const filtered = existingReactions.filter(r => r.username !== myUsername);
                    return { ...m, reactions: [...filtered, newReaction] };
                }
                return m;
            }));
        } catch (e) {
            console.error("Reaction failed", e);
        }
    };

    // Helper to group reactions
    const renderReactions = (reactions) => {
        if (!reactions || reactions.length === 0) return null;
        // Group by type? Just show list for now
        return (
            <div className="flex gap-1 mt-1 flex-wrap">
                {reactions.map((r, i) => (
                    <span key={i} className="bg-gray-200 dark:bg-gray-700 rounded-full px-1 text-[10px]" title={r.username}>
                        {r.reaction}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <Layout>
            <Navbar />
            <div className="max-w-2xl mx-auto h-full flex flex-col relative">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/inbox")} className="text-gray-500 mr-2 md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                        </button>

                        {groupId && group ? (
                            <div
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                                onClick={() => setShowGroupDetails(true)}
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold overflow-hidden relative">
                                    {group.imageUrl ? (
                                        <img
                                            src={group.imageUrl.startsWith("http") ? group.imageUrl : `${API_BASE_URL}${group.imageUrl}`}
                                            className="w-full h-full object-cover"
                                            alt={group.name}
                                        />
                                    ) : (
                                        group.name.substring(0, 1).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {group.name}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </h2>
                                    <p className="text-xs text-gray-500">{group.participants.length} members</p>
                                </div>
                            </div>
                        ) : otherUser ? (
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${otherUser.username}`)}>
                                    <img
                                        src={otherUser.profileImageUrl
                                            ? (otherUser.profileImageUrl.startsWith("http") ? otherUser.profileImageUrl : `${API_BASE_URL}${otherUser.profileImageUrl}`)
                                            : `https://ui-avatars.com/api/?name=${otherUser.username}&background=random`}
                                        alt={otherUser.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                            {otherUser.username}
                                            {otherUser.verified && <VerificationBadge className="w-4 h-4" />}
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startCall(otherUser.username)}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 transition-colors"
                                    title="Voice/Video Call"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 015.25 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293c.271-.363.734-.527 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, index) => {
                        const isSelf = m.sender === myUsername;
                        return (
                            <div key={m.id || index} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} items-end gap-2 mb-2`}>
                                {!isSelf && (
                                    <img
                                        src={m.senderProfileImage
                                            ? (m.senderProfileImage.startsWith("http") ? m.senderProfileImage : `${API_BASE_URL}${m.senderProfileImage}`)
                                            : `https://ui-avatars.com/api/?name=${m.sender}&background=random`}
                                        alt={m.sender}
                                        className="w-8 h-8 rounded-full object-cover mb-1 border border-gray-200 dark:border-gray-700 shadow-sm"
                                        title={m.sender}
                                    />
                                )}
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm text-sm ${isSelf
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                    }`}>
                                    {!isSelf && groupId && <p className="text-[10px] text-gray-400 mb-1">{m.sender}</p>}

                                    {m.imageUrl && <img src={`${API_BASE_URL}${m.imageUrl}`} className="rounded mb-2 max-w-full" />}

                                    {m.voiceUrl && (
                                        <div className="mb-2">
                                            <VoiceMessage src={`${API_BASE_URL}${m.voiceUrl}`} />
                                        </div>
                                    )}

                                    {m.content && <p>{m.content}</p>}

                                    {renderReactions(m.reactions)}



                                    {isSelf && groupId && m.readBy && m.readBy.length > 0 && (
                                        <div
                                            className="text-[10px] text-blue-100 dark:text-blue-200/70 mt-1 text-right italic cursor-help"
                                            title={`Viewed by: ${m.readBy.join(', ')}`}
                                        >
                                            Viewed by {m.readBy.length}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-4 mt-1 relative group/reaction">
                                        <span className="text-[10px] opacity-70">
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isSelf && (
                                                <span className="ml-1 text-xs">
                                                    {m.isRead ? (
                                                        <span title="Read" className="text-blue-200 dark:text-blue-100 drop-shadow-sm font-bold">✓✓</span>
                                                    ) : (
                                                        <span title="Sent" className="text-blue-100 opacity-80 decoration-transparent">✓</span>
                                                    )}
                                                </span>
                                            )}
                                        </span>

                                        {/* Reaction Button & Picker */}
                                        <div className="relative group/picker">
                                            <button
                                                onClick={() => handleReaction(m.id, "❤️")}
                                                className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover/reaction:opacity-100 group-hover/picker:opacity-100 focus:opacity-100 p-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .008-.008.008-.008 0H9.75m4.5 0c0 .008-.008.008-.008 0H14.25" />
                                                </svg>
                                            </button>

                                            {/* Hover Picker */}
                                            <div className={`absolute bottom-full ${isSelf ? 'right-0' : 'left-0'} mb-2 opacity-0 group-hover/picker:opacity-100 pointer-events-none group-hover/picker:pointer-events-auto transition-opacity duration-200 flex bg-white dark:bg-gray-800 shadow-xl rounded-full px-3 py-2 gap-2 border border-gray-100 dark:border-gray-700 z-[100] whitespace-nowrap text-gray-900 dark:text-white after:content-[''] after:absolute after:top-full after:left-0 after:w-full after:h-2.5`}>
                                                {["❤️", "😂", "😮", "😢", "😡", "👍"].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReaction(m.id, emoji);
                                                        }}
                                                        className="hover:scale-150 transition transform duration-200 text-xl leading-none"
                                                        title={emoji}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex items-center gap-2 mb-2 ml-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2 text-xs text-gray-500 dark:text-gray-400 italic flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="ml-1">{typingUser ? `${typingUser} is typing...` : 'Typing...'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input / Recording Area */}
                <div className="bg-white dark:bg-gray-800 p-4 border-t">
                    {/* Image Preview (Only if not recording) */}
                    {!isRecording && imageFile && (
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

                    <form onSubmit={submit} className="flex gap-2 items-center">
                        {/* Image Upload Button - Hide when recording to avoid clutter */}
                        {!isRecording && (
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
                        )}

                        {/* Mic Button (Always visible, shifts slightly but stays stable relative to right side if we flex correctly)
                            Actually, to keep it stable, let's keep it in the flow. 
                        */}
                        <button
                            type="button"
                            className={`p-3 rounded-full cursor-pointer select-none touch-none relative z-20 transition-all ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                            onPointerDown={(e) => {
                                e.currentTarget.setPointerCapture(e.pointerId); // Capture pointer to track even if it moves out initially
                                startRecording();
                            }}
                            onPointerUp={(e) => {
                                e.currentTarget.releasePointerCapture(e.pointerId);
                                stopRecordingAndSend();
                            }}
                            // We only cancel if they intentionally drag WAY out, but setPointerCapture might prevent standard 'leave'. 
                            // Let's rely on visual cue or explicit 'cancel' button if needed, but for now simple release = send.
                            // To implement drag-to-cancel with capture, we need onPointerMove to check coordinates.
                            onPointerMove={(e) => {
                                if (isRecording && isPressingRef.current) {
                                    // Simple check: if moved more than 50px away from button center? 
                                    // For now, let's stick to simple press/release to ensure basic functionality works first.
                                }
                            }}
                            onContextMenu={(e) => e.preventDefault()} // Prevent right click menu
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            </svg>
                        </button>

                        {/* Recording UI vs Text Input */}
                        {isRecording ? (
                            <div className="flex-1 flex gap-3 items-center animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
                                <div className="text-red-500 animate-pulse text-xs">● Recording</div>
                                <div className="font-mono text-gray-700 dark:text-gray-200 min-w-[40px]">
                                    {formatDuration(recordingTime)}
                                </div>
                                {/* Mini Visualizer */}
                                <div className="flex-1 flex gap-0.5 items-center h-6 overflow-hidden opacity-50">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse"
                                            style={{
                                                height: `${Math.random() * 100}%`,
                                                animationDuration: `${Math.random() * 0.5 + 0.2}s`
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="text-gray-400 text-[10px] whitespace-nowrap">
                                    Release to Send
                                </div>
                            </div>
                        ) : (
                            <>
                                <input
                                    value={text}
                                    onChange={(e) => { setText(e.target.value); handleTyping(); }}
                                    className="flex-1 border rounded-full px-4 py-2"
                                    placeholder="Type a message..."
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-full px-4">
                                    Send
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
            {showGroupDetails && group && (
                <GroupDetailsModal
                    groupId={group.id}
                    onClose={() => setShowGroupDetails(false)}
                    onUpdate={() => {
                        // Reload group details to refresh member list
                        getGroup(groupId).then(res => setGroup(res.data));
                    }}
                />
            )}
        </Layout>
    );
}
