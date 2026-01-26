import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [client, setClient] = useState(null);

    useEffect(() => {
        // Fetch specific user notifications on mount
        const fetchInitialNotifications = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081/api'}/notifications`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setNotifications(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch initial notifications", e);
                }
            }
        };
        fetchInitialNotifications();

        // WS Setup
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
                    setNotifications(prev => [notification, ...prev]);
                });

                // Subscribe to private user notifications if logged in
                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        const userId = payload.userId; // Matches the claim "userId" added in JwtService

                        if (userId) {
                            stompClient.subscribe(`/topic/user/${userId}`, (message) => {
                                const notification = JSON.parse(message.body);
                                setNotifications(prev => [notification, ...prev]);
                            });
                        }
                    } catch (e) {
                        console.error("Failed to parse token for WS subscription", e);
                    }
                }
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
