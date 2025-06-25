// --- Name Formatting Helper ---
export const formatName = (name) => {
    if (!name) return 'Unknown';
    
    // If name is already a string, format it to show lastname first
    if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (!trimmedName) return 'Unknown';
        
        const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
        if (nameParts.length === 0) return 'Unknown';
        if (nameParts.length === 1) return nameParts[0];
        
        // Show lastname first, then firstname
        const lastname = nameParts[nameParts.length - 1];
        const firstnames = nameParts.slice(0, -1);
        return `${lastname} ${firstnames.join(' ')}`;
    }
    
    // If name is an object, try to extract the name from common fields
    if (typeof name === 'object') {
        // Try different possible field names
        const possibleFields = ['fullName', 'name', 'displayName', 'firstName', 'lastName', 'username'];
        for (const field of possibleFields) {
            if (name[field]) {
                const fieldValue = String(name[field]).trim();
                if (fieldValue) {
                    // Format the extracted name
                    const nameParts = fieldValue.split(' ').filter(part => part.length > 0);
                    if (nameParts.length === 0) continue;
                    if (nameParts.length === 1) return nameParts[0];
                    
                    // Show lastname first, then firstname
                    const lastname = nameParts[nameParts.length - 1];
                    const firstnames = nameParts.slice(0, -1);
                    return `${lastname} ${firstnames.join(' ')}`;
                }
            }
        }
        
        // If no field found, try to convert object to string
        const objString = String(name).trim();
        if (objString && objString !== '[object Object]') {
            const nameParts = objString.split(' ').filter(part => part.length > 0);
            if (nameParts.length === 0) return 'Unknown';
            if (nameParts.length === 1) return nameParts[0];
            
            // Show lastname first, then firstname
            const lastname = nameParts[nameParts.length - 1];
            const firstnames = nameParts.slice(0, -1);
            return `${lastname} ${firstnames.join(' ')}`;
        }
    }
    
    // Fallback: convert to string and format
    const fallbackString = String(name).trim();
    if (!fallbackString || fallbackString === '[object Object]') return 'Unknown';
    
    const nameParts = fallbackString.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'Unknown';
    if (nameParts.length === 1) return nameParts[0];
    
    // Show lastname first, then firstname
    const lastname = nameParts[nameParts.length - 1];
    const firstnames = nameParts.slice(0, -1);
    return `${lastname} ${firstnames.join(' ')}`;
};

export const canRecallMessage = (message) => {
    if (!message || !message.createdAt) return false;
    
    const messageTime = new Date(message.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - messageTime;
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    return timeDifference <= thirtyMinutes;
};

export const getTimeUntilRecallExpires = (message) => {
    if (!message || !message.createdAt) return null;
    
    const messageTime = new Date(message.createdAt);
    const currentTime = new Date();
    const timeDifference = currentTime - messageTime;
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (timeDifference > thirtyMinutes) return null;
    
    const remainingTime = thirtyMinutes - timeDifference;
    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
    
    return remainingMinutes;
}; 