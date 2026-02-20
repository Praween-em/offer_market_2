import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';
import { navigate, navigationRef } from '../navigation/NavigationRef';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RandomVerificationModal = () => {
    const { user, isAuthenticated } = useAuth();
    const [visible, setVisible] = useState(false);

    // Only applicable if logged in, is a provider, and NOT verified
    const isApplicable = isAuthenticated &&
        user?.is_service_provider &&
        user?.verification_status !== 'VERIFIED';

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const scheduleNextPopup = () => {
            if (!isApplicable) {
                setVisible(false);
                return;
            }

            // Random time between 1 and 3 minutes for annoyance/urgency (60000 to 180000 ms)
            // For testing it could be shorter, but 1-3 minutes is a good balance of random popups.
            const minTime = 60 * 1000;
            const maxTime = 3 * 60 * 1000;
            const randomDelay = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

            timeoutId = setTimeout(() => {
                // Ensure we only show if still applicable and not already on the Verification screen
                const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null;

                if (isApplicable && currentRoute !== 'Verification') {
                    setVisible(true);
                } else {
                    // Try again later if they are currently verifying
                    scheduleNextPopup();
                }
            }, randomDelay);
        };

        if (isApplicable && !visible) {
            scheduleNextPopup();
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isApplicable, visible]);

    const handleVerifyNow = () => {
        setVisible(false);
        navigate('Verification');
    };

    const handleCloseForNow = () => {
        setVisible(false);
        // It will automatically schedule the next popup because visible changes to false
    };

    if (!isApplicable) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseForNow}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <Icon name="alert-triangle" size={48} color={COLORS.error} />
                    </View>

                    <Text style={styles.title}>ACTION REQUIRED</Text>

                    <Text style={styles.description}>
                        Your service profile is completely <Text style={styles.boldText}>UNVERIFIED</Text>.
                        Unverified providers get significantly fewer orders and risk account suspension.
                        Please complete your simple 2-minute identity verification now.
                    </Text>

                    <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyNow}>
                        <Text style={styles.verifyButtonText}>Verify Identity Now</Text>
                        <Icon name="shield" size={18} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseForNow}>
                        <Text style={styles.closeButtonText}>I'll do it later (Not Recommended)</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: SPACING.xl,
        width: width - SPACING.xl * 2,
        alignItems: 'center',
        ...SHADOWS.medium,
        borderWidth: 2,
        borderColor: COLORS.error,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2', // Light red
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.error,
        fontWeight: '900',
        marginBottom: SPACING.sm,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    description: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        color: COLORS.text,
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    boldText: {
        fontWeight: 'bold',
        color: COLORS.error,
    },
    verifyButton: {
        backgroundColor: '#10B981', // Emerald green to feel safe and positive
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    verifyButtonText: {
        ...TYPOGRAPHY.body,
        color: COLORS.white,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    closeButton: {
        paddingVertical: SPACING.sm,
    },
    closeButtonText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});

export default RandomVerificationModal;
