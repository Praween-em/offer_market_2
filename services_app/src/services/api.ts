import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Switch to Local Backend for faster iteration
// const BASE_URL = 'http://192.168.29.18:3000/api'; // Use LAN IP for Physical Device over WiFi
// const BASE_URL = 'http://127.0.0.1:3000/api'; // Use with adb reverse tcp:3000 tcp:3000
const BASE_URL = 'https://imtmmjq2sq.us-east-1.awsapprunner.com/api'; // Production URL

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
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

// Response Interceptor: Handle Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.log('API Error:', error.response.status, error.response.data);
        } else {
            console.log('API Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
