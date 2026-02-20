import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from './AuthContext';

interface NotificationContextData {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    notifications: any[];
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { token } = useAuth();

    const refreshUnreadCount = useCallback(async () => {
        if (!token) {
            console.log('[NotificationContext] No token, skipping refresh');
            return;
        }
        console.log('[NotificationContext] Refreshing unread count...');
        const data = await NotificationService.getNotifications();
        console.log('[NotificationContext] Fetched', data?.length || 0, 'notifications');
        if (data && data.length > 0) {
            console.log('[NotificationContext] First notification is_read:', data[0].is_read);
        }
        setNotifications(data || []);
        const unread = (data || []).filter((n: any) => !n.is_read).length;
        console.log('[NotificationContext] New unread count:', unread);
        setUnreadCount(unread);
    }, [token]);

    useEffect(() => {
        if (token) {
            refreshUnreadCount();
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }

        // Listen for foreground messages to update count
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            // Wait a bit for backend persistence or just increment locally
            // Re-fetching is safer
            setTimeout(refreshUnreadCount, 1000);
        });

        return unsubscribe;
    }, [token, refreshUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
