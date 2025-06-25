import { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8080/api/ws';

export const useWebSocket = (authToken, currentUser, activeChat, onMessageReceived) => {
    const [stompClient, setStompClient] = useState(null);
    const [isStompReady, setIsStompReady] = useState(false);
    const subscriptions = useRef(new Map());
    const onMessageReceivedRef = useRef(onMessageReceived);

    // Update the ref when onMessageReceived changes
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    // Check if StompJS is loaded
    useEffect(() => {
        if (!window.StompJs) {
            console.warn("StompJS not loaded yet.");
            const intervalId = setInterval(() => {
                 if (window.StompJs) {
                     setIsStompReady(true);
                     clearInterval(intervalId);
                 }
            }, 100);
            return () => clearInterval(intervalId);
        }
        setIsStompReady(true);
    }, []);

    // Initialize WebSocket connection
    useEffect(() => {
        if (!isStompReady || !authToken || !currentUser) {
            console.log('🔌 WebSocket connection conditions not met:', {
                isStompReady,
                hasAuthToken: !!authToken,
                hasCurrentUser: !!currentUser
            });
            return;
        }
        
        console.log('🔗 Initializing WebSocket connection...');
        const client = new window.StompJs.Client({ 
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: { Authorization: `Bearer ${authToken}` }, 
            reconnectDelay: 5000, 
            debug: (str) => { console.log('🔍 STOMP Debug:', str); }
        });

        client.onConnect = () => { 
            console.log('✅ WebSocket connected successfully'); 
            setStompClient(client); 
        };
        
        client.onStompError = (frame) => {
            console.error('❌ STOMP error:', frame.headers['message'], frame.body);
        };
        
        client.onWebSocketError = (error) => {
            console.error('❌ WebSocket error:', error);
        };
        
        client.onWebSocketClose = () => {
            console.log('🔌 WebSocket connection closed');
            setStompClient(null);
        };
        
        console.log('🚀 Activating WebSocket client...');
        client.activate();

        return () => { 
            if (client && client.active) { 
                console.log('🔌 WebSocket disconnecting...'); 
                client.deactivate(); 
            }
        };
    }, [isStompReady, authToken, currentUser]);

    // Subscribe to personal notifications
    useEffect(() => {
        if (!stompClient || !stompClient.connected || !currentUser) return;
        
        const notificationTopic = `/topic/notification/${currentUser.id}`;
        console.log(`🔔 Subscribing to personal notifications: ${notificationTopic}`);
        
        const notificationSubscription = stompClient.subscribe(notificationTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('🔔 Personal notification received:', data);
                
                if (data.type === 'MATCH') {
                    console.log('💕 Match notification:', data);
                    alert(`Bạn đã match với ${data.matchedUsername}!`);
                }
            } catch (err) {
                console.error('❌ Error parsing notification message:', err);
            }
        });
        
        return () => {
            console.log('🔕 Unsubscribing from personal notifications');
            notificationSubscription.unsubscribe();
        };
    }, [stompClient, currentUser]);

    // Subscribe to chat topics
    const subscribeToChats = useCallback((chats) => {
        if (!stompClient || !stompClient.connected || !Array.isArray(chats) || chats.length === 0) {
            console.log('🔌 WebSocket subscription conditions not met:', {
                hasStompClient: !!stompClient,
                isConnected: stompClient?.connected,
                chatsLength: chats.length
            });
            return;
        }
        
        console.log('📡 Setting up WebSocket subscriptions for', chats.length, 'chats');
        const currentSubs = subscriptions.current;
        
        // Subscribe to new chats
        chats.forEach(chat => {
            if (!currentSubs.has(chat.id)) {
                const topic = `/topic/chat/${chat.id}`;
                console.log(`🔔 Subscribing to ${topic}`);
                const subscription = stompClient.subscribe(topic, (message) => { 
                    try { 
                        const data = JSON.parse(message.body); 
                        console.log(`📨 Message received from ${topic}:`, data);
                        if (onMessageReceivedRef.current) {
                            onMessageReceivedRef.current(data); 
                        }
                    } catch (err) { 
                        console.error('❌ Error parsing WS message:', err); 
                    }
                });
                currentSubs.set(chat.id, subscription);
            }
        });

        // Unsubscribe from chats that are no longer in the list
        currentSubs.forEach((sub, chatId) => {
            if (!chats.some(c => c.id === chatId)) {
                console.log(`🔕 Unsubscribing from /topic/chat/${chatId}`);
                sub.unsubscribe();
                currentSubs.delete(chatId);
            }
        });
    }, [stompClient]);

    // Cleanup subscriptions
    const cleanupSubscriptions = useCallback(() => {
        console.log('🧹 Cleaning up all subscriptions.');
        subscriptions.current.forEach(sub => sub.unsubscribe()); 
        subscriptions.current.clear(); 
    }, []);

    return {
        stompClient,
        subscribeToChats,
        cleanupSubscriptions
    };
}; 