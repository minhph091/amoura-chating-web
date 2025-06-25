import { useState, useCallback, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

// LocalStorage keys
const STORAGE_KEYS = {
    AUTH_TOKEN: 'amoura_auth_token',
    USER_DATA: 'amoura_user_data',
    REMEMBER_ME: 'amoura_remember_me',
    EMAIL: 'amoura_email',
};

export const useAuth = () => {
    const [authToken, setAuthToken] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved authentication data on mount
    useEffect(() => {
        const loadSavedAuth = async () => {
            try {
                const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                const savedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
                const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';

                if (savedToken && savedUser && rememberMe) {
                    console.log('🔄 Loading saved authentication data...');
                    
                    // Validate token by fetching user profile
                    try {
                        const response = await fetch(`${API_BASE_URL}/profiles/me`, {
                            headers: { 'Authorization': `Bearer ${savedToken}` }
                        });
                        
                        if (response.ok) {
                            const profile = await response.json();
                            const userData = JSON.parse(savedUser);
                            const fullUser = { ...userData, ...profile };
                            
                            setAuthToken(savedToken);
                            setCurrentUser(fullUser);
                            console.log('✅ Successfully restored authentication');
                        } else {
                            console.log('❌ Saved token is invalid, clearing saved data');
                            clearSavedAuth();
                        }
                    } catch (error) {
                        console.error('❌ Error validating saved token:', error);
                        clearSavedAuth();
                    }
                } else {
                    console.log('ℹ️ No saved authentication data found');
                }
            } catch (error) {
                console.error('❌ Error loading saved authentication:', error);
                clearSavedAuth();
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedAuth();
    }, []);

    // Helper function to clear saved authentication data
    const clearSavedAuth = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(STORAGE_KEYS.EMAIL);
    }, []);

    // Helper function to save authentication data
    const saveAuthData = useCallback((token, user, rememberMe = false) => {
        if (rememberMe) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
            if (user?.email) {
                localStorage.setItem(STORAGE_KEYS.EMAIL, user.email);
            }
            console.log('💾 Authentication data saved to localStorage');
        } else {
            clearSavedAuth();
        }
    }, [clearSavedAuth]);

    // API Request Helper
    const apiRequest = useCallback(async (endpoint, options = {}) => {
        const { body, ...customOptions } = options;
        const headers = { ...options.headers };

        const currentToken = authToken || options.headers?.Authorization?.split(' ')[1];
        if(currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const isFormData = body instanceof FormData;
        if (!isFormData && body) {
            headers['Content-Type'] = 'application/json';
        }

        const config = { ...customOptions, headers, body: isFormData ? body : JSON.stringify(body) };
        if (isFormData) delete config.headers['Content-Type'];

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${errorText}`);
            }
            if (response.status === 204 || response.headers.get("Content-Length") === "0") return null;
            
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
               return response.json();
            }
            return response.text();

        } catch (error) {
            console.error(`Network or Parsing Error on ${endpoint}:`, error);
            throw error;
        }
    }, [authToken]);

    // Handle login success
    const handleLoginSuccess = useCallback(async (token, user, rememberMe = false) => {
        setAuthToken(token);
        try {
            const profile = await apiRequest('/profiles/me', { headers: { Authorization: `Bearer ${token}` } });
            const fullUser = { ...user, ...profile };
            setCurrentUser(fullUser);
            
            // Save authentication data if remember me is enabled
            saveAuthData(token, fullUser, rememberMe);
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setCurrentUser(user);
            saveAuthData(token, user, rememberMe);
        }
    }, [apiRequest, saveAuthData]);

    // Handle logout
    const handleLogout = useCallback(() => {
        setAuthToken(null);
        setCurrentUser(null);
        clearSavedAuth();
        console.log('🚪 User logged out, cleared all authentication data');
    }, [clearSavedAuth]);

    return {
        authToken,
        currentUser,
        isLoading,
        apiRequest,
        handleLoginSuccess,
        handleLogout
    };
}; 