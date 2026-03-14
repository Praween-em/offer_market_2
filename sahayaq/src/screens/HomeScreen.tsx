import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_IDS } from '../utils/adConfig';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getServiceIcon } from '../utils/serviceIcons';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { COLORS } from '../utils/theme';
import CategoryRail from '../components/CategoryRail';

// Hardcoded top 15 priority categories for home screen
const FEATURED_CATEGORIES = [
    { name: 'Electrician', image: require('../assets/electrician.png') },
    { name: 'Plumber', image: require('../assets/plumber.png') },
    { name: 'Cooking & Chefs', image: require('../assets/food_kitchen.png') },
    { name: 'Home Cleaning', image: require('../assets/cleaning_hygiene.png') },
    { name: 'Appliance Repair', image: require('../assets/appliance.png') },
    { name: 'Carpenter', image: require('../assets/carpenter.png') },
    { name: 'Painting', image: require('../assets/painters.png') },
    { name: 'Elderly Care', image: require('../assets/carehelper.png') },
    { name: 'Driver', image: require('../assets/driver.png') },
    { name: 'Welding', image: require('../assets/welding.png') },
    { name: 'Car Mechanic', image: require('../assets/carmechanic.png') },
    { name: 'Bike Mechanic', image: require('../assets/bikemechanic.png') },
    { name: 'Salons', image: require('../assets/salons.png') },
];





