import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [client, setClient] = useState(null);

    useEffect(() => {
        // Derive WS URL from API URL or hardcode for now
        // VITE_API_URL is like http://localhost:8081/api
        // We need ws://localhost:8081/ws
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
        const wsUrl = apiUrl.replace('http', 'ws').replace('/api', '/ws');

        const stompClient = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                // Subscribe to public notifications
                stompClient.subscribe('/topic/public', (message) => {
                    const notification = JSON.parse(message.body);
                    console.log('Received notification:', notification);
                    setNotifications(prev => [notification, ...prev]);

                    // Show a native toast/alert if possible, or just store in state
                    // Basic browser notification (optional):
                    // if (Notification.permission === 'granted') {
                    //     new Notification(notification.message);
                    // }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        stompClient.activate();
        setClient(stompClient);

        return () => {
            stompClient.deactivate();
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <WebSocketContext.Provider value={{ notifications, clearNotifications }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
