import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { useNotifications } from '../../context/NotificationContext';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();

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

    const isVerified = user?.verification_status === 'VERIFIED' || user?.provider?.is_verified;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {user?.verification_status !== 'VERIFIED' && (
                    <TouchableOpacity
                        style={styles.urgentVerifyBanner}
                        onPress={() => navigation.navigate('Verification')}
                    >
                        <View style={styles.urgentVerifyHeader}>
                            <Icon name="alert-triangle" size={24} color={COLORS.white} />
                            <Text style={styles.urgentVerifyTitle}>ACTION REQUIRED</Text>
                        </View>
                        <Text style={styles.urgentVerifyDesc}>
                            Your account is unverified! You must verify your identity immediately to keep your account active and continue receiving orders.
                        </Text>
                        <View style={styles.urgentVerifyBtn}>
                            <Text style={styles.urgentVerifyBtnText}>Verify Identity Now</Text>
                            <Icon name="chevron-right" size={16} color={COLORS.error} />
                        </View>
                    </TouchableOpacity>
                )}

                <View style={[styles.header, isVerified ? styles.verifiedHeader : styles.unverifiedHeader]}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, { borderColor: isVerified ? '#0EA5E9' : COLORS.error }]}>
                                {user?.provider?.profile_picture ? (
                                    <Image
                                        source={{ uri: user.provider.profile_picture }}
                                        style={styles.avatarImage}
                                    />
                                ) : (
                                    <Icon name="user" size={32} color={isVerified ? '#0EA5E9' : COLORS.error} />
                                )}
                            </View>
                            {isVerified ? (
                                <View style={[styles.cameraBadge, { backgroundColor: COLORS.white, borderWidth: 0 }]}>
                                    <MaterialCommunityIcons name="check-decagram" size={28} color="#0EA5E9" />
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.cameraBadge, { backgroundColor: COLORS.error }]}
                                    onPress={() => navigation.navigate('EditProfile')}
                                >
                                    <Icon name="camera" size={14} color={COLORS.white} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.nameContainer}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <View style={styles.nameRow}>
                                <Text style={TYPOGRAPHY.h2} numberOfLines={1}>
                                    {(isVerified && user?.user_verification?.full_name_xml) ? user.user_verification.full_name_xml : (user?.display_name || 'Service Provider')}
                                </Text>
                            </View>
                            <View style={styles.categoryRow}>
                                <View style={styles.categoryBadge}>
                                    <Icon name="briefcase" size={10} color={COLORS.primary} />
                                    <Text style={styles.categoryText}>
                                        {user?.provider?.service_categories?.name || 'Service Provider'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={TYPOGRAPHY.bodySecondary}>
                                {user?.provider?.provider_type || 'Professional'} • {user?.provider?.experience_years || 0} yrs exp
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Icon name="edit-2" size={18} color={COLORS.primary} />
                    <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PrivacySecurity')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#F0F9FF' }]}>
                            <Icon name="shield" size={20} color="#0EA5E9" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Privacy & Security</Text>
                            <Text style={styles.menuSubtext}>DPDP Act & Data Protection</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#F5F3FF' }]}>
                            <Icon name="bell" size={20} color="#7C3AED" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Notifications</Text>
                            <Text style={styles.menuSubtext}>Manage app alerts & signals</Text>
                        </View>
                        {unreadCount > 0 && <View style={styles.badge} />}
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compliance & Support</Text>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Support')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                            <Icon name="life-buoy" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Support & Grievances</Text>
                            <Text style={styles.menuSubtext}>Raise tickets & track issues</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Nominee')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#F0F9FF' }]}>
                            <Icon name="users" size={20} color="#0EA5E9" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Manage Nominee</Text>
                            <Text style={styles.menuSubtext}>DPDP Act Compliance Section 10</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
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
                        <View style={[styles.menuIcon, { backgroundColor: '#F8FAFC' }]}>
                            <Icon name="file-text" size={20} color={COLORS.textSecondary} />
                        </View>
                        <Text style={styles.menuText}>Privacy Policy</Text>
                        <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('About')}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: '#FFF1F2' }]}>
                            <Icon name="info" size={20} color="#E11D48" />
                        </View>
                        <Text style={styles.menuText}>About Sahayaq</Text>
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
    urgentVerifyBanner: {
        backgroundColor: COLORS.error,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        borderWidth: 2,
        borderColor: '#991B1B', // Darker red border
        ...SHADOWS.medium,
        elevation: 8,
    },
    urgentVerifyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    urgentVerifyTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.white,
        fontWeight: '900',
        letterSpacing: 1,
    },
    urgentVerifyDesc: {
        ...TYPOGRAPHY.body,
        color: COLORS.white,
        fontWeight: '600',
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    urgentVerifyBtn: {
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    urgentVerifyBtnText: {
        ...TYPOGRAPHY.body,
        color: COLORS.error,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    verifiedHeader: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
        borderWidth: 1.5,
    },
    unverifiedHeader: {
        backgroundColor: '#FEF2F2',
        borderColor: COLORS.error,
        borderWidth: 1.5,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.primary}15`,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: SPACING.xl,
        gap: 8,
    },
    editProfileButtonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '700',
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
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    badge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.error,
        marginRight: SPACING.xs,
    },
    categoryRow: {
        marginBottom: 4,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: `${COLORS.primary}30`,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontWeight: '700',
        textTransform: 'uppercase',
        fontSize: 10,
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
