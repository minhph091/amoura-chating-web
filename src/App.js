import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatList from './components/ChatList';
import ChatArea from './components/ChatArea';
import ChatWindow from './components/ChatWindow';
import MobileChatHeader from './components/MobileChatHeader';
import AppModals from './components/AppModals';

// Custom hooks
import { useAuth, useChat, useWebSocket, useProfile, useTheme } from './hooks';

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
        handleWebSocketMessage,
        fetchChatRooms,
        handleSelectChat,
        fetchMoreMessages,
        handleSendMessage,
        handleUploadImage,
        handleRecallMessage,
        handleDeleteMessageForMe,
        setMessages
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
            const messagesContainerRef = useRef(null); 
            const chatWindowRef = useRef(null);
            const mobileChatAreaRef = useRef(null);

    // WebSocket hook
    const { stompClient, subscribeToChats, cleanupSubscriptions } = useWebSocket(
        authToken, 
        currentUser, 
        activeChat, 
        handleWebSocketMessage
    );

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
    
    const handleSendMessageWrapper = useCallback((chatRoomId, content, messageType = 'TEXT', imageUrl = null) => {
        return handleSendMessage(chatRoomId, content, messageType, imageUrl, stompClient);
    }, [handleSendMessage, stompClient]);

    // Logout with cleanup
    const handleLogoutWithCleanup = useCallback(() => {
        handleLogout();
        setChats([]);
        setActiveChat(null);
        cleanupSubscriptions();
    }, [handleLogout, setChats, setActiveChat, cleanupSubscriptions]);

    // Test WebSocket connection (for debugging)
    const testWebSocketConnection = useCallback(() => {
        console.log('🧪 Testing WebSocket connection...');
        console.log('🔍 StompClient:', stompClient);
        console.log('🔍 Is connected:', stompClient?.connected);
        console.log('🔍 Current chats:', chats);
        console.log('🔍 Active chat:', activeChat);
        console.log('🔍 Current messages:', messages.length);
        
        if (stompClient && stompClient.connected) {
            console.log('✅ WebSocket is connected and ready');
        } else {
            console.log('❌ WebSocket is not connected');
        }
    }, [stompClient, chats, activeChat, messages]);

    // Test adding a message (for debugging)
    const testAddMessage = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
            return;
        }
        
        console.log('🧪 Testing message addition...');
        console.log('🔍 Active chat details:', {
            id: activeChat.id,
            type: typeof activeChat.id,
            user1Id: activeChat.user1Id,
            user2Id: activeChat.user2Id
        });
        
        const testMessage = {
            id: `test_${Date.now()}`,
            chatRoomId: activeChat.id,
            senderId: currentUser.id + 1, // Different user
            senderName: 'Test User',
            content: `Test message at ${new Date().toLocaleTimeString()}`,
            messageType: 'TEXT',
            createdAt: new Date().toISOString()
        };
        
        console.log('🔍 Test message:', testMessage);
        console.log('🔍 Current messages before test:', messages.length);
        handleWebSocketMessage(testMessage);
    }, [activeChat, currentUser, handleWebSocketMessage, messages.length]);

    // Test direct message state update (for debugging)
    const testDirectMessageUpdate = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
                    return;
                }
                
        console.log('🧪 Testing direct message state update...');
        console.log('🔍 Current messages count:', messages.length);
        
        // Directly update messages state to test if the issue is in WebSocket handling
        const testMessage = {
            id: `direct_test_${Date.now()}`,
            chatRoomId: activeChat.id,
            senderId: currentUser.id + 1,
            senderName: 'Direct Test User',
            content: `Direct test message at ${new Date().toLocaleTimeString()}`,
            messageType: 'TEXT',
            createdAt: new Date().toISOString()
        };
        
        console.log('🔍 Direct test message:', testMessage);
        
        // This will bypass WebSocket handling and directly test message state
        setMessages(prev => {
            console.log('🔍 Previous messages count:', prev.length);
            const newMessages = [...prev, testMessage];
            console.log('🔍 New messages count:', newMessages.length);
            return newMessages;
        });
    }, [activeChat, currentUser, messages.length, setMessages]);

    // Test sending a message (for debugging)
    const testSendMessage = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
            return;
        }
        
        console.log('🧪 Testing send message...');
        console.log('🔍 Current messages count:', messages.length);
        
        const testContent = `Test send message at ${new Date().toLocaleTimeString()}`;
        console.log('🔍 Test content:', testContent);
        
        // Use the actual send message function
        handleSendMessageWrapper(activeChat.id, testContent, 'TEXT');
    }, [activeChat, currentUser, messages.length, handleSendMessageWrapper]);

    // Test infinite scroll (for debugging)
    const testInfiniteScroll = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
            return;
        }
        
        console.log('🧪 Testing infinite scroll...');
        console.log('🔍 Current state:', {
            messagesCount: messages.length,
            hasMoreMessages,
            isLoadingMessages,
            cursor: 'Check useMessages hook for cursor'
        });
        
        // Manually trigger fetchMoreMessages
        console.log('🚀 Manually triggering fetchMoreMessages...');
        fetchMoreMessages(activeChat.id);
    }, [activeChat, messages.length, hasMoreMessages, isLoadingMessages, fetchMoreMessages]);

    // Test scroll position and infinite scroll (for debugging)
    const testScrollPosition = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
            return;
        }
        
        const container = messagesContainerRef.current;
        if (!container) {
            console.log('❌ No messages container found');
            return;
        }
        
        console.log('🧪 Testing scroll position...');
        console.log('🔍 Scroll info:', {
            scrollTop: container.scrollTop,
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
            isAtTop: container.scrollTop <= 100
        });
        
        // If near top, trigger fetch manually
        if (container.scrollTop <= 100 && hasMoreMessages && !isLoadingMessages) {
            console.log('🚀 Near top, manually triggering fetchMoreMessages...');
            fetchMoreMessages(activeChat.id);
        } else {
            console.log('⚠️ Not near top or cannot fetch:', {
                nearTop: container.scrollTop <= 100,
                hasMoreMessages,
                isLoadingMessages
            });
        }
    }, [activeChat, hasMoreMessages, isLoadingMessages, fetchMoreMessages]);

    // Test force load older messages (for debugging)
    const testForceLoadOlder = useCallback(() => {
        if (!activeChat) {
            console.log('❌ No active chat to test with');
            return;
        }
        
        console.log('🧪 Force loading older messages...');
        console.log('🔍 Current state:', {
            messagesCount: messages.length,
            hasMoreMessages,
            isLoadingMessages,
            oldestMessageId: messages.length > 0 ? messages[0].id : null,
            oldestMessageTime: messages.length > 0 ? new Date(messages[0].createdAt).toLocaleTimeString() : null
        });
        
        // Force set hasMoreMessages to true and trigger fetch
        console.log('🚀 Forcing hasMoreMessages to true and triggering fetch...');
        fetchMoreMessages(activeChat.id);
    }, [activeChat, messages, hasMoreMessages, isLoadingMessages, fetchMoreMessages]);

    // Add test functions to window for debugging
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.testWebSocket = testWebSocketConnection;
            window.testAddMessage = testAddMessage;
            window.testDirectMessageUpdate = testDirectMessageUpdate;
            window.testSendMessage = testSendMessage;
            window.testInfiniteScroll = testInfiniteScroll;
            window.testScrollPosition = testScrollPosition;
            window.testForceLoadOlder = testForceLoadOlder;
            console.log('🧪 Test functions added:');
            console.log('  - window.testWebSocket() - Test WebSocket connection');
            console.log('  - window.testAddMessage() - Test adding a message');
            console.log('  - window.testDirectMessageUpdate() - Test direct message state update');
            console.log('  - window.testSendMessage() - Test sending a message');
            console.log('  - window.testInfiniteScroll() - Test infinite scroll');
            console.log('  - window.testScrollPosition() - Test scroll position and trigger');
            console.log('  - window.testForceLoadOlder() - Force load older messages');
        }
    }, [testWebSocketConnection, testAddMessage, testDirectMessageUpdate, testSendMessage, testInfiniteScroll, testScrollPosition, testForceLoadOlder]);

    // Log messages changes for debugging
    useEffect(() => {
        console.log('📱 App.js messages state changed:', {
            messagesCount: messages.length,
            activeChatId: activeChat?.id,
            messages: messages.map(m => ({ id: m.id, tempId: m.tempId, content: m.content?.substring(0, 30), senderId: m.senderId }))
        });
    }, [messages, activeChat?.id]);

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
            {/* Modals */}
            <AppModals
                viewedProfile={viewedProfile}
                isSettingsModalOpen={isSettingsModalOpen}
                zoomedImageUrl={zoomedImageUrl}
                onCloseProfile={handleCloseProfile}
                onCloseSettings={handleCloseSettings}
                onCloseZoomedImage={handleCloseZoomedImage}
                onZoomImage={handleZoomImage}
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
                        />
                    ) : (
                        <div className="h-full w-full flex flex-col">
                            <MobileChatHeader
                                activeChat={activeChat}
                                currentUser={currentUser}
                                onBackToList={handleBackToList}
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
                    />
                        </div>
                    )}
                </>
            );
        }

export default App;