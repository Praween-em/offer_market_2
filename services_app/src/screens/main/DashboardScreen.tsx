import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import NotificationSideSheet from '../../components/NotificationSideSheet';

const DashboardScreen = () => {
    const { refreshUser } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [stats, setStats] = useState({
        totalCalls: 0,
        totalWhatsapp: 0,
        todayCalls: 0,
        todayWhatsapp: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refreshUser(), fetchStats()]);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={TYPOGRAPHY.h1}>Dashboard</Text>
                        <Text style={TYPOGRAPHY.bodySecondary}>Performance Overview</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => setShowNotifications(true)}
                    >
                        <Icon name="bell" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                                <Icon name="phone" size={20} color={COLORS.primary} />
                            </View>
                            <Text style={styles.statLabel}>Calls Initiated</Text>
                            <Text style={styles.statValue}>{stats.totalCalls}</Text>
                            <Text style={styles.statSubValue}>+{stats.todayCalls} today</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                                <Icon name="message-circle" size={20} color={COLORS.secondary} />
                            </View>
                            <Text style={styles.statLabel}>WhatsApp Chats</Text>
                            <Text style={styles.statValue}>{stats.totalWhatsapp}</Text>
                            <Text style={styles.statSubValue}>+{stats.todayWhatsapp} today</Text>
                        </View>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={TYPOGRAPHY.h2}>Analytics Insights</Text>
                    <View style={styles.insightCard}>
                        <Icon name="trending-up" size={24} color={COLORS.primary} />
                        <View style={styles.insightText}>
                            <Text style={styles.insightTitle}>Engagement is growing!</Text>
                            <Text style={styles.insightBody}>
                                You have made {stats.totalCalls + stats.totalWhatsapp} connections with potential customers.
                            </Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
            <NotificationSideSheet
                visible={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 20,
        width: '48%',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        ...TYPOGRAPHY.h2,
        fontSize: 22,
        color: COLORS.text,
    },
    statSubValue: {
        fontSize: 10,
        color: COLORS.success,
        fontWeight: 'bold',
        marginTop: 2,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    insightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        padding: SPACING.md,
        borderRadius: 16,
        gap: SPACING.md,
    },
    insightText: {
        flex: 1,
    },
    insightTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: 2,
    },
    insightBody: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    activityItem: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 16,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default DashboardScreen;
