import React from 'react';
import { formatName } from '../utils';

const ChatListItem = React.memo(({ chat, onClick, isActive, currentUserId, onZoomImage }) => {
    // Early return if chat is undefined or null
    if (!chat) {
        return null;
    }

    const otherUser = chat.user1Id === currentUserId 
        ? { name: chat.user2Name, avatar: chat.user2Avatar }
        : { name: chat.user1Name, avatar: chat.user1Avatar };
    
    // Safe date handling to prevent "Invalid Date"
    const getDisplayTime = () => {
        if (!chat.lastMessage?.createdAt) {
            return '';
        }
        
        try {
            const date = new Date(chat.lastMessage.createdAt);
            if (isNaN(date.getTime())) {
                return '';
            }
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.warn('Invalid date format in chat list:', chat.lastMessage.createdAt);
            return '';
        }
    };
    
    const displayTime = getDisplayTime();
    const lastMessageText = chat.lastMessage?.recalled ? 'Tin nhắn đã được thu hồi' : (chat.lastMessage?.messageType === 'IMAGE' ? '📷 Hình ảnh' : chat.lastMessage?.content);

    const handleAvatarClick = (e) => {
        e.stopPropagation(); // Prevent chat selection
        if (onZoomImage && otherUser.avatar) {
            onZoomImage(otherUser.avatar);
        }
    };

    return (
        <div 
            onClick={onClick} 
            className={`group relative p-4 hover:bg-gradient-to-r hover:from-pink-50/80 hover:to-purple-50/80 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 cursor-pointer border-b border-pink-100/50 dark:border-purple-800/30 transition-all duration-300 ${
                isActive 
                    ? 'bg-gradient-to-r from-pink-100/80 via-purple-100/60 to-indigo-100/40 dark:from-pink-900/30 dark:via-purple-900/20 dark:to-indigo-900/10 border-l-4 border-l-pink-500' 
                    : 'hover:border-l-4 hover:border-l-pink-300 dark:hover:border-l-purple-400'
            }`}
        >
            {/* Active indicator */}
            {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 rounded-r-full"></div>
            )}
            
            <div className="flex items-center space-x-3">
                {/* Avatar with gradient ring */}
                <div className="relative">
                    <div className={`absolute inset-0 rounded-full ${
                        isActive 
                            ? 'bg-gradient-to-r from-pink-400 to-purple-500' 
                            : 'bg-gradient-to-r from-pink-200 to-purple-300 dark:from-pink-700 dark:to-purple-700'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`}></div>
                    <img 
                        src={otherUser.avatar || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?'} 
                        alt={formatName(otherUser.name)} 
                        onClick={handleAvatarClick}
                        className={`relative w-12 h-12 rounded-full object-cover ring-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                            isActive 
                                ? 'ring-pink-400 dark:ring-purple-400' 
                                : 'ring-pink-200/50 dark:ring-purple-700/50 group-hover:ring-pink-300 dark:group-hover:ring-purple-600'
                        }`}
                        onError={(e) => e.target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=E'}
                    />
                    
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                
                {/* Chat info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold text-sm truncate transition-colors duration-300 ${
                            isActive 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}>
                            {formatName(otherUser.name)}
                        </h3>
                        <span className={`text-xs transition-colors duration-300 ${
                            isActive 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400'
                        }`}>
                            {displayTime}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <p className={`text-xs truncate transition-colors duration-300 ${
                            chat.lastMessage?.recalled 
                                ? 'italic text-gray-400 dark:text-gray-500' 
                                : isActive
                                    ? 'text-gray-600 dark:text-gray-300'
                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}>
                            {lastMessageText || 'Chưa có tin nhắn'}
                        </p>
                        
                        {/* Unread count badge */}
                        {chat.unreadCount > 0 && (
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-sm opacity-60 animate-pulse"></div>
                                <span className="relative bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-lg">
                                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
        </div>
    );
});

ChatListItem.displayName = 'ChatListItem';

export default ChatListItem; 