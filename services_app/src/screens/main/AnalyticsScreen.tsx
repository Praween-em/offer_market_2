import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const AnalyticsScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={TYPOGRAPHY.h1}>Analytics</Text>
                <Text style={[TYPOGRAPHY.bodySecondary, { marginBottom: SPACING.lg }]}>
                    Monitor your business performance
                </Text>

                <View style={styles.chartPlaceholder}>
                    <Text style={TYPOGRAPHY.bodySecondary}>Earnings Chart (Coming Soon)</Text>
                    <Icon name="trending-up" size={48} color={COLORS.border} />
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Views</Text>
                        <Text style={styles.statValue}>1.2k</Text>
                        <View style={styles.trendRow}>
                            <Icon name="arrow-up-right" size={14} color={COLORS.success} />
                            <Text style={styles.trendText}>+12%</Text>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Inquiries</Text>
                        <Text style={styles.statValue}>48</Text>
                        <View style={styles.trendRow}>
                            <Icon name="arrow-up-right" size={14} color={COLORS.success} />
                            <Text style={styles.trendText}>+5%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={TYPOGRAPHY.h2}>Top Services</Text>
                    <View style={styles.topServiceItem}>
                        <Text style={TYPOGRAPHY.body}>Standard Cleaning</Text>
                        <Text style={TYPOGRAPHY.bodySecondary}>32 bookings</Text>
                    </View>
                    <View style={styles.topServiceItem}>
                        <Text style={TYPOGRAPHY.body}>Deep Cleaning</Text>
                        <Text style={TYPOGRAPHY.bodySecondary}>14 bookings</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    chartPlaceholder: {
        height: 200,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    statBox: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        width: '48%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    trendText: {
        fontSize: 12,
        color: COLORS.success,
        marginLeft: 2,
        fontWeight: '600',
    },
    section: {
        marginTop: SPACING.md,
    },
    topServiceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
});

export default AnalyticsScreen;
