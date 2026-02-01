import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const VerificationScreen = ({ navigation }: any) => {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [aadhaarFile, setAadhaarFile] = useState<any>(null);
    const [selfieFile, setSelfieFile] = useState<any>(null);

    // Image Compression Options
    const commonOptions = {
        mediaType: 'photo' as const,
        quality: 0.5 as const,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
    };

    const aadhaarOptions = {
        ...commonOptions,
        quality: 0.8 as const,
        maxWidth: 1500,
        maxHeight: 1500,
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs access to your camera to verify your identity.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleAadhaarCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo of your Aadhaar.');
            return;
        }

        try {
            const result = await launchCamera(aadhaarOptions as CameraOptions);
            if (result.assets && result.assets[0]) {
                setAadhaarFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Camera error:', error);
        }
    };

    const handleAadhaarGallery = async () => {
        try {
            const result = await launchImageLibrary(aadhaarOptions as ImageLibraryOptions);
            if (result.assets && result.assets[0]) {
                setAadhaarFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Gallery error:', error);
        }
    };

    const handleAadhaarDocument = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.images],
            });
            if (result && result[0]) {
                setAadhaarFile(result[0]);
            }
        } catch (error) {
            if (!DocumentPicker.isCancel(error)) {
                console.error('Document picker error:', error);
            }
        }
    };

    const handleTakeSelfie = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a selfie.');
            return;
        }

        try {
            const result = await launchCamera({
                ...commonOptions,
                cameraType: 'front',
            } as CameraOptions);
            if (result.assets && result.assets[0]) {
                setSelfieFile(result.assets[0]);
            }
        } catch (error) {
            console.error('Selfie camera error:', error);
        }
    };

    const handleVerify = async () => {
        if (!aadhaarFile) {
            Alert.alert('Missing Requirement', 'Please upload your Aadhaar card.');
            return;
        }
        if (!selfieFile) {
            Alert.alert('Missing Requirement', 'Please take a selfie to verify your identity.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Append Aadhaar
            formData.append('aadhaar', {
                uri: aadhaarFile.uri,
                type: aadhaarFile.type || 'image/jpeg',
                name: aadhaarFile.fileName || aadhaarFile.name || 'aadhaar.jpg',
            } as any);

            // Append Selfie
            formData.append('selfie', {
                uri: selfieFile.uri,
                type: selfieFile.type || 'image/jpeg',
                name: selfieFile.fileName || selfieFile.name || 'selfie.jpg',
            } as any);

            const token = await AsyncStorage.getItem('access_token');
            const response = await fetch(`${api.defaults.baseURL}/profile/verify-aadhaar`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data', // Do NOT set this for fetch either
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Verification failed');
            }

            Alert.alert(
                'Verification Successful',
                `Your identity has been verified!\n\nName: ${responseData.data.name}\nDOB: ${responseData.data.dob}`,
                [
                    {
                        text: 'Great!',
                        onPress: () => {
                            updateUser({ verification_status: 'VERIFIED' });
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Verification Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to verify. Please try again.';
            Alert.alert('Verification Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderPreview = (file: any, label: string, onClear: () => void) => (
        <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>{label}</Text>
                <TouchableOpacity onPress={onClear}>
                    <Icon name="x" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
            {file.type?.startsWith('image') ? (
                <Image source={{ uri: file.uri }} style={styles.previewImage} />
            ) : (
                <View style={styles.docPreview}>
                    <Icon name="file-text" size={40} color={COLORS.secondary} />
                    <Text style={styles.docName} numberOfLines={1}>{file.fileName || file.name}</Text>
                </View>
            )}
            <View style={styles.successBadge}>
                <Icon name="check-circle" size={14} color={COLORS.secondary} />
                <Text style={styles.successText}>Ready to upload</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Verify Identity</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoCard}>
                    <Icon name="shield" size={40} color={COLORS.primary} />
                    <Text style={styles.infoText}>
                        Complete these 2 steps to verify your account. Your data is secure.
                    </Text>
                </View>

                {/* Step 1: Aadhaar */}
                <View style={styles.stepContainer}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepTitle}>Upload Aadhaar Card</Text>
                    </View>

                    {!aadhaarFile ? (
                        <View style={styles.uploadOptions}>
                            <TouchableOpacity style={styles.optionButton} onPress={handleAadhaarCamera}>
                                <Icon name="camera" size={20} color={COLORS.primary} />
                                <Text style={styles.optionText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.optionButton} onPress={handleAadhaarGallery}>
                                <Icon name="image" size={20} color={COLORS.primary} />
                                <Text style={styles.optionText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        renderPreview(aadhaarFile, 'Aadhaar Card', () => setAadhaarFile(null))
                    )}
                </View>

                {/* Step 2: Selfie */}
                <View style={styles.stepContainer}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepTitle}>Take a Selfie</Text>
                    </View>
                    <Text style={styles.stepDesc}>
                        Take a clear photo of yourself to confirm it's you.
                    </Text>

                    {!selfieFile ? (
                        <TouchableOpacity style={styles.selfieButton} onPress={handleTakeSelfie}>
                            <Icon name="camera" size={24} color={COLORS.white} />
                            <Text style={styles.selfieButtonText}>Take Selfie</Text>
                        </TouchableOpacity>
                    ) : (
                        renderPreview(selfieFile, 'Your Selfie', () => setSelfieFile(null))
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        (!aadhaarFile || !selfieFile || loading) && styles.verifyButtonDisabled
                    ]}
                    onPress={handleVerify}
                    disabled={!aadhaarFile || !selfieFile || loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Icon name="shield-check" size={20} color={COLORS.white} />
                            <Text style={styles.verifyButtonText}>Submit Verification</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    infoText: {
        ...TYPOGRAPHY.bodySecondary,
        flex: 1,
        color: COLORS.text,
    },
    stepContainer: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 16,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    stepNumberText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepTitle: {
        ...TYPOGRAPHY.h3,
        fontSize: 18,
    },
    stepDesc: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    uploadOptions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    optionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 8,
    },
    optionText: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
    },
    selfieButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.text,
        padding: SPACING.md,
        borderRadius: 12,
        gap: SPACING.sm,
    },
    selfieButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
    },
    previewCard: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    previewLabel: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    previewImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginBottom: SPACING.sm,
    },
    docPreview: {
        width: '100%',
        height: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    docName: {
        ...TYPOGRAPHY.caption,
        marginTop: SPACING.sm,
        maxWidth: '90%',
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    successText: {
        fontSize: 12,
        color: COLORS.secondary,
        fontWeight: '600',
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.sm,
        ...SHADOWS.medium,
    },
    verifyButtonDisabled: {
        opacity: 0.5,
        backgroundColor: COLORS.textSecondary,
    },
    verifyButtonText: {
        ...TYPOGRAPHY.button,
        marginLeft: SPACING.sm,
    },
});

export default VerificationScreen;
