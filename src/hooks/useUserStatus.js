import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '../config';

export const useUserStatus = (stompClient, currentUser, activeChat, apiRequest, chats = []) => {
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [userStatuses, setUserStatuses] = useState(new Map()); // userId -> { status, lastSeen }

    // Subscribe to user status updates for ALL chat rooms
    useEffect(() => {
        if (!stompClient || !stompClient.connected || !chats || chats.length === 0) {
            return;
        }

        console.log(`🔔 Subscribing to user status updates for ${chats.length} chat rooms`);
        const statusSubscriptions = [];

        // Subscribe to user status updates for each chat room
        chats.forEach(chat => {
            const statusTopic = `/topic/chat/${chat.id}/user-status`;
            console.log(`🔔 Subscribing to user status updates: ${statusTopic}`);

            const statusSubscription = stompClient.subscribe(statusTopic, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log('👤 User status update received:', data);
                    
                    setUserStatuses(prev => {
                        const newStatuses = new Map(prev);
                        newStatuses.set(data.userId, {
                            status: data.status,
                            lastSeen: data.lastSeen || new Date().toISOString(),
                            timestamp: new Date().toISOString()
                        });
                        return newStatuses;
                    });

                    setOnlineUsers(prev => {
                        const newOnlineUsers = new Set(prev);
                        if (data.status === 'ONLINE') {
                            newOnlineUsers.add(data.userId);
                        } else {
                            newOnlineUsers.delete(data.userId);
                        }
                        return newOnlineUsers;
                    });
                } catch (err) {
                    console.error('❌ Error parsing user status message:', err);
                }
            });

            statusSubscriptions.push(statusSubscription);
        });

        return () => {
            console.log('🔕 Unsubscribing from all user status updates');
            statusSubscriptions.forEach(subscription => {
                subscription.unsubscribe();
            });
        };
    }, [stompClient, chats]);

    // Subscribe to personal user status updates (for current user)
    useEffect(() => {
        if (!stompClient || !stompClient.connected || !currentUser) {
            return;
        }

        const personalStatusTopic = `/topic/user/${currentUser.id}/status`;
        console.log(`🔔 Subscribing to personal status updates: ${personalStatusTopic}`);

        const personalStatusSubscription = stompClient.subscribe(personalStatusTopic, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('👤 Personal status update received:', data);
                
                setUserStatuses(prev => {
                    const newStatuses = new Map(prev);
                    newStatuses.set(currentUser.id, {
                        status: data.status,
                        lastSeen: data.lastSeen || new Date().toISOString(),
                        timestamp: new Date().toISOString()
                    });
                    return newStatuses;
                });

                setOnlineUsers(prev => {
                    const newOnlineUsers = new Set(prev);
                    if (data.status === 'ONLINE') {
                        newOnlineUsers.add(currentUser.id);
                    } else {
                        newOnlineUsers.delete(currentUser.id);
                    }
                    return newOnlineUsers;
                });
            } catch (err) {
                console.error('❌ Error parsing personal status message:', err);
            }
        });

        return () => {
            console.log('🔕 Unsubscribing from personal status updates');
            personalStatusSubscription.unsubscribe();
        };
    }, [stompClient, currentUser]);

    // Fetch initial online statuses for chat members
    const fetchInitialUserStatuses = useCallback(async () => {
        if (!chats || chats.length === 0 || !currentUser) return;

        try {
            console.log('🔄 Fetching initial user statuses for all chats...');
            
            // Get all unique user IDs from chats (excluding current user)
            const userIds = new Set();
            chats.forEach(chat => {
                if (chat.user1Id && chat.user1Id !== currentUser.id) {
                    userIds.add(chat.user1Id);
                }
                if (chat.user2Id && chat.user2Id !== currentUser.id) {
                    userIds.add(chat.user2Id);
                }
            });

            console.log('👥 Users to fetch initial status for:', Array.from(userIds));

            // Fetch status for each user
            for (const userId of userIds) {
                try {
                    const response = await apiRequest(`/users/${userId}/online`);
                    const isOnline = response === true; // API returns boolean

                    console.log(`👤 Initial status for user ${userId}:`, isOnline ? 'ONLINE' : 'OFFLINE');

                    setUserStatuses(prev => {
                        const newStatuses = new Map(prev);
                        newStatuses.set(userId, {
                            status: isOnline ? 'ONLINE' : 'OFFLINE',
                            lastSeen: null,
                            timestamp: new Date().toISOString()
                        });
                        return newStatuses;
                    });

                    setOnlineUsers(prev => {
                        const newOnlineUsers = new Set(prev);
                        if (isOnline) {
                            newOnlineUsers.add(userId);
                        } else {
                            newOnlineUsers.delete(userId);
                        }
                        return newOnlineUsers;
                    });
                } catch (error) {
                    console.error(`❌ Failed to fetch initial status for user ${userId}:`, error);
                    // Set default offline status on error
                    setUserStatuses(prev => {
                        const newStatuses = new Map(prev);
                        newStatuses.set(userId, {
                            status: 'OFFLINE',
                            lastSeen: null,
                            timestamp: new Date().toISOString()
                        });
                        return newStatuses;
                    });
                }
            }
        } catch (error) {
            console.error('❌ Failed to fetch initial user statuses:', error);
        }
    }, [chats, currentUser, apiRequest]);

    // Fetch current user's own status (always available)
    const fetchCurrentUserStatus = useCallback(async () => {
        if (!currentUser) return;

        try {
            console.log('🔄 Fetching current user status for:', currentUser.id);
            
            // Fetch online status for current user
            const response = await apiRequest(`/users/${currentUser.id}/online`);
            const isOnline = response === true; // API returns boolean

            console.log(`👤 Current user status:`, isOnline ? 'ONLINE' : 'OFFLINE');

            setUserStatuses(prev => {
                const newStatuses = new Map(prev);
                newStatuses.set(currentUser.id, {
                    status: isOnline ? 'ONLINE' : 'OFFLINE',
                    lastSeen: null,
                    timestamp: new Date().toISOString()
                });
                return newStatuses;
            });

            setOnlineUsers(prev => {
                const newOnlineUsers = new Set(prev);
                if (isOnline) {
                    newOnlineUsers.add(currentUser.id);
                } else {
                    newOnlineUsers.delete(currentUser.id);
                }
                return newOnlineUsers;
            });
        } catch (error) {
            console.error('❌ Failed to fetch current user status:', error);
            // Set default online status for current user (since they're using the app)
            setUserStatuses(prev => {
                const newStatuses = new Map(prev);
                newStatuses.set(currentUser.id, {
                    status: 'ONLINE',
                    lastSeen: null,
                    timestamp: new Date().toISOString()
                });
                return newStatuses;
            });

            setOnlineUsers(prev => {
                const newOnlineUsers = new Set(prev);
                newOnlineUsers.add(currentUser.id);
                return newOnlineUsers;
            });
        }
    }, [currentUser, apiRequest]);

    // Reset user statuses (for logout)
    const resetUserStatuses = useCallback(() => {
        console.log('🔄 Resetting user statuses...');
        setOnlineUsers(new Set());
        setUserStatuses(new Map());
    }, []);

    // Initialize user statuses (for login)
    const initializeUserStatuses = useCallback(async () => {
        if (!currentUser) return;
        
        console.log('🔄 Initializing user statuses for user:', currentUser.id);
        
        // Always fetch current user status first
        await fetchCurrentUserStatus();
        
        // Then fetch initial statuses for all chat users if chats are available
        if (chats && chats.length > 0) {
            await fetchInitialUserStatuses();
        }
    }, [currentUser, chats, fetchCurrentUserStatus, fetchInitialUserStatuses]);

    // Fetch initial statuses when chats change
    useEffect(() => {
        fetchInitialUserStatuses();
    }, [fetchInitialUserStatuses]);

    // Fetch current user status when user changes or on mount
    useEffect(() => {
        fetchCurrentUserStatus();
    }, [fetchCurrentUserStatus]);

    // Initialize statuses when user logs in
    useEffect(() => {
        if (currentUser) {
            initializeUserStatuses();
        }
    }, [currentUser, initializeUserStatuses]);

    // Helper function to check if a user is online
    const isUserOnline = useCallback((userId) => {
        // If checking current user and no status is set, assume online
        if (userId === currentUser?.id && !userStatuses.has(userId)) {
            return true;
        }
        return onlineUsers.has(userId);
    }, [onlineUsers, currentUser, userStatuses]);

    // Helper function to get user status details
    const getUserStatus = useCallback((userId) => {
        // If checking current user and no status is set, return online status
        if (userId === currentUser?.id && !userStatuses.has(userId)) {
            return { status: 'ONLINE', lastSeen: null };
        }
        return userStatuses.get(userId) || { status: 'OFFLINE', lastSeen: null };
    }, [userStatuses, currentUser]);

    // Helper function to format last seen time
    const formatLastSeen = useCallback((lastSeen) => {
        if (!lastSeen) return null;
        
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        
        return lastSeenDate.toLocaleDateString('vi-VN');
    }, []);

    return {
        onlineUsers,
        userStatuses,
        isUserOnline,
        getUserStatus,
        formatLastSeen,
        fetchInitialUserStatuses,
        fetchCurrentUserStatus,
        resetUserStatuses,
        initializeUserStatuses
    };
}; 