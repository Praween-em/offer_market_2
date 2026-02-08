import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, FlatList, RefreshControl, Image, ActivityIndicator, Linking, TextInput, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { LocationService } from '../../services/LocationService';

const FeedScreen = ({ navigation }: any) => {
    const { refreshUser, user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'blocked' | 'detecting'>('detecting');
    const [currentLocation, setCurrentLocation] = useState<string>('Detecting location...');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const fetchFeed = async (lat?: number, lng?: number) => {
        console.log('[FeedScreen] fetchFeed started with coords:', lat, lng);
        try {
            const url = lat && lng
                ? `/services/provider-feed?lat=${lat}&lng=${lng}`
                : '/services/provider-feed';
            const response = await api.get(url);
            console.log('[FeedScreen] fetchFeed success:', response.data?.length, 'items');
            setRequests(response.data);
        } catch (error: any) {
            console.error('[FeedScreen] fetchFeed failed:', error.message);
        } finally {
            console.log('[FeedScreen] fetchFeed finished, setting loading false');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const detectLocation = async (): Promise<{ lat?: number, lng?: number } | null> => {
        console.log('[FeedScreen] detectLocation started');
        setLocationStatus('detecting');
        try {
            const status = await LocationService.requestLocationPermission();
            if (status === 'granted') {
                const loc = await LocationService.getCurrentLocation();
                if (loc) {
                    setLocationStatus('granted');
                    console.log('[FeedScreen] Location detected:', loc.latitude, loc.longitude);

                    // Fire and forget reverse geocode for UI
                    updateLocalityName(loc.latitude, loc.longitude);

                    return { lat: loc.latitude, lng: loc.longitude };
                } else {
                    console.log('[FeedScreen] Location fetch returned null');
                    setLocationStatus('denied');
                    setCurrentLocation('Signal Weak');
                }
            } else if (status === 'never_ask_again') {
                setLocationStatus('blocked');
                setCurrentLocation('Location Blocked');
            } else {
                setLocationStatus('denied');
                setCurrentLocation('Location Denied');
            }
        } catch (error: any) {
            console.error('[FeedScreen] detectLocation failed:', error.message);
            setLocationStatus('denied');
            setCurrentLocation('Location error');
        }
        return null;
    };

    const updateLocalityName = async (lat: number, lng: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: { 'User-Agent': 'ServicesApp' },
                    signal: controller.signal
                }
            );
            clearTimeout(timeoutId);
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                const locality = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || addr.locality || '';
                const city = addr.city || addr.town || addr.village || '';
                setCurrentLocation(locality ? `${locality}, ${city}` : city || "Unknown Location");
            } else {
                setCurrentLocation("Address not found");
            }
        } catch (geocoderError) {
            console.warn('[FeedScreen] Reverse geocode failed:', geocoderError);
            setCurrentLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    const handleLocationPress = async () => {
        if (locationStatus === 'denied' || locationStatus === 'blocked') {
            Alert.alert(
                'Location Access',
                'Sahayaq needs your location to find nearby jobs and service requests for you. Would you like to allow access?',
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

    const filteredRequests = requests.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.service_categories?.name?.toLowerCase().includes(query)
        );
    });

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

        return (
            <TouchableOpacity
                style={styles.feedCard}
                onPress={() => navigation.navigate('ServiceRequestDetails', { requestId: item.id })}
            >
                <View style={styles.feedHeader}>
                    <View style={styles.userInfo}>
                        {item.users?.profile_picture ? (
                            <Image source={{ uri: item.users.profile_picture }} style={styles.userAvatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="user" size={16} color={COLORS.primary} />
                            </View>
                        )}
                        <View>
                            <Text style={styles.userName}>{item.users?.display_name || 'Customer'}</Text>
                            <Text style={styles.timeText}>{timeAgo}</Text>
                        </View>
                    </View>
                    {isMatched && (
                        <View style={styles.matchBadge}>
                            <Icon name="star" size={10} color={COLORS.secondary} />
                            <Text style={styles.matchText}>MATCHED</Text>
                        </View>
                    )}
                </View>

                {item.media && item.media.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.feedImageContainer}>
                        {item.media.map((m: any, idx: number) => (
                            <Image key={idx} source={{ uri: m.image_url }} style={styles.feedImage} />
                        ))}
                    </ScrollView>
                )}

                <View style={styles.contentBox}>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                    <Text style={styles.categoryText}>#{categories}</Text>
                    {item.description && (
                        <Text style={styles.feedDescription} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    {(item.location_name || item.distance_km !== undefined) && (
                        <View style={styles.locationRow}>
                            <Icon name="map-pin" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {item.location_name || 'Nearby'}
                                {item.distance_km !== null && item.distance_km !== undefined ? ` • ${item.distance_km} km away` : ''}
                            </Text>
                        </View>
                    )}
                    {item.budget && (
                        <View style={styles.budgetRow}>
                            <Icon name="dollar-sign" size={14} color={COLORS.secondary} />
                            <Text style={styles.budgetText}>
                                Budget: ₹{item.budget}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.respondButton}
                        onPress={() => navigation.navigate('ServiceRequestDetails', { requestId: item.id })}
                    >
                        <Icon name="eye" size={18} color={COLORS.white} />
                        <Text style={styles.respondText}>View & Contact</Text>
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
                                <Text style={styles.brandName}>Sahayaq</Text>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.secondary, marginLeft: 2 }}>+</Text>
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
                    </>
                )}
            </View>
            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
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
        borderRadius: 20,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    feedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: SPACING.sm,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    userName: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
        fontSize: 14,
    },
    timeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    matchText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#D97706',
    },
    feedImageContainer: {
        marginBottom: SPACING.md,
    },
    feedImage: {
        width: 280,
        height: 180,
        borderRadius: 12,
        marginRight: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    contentBox: {
        marginBottom: SPACING.lg,
    },
    feedTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 18,
        marginBottom: 4,
        color: COLORS.text,
    },
    categoryText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontWeight: '700',
        marginBottom: SPACING.sm,
    },
    feedDescription: {
        ...TYPOGRAPHY.bodySecondary,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: SPACING.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: SPACING.xs,
    },
    locationText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        flex: 1,
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: SPACING.xs,
    },
    budgetText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondary,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    respondButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        ...SHADOWS.small,
    },
    respondText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    detailsButton: {
        flex: 1,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    detailsText: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
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
