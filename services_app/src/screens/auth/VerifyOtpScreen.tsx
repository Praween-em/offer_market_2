import React, { useState, useRef, useEffect } from 'react';
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
    Alert,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';

const VerifyOtpScreen = ({ navigation, route }: any) => {
    const { phone, consentNotice } = route.params;
    const { verifyOtp, requestOtp } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<any>([]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChangeProp = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text.length !== 0 && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter all 4 digits');
            return;
        }

        setLoading(true);
        try {
            console.log(`[VerifyOtpScreen] Verifying OTP for ${phone}`);
            const response = await verifyOtp(phone, otpString, consentNotice);
            const user = response.user;

            console.log(`[VerifyOtpScreen] success, IsServiceProvider: ${user?.is_service_provider}`);

            // The navigation will be handled by RootNavigator if flags changed,
            // but we might need to nudge it if the user is already a service provider
            // (though in that case, they wouldn't likely be in the Auth stack anyway)
            if (user && !user.is_service_provider) {
                navigation.replace('Onboarding');
            }
        } catch (error: any) {
            console.error('[VerifyOtpScreen] error:', error.message);
            Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setLoading(true);
        try {
            await requestOtp(phone);
            setTimer(30);
            Alert.alert('Success', 'OTP Resent successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={styles.title}>Verification Code</Text>
                    <Text style={styles.subtitle}>
                        We have sent a 6-digit verification code to
                        <Text style={styles.phoneText}> +91 {phone}</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                }}
                                style={[
                                    styles.otpInput,
                                    digit !== '' && styles.otpInputActive
                                ]}
                                value={digit}
                                onChangeText={(text) => handleChangeProp(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.buttonDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={TYPOGRAPHY.button}>Verify Code</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendInfo}>Didn't receive code? </Text>
                        <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
                            <Text style={[
                                styles.resendAction,
                                timer > 0 && styles.resendDisabled
                            ]}>
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        padding: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    content: {
        flex: 1,
        marginTop: SPACING.xxl,
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontSize: 28,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySecondary,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
        paddingHorizontal: SPACING.xl,
        lineHeight: 22,
    },
    phoneText: {
        fontWeight: '700',
        color: COLORS.primary,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: SPACING.xxl,
        gap: 12,
        flexWrap: 'wrap',
    },
    otpInput: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        ...SHADOWS.small,
    },
    otpInputActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        width: '100%',
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    resendContainer: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    resendInfo: {
        ...TYPOGRAPHY.bodySecondary,
    },
    resendAction: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '700',
    },
    resendDisabled: {
        color: COLORS.textSecondary,
        opacity: 0.5,
    },
});

export default VerifyOtpScreen;
