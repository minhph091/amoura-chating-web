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
        fetchChatRooms,
        handleSelectChat,
        updateChatUnreadCount
    };
}; 