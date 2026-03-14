import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    RewardedAd,
    RewardedAdEventType,
    TestIds,
    AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_IDS } from '../utils/adConfig';

interface AdGateModalProps {
    visible: boolean;
    onClose: () => void;
    onAdComplete: (token: string) => void;
    leadId: string;
}

// WARNING: Using production Ad Unit IDs during development can lead to account suspension.
// Recommend registering test devices in the AdMob console.
const REWARDED_AD_UNIT_ID = AD_IDS.REWARDED;

const AdGateModal: React.FC<AdGateModalProps> = ({
    visible,
    onClose,
    onAdComplete,
    leadId,
}) => {
    const [adInstance, setAdInstance] = useState<RewardedAd | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);
    const [isShowing, setIsShowing] = useState(false);
    const [adWatched, setAdWatched] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!visible) {
            // Cleanup ad instance when modal is hidden
            setAdInstance(null);
            setAdLoaded(false);
            setAdWatched(false);
            setLoadError(null);
            return;
        }

        let isSubscribed = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        // Create a FRESH instance every time the modal opens
        const newInstance = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
            requestNonPersonalizedAdsOnly: true,
        });

        setAdInstance(newInstance);

        const loadAd = (instance: RewardedAd) => {
            setLoadError(null);
            setAdLoaded(false);
            instance.load();

            // 15 second timeout for ad loading
            timeoutId = setTimeout(() => {
                if (isSubscribed && !adLoaded) {
                    setLoadError('Ad load timed out. Please try again.');
                }
            }, 15000);
        };

        const unsubscribeLoaded = newInstance.addAdEventListener(RewardedAdEventType.LOADED, () => {
            if (isSubscribed) {
                setAdLoaded(true);
                setLoadError(null);
                if (timeoutId) clearTimeout(timeoutId);
            }
        });

        const unsubscribeError = newInstance.addAdEventListener(AdEventType.ERROR, (error) => {
            if (isSubscribed) {
                console.error('Ad Load Error:', error);
                setLoadError(`Failed to load ad: ${error.message}`);
                setAdLoaded(false);
                if (timeoutId) clearTimeout(timeoutId);
            }
        });

        const unsubscribeEarned = newInstance.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                setAdWatched(true);
            },
        );

        const unsubscribeClosed = newInstance.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setIsShowing(false);
                setAdLoaded(false);
                // After closing, if they didn't finish, we'd need a new instance to try again
                // But usually they just click 'Close' on the modal. 
                // If they remain in modal, we reload.
                if (!adWatched) {
                    loadAd(newInstance);
                }
            },
        );

        loadAd(newInstance);

        return () => {
            isSubscribed = false;
            unsubscribeLoaded();
            unsubscribeError();
            unsubscribeEarned();
            unsubscribeClosed();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [visible]);

    const handleShowAd = () => {
        if (adLoaded && adInstance) {
            setIsShowing(true);
            adInstance.show();
        } else if (loadError) {
            if (adInstance) {
                setLoadError(null);
                setAdLoaded(false);
                adInstance.load();
            }
        } else {
            Alert.alert('Ad Not Ready', 'Please wait while we prepare the advertisement.');
        }
    };

    const handleRetry = () => {
        if (adInstance) {
            setLoadError(null);
            setAdLoaded(false);
            adInstance.load();
        }
    };

    const handleContinue = () => {
        // Generate ad completion token
        const adCompletionToken = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        onAdComplete(adCompletionToken);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <MaterialCommunityIcons name="handshake-outline" size={24} color="#4F46E5" />
                        <Text style={styles.headerTitle}>Unlock Contact Details Free</Text>
                        {!isShowing && (
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#636E72" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Compliance Notice */}
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeTitle}>🤝 Privacy First</Text>
                        <Text style={styles.noticeText}>
                            Contact information will be shared after viewing this advertisement. This is done with explicit consent under Section 6 of the Digital Personal Data Protection Act, 2023.
                        </Text>
                        <Text style={styles.noticeSubtext}>
                            Maximum 3 service providers can access contact details per request.
                        </Text>
                    </View>

                    {/* Ad Container */}
                    <View style={styles.adContainer}>
                        {loadError ? (
                            <View style={styles.adContent}>
                                <MaterialCommunityIcons name="alert-circle" size={80} color="#FF9800" />
                                <Text style={styles.adTitle}>Load Failed</Text>
                                <Text style={[styles.adSubtitle, { color: '#E67E22' }]}>{loadError}</Text>
                            </View>
                        ) : !adLoaded && !adWatched ? (
                            <View style={styles.adLoading}>
                                <ActivityIndicator size="large" color="#FF4757" />
                                <Text style={styles.adLoadingText}>Loading advertisement...</Text>
                            </View>
                        ) : (
                            <View style={styles.adContent}>
                                <MaterialCommunityIcons
                                    name={adWatched ? "check-circle" : "play-circle"}
                                    size={80}
                                    color={adWatched ? "#10B981" : "#4F46E5"}
                                />
                                <Text style={styles.adTitle}>
                                    {adWatched ? 'Ad Completed' : 'Advertisement Ready'}
                                </Text>
                                <Text style={styles.adSubtitle}>
                                    {adWatched ? 'You can now view the contact.' : 'Click below to watch and unlock.'}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Button */}
                    {!adWatched ? (
                        <TouchableOpacity
                            style={[
                                styles.continueBtn,
                                (!adLoaded && !loadError) && styles.continueBtnDisabled,
                                loadError && { backgroundColor: '#FFBDC3' }
                            ]}
                            onPress={handleShowAd}
                            disabled={(!adLoaded && !loadError) || isShowing}
                        >
                            <Text style={styles.continueBtnText}>
                                {adLoaded ? 'Watch Ad to Unlock (Free)' : loadError ? 'Retry Loading Ad' : 'Preparing Ad...'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.continueBtn}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueBtnText}>Continue to Contact</Text>
                        </TouchableOpacity>
                    )}

                    {/* Footer Notice */}
                    <Text style={styles.footerText}>
                        For grievances: dpo@ofera.in | Data Protection Board: dpb.gov.in
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
    },
    closeBtn: {
        padding: 4,
    },
    noticeBox: {
        backgroundColor: '#EEF2FF',
        borderLeftWidth: 4,
        borderLeftColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#4F46E5',
        marginBottom: 8,
    },
    noticeText: {
        fontSize: 13,
        color: '#636E72',
        lineHeight: 20,
        marginBottom: 8,
    },
    noticeSubtext: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    adContainer: {
        height: 200,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adLoading: {
        alignItems: 'center',
        gap: 12,
    },
    adLoadingText: {
        fontSize: 14,
        color: '#636E72',
    },
    adContent: {
        alignItems: 'center',
        gap: 12,
    },
    adTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D3436',
    },
    adSubtitle: {
        fontSize: 14,
        color: '#636E72',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    continueBtn: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    continueBtnDisabled: {
        backgroundColor: '#DFE6E9',
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    footerText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
});

export default AdGateModal;
