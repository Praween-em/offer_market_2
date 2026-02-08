import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

import ConsentModal from '../../components/ConsentModal';

const LoginScreen = ({ navigation }: any) => {
    const { requestOtp } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 10) return;
        setShowConsent(true);
    };

    const proceedWithOtp = async (consentId?: string, noticeDetails?: any) => {
        setShowConsent(false);
        setLoading(true);
        try {
            await requestOtp(phone);
            navigation.navigate('VerifyOtp', { phone, consentNotice: noticeDetails });
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Sahayaq</Text>
                        <View style={styles.orangeDot} />
                    </View>
                    <Text style={styles.subtitle}>where needs meet services.</Text>
                    <Text style={styles.subtitle}>
                        Enter your phone number to get started and manage your service profile.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.prefix}>+91</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={10}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, (loading || phone.length < 10) && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        disabled={loading || phone.length < 10}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={TYPOGRAPHY.button}>Send OTP</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.termsText}>
                        By continuing, you agree to our terms and conditions as per DPDP 2026 Act.
                    </Text>
                </View>

                <ConsentModal
                    visible={showConsent}
                    type="ONBOARDING"
                    onAccept={proceedWithOtp}
                    onCancel={() => setShowConsent(false)}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    content: {
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        position: 'relative',
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 55,
        color: '#4F46E5',
        marginBottom: SPACING.xs,
        letterSpacing: 1,
    },
    orangeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF6B35',
        position: 'absolute',
        bottom: 8,
        right: -16,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
        width: '100%',
    },
    prefix: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        height: 56,
        ...TYPOGRAPHY.body,
    },
    button: {
        backgroundColor: COLORS.primary,
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    termsText: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        marginTop: SPACING.xl,
        color: COLORS.textSecondary,
    },
});

export default LoginScreen;
