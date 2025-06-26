import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { formatName } from '../utils';
import { MessageSquare, Phone, Video, Info, Heart } from './Icons';
import ChatArea from './ChatArea';
import EmptyChatState from './EmptyChatState';

const ChatWindow = forwardRef(({ chat, messages, currentUser, onSendMessage, onUploadImage, fetchMoreMessages, onRecall, onDelete, onZoomImage, onShowProfile, messagesContainerRef, hasMoreMessages, isLoadingMessages, isDarkMode, isUserOnline, getUserStatus, formatLastSeen, typingUsers, onTypingChange }, ref) => {
    const chatAreaRef = useRef(null);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
        focusInput: () => {
            chatAreaRef.current?.focusInput();
        }
    }));

    if (!chat) return <EmptyChatState isDarkMode={isDarkMode} />;
    
    // Check if currentUser exists before accessing its properties
    if (!currentUser) {
        return <EmptyChatState isDarkMode={isDarkMode} />;
    }
    
    const otherUser = chat.user1Id === currentUser.id 
        ? { id: chat.user2Id, name: chat.user2Name, avatar: chat.user2Avatar } 
        : { id: chat.user1Id, name: chat.user1Name, avatar: chat.user1Avatar };
    
    // Get user status
    const userStatus = getUserStatus(otherUser.id);
    const isOnline = isUserOnline(otherUser.id);
    
    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white/90 via-pink-50/30 to-purple-50/20 dark:from-gray-900/90 dark:via-purple-900/30 dark:to-indigo-900/20 h-full transition-all duration-500">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-200/50 dark:border-purple-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white flex-shrink-0 transition-all duration-300">
                <div className="flex items-center min-w-0 cursor-pointer group" onClick={() => onShowProfile(otherUser.id)}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <img 
                            src={otherUser.avatar || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?'} 
                            alt={formatName(otherUser.name)} 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onZoomImage && otherUser.avatar) {
                                    onZoomImage(otherUser.avatar);
                                }
                            }}
                            className="relative w-10 h-10 rounded-full object-cover ring-2 ring-pink-200/50 dark:ring-purple-700/50 hover:ring-pink-400 dark:hover:ring-purple-400 transition-all duration-300 shadow-lg cursor-pointer hover:scale-105" 
                            onError={(e) => e.target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=E'}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-gray-800 rounded-full transition-all duration-300 ${
                            isOnline 
                                ? 'bg-green-500 animate-pulse' 
                                : 'bg-gray-400'
                        }`}></div>
                    </div>
                    <div className="min-w-0 ml-3">
                        <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {formatName(otherUser.name)}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                isOnline 
                                    ? 'bg-green-500 animate-pulse' 
                                    : 'bg-gray-400'
                            }`}></div>
                            <p className={`text-sm font-medium transition-colors duration-300 ${
                                isOnline 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {isOnline 
                                    ? 'Đang hoạt động' 
                                    : userStatus.lastSeen 
                                        ? `Hoạt động ${formatLastSeen(userStatus.lastSeen)}`
                                        : 'Không hoạt động'
                                }
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-all duration-300 group">
                        <Phone size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-300 group">
                        <Video size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 group">
                        <Info size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                </div>
            </div>
            
            {/* Chat Area */}
            <ChatArea 
                ref={chatAreaRef}
                chat={chat} 
                messages={messages} 
                currentUser={currentUser} 
                onSendMessage={onSendMessage} 
                onUploadImage={onUploadImage} 
                fetchMoreMessages={fetchMoreMessages} 
                onRecall={onRecall} 
                onDelete={onDelete} 
                onZoomImage={onZoomImage} 
                containerRef={messagesContainerRef}
                hasMoreMessages={hasMoreMessages}
                isLoadingMessages={isLoadingMessages}
                typingUsers={typingUsers}
                onTypingChange={onTypingChange}
            />
        </div>
    );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow; 