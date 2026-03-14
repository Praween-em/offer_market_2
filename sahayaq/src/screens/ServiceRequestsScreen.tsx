import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_IDS } from '../utils/adConfig';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ServiceRequestsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/services/my-requests');
            const rawRequests = response.data || [];
            const requestsWithAds: any[] = [];
            rawRequests.forEach((req: any, index: number) => {
                requestsWithAds.push(req);
                if ((index + 1) % 3 === 0) {
                    requestsWithAds.push({ id: `ad-${index}`, isAd: true });
                }
            });
            setRequests(requestsWithAds);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const timeSince = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + 'y ago';
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + 'mo ago';
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + 'd ago';
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + 'h ago';
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + 'm ago';
        return Math.floor(seconds) + 's ago';
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { bg: '#FFF9DB', text: '#F59F00' };
            case 'active':
                return { bg: '#E3FAFC', text: '#1098AD' };
            case 'completed':
                return { bg: '#EBFBEE', text: '#37B24D' };
            default:
                return { bg: '#F1F3F5', text: '#495057' };
        }
    };

    const renderRequestItem = ({ item }: { item: any }) => {
        if (item.isAd) {
            return (
                <View style={styles.inlineAdContainer}>
                    <BannerAd
                        unitId={AD_IDS.BANNER_MY_REQUESTS}
                        size={BannerAdSize.LARGE_BANNER}
                        requestOptions={{
                            requestNonPersonalizedAdsOnly: true,
                        }}
                    />
                    <Text style={styles.adTag}>Sponsored Result</Text>
                </View>
            );
        }

        const statusStyle = getStatusStyle(item.status);
        const hasImages = item.media && item.media.length > 0;
        const hasNewActivity = item.has_new_activity || false;
        const newCount = item.new_unlock_count || 0;
        const totalResponses = item.unlock_count || 0;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    hasNewActivity && styles.cardWithActivity
                ]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ServiceRequestDetails', { request: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                            {item.service_categories?.name || 'Service'}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.textContent}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description || 'No description provided'}
                        </Text>
                    </View>
                    {hasImages && (
                        <Image
                            source={{ uri: item.media[0].image_url }}
                            style={styles.thumbnail}
                        />
                    )}
                </View>

                <View style={styles.cardFooter}>
                    {hasNewActivity && (
                        <View style={styles.activityBanner}>
                            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#10B981" />
                            <Text style={styles.activityText}>
                                {newCount} {newCount === 1 ? 'provider' : 'providers'} responded!
                            </Text>
                        </View>
                    )}


                    <View style={styles.footerRow}>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#636E72" />
                            <Text style={styles.footerText}>Posted {timeSince(item.created_at)}</Text>
                        </View>

                        {item.budget && (
                            <View style={styles.budgetBadge}>
                                <Text style={styles.budgetText}>Budget: ₹{item.budget}</Text>
                            </View>
                        )}

                        {item.urgency && (
                            <View style={[styles.urgencyBadge, (styles as any)[`urgency_${item.urgency}`]]}>
                                <Text style={styles.urgencyBadgeText}>
                                    Urgency: {item.urgency.toUpperCase()}
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
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Service Requests</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.bannerContainer}>
                <BannerAd
                    unitId={AD_IDS.BANNER_MY_REQUESTS}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF4757" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4757']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#DFE6E9" />
                            <Text style={styles.emptyText}>No requests posted yet</Text>
                            <TouchableOpacity
                                style={styles.postBtn}
                                onPress={() => navigation.navigate('PostServiceRequest')}
                            >
                                <Text style={styles.postBtnText}>Post a Request</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
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
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#FF475710',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FF4757',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    cardBody: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    textContent: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#636E72',
        lineHeight: 20,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F1F2F6',
    },
    cardWithActivity: {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
        borderWidth: 1.5,
    },
    cardFooter: {
        flexDirection: 'column',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
    },
    activityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    activityText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#636E72',
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#B2BEC3',
        marginTop: 16,
        marginBottom: 24,
        fontWeight: '600',
    },
    postBtn: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    postBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    bannerContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
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
    inlineAdContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        paddingVertical: 16,
        backgroundColor: '#FFF',
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

export default ServiceRequestsScreen;
