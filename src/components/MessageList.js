import React, { useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ 
    messages, 
    currentUser, 
    onRecall, 
    onDelete, 
    onZoomImage, 
    containerRef, 
    hasMoreMessages, 
    isLoadingMessages, 
    fetchMoreMessages, 
    chatId 
}) => {
    const messagesStartRef = useRef(null);
    const observerRef = useRef(null);
    const lastFetchTimeRef = useRef(0);
    const previousMessagesCountRef = useRef(0);
    const scrollRestoreRef = useRef(null);
    const isRestoringScrollRef = useRef(false);
    
    // Debug logging for messages
    useEffect(() => {
        console.log('🎯 MessageList received messages update:', {
            chatId: chatId,
            messagesCount: messages.length,
            previousCount: previousMessagesCountRef.current,
            messages: messages.map(m => ({ id: m.id, tempId: m.tempId, content: m.content?.substring(0, 50), senderId: m.senderId }))
        });
        
        // Check if messages were added to the beginning (loading older messages)
        const currentCount = messages.length;
        const previousCount = previousMessagesCountRef.current;
        
        if (currentCount > previousCount && previousCount > 0) {
            const addedCount = currentCount - previousCount;
            console.log('📥 Detected', addedCount, 'messages added to beginning');
            
            // Check if any of the new messages are from history
            const newMessages = messages.slice(0, addedCount);
            const hasHistoryMessages = newMessages.some(msg => msg.isFromHistory);
            
            if (hasHistoryMessages) {
                console.log('📥 History messages detected, will restore scroll position');
                
                // Store scroll position before DOM update
                if (containerRef?.current) {
                    const container = containerRef.current;
                    const oldScrollHeight = container.scrollHeight;
                    const oldScrollTop = container.scrollTop;
                    
                    scrollRestoreRef.current = {
                        oldScrollHeight,
                        oldScrollTop,
                        addedCount,
                        timestamp: Date.now()
                    };
                    
                    console.log('📜 Stored scroll position for restoration:', {
                        oldScrollHeight,
                        oldScrollTop,
                        addedCount,
                        timestamp: scrollRestoreRef.current.timestamp
                    });
                }
            } else {
                console.log('📥 No history messages, allowing auto-scroll');
            }
        }
        
        previousMessagesCountRef.current = currentCount;
    }, [messages, chatId, containerRef]);

    // Restore scroll position after DOM update
    useEffect(() => {
        if (scrollRestoreRef.current && containerRef?.current) {
            const { oldScrollHeight, oldScrollTop, addedCount, timestamp } = scrollRestoreRef.current;
            const container = containerRef.current;
            
            // Mark that we're restoring scroll to prevent auto-scroll
            isRestoringScrollRef.current = true;
            
            // Use requestAnimationFrame to ensure DOM is fully updated
            requestAnimationFrame(() => {
                const newScrollHeight = container.scrollHeight;
                const heightDifference = newScrollHeight - oldScrollHeight;
                
                // Calculate new scroll position
                const newScrollTop = oldScrollTop + heightDifference;
                
                console.log('📜 Restoring scroll position:', {
                    oldScrollTop,
                    newScrollTop,
                    heightDifference,
                    oldScrollHeight,
                    newScrollHeight,
                    timestamp
                });
                
                // Set the new scroll position
                container.scrollTop = newScrollTop;
                
                // Clear the restore info
                scrollRestoreRef.current = null;
                
                // Reset the restoring flag after a short delay
                setTimeout(() => {
                    isRestoringScrollRef.current = false;
                    console.log('📜 Scroll restoration completed');
                }, 100);
            });
        }
    }, [messages, containerRef]);

    // Handle intersection
    const handleIntersection = useCallback((entries) => {
        entries.forEach(entry => {
            console.log('👁️ Intersection detected:', {
                isIntersecting: entry.isIntersecting,
                target: entry.target,
                hasMoreMessages,
                isLoadingMessages,
                isRestoring: isRestoringScrollRef.current,
                scrollTop: containerRef?.current?.scrollTop,
                scrollHeight: containerRef?.current?.scrollHeight,
                clientHeight: containerRef?.current?.clientHeight
            });
            
            if (entry.isIntersecting && hasMoreMessages && !isLoadingMessages && !isRestoringScrollRef.current) {
                // Add debouncing to prevent multiple rapid calls
                const now = Date.now();
                if (now - lastFetchTimeRef.current > 1000) { // 1 second debounce
                    console.log('🚀 Triggering fetchMoreMessages from intersection');
                    lastFetchTimeRef.current = now;
                    fetchMoreMessages(chatId);
                } else {
                    console.log('⏱️ Debouncing fetchMoreMessages call');
                }
            } else if (isRestoringScrollRef.current) {
                console.log('⏸️ Skipping fetchMoreMessages - scroll restoration in progress');
            }
        });
    }, [fetchMoreMessages, chatId, hasMoreMessages, isLoadingMessages, containerRef]);

    // Setup intersection observer
    useEffect(() => {
        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new observer
        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: 0.1,
            rootMargin: '800px' // Increased margin to trigger earlier, matching 50% scroll logic
        });

        // Observe the loader element - always observe if we have messages
        const currentLoader = messagesStartRef.current;
        if (currentLoader && messages.length > 0) {
            observerRef.current.observe(currentLoader);
            console.log('👁️ Observer attached to loader element');
        } else {
            console.log('⚠️ Cannot attach observer:', { 
                hasLoader: !!currentLoader, 
                messagesCount: messages.length 
            });
        }

        // Cleanup on unmount or dependency change
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                console.log('🧹 Observer disconnected');
            }
        };
    }, [handleIntersection, hasMoreMessages, isLoadingMessages, messages.length]);

    // Auto scroll to bottom when sending a new message or receiving a message from other user
    useEffect(() => {
        if (!containerRef?.current || messages.length === 0) return;
        
        // Don't auto-scroll if we're restoring scroll position
        if (isRestoringScrollRef.current) {
            console.log('⏸️ Skipping auto-scroll - scroll restoration in progress');
            return;
        }
        
        const lastMsg = messages[messages.length - 1]; // Last message in array is newest
        if (lastMsg) {
            // Scroll to bottom if:
            // 1. Last message is from current user (we just sent it)
            // 2. Last message is from other user (we just received it)
            // 3. This is a new message (not from loading more messages)
            // 4. NOT from history (to avoid scrolling when loading older messages)
            const shouldScroll = (lastMsg.senderId === currentUser.id || 
                               (lastMsg.senderId !== currentUser.id && !lastMsg.isOptimistic)) &&
                               !lastMsg.isFromHistory;
            
            if (shouldScroll) {
                console.log('📜 Auto-scrolling to bottom for message:', lastMsg.id);
                // Use requestAnimationFrame to ensure DOM is updated
                requestAnimationFrame(() => {
                    if (containerRef?.current) {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }
                });
            } else if (lastMsg.isFromHistory) {
                console.log('📜 Skipping auto-scroll for history message:', lastMsg.id);
            }
        }
    }, [messages, currentUser.id, containerRef]);

    // Add scroll event listener for debugging and backup trigger
    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            // Calculate scroll percentage (0 = top, 100 = bottom)
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
            
            // Log scroll position when near 50% or top
            if (scrollPercentage <= 50 || scrollTop <= 500) {
                console.log('📜 Scroll position:', {
                    scrollTop,
                    scrollHeight,
                    clientHeight,
                    scrollPercentage: Math.round(scrollPercentage),
                    hasMoreMessages,
                    isLoadingMessages,
                    isRestoring: isRestoringScrollRef.current
                });
                
                // Trigger load more when scroll is at 50% or near top
                if ((scrollPercentage <= 50 || scrollTop <= 500) && hasMoreMessages && !isLoadingMessages && !isRestoringScrollRef.current) {
                    const now = Date.now();
                    if (now - lastFetchTimeRef.current > 1000) { // 1 second debounce
                        console.log('🚀 Auto-load trigger: scroll at', Math.round(scrollPercentage), '% - triggering fetchMoreMessages');
                        lastFetchTimeRef.current = now;
                        fetchMoreMessages(chatId);
                    }
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [containerRef, hasMoreMessages, isLoadingMessages, fetchMoreMessages, chatId]);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Always show loader if we have messages */}
            {messages.length > 0 && (
                <div ref={messagesStartRef} className="text-center p-2 h-10 text-gray-600 dark:text-gray-400">
                    {isLoadingMessages ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                            Đang tải tin nhắn cũ...
                        </div>
                    ) : hasMoreMessages ? (
                        'Cuộn lên 50% để tự động tải tin nhắn cũ'
                    ) : (
                        'Đã đến tin nhắn đầu tiên'
                    )}
                </div>
            )}
            {console.log('🎯 Rendering messages:', messages.length, 'messages in MessageList, hasMore:', hasMoreMessages, 'isLoading:', isLoadingMessages, 'isRestoring:', isRestoringScrollRef.current)}
            {messages.map(msg => 
                <MessageBubble 
                    key={msg.id || `optimistic_${msg.content}_${msg.createdAt}`} 
                    message={msg} 
                    isMe={msg.senderId === currentUser.id} 
                    onRecall={onRecall} 
                    onDelete={onDelete} 
                    onZoomImage={onZoomImage} 
                />
            )}
        </div>
    );
};

export default MessageList; 