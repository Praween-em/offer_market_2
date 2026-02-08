
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Linking, ActivityIndicator, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import AdGateModal from '../../components/AdGateModal';
import ConsentModal from '../../components/ConsentModal';
import ReportModal from '../../components/ReportModal';

const ServiceRequestDetailsScreen = ({ route, navigation }: any) => {
    const { requestId } = route.params;
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [unlockStatus, setUnlockStatus] = useState<any>(null);
    const [showAdGate, setShowAdGate] = useState(false);
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
                Alert.alert('Error', 'Contact details unlocked but not available. Please try again.');
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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Request Details</Text>
                {unlockStatus?.hasUnlocked ? (
                    <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.reportHeaderButton}>
                        <Icon name="flag" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {request?.media && request.media.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaGallery}>
                        {request.media.map((m: any, idx: number) => (
                            <Image key={idx} source={{ uri: m.image_url }} style={styles.galleryImage} />
                        ))}
                    </ScrollView>
                )}

                <View style={styles.categoryBadge}>
                    <Icon name="tag" size={14} color={COLORS.primary} />
                    <Text style={styles.categoryName}>
                        {request?.service_categories?.name || 'Service'}
                    </Text>
                </View>

                <Text style={styles.title}>{request?.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.timeText}>Posted {timeAgo}</Text>
                    {request?.distance_km !== undefined && request?.distance_km !== null && (
                        <View style={styles.distanceBadge}>
                            <Icon name="navigation" size={10} color={COLORS.secondary} />
                            <Text style={styles.distanceText}>{request.distance_km} km away</Text>
                        </View>
                    )}
                </View>

                {request?.location_name && (
                    <View style={styles.locationSection}>
                        <Icon name="map-pin" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.locationValue}>{request.location_name}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Customer</Text>
                    <View style={styles.userCard}>
                        {request?.users?.profile_picture ? (
                            <Image source={{ uri: request.users.profile_picture }} style={styles.userAvatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="user" size={20} color={COLORS.primary} />
                            </View>
                        )}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{request?.users?.display_name || 'Anonymous'}</Text>
                            <Text style={styles.userPhone}>
                                {unlockStatus?.hasUnlocked ? 'Contact information revealed' : 'Tap below to unlock contact'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Description</Text>
                    <Text style={styles.description}>{request?.description || 'No description provided.'}</Text>
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
        marginBottom: SPACING.lg,
    },
    galleryImage: {
        width: 250,
        height: 180,
        borderRadius: 16,
        marginRight: SPACING.md,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}10`,
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
        marginBottom: SPACING.sm,
    },
    categoryName: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 12,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 24,
        color: COLORS.text,
        marginBottom: 4,
    },
    timeText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: SPACING.xl,
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
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.lg,
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
    },
    locationValue: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        fontSize: 14,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionLabel: {
        ...TYPOGRAPHY.bodySecondary,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 16,
        ...SHADOWS.small,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: SPACING.md,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
    },
    userPhone: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    description: {
        ...TYPOGRAPHY.body,
        lineHeight: 24,
        color: COLORS.text,
    },
    spacer: {
        height: 100,
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
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
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
        backgroundColor: '#FF4757',
    },
    disabledButton: {
        opacity: 0.6,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 16,
    },
});

export default ServiceRequestDetailsScreen;
