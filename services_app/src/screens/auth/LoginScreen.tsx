import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Image,
    Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import ConsentModal from '../../components/ConsentModal';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
    const { requestOtp } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
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

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }
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

                    {/* Login Card */}
                    <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardSlideAnim }] }]}>
                        <View style={styles.card}>
                            <Image
                                source={require('../../assets/login_screen_title.png')}
                                style={styles.cardTitleImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.cardSubtitle}>Find • Connect • Earn</Text>

                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter mobile (e.g. 9999999999)"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                    maxLength={10}
                                    placeholderTextColor="#BBB"
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, (loading || phone.length < 10) && styles.buttonDisabled]}
                                onPress={handleSendOtp}
                                disabled={loading || phone.length < 10}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Send OTP</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.demoButton, loading && styles.buttonDisabled]}
                                onPress={() => {
                                    setPhone('9999999999');
                                    setShowConsent(true);
                                }}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.demoButtonText}>⚡ Quick Demo Login (9999999999)</Text>
                            </TouchableOpacity>

                            <Text style={styles.termsText}>
                                By continuing, you agree to our{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('TermsConditions' as any)}
                                >
                                    Terms of Service
                                </Text> and{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('PrivacyPolicy' as any)}
                                >
                                    Privacy Policy
                                </Text>
                            </Text>
                        </View>
                    </Animated.View>

                    <ConsentModal
                        visible={showConsent}
                        type="ONBOARDING"
                        onAccept={proceedWithOtp}
                        onCancel={() => setShowConsent(false)}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#283593', // Deep indigo blue
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
    headerContent: {
        alignItems: 'center',
        marginBottom: 40,
    },
    brandTitle: {
        fontSize: 48,
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
    cardTitleImage: {
        width: 260,
        height: 60,
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 10,
        color: '#3F51B5',
        fontWeight: '800',
        marginBottom: 32,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
        alignSelf: 'flex-start',
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
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#3F51B5',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
        ...SHADOWS.medium,
    },
    demoButton: {
        backgroundColor: '#E8EAF6',
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: '#C5CAE9',
    },
    demoButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#283593',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    forgotContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    forgotText: {
        color: '#3f51b5',
        fontSize: 14,
        fontWeight: '500',
    },
    signupText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    signupLink: {
        color: '#3f51b5',
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
    termsLink: {
        color: '#3f51b5',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
