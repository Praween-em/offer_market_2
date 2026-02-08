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
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Linking,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import DocumentPicker from 'react-native-document-picker';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const VerificationScreen = ({ navigation }: any) => {
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [zipFile, setZipFile] = useState<any>(null);
    const [shareCode, setShareCode] = useState('');

    const handlePickZip = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.zip],
                presentationStyle: 'fullScreen',
                copyTo: 'cachesDirectory',
            });

            if (result && result[0]) {
                const file = result[0];
                // Basic validation for size (e.g. < 5MB)
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert('File too large', 'Please upload a ZIP file smaller than 5MB.');
                    return;
                }
                // Use fileCopyUri if available (because copyTo: 'cachesDirectory' was used)
                const finalFile = {
                    ...file,
                    uri: file.fileCopyUri || file.uri
                };
                setZipFile(finalFile);
            }
        } catch (error) {
            if (!DocumentPicker.isCancel(error)) {
                console.error('Document picker error:', error);
                Alert.alert('Error', 'Failed to pick file.');
            }
        }
    };

    const handleVerify = async () => {
        if (!zipFile) {
            Alert.alert('Missing Requirement', 'Please upload your Offline Aadhaar XML ZIP file.');
            return;
        }
        if (!shareCode || shareCode.length !== 4) {
            Alert.alert('Invalid Input', 'Please enter the 4-digit Share Code you set when downloading the ZIP.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // Append ZIP File
            formData.append('aadhaar_zip', {
                uri: zipFile.uri,
                type: zipFile.type || 'application/zip',
                name: zipFile.name || 'offline_aadhaar.zip',
            } as any);

            // Append Share Code
            formData.append('share_code', shareCode);

            const token = await AsyncStorage.getItem('access_token');
            const response = await fetch(`${api.defaults.baseURL}/profile/verify-aadhaar/verify-offline`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data', // Let fetch handle boundary
                },
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Verification failed');
            }

            // Success
            Alert.alert(
                'Verification Successful',
                `Your identity has been verified via Offline XML!\n\nName: ${responseData.data?.full_name || 'Verified User'}`,
                [
                    {
                        text: 'Great!',
                        onPress: () => {
                            // Update local context
                            updateUser({
                                verification_status: 'VERIFIED',
                                provider: {
                                    ...responseData.data,
                                    is_verified: true,
                                    // If backend returns photo, we might want to refresh profile query
                                }
                            });
                            navigation.goBack();
                        },
                    },
                ]
            );

        } catch (error: any) {
            console.error('Offline Verification Error:', error);
            const msg = error.message || 'Failed to verify. Please try again.';
            Alert.alert('Verification Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const openUidaiWebsite = () => {
        Linking.openURL('https://myaadhaar.uidai.gov.in/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Verify Identity</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.infoCard}>
                        <Icon name="shield" size={40} color={COLORS.primary} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Offline XML Verification</Text>
                            <Text style={styles.infoText}>
                                Secure, paperless verification using your Aadhaar XML ZIP file. No OTP required here.
                            </Text>
                        </View>
                    </View>

                    {/* Instructions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>How to get your XML?</Text>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNum}>1.</Text>
                            <Text style={styles.stepText}>Go to UIDAI website (Paperless Offline e-KYC).</Text>
                        </View>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNum}>2.</Text>
                            <Text style={styles.stepText}>Login and download the XML ZIP file.</Text>
                        </View>
                        <View style={styles.instructionStep}>
                            <Text style={styles.stepNum}>3.</Text>
                            <Text style={styles.stepText}>Create a 4-digit Share Code (e.g., 1234).</Text>
                        </View>

                        <TouchableOpacity style={styles.linkButton} onPress={openUidaiWebsite}>
                            <Text style={styles.linkText}>Visit UIDAI Website</Text>
                            <Icon name="external-link" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Step 1: Upload ZIP */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>1. Upload ZIP File</Text>

                        {!zipFile ? (
                            <TouchableOpacity style={styles.uploadBox} onPress={handlePickZip}>
                                <Icon name="upload-cloud" size={32} color={COLORS.primary} />
                                <Text style={styles.uploadText}>Tap to select .zip file</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.filePreview}>
                                <View style={styles.fileIcon}>
                                    <Icon name="file-text" size={24} color={COLORS.white} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fileName} numberOfLines={1}>{zipFile.name}</Text>
                                    <Text style={styles.fileSize}>{(zipFile.size / 1024).toFixed(1)} KB</Text>
                                </View>
                                <TouchableOpacity onPress={() => setZipFile(null)} style={styles.removeBtn}>
                                    <Icon name="x" size={20} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Step 2: Share Code */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>2. Enter Share Code</Text>
                        <Text style={styles.subLabel}>The 4-digit code you set when downloading the file.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 1234"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="numeric"
                            maxLength={4}
                            value={shareCode}
                            onChangeText={setShareCode}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.verifyButton,
                            (!zipFile || shareCode.length !== 4 || loading) && styles.verifyButtonDisabled
                        ]}
                        onPress={handleVerify}
                        disabled={!zipFile || shareCode.length !== 4 || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Icon name="check-circle" size={20} color={COLORS.white} />
                                <Text style={styles.verifyButtonText}>Verify & Submit</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
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
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EEF2FF',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
    },
    infoTitle: {
        ...TYPOGRAPHY.h4,
        color: COLORS.primary,
        marginBottom: 2,
    },
    infoText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text,
        lineHeight: 18,
    },
    section: {
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.sm,
    },
    instructionStep: {
        flexDirection: 'row',
        marginBottom: 4,
        gap: 8,
    },
    stepNum: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    stepText: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
        flex: 1,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        gap: 6,
    },
    linkText: {
        ...TYPOGRAPHY.button,
        color: COLORS.primary,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: SPACING.xl,
    },
    label: {
        ...TYPOGRAPHY.h4,
        marginBottom: SPACING.xs,
    },
    subLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    uploadBox: {
        height: 120,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        gap: 8,
    },
    uploadText: {
        ...TYPOGRAPHY.bodySecondary,
        color: COLORS.textSecondary,
    },
    filePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.success,
        gap: SPACING.md,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
    },
    fileSize: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    removeBtn: {
        padding: 4,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.md,
        fontSize: 18,
        color: COLORS.text,
        letterSpacing: 2,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderRadius: 12,
        marginTop: SPACING.sm,
        height: 50,
        ...SHADOWS.medium,
    },
    verifyButtonDisabled: {
        opacity: 0.5,
        backgroundColor: COLORS.textSecondary,
    },
    verifyButtonText: {
        ...TYPOGRAPHY.button,
        color: COLORS.white,
        marginLeft: SPACING.sm,
        fontSize: 16,
    },
});

export default VerificationScreen;
