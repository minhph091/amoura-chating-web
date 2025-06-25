// API Configuration
export const API_CONFIG = {
    // Base URL for REST API
    BASE_URL: 'http://localhost:8080/api',
    
    // WebSocket URL
    WS_URL: 'http://localhost:8080/api/ws',
    
    // Timeout settings
    REQUEST_TIMEOUT: 10000,
    
    // Retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Override URLs for different environments
if (isProduction) {
    // Production URLs (replace with your actual production URLs)
    API_CONFIG.BASE_URL = 'https://your-production-domain.com/api';
    API_CONFIG.WS_URL = 'https://your-production-domain.com/api/ws';
}

// Local development overrides (you can change these for local testing)
if (isDevelopment) {
    // For testing with different local IP (e.g., mobile testing)
    // API_CONFIG.BASE_URL = 'http://192.168.1.100:8080/api';
    // API_CONFIG.WS_URL = 'http://192.168.1.100:8080/api/ws';
}

export default API_CONFIG; 