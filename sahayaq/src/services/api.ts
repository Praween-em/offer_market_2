
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android Emulator: Use your computer's WiFi IP address for better compatibility
// Alternative: Use 10.0.2.2 (standard bridge to host machine)
// const BASE_URL = 'http://192.168.29.18:3000/api';
const BASE_URL = 'https://imtmmjq2sq.us-east-1.awsapprunner.com/api';


const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors (e.g., 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Basic error logging
        if (error.response) {
            console.log('API Error:', error.response.status, error.response.data);
        } else {
            console.log('API Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
