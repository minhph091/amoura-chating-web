import { useState, useCallback } from 'react';

export const useProfile = (currentUser, apiRequest) => {
    const [viewedProfile, setViewedProfile] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState(null);

    // Handle show profile
    const handleShowProfile = useCallback(async (userId) => {
        console.log('🔍 handleShowProfile called with userId:', userId);
        console.log('🔍 currentUser:', currentUser);
        
        // If no userId is passed, show the current user's profile
        if (!userId) {
            console.log('📱 Showing current user profile');
            setViewedProfile(currentUser);
            return;
        }
        
        // If the userId is the current user's, use the data from state
        if (userId === currentUser.id) {
            console.log('📱 Showing current user profile (from state)');
            setViewedProfile(currentUser);
            return;
        }

        try {
            console.log('🔄 Fetching profile for userId:', userId);
            
            // First, try to get the user's name from chat list
            let userNameFromChats = null;
            try {
                console.log('🔍 Trying to get user name from chat list...');
                const chatRooms = await apiRequest('/chat/rooms');
                console.log('✅ Chat rooms received:', chatRooms);
                
                // Find the chat room that contains this user
                const chatWithUser = chatRooms.find(chat => 
                    Number(chat.user1Id) === Number(userId) || Number(chat.user2Id) === Number(userId)
                );
                
                if (chatWithUser) {
                    if (Number(chatWithUser.user1Id) === Number(userId)) {
                        userNameFromChats = chatWithUser.user1Name;
                    } else {
                        userNameFromChats = chatWithUser.user2Name;
                    }
                    console.log('✅ Found user name from chat list:', userNameFromChats);
                } else {
                    console.log('❌ User not found in any chat room');
                }
            } catch (error) {
                console.log('❌ Failed to get user name from chat list:', error.message);
            }
            
            // Try different possible endpoints for profile data
            let profileData = null;
            let endpoint = '';
            
            // Try /profiles/{userId} first
            try {
                endpoint = `/profiles/${userId}`;
                console.log('🔍 Trying endpoint:', endpoint);
                profileData = await apiRequest(endpoint);
                console.log('✅ Profile data from /profiles/{userId}:', profileData);
            } catch (error) {
                console.log('❌ /profiles/{userId} failed:', error.message);
                
                // Try /users/{userId} as fallback
                try {
                    endpoint = `/users/${userId}`;
                    console.log('🔍 Trying fallback endpoint:', endpoint);
                    profileData = await apiRequest(endpoint);
                    console.log('✅ Profile data from /users/{userId}:', profileData);
                } catch (error2) {
                    console.log('❌ /users/{userId} also failed:', error2.message);
                    
                    // Try /user/profile/{userId} as another fallback
                    try {
                        endpoint = `/user/profile/${userId}`;
                        console.log('🔍 Trying another fallback endpoint:', endpoint);
                        profileData = await apiRequest(endpoint);
                        console.log('✅ Profile data from /user/profile/{userId}:', profileData);
                    } catch (error3) {
                        console.log('❌ All endpoints failed:', error3.message);
                        // Don't throw error, we'll use fallback data
                    }
                }
            }
            
            console.log('✅ Raw profile data received:', profileData);
            console.log('🔍 Profile data type:', typeof profileData);
            console.log('🔍 Profile data keys:', profileData ? Object.keys(profileData) : 'null/undefined');
            
            // Ensure the profile data has the required fields
            if (profileData && typeof profileData === 'object') {
                // Log all available fields for debugging
                console.log('🔍 Available fields in profileData:', Object.keys(profileData));
                console.log('🔍 fullName field:', profileData.fullName);
                console.log('🔍 name field:', profileData.name);
                console.log('🔍 displayName field:', profileData.displayName);
                console.log('🔍 firstName field:', profileData.firstName);
                console.log('🔍 lastName field:', profileData.lastName);
                console.log('🔍 username field:', profileData.username);
                
                // Try to find the name from various possible fields
                let fullName = 'Unknown User';
                
                // Priority 1: Use name from chat list if available
                if (userNameFromChats && typeof userNameFromChats === 'string' && userNameFromChats.trim()) {
                    fullName = userNameFromChats.trim();
                    console.log('🔍 Using name from chat list:', fullName);
                }
                // Priority 2: Use profile data fields
                else if (profileData.fullName && typeof profileData.fullName === 'string' && profileData.fullName.trim()) {
                    fullName = profileData.fullName.trim();
                } else if (profileData.name && typeof profileData.name === 'string' && profileData.name.trim()) {
                    fullName = profileData.name.trim();
                } else if (profileData.displayName && typeof profileData.displayName === 'string' && profileData.displayName.trim()) {
                    fullName = profileData.displayName.trim();
                } else if (profileData.firstName && profileData.lastName) {
                    fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
                } else if (profileData.username && typeof profileData.username === 'string' && profileData.username.trim()) {
                    fullName = profileData.username.trim();
                }
                
                console.log('🔍 Selected fullName:', fullName);
                
                // If the API returns data in a different structure, normalize it
                const normalizedProfile = {
                    id: profileData.id || userId,
                    fullName: fullName,
                    email: profileData.email || profileData.mail || '',
                    phone: profileData.phone || profileData.phoneNumber || '',
                    bio: profileData.bio || profileData.description || profileData.about || '',
                    age: profileData.age || '',
                    sex: profileData.sex || profileData.gender || '',
                    height: profileData.height || '',
                    location: profileData.location || profileData.address || {},
                    languages: profileData.languages || profileData.language || [],
                    interests: profileData.interests || profileData.hobbies || [],
                    pets: profileData.pets || [],
                    createdAt: profileData.createdAt || profileData.createdDate || '',
                    photos: profileData.photos || profileData.images || profileData.avatar || []
                };
                
                console.log('📱 Setting normalized profile:', normalizedProfile);
                setViewedProfile(normalizedProfile);
            } else {
                console.log('❌ No profile data received, using fallback with chat name');
                
                // Use fallback profile with name from chat list
                const fallbackProfile = {
                    id: userId,
                    fullName: userNameFromChats || 'Unknown User',
                    email: '',
                    phone: '',
                    bio: '',
                    age: '',
                    sex: '',
                    height: '',
                    location: {},
                    languages: [],
                    interests: [],
                    pets: [],
                    createdAt: '',
                    photos: []
                };
                
                console.log('📱 Setting fallback profile:', fallbackProfile);
                setViewedProfile(fallbackProfile);
            }
        } catch (error) {
            console.error("❌ Không thể tải hồ sơ người dùng. Lỗi:", error);
            console.error("❌ Error details:", {
                message: error.message,
                status: error.status,
                response: error.response
            });
            // Set a fallback profile on error
            setViewedProfile({
                id: userId,
                fullName: 'Unknown User',
                email: '',
                phone: '',
                bio: '',
                age: '',
                sex: '',
                height: '',
                location: {},
                languages: [],
                interests: [],
                pets: [],
                createdAt: '',
                photos: []
            });
        }
    }, [apiRequest, currentUser]);

    // Handle show settings
    const handleShowSettings = useCallback(() => {
        setIsSettingsModalOpen(true);
    }, []);

    // Handle close settings
    const handleCloseSettings = useCallback(() => {
        setIsSettingsModalOpen(false);
    }, []);

    // Handle close profile
    const handleCloseProfile = useCallback(() => {
        setViewedProfile(null);
    }, []);

    // Handle zoom image
    const handleZoomImage = useCallback((imageUrl) => {
        console.log('🔍 handleZoomImage called with:', imageUrl);
        console.log('🔍 Current zoomedImageUrl:', zoomedImageUrl);
        setZoomedImageUrl(imageUrl);
        console.log('🔍 Setting zoomedImageUrl to:', imageUrl);
    }, [zoomedImageUrl]);

    // Handle close zoomed image
    const handleCloseZoomedImage = useCallback(() => {
        setZoomedImageUrl(null);
    }, []);

    return {
        // State
        viewedProfile,
        isSettingsModalOpen,
        zoomedImageUrl,
        
        // Actions
        handleShowProfile,
        handleShowSettings,
        handleCloseSettings,
        handleCloseProfile,
        handleZoomImage,
        handleCloseZoomedImage
    };
}; 