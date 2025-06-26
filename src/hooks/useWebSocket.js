import { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '../config';

const WS_URL = API_CONFIG.WS_URL;

export const useWebSocket = (authToken, currentUser, activeChat, onMessageReceived, onMatchNotification) => {
    const [stompClient, setStompClient] = useState(null);
    const [isStompReady, setIsStompReady] = useState(false);
    const subscriptions = useRef(new Map());
    const onMessageReceivedRef = useRef(onMessageReceived);
    const onMatchNotificationRef = useRef(onMatchNotification);

    // Update the refs when callbacks change
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        onMatchNotificationRef.current = onMatchNotification;
    }, [onMatchNotification]);

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

    // Subscribe to personal notifications (including match notifications)
    useEffect(() => {
        if (!stompClient || !stompClient.connected || !currentUser) return;
        
        // Subscribe to user-specific notification queue (recommended approach)
        const userNotificationTopic = `/user/queue/notification`;
        console.log(`🔔 Subscribing to user notifications: ${userNotificationTopic}`);
        
        const userNotificationSubscription = stompClient.subscribe(userNotificationTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('🔔 User notification received:', data);
                
                if (data.type === 'MATCH') {
                    console.log('💕 Match notification received:', data);
                    
                    // Call the match notification handler
                    if (onMatchNotificationRef.current) {
                        onMatchNotificationRef.current(data);
                    } else {
                        // Fallback to alert if no handler provided
                        const matchedUsername = data.content?.split(' have matched')[0]?.split('You and ')[1] || 'someone';
                        alert(`Bạn đã match với ${matchedUsername}!`);
                    }
                }
            } catch (err) {
                console.error('❌ Error parsing user notification message:', err);
            }
        });

        // Also subscribe to topic-based notifications (fallback)
        const topicNotificationTopic = `/topic/notification/${currentUser.id}`;
        console.log(`🔔 Subscribing to topic notifications: ${topicNotificationTopic}`);
        
        const topicNotificationSubscription = stompClient.subscribe(topicNotificationTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('🔔 Topic notification received:', data);
                
                if (data.type === 'MATCH') {
                    console.log('💕 Match notification received (topic):', data);
                    
                    // Call the match notification handler
                    if (onMatchNotificationRef.current) {
                        onMatchNotificationRef.current(data);
                    } else {
                        // Fallback to alert if no handler provided
                        const matchedUsername = data.matchedUsername || data.content?.split(' have matched')[0]?.split('You and ')[1] || 'someone';
                        alert(`Bạn đã match với ${matchedUsername}!`);
                    }
                }
            } catch (err) {
                console.error('❌ Error parsing topic notification message:', err);
            }
        });
        
        return () => {
            console.log('🔕 Unsubscribing from notifications');
            userNotificationSubscription.unsubscribe();
            topicNotificationSubscription.unsubscribe();
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

    // Send typing indicator
    const sendTypingEvent = useCallback((chatRoomId, typing) => {
        console.log('⌨️ [TYPING] Attempting to send typing event:', {
            chatRoomId,
            typing,
            hasStompClient: !!stompClient,
            isConnected: stompClient?.connected,
            stompClientState: stompClient ? {
                active: stompClient.active,
                connected: stompClient.connected,
                readyState: stompClient.webSocket?.readyState,
                availableMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(stompClient)).filter(name => typeof stompClient[name] === 'function')
            } : 'No stompClient'
        });
        
        if (!stompClient || !stompClient.connected) {
            console.error('❌ [TYPING] WebSocket not connected, cannot send typing event');
            return;
        }
        
        const typingMessage = {
            chatRoomId: chatRoomId,
            typing: typing
        };
        
        console.log('📤 [TYPING] Sending typing event to backend:', typingMessage);
        console.log('🔍 [TYPING] StompClient methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(stompClient)));
        
        try {
            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify(typingMessage)
            });
            console.log('✅ [TYPING] Typing event sent successfully');
        } catch (error) {
            console.error('❌ [TYPING] Failed to send typing event:', error);
            console.error('❌ [TYPING] Error details:', {
                error: error.message,
                stack: error.stack,
                stompClientType: typeof stompClient,
                stompClientMethods: stompClient ? Object.getOwnPropertyNames(Object.getPrototypeOf(stompClient)) : 'No stompClient'
            });
        }
    }, [stompClient]);

    return {
        stompClient,
        subscribeToChats,
        cleanupSubscriptions,
        sendTypingEvent
    };
}; 