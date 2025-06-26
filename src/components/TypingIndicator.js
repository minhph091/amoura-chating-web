import React from 'react';

const TypingIndicator = ({ isTyping, userName }) => {
    if (!isTyping) return null;
    
    return (
        <div className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs">
                {userName ? `${userName} đang nhập tin nhắn...` : 'Đang nhập tin nhắn...'}
            </span>
        </div>
    );
};

export default TypingIndicator; 