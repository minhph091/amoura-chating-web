import React from 'react';
import { formatName } from '../utils';
import { ArrowLeft, Phone, Video, Info } from './Icons';

const MobileChatHeader = ({ activeChat, currentUser, onBackToList, onZoomImage }) => {
    if (!activeChat || !currentUser) return null;
    
    const otherUser = activeChat.user1Id === currentUser.id 
        ? { id: activeChat.user2Id, name: activeChat.user2Name, avatar: activeChat.user2Avatar } 
        : { id: activeChat.user1Id, name: activeChat.user1Name, avatar: activeChat.user1Avatar };
    
    return (
        <div className="flex items-center justify-between p-4 border-b border-pink-200/50 dark:border-purple-700/50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-900 dark:text-white flex-shrink-0 transition-all duration-300">
            <div className="flex items-center min-w-0 flex-1">
                <button 
                    onClick={onBackToList}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-all duration-300 mr-3 group"
                >
                    <ArrowLeft size={20} className="group-hover:scale-110 transition-transform duration-300" />
                </button>
                
                <div className="flex items-center min-w-0 cursor-pointer group flex-1">
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
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                    <div className="min-w-0 ml-3 flex-1">
                        <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {formatName(otherUser.name)}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Đang hoạt động</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-all duration-300 group">
                    <Phone size={18} className="group-hover:scale-110 transition-transform duration-300" />
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-300 group">
                    <Video size={18} className="group-hover:scale-110 transition-transform duration-300" />
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 group">
                    <Info size={18} className="group-hover:scale-110 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
};

export default MobileChatHeader; 