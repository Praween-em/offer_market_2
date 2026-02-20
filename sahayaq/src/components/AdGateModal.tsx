import React, { useState } from 'react';
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
    AdEventType,
    TestIds,
} from 'react-native-google-mobile-ads';
import { useLanguage } from '../context/LanguageContext';

interface AdGateModalProps {
    visible: boolean;
    onClose: () => void;
    onAdComplete: (token: string) => void;
}

// Rewarded Ad Instance - Use production ID
const adUnitId = 'ca-app-pub-5362340568713961/5188075314';
const AdGateModal: React.FC<AdGateModalProps> = ({
    visible,
    onClose,
    onAdComplete,
}) => {
    const [adInstance, setAdInstance] = useState<RewardedAd | null>(null);
    const [adLoaded, setAdLoaded] = useState(false);
    const [isShowing, setIsShowing] = useState(false);
    const { t } = useLanguage();

    React.useEffect(() => {
        if (!visible) {
            setAdInstance(null);
            setAdLoaded(false);
            return;
        }

        let isSubscribed = true;

        // Create a FRESH instance
        const newInstance = RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
            keywords: ['service', 'repair', 'home help'],
        });

        setAdInstance(newInstance);

        const unsubscribeLoaded = newInstance.addAdEventListener(RewardedAdEventType.LOADED, () => {
            if (isSubscribed) setAdLoaded(true);
        });

        const unsubscribeEarned = newInstance.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                console.log('User earned reward of ', reward);
                // Generate ad completion token
                const adCompletionToken = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                onAdComplete(adCompletionToken);
            },
        );

        const unsubscribeError = newInstance.addAdEventListener(AdEventType.ERROR, (error) => {
            console.error('Sahayaq Ad Error:', error);
            if (isSubscribed) setAdLoaded(false);
        });

        const unsubscribeClosed = newInstance.addAdEventListener(
            AdEventType.CLOSED,
            () => {
                setIsShowing(false);
                setAdLoaded(false);
                // Ad closed, trigger onClose to hide modal
                onClose();
            },
        );

        newInstance.load();

        return () => {
            isSubscribed = false;
            unsubscribeLoaded();
            unsubscribeEarned();
            unsubscribeClosed();
            unsubscribeError();
        };
    }, [visible]);

    const handleShowAd = () => {
        if (adLoaded && adInstance) {
            setIsShowing(true);
            adInstance.show();
        } else {
            Alert.alert(t('adNotReady') || 'Ad not ready', t('adWaitMessage') || 'Please wait while we prepare the advertisement.');
        }
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
                        <MaterialCommunityIcons name="shield-check" size={24} color="#6C5CE7" />
                        <Text style={styles.headerTitle}>Contact Reveal Notice</Text>
                        {!isShowing && (
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <MaterialCommunityIcons name="close" size={24} color="#636E72" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Notice Box */}
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeTitle}>📋 How it works</Text>
                        <Text style={styles.noticeText}>
                            To support our free service, please watch a short video to unlock the service provider's contact details.
                        </Text>
                        <Text style={styles.noticeSubtext}>
                            Your data remains private and secure.
                        </Text>
                    </View>

                    {/* Ad Status */}
                    <View style={styles.adContainer}>
                        {!adLoaded ? (
                            <View style={styles.adLoading}>
                                <ActivityIndicator size="large" color="#6C5CE7" />
                                <Text style={styles.adLoadingText}>Preparing Secure Ad Gate...</Text>
                            </View>
                        ) : (
                            <View style={styles.adContent}>
                                <MaterialCommunityIcons name="play-circle" size={80} color="#6C5CE7" />
                                <Text style={styles.adTitle}>Ready to Unlock</Text>
                                <Text style={styles.adSubtitle}>
                                    Watch ad to reveal contact details
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={[styles.continueBtn, !adLoaded && styles.continueBtnDisabled]}
                        onPress={handleShowAd}
                        disabled={!adLoaded || isShowing}
                    >
                        <Text style={styles.continueBtnText}>
                            {adLoaded ? 'Watch Ad to Reveal' : 'Loading Ad...'}
                        </Text>
                    </TouchableOpacity>

                    {/* Footer */}
                    <Text style={styles.footerText}>
                        Supporting local workers & maintenance of Sahayaq
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
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
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
        backgroundColor: '#F3F0FF',
        borderLeftWidth: 4,
        borderLeftColor: '#6C5CE7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2D3436',
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
        borderRadius: 16,
        marginBottom: 24,
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
    },
    continueBtn: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 16,
    },
    continueBtnDisabled: {
        backgroundColor: '#DFE6E9',
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '800',
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
