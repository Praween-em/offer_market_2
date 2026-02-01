import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                {user?.provider?.profile_picture ? (
                                    <Image
                                        source={{ uri: user.provider.profile_picture }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Icon name="user" size={32} color={COLORS.primary} />
                                )}
                            </View>
                            <TouchableOpacity style={styles.cameraBadge}>
                                <Icon name="camera" size={12} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.nameContainer}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <Text style={TYPOGRAPHY.h2}>{user?.display_name || 'Service Provider'}</Text>
                            <View style={styles.statusRow}>
                                <Text style={TYPOGRAPHY.bodySecondary}>
                                    {user?.provider?.provider_type || 'Professional'} • {user?.provider?.experience_years || 0} yrs exp
                                </Text>
                                {user?.verification_status === 'VERIFIED' && (
                                    <View style={styles.verifiedBadge}>
                                        <Icon name="check-circle" size={14} color={COLORS.secondary} />
                                        <Text style={styles.verifiedText}>Verified</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    {user?.verification_status !== 'VERIFIED' && (
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Verification')}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Icon name="shield" size={20} color="#DC2626" />
                            </View>
                            <View style={styles.menuTextContainer}>
                                <Text style={styles.menuText}>Verify Identity</Text>
                                <Text style={styles.menuSubtext}>Complete verification to unlock features</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('BusinessSettings')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                            <Icon name="settings" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.menuText}>Business Settings</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Icon name="bell" size={20} color={COLORS.accent} />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Payments')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Icon name="credit-card" size={20} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.menuText}>Payments & Payouts</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('HelpCenter')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
                            <Icon name="help-circle" size={20} color={COLORS.textSecondary} />
                        </View>
                        <Text style={styles.menuText}>Help Center</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
                            <Icon name="shield" size={20} color={COLORS.error} />
                        </View>
                        <Text style={styles.menuText}>Privacy Policy</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="log-out" size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
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
        padding: SPACING.lg,
    },
    header: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 24,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: SPACING.lg,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${COLORS.primary}20`,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    nameContainer: {
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    verifiedText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.bodySecondary,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        paddingLeft: SPACING.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuText: {
        flex: 1,
        ...TYPOGRAPHY.body,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuSubtext: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    logoutButton: {
        marginTop: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
    },
    logoutText: {
        ...TYPOGRAPHY.body,
        color: COLORS.error,
        fontWeight: '600',
        marginLeft: SPACING.sm,
    },
});

export default ProfileScreen;
