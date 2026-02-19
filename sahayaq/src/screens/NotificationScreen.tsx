import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/theme';
import NotificationService from '../services/NotificationService';
import { useFocusEffect } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';

// Helper function for "time ago"
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    data: any;
    is_read: boolean;
    created_at: string;
    type?: string;
}

const NotificationScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { refreshUnreadCount } = useNotifications();

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await NotificationService.markAsRead(id);
        refreshUnreadCount();
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        // Call API for each unread notification (could be optimized with a bulk endpoint later)
        await Promise.all(unreadIds.map(id => NotificationService.markAsRead(id)));
        refreshUnreadCount();
    };

    const getIcon = (type: string = 'system') => {
        switch (type) {
            case 'NEW_REQUEST': return 'format-list-bulleted-type';
            case 'LEAD_UNLOCKED': return 'lock-open-outline';
            case 'offer_approved': return 'check-circle-outline';
            case 'offer_rejected': return 'close-circle-outline';
            case 'new_offer': return 'tag-outline';
            case 'offer_expiring': return 'clock-alert-outline';
            case 'order': return 'clipboard-check-outline';
            case 'promo': return 'tag-outline';
            case 'system': return 'information-outline';
            case 'payment': return 'credit-card-outline';
            default: return 'bell-outline';
        }
    };

    const getIconColor = (type: string = 'system') => {
        switch (type) {
            case 'NEW_REQUEST': return COLORS.primary;
            case 'LEAD_UNLOCKED': return COLORS.success;
            case 'offer_approved': return COLORS.success;
            case 'offer_rejected': return COLORS.error;
            case 'new_offer': return COLORS.secondary;
            case 'offer_expiring': return COLORS.accent || '#F39C12';
            case 'order': return COLORS.success;
            case 'promo': return COLORS.secondary;
            case 'system': return COLORS.primary;
            case 'payment': return COLORS.info;
            default: return COLORS.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => {
        // Helper to safely parse data if it's a string, or use it directly
        let type = (item as any).notification_type || 'system';
        try {
            const parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            if (parsedData && parsedData.type) {
                type = parsedData.type;
            }
        } catch (e) {
            // ignore JSON parse error
        }

        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
                activeOpacity={0.7}
                onPress={() => {
                    if (!item.is_read) {
                        markAsRead(item.id);
                    }
                }}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(type)}15` }]}>
                    <MaterialCommunityIcons name={getIcon(type)} size={24} color={getIconColor(type)} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={styles.message} numberOfLines={2}>{item.body}</Text>
                </View>
                {!item.is_read && <View style={styles.dot} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="bell-sleep-outline" size={64} color="#E0E0E0" />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F2F6' },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    markAllText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
    listContent: { paddingBottom: 20 },
    notificationItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F8F9FA', backgroundColor: '#FFF', alignItems: 'flex-start' },
    unreadItem: { backgroundColor: '#F8F9FF' },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    contentContainer: { flex: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
    unreadText: { fontWeight: '800' },
    time: { fontSize: 12, color: COLORS.textSecondary },
    message: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, alignSelf: 'center', marginLeft: 8 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary, fontWeight: '500' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default NotificationScreen;
