import { useCallback, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../api/config";

export default function useChatSocket(onMessage, onEvent) {
    const stompRef = useRef(null);
    const onMessageRef = useRef(onMessage);
    const onEventRef = useRef(onEvent);
    const processedMessagesRef = useRef(new Set());

    useEffect(() => {
        onMessageRef.current = onMessage;
        onEventRef.current = onEvent;
    }, [onMessage, onEvent]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: () => { },
            onConnect: () => {
                console.log("Chat WebSocket connected");

                // Subscribe to private message queue
                stompClient.subscribe(
                    "/user/queue/messages",
                    (msg) => {
                        if (msg.body) {
                            try {
                                const message = JSON.parse(msg.body);

                                // Create a unique fingerprint for deduplication
                                const fingerprint = `${message.sender}-${message.receiver}-${message.content}-${message.createdAt}`;

                                // Only process if we haven't seen this message before
                                if (!processedMessagesRef.current.has(fingerprint)) {
                                    processedMessagesRef.current.add(fingerprint);
                                    if (onMessageRef.current) {
                                        onMessageRef.current(message);
                                    }

                                    // Clean up old fingerprints (keep last 100)
                                    if (processedMessagesRef.current.size > 100) {
                                        const arr = Array.from(processedMessagesRef.current);
                                        processedMessagesRef.current = new Set(arr.slice(-100));
                                    }
                                }
                            } catch (e) {
                                console.error("Failed to parse chat message", msg.body);
                            }
                        }
                    }
                );

                // Subscribe to private event queue (typing, read)
                stompClient.subscribe(
                    "/user/queue/events",
                    (msg) => {
                        if (msg.body && onEventRef.current) {
                            try {
                                const event = JSON.parse(msg.body);
                                onEventRef.current(event);
                            } catch (e) {
                                console.error("Failed to parse chat event", msg.body);
                            }
                        }
                    }
                );
            },
            onStompError: (frame) => {
                console.error("Chat WebSocket error:", frame);
            }
        });

        stompClient.activate();
        stompRef.current = stompClient;

        return () => {
            if (stompClient && stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, []); // Only run once on mount

    // send message
    const send = useCallback((receiver, content) => {
        if (stompRef.current && stompRef.current.connected) {
            stompRef.current.publish({
                destination: "/app/chat.send",
                body: JSON.stringify({ receiver, content })
            });
        }
    }, []);

    const sendTyping = useCallback((receiver, groupId = null) => {
        if (stompRef.current && stompRef.current.connected) {
            stompRef.current.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify({ receiver, groupId })
            });
        }
    }, []);

    const sendRead = useCallback((receiver, messageId, groupId = null) => {
        if (stompRef.current && stompRef.current.connected) {
            stompRef.current.publish({
                destination: "/app/chat.read",
                body: JSON.stringify({ receiver, messageId, groupId })
            });
        }
    }, []);

    return { send, sendTyping, sendRead };
}
