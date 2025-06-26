import { useCallback } from 'react';
import { useMessages } from './useMessages';
import { useChatRooms } from './useChatRooms';

export const useChat = (apiRequest, currentUser) => {
    // Use the separated hooks
    const {
        chats,
        activeChat,
        setChats,
        setActiveChat,
        handleWebSocketMessageForChats,
        handleMatchNotification,
        fetchChatRooms,
        handleSelectChat: handleSelectChatRoom,
        updateChatUnreadCount
    } = useChatRooms(apiRequest, currentUser);

    const {
        messages,
        hasMoreMessages,
        isLoadingMessages,
        scrollRestoreInfo,
        setMessages,
        handleWebSocketMessage: handleWebSocketMessageForMessages,
        handleSelectChat: handleSelectChatForMessages,
        fetchMoreMessages,
        handleSendMessage,
        handleUploadImage,
        handleRecallMessage,
        handleDeleteMessageForMe
    } = useMessages(apiRequest, currentUser, activeChat);

    // Combined WebSocket message handler
    const handleWebSocketMessage = useCallback((wsMessage) => {
        console.log('🔔 Combined WebSocket message handler called');
        console.log('🔍 Message details:', {
            id: wsMessage.id,
            tempId: wsMessage.tempId,
            chatRoomId: wsMessage.chatRoomId,
            senderId: wsMessage.senderId,
            content: wsMessage.content?.substring(0, 50)
        });
        
        // Update chat list (this should always happen for new messages)
        handleWebSocketMessageForChats(wsMessage, activeChat, currentUser);
        
        // Update messages (this handles the actual message display)
        handleWebSocketMessageForMessages(wsMessage);
    }, [handleWebSocketMessageForChats, handleWebSocketMessageForMessages, activeChat, currentUser]);

    // Combined select chat handler
    const handleSelectChat = useCallback(async (chat) => {
        // Update active chat
        await handleSelectChatRoom(chat);
        
        // Load messages for the selected chat
        await handleSelectChatForMessages(chat);
    }, [handleSelectChatRoom, handleSelectChatForMessages]);

    return {
        // State
        chats,
        activeChat,
        messages,
        hasMoreMessages,
        isLoadingMessages,
        scrollRestoreInfo,
        
        // Actions
        setChats,
        setActiveChat,
        setMessages,
        handleWebSocketMessage,
        handleMatchNotification,
        fetchChatRooms,
        handleSelectChat,
        fetchMoreMessages,
        handleSendMessage,
        handleUploadImage,
        handleRecallMessage,
        handleDeleteMessageForMe,
        updateChatUnreadCount
    };
}; 