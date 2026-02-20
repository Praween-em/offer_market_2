import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const ProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { user, logout, refreshUser } = useAuth();
    const { t } = useLanguage();
    const { unreadCount } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        if (refreshUser) {
            await refreshUser();
        }
        setRefreshing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            t('logoutConfirm'),
            [
                {
                    text: t('cancel'),
                    style: 'cancel',
                },
                {
                    text: t('logout'),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderMenuItem = (icon: string, label: string, onPress: () => void, color = '#2D3436', showBadge = false) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${color}10` }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={color} />
                </View>
                <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <View style={styles.menuItemRight}>
                {showBadge && <View style={styles.badge} />}
                <MaterialCommunityIcons name="chevron-right" size={20} color="#B2BEC3" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('profileTitle')}</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: user?.profile_picture || 'https://via.placeholder.com/100' }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity onPress={() => !user?.display_name && navigation.navigate('EditProfile')}>
                        <Text style={[styles.displayName, !user?.display_name && { color: '#4C51BF', textDecorationLine: 'underline' }]}>
                            {user?.display_name || t('setYourName') || 'Set your name'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.phoneNumber}>{user?.phone || '+91 XXXXXXXXXX'}</Text>
                    <TouchableOpacity
                        style={styles.editProfileBtn}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <MaterialCommunityIcons name="pencil-outline" size={16} color="#FFF" />
                        <Text style={styles.editProfileText}>{t('editProfile')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myActivity')}</Text>
                    {renderMenuItem('clipboard-text-outline', t('myServiceRequests'), () => navigation.navigate('ServiceRequests'), '#4C51BF')}
                    {renderMenuItem('history', t('requestHistory'), () => { }, '#4C51BF')}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings')}</Text>
                    {renderMenuItem('bell-outline', t('notifications'), () => navigation.navigate('Notification'), '#9C27B0', unreadCount > 0)}
                    {renderMenuItem('map-marker-outline', t('locationSettings'), () => navigation.navigate('LocationSettings'), '#4CAF50')}
                    {renderMenuItem('shield-check-outline', t('privacySecurity'), () => navigation.navigate('PrivacySecurity'), '#2196F3')}
                    {renderMenuItem('translate', t('language'), () => navigation.navigate('LanguageSettings'), '#FF5722')}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('support')}</Text>
                    {renderMenuItem('help-circle-outline', t('helpSupport'), () => navigation.navigate('HelpSupport'), '#00BCD4')}
                    {renderMenuItem('information-outline', t('aboutApp'), () => navigation.navigate('AboutApp'), '#607D8B')}
                    {renderMenuItem('file-document-outline', t('termsConditions'), () => navigation.navigate('TermsConditions'), '#795548')}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#F44336" />
                    <Text style={styles.logoutText}>{t('logout')}</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
    },
    profileCard: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F8F9FA',
        marginBottom: 16,
    },
    displayName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2D3436',
        marginBottom: 4,
    },
    phoneNumber: {
        fontSize: 14,
        color: '#636E72',
        marginBottom: 16,
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#4C51BF',
        borderWidth: 1,
        borderColor: '#4C51BF',
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D3436',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3436',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4757',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#F44336',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#F44336',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#B2BEC3',
        marginBottom: 40,
    },
});

export default ProfileScreen;
