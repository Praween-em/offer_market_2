import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image, ActivityIndicator, Linking, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { LocationService } from '../../services/LocationService';
import NativeAdItem from '../../components/NativeAdItem';
import { getCategoryAsset } from '../../utils/CategoryAssets';

const FeedScreen = ({ navigation }: any) => {
    const { refreshUser, user } = useAuth();
    const { unreadCount, refreshUnreadCount } = useNotifications();

    // Refresh unread count every time user views this screen
    useFocusEffect(
        useCallback(() => {
            refreshUnreadCount();
        }, [refreshUnreadCount])
    );
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'blocked' | 'detecting'>('detecting');
    const [currentLocation, setCurrentLocation] = useState<string>('Detecting location...');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const fetchFeed = async (lat?: number, lng?: number) => {
        try {
            const url = lat && lng
                ? `/services/provider-feed?lat=${lat}&lng=${lng}`
                : '/services/provider-feed';
            const response = await api.get(url);
            setRequests(response.data);
        } catch (error: any) {
            console.error('[FeedScreen] fetchFeed failed:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const detectLocation = async (): Promise<{ lat?: number, lng?: number } | null> => {
        setLocationStatus('detecting');
        try {
            const status = await LocationService.requestLocationPermission();
            if (status === 'granted') {
                const loc = await LocationService.getCurrentLocation();
                if (loc) {
                    setLocationStatus('granted');
                    LocationService.reverseGeocode(loc.latitude, loc.longitude).then(address => {
                        setCurrentLocation(address);
                    });
                    return { lat: loc.latitude, lng: loc.longitude };
                } else {
                    setLocationStatus('denied');
                    setCurrentLocation('Turn on Location');
                }
            } else if (status === 'never_ask_again') {
                setLocationStatus('blocked');
                setCurrentLocation('Turn on Location');
            } else {
                setLocationStatus('denied');
                setCurrentLocation('Turn on Location');
            }
        } catch (error: any) {
            console.error('[FeedScreen] detectLocation failed:', error.message);
            setLocationStatus('denied');
            setCurrentLocation('Location error');
        }
        return null;
    };



    const handleLocationPress = async () => {
        if (locationStatus === 'denied' || locationStatus === 'blocked') {
            Alert.alert(
                'Location Access',
                'My Sahayaq needs your location to find nearby jobs and service requests for you. Would you like to allow access?',
                [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Allow', onPress: () => detectLocation() }
                ]
            );
        } else {
            await detectLocation();
        }
    };

    useEffect(() => {
        const init = async () => {
            const coords = await detectLocation();
            if (coords) {
                fetchFeed(coords.lat, coords.lng);
            } else {
                fetchFeed();
            }
        };
        init();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        refreshUser(); // Fire and forget
        const coords = await detectLocation();
        if (coords) {
            await fetchFeed(coords.lat, coords.lng);
        } else {
            await fetchFeed();
        }
    }, [refreshUser]);

    const processedRequests = React.useMemo(() => {
        const result = [];
        const filtered = requests.filter(item => {
            const query = searchQuery.toLowerCase();
            return (
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.service_categories?.name?.toLowerCase().includes(query)
            );
        });

        for (let i = 0; i < filtered.length; i++) {
            result.push(filtered[i]);
            // Insert ad every 3 items
            if ((i + 1) % 3 === 0 && i !== filtered.length - 1) {
                result.push({ id: `ad-${i}`, isAd: true });
            }
        }
        return result;
    }, [requests, searchQuery]);

    const toggleSearch = () => {
        if (showSearch) {
            setSearchQuery('');
            setShowSearch(false);
        } else {
            setShowSearch(true);
        }
    };

    const renderFeedItem = ({ item }: { item: any }) => {
        let timeAgo = 'Just now';
        try {
            if (item.created_at) {
                const date = new Date(item.created_at);
                if (!isNaN(date.getTime())) {
                    timeAgo = formatDistanceToNow(date, { addSuffix: true });
                }
            }
        } catch (e) {
            console.warn('Date parsing error', e);
        }
        const categories = item.service_categories?.name || 'General';
        const isMatched = item.category_id === user?.provider?.category_id;

        const slotsRemaining = 3 - (item.unlock_count || 0);
        const isUrgent = item.created_at && (new Date().getTime() - new Date(item.created_at).getTime() < 24 * 60 * 60 * 1000); // Less than 24h old

        if (item.isAd) {
            return <NativeAdItem />;
        }

        return (
            <TouchableOpacity
                style={styles.feedCard}
                onPress={() => navigation.navigate('ServiceRequestDetails', { requestId: item.id })}
            >
                {/* 1. Header: Category & Slots */}
                <View style={styles.cardHeader}>
                    <View style={styles.categoryInfo}>
                        {getCategoryAsset(categories) && (
                            <Image
                                source={getCategoryAsset(categories)}
                                style={styles.cardCategoryIcon}
                            />
                        )}
                        <Text style={styles.categoryText}>{categories}</Text>
                    </View>
                    {isMatched ? (
                        <View style={styles.matchBadge}>
                            <Icon name="star" size={10} color={COLORS.secondary} />
                            <Text style={styles.matchText}>MATCHED</Text>
                        </View>
                    ) : (
                        <View style={[styles.slotsBadge, slotsRemaining <= 1 && styles.lowSlotsBadge]}>
                            <Icon name="users" size={10} color={slotsRemaining <= 1 ? COLORS.error : COLORS.textSecondary} />
                            <Text style={[styles.slotsText, slotsRemaining <= 1 && styles.lowSlotsText]}>
                                {slotsRemaining} {slotsRemaining === 1 ? 'Slot' : 'Slots'} left
                            </Text>
                        </View>
                    )}
                </View>

                {/* 2. Body: Title, Location/Distance */}
                <View style={styles.bodyContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.feedTitle} numberOfLines={2}>

                            {item.title}
                        </Text>
                        {isUrgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>NEW</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.metaRow}>
                        {item.location_name && (
                            <View style={styles.locationTag}>
                                <Icon name="map-pin" size={12} color={COLORS.textSecondary} />
                                <Text style={styles.locationTagText}>{item.location_name.split(',')[0]}</Text>
                            </View>
                        )}
                        {item.distance_km !== undefined && item.distance_km !== null && (
                            <View style={styles.distanceTag}>
                                <Icon name="navigation" size={12} color={COLORS.textSecondary} />
                                <Text style={styles.distanceTagText}>
                                    {item.distance_km < 1 ? 'less than 1 km' : `${item.distance_km} km`}
                                </Text>
                            </View>
                        )}
                    </View>

                    {item.description && (
                        <Text style={styles.feedDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}

                    <View style={styles.badgeRow}>
                        {item.budget && (
                            <View style={styles.budgetBadge}>
                                <Text style={styles.budgetText}>Budget: ₹{parseFloat(item.budget).toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                        {item.urgency && (
                            <View style={[styles.urgencyBadge, (styles as any)[`urgency_${item.urgency}`]]}>
                                <Text style={styles.urgencyText_badge}>
                                    Urgency: {item.urgency.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 3. Media Section */}
                {item.media && item.media.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.feedImageContainer}>
                        {item.media.map((m: any, idx: number) => (
                            <Image key={idx} source={{ uri: m.image_url }} style={styles.feedImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                )}

                {/* 4. Footer: User Info & Action */}
                <View style={styles.cardFooter}>
                    <View style={styles.footerUserInfo}>
                        {item.users?.profile_picture ? (
                            <Image source={{ uri: item.users.profile_picture }} style={styles.footerAvatar} />
                        ) : (
                            <View style={styles.footerAvatarPlaceholder}>
                                <Icon name="user" size={14} color={COLORS.primary} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.footerUserName} numberOfLines={1} ellipsizeMode="tail">
                                {item.users?.display_name || 'Customer'}
                            </Text>
                            <Text style={styles.footerTimeText}>{timeAgo}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.compactRespondButton}
                        onPress={() => navigation.navigate('ServiceRequestDetails', { requestId: item.id })}
                    >
                        <Text style={styles.respondButtonText}>View & Contact</Text>
                        <Icon name="chevron-right" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {showSearch ? (
                    <View style={styles.searchBarContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search requests..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={toggleSearch}>
                            <Icon name="x" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.headerLeft}>
                            <View style={styles.brandingRow}>
                                <Text style={styles.brandName}>My Sahayaq</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.locationHeader}
                                onPress={handleLocationPress}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.locationIconContainer,
                                    locationStatus === 'denied' && { backgroundColor: '#FEE2E2' },
                                    locationStatus === 'detecting' && { backgroundColor: '#EFF6FF' }
                                ]}>
                                    <Icon
                                        name={locationStatus === 'denied' ? "alert-circle" : "map-pin"}
                                        size={12}
                                        color={locationStatus === 'denied' ? COLORS.error : COLORS.primary}
                                    />
                                </View>
                                <View style={styles.locationTextContainer}>
                                    <Text style={[
                                        styles.currentLocationText,
                                        locationStatus === 'denied' && { color: COLORS.error }
                                    ]} numberOfLines={1}>
                                        {locationStatus === 'detecting' ? 'Detecting...' : currentLocation}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleSearch}>
                            <Icon name="search" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Icon name="bell" size={24} color={COLORS.text} />
                            {unreadCount > 0 && <View style={styles.notificationBadge} />}
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={processedRequests}
                    renderItem={renderFeedItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyFeed}>
                            <Icon name="inbox" size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No matching requests found' : 'No new requests found'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery ? 'Try adjusting your search terms' : "We'll notify you when someone posts a job in your category."}
                            </Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    iconButton: {
        padding: SPACING.xs,
    },
    searchBarContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: 8,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    headerLeft: {
        flex: 1,
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
        width: 25,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.secondary,
        marginLeft: 2,
        marginTop: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.error,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    locationIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTextContainer: {
        flex: 1,
    },
    currentLocationText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    locationStatusSubtext: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: -2,
    },
    listContent: {
        padding: SPACING.md,
    },
    feedCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        backgroundColor: `${COLORS.primary}08`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardCategoryIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 6,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    matchText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#D97706',
    },
    slotsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.textSecondary}08`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    lowSlotsBadge: {
        backgroundColor: '#FFF1F2',
    },
    slotsText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    lowSlotsText: {
        color: COLORS.error,
    },
    bodyContent: {
        marginBottom: SPACING.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
        gap: SPACING.sm,
    },
    feedTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.text,
        flex: 1,
        lineHeight: 24,
    },

    urgentBadge: {
        backgroundColor: `${COLORS.secondary}15`,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
        flexWrap: 'wrap',
    },
    locationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationTagText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    distanceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    distanceTagText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    feedDescription: {
        ...TYPOGRAPHY.bodySecondary,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    budgetText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#059669',
    },
    urgencyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    urgency_low: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    urgency_medium: {
        backgroundColor: '#EFF6FF',
        borderColor: '#DBEAFE',
    },
    urgency_high: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FFEDD5',
    },
    urgency_urgent: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FEE2E2',
    },
    urgencyText_badge: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.textSecondary,
    },
    feedImageContainer: {
        marginBottom: SPACING.lg,
    },
    feedImage: {
        width: 280,
        height: 180,
        borderRadius: 16,
        marginRight: SPACING.md,
        backgroundColor: COLORS.background,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerUserInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginRight: SPACING.md,
    },
    footerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    footerAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerUserName: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    footerTimeText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    compactRespondButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
        ...SHADOWS.small,
    },
    respondButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyFeed: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
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
});

export default FeedScreen;
