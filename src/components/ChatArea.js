import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatArea = forwardRef(({ chat, messages, currentUser, onSendMessage, onUploadImage, fetchMoreMessages, onRecall, onDelete, onZoomImage, containerRef, hasMoreMessages, isLoadingMessages }, ref) => {
    const messageInputRef = useRef(null);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            messageInputRef.current?.focus();
        }
    }));

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
            <MessageInput 
                ref={messageInputRef}
                onSendMessage={onSendMessage}
                onUploadImage={onUploadImage}
                chatId={chat?.id}
            />
        </>
    );
});

ChatArea.displayName = 'ChatArea';

export default ChatArea; 