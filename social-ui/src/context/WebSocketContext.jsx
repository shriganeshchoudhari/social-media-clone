/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getNotifications, markAllRead } from '../api/notificationService';
import toast, { Toaster } from 'react-hot-toast';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const token = localStorage.getItem("token");
    const clientRef = React.useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (!token) return;
        getNotifications().then(res => {
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        }).catch(err => console.error("Failed to load notifications", err));
    }, [token]);

    useEffect(() => {
        if (!token) return;

        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (str) => console.log(str),
            onConnect: () => {
                stompClient.subscribe('/user/queue/notifications', (message) => {
                    const notification = JSON.parse(message.body);

                    // Update State
                    setNotifications(prev => [notification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Show Toast
                    toast(notification.message, {
                        icon: '🔔',
                        duration: 4000,
                        position: 'bottom-right',
                        style: {
                            background: '#333',
                            color: '#fff',
                        },
                    });
                });
            },
        });

        stompClient.activate();
        clientRef.current = stompClient;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [token]);

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => {
            if (n.id === id && !n.read) {
                setUnreadCount(c => Math.max(0, c - 1));
                return { ...n, read: true };
            }
            return n;
        }));
    };

    const clearNotifications = () => {
        markAllRead().then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        }).catch(err => console.error(err));
    };

    return (
        <WebSocketContext.Provider value={{ notifications, unreadCount, clearNotifications, markNotificationAsRead, stompClient: clientRef.current }}>
            <Toaster />
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
