import React, { useState, useEffect, useRef } from 'react';
import { formatName } from '../utils';
import { User, Settings, LogOut, Search, Heart } from './Icons';
import ChatListItem from './ChatListItem';
import ThemeToggle from './ThemeToggle';

const ChatList = React.memo(({ chats, onSelectChat, activeChatId, searchTerm, onSearchChange, currentUser, onLogout, onShowProfile, onShowSettings, isDarkMode, onToggleTheme, onZoomImage, isUserOnline, getUserStatus, formatLastSeen }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    
    const filteredChats = chats.filter(chat => formatName(chat.user1Id === currentUser.id ? chat.user2Name : chat.user1Name).toLowerCase().includes(searchTerm.toLowerCase()));
    const userAvatar = currentUser.photos && currentUser.photos.length > 0 ? currentUser.photos[0].url : 'https://placehold.co/100x100/B19CD9/FFFFFF?text=ME';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleAvatarClick = (e) => {
        e.stopPropagation(); // Prevent menu from opening
        onShowProfile(); // Open profile modal
    };

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="w-full md:w-1/3 lg:w-1/4 bg-gradient-to-b from-white/90 via-pink-50/50 to-purple-50/30 dark:from-gray-800/90 dark:via-purple-900/50 dark:to-indigo-900/30 text-gray-900 dark:text-white flex flex-col h-full border-r border-pink-200/50 dark:border-purple-700/50 backdrop-blur-sm transition-all duration-500">
            {/* Header Section */}
            <div className="p-6 border-b border-pink-200/50 dark:border-purple-700/50 flex-shrink-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                                <Heart size={20} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                                {formatName(currentUser?.fullName) || 'amoura'}
                            </h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                Trực tuyến
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle 
                            isDarkMode={isDarkMode} 
                            onToggle={onToggleTheme}
                            className="mr-2"
                        />
                        <div className="relative" ref={menuRef}>
                            <div className="relative group">
                                <img 
                                    src={userAvatar} 
                                    alt={formatName(currentUser.fullName)} 
                                    onClick={handleAvatarClick}
                                    className="w-10 h-10 rounded-full cursor-pointer object-cover ring-2 ring-pink-200/50 dark:ring-purple-700/50 hover:ring-pink-400 dark:hover:ring-purple-400 transition-all duration-300 shadow-lg" 
                                    onError={(e) => e.target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=E'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                
                                {/* Menu toggle button */}
                                <button 
                                    onClick={handleMenuToggle}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform duration-200"
                                >
                                    ⋯
                                </button>
                            </div>
                            <div className={`absolute right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl py-2 z-50 border border-pink-200/50 dark:border-purple-700/50 ${isMenuOpen ? 'block' : 'hidden'} transition-all duration-300`}>
                                <button onClick={() => { onShowProfile(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 rounded-lg mx-2">
                                    <User size={16} className="mr-2 text-pink-500" /> 
                                    Hồ sơ
                                </button>
                                <button onClick={() => { onShowSettings(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-purple-900/50 dark:hover:to-indigo-900/50 transition-all duration-200 rounded-lg mx-2">
                                    <Settings size={16} className="mr-2 text-pink-500" /> 
                                    Cài đặt
                                </button>
                                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/50 dark:hover:to-pink-900/50 transition-all duration-200 rounded-lg mx-2">
                                    <LogOut size={16} className="mr-2" /> 
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Search Section */}
                <div className="relative">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới" 
                            value={searchTerm} 
                            onChange={onSearchChange} 
                            className="w-full bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-pink-200/50 dark:border-purple-700/50 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300" 
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 dark:text-purple-400 group-focus-within:text-purple-500 transition-colors duration-300" size={18} />
                        <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-pink-400 to-purple-500 rounded-r-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                    </div>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-pink-50/30 dark:to-purple-900/20">
                {filteredChats.length > 0 ? 
                    filteredChats.map(chat => 
                        <ChatListItem 
                            key={chat.id} 
                            chat={chat} 
                            onClick={() => onSelectChat(chat)} 
                            isActive={activeChatId === chat.id} 
                            currentUserId={currentUser.id}
                            onZoomImage={onZoomImage}
                            isUserOnline={isUserOnline}
                            getUserStatus={getUserStatus}
                            formatLastSeen={formatLastSeen}
                        />
                    ) : 
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
                            <Heart size={24} className="text-pink-400 dark:text-purple-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy cuộc trò chuyện.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Bắt đầu cuộc trò chuyện mới để kết nối</p>
                    </div>
                }
            </div>
        </div>
    );
});

export default ChatList; 