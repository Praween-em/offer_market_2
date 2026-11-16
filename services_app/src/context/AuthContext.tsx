import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import SplashScreen from '../components/SplashScreen';
// @ts-ignore
import { OTPWidget } from '@msg91comm/sendotp-react-native';

const WIDGET_ID = '356b7a674c4f303137353939';
const tokenAuth = { authToken: '479641TYKLykX9U6926afd1P1' };

interface AuthContextType {
    user: any;
    token: string | null;
    isLoading: boolean;
    requestOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string, consentNotice?: any) => Promise<any>;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    updateUser: (userData: any) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reqId, setReqId] = useState<string | null>(null);

    useEffect(() => {
        loadStorageData();
        // Initialize MSG91 Widget
        try {
            OTPWidget.initializeWidget(WIDGET_ID, tokenAuth.authToken);
        } catch (err) {
            console.error('Failed to init MSG91 widget', err);
        }
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            const storedUser = await AsyncStorage.getItem('user_data');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const requestOtp = async (phone: string) => {
        try {
            const cleanPhone = phone.length === 12 && phone.startsWith('91') ? phone.substring(2) : phone;
            const data = { identifier: `91${cleanPhone}` };
            const response = await OTPWidget.sendOTP(data);
            if (response && response.message) {
                setReqId(response.message);
            }
        } catch (error) {
            console.error('Request OTP error:', error);
            throw error;
        }
    };

    const verifyOtp = async (phone: string, otp: string, consentNotice?: any) => {
        try {
            const cleanPhone = phone.length === 12 && phone.startsWith('91') ? phone.substring(2) : phone;

            const data: any = { otp: otp };
            if (reqId) {
                data.reqId = reqId;
            } else {
                data.identifier = `91${cleanPhone}`;
            }

            const widgetResponse = await OTPWidget.verifyOTP(data);
            const widgetToken = widgetResponse.token || widgetResponse.access_token || widgetResponse.accessToken || (widgetResponse.type === 'success' && widgetResponse.message.length > 20 ? widgetResponse.message : null);

            let response;
            if (widgetToken && widgetToken.length > 20) {
                response = await api.post('/auth/verify-otp', { phone: `91${cleanPhone}`, token: widgetToken });
            } else {
                response = await api.post('/auth/verify-otp', { phone: `91${cleanPhone}`, otp });
            }

            const { access_token, user: userData } = response.data;

            if (access_token) {
                await login(access_token, userData);

                // RECORD CONSENT IF PROVIDED
                if (consentNotice && userData.id) {
                    try {
                        await api.post('/compliance/consent', {
                            userId: userData.id,
                            type: consentNotice.type,
                            version: consentNotice.version
                        });
                    } catch (consentErr) {
                        console.error('Failed to record provider consent after login:', consentErr);
                    }
                }
            }
            return response.data;
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    };

    const login = async (newToken: string, userData: any) => {
        try {
            await AsyncStorage.setItem('access_token', newToken);
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
        } catch (e) {
            console.error('Failed to save login data', e);
        }
    };

    const updateUser = async (userData: any) => {
        try {
            const updatedUser = { ...user, ...userData };
            await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (e) {
            console.error('Failed to update user data', e);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/users/profile');
            if (response.data) {
                await updateUser(response.data);
            }
        } catch (e) {
            console.error('Failed to refresh user data', e);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('user_data');
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Logout error', e);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                requestOtp,
                verifyOtp,
                login,
                logout,
                updateUser,
                refreshUser,
                isAuthenticated: !!token && !!user,
            }}
        >
            {isLoading ? (
                <SplashScreen loop={true} />
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
