import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../services/api';
import NotificationService from '../services/NotificationService';
import { useNotifications } from '../context/NotificationContext';

const { width } = Dimensions.get('window');
const SHEET_WIDTH = width * 0.85;

interface Notification {
    id: string;
    title: string;
    body: string;
    notification_type: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationSideSheetProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationSideSheet = ({ visible, onClose }: NotificationSideSheetProps) => {
    const slideAnim = useRef(new Animated.Value(width)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { refreshUnreadCount } = useNotifications();
    const navigation = useNavigation<any>();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchNotifications();
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: width - SHEET_WIDTH,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: width,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, fetchNotifications]);

    const handleMarkAsRead = async (notification: Notification) => {
        try {
            await api.post(`/notifications/${notification.id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
            refreshUnreadCount();

            // Navigate if it's a critical notification
            if (notification.notification_type === 'NEW_REQUEST') {
                const data = (notification as any).data;
                const requestId = data?.requestId || (typeof data === 'string' ? JSON.parse(data).requestId : null);
                if (requestId) {
                    onClose(); // Close the side sheet before navigating
                    navigation.navigate('ServiceRequestDetails', { requestId });
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleClearAll = async () => {
        Alert.alert(
            'Clear All',
            'Are you sure you want to clear all notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: async () => {
                        try {
                            await api.delete('/notifications/clear');
                            setNotifications([]);
                            refreshUnreadCount();
                        } catch (error) {
                            console.error('Failed to clear notifications', error);
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'NEW_REQUEST': return 'list';
            case 'LEAD_UNLOCKED': return 'user-check';
            case 'offer_approved': return 'check-circle';
            case 'offer_rejected': return 'x-circle';
            case 'new_offer': return 'tag';
            case 'offer_expiring': return 'clock';
            default: return 'bell';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'NEW_REQUEST': return COLORS.primary;
            case 'LEAD_UNLOCKED': return COLORS.success;
            case 'offer_approved': return COLORS.success;
            case 'offer_rejected': return COLORS.error;
            case 'new_offer': return COLORS.secondary;
            case 'offer_expiring': return COLORS.error;
            default: return COLORS.textSecondary;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
            onPress={() => handleMarkAsRead(item)}
        >
            <View style={[styles.typeIconContainer, { backgroundColor: item.is_read ? '#F3F4F6' : `${getIconColor(item.notification_type)}15` }]}>
                <Icon name={getIcon(item.notification_type)} size={18} color={item.is_read ? '#6B7280' : getIconColor(item.notification_type)} />
            </View>
            <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, !item.is_read && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.notificationBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notificationTime}>{formatTime(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [{ translateX: slideAnim }],
                            width: SHEET_WIDTH,
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={TYPOGRAPHY.h2}>Notifications</Text>
                            <Text style={styles.subtitle}>{notifications.length} updates total</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="x" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {loading && notifications.length === 0 ? (
                            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
                                data={notifications}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.listContainer}
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Icon name="bell-off" size={48} color={COLORS.border} />
                                        <Text style={styles.emptyText}>No new notifications</Text>
                                        <Text style={styles.emptySubtext}>
                                            We'll let you know when something important happens.
                                        </Text>
                                    </View>
                                }
                                ListFooterComponent={
                                    notifications.length > 0 ? (
                                        <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
                                            <Icon name="trash-2" size={16} color="#EF4444" />
                                            <Text style={styles.clearAllText}>Clear All Notifications</Text>
                                        </TouchableOpacity>
                                    ) : null
                                }
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: COLORS.background,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    listContainer: {
        paddingVertical: SPACING.sm,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: `${COLORS.primary}05`,
    },
    typeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 2,
    },
    unreadText: {
        color: COLORS.primary,
    },
    notificationBody: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    notificationTime: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 6,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    emptyState: {
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        gap: 8,
    },
    clearAllText: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
    },
});

export default NotificationSideSheet;
