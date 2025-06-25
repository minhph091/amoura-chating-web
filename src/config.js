// API Configuration
export const API_CONFIG = {
    // Base URL for REST API (default fallback)
    BASE_URL: 'http://150.95.109.13:8080/api',
    
    // WebSocket URL
    WS_URL: 'http://150.95.109.13:8080/api/ws',
    
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
    // ✅ Replace with your domain if you have one
    API_CONFIG.BASE_URL = 'https://your-domain.com/api';
    API_CONFIG.WS_URL = 'wss://your-domain.com/api/ws'; // wss for secure WebSocket
}

if (isDevelopment) {
    // ✅ For local testing or emulator
    // API_CONFIG.BASE_URL = 'http://localhost:8080/api';
    // API_CONFIG.WS_URL = 'http://localhost:8080/api/ws';

    // ✅ Or use your server IP (for mobile testing)
    // API_CONFIG.BASE_URL = 'http://150.95.109.13:8080/api';
    // API_CONFIG.WS_URL = 'http://150.95.109.13:8080/api/ws';
}

export default API_CONFIG;
