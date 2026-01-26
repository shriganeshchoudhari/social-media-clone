import { useEffect } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

export default function useNotificationSocket(userId, onMessage) {

    useEffect(() => {
        if (!userId) return;

        // Use SockJS which handles the fallback
        const socket = new SockJS("http://localhost:8081/ws");
        const stompClient = over(socket);

        // Disable debug logs to keep console clean
        stompClient.debug = () => { };

        stompClient.connect({}, () => {
            stompClient.subscribe(
                `/topic/user/${userId}`,
                (msg) => {
                    if (msg.body) {
                        try {
                            const notification = JSON.parse(msg.body);
                            onMessage(notification);
                        } catch (e) {
                            console.error("Failed to parse WS message", msg.body);
                        }
                    }
                }
            );
        }, (err) => {
            console.error("WS Error:", err);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [userId]);
}
