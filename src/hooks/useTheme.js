import { useState, useEffect, useCallback } from 'react';

// LocalStorage key for theme
const THEME_STORAGE_KEY = 'amoura_theme';

export const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        const loadSavedTheme = () => {
            try {
                const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    const isDark = savedTheme === 'dark';
                    setIsDarkMode(isDark);
                    applyTheme(isDark);
                } else {
                    // Default to dark mode if no saved preference
                    applyTheme(true);
                }
            } catch (error) {
                console.error('❌ Error loading saved theme:', error);
                applyTheme(true); // Fallback to dark mode
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedTheme();
    }, []);

    // Apply theme to document
    const applyTheme = useCallback((isDark) => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, []);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        applyTheme(newTheme);
        
        // Save to localStorage
        try {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
            console.log(`🎨 Theme switched to ${newTheme ? 'dark' : 'light'} mode`);
        } catch (error) {
            console.error('❌ Error saving theme preference:', error);
        }
    }, [isDarkMode, applyTheme]);

    // Set specific theme
    const setTheme = useCallback((isDark) => {
        setIsDarkMode(isDark);
        applyTheme(isDark);
        
        // Save to localStorage
        try {
            localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
            console.log(`🎨 Theme set to ${isDark ? 'dark' : 'light'} mode`);
        } catch (error) {
            console.error('❌ Error saving theme preference:', error);
        }
    }, [applyTheme]);

    return {
        isDarkMode,
        isLoading,
        toggleTheme,
        setTheme
    };
}; 