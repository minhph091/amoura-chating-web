import React, { useState, useCallback } from 'react';
import { formatName } from '../utils';
import { MoreVertical, Trash2, RotateCcw, Heart } from './Icons';
import MessageContent from './MessageContent';
import MessageMenu from './MessageMenu';

const MessageBubble = React.memo(({ message, isMe, onRecall, onDelete, onZoomImage, isHistoryMessage = false }) => {
    // Early return if message is undefined or null
    if (!message) {
        return null;
    }

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleRecall = () => {
        onRecall(message.id);
        setIsMenuOpen(false);
    };
    
    const handleDelete = () => {
        onDelete(message.id);
        setIsMenuOpen(false);
    };

    const handleAvatarClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onZoomImage && message.senderAvatar) {
            console.log('🖼️ Opening image zoom modal for message avatar:', message.senderAvatar);
            onZoomImage(message.senderAvatar);
        }
    }, [onZoomImage, message.senderAvatar]);

    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return '';
        }
    };

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group ${isHistoryMessage ? 'opacity-75' : ''}`}>
            <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-xs lg:max-w-md`}>
                {/* Avatar */}
                {!isMe && (
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <img 
                            src={message.senderAvatar || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?'} 
                            alt={formatName(message.senderName)} 
                            onClick={handleAvatarClick}
                            className="relative w-8 h-8 rounded-full object-cover ring-2 ring-pink-200/50 dark:ring-purple-700/50 group-hover:ring-pink-300 dark:group-hover:ring-purple-600 transition-all duration-300 shadow-lg cursor-pointer hover:scale-110" 
                            onError={(e) => e.target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=E'}
                        />
                    </div>
                )}
                
                {/* Message content */}
                <div className={`relative group ${isMe ? 'order-1' : 'order-2'}`}>
                    {/* Message bubble */}
                    <div className={`relative rounded-2xl px-4 py-2 shadow-lg transition-all duration-300 ${
                        isMe 
                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-br-md' 
                            : 'bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white rounded-bl-md border border-pink-200/50 dark:border-purple-700/50 backdrop-blur-sm'
                    }`}>
                        {/* Gradient overlay for own messages */}
                        {isMe && (
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-2xl rounded-br-md"></div>
                        )}
                        
                        {/* Message content */}
                        <div className="relative z-10">
                            {!isMe && (
                                <p className="text-xs font-semibold text-pink-600 dark:text-purple-400 mb-1">
                                    {formatName(message.senderName)}
                                </p>
                            )}
                            
                            {message.recalled ? (
                                <div className={`flex items-center space-x-2 italic ${
                                    isMe 
                                        ? 'text-white/90' 
                                        : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                    <Heart size={14} className={isMe ? 'text-white/80' : 'text-pink-500 dark:text-pink-400'} />
                                    <span className="text-sm font-medium">Tin nhắn đã được thu hồi</span>
                                </div>
                            ) : (
                                <MessageContent 
                                    message={message}
                                    onZoomImage={onZoomImage}
                                />
                            )}
                        </div>
                        
                        {/* Message time */}
                        <div className={`text-xs mt-1 ${
                            isMe 
                                ? 'text-white/80' 
                                : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            {formatTime(message.createdAt)}
                            {message.isOptimistic && (
                                <span className="ml-1 text-pink-300 dark:text-purple-300">⏳</span>
                            )}
                            {message.error && (
                                <span className="ml-1 text-red-400">❌</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Message menu button */}
                    {!message.recalled && (
                        <div className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-full transition-all duration-300"
                            >
                                <MoreVertical size={16} />
                            </button>
                            
                            {/* Message menu */}
                            {isMenuOpen && (
                                <MessageMenu 
                                    onRecall={handleRecall} 
                                    onDelete={handleDelete} 
                                    isOwnMessage={isMe}
                                    onClose={() => setIsMenuOpen(false)}
                                    message={message}
                                />
                            )}
                        </div>
                    )}
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 rounded-2xl ${
                        isMe 
                            ? 'bg-gradient-to-r from-pink-400/10 to-purple-400/10' 
                            : 'bg-gradient-to-r from-pink-100/20 to-purple-100/20 dark:from-pink-900/10 dark:to-purple-900/10'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                </div>
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble; 