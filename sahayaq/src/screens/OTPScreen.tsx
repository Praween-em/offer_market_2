import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Animated,
    useWindowDimensions
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../utils/theme';

const OTPScreen = ({ route, navigation }: any) => {
    const { phone, consentNotice } = route.params;
    const { verifyOtp } = useAuth();
    const insets = useSafeAreaInsets();
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
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

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code.');
            return;
        }

        setIsVerifying(true);
        try {
            await verifyOtp(phone, otp, consentNotice);
        } catch (error) {
            Alert.alert('Verification Failed', 'The code you entered is incorrect or has expired. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={false}
            >
                <View style={styles.container}>
                    {/* Background Characters */}
                    <Image
                        source={require('../assets/Sayayaq6.png')}
                        style={[styles.bgChar, styles.charTopLeft]}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/Sayayaq2-removebg-preview.png')}
                        style={[styles.bgChar, styles.charTopRight]}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/Sayayaq5.png')}
                        style={[styles.bgChar, styles.charBottomLeft]}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/Sayayaq8.png')}
                        style={[styles.bgChar, styles.charBottomCenter]}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/Sayayaq7.png')}
                        style={[styles.bgChar, styles.charBottomRight]}
                        resizeMode="contain"
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={[styles.backBtn, { top: insets.top + 20 }]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={28} color={COLORS.primary} />
                    </TouchableOpacity>

                    {/* OTP Card */}
                    <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardSlideAnim }] }]}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Verification</Text>
                            <Text style={styles.cardSubtitle}>sent to +91 {phone}</Text>

                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="000000"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                    autoFocus
                                    textAlign="center"
                                    placeholderTextColor="#BBB"
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.demoFillBtn}
                                onPress={() => setOtp('123456')}
                            >
                                <Text style={styles.demoFillText}>⚡ Use Demo OTP: 123456</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, (isVerifying || otp.length < 6) && styles.buttonDisabled]}
                                onPress={handleVerify}
                                disabled={isVerifying || otp.length < 6}
                                activeOpacity={0.8}
                            >
                                {isVerifying ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>Verify & Continue</Text>
                                        <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.resendBtn}>
                                <Text style={styles.resendText}>
                                    Didn't receive code? <Text style={styles.resendLink}>Resend OTP</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Secure • Trusted • Local</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.secondary, // Amber background
        justifyContent: 'center',
    },
    bgChar: {
        position: 'absolute',
        width: 120,
        height: 120,
    },
    charTopLeft: {
        top: '10%',
        left: '5%',
    },
    charTopRight: {
        top: '10%',
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
        width: 150,
        height: 150,
    },
    backBtn: {
        position: 'absolute',
        left: 20,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: 20,
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
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.primary,
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 13,
        color: COLORS.primary,
        fontWeight: '800',
        marginBottom: 32,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputWrapper: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E8EAF6',
        marginBottom: 24,
        height: 56,
        justifyContent: 'center',
        width: '100%',
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
    input: {
        paddingHorizontal: 12,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 4,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    demoFillBtn: {
        backgroundColor: '#FFF8E1',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#FFE082',
    },
    demoFillText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#D84315',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    resendBtn: {
        alignItems: 'center',
    },
    resendText: {
        fontSize: 13,
        color: '#999',
    },
    resendLink: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        color: 'rgba(0,0,0,0.3)',
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default OTPScreen;
