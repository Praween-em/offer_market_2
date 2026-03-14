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
    Image,
    Animated,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';
import ConsentModal from '../../components/ConsentModal';

const VerifyOtpScreen = ({ navigation, route }: any) => {
    const { phone, consentNotice } = route.params;
    const { verifyOtp, requestOtp } = useAuth();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<any>([]);
    const cardSlideAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        Animated.spring(cardSlideAnim, {
            toValue: -60,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    };

    const handleBlur = () => {
        Animated.spring(cardSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
        }).start();
    };

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
                {/* Background Characters */}
                <Image
                    source={require('../../assets/New folder/Sayayaq6.png')}
                    style={[styles.bgChar, styles.charTopLeft]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../../assets/New folder/Sayayaq2-removebg-preview.png')}
                    style={[styles.bgChar, styles.charTopRight]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../../assets/New folder/Sayayaq5.png')}
                    style={[styles.bgChar, styles.charBottomLeft]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../../assets/New folder/Sayayaq8.png')}
                    style={[styles.bgChar, styles.charBottomCenter]}
                    resizeMode="contain"
                />
                <Image
                    source={require('../../assets/New folder/Sayayaq7.png')}
                    style={[styles.bgChar, styles.charBottomRight]}
                    resizeMode="contain"
                />

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>

                <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardSlideAnim }] }]}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Verification</Text>
                        <Text style={styles.cardSubtitle}>Find • Connect • Earn</Text>

                        <Text style={styles.infoText}>
                            Enter the 6-digit code sent to
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
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
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
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>Verify OTP</Text>
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
                </Animated.View>

                <ConsentModal
                    visible={false} // Hidden for redundancy here
                    type="ONBOARDING"
                    onAccept={() => { }}
                    onCancel={() => { }}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#283593', // Deep indigo blue
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
    },
    bgChar: {
        position: 'absolute',
        width: 100,
        height: 100,
    },
    charTopLeft: {
        top: '8%',
        left: '5%',
    },
    charTopRight: {
        top: '8%',
        right: '5%',
    },
    charBottomLeft: {
        bottom: '8%',
        left: '5%',
    },
    charBottomRight: {
        bottom: '8%',
        right: '5%',
    },
    charBottomCenter: {
        bottom: '2%',
        alignSelf: 'center',
        width: 120,
        height: 120,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    headerContent: {
        alignItems: 'center',
        marginBottom: 30,
    },
    brandTitle: {
        fontSize: 44,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    cardContainer: {
        paddingHorizontal: 28,
        zIndex: 10,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    cardTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#1A237E',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#3F51B5',
        fontWeight: '800',
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    phoneText: {
        fontWeight: 'bold',
        color: '#283593',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 32,
        gap: 8,
    },
    otpInput: {
        width: 44,
        height: 56,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E8EAF6',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    otpInputActive: {
        borderColor: '#3F51B5',
        borderWidth: 2,
    },
    verifyButton: {
        backgroundColor: '#3F51B5',
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        ...SHADOWS.medium,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendInfo: {
        fontSize: 14,
        color: '#666',
    },
    resendAction: {
        fontSize: 14,
        color: '#3f51b5',
        fontWeight: 'bold',
    },
    resendDisabled: {
        color: '#999',
    },
});

export default VerifyOtpScreen;
