import React, { useCallback } from 'react';
import { formatName } from '../utils';
import { X, Heart, User, Mail, Phone, Calendar } from './Icons';

const ProfileModal = ({ user, onClose, onZoomImage, isUserOnline, getUserStatus, formatLastSeen, currentUser }) => {
    if (!user) return null;
    
    // Debug logging
    console.log('🔍 ProfileModal received user:', user);
    console.log('🔍 user.fullName:', user.fullName);
    console.log('🔍 user.name:', user.name);
    console.log('🔍 user.displayName:', user.displayName);
    
    const handleClose = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClose) {
            onClose();
        }
    }, [onClose]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            handleClose(e);
        }
    }, [handleClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            handleClose(e);
        }
    }, [handleClose]);

    const handleImageClick = useCallback((e, imageUrl) => {
        e.preventDefault();
        e.stopPropagation();
        if (onZoomImage && imageUrl) {
            console.log('🖼️ Opening image zoom modal for:', imageUrl);
            onZoomImage(imageUrl);
        }
    }, [onZoomImage]);
    
    const renderDetail = (label, value) => {
        if (!value) return null;
        return (
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl border border-pink-200/30 dark:border-purple-700/30">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                    <User size={18} className="text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>
        );
    };
    
    // Get the best available name for display
    const getDisplayName = () => {
        if (user.fullName && typeof user.fullName === 'string' && user.fullName.trim()) {
            return user.fullName.trim();
        } else if (user.name && typeof user.name === 'string' && user.name.trim()) {
            return user.name.trim();
        } else if (user.displayName && typeof user.displayName === 'string' && user.displayName.trim()) {
            return user.displayName.trim();
        } else if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`.trim();
        } else if (user.username && typeof user.username === 'string' && user.username.trim()) {
            return user.username.trim();
        }
        return 'Unknown User';
    };
    
    const displayName = getDisplayName();
    console.log('🔍 Final displayName:', displayName);
    
    // Get user status - handle case when functions are not available
    const userStatus = getUserStatus ? getUserStatus(user.id) : { status: 'ONLINE', lastSeen: null };
    const isOnline = isUserOnline ? isUserOnline(user.id) : true; // Default to online for current user
    
    // Special handling for current user's own profile
    const isCurrentUser = user.id === currentUser?.id;
    const finalIsOnline = isCurrentUser ? (isUserOnline ? isUserOnline(user.id) : true) : isOnline;
    const finalUserStatus = isCurrentUser 
        ? (getUserStatus ? getUserStatus(user.id) : { status: 'ONLINE', lastSeen: null })
        : userStatus;
    
    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-200/50 dark:border-purple-700/50 max-w-lg w-full max-h-[90vh] overflow-y-auto transition-all duration-500 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="relative p-6 border-b border-pink-200/50 dark:border-purple-700/50">
                    <button 
                        onClick={handleClose}
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute top-4 right-4 p-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-full transition-all duration-300 group z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        aria-label="Đóng hồ sơ"
                    >
                        <X size={20} className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                    
                    <div className="text-center">
                        <div className="relative mx-auto mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                            <img 
                                src={user.photos?.[0]?.url || 'https://placehold.co/100x100/CCCCCC/FFFFFF?text=?'} 
                                alt={formatName(displayName)} 
                                className="relative w-24 h-24 rounded-full object-cover ring-4 ring-pink-200/50 dark:ring-purple-700/50 mx-auto shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300" 
                                onClick={(e) => handleImageClick(e, user.photos?.[0]?.url)}
                                onError={(e) => e.target.src='https://placehold.co/100x100/CCCCCC/FFFFFF?text=E'}
                            />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-3 border-white dark:border-gray-800 rounded-full transition-all duration-300 ${
                                finalIsOnline 
                                    ? 'bg-green-500 animate-pulse' 
                                    : 'bg-gray-400'
                            }`}></div>
                        </div>
                        
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                            {formatName(displayName)}
                        </h2>
                        
                        <div className={`flex items-center justify-center space-x-2 transition-colors duration-300 ${
                            finalIsOnline 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                finalIsOnline 
                                    ? 'bg-green-500 animate-pulse' 
                                    : 'bg-gray-400'
                            }`}></div>
                            <span className="text-sm font-medium">
                                {finalIsOnline 
                                    ? 'Đang hoạt động' 
                                    : finalUserStatus.lastSeen && formatLastSeen
                                        ? `Hoạt động ${formatLastSeen(finalUserStatus.lastSeen)}`
                                        : 'Không hoạt động'
                                }
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Basic info */}
                    <div className="space-y-3">
                        {renderDetail("Tên đầy đủ", displayName)}
                        {renderDetail("Email", user.email)}
                        {renderDetail("Số điện thoại", user.phone)}
                        {renderDetail("Bio", user.bio)}
                        {renderDetail("Tuổi", user.age)}
                        {renderDetail("Giới tính", user.sex)}
                        {renderDetail("Chiều cao", user.height ? `${user.height} cm` : null)}
                        {renderDetail("Địa chỉ", user.location ? `${user.location.city}, ${user.location.country}` : null)}
                        {renderDetail("Ngôn ngữ", user.languages?.map(l => l.name).join(', '))}
                        {renderDetail("Sở thích", user.interests?.map(i => i.name).join(', '))}
                        {renderDetail("Thú cưng", user.pets?.map(p => p.name).join(', '))}
                        {renderDetail("Tham gia từ", user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : null)}
                    </div>
                    
                    {/* Photo gallery */}
                    {user.photos && user.photos.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-3 border-t border-pink-200/50 dark:border-purple-700/50 pt-4 text-gray-900 dark:text-white">
                                Thư viện ảnh
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {user.photos.map((photo, index) => (
                                    <div key={photo.id || index} className="aspect-square group">
                                        <div 
                                            className="relative overflow-hidden rounded-xl border border-pink-200/30 dark:border-purple-700/30 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('🖼️ Gallery image clicked:', photo.url);
                                                if (onZoomImage && photo.url) {
                                                    onZoomImage(photo.url);
                                                }
                                            }}
                                        >
                                            <img 
                                                src={photo.url} 
                                                alt={`User photo ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                                                onError={(e) => e.target.src='https://placehold.co/150x150/CCCCCC/FFFFFF?text=Error'} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Decorative element */}
                    <div className="flex justify-center pt-4">
                        <div className="flex items-center space-x-2 text-pink-500 dark:text-purple-400">
                            <Heart size={16} className="animate-pulse" />
                            <span className="text-sm font-medium">amoura</span>
                            <Heart size={16} className="animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal; 