import { useNotifications } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { language, setLanguage, t, translateData } = useLanguage();
    const { location, detectLocation, checkLocationPermissionOnLoad } = useLocation();
    const { unreadCount, refreshUnreadCount } = useNotifications();

    // Refresh unread count every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshUnreadCount();
        }, [refreshUnreadCount])
    );
    const [serviceRequests, setServiceRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchServiceRequests();
        checkLocationPermissionOnLoad();
    }, []);

    const fetchServiceRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/services/my-requests');
            setServiceRequests(response.data || []);
        } catch (error) {
            console.error('Fetch service requests error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // Refresh location in background or wait for it? 
        // For home screen, just triggering it is enough to update the header
        await detectLocation();
        await fetchServiceRequests();
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#FFA500';
            case 'accepted':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const renderQuickAction = (icon: string, label: string, onPress: () => void) => (
        <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
            <View style={styles.quickActionIcon}>
                <MaterialCommunityIcons name={icon} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.brandingRow}>
                        <Text style={styles.brandName}>{t('appName')}</Text>
                        <View style={styles.brandDot} />
                    </View>
                    <TouchableOpacity
                        style={styles.locationHeaderRow}
                        onPress={() => navigation.navigate('LocationSettings')}
                    >
                        <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
                        <Text style={styles.locationHeaderText} numberOfLines={1}>
                            {location.address || t('detectingLocation')}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={14} color="#636E72" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRightGroup}>
                    <TouchableOpacity
                        style={styles.languageToggle}
                        onPress={() => setLanguage(language === 'en' ? 'te' : 'en')}
                    >
                        <Text style={styles.languageToggleText}>{language === 'en' ? 'తెలుగు' : 'English'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.notificationBtn}
                        onPress={() => navigation.navigate('Notification')}
                    >
                        <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.text} />
                        {unreadCount > 0 && <View style={styles.notificationBadge} />}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
                {/* Browse Categories */}
                <CategoryRail
                    categories={FEATURED_CATEGORIES.map((c, i) => ({ id: `cat-${i}`, name: c.name, image_url: Image.resolveAssetSource(c.image).uri, icon: '🔧' }))} // Adapting to Category interface
                    onCategoryPress={(id, name) => navigation.navigate('Search', { initialQuery: name })}
                    onViewAllPress={() => navigation.navigate('Categories')}
                />

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                    <View style={styles.quickActionsGrid}>
                        {renderQuickAction(
                            'magnify',
                            t('searchServices'),
                            () => navigation.navigate('Search')
                        )}
                        {renderQuickAction(
                            'plus-circle',
                            t('postRequest'),
                            () => navigation.navigate('PostServiceRequest')
                        )}
                        {renderQuickAction(
                            'history',
                            t('myRequests'),
                            () => navigation.navigate('ServiceRequests')
                        )}
                        {renderQuickAction(
                            'account-outline',
                            t('profileTitle'),
                            () => navigation.navigate('Profile')
                        )}
                    </View>
                </View>

                {/* Banner Ad */}
                <View style={styles.adContainer}>
                    <BannerAd
                        unitId={AD_IDS.BANNER_HOME}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                    />
                </View>

                {/* Recent Service Requests */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('recentRequests')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ServiceRequests')}>
                            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4169E1" />
                        </View>
                    ) : serviceRequests.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No Service Requests Yet</Text>
                            <Text style={styles.emptySubtitle}>Post your first service request to get started</Text>
                            <TouchableOpacity
                                style={styles.emptyActionBtn}
                                onPress={() => navigation.navigate('PostServiceRequest')}
                            >
                                <Text style={styles.emptyActionText}>Post Request</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        serviceRequests.slice(0, 5).map((request) => {
                            const hasNewActivity = request.has_new_activity || false;
                            const newCount = request.new_unlock_count || 0;
                            const totalResponses = request.unlock_count || 0;

                            return (
                                <TouchableOpacity
                                    key={request.id}
                                    style={[
                                        styles.requestCard,
                                        hasNewActivity && styles.requestCardWithActivity
                                    ]}
                                    onPress={() => navigation.navigate('ServiceRequestDetails', { request })}
                                >
                                    <View style={styles.requestHeader}>
                                        <View style={styles.requestInfo}>
                                            <Text style={styles.requestTitle} numberOfLines={1}>
                                                {request.service_categories?.name || 'Service Request'}
                                            </Text>
                                            <Text style={styles.requestDescription} numberOfLines={2}>
                                                {request.description}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(request.status)}15` }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                                                {request.status || 'Pending'}
                                            </Text>
                                        </View>
                                    </View>

                                    {hasNewActivity && (
                                        <View style={styles.activityBanner}>
                                            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#10B981" />
                                            <Text style={styles.activityText}>
                                                {newCount} {newCount === 1 ? 'provider' : 'providers'} responded!
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.requestFooter}>
                                        <View style={styles.requestMeta}>
                                            <MaterialCommunityIcons name="calendar-outline" size={14} color="#999" />
                                            <Text style={styles.requestMetaText}>
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        {request.budget && (
                                            <View style={styles.budgetBadge}>
                                                <Text style={styles.budgetText}>Budget: ₹{parseFloat(request.budget).toLocaleString('en-IN')}</Text>
                                            </View>
                                        )}

                                        {request.urgency && (
                                            <View style={[styles.urgencyBadge, (styles as any)[`urgency_${request.urgency}`]]}>
                                                <Text style={styles.urgencyBadgeText}>
                                                    Urgency: {request.urgency.toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                        {totalResponses > 0 && (
                                            <View style={[
                                                styles.responseBadge,
                                                hasNewActivity && styles.responseBadgeNew
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name="account-multiple"
                                                    size={14}
                                                    color={hasNewActivity ? "#10B981" : "#636E72"}
                                                />
                                                <Text style={[
                                                    styles.responseText,
                                                    hasNewActivity && styles.responseTextNew
                                                ]}>
                                                    {hasNewActivity ? `${newCount} NEW` : totalResponses}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    brandingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: -0.5,
    },
    brandDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.secondary,
        marginLeft: 2,
        marginTop: 8,
    },
    locationHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    locationHeaderText: {
        fontSize: 12,
        color: '#636E72',
        fontWeight: '600',
        maxWidth: 200,
    },
    headerRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    languageToggle: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: COLORS.surface,
    },
    languageToggleText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.primary,
    },
    greeting: {
        fontSize: 14,
        color: '#636E72',
        fontWeight: '500',
    },
    userName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
        marginTop: 2,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#F44336',
        borderWidth: 2,
        borderColor: '#FFF',
        zIndex: 999,
        elevation: 5,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: 'black',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'indigo',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionIcon: {
        width: 70,
        height: 70,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,


        backgroundColor: 'rgba(57, 73, 171, 0.05)', // Amber Gold with 15% opacity
    },
    quickActionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#2D3436',

        textAlign: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D3436',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#636E72',
        marginTop: 8,
        textAlign: 'center',
    },
    emptyActionBtn: {
        marginTop: 20,
        backgroundColor: '#000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyActionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    requestCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    requestCardWithActivity: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
        borderWidth: 1.5,
    },
    activityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    activityText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    requestInfo: {
        flex: 1,
        marginRight: 12,
    },
    requestTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#2D3436',
        marginBottom: 4,
    },
    requestDescription: {
        fontSize: 13,
        color: '#636E72',
        lineHeight: 18,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    requestFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
    },
    requestMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    requestMetaText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    responseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F1F2F6',
    },
    responseBadgeNew: {
        backgroundColor: '#ECFDF5',
    },
    responseText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#636E72',
    },
    responseTextNew: {
        color: '#10B981',
    },
    adContainer: {
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#FFF',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F2F6',
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#ECFDF5',
        borderRadius: 6,
    },
    budgetText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10B981',
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    urgency_low: {
        backgroundColor: '#F3F4F6',
    },
    urgency_medium: {
        backgroundColor: '#DBEAFE',
    },
    urgency_high: {
        backgroundColor: '#FEF3C7',
    },
    urgency_urgent: {
        backgroundColor: '#FEE2E2',
    },
    urgencyBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#636E72',
    },
});

export default HomeScreen;
