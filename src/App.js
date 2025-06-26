import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatList from './components/ChatList';
import ChatArea from './components/ChatArea';
import ChatWindow from './components/ChatWindow';
import MobileChatHeader from './components/MobileChatHeader';
import AppModals from './components/AppModals';
import MatchNotification from './components/MatchNotification';
import TypingIndicator from './components/TypingIndicator';

// Custom hooks
import { useAuth, useChat, useWebSocket, useProfile, useTheme, useUserStatus } from './hooks';

        // --- Main App Component ---
        function App() {
    // Custom hooks
    const { authToken, currentUser, isLoading, apiRequest, handleLoginSuccess, handleLogout } = useAuth();
    const {
        chats,
        activeChat,
        messages,
        hasMoreMessages,
        isLoadingMessages,
        scrollRestoreInfo,
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
        handleDeleteMessageForMe
    } = useChat(apiRequest, currentUser);
    
    const {
        viewedProfile,
        isSettingsModalOpen,
        zoomedImageUrl,
        handleShowProfile,
        handleShowSettings,
        handleCloseSettings,
        handleCloseProfile,
        handleZoomImage,
        handleCloseZoomedImage
    } = useProfile(currentUser, apiRequest);

    // Theme hook
    const { isDarkMode, toggleTheme } = useTheme();

    // Local state
            const [searchTerm, setSearchTerm] = useState('');
            const [isMobileView, setIsMobileView] = useState(false);
            const [matchNotification, setMatchNotification] = useState(null);
            const [typingUsers, setTypingUsers] = useState(new Map()); // Track typing users per chat
            const messagesContainerRef = useRef(null); 
            const chatWindowRef = useRef(null);
            const mobileChatAreaRef = useRef(null);

    // Handle match notification with UI
    const handleMatchNotificationWithUI = useCallback(async (matchData) => {
        console.log('💕 Match notification received with UI:', matchData);
        
        // Show notification component
        setMatchNotification(matchData);
        
        // Also process the match (add chat room)
        await handleMatchNotification(matchData);
    }, [handleMatchNotification]);

    // Handle close match notification
    const handleCloseMatchNotification = useCallback(() => {
        setMatchNotification(null);
    }, []);

    // Wrapper for handleSelectChat to focus input after chat selection
    const handleSelectChatWrapper = useCallback(async (chat) => {
        await handleSelectChat(chat);
        
        // Focus input after a short delay to ensure DOM is updated
        setTimeout(() => {
            if (isMobileView) {
                // Mobile view - focus ChatArea
                if (mobileChatAreaRef.current) {
                    mobileChatAreaRef.current.focusInput();
                    console.log('🎯 Focused input after selecting chat (mobile):', chat.id);
                }
            } else {
                // Desktop view - focus ChatWindow
                if (chatWindowRef.current) {
                    chatWindowRef.current.focusInput();
                    console.log('🎯 Focused input after selecting chat (desktop):', chat.id);
                }
            }
        }, 100);
    }, [handleSelectChat, isMobileView]);

    // Handle open chat from match notification
    const handleOpenChatFromMatch = useCallback((matchData) => {
        // Find the chat room that was just created
        const newChat = chats.find(chat => {
            // This is a simplified logic - you might need to adjust based on your API response
            return chat.user1Id !== currentUser.id && chat.user2Id !== currentUser.id;
        });
        
        if (newChat) {
            handleSelectChatWrapper(newChat);
        }
    }, [chats, currentUser, handleSelectChatWrapper]);

    // Handle typing events from WebSocket
    const handleTypingEvent = useCallback((data) => {
        console.log('📨 [TYPING] Received typing event from WebSocket:', data);
        
        if (data.type === 'TYPING') {
            const { chatRoomId, senderId, content } = data;
            const isTyping = content === 'true';
            
            console.log('🔄 [TYPING] Processing typing event:', {
                chatRoomId,
                senderId,
                content,
                isTyping,
                currentUserId: currentUser?.id,
                isFromCurrentUser: senderId === currentUser?.id
            });
            
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                if (isTyping) {
                    // Add typing user
                    const chatTypingUsers = new Set(newMap.get(chatRoomId) || []);
                    chatTypingUsers.add(senderId);
                    newMap.set(chatRoomId, chatTypingUsers);
                    console.log('➕ [TYPING] Added typing user:', {
                        chatRoomId,
                        senderId,
                        totalTypingUsers: chatTypingUsers.size
                    });
                } else {
                    // Remove typing user
                    const chatTypingUsers = new Set(newMap.get(chatRoomId) || []);
                    chatTypingUsers.delete(senderId);
                    if (chatTypingUsers.size === 0) {
                        newMap.delete(chatRoomId);
                        console.log('🗑️ [TYPING] Removed all typing users for chat:', chatRoomId);
                    } else {
                        newMap.set(chatRoomId, chatTypingUsers);
                        console.log('➖ [TYPING] Removed typing user:', {
                            chatRoomId,
                            senderId,
                            remainingTypingUsers: chatTypingUsers.size
                        });
                    }
                }
                return newMap;
            });
        } else {
            console.log('ℹ️ [TYPING] Received non-typing event:', data.type);
        }
    }, [currentUser]);

    // Enhanced WebSocket message handler to include typing events
    const handleWebSocketMessageWithTyping = useCallback((data) => {
        console.log('📨 [WS] Received WebSocket message:', {
            type: data.type,
            chatRoomId: data.chatRoomId,
            senderId: data.senderId,
            messageId: data.id
        });
        
        // Handle typing events
        if (data.type === 'TYPING') {
            console.log('⌨️ [WS] Routing to typing handler');
            handleTypingEvent(data);
        } else {
            // Handle regular messages
            console.log('💬 [WS] Routing to message handler');
            handleWebSocketMessage(data);
        }
    }, [handleWebSocketMessage, handleTypingEvent]);

    // WebSocket hook
    const { stompClient, subscribeToChats, cleanupSubscriptions, sendTypingEvent } = useWebSocket(
        authToken, 
        currentUser, 
        activeChat, 
        handleWebSocketMessageWithTyping,
        handleMatchNotificationWithUI
    );

    // User status hook
    const {
        onlineUsers,
        userStatuses,
        isUserOnline,
        getUserStatus,
        formatLastSeen,
        fetchInitialUserStatuses,
        resetUserStatuses
    } = useUserStatus(stompClient, currentUser, activeChat, apiRequest, chats);

    // Subscribe to chat topics when chats change
                useEffect(() => {
        if (stompClient && chats.length > 0) {
            console.log('🔄 Subscribing to chats after chats update');
            subscribeToChats(chats);
        }
    }, [chats, stompClient, subscribeToChats]);

    // Cleanup subscriptions on unmount
                useEffect(() => {
                    return () => {
            console.log('🧹 App unmounting, cleaning up subscriptions');
            cleanupSubscriptions();
        };
    }, [cleanupSubscriptions]);

    // Fetch chat rooms when user logs in
                useEffect(() => {
        if (currentUser && authToken) {
            fetchChatRooms();
        }
    }, [currentUser, authToken, fetchChatRooms]);

    // Periodic chat list refresh
                useEffect(() => {
        if (!currentUser || !authToken) return;
        
        const refreshChats = async () => {
            try {
                console.log('🔄 Refreshing chat list...');
                            const rooms = await apiRequest('/chat/rooms'); 
                            if (Array.isArray(rooms)) {
                                setChats(rooms.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0))); 
                    console.log('✅ Chat list refreshed:', rooms.length, 'chats');
                            }
                        } catch (error) { 
                console.error('❌ Failed to refresh chat list:', error);
            }
        };
        
        const intervalId = setInterval(refreshChats, 30000);
        return () => clearInterval(intervalId);
    }, [currentUser, authToken, apiRequest, setChats]);

    // Mobile view detection
            useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
            }, []);

    // Handlers
    const handleBackToList = () => setActiveChat(null);
    
    const handleSendMessageWrapper = useCallback((chatRoomId, content, messageType = 'TEXT', imageUrl = null) => {
        return handleSendMessage(chatRoomId, content, messageType, imageUrl, stompClient);
    }, [handleSendMessage, stompClient]);

    // Logout with cleanup
    const handleLogoutWithCleanup = useCallback(() => {
        handleLogout();
        setChats([]);
        setActiveChat(null);
        cleanupSubscriptions();
        resetUserStatuses(); // Reset user statuses on logout
    }, [handleLogout, setChats, setActiveChat, cleanupSubscriptions, resetUserStatuses]);

    // Handle typing indicator
    const handleTypingChange = useCallback((chatId, isTyping) => {
        console.log('⌨️ [TYPING] handleTypingChange called:', {
            chatId,
            isTyping,
            hasSendTypingEvent: !!sendTypingEvent,
            currentUser: currentUser?.id
        });
        
        if (sendTypingEvent) {
            console.log('📤 [TYPING] Calling sendTypingEvent...');
            sendTypingEvent(chatId, isTyping);
        } else {
            console.warn('⚠️ [TYPING] sendTypingEvent not available');
        }
    }, [sendTypingEvent, currentUser]);

    // Show loading screen while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">Đang kiểm tra đăng nhập...</p>
                </div>
            </div>
        );
    }

            if (!currentUser) {
                return <LoginScreen onLoginSuccess={handleLoginSuccess} apiRequest={apiRequest} />;
            }

            return (
                <>
            {/* Match Notification */}
            {matchNotification && (
                <MatchNotification
                    matchData={matchNotification}
                    onClose={handleCloseMatchNotification}
                    onOpenChat={handleOpenChatFromMatch}
                />
            )}
            
            {/* Modals */}
            <AppModals
                viewedProfile={viewedProfile}
                isSettingsModalOpen={isSettingsModalOpen}
                zoomedImageUrl={zoomedImageUrl}
                onCloseProfile={handleCloseProfile}
                onCloseSettings={handleCloseSettings}
                onCloseZoomedImage={handleCloseZoomedImage}
                onZoomImage={handleZoomImage}
                isUserOnline={isUserOnline}
                getUserStatus={getUserStatus}
                formatLastSeen={formatLastSeen}
                currentUser={currentUser}
            />
            
            {/* Mobile View */}
                    {isMobileView ? (
                        <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
                    {!activeChat ? (
                        <ChatList 
                            chats={chats} 
                            currentUser={currentUser} 
                            onSelectChat={handleSelectChatWrapper} 
                            activeChatId={null} 
                            searchTerm={searchTerm} 
                            onSearchChange={(e) => setSearchTerm(e.target.value)} 
                            onLogout={handleLogoutWithCleanup} 
                            onShowProfile={handleShowProfile} 
                            onShowSettings={handleShowSettings} 
                            isDarkMode={isDarkMode}
                            onToggleTheme={toggleTheme}
                            isUserOnline={isUserOnline}
                            getUserStatus={getUserStatus}
                            formatLastSeen={formatLastSeen}
                        />
                    ) : (
                        <div className="h-full w-full flex flex-col">
                            <MobileChatHeader
                                activeChat={activeChat}
                                currentUser={currentUser}
                                onBackToList={handleBackToList}
                                isUserOnline={isUserOnline}
                                getUserStatus={getUserStatus}
                                formatLastSeen={formatLastSeen}
                            />
                            <ChatArea 
                                ref={mobileChatAreaRef}
                                chat={activeChat} 
                                messages={messages} 
                                currentUser={currentUser} 
                                onSendMessage={handleSendMessageWrapper} 
                                onUploadImage={handleUploadImage} 
                                fetchMoreMessages={fetchMoreMessages} 
                                onRecall={handleRecallMessage} 
                                onDelete={handleDeleteMessageForMe} 
                                onZoomImage={handleZoomImage} 
                                containerRef={messagesContainerRef} 
                                hasMoreMessages={hasMoreMessages} 
                                isLoadingMessages={isLoadingMessages} 
                                typingUsers={typingUsers.get(activeChat?.id) || new Set()}
                                onTypingChange={handleTypingChange}
                            />
                                </div>
                            )}
                        </div>
                    ) : (
                /* Desktop View */
                        <div className="flex h-screen antialiased text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    <ChatList 
                        chats={chats} 
                        currentUser={currentUser} 
                        onSelectChat={handleSelectChatWrapper} 
                        activeChatId={activeChat?.id} 
                        searchTerm={searchTerm} 
                        onSearchChange={(e) => setSearchTerm(e.target.value)} 
                        onLogout={handleLogoutWithCleanup} 
                        onShowProfile={handleShowProfile} 
                        onShowSettings={handleShowSettings} 
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        isUserOnline={isUserOnline}
                        getUserStatus={getUserStatus}
                        formatLastSeen={formatLastSeen}
                    />
                    <ChatWindow 
                        ref={chatWindowRef}
                        chat={activeChat} 
                        messages={messages} 
                        currentUser={currentUser} 
                        onSendMessage={handleSendMessageWrapper} 
                        onUploadImage={handleUploadImage} 
                        fetchMoreMessages={fetchMoreMessages} 
                        onRecall={handleRecallMessage} 
                        onDelete={handleDeleteMessageForMe} 
                        onZoomImage={handleZoomImage} 
                        onShowProfile={handleShowProfile} 
                        messagesContainerRef={messagesContainerRef} 
                        hasMoreMessages={hasMoreMessages} 
                        isLoadingMessages={isLoadingMessages} 
                        isDarkMode={isDarkMode}
                        isUserOnline={isUserOnline}
                        getUserStatus={getUserStatus}
                        formatLastSeen={formatLastSeen}
                        typingUsers={typingUsers.get(activeChat?.id) || new Set()}
                        onTypingChange={handleTypingChange}
                    />
                        </div>
                    )}
                </>
            );
        }

export default App;