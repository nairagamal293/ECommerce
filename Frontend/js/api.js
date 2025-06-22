// api.js - Only define API_BASE_URL here
const API_BASE_URL = 'https://localhost:7118/api';


class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async get(url) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'GET',
            headers
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return response.json();
    }

    async post(url, data) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',  // Ensure this is set
        'Accept': 'application/json'         // Add Accept header
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)  // Ensure proper JSON stringification
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);  // Log detailed error
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

    async put(url, data) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return response.json();
    }

    async delete(url) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseUrl}${url}`, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return response.ok;
    }
}

// Create instance and attach to window
if (!window.api) {
    window.api = new ApiService();
}