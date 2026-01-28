import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

export default function useChatSocket(onMessage) {
    const stompRef = useRef(null);
    const onMessageRef = useRef(onMessage);
    const processedMessagesRef = useRef(new Set());

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const socket = new SockJS("http://localhost:8081/ws");
        const stompClient = over(socket);

        stompClient.debug = () => { };

        stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
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
                                onMessageRef.current(message);

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
        }, (err) => {
            console.error("Chat WebSocket error:", err);
        });

        stompRef.current = stompClient;

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []); // Only run once on mount

    // send message
    const send = (receiver, content) => {
        if (stompRef.current && stompRef.current.connected) {
            stompRef.current.send(
                "/app/chat.send",
                {},
                JSON.stringify({ receiver, content })
            );
        }
    };

    return { send };
}
