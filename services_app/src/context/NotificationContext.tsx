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
    const { isAuthenticated, token } = useAuth();

    const refreshUnreadCount = useCallback(async () => {
        if (!isAuthenticated || !token) {
            return;
        }
        const data = await NotificationService.getNotifications();
        setNotifications(data || []);
        const unread = (data || []).filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
    }, [isAuthenticated, token]);

    useEffect(() => {
        if (isAuthenticated) {
            refreshUnreadCount();
        } else {
            setUnreadCount(0);
            setNotifications([]);
        }

        // Listen for foreground messages to update count
        const unsubscribe = messaging().onMessage(async (remoteMessage) => {
            // Filter logic is already in NotificationService, but we re-fetch here if it passed filters
            setTimeout(refreshUnreadCount, 1000);
        });

        return unsubscribe;
    }, [isAuthenticated, refreshUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, notifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
