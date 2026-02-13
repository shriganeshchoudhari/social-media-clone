import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API_BASE_URL } from "../api/config";

export default function useNotificationSocket(userId, onMessage) {

    useEffect(() => {
        if (!userId) return;

        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            // debug: (str) => console.log(str),
            onConnect: () => {
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
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, [userId]);
}
