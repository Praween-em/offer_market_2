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
    ScrollView,
    Image,
    Animated,
    Alert,
    useWindowDimensions
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SPACING } from '../utils/theme';
import ConsentModal from '../components/ConsentModal';

const LoginScreen = ({ navigation }: any) => {
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const { requestOtp } = useAuth();
    const { t } = useLanguage();
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
        if (!phone || phone.length < 10) {
            Alert.alert(t('error'), t('enterValidPhone'));
            return;
        }
        setShowConsent(true);
    };

    const proceedWithOtp = async (consentId?: string, noticeDetails?: any) => {
        setShowConsent(false);
        setLoading(true);
        try {
            await requestOtp(phone);
            navigation.navigate('OTP', { phone, consentNotice: noticeDetails });
        } catch (error: any) {
            console.error('Send OTP error:', error);
            Alert.alert(t('error'), 'Unable to send verification code. Please try again.');
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

                    {/* Login Card */}
                    <Animated.View style={[styles.cardContainer, { transform: [{ translateY: cardSlideAnim }] }]}>
                        <View style={styles.card}>
                            <Image
                                source={require('../assets/TITLE_IMAGE.png')}
                                style={styles.titleImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.cardSubtitle}>Search • POST • CONNECT</Text>

                            <Text style={styles.label}>{t('phone_number') || 'Phone Number'}</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('phone_placeholder') || 'Enter your phone number'}
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
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.buttonText}>{t('sendOtp')}</Text>
                                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                                    </View>
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
                                {t('terms_agree') || 'By continuing, you agree to our'}{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('TermsConditions' as any)}
                                >
                                    {t('terms_of_service') || 'Terms of Service'}
                                </Text> {t('and') || 'and'}{' '}
                                <Text
                                    style={styles.termsLink}
                                    onPress={() => navigation.navigate('PrivacyPolicy' as any)}
                                >
                                    {t('privacy_policy') || 'Privacy Policy'}
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
    titleImage: {
        width: '100%',
        height: 60,
        marginBottom: 12,
    },
    cardSubtitle: {
        fontSize: 13,
        color: COLORS.primary,
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
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
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
    termsText: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
        lineHeight: 16,
    },
    termsLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
        fontWeight: '700',
    },
});

export default LoginScreen;
