import React from 'react';
import { Sun, Moon, Heart } from './Icons';

const ThemeToggle = ({ isDarkMode, onToggle, className = '' }) => {
    return (
        <button
            onClick={onToggle}
            className={`relative p-2 rounded-full transition-all duration-500 group ${className}`}
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isDarkMode 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600' 
                    : 'bg-gradient-to-r from-pink-400 to-purple-500'
            } opacity-0 group-hover:opacity-20 blur-sm`}></div>
            
            {/* Icon container */}
            <div className={`relative p-2 rounded-full transition-all duration-500 ${
                isDarkMode 
                    ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80' 
                    : 'bg-white/80 text-gray-700 hover:bg-gray-50/80'
            } backdrop-blur-sm border border-pink-200/50 dark:border-purple-700/50 shadow-lg group-hover:shadow-xl group-hover:scale-110`}>
                {isDarkMode ? (
                    <Moon size={18} className="transition-transform duration-500 group-hover:rotate-12" />
                ) : (
                    <Sun size={18} className="transition-transform duration-500 group-hover:rotate-12" />
                )}
            </div>
            
            {/* Decorative sparkle */}
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-500 ${
                isDarkMode 
                    ? 'bg-purple-400' 
                    : 'bg-pink-400'
            } opacity-0 group-hover:opacity-100 animate-pulse`}></div>
        </button>
    );
};

export default ThemeToggle; 