import React, { useEffect, useRef } from 'react';
import { Trash2, RotateCcw, Heart } from './Icons';
import { canRecallMessage, getTimeUntilRecallExpires } from '../utils';

const MessageMenu = ({ onRecall, onDelete, isOwnMessage, onClose, message }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="absolute top-0 right-0 mt-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-pink-200/50 dark:border-purple-700/50 py-2 z-50 min-w-[140px] animate-in slide-in-from-top-2 duration-200"
        >
            {/* Recall option - only show if message is within 30 minutes */}
            {isOwnMessage && canRecallMessage(message) && (
                <button 
                    onClick={onRecall}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group"
                >
                    <RotateCcw size={16} className="mr-3 text-pink-500 group-hover:text-pink-600 transition-colors duration-200" />
                    Thu hồi
                </button>
            )}
            
            {/* Delete option */}
            <button 
                onClick={onDelete}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group"
            >
                <Trash2 size={16} className="mr-3 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                Xóa của tôi
            </button>
            
            {/* Decorative element */}
            <div className="absolute -top-1 right-3 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></div>
        </div>
    );
};

export default MessageMenu; 