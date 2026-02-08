import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
    open: { bg: '#EFF6FF', text: '#3B82F6', icon: 'circle' },
    in_progress: { bg: '#FEF3C7', text: '#F59E0B', icon: 'clock' },
    waiting_provider: { bg: '#F3E8FF', text: '#8B5CF6', icon: 'user-check' },
    resolved: { bg: '#D1FAE5', text: '#10B981', icon: 'check-circle' },
    closed: { bg: '#F3F4F6', text: '#6B7280', icon: 'x-circle' },
};

const CATEGORY_ICONS = {
    payment_dispute: 'dollar-sign',
    account_issue: 'user-x',
    platform_bug: 'alert-triangle',
    policy_question: 'help-circle',
    lead_quality: 'trending-down',
    verification_issue: 'shield-off',
    other: 'message-circle',
};

const SupportScreen = ({ navigation }: any) => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    const fetchTickets = async () => {
        try {
            const params: any = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await api.get('/tickets', { params });
            setTickets(response.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTickets();
    }, [filter]);

    const getStatusLabel = (status: string) => {
        return status.replace(/_/g, ' ').toUpperCase();
    };

    const getCategoryLabel = (category: string) => {
        return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const renderTicketCard = ({ item }: { item: any }) => {
        const statusConfig = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS];
        const categoryIcon = CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS];
        const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

        return (
            <TouchableOpacity
                style={styles.ticketCard}
                onPress={() => navigation.navigate('TicketDetails', { ticketId: item.id })}
            >
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketNumberRow}>
                        <Icon name={categoryIcon} size={16} color={COLORS.primary} />
                        <Text style={styles.ticketNumber}>{item.ticket_number}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Icon name={statusConfig.icon} size={10} color={statusConfig.text} />
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.ticketSubject} numberOfLines={2}>
                    {item.subject}
                </Text>

                <View style={styles.ticketMeta}>
                    <View style={styles.metaItem}>
                        <Icon name="tag" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{getCategoryLabel(item.category)}</Text>
                    </View>
                    {item._count?.ticket_messages > 0 && (
                        <View style={styles.metaItem}>
                            <Icon name="message-square" size={12} color={COLORS.textSecondary} />
                            <Text style={styles.metaText}>{item._count.ticket_messages} messages</Text>
                        </View>
                    )}
                    <View style={styles.metaItem}>
                        <Icon name="clock" size={12} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{timeAgo}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support & Grievances</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'open' && styles.filterButtonActive]}
                    onPress={() => setFilter('open')}
                >
                    <Text style={[styles.filterText, filter === 'open' && styles.filterTextActive]}>
                        Open
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'resolved' && styles.filterButtonActive]}
                    onPress={() => setFilter('resolved')}
                >
                    <Text style={[styles.filterText, filter === 'resolved' && styles.filterTextActive]}>
                        Resolved
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderTicketCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="inbox" size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>No tickets found</Text>
                            <Text style={styles.emptySubtext}>
                                Create a ticket to get support from our team
                            </Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTicket')}
            >
                <Icon name="plus" size={24} color={COLORS.white} />
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 18,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.sm,
        backgroundColor: COLORS.surface,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: SPACING.md,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.white,
    },
    listContent: {
        padding: SPACING.md,
    },
    ticketCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    ticketNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ticketNumber: {
        ...TYPOGRAPHY.caption,
        fontWeight: '700',
        color: COLORS.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    ticketSubject: {
        ...TYPOGRAPHY.h3,
        fontSize: 16,
        marginBottom: SPACING.sm,
        color: COLORS.text,
    },
    ticketMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        ...TYPOGRAPHY.bodySecondary,
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 4,
        paddingHorizontal: SPACING.xl,
    },
    fab: {
        position: 'absolute',
        right: SPACING.lg,
        bottom: SPACING.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
});

export default SupportScreen;
