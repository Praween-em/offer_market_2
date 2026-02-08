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

interface AdGateModalProps {
    visible: boolean;
    onClose: () => void;
    onAdComplete: (token: string) => void;
    leadId: string;
}

/**
 * Ad-Gate Component for Contact Reveal
 * 2026 DPDP Compliance: Users must view ad before contact reveal
 */
const AdGateModal: React.FC<AdGateModalProps> = ({
    visible,
    onClose,
    onAdComplete,
    leadId,
}) => {
    const [adLoading, setAdLoading] = useState(true);
    const [adWatched, setAdWatched] = useState(false);
    const [countdown, setCountdown] = useState(5);

    React.useEffect(() => {
        if (visible) {
            // Simulate ad loading
            setTimeout(() => {
                setAdLoading(false);
                startCountdown();
            }, 1000);
        } else {
            // Reset state when modal closes
            setAdLoading(true);
            setAdWatched(false);
            setCountdown(5);
        }
    }, [visible]);

    const startCountdown = () => {
        let count = 5;
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(interval);
                setAdWatched(true);
            }
        }, 1000);
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
                        <MaterialCommunityIcons name="shield-check" size={24} color="#FF4757" />
                        <Text style={styles.headerTitle}>Data Protection Notice</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color="#636E72" />
                        </TouchableOpacity>
                    </View>

                    {/* Compliance Notice */}
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeTitle}>📋 DPDP Act Compliance</Text>
                        <Text style={styles.noticeText}>
                            Contact information will be shared after viewing this advertisement. This is done with explicit consent under Section 6 of the Digital Personal Data Protection Act, 2023.
                        </Text>
                        <Text style={styles.noticeSubtext}>
                            Maximum 3 service providers can access contact details per request.
                        </Text>
                    </View>

                    {/* Ad Container */}
                    <View style={styles.adContainer}>
                        {adLoading ? (
                            <View style={styles.adLoading}>
                                <ActivityIndicator size="large" color="#FF4757" />
                                <Text style={styles.adLoadingText}>Loading advertisement...</Text>
                            </View>
                        ) : (
                            <View style={styles.adContent}>
                                <MaterialCommunityIcons name="play-circle" size={80} color="#FF4757" />
                                <Text style={styles.adTitle}>Advertisement</Text>
                                <Text style={styles.adSubtitle}>
                                    {adWatched ? 'Ad completed!' : `Please wait ${countdown} seconds...`}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={[styles.continueBtn, !adWatched && styles.continueBtnDisabled]}
                        onPress={handleContinue}
                        disabled={!adWatched}
                    >
                        <Text style={styles.continueBtnText}>
                            {adWatched ? 'Continue to Contact' : `Wait ${countdown}s`}
                        </Text>
                    </TouchableOpacity>

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
        backgroundColor: '#FFF9E6',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
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
    },
    continueBtn: {
        backgroundColor: '#FF4757',
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
