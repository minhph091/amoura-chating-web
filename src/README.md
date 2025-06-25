# Chat Application - Modular Structure

## 📁 Cấu trúc thư mục

```
src/
├── components/          # React components
│   ├── AppModals.js     # Tất cả modals (Profile, Settings, ImageZoom)
│   ├── ChatArea.js      # Khu vực chat (mobile)
│   ├── ChatList.js      # Danh sách chat
│   ├── ChatWindow.js    # Cửa sổ chat (desktop)
│   ├── Icons.js         # Icon components
│   ├── LoginScreen.js   # Màn hình đăng nhập
│   ├── MessageBubble.js # Bong bóng tin nhắn
│   ├── MobileChatHeader.js # Header chat mobile
│   ├── ProfileModal.js  # Modal hồ sơ
│   ├── SettingsModal.js # Modal cài đặt
│   └── ImageZoomModal.js # Modal zoom ảnh
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication logic
│   ├── useChat.js       # Chat state & operations
│   ├── useWebSocket.js  # WebSocket connection & subscriptions
│   ├── useProfile.js    # Profile & modal management
│   └── index.js         # Export all hooks
├── App.js               # Main component (đã refactor)
├── utils.js             # Utility functions
├── index.js             # App entry point
└── index.css            # Global styles
```

## 🔧 Custom Hooks

### `useAuth`
- **Chức năng**: Quản lý authentication
- **State**: `authToken`, `currentUser`
- **Methods**: `handleLoginSuccess`, `handleLogout`, `apiRequest`

### `useChat`
- **Chức năng**: Quản lý chat state và operations
- **State**: `chats`, `activeChat`, `messages`, `hasMoreMessages`, `isLoadingMessages`
- **Methods**: `handleSelectChat`, `handleSendMessage`, `handleWebSocketMessage`, etc.

### `useWebSocket`
- **Chức năng**: Quản lý WebSocket connection và subscriptions
- **State**: `stompClient`, `isStompReady`
- **Methods**: `subscribeToChats`, `cleanupSubscriptions`

### `useProfile`
- **Chức năng**: Quản lý profile và modals
- **State**: `viewedProfile`, `isSettingsModalOpen`, `zoomedImageUrl`
- **Methods**: `handleShowProfile`, `handleShowSettings`, etc.

## 🎯 Lợi ích của cấu trúc mới

### 1. **Separation of Concerns**
- Logic được tách riêng theo chức năng
- Mỗi hook chỉ quản lý một domain cụ thể
- Components chỉ focus vào UI rendering

### 2. **Reusability**
- Custom hooks có thể tái sử dụng
- Components nhỏ hơn, dễ test
- Logic có thể được share giữa các components

### 3. **Maintainability**
- Code dễ đọc và hiểu hơn
- Dễ debug và fix bugs
- Dễ thêm tính năng mới

### 4. **Testability**
- Mỗi hook có thể test riêng biệt
- Components đơn giản hơn, dễ test
- Logic tách biệt khỏi UI

## 🚀 Cách sử dụng

### Import hooks
```javascript
import { useAuth, useChat, useWebSocket, useProfile } from './hooks';
```

### Sử dụng trong component
```javascript
function MyComponent() {
    const { authToken, currentUser, handleLoginSuccess } = useAuth();
    const { chats, handleSelectChat } = useChat(apiRequest, currentUser);
    const { handleShowProfile } = useProfile(currentUser, apiRequest);
    
    // Component logic...
}
```

## 📊 So sánh trước và sau

| Aspect | Trước | Sau |
|--------|-------|-----|
| App.js lines | 590+ | ~200 |
| Logic mixing | ❌ Tất cả trong App.js | ✅ Tách riêng theo hooks |
| Reusability | ❌ Khó tái sử dụng | ✅ Dễ tái sử dụng |
| Testing | ❌ Khó test | ✅ Dễ test |
| Maintenance | ❌ Khó maintain | ✅ Dễ maintain |

## 🔄 Migration Guide

Nếu bạn muốn thêm tính năng mới:

1. **Tạo hook mới** trong `src/hooks/`
2. **Export** trong `src/hooks/index.js`
3. **Import và sử dụng** trong component cần thiết

Ví dụ:
```javascript
// src/hooks/useNotification.js
export const useNotification = () => {
    // Notification logic
};

// src/hooks/index.js
export { useNotification } from './useNotification';

// Component
import { useNotification } from './hooks';
``` 