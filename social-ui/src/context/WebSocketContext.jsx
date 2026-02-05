/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getNotifications, markAllRead } from '../api/notificationService';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const token = localStorage.getItem("token");

    // Use a ref to keep track of the client if needed, or just connection status
    // For now we don't expose client to children to avoid re-renders or leaks
    // If we need to send messages, we should expose a sendMessage function

    const clientRef = React.useRef(null);

    useEffect(() => {
        if (!token) return;

        // Fetch existing notifications
        getNotifications().then(res => {
            setNotifications(res.data);
        }).catch(err => console.error("Failed to load notifications", err));

        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                // Subscribe to private notifications
                stompClient.subscribe('/user/queue/notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    setNotifications(prev => [notification, ...prev]);
                });
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            // We can't easily deactivate if we want to share the client, 
            // but for now, we will rely on cleanup.
            // If we share it, children might try to use it after unmount.
            // A better approach for shared client:
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [token]);

    const clearNotifications = () => {
        markAllRead().then(() => {
            setNotifications([]);
        }).catch(err => console.error(err));
    };

    return (
        <WebSocketContext.Provider value={{ notifications, clearNotifications, stompClient: clientRef.current }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
