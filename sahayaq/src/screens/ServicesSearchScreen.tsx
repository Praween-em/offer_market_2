import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_IDS } from '../utils/adConfig';
import api from '../services/api';
import { getServiceIcon } from '../utils/serviceIcons';
import VerificationBadge from '../components/VerificationBadge';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { COLORS } from '../utils/theme';

const { width } = Dimensions.get('window');

const ServicesSearchScreen = ({ navigation, route }: any) => {
    const initialQuery = route.params?.initialQuery || '';
    const insets = useSafeAreaInsets();
    const { t, translateData } = useLanguage();
    const { location, detectLocation } = useLocation();
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(route.params?.categoryId || null);
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const categoryListRef = useRef<FlatList>(null);

    // Priority list - these categories will appear first in this order
    const PRIORITY_CATEGORIES = [
        'Electrician',
        'Electricians',
        'Electrical',
        'Plumber',
        'Plumbers',
        'Plumbing',
        'Home Chef',
        'Cooking & Chefs',
        'Food & Kitchen',
        'Part-time Cook',
        'Home Cleaning',
        'Regular Home Cleaning',
        'Cleaning & Hygiene',
        'Appliance Repair',
        'Carpenter',
        'Carpenters',
        'Painting',
        'Elderly Care',
        'Senior & Special Care',
        'Driver',
        'Drivers',
        'Welding Workers',
        'Welding',
        'Care Helper',
        'Caregiver',
        'Car Mechanic',
        'Bike Mechanic',
        'Vehicle Services',
        'Automotive',
        'AC Service',
        'AC Service & Repair',
    ];

    useEffect(() => {
        const init = async () => {
            fetchCategories();
            // Try to get fresh location before fetching providers
            await detectLocation();
            fetchProviders(initialQuery || '', null);
        };
        init();
    }, []);

    useEffect(() => {
        // Check if category was passed from navigation
        if (route.params?.categoryId && route.params.categoryId !== selectedCategory) {
            setSelectedCategory(route.params.categoryId);
        }
    }, [route.params?.categoryId]);

    useEffect(() => {
        // Update search query from route params
        if (initialQuery && initialQuery !== searchQuery) {
            setSearchQuery(initialQuery);
        }
    }, [initialQuery]);

    useEffect(() => {
        if (selectedCategory && categories.length > 0 && categoryListRef.current) {
            const index = categories.findIndex(c => c.id === selectedCategory);
            if (index !== -1) {
                setTimeout(() => {
                    categoryListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.5
                    });
                }, 100);
            }
        }
    }, [selectedCategory, categories]);

    // Refetch providers when search query or category changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProviders(searchQuery, selectedCategory);
        }, 300); // Debounce search by 300ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/services/categories');
            const fetchedCategories = response.data || [];

            // Sort categories: priority ones first, then others
            const sortedCategories = sortCategoriesByPriority(fetchedCategories);
            setCategories(sortedCategories);
        } catch (error) {
            console.error('Fetch service categories error:', error);
        }
    };

    const sortCategoriesByPriority = (cats: any[]) => {
        const priorityMap = new Map();
        PRIORITY_CATEGORIES.forEach((name, index) => {
            priorityMap.set(name.toLowerCase(), index);
        });

        return [...cats].sort((a, b) => {
            const aPriority = priorityMap.get(a.name?.toLowerCase()) ?? 999;
            const bPriority = priorityMap.get(b.name?.toLowerCase()) ?? 999;

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            // If both have same priority (or no priority), sort alphabetically
            return (a.name || '').localeCompare(b.name || '');
        });
    };

    const fetchProviders = async (query = '', catId = selectedCategory) => {
        setLoading(true);
        try {
            let url = '/services/providers';
            const params: string[] = [];
            if (catId) params.push(`categoryId=${catId}`);
            if (query) params.push(`search=${query}`);

            // Add location if available
            if (location.latitude && location.longitude) {
                params.push(`lat=${location.latitude}`);
                params.push(`lng=${location.longitude}`);
            }

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const response = await api.get(url);
            // Inject Ad placeholders every 5 items
            const providersWithAds: any[] = [];
            const rawProviders: any[] = response.data || [];
            rawProviders.forEach((p: any, index: number) => {
                providersWithAds.push(p);
                if ((index + 1) % 3 === 0) {
                    providersWithAds.push({ id: `ad-${index}`, isAd: true });
                }
            });
            setProviders(providersWithAds);
        } catch (error) {
            console.error('Fetch providers search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim().length > 0 && selectedCategory !== null) {
            setSelectedCategory(null);
        }
    };

    const handleCategoryPress = (catId: string) => {
        const isDeselecting = selectedCategory === catId;
        const newCat = isDeselecting ? null : catId;

        // If selecting a NEW category, clear the search query to show all providers in that category
        if (!isDeselecting && searchQuery.length > 0) {
            setSearchQuery('');
        }

        setSelectedCategory(newCat);
    };

    const renderProviderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity
                style={styles.providerCard}
                onPress={() => navigation.navigate('ServiceProviderDetails', { providerId: item.id })}
            >
                <View style={styles.providerHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: item.users?.profile_picture || 'https://via.placeholder.com/60' }}
                            style={[
                                styles.providerAvatar,
                                item.is_verified ? styles.verifiedAvatarRing : styles.unverifiedAvatarRing
                            ]}
                        />
                        <View style={styles.badgeOverlay}>
                            <VerificationBadge isVerified={item.is_verified} size="small" />
                        </View>
                    </View>
                    <View style={styles.providerInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.providerName} numberOfLines={1}>{translateData(item.display_name)}</Text>
                        </View>
                        <Text style={styles.providerCategory}>{translateData(item.service_categories?.name)}</Text>
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>
                                {item.average_rating
                                    ? `${Number(item.average_rating).toFixed(1)} (${item.total_reviews || 0} reviews)`
                                    : item.total_reviews > 0
                                        ? `${item.total_reviews} reviews`
                                        : 'No reviews yet'
                                }
                            </Text>
                        </View>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>{t('startsFrom')}</Text>
                        <Text style={styles.priceValue}>₹{item.starting_price}</Text>
                    </View>
                </View>
                <View style={styles.providerFooter}>
                    <View style={styles.tag}>
                        <MaterialCommunityIcons name="briefcase-outline" size={12} color="#636E72" />
                        <Text style={styles.tagText}>{item.experience_years || '5'}+ {t('yearsExp')}</Text>
                    </View>
                    <View style={styles.tag}>
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color="#636E72" />
                        <Text style={styles.tagText}>
                            {item.distance_km
                                ? `${item.distance_km.toFixed(1)} km away`
                                : (translateData(item.service_area) || 'Kalyan Nagar')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Search Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('searchTitle')}</Text>

                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={selectedCategory
                            ? `${t('searchIn')} ${translateData(categories.find(c => c.id === selectedCategory)?.name || '')}`
                            : t('searchServices')}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#999"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#CCC" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    ref={categoryListRef}
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    keyExtractor={(item) => `search-cat-${item.id}`}
                    getItemLayout={(data, index) => (
                        { length: 80, offset: 80 * index, index }
                    )}
                    onScrollToIndexFailed={(info) => {
                        console.log('Scroll to index failed');
                    }}
                    renderItem={({ item }) => {
                        const isActive = selectedCategory === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.categoryPill,
                                    isActive && styles.activeCategoryPill
                                ]}
                                onPress={() => handleCategoryPress(item.id)}
                            >
                                <View style={[
                                    styles.iconCircle,
                                    isActive && styles.activeIconCircle
                                ]}>
                                    {getServiceIcon(item.name) ? (
                                        <Image
                                            source={getServiceIcon(item.name)}
                                            style={styles.searchCatIcon}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={item.icon || 'circle-outline'}
                                            size={24}
                                            color={isActive ? '#FFF' : COLORS.primary}
                                        />
                                    )}
                                </View>
                                <Text style={[
                                    styles.categoryText,
                                    isActive && styles.activeCategoryText
                                ]} numberOfLines={1}>
                                    {translateData(item.name)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : providers.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="account-search-outline" size={80} color="#F1F2F6" />
                    <Text style={styles.emptyTitle}>{t('noProviders')}</Text>
                    <Text style={styles.emptySubtitle}>{t('tryElse')}</Text>
                </View>
            ) : (
                <FlatList
                    data={providers}
                    renderItem={({ item, index }) => {
                        if (item.isAd) {
                            return (
                                <View style={styles.inlineAdContainer}>
                                    <BannerAd
                                        unitId={AD_IDS.BANNER_HOME}
                                        size={BannerAdSize.LARGE_BANNER}
                                        requestOptions={{
                                            requestNonPersonalizedAdsOnly: true,
                                        }}
                                    />
                                    <Text style={styles.adTag}>Sponsored Result</Text>
                                </View>
                            );
                        }
                        return renderProviderItem({ item });
                    }}
                    keyExtractor={(item) => `search-res-${item.id}`}
                    contentContainerStyle={styles.resultsList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
        paddingVertical: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 45,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#2D3436',
        marginLeft: 8,
        fontWeight: '500',
    },
    categoriesContainer: {
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    categoriesList: {
        paddingHorizontal: 16,
        gap: 12,
    },
    categoryPill: {
        alignItems: 'center',
        width: 70,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        marginBottom: 8,
    },
    activeIconCircle: {
        backgroundColor: COLORS.primary + '10',
        borderColor: COLORS.primary,
    },
    activeCategoryPill: {
        // No background change for the pill itself
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#636E72',
        textAlign: 'center',
    },
    activeCategoryText: {
        color: COLORS.primary,
        fontWeight: '800',
    },
    searchCatIcon: {
        width: 32,
        height: 32,
    },
    resultsList: {
        padding: 16,
        paddingBottom: 40,
    },
    providerCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    providerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F8F9FA',
    },
    providerInfo: {
        flex: 1,
        marginLeft: 20, // Increased gap
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    badgeOverlay: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        transform: [{ translateX: -30 }], // Half of badge width approx
        zIndex: 10,
    },
    verifiedAvatarRing: {
        borderWidth: 2,
        borderColor: '#1E90FF',
    },
    unverifiedAvatarRing: {
        borderWidth: 2,
        borderColor: '#FF4757', // Red for unverified
    },
    providerName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#2D3436',
    },
    providerCategory: {
        fontSize: 13,
        color: '#636E72',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#2D3436',
        fontWeight: '600',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 10,
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#2D3436',
    },
    providerFooter: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
        gap: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 11,
        color: '#636E72',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#636E72',
        marginTop: 4,
        textAlign: 'center',
    },
    inlineAdContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        paddingVertical: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        overflow: 'hidden',
    },
    adTag: {
        fontSize: 10,
        color: '#B2BEC3',
        fontWeight: '700',
        marginTop: 8,
        textTransform: 'uppercase',
    },
});

export default ServicesSearchScreen;
