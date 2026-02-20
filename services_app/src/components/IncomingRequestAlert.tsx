import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRequestAlert } from '../context/RequestAlertContext';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';
import { navigate } from '../navigation/NavigationRef';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const IncomingRequestAlert = () => {
    const { activeRequest, dismissRequest } = useRequestAlert();


    // Animations
    const slideAnim = useRef(new Animated.Value(-height)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (activeRequest) {
            // Start entry animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();

            // Start pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Start rotation for the glow background
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            // Hide animation
            Animated.timing(slideAnim, {
                toValue: -height,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [activeRequest]);

    if (!activeRequest) return null;

    const handleViewRequest = () => {
        dismissRequest();
        navigate('ServiceRequestDetails', { requestId: activeRequest.id });
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal
            transparent
            visible={!!activeRequest}
            animationType="none"
            onRequestClose={dismissRequest}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.primary, '#1a365d']}
                        style={styles.card}
                    >
                        {/* 1. Header with Badge */}
                        <View style={styles.header}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>MATCHED LEAD</Text>
                            </View>
                            <TouchableOpacity onPress={dismissRequest} style={styles.closeButton}>
                                <Icon name="x" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        {/* 2. Main Visual */}
                        <View style={styles.content}>
                            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                                <Animated.View style={[styles.glowRing, { transform: [{ rotate: spin }] }]}>
                                    <LinearGradient
                                        colors={[COLORS.secondary, 'transparent']}
                                        style={styles.glowGradient}
                                    />
                                </Animated.View>
                                <View style={styles.mainIconCircle}>
                                    <Icon name="briefcase" size={40} color={COLORS.white} />
                                </View>
                            </Animated.View>

                            <Text style={styles.title}>New Job Nearby! 📍</Text>
                            <Text style={styles.requestTitle}>{activeRequest.title}</Text>

                            <View style={styles.metaInfo}>
                                <View style={styles.metaItem}>
                                    <Icon name="tag" size={14} color={`${COLORS.white}cc`} />
                                    <Text style={styles.metaText}>{activeRequest.category || 'General'}</Text>
                                </View>
                                {activeRequest.distance && (
                                    <View style={styles.metaItem}>
                                        <Icon name="navigation" size={14} color={`${COLORS.white}cc`} />
                                        <Text style={styles.metaText}>{activeRequest.distance}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* 3. Footer Action */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={handleViewRequest}
                            >
                                <Text style={styles.viewButtonText}>VIEW & RESPOND</Text>
                                <Icon name="arrow-right" size={20} color={COLORS.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dismissButton}
                                onPress={dismissRequest}
                            >
                                <Text style={styles.dismissButtonText}>LATER</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.9,
    },
    card: {
        borderRadius: 32,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: `${COLORS.secondary}40`,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    badge: {
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    mainIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    glowRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        zIndex: 1,
    },
    glowGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: SPACING.xs,
    },
    requestTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.white,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    metaInfo: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: `${COLORS.white}cc`,
        fontWeight: '600',
    },
    footer: {
        gap: SPACING.md,
    },
    viewButton: {
        backgroundColor: COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 8,
    },
    viewButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '900',
    },
    dismissButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dismissButtonText: {
        color: `${COLORS.white}80`,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default IncomingRequestAlert;
