import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Paperclip, Smile, Send, Heart } from './Icons';

const MessageInput = forwardRef(({ onSendMessage, onUploadImage, chatId, onTypingChange }, ref) => {
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Expose focus method to parent component
    useImperativeHandle(ref, () => ({
        focus: () => {
            textInputRef.current?.focus();
        }
    }));

    // Handle typing events with debounce
    const handleTyping = () => {
        console.log('⌨️ [INPUT] handleTyping triggered:', {
            chatId,
            currentIsTyping: isTyping,
            hasOnTypingChange: !!onTypingChange
        });
        
        if (!isTyping && onTypingChange) {
            console.log('🚀 [INPUT] Starting typing indicator');
            setIsTyping(true);
            onTypingChange(chatId, true);
        }
        
        // Reset timeout
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping && onTypingChange) {
                console.log('⏹️ [INPUT] Stopping typing indicator (timeout)');
                setIsTyping(false);
                onTypingChange(chatId, false);
            }
        }, 2000); // 2 seconds after stopping typing
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSendMessageSubmit = (e) => { 
        e.preventDefault(); 
        if (newMessage.trim()) { 
            console.log('📤 [INPUT] Sending message, stopping typing indicator');
            
            // Stop typing indicator when sending message
            if (isTyping && onTypingChange) {
                console.log('⏹️ [INPUT] Stopping typing indicator (message sent)');
                setIsTyping(false);
                onTypingChange(chatId, false);
                clearTimeout(typingTimeoutRef.current);
            }
            
            onSendMessage(chatId, newMessage, 'TEXT'); 
            setNewMessage(''); 
        } 
    };
    
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageSubmit(e);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        handleTyping(); // Trigger typing indicator
    };

    const handleFileSelect = (e) => { 
        const file = e.target.files[0]; 
        if (file) onUploadImage(chatId, file); 
        e.target.value = null; 
    };

    return (
        <div className="bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-indigo-50/40 dark:from-pink-900/20 dark:via-purple-900/15 dark:to-indigo-900/10 border-t border-pink-200/50 dark:border-purple-700/50 backdrop-blur-md transition-all duration-500">
            <form onSubmit={handleSendMessageSubmit} className="flex items-center space-x-3 p-4">
                {/* File upload button */}
                <div className="relative group">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current.click()} 
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-full transition-all duration-300 group-hover:scale-110 shadow-lg"
                    >
                        <Paperclip size={20} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                </div>

                {/* Message input */}
                <div className="flex-1 relative group">
                    <input 
                        ref={textInputRef}
                        type="text" 
                        value={newMessage} 
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Nhập tin nhắn..." 
                        className="w-full px-4 py-3 text-gray-900 dark:text-white bg-white/70 dark:bg-gray-700/70 placeholder-gray-500 dark:placeholder-gray-400 border border-pink-200/50 dark:border-purple-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 shadow-lg" 
                    />
                    <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-pink-400 to-purple-500 rounded-r-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                </div>

                {/* Emoji button */}
                <div className="relative group">
                    <button 
                        type="button" 
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-all duration-300 group-hover:scale-110 shadow-lg"
                    >
                        <Smile size={20} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                </div>

                {/* Send button */}
                <div className="relative group">
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className="p-3 font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:via-gray-400 disabled:to-indigo-400 dark:disabled:from-gray-600 dark:disabled:via-gray-600 dark:disabled:to-gray-600 rounded-full transition-all duration-300 transform hover:scale-110 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center min-w-[48px]"
                    >
                        {newMessage.trim() ? (
                            <Send size={18} className="text-white" />
                        ) : (
                            <Heart size={18} className="text-white/60" />
                        )}
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                </div>
            </form>
        </div>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput; 