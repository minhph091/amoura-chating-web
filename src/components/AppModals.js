import React from 'react';
import ProfileModal from './ProfileModal';
import ImageZoomModal from './ImageZoomModal';
import SettingsModal from './SettingsModal';

const AppModals = ({
    viewedProfile,
    isSettingsModalOpen,
    zoomedImageUrl,
    onCloseProfile,
    onCloseSettings,
    onCloseZoomedImage,
    onZoomImage,
    isUserOnline,
    getUserStatus,
    formatLastSeen,
    currentUser
}) => {
    return (
        <>
            {viewedProfile && (
                <ProfileModal 
                    user={viewedProfile} 
                    onClose={onCloseProfile} 
                    onZoomImage={onZoomImage} 
                    isUserOnline={isUserOnline}
                    getUserStatus={getUserStatus}
                    formatLastSeen={formatLastSeen}
                    currentUser={currentUser}
                />
            )}
            {isSettingsModalOpen && (
                <SettingsModal onClose={onCloseSettings} />
            )}
            {zoomedImageUrl && (
                <ImageZoomModal 
                    imageUrl={zoomedImageUrl} 
                    onClose={onCloseZoomedImage} 
                />
            )}
        </>
    );
};

export default AppModals; 