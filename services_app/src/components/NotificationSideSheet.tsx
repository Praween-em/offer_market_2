import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../theme/theme';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');
const SHEET_WIDTH = width * 0.8; // Occupy 80% of screen width

interface NotificationSideSheetProps {
    visible: boolean;
    onClose: () => void;
}

const NotificationSideSheet = ({ visible, onClose }: NotificationSideSheetProps) => {
    const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen to the right
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: width - SHEET_WIDTH, // Slide in to show sheet
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: width, // Slide out
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
            <View style={styles.overlay}>
                {/* Backdrop - tap to close */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                {/* Sliding Sheet */}
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [{ translateX: slideAnim }],
                            width: SHEET_WIDTH,
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={TYPOGRAPHY.h2}>Notifications</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="x" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.emptyState}>
                            <Icon name="bell-off" size={48} color={COLORS.border} />
                            <Text style={styles.emptyText}>No new notifications</Text>
                            <Text style={styles.emptySubtext}>
                                We'll let you know when something important happens.
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: COLORS.background,
        ...SHADOWS.medium,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
        // The width is set via style prop on the view
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -100, // Visual center tweak
    },
    emptyText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default NotificationSideSheet;
