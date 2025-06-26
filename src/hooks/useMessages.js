import { useState, useCallback, useRef, useEffect } from 'react';

export const useMessages = (apiRequest, currentUser, activeChat) => {
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const scrollRestoreInfo = useRef({ type: 'none' });

    // Handle WebSocket message
    const handleWebSocketMessage = useCallback((wsMessage) => {
        console.log('🔔 Received WebSocket message:', wsMessage);
        console.log('🔍 Current active chat:', activeChat?.id, 'type:', typeof activeChat?.id);
        console.log('🔍 Message chat room ID:', wsMessage.chatRoomId, 'type:', typeof wsMessage.chatRoomId);
        console.log('🔍 Current user ID:', currentUser?.id);
        console.log('🔍 Message sender ID:', wsMessage.senderId);
        console.log('🔍 Message ID:', wsMessage.id, 'type:', typeof wsMessage.id);
        console.log('🔍 Full message structure:', JSON.stringify(wsMessage, null, 2));
        
        // Only process messages for the active chat
        if (activeChat?.id !== wsMessage.chatRoomId) {
            console.log('⚠️ Message not for active chat, skipping');
            return;
        }
        
        // Handle message recall notification
        if (wsMessage.type === 'MESSAGE_RECALL' || wsMessage.recalled === true || wsMessage.action === 'RECALL') {
            console.log('🔄 Processing message recall notification:', {
                type: wsMessage.type,
                recalled: wsMessage.recalled,
                action: wsMessage.action,
                id: wsMessage.id,
                messageId: wsMessage.messageId,
                recalledMessageId: wsMessage.recalledMessageId,
                payload: wsMessage.payload,
                data: wsMessage.data,
                content: wsMessage.content
            });
            
            // Handle different message ID formats that server might send
            let messageId = wsMessage.id || wsMessage.messageId || wsMessage.recalledMessageId || wsMessage.payload?.messageId || wsMessage.data?.messageId;
            
            // If no direct message ID, try to extract from content if it's a JSON string
            if (!messageId && wsMessage.content) {
                try {
                    const contentData = JSON.parse(wsMessage.content);
                    messageId = contentData.messageId || contentData.id;
                } catch (e) {
                    // Content is not JSON, ignore
                }
            }
            
            if (messageId) {
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, recalled: true }
                            : msg
                    )
                );
                console.log('✅ Message recalled successfully:', messageId);
            } else {
                console.warn('⚠️ Message recall notification missing message ID:', wsMessage);
            }
            return;
        }
        
        // Only process messages from other users (not from current user)
        if (wsMessage.senderId === currentUser?.id) {
            console.log('⚠️ Message from current user, skipping (handled by HTTP response)');
            return;
        }
        
        // Generate an ID if the message doesn't have one
        const messageId = wsMessage.id || wsMessage.messageId || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Ensure createdAt field exists and is valid
        let createdAt = wsMessage.createdAt;
        if (!createdAt) {
            createdAt = new Date().toISOString();
            console.log('🔍 Message missing createdAt, using current time:', createdAt);
        } else {
            try {
                const testDate = new Date(createdAt);
                if (isNaN(testDate.getTime())) {
                    createdAt = new Date().toISOString();
                    console.log('🔍 Message has invalid createdAt, using current time:', createdAt);
                }
            } catch (error) {
                createdAt = new Date().toISOString();
                console.log('🔍 Error parsing createdAt, using current time:', createdAt);
            }
        }
        
        const messageWithId = { ...wsMessage, id: messageId, createdAt };
        
        console.log('🔍 Generated/using message ID:', messageId);
        console.log('🔍 Message createdAt:', createdAt);
        
        // Check if this message already exists (by ID)
        const isAlreadyPresent = messages.some(m => m.id === messageId);
        if (isAlreadyPresent) {
            console.log('⚠️ Message already exists, skipping:', messageId);
            return;
        }
        
        // This is a new message from another user
        console.log('✅ Adding new message from other user:', messageId, 'from user:', wsMessage.senderId);
        console.log('🔍 New message content:', wsMessage.content);
        scrollRestoreInfo.current = { type: 'remote_received' };
        setMessages(prev => {
            const newMessages = [...prev, messageWithId];
            console.log('🔍 New messages count:', newMessages.length);
            return newMessages;
        });
    }, [activeChat?.id, currentUser?.id, messages]);

    // Select chat and load messages
    const handleSelectChat = useCallback(async (chat) => {
        if (activeChat?.id === chat.id) return;
        
        console.log('🔄 Selecting chat:', chat.id, 'from active chat:', activeChat?.id);
        scrollRestoreInfo.current = { type: 'switch' }; 
        
        setIsLoadingMessages(true);
        setMessages([]);
        setHasMoreMessages(true); // Always start with true, let API response determine
        
        try {
            // Load latest messages first (API returns newest first, so we need to reverse)
            const response = await apiRequest(`/chat/rooms/${chat.id}/messages?limit=20`);
            console.log('📥 Initial messages response:', response);
            console.log('🔍 Initial response details:', {
                hasData: !!response?.data,
                dataLength: response?.data?.length || 0,
                hasNext: response?.hasNext,
                responseKeys: response ? Object.keys(response) : []
            });
            
            if (response && response.data && response.data.length > 0) {
                const messages = Array.isArray(response.data) ? response.data.slice().reverse() : [];
                console.log('📥 Setting initial messages (reversed):', messages.length);
                setMessages(messages);
                
                // Only set hasMoreMessages to false if we have less than limit messages
                // or if API explicitly says there are no more messages
                const hasMore = response.data.length >= 20 || (response.hasNext !== false);
                setHasMoreMessages(hasMore);
                console.log('📊 Initial hasMore set to:', hasMore, 'based on response data length:', response.data.length);
            } else {
                console.log('📭 No initial messages found');
                setMessages([]);
                setHasMoreMessages(false);
            }
            
            if (chat.unreadCount > 0) {
                await apiRequest(`/chat/rooms/${chat.id}/messages/read`, { method: 'PUT' });
            }
        } catch (error) {
            console.error("❌ Failed to select chat:", error);
            setMessages([]);
            setHasMoreMessages(false);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [activeChat?.id, apiRequest]);

    // Fetch more messages
    const fetchMoreMessages = useCallback(async (chatId) => {
        if (!hasMoreMessages || isLoadingMessages) {
            console.log('🔄 Skipping fetchMoreMessages:', { hasMoreMessages, isLoadingMessages });
            return;
        }
        
        // Use ID of the oldest message as cursor
        const oldestMessageId = messages.length > 0 ? messages[0].id : null;
        console.log('🔄 Fetching more messages for chat:', chatId, 'using oldest message ID as cursor:', oldestMessageId);
        
        if (!oldestMessageId) {
            console.log('⚠️ No oldest message ID available, cannot fetch more messages');
            return;
        }
        
        setIsLoadingMessages(true);
        
        try {
            // Use direction=NEXT with cursor (oldest message ID) to get older messages
            const url = `/chat/rooms/${chatId}/messages?cursor=${oldestMessageId}&limit=50&direction=NEXT`;
            console.log('🌐 Fetching from URL:', url);
            
            const response = await apiRequest(url);
            console.log('📥 Received more messages response:', response);
            console.log('🔍 Response details:', {
                hasData: !!response?.data,
                dataLength: response?.data?.length || 0,
                hasNext: response?.hasNext,
                responseKeys: response ? Object.keys(response) : []
            });
            
            if(response && response.data && response.data.length > 0) {
                const newMessages = response.data.slice().reverse(); // Reverse to get chronological order
                console.log('📥 Adding', newMessages.length, 'older messages to the beginning');
                
                // Mark these messages as loaded from history to prevent auto-scroll
                const messagesWithHistoryFlag = newMessages.map(msg => ({
                    ...msg,
                    isFromHistory: true
                }));
                
                setMessages(prev => {
                    // Check for duplicates before adding
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNewMessages = messagesWithHistoryFlag.filter(msg => !existingIds.has(msg.id));
                    
                    if (uniqueNewMessages.length === 0) {
                        console.log('⚠️ All new messages are duplicates, not adding any');
                        return prev;
                    }
                    
                    console.log('✅ Adding', uniqueNewMessages.length, 'unique older messages');
                    return [...uniqueNewMessages, ...prev];
                });
                
                // Keep hasMoreMessages true if we got messages, only set to false if API returns empty
                // or if we got less than the limit (indicating we're at the end)
                const shouldKeepHasMore = response.data.length >= 50 && response.hasNext !== false;
                setHasMoreMessages(shouldKeepHasMore);
                console.log('📊 Updated hasMore:', shouldKeepHasMore, 'based on response data length:', response.data.length);
            } else {
                console.log('📭 No more messages available - API returned empty data');
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error("❌ Failed to fetch more messages:", error);
            // Don't set hasMoreMessages to false on error, let user retry
        } finally {
            setIsLoadingMessages(false);
        }
    }, [hasMoreMessages, isLoadingMessages, messages, apiRequest]);

    // Send message
    const handleSendMessage = useCallback(async (chatRoomId, content, messageType = 'TEXT', imageUrl = null, stompClient) => {
        console.log('📤 Sending message:', { chatRoomId, content, messageType, imageUrl });
        
        if (!stompClient || !stompClient.connected) {
            console.error("❌ Cannot send message, WebSocket not connected.");
            return;
        }
        
        scrollRestoreInfo.current = { type: 'user_sent' };
        
        // Create optimistic message (no tempId needed)
        const optimisticMessage = {
            id: null, // Will be set from HTTP response
            chatRoomId: chatRoomId,
            senderId: currentUser.id,
            senderName: currentUser.fullName,
            senderAvatar: currentUser.photos?.[0]?.url,
            content: content,
            messageType: messageType,
            imageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            isOptimistic: true // Flag to identify optimistic message
        };
        
        console.log('📝 Adding optimistic message to UI');
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            console.log('🌐 Sending message to API...');
            const response = await apiRequest('/chat/messages', { 
                method: 'POST', 
                body: { chatRoomId, content, messageType, imageUrl } 
            });
            
            console.log('✅ Message sent successfully, API response:', response);
            
            // Update optimistic message with real data from server
            if (response && response.id) {
                console.log('🔄 Updating optimistic message with server data');
                setMessages(prev => 
                    prev.map(msg => 
                        msg.isOptimistic && msg.content === content && msg.senderId === currentUser.id
                            ? { 
                                ...msg, 
                                id: response.id,
                                isOptimistic: false, // Remove optimistic flag
                                createdAt: response.createdAt || msg.createdAt,
                                // Add any other fields from server response
                                ...response
                              } 
                            : msg
                    )
                );
                console.log('✅ Optimistic message updated with real ID:', response.id);
            } else {
                console.error('❌ Server response missing message ID');
                // Mark message as error
                setMessages(prev => 
                    prev.map(msg => 
                        msg.isOptimistic && msg.content === content && msg.senderId === currentUser.id
                            ? { ...msg, isOptimistic: false, error: true }
                            : msg
                    )
                );
            }
        } catch (error) { 
            console.error("❌ Failed to send message:", error);
            // Mark optimistic message as error
            setMessages(prev => 
                prev.map(msg => 
                    msg.isOptimistic && msg.content === content && msg.senderId === currentUser.id
                        ? { ...msg, isOptimistic: false, error: true }
                        : msg
                )
            );
        }
    }, [currentUser, apiRequest]);

    // Upload image
    const handleUploadImage = useCallback(async (chatRoomId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            scrollRestoreInfo.current = { type: 'user_sent' };
            await apiRequest(`/chat/upload-image?chatRoomId=${chatRoomId}`, { method: 'POST', body: formData });
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Tải ảnh lên thất bại!");
        }
    }, [apiRequest]);

    // Recall message
    const handleRecallMessage = useCallback(async (messageId) => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, recalled: true } : msg
            )
        );
        try { 
            await apiRequest(`/chat/messages/${messageId}/recall`, { method: 'POST' }); 
        } catch (error) { 
            console.error("Failed to recall message:", error); 
        } 
    }, [apiRequest]);

    // Delete message for me
    const handleDeleteMessageForMe = useCallback(async (messageId) => {
        try { 
            await apiRequest(`/chat/messages/${messageId}/delete-for-me`, { method: 'POST' }); 
            setMessages(prev => prev.filter(m => m.id !== messageId)); 
        } catch (error) { 
            console.error("Failed to delete message:", error); 
        } 
    }, [apiRequest]);

    // Debug cursor changes
    useEffect(() => {
        console.log('📊 Messages state changed:', {
            messagesCount: messages.length,
            hasMoreMessages,
            activeChatId: activeChat?.id,
            oldestMessageId: messages.length > 0 ? messages[0].id : null
        });
    }, [messages, hasMoreMessages, activeChat?.id]);

    return {
        // State
        messages,
        hasMoreMessages,
        isLoadingMessages,
        scrollRestoreInfo,
        
        // Actions
        setMessages,
        handleWebSocketMessage,
        handleSelectChat,
        fetchMoreMessages,
        handleSendMessage,
        handleUploadImage,
        handleRecallMessage,
        handleDeleteMessageForMe
    };
}; 