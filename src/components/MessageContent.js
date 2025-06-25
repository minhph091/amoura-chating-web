import React, { useCallback } from 'react';

const MessageContent = ({ message, onZoomImage }) => {
    const handleImageClick = useCallback((e, imageUrl) => {
        e.preventDefault();
        e.stopPropagation();
        if (onZoomImage && imageUrl) {
            console.log('🖼️ Opening image zoom modal for message image:', imageUrl);
            onZoomImage(imageUrl);
        }
    }, [onZoomImage]);

    if (message.recalled) {
        return <p className="text-sm italic text-gray-300">Tin nhắn đã được thu hồi</p>;
    }
    
    if (message.messageType === 'IMAGE' && message.imageUrl) {
        return (
            <div className="relative group">
                <img 
                    src={message.imageUrl} 
                    alt="chat attachment" 
                    className="rounded-lg max-w-xs cursor-pointer hover:scale-105 transition-transform duration-300 shadow-lg" 
                    onClick={(e) => handleImageClick(e, message.imageUrl)} 
                    onError={(e) => e.target.src='https://placehold.co/200x200/FF0000/FFFFFF?text=Error'} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
            </div>
        );
    }
    
    return <p className="text-sm break-words">{message.content}</p>;
};

export default MessageContent; 