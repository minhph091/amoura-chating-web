import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatArea = forwardRef(({ chat, messages, currentUser, onSendMessage, onUploadImage, fetchMoreMessages, onRecall, onDelete, onZoomImage, containerRef, hasMoreMessages, isLoadingMessages, typingUsers, onTypingChange }, ref) => {
    const messageInputRef = useRef(null);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            messageInputRef.current?.focus();
        }
    }));

    // Get typing user names (excluding current user)
    const getTypingUserNames = () => {
        if (!typingUsers || typingUsers.size === 0) return [];
        
        const typingUserNames = [];
        typingUsers.forEach(userId => {
            if (userId !== currentUser?.id) {
                // Get user name from chat participants
                const otherUser = chat?.user1Id === currentUser?.id ? 
                    { id: chat.user2Id, name: chat.user2Name } : 
                    { id: chat.user1Id, name: chat.user1Name };
                
                if (otherUser.id === userId) {
                    typingUserNames.push(otherUser.name || 'Người dùng');
                }
            }
        });
        return typingUserNames;
    };

    const typingUserNames = getTypingUserNames();
    const isAnyoneTyping = typingUserNames.length > 0;

    return (
        <>
            <MessageList 
                messages={messages}
                currentUser={currentUser}
                onRecall={onRecall}
                onDelete={onDelete}
                onZoomImage={onZoomImage}
                containerRef={containerRef}
                hasMoreMessages={hasMoreMessages}
                isLoadingMessages={isLoadingMessages}
                fetchMoreMessages={fetchMoreMessages}
                chatId={chat?.id}
            />
            {isAnyoneTyping && (
                <TypingIndicator 
                    isTyping={true} 
                    userName={typingUserNames.join(', ')} 
                />
            )}
            <MessageInput 
                ref={messageInputRef}
                onSendMessage={onSendMessage}
                onUploadImage={onUploadImage}
                chatId={chat?.id}
                onTypingChange={onTypingChange}
            />
        </>
    );
});

ChatArea.displayName = 'ChatArea';

export default ChatArea; 