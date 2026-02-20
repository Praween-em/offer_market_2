import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, Alert, useWindowDimensions, Platform, Modal, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import AdGateModal from '../../components/AdGateModal';
import ConsentModal from '../../components/ConsentModal';
import ReportModal from '../../components/ReportModal';
const { width } = Dimensions.get('window');

const ServiceRequestDetailsScreen = ({ route, navigation }: any) => {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const { requestId } = route.params;
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [unlockStatus, setUnlockStatus] = useState<any>(null);
    const [showAdGate, setShowAdGate] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/services/request/${requestId}`);
            setRequest(response.data);
        } catch (error) {
            console.error('Failed to fetch request details', error);
            Alert.alert('Error', 'Failed to load request details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const fetchUnlockStatus = async () => {
        try {
            const response = await api.post('/services/lead-unlock-status', { leadId: requestId });
            setUnlockStatus(response.data);
        } catch (error) {
            console.error('Failed to fetch unlock status', error);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchUnlockStatus();
    }, [requestId]);

    const trackAction = async (type: 'call' | 'whatsapp') => {
        try {
            await api.post('/analytics/track', {
                providerId: user?.provider?.id,
                eventType: type,
                source: 'request',
                sourceId: requestId
            });
        } catch (error) {
            console.warn('Tracking failed', error);
        }
    };

    const handleContactPress = async (type: 'call' | 'whatsapp') => {
        if (unlockStatus?.hasUnlocked) {
            if (request?.users?.phone) {
                if (type === 'call') {
                    Linking.openURL(`tel:${request.users.phone}`);
                } else {
                    const message = `Hello, I'm responding to your request for "${request.title}" on Ofera.`;
                    Linking.openURL(`whatsapp://send?phone=${request.users.phone}&text=${encodeURIComponent(message)}`);
                }
                trackAction(type);
            } else {
                // If unlocked but phone missing, try to refresh details once
                setLoading(true);
                try {
                    await fetchDetails();
                    if (request?.users?.phone) {
                        // Retry the action after refresh
                        handleContactPress(type);
                    } else {
                        Alert.alert('Error', 'Contact details unlocked but not available. Please contact support.');
                    }
                } catch (e) {
                    Alert.alert('Error', 'Failed to refresh contact details.');
                } finally {
                    setLoading(false);
                }
            }
            return;
        }

        if (!unlockStatus?.canUnlock) {
            Alert.alert('Limit Reached', 'This lead has already been unlocked by 3 providers.');
            return;
        }

        setShowAdGate(true);
    };

    const handleAdComplete = async (token: string) => {
        setShowAdGate(false);
        setIsUnlocking(true);
        try {
            const response = await api.post('/services/reveal-contact', {
                leadId: requestId,
                adCompletionToken: token
            });

            Alert.alert('Success', 'Contact details revealed!');
            // Update local request data with revealed phone
            setRequest((prev: any) => ({
                ...prev,
                users: {
                    ...prev.users,
                    phone: response.data.data.phone
                }
            }));
            fetchUnlockStatus();
        } catch (error: any) {
            console.error('Reveal failed', error);
            if (error.response?.status === 403 && error.response?.data?.message?.includes('consent')) {
                setShowConsentModal(true);
            } else {
                Alert.alert('Error', error.response?.data?.message || 'Failed to reveal contact');
            }
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleReportSubmit = async (reason: string, notes: string) => {
        try {
            await api.post(`/services/requests/${requestId}/report`, {
                reason,
                notes
            });
            Alert.alert('Reported', 'Thank you for your feedback. We will review this request.');
        } catch (error) {
            console.error('Failed to submit report', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    let timeAgo = '';
    try {
        if (request?.created_at) {
            const date = new Date(request.created_at);
            if (!isNaN(date.getTime())) {
                timeAgo = formatDistanceToNow(date, { addSuffix: true });
            }
        }
    } catch (e) {
        console.warn('Date parsing error', e);
    }

    const isUrgent = request?.created_at && (new Date().getTime() - new Date(request.created_at).getTime() < 24 * 60 * 60 * 1000);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Request Details</Text>
                <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.reportHeaderButton}>
                    <Icon name="flag" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {request?.media && request.media.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaGallery}>
                        {request.media.map((m: any, idx: number) => (
                            <TouchableOpacity
                                key={idx}
                                activeOpacity={0.9}
                                onPress={() => setSelectedImage(m.image_url)}
                                style={styles.imageWrapper}
                            >
                                <Image source={{ uri: m.image_url }} style={styles.galleryImage} resizeMode="contain" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.headerInfo}>
                    <View style={styles.categoryRow}>
                        <Text style={styles.categoryName}>
                            {request?.service_categories?.name || 'Service'}
                        </Text>
                        {request?.location_name && (
                            <View style={styles.smallLocationBadge}>
                                <Icon name="map-pin" size={10} color={COLORS.primary} />
                                <Text style={styles.smallLocationText} numberOfLines={1}>
                                    {request.location_name.split(',')[0]}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.timeText}>Posted {timeAgo}</Text>
                        {request?.distance_km !== undefined && request?.distance_km !== null && (
                            <View style={styles.distanceBadge}>
                                <Icon name="navigation" size={10} color={COLORS.secondary} />
                                <Text style={styles.distanceText}>{request.distance_km < 1 ? '< 1 km' : `${request.distance_km} km`} away</Text>
                            </View>
                        )}
                        {unlockStatus && (
                            <View style={[styles.slotsBadge, (3 - unlockStatus.unlockCount) <= 1 && styles.lowSlotsBadge]}>
                                <Icon name="users" size={10} color={(3 - unlockStatus.unlockCount) <= 1 ? COLORS.error : COLORS.textSecondary} />
                                <Text style={[styles.slotsText, (3 - unlockStatus.unlockCount) <= 1 && styles.lowSlotsText]}>
                                    {3 - unlockStatus.unlockCount} {(3 - unlockStatus.unlockCount) === 1 ? 'Slot' : 'Slots'} left
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>
                            {request?.title}
                        </Text>
                        {isUrgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>NEW</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.badgeRow}>
                        {request?.budget && (
                            <View style={styles.budgetBadge}>
                                <Text style={styles.budgetText}>Budget: ₹{parseFloat(request.budget).toLocaleString('en-IN')}</Text>
                            </View>
                        )}
                        {request?.urgency && (
                            <View style={[styles.urgencyBadge, (styles as any)[`urgency_${request.urgency}`]]}>
                                <Text style={styles.urgencyText_badge}>
                                    Urgency: {request.urgency.toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>



                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Description</Text>
                        <Text style={styles.description}>{request?.description || 'No description provided.'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Customer Information</Text>
                    <View style={styles.userCard}>
                        {request?.users?.profile_picture ? (
                            <Image source={{ uri: request.users.profile_picture }} style={styles.userAvatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="user" size={24} color={COLORS.primary} />
                            </View>
                        )}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{request?.users?.display_name || 'Anonymous'}</Text>
                            <Text style={styles.userStatus}>
                                {unlockStatus?.hasUnlocked ? 'Contact details visible' : 'Contact locked'}
                            </Text>
                        </View>
                        {!unlockStatus?.hasUnlocked && (
                            <Icon name="lock" size={16} color={COLORS.textSecondary} />
                        )}
                    </View>
                </View>

                <View style={styles.spacer} />
            </ScrollView>

            <View style={styles.footer}>
                {!unlockStatus?.hasUnlocked ? (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.unlockButton, isUnlocking && styles.disabledButton]}
                        onPress={() => handleContactPress('call')}
                        disabled={isUnlocking}
                    >
                        {isUnlocking ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Icon name="lock" size={20} color={COLORS.white} />
                                <Text style={styles.actionButtonText}>Unlock Contact (Ad-Gate)</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]} onPress={() => handleContactPress('whatsapp')}>
                            <Icon name="message-circle" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={() => handleContactPress('call')}>
                            <Icon name="phone" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Call Now</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <AdGateModal
                visible={showAdGate}
                leadId={requestId}
                onClose={() => setShowAdGate(false)}
                onAdComplete={handleAdComplete}
            />

            <ConsentModal
                visible={showConsentModal}
                type="LEAD_REVEAL"
                userId={user?.id}
                onAccept={() => {
                    setShowConsentModal(false);
                    setShowAdGate(true);
                }}
                onCancel={() => setShowConsentModal(false)}
            />

            <ReportModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReportSubmit}
                title="Report Service Request"
                subtitle="Why are you reporting this request? This helps us keep the platform safe."
            />

            {/* Full Screen Image Viewer Modal */}
            {selectedImage && (
                <View style={styles.fullScreenModal}>
                    <TouchableOpacity
                        style={styles.closeModal}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Icon name="x" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    reportHeaderButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: `${COLORS.error}10`,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    mediaGallery: {
        marginBottom: SPACING.xl,
    },
    galleryImage: {
        width: width - SPACING.lg * 2,
        height: 250,
        borderRadius: 12,
    },
    imageWrapper: {
        width: width - SPACING.lg * 2,
        height: 250,
        marginRight: SPACING.md,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        ...SHADOWS.medium,
        borderWidth: 1,
        borderColor: COLORS.border,
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
    headerInfo: {
        marginBottom: SPACING.lg,
    },
    categoryName: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        backgroundColor: `${COLORS.primary}08`,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    smallLocationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${COLORS.primary}05`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        maxWidth: '50%',
    },
    smallLocationText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flexWrap: 'wrap',
    },
    timeText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    distanceText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    slotsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.textSecondary}08`,
        paddingHorizontal: 10,
        paddingVertical: 2,
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
    mainContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING.lg,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.text,
        flex: 1,
        lineHeight: 32,
    },
    serviceLabel: {
        color: COLORS.textSecondary,
        fontWeight: '800',
    },
    urgentBadge: {
        backgroundColor: `${COLORS.secondary}15`,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    urgentText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.secondary,
        letterSpacing: 0.5,
    },

    section: {
        marginBottom: SPACING.lg,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: SPACING.sm,
    },
    description: {
        ...TYPOGRAPHY.body,
        lineHeight: 26,
        color: '#374151',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flexWrap: 'wrap',
        marginBottom: SPACING.md,
    },
    budgetBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    budgetText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#059669',
    },
    urgencyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
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
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: SPACING.xl,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 20,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    userAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: SPACING.md,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    userStatus: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    spacer: {
        height: 140,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.md,
        ...SHADOWS.medium,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        ...SHADOWS.small,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
    },
    callButton: {
        backgroundColor: COLORS.primary,
    },
    unlockButton: {
        backgroundColor: COLORS.error,
    },
    disabledButton: {
        opacity: 0.6,
    },
    actionButtonText: {
        ...TYPOGRAPHY.button,
        fontSize: 15,
        fontWeight: '700',
    },
});

export default ServiceRequestDetailsScreen;
