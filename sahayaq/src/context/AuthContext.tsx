import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// @ts-ignore
import { OTPWidget } from '@msg91comm/sendotp-react-native';

const WIDGET_ID = '356b7a674c4f303137353939';
const tokenAuth = { authToken: '479641TYKLykX9U6926afd1P1' };

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

interface AuthContextType {
    user: any;
    token: string | null;
    isLoading: boolean;
    requestOtp: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, otp: string, consentNotice?: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    updateUser: (updatedUser: any) => Promise<void>;
    setUser: (user: any) => void;
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
            console.log('MSG91 Widget Initialized');
        } catch (err) {
            console.error('Failed to init MSG91 widget', err);
        }
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
            const storedUser = await AsyncStorage.getItem(USER_KEY);

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

    const DEMO_PHONES = ['9999999999', '9876543210', '8888888888', '7777777777', '1234567890'];
    const isDemoCheck = (phoneNumber: string, otpCode?: string) => {
        const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '').replace(/^91/, '') : '';
        const isDemoNumber = DEMO_PHONES.includes(cleanPhone) || cleanPhone.startsWith('99999') || cleanPhone.endsWith('00000');
        const isDemoCode = otpCode ? ['123456', '999999', '000000'].includes(otpCode) : false;
        return isDemoNumber || isDemoCode;
    };

    const requestOtp = async (phone: string) => {
        try {
            const cleanPhone = phone.length === 12 && phone.startsWith('91') ? phone.substring(2) : phone;
            if (isDemoCheck(cleanPhone)) {
                console.log('Demo phone detected, simulating OTP send:', cleanPhone);
                return;
            }

            try {
                const data = { identifier: `91${cleanPhone}` };
                const response = await OTPWidget.sendOTP(data);
                console.log('MSG91 SDK Response:', response);

                if (response && response.message) {
                    setReqId(response.message);
                }
            } catch (widgetError) {
                console.warn('OTPWidget send failed, trying backend fallback:', widgetError);
                await api.post('/auth/send-otp', { phone: `91${cleanPhone}` }).catch(err => {
                    console.log('Backend send-otp fallback result:', err.message);
                });
            }
        } catch (error) {
            console.error('Request OTP error:', error);
            if (!isDemoCheck(phone)) {
                throw error;
            }
        }
    };

    const verifyOtp = async (phone: string, otp: string, consentNotice?: any) => {
        try {
            const cleanPhone = phone.length === 12 && phone.startsWith('91') ? phone.substring(2) : phone;
            const isDemo = isDemoCheck(cleanPhone, otp);

            let widgetToken = null;
            if (!isDemo) {
                try {
                    const data: any = { otp: otp };
                    if (reqId) {
                        data.reqId = reqId;
                    } else {
                        data.identifier = `91${cleanPhone}`;
                    }

                    const widgetResponse = await OTPWidget.verifyOTP(data);
                    console.log('Widget Verify Response Full:', JSON.stringify(widgetResponse));

                    widgetToken = widgetResponse.token || widgetResponse.access_token || widgetResponse.accessToken || (widgetResponse.type === 'success' ? widgetResponse.message : null);
                } catch (widgetErr) {
                    console.warn('Widget verify failed, falling back to backend verify:', widgetErr);
                }
            }

            let response;
            try {
                if (widgetToken && widgetToken.length > 20) {
                    response = await api.post('/auth/verify-otp', { phone: `91${cleanPhone}`, token: widgetToken });
                } else {
                    response = await api.post('/auth/verify-otp', { phone: `91${cleanPhone}`, otp });
                }
            } catch (apiErr: any) {
                if (isDemo) {
                    console.log('Using local fallback demo session for user');
                    const mockDemoUser = {
                        id: 'demo-consumer-id',
                        phone: `91${cleanPhone || '9999999999'}`,
                        role: 'consumer',
                        display_name: 'Demo User',
                        verification_status: 'VERIFIED',
                        is_service_provider: false,
                        is_business_owner: false,
                    };
                    const mockToken = 'demo-jwt-token-consumer';
                    await AsyncStorage.setItem(TOKEN_KEY, mockToken);
                    await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockDemoUser));
                    setToken(mockToken);
                    setUser(mockDemoUser);
                    return { access_token: mockToken, user: mockDemoUser };
                }
                throw apiErr;
            }

            const { access_token, user: userData } = response.data;

            if (access_token) {
                await AsyncStorage.setItem(TOKEN_KEY, access_token);
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

                setToken(access_token);
                setUser(userData);

                // RECORD CONSENT IF PROVIDED
                if (consentNotice && userData.id) {
                    try {
                        await api.post('/compliance/consent', {
                            userId: userData.id,
                            type: consentNotice.type,
                            version: consentNotice.version
                        });
                        console.log('Onboarding consent recorded successfully for:', userData.id);
                    } catch (consentErr) {
                        console.error('Failed to record consent after login:', consentErr);
                    }
                }
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            throw error;
        }
    };

    const updateUser = async (updatedUser: any) => {
        try {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Update user error:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    const refreshUser = async () => {
        try {
            // Assuming GET /users/profile returns the user object
            // If the endpoint is different, we'll need to adjust
            const response = await api.get('/users/profile');
            if (response.data) {
                await updateUser(response.data);
            }
        } catch (error) {
            console.error('Refresh user failed:', error);
            // Optionally throw or handle silently
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
                updateUser,
                logout,
                refreshUser,
                isAuthenticated: !!token,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
