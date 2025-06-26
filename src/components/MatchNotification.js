import React, { useState, useEffect } from 'react';
import { Heart, X } from './Icons';

const MatchNotification = ({ matchData, onClose, onOpenChat }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-hide after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 300);
    };

    const handleOpenChat = () => {
        if (onOpenChat) {
            onOpenChat(matchData);
        }
        handleClose();
    };

    // Extract matched username from notification content
    const getMatchedUsername = () => {
        if (matchData.matchedUsername) {
            return matchData.matchedUsername;
        }
        
        if (matchData.content) {
            // Parse "You and jane_smith have matched!" format
            const match = matchData.content.match(/You and (.+?) have matched/);
            if (match) {
                return match[1];
            }
        }
        
        return 'someone special';
    };

    const matchedUsername = getMatchedUsername();

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
            isAnimating ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}>
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl shadow-2xl border border-pink-200/50 overflow-hidden">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Heart size={16} className="text-white animate-pulse" />
                        </div>
                        <span className="text-white font-semibold text-sm">New Match!</span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/80 hover:text-white transition-colors duration-200"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 bg-white/95 dark:bg-gray-800/95">
                    <div className="text-center">
                        <div className="mb-3">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Heart size={24} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                It's a Match! 💕
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                You and <span className="font-semibold text-pink-600 dark:text-pink-400">{matchedUsername}</span> have matched!
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={handleOpenChat}
                                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                            >
                                Start Chatting
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-white/20">
                    <div 
                        className="h-full bg-white/60 transition-all duration-5000 ease-linear"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MatchNotification; 