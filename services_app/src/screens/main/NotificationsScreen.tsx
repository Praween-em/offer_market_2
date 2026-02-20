import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import NotificationService from '../../services/NotificationService';
import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    data: any;
    is_read: boolean;
    created_at: string;
    type?: string;
}

const NotificationsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { refreshUnreadCount } = useNotifications();

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('[NotificationsScreen] Failed to fetch notifications:', error);
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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string, type?: string, data?: any) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await NotificationService.markAsRead(id);
        refreshUnreadCount();

        if (type === 'NEW_REQUEST') {
            const requestId = data?.requestId || (typeof data === 'string' ? JSON.parse(data).requestId : null);
            if (requestId) {
                navigation.navigate('ServiceRequestDetails', { requestId });
            }
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await Promise.all(unreadIds.map(id => NotificationService.markAsRead(id)));
        refreshUnreadCount();
    };

    const getIcon = (type: string = 'system') => {
        switch (type) {
            case 'NEW_REQUEST': return 'list';
            case 'LEAD_UNLOCKED': return 'unlock';
            case 'offer_approved': return 'check-circle';
            case 'offer_rejected': return 'x-circle';
            case 'new_offer': return 'tag';
            case 'offer_expiring': return 'clock';
            default: return 'bell';
        }
    };

    const getIconColor = (type: string = 'system') => {
        switch (type) {
            case 'NEW_REQUEST': return COLORS.primary;
            case 'LEAD_UNLOCKED': return COLORS.success;
            case 'offer_approved': return COLORS.success;
            case 'offer_rejected': return COLORS.error;
            case 'new_offer': return COLORS.secondary || '#FBC02D';
            case 'offer_expiring': return COLORS.error;
            default: return COLORS.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => {
        let type = (item as any).notification_type || 'system';
        try {
            const parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
            if (parsedData && parsedData.type) {
                type = parsedData.type;
            }
        } catch (e) {
            // ignore JSON parse error
        }

        const iconColor = getIconColor(type);

        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
                onPress={() => markAsRead(item.id, type, item.data)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, !item.is_read && styles.unreadIconContainer]}>
                    <Icon name={getIcon(type)} size={20} color={!item.is_read ? iconColor : COLORS.textSecondary} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.time}>
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </Text>
                    </View>
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                </View>
                {!item.is_read && <View style={styles.dot} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
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
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="bell-off" size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        justifyContent: 'space-between',
    },
    backButton: {
        marginRight: SPACING.md,
    },
    markAllButton: {
        padding: SPACING.xs,
    },
    markAllText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.primary,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    unreadItem: {
        backgroundColor: `${COLORS.primary}08`, // 5% opacity primary
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    unreadIconContainer: {
        backgroundColor: `${COLORS.primary}15`,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        flex: 1,
        marginRight: SPACING.sm,
    },
    unreadText: {
        fontWeight: '700',
        color: COLORS.text,
    },
    time: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    body: {
        ...TYPOGRAPHY.bodySecondary,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        alignSelf: 'center',
        marginLeft: SPACING.sm,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        ...TYPOGRAPHY.bodySecondary,
        marginTop: SPACING.md,
    },
});

export default NotificationsScreen;
