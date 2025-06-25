import React from 'react';
import { MessageSquare, Heart, Sparkles } from './Icons';
import ShootingStars from './ShootingStars';

const EmptyChatState = ({ isDarkMode = false }) => {
    // Dark mode - hiệu ứng mưa sao băng
    if (isDarkMode) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white p-4 transition-all duration-500">
                {/* Shooting Stars Background */}
                <ShootingStars />
                
                {/* Main Content */}
                <div className="relative z-10 text-center space-y-6 md:space-y-8 max-w-md">
                    {/* Animated Logo */}
                    <div className="relative">
                        {/* Multiple glowing backgrounds for extra sparkle */}
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-full blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        
                        {/* Main icon container with enhanced glow */}
                        <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-float">
                            {/* Inner glow effect */}
                            <div className="absolute inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-full blur-sm opacity-60"></div>
                            
                            <MessageSquare size={40} className="md:w-12 md:h-12 text-white animate-bounce relative z-10" />
                            
                            {/* Enhanced floating hearts and sparkles */}
                            <div className="absolute -top-2 -right-2 animate-ping">
                                <Heart size={14} className="md:w-4 md:h-4 text-pink-300 drop-shadow-lg" />
                            </div>
                            <div className="absolute -bottom-2 -left-2 animate-ping" style={{ animationDelay: '0.5s' }}>
                                <Heart size={14} className="md:w-4 md:h-4 text-purple-300 drop-shadow-lg" />
                            </div>
                            <div className="absolute -top-1 -left-1 animate-ping" style={{ animationDelay: '1s' }}>
                                <Sparkles size={10} className="md:w-3 md:h-3 text-indigo-300 drop-shadow-lg" />
                            </div>
                            
                            {/* Additional sparkles */}
                            <div className="absolute top-1 -right-1 animate-ping" style={{ animationDelay: '1.5s' }}>
                                <Sparkles size={8} className="md:w-2 md:h-2 text-pink-200 drop-shadow-lg" />
                            </div>
                            <div className="absolute -bottom-1 right-1 animate-ping" style={{ animationDelay: '2s' }}>
                                <Sparkles size={8} className="md:w-2 md:h-2 text-purple-200 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Title and Description with enhanced effects */}
                    <div className="space-y-3 md:space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                            amoura
                        </h2>
                        
                        <div className="space-y-2">
                            <p className="text-base md:text-lg font-medium text-gray-200 drop-shadow-md">
                                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                            </p>
                            <p className="text-xs md:text-sm text-gray-400 drop-shadow-sm">
                                Khám phá những kết nối mới và chia sẻ khoảnh khắc đặc biệt
                            </p>
                        </div>
                    </div>
                    
                    {/* Enhanced decorative elements */}
                    <div className="flex justify-center space-x-3 md:space-x-4">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-400 rounded-full animate-pulse drop-shadow-lg"></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full animate-pulse drop-shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-pulse drop-shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
                
                {/* Enhanced floating elements with glow */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-twinkle drop-shadow-lg"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-300 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-indigo-300 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Additional sparkle elements */}
                <div className="absolute top-1/6 left-1/6 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '0.8s' }}></div>
                <div className="absolute top-2/3 right-1/6 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '1.3s' }}></div>
                <div className="absolute bottom-1/6 left-2/3 w-0.5 h-0.5 bg-orange-200 rounded-full animate-twinkle drop-shadow-lg" style={{ animationDelay: '1.7s' }}></div>
            </div>
        );
    }

    // Light mode - giao diện bình thường
    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-indigo-50/20 text-gray-900 p-4 transition-all duration-500">
            {/* Main Content */}
            <div className="text-center space-y-6 md:space-y-8 max-w-md">
                {/* Simple Logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                        <MessageSquare size={40} className="md:w-12 md:h-12 text-white" />
                    </div>
                </div>
                
                {/* Title and Description */}
                <div className="space-y-3 md:space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        amoura
                    </h2>
                    
                    <div className="space-y-2">
                        <p className="text-base md:text-lg font-medium text-gray-700">
                            Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                            Khám phá những kết nối mới và chia sẻ khoảnh khắc đặc biệt
                        </p>
                    </div>
                </div>
                
                {/* Simple decorative elements */}
                <div className="flex justify-center space-x-3 md:space-x-4">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};

export default EmptyChatState; 