import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://imtmmjq2sq.us-east-1.awsapprunner.com/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const offersService = {
    getFeed: async (params: { cursor?: string; categoryId?: string; offerType?: string; search?: string; latitude?: number; longitude?: number }) => {
        const response = await apiClient.get('/offers/feed', { params });
        return response.data;
    },
    getHotDeals: async (params?: { latitude?: number; longitude?: number }) => {
        const response = await apiClient.get('/offers/hot-deals', { params });
        return response.data;
    },
    getOfferTypes: async () => {
        const response = await apiClient.get('/offers/types');
        return response.data;
    },
    getOfferDetails: async (id: string) => {
        const response = await apiClient.get(`/offers/${id}`);
        return response.data;
    },
    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data;
    },
    getBusinesses: async () => {
        const response = await apiClient.get('/users/businesses');
        return response.data;
    },
    getAffiliateStores: async () => {
        const response = await apiClient.get('/affiliate/stores');
        return response.data;
    },
};

export default apiClient;
