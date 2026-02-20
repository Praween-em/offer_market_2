import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Linking,
    Platform,
    Share,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';
import VerificationBadge from '../components/VerificationBadge';
import { useLanguage } from '../context/LanguageContext';
import { COLORS } from '../utils/theme';
import ReportModal from '../components/ReportModal';
import AdGateModal from '../components/AdGateModal';

const { width } = Dimensions.get('window');

const ServiceProviderDetailsScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t, translateData } = useLanguage();
    const { providerId } = route.params;

    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showAdGate, setShowAdGate] = useState(false);
    const [pendingAction, setPendingAction] = useState<'call' | 'whatsapp' | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        fetchProviderDetails();
    }, [providerId]);

    const fetchProviderDetails = async () => {
        try {
            const response = await api.get(`/services/providers/${providerId}`);
            setProvider(response.data);
        } catch (error) {
            console.error('Fetch provider details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (!provider?.isUnlocked) {
            setPendingAction('call');
            setShowAdGate(true);
            return;
        }
        if (provider?.phone_number) {
            Linking.openURL(`tel:${provider.phone_number}`);
        }
    };

    const formatWhatsAppNumber = (number: string): string => {
        // Strip spaces, dashes, and any existing + prefix
        let cleaned = number.replace(/[\s\-()]/g, '').replace(/^\+/, '');
        // If number starts with 91 and is 12 digits, it's already international
        if (/^91\d{10}$/.test(cleaned)) return cleaned;
        // If it's a 10-digit Indian mobile number, prepend country code
        if (/^[6-9]\d{9}$/.test(cleaned)) return `91${cleaned}`;
        // Fallback: return as-is (handles edge cases)
        return cleaned;
    };

    const handleWhatsApp = () => {
        if (!provider?.isUnlocked) {
            setPendingAction('whatsapp');
            setShowAdGate(true);
            return;
        }
        if (provider?.whatsapp_number) {
            const phone = formatWhatsAppNumber(provider.whatsapp_number);
            Linking.openURL(`whatsapp://send?phone=${phone}&text=${t('whatsappMessage')}`);
        }
    };

    const handleAdComplete = async (token: string) => {
        try {
            setShowAdGate(false);
            const response = await api.post(`/services/providers/${providerId}/unlock`, {
                adToken: token
            });

            // Re-fetch provider details to get the unlocked phone number
            const updatedResponse = await api.get(`/services/providers/${providerId}`);
            const updatedProvider = updatedResponse.data;

            // Update the provider state
            setProvider(updatedProvider);

            // Execute the pending action with the actual unlocked phone number
            if (pendingAction === 'call' && updatedProvider?.phone_number) {
                Linking.openURL(`tel:${updatedProvider.phone_number}`);
            } else if (pendingAction === 'whatsapp' && updatedProvider?.whatsapp_number) {
                const phone = formatWhatsAppNumber(updatedProvider.whatsapp_number);
                Linking.openURL(`whatsapp://send?phone=${phone}&text=${t('whatsappMessage')}`);
            }

            setPendingAction(null);
        } catch (error) {
            console.error('Unlock error:', error);
            Alert.alert('Error', 'Failed to unlock contact details. Please try again.');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${translateData(provider?.display_name)} on ${t('appName')}! Service: ${translateData(provider?.service_categories?.name)}`,
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleReport = async (reason: string, notes: string) => {
        try {
            await api.post(`/users/provider/${providerId}/report`, {
                reason,
                notes
            });
            Alert.alert(t('reported') || 'Reported', 'Your report has been submitted.');
        } catch (error) {
            console.error('Report error:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="circle-outline" size={40} color={COLORS.primary} />
            </View>
        );
    }

    if (!provider) {
        return (
            <View style={styles.errorContainer}>
                <Text>{t('noProviders')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero / Portfolio Section */}
                <View style={styles.heroContainer}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedImage(provider.users?.profile_picture)}
                        style={styles.heroImageWrapper}
                    >
                        <Image
                            source={{ uri: provider.users?.profile_picture || 'https://via.placeholder.com/400' }}
                            style={[
                                styles.heroImage,
                                provider.is_verified ? styles.verifiedHeroBorder : styles.unverifiedHeroBorder
                            ]}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{translateData(provider.service_categories?.name)}</Text>
                    </View>
                    <View style={styles.detailBadgeOverlay}>
                        <VerificationBadge isVerified={provider.is_verified} size="large" />
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Header Info */}
                    <View style={styles.mainInfo}>
                        <View style={styles.nameRow}>
                            <Text style={styles.displayName}>{translateData(provider.display_name)}</Text>
                        </View>
                        <View style={styles.ratingRow}>
                            {provider.average_rating > 0 && (
                                <MaterialCommunityIcons name="star" size={16} color="#FFA502" />
                            )}
                            <Text style={styles.ratingText}>
                                {provider.average_rating
                                    ? `${Number(provider.average_rating).toFixed(1)} (${provider.total_reviews || 0} reviews)`
                                    : 'No reviews yet'
                                }
                            </Text>
                            <View style={styles.dot} />
                            <Text style={styles.experienceText}>{provider.experience_years} {t('yearsExp')}</Text>
                        </View>

                        {/* Secondary Actions */}
                        <View style={styles.secondaryActions}>
                            <TouchableOpacity style={styles.actionPill} onPress={handleShare}>
                                <MaterialCommunityIcons name="share-variant" size={18} color="#636E72" />
                                <Text style={styles.actionPillText}>{t('share') || 'Share'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionPill, styles.reportPill]} onPress={() => setShowReportModal(true)}>
                                <MaterialCommunityIcons name="flag-outline" size={18} color={COLORS.error} />
                                <Text style={[styles.actionPillText, { color: COLORS.error }]}>{t('report') || 'Report'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                            <Text style={styles.statLabel}>{t('serviceArea')}</Text>
                            <Text style={styles.statValue}>{translateData(provider.service_area) || 'Not specified'}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="currency-inr" size={20} color="#27AE60" />
                            <Text style={styles.statLabel}>{t('startsFrom')}</Text>
                            <Text style={styles.statValue}>₹{Number(provider.starting_price || 0)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.info} />
                            <Text style={styles.statLabel}>{t('responseTime')}</Text>
                            <Text style={styles.statValue}>&lt; 15 mins</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('about')}</Text>
                        <Text style={styles.bioText}>{translateData(provider.bio) || 'No bio provided.'}</Text>
                    </View>

                    {/* Portfolio Preview */}
                    {provider.service_portfolios?.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('recentWork')}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioList}>
                                {provider.service_portfolios.map((item: any, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedImage(item.image_url)}
                                        activeOpacity={0.8}
                                    >
                                        <Image
                                            source={{ uri: item.image_url }}
                                            style={styles.portfolioImage}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Individual Services */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('servicesPricing')}</Text>
                        {provider.services?.map((svc: any, index: number) => (
                            <View key={index} style={styles.serviceCard}>
                                {/* Service Images Gallery */}
                                {svc.service_images && svc.service_images.length > 0 ? (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.serviceImageGallery}
                                        contentContainerStyle={styles.serviceImageGalleryContent}
                                    >
                                        {svc.service_images.map((img: any, imgIndex: number) => (
                                            <TouchableOpacity
                                                key={imgIndex}
                                                onPress={() => setSelectedImage(img.image_url)}
                                                activeOpacity={0.8}
                                            >
                                                <Image
                                                    source={{ uri: img.image_url }}
                                                    style={styles.serviceImage}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View style={styles.serviceImagePlaceholder}>
                                        <MaterialCommunityIcons
                                            name="image-outline"
                                            size={40}
                                            color="#DFE6E9"
                                        />
                                    </View>
                                )}

                                {/* Service Details */}
                                <View style={styles.serviceDetails}>
                                    <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceTitle}>{translateData(svc.title)}</Text>
                                        <Text style={styles.serviceDesc} numberOfLines={2}>
                                            {translateData(svc.description)}
                                        </Text>
                                    </View>
                                    <View style={styles.servicePriceContainer}>
                                        <Text style={styles.servicePrice}>₹{Number(svc.price)}</Text>
                                        <Text style={styles.serviceUnit}>/{svc.price_unit}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
                    <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>{t('callNow')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.waBtn]} onPress={handleWhatsApp}>
                    <MaterialCommunityIcons name="whatsapp" size={22} color="#FFF" />
                    <Text style={styles.actionBtnText}>{t('whatsapp')}</Text>
                </TouchableOpacity>
            </View>

            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReport}
            />

            <AdGateModal
                visible={showAdGate}
                onClose={() => setShowAdGate(false)}
                onAdComplete={handleAdComplete}
            />

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContainer: {
        height: 300,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        backgroundColor: '#F8F9FA',
    },
    headerActions: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roundBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#FF4757',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    mainInfo: {
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailBadgeOverlay: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
    },
    verifiedHeroBorder: {
        borderBottomWidth: 4,
        borderBottomColor: '#1E90FF',
    },
    unverifiedHeroBorder: {
        borderBottomWidth: 4,
        borderBottomColor: '#FF4757', // Red for unverified
    },
    displayName: {
        fontSize: 24,
        fontWeight: '900',
        color: '#2D3436',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3436',
        marginLeft: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 10,
    },
    experienceText: {
        fontSize: 14,
        color: '#636E72',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: '700',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 12,
        fontWeight: '800',
        color: '#2D3436',
        marginTop: 2,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        color: '#636E72',
        lineHeight: 22,
    },
    portfolioList: {
        flexDirection: 'row',
    },
    portfolioImage: {
        width: 140,
        height: 140,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
        resizeMode: 'contain',
    },
    serviceCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    serviceImageGallery: {
        height: 180,
    },
    serviceImageGalleryContent: {
        paddingHorizontal: 0,
    },
    serviceImage: {
        width: width - 48, // Full width minus padding
        height: 180,
        marginRight: 0,
        backgroundColor: '#F8F9FA',
    },
    serviceImagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceDetails: {
        padding: 16,
    },
    serviceInfo: {
        flex: 1,
        marginBottom: 12,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 6,
    },
    serviceDesc: {
        fontSize: 14,
        color: '#636E72',
        lineHeight: 20,
    },
    servicePriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    servicePrice: {
        fontSize: 24,
        fontWeight: '900',
        color: '#27AE60',
    },
    serviceUnit: {
        fontSize: 13,
        color: '#636E72',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
    },
    actionBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    callBtn: {
        backgroundColor: COLORS.primary,
    },
    waBtn: {
        backgroundColor: '#25D366',
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryActions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    actionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F2F6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    reportPill: {
        backgroundColor: COLORS.error + '10',
    },
    actionPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#636E72',
    },
    heroImageWrapper: {
        width: '100%',
        height: '100%',
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
});

export default ServiceProviderDetailsScreen;
