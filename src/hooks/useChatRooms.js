import { useState, useCallback } from 'react';

export const useChatRooms = (apiRequest, currentUser) => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);

    // Handle WebSocket message for chat list updates
    const handleWebSocketMessageForChats = useCallback((wsMessage, activeChat, currentUser) => {
        console.log('🔔 Updating chat list with WebSocket message:', wsMessage);
        
        setChats(prevChats => {
            const chatToUpdateIndex = prevChats.findIndex(c => Number(c.id) === Number(wsMessage.chatRoomId));
            if (chatToUpdateIndex === -1) {
                console.log('❌ Chat room not found in current chats:', wsMessage.chatRoomId);
                console.log('🔍 Available chat IDs:', prevChats.map(c => c.id));
                return prevChats;
            }

            const chatToUpdate = prevChats[chatToUpdateIndex];
            const isChatActive = Number(activeChat?.id) === Number(wsMessage.chatRoomId);
            
            const updatedChat = {
                ...chatToUpdate,
                lastMessage: wsMessage,
                unreadCount: !isChatActive && wsMessage.senderId !== currentUser.id
                    ? (chatToUpdate.unreadCount || 0) + 1
                    : (isChatActive ? 0 : chatToUpdate.unreadCount),
            };
            
            const otherChats = prevChats.filter(c => Number(c.id) !== Number(wsMessage.chatRoomId));
            const newChats = [updatedChat, ...otherChats];
            console.log('✅ Updated chats list:', newChats.length, 'chats');
            return newChats;
        });
    }, []);

    // Handle match notification and create new chat room
    const handleMatchNotification = useCallback(async (matchData) => {
        try {
            console.log('💕 Processing match notification:', matchData);
            
            // Extract match information
            const matchId = matchData.relatedEntityId;
            const matchType = matchData.relatedEntityType;
            
            if (matchType !== 'MATCH' || !matchId) {
                console.log('⚠️ Invalid match data, skipping chat room creation');
                return;
            }

            // Fetch the new chat room details
            console.log('🔄 Fetching new chat room for match:', matchId);
            const newChatRoom = await apiRequest(`/matches/${matchId}/chat-room`);
            
            if (newChatRoom && newChatRoom.id) {
                console.log('✅ New chat room fetched:', newChatRoom);
                
                // Add the new chat room to the beginning of the list
                setChats(prevChats => {
                    // Check if chat room already exists
                    const existingChat = prevChats.find(c => Number(c.id) === Number(newChatRoom.id));
                    if (existingChat) {
                        console.log('⚠️ Chat room already exists, updating instead');
                        return prevChats.map(c => 
                            Number(c.id) === Number(newChatRoom.id) 
                                ? { ...c, ...newChatRoom }
                                : c
                        );
                    }
                    
                    // Add new chat room at the beginning
                    const updatedChats = [newChatRoom, ...prevChats];
                    console.log('✅ Added new chat room to list:', updatedChats.length, 'total chats');
                    return updatedChats;
                });

                // Show success notification
                const matchedUsername = matchData.content?.split(' have matched')[0]?.split('You and ')[1] || 'someone';
                console.log(`🎉 Successfully created chat room with ${matchedUsername}!`);
                
                // Optional: Auto-select the new chat room
                // setActiveChat(newChatRoom);
                
            } else {
                console.error('❌ Failed to fetch new chat room details');
            }
            
        } catch (error) {
            console.error('❌ Error processing match notification:', error);
            
            // Fallback: try to fetch all chat rooms to get the latest
            try {
                console.log('🔄 Fallback: fetching all chat rooms...');
                const allRooms = await apiRequest('/chat/rooms');
                if (Array.isArray(allRooms)) {
                    setChats(allRooms.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)));
                    console.log('✅ Updated chat list via fallback');
                }
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError);
            }
        }
    }, [apiRequest]);

    // Fetch chat rooms
    const fetchChatRooms = useCallback(async () => {
        try {
            console.log('🔄 Fetching chat rooms...');
            const rooms = await apiRequest('/chat/rooms');
            if (Array.isArray(rooms)) {
                setChats(rooms.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)));
                console.log('✅ Chat rooms fetched:', rooms.length, 'chats');
            } else {
                setChats([]);
            }
        } catch (error) {
            console.error('❌ Failed to fetch chat rooms:', error);
            setChats([]);
        }
    }, [apiRequest]);

    // Select chat
    const handleSelectChat = useCallback(async (chat) => {
        if (activeChat?.id === chat.id) return;
        
        setActiveChat(chat);
        
        // Mark messages as read
        if (chat.unreadCount > 0) {
            try {
                await apiRequest(`/chat/rooms/${chat.id}/messages/read`, { method: 'PUT' });
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
            } catch (error) {
                console.error("Failed to mark messages as read:", error);
            }
        }
    }, [activeChat?.id, apiRequest]);

    // Update chat unread count
    const updateChatUnreadCount = useCallback((chatId, unreadCount) => {
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, unreadCount } : c));
    }, []);

    return {
        // State
        chats,
        activeChat,
        
        // Actions
        setChats,
        setActiveChat,
        handleWebSocketMessageForChats,
        handleMatchNotification,
        fetchChatRooms,
        handleSelectChat,
        updateChatUnreadCount
    };
}; 