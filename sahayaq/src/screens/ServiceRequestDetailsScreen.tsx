import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
    Modal,
    FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { useState, useEffect } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

const ServiceRequestDetailsScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { t } = useLanguage();
    // Initialize with params but allow updates
    const [request, setRequest] = useState(route.params.request);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchRequestDetails();
        // Mark request as viewed to reset new activity indicators
        if (request?.id) {
            api.patch(`/services/request/${request.id}/mark-viewed`).catch(err => {
                console.log('Failed to mark as viewed:', err);
            });
        }
    }, []);

    const fetchRequestDetails = async () => {
        if (!request?.id) {
            setLoading(false);
            return;
        }
        try {
            console.log('Fetching details for request:', request.id);
            const response = await api.get(`/services/request/${request.id}`);
            console.log('Request details response:', response.data);
            if (response.data) {
                // Merge data but be careful with dates and other critical fields
                setRequest((prev: any) => {
                    const next = { ...prev, ...response.data };
                    // If the incoming created_at is an empty object, preserve the previous one
                    if (response.data.created_at &&
                        typeof response.data.created_at === 'object' &&
                        Object.keys(response.data.created_at).length === 0) {
                        next.created_at = prev.created_at;
                    }
                    return next;
                });
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        Alert.alert(
            'Reactivate Request',
            'This will reset the contact count and make your request active again. Do you want to proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Reactivate',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await api.post(`/services/requests/${request.id}/reactivate`);
                            setRequest(response.data);
                            Alert.alert('Success', 'Your request is now active and receiving new responses.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reactivate request.');
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCancel = async () => {
        Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel this request? Providers will no longer be able to contact you.',
            [
                { text: 'No, Keep It', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await api.post(`/services/requests/${request.id}/cancel`);
                            setRequest(response.data);
                            Alert.alert('Cancelled', 'Your request has been cancelled.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel request.');
                            console.error(error);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
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

    if (!request || !request.id) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
                <ActivityIndicator size="large" color="#FF4757" />
                <Text style={{ marginTop: 10, color: '#999' }}>Loading details...</Text>
            </View>
        );
    }

    const statusStyle = getStatusStyle(request.status);

    const formatDate = (dateString: string) => {
        if (!dateString) return '...';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '...';

            const day = date.getDate();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const year = date.getFullYear();

            return `${day} ${month} ${year}`;
        } catch (error) {
            return '...';
        }
    };

    const renderImage = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedImage(item.image_url)}
            style={styles.imageWrapper}
        >
            <Image source={{ uri: item.image_url }} style={styles.headerImage} resizeMode="contain" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                {/* Image Header / Slider */}
                <View style={styles.imageContainer}>
                    {request.media && request.media.length > 0 ? (
                        <FlatList
                            data={request.media}
                            renderItem={renderImage}
                            keyExtractor={(item) => item.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.noImagePlaceholder}>
                            <MaterialCommunityIcons name="image-off-outline" size={64} color="#CCC" />
                            <Text style={styles.noImageText}>No Photos Uploaded</Text>
                        </View>
                    )}

                    {/* Back Button Overlay */}
                    <TouchableOpacity
                        style={[styles.backBtn, { top: insets.top + 10 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>
                                {request.service_categories?.icon} {request.service_categories?.name || 'Service'}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {request.status?.toUpperCase() || 'PENDING'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{request.title}</Text>

                    <View style={styles.postedInfo}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#636E72" />
                            <Text style={styles.postedText}>
                                Posted on {formatDate(request.created_at)}
                            </Text>
                        </View>
                        {request.location_name && (
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#636E72" />
                                <Text style={styles.postedText}>
                                    {request.location_name}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.badgeRow}>
                        {request.budget && (
                            <View style={styles.budgetBadge}>
                                <MaterialCommunityIcons name="cash" size={14} color="#10B981" />
                                <Text style={styles.budgetText}>Budget: ₹{parseFloat(request.budget).toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                        {request.urgency && (
                            <View style={[styles.urgencyBadge, (styles as any)[`urgency_${request.urgency}`]]}>
                                <Text style={styles.urgencyBadgeText}>
                                    {request.urgency.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {request.description || 'No detailed description provided for this request.'}
                    </Text>

                    {/* Card Ad Below Description */}
                    <View style={styles.adContainer}>
                        <BannerAd
                            unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-5362340568713961/6437577804'}
                            size={BannerAdSize.MEDIUM_RECTANGLE}
                            requestOptions={{
                                requestNonPersonalizedAdsOnly: true,
                            }}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Bids Section Placeholder */}
                    <View style={styles.bidsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Responses & Bids</Text>
                            <View style={styles.bidCount}>
                                <Text style={styles.bidCountText}>{request.unlock_count || 0}</Text>
                            </View>
                        </View>

                        {request.interested_providers && request.interested_providers.length > 0 ? (
                            <View>
                                {request.interested_providers.map((item: any) => (
                                    <TouchableOpacity
                                        key={item.unlock_id}
                                        style={styles.providerCard}
                                        onPress={() => navigation.navigate('ServiceProviderDetails', {
                                            providerId: item.provider.id
                                        })}
                                    >
                                        <Image
                                            source={{
                                                uri: item.provider.profile_picture || 'https://via.placeholder.com/100'
                                            }}
                                            style={styles.providerImage}
                                        />
                                        <View style={styles.providerInfo}>
                                            <View style={styles.providerNameRow}>
                                                <Text style={styles.providerName}>{item.provider.display_name}</Text>
                                                {item.provider.is_verified && (
                                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#20BF6B" />
                                                )}
                                            </View>
                                            <View style={styles.ratingRow}>
                                                <MaterialCommunityIcons name="star" size={14} color="#F1C40F" />
                                                <Text style={styles.ratingText}>
                                                    {Number(item.provider.rating || 0).toFixed(1)} ({item.provider.reviews || 0} reviews)
                                                </Text>
                                            </View>
                                            <Text style={styles.categoryName}>{item.provider.category_name}</Text>
                                        </View>
                                        <MaterialCommunityIcons name="chevron-right" size={24} color="#CED6E0" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : request.unlock_count > 0 ? (
                            <View style={[styles.emptyBids, { backgroundColor: '#E3FAFC' }]}>
                                <MaterialCommunityIcons name="account-check-outline" size={48} color="#1098AD" />
                                <Text style={[styles.emptyBidsTitle, { color: '#0B7285' }]}>
                                    {request.unlock_count} Providers Contacted
                                </Text>
                                <Text style={[styles.emptyBidsSubtitle, { color: '#0B7285' }]}>

                                    {request.unlock_count === 1
                                        ? 'A service provider has unlocked your contact details.'
                                        : `${request.unlock_count} service providers have unlocked your contact details.`}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyBids}>
                                <MaterialCommunityIcons name="message-alert-outline" size={48} color="#DFE6E9" />
                                <Text style={styles.emptyBidsTitle}>No responses yet</Text>
                                <Text style={styles.emptyBidsSubtitle}>
                                    Service providers in your area will see your request and start bidding soon.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Area */}
            <View style={styles.bottomBar}>
                {request.unlock_count >= 3 && request.status !== 'cancelled' && (
                    <View style={styles.inactiveWarning}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#C92A2A" />
                        <Text style={styles.inactiveWarningText}>
                            3 providers contacted you. This request is now inactive.
                        </Text>
                    </View>
                )}
                {loading ? (
                    <ActivityIndicator size="large" color="#2D3436" style={{ flex: 1 }} />
                ) : (
                    <View style={styles.bottomBtnRow}>
                        {request.status === 'cancelled' ? (
                            <TouchableOpacity style={styles.reactivateBtn} onPress={handleReactivate}>
                                <Text style={styles.reactivateBtnText}>Reactivate Request</Text>
                            </TouchableOpacity>
                        ) : request.unlock_count >= 3 ? (
                            <>
                                <TouchableOpacity style={styles.reactivateBtn} onPress={handleReactivate}>
                                    <Text style={styles.reactivateBtnText}>Reactivate Request</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                    <Text style={styles.cancelBtnText}>Cancel Request</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.editBtn}
                                    onPress={() => navigation.navigate('PostServiceRequest', { request })}
                                >
                                    <MaterialCommunityIcons name="pencil-outline" size={20} color="#636E72" />
                                    <Text style={styles.editBtnText}>Edit Request</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                                    <Text style={styles.cancelBtnText}>Cancel Request</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Full Screen Image Viewer Modal */}
            {selectedImage && (
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity
                        style={styles.closeModal}
                        onPress={() => setSelectedImage(null)}
                    >
                        <MaterialCommunityIcons name="close" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    imageContainer: {
        width: width,
        height: 300,
        backgroundColor: '#F1F2F6',
    },
    headerImage: {
        width: width,
        height: 300,
        resizeMode: 'contain',
    },
    noImagePlaceholder: {
        width: width,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        marginTop: 10,
        color: '#999',
        fontSize: 14,
        fontWeight: '600',
    },
    backBtn: {
        position: 'absolute',
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    imageWrapper: {
        width: width,
        height: 300,
    },
    fullScreenModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    closeModal: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        zIndex: 1001,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '90%',
    },
    content: {
        padding: 24,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFF',
        marginTop: -30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#FF475710',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF4757',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#2D3436',
        marginBottom: 12,
    },
    postedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    postedText: {
        fontSize: 14,
        color: '#636E72',
        fontWeight: '500',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    adContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F2F6',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#636E72',
        lineHeight: 24,
    },
    bidsSection: {
        marginTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    bidCount: {
        backgroundColor: '#2D3436',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    bidCountText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    emptyBids: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    emptyBidsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
        marginTop: 12,
    },
    emptyBidsSubtitle: {
        fontSize: 14,
        color: '#636E72',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    bottomBar: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 10,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
    },
    bottomBtnRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DFE6E9',
        backgroundColor: '#F8F9FA',
    },
    editBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
    },
    cancelBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FF4757',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    inactiveWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FFC9C9',
    },
    inactiveWarningText: {
        fontSize: 14,
        color: '#C92A2A',
        flex: 1,
        fontWeight: '600',
    },
    reactivateBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#2D3436', // Dark background for emphasis
        justifyContent: 'center',
        alignItems: 'center',
    },
    reactivateBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    providerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F1F2F6',
        marginBottom: 10,
        // Shadow for elevation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    providerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#F1F2F6',
    },
    providerInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    providerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#636E72',
    },
    categoryName: {
        fontSize: 12,
        color: '#B2BEC3',
        fontWeight: '500',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#ECFDF5',
        borderRadius: 8,
    },
    budgetText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    urgencyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
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
        fontSize: 11,
        fontWeight: '800',
        color: '#636E72',
    },
});

export default ServiceRequestDetailsScreen;
