import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { LocationService } from '../../services/LocationService';
import { launchImageLibrary } from 'react-native-image-picker';
import { Platform } from 'react-native';

const EditProfileScreen = ({ navigation }: any) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const isVerified = !!user?.user_verification;
    const verifiedName = user?.user_verification?.full_name_xml;
    const verifiedPhoto = user?.user_verification?.photo_base64;

    const [formData, setFormData] = useState({
        display_name: verifiedName || user?.display_name || '',
        bio: user?.provider?.bio || '',
        experience_years: String(user?.provider?.experience_years || '0'),
        service_area: user?.provider?.service_area || '',
        whatsapp_number: user?.provider?.whatsapp_number || '',
        latitude: user?.provider?.latitude || null,
        longitude: user?.provider?.longitude || null,
    });
    const [detecting, setDetecting] = useState(false);
    const [profilePicture, setProfilePicture] = useState(verifiedPhoto || user?.provider?.profile_picture || '');
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.7,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            uploadImage(asset);
        }
    };

    const uploadImage = async (asset: any) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
                type: asset.type,
                name: asset.fileName || 'profile.jpg',
            } as any);

            const response = await api.post('/bunny/upload?folder=profiles', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfilePicture(response.data.url);
        } catch (error) {
            console.error('Upload failed', error);
            Alert.alert('Error', 'Could not upload photo.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDetectLocation = async () => {
        setDetecting(true);
        try {
            const loc = await LocationService.getCurrentLocation();
            if (loc) {
                const address = await LocationService.reverseGeocode(loc.latitude, loc.longitude);
                setFormData(prev => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    service_area: address
                }));
            }
        } catch (error) {
            console.error('Location detection failed', error);
            Alert.alert('Error', 'Could not detect location. Please type manually.');
        } finally {
            setDetecting(false);
        }
    };

    const handleSave = async () => {
        if (!formData.display_name.trim()) {
            Alert.alert('Error', 'Display name is required');
            return;
        }

        setLoading(true);
        try {
            await api.patch('/users/profile', {
                display_name: formData.display_name,
                bio: formData.bio,
                experience_years: parseInt(formData.experience_years, 10) || 0,
                service_area: formData.service_area,
                whatsapp_number: formData.whatsapp_number,
                latitude: formData.latitude,
                longitude: formData.longitude,
                profile_picture: profilePicture,
            });
            await refreshUser();
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Failed to update profile', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Edit Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    style={styles.saveHeaderButton}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.saveTabText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, isVerified && { borderColor: COLORS.success, borderWidth: 3 }]}>
                            {isVerified && user?.user_verification?.photo_base64 ? (
                                <Image
                                    source={{
                                        uri: user.user_verification.photo_base64.startsWith('data:')
                                            ? user.user_verification.photo_base64
                                            : `data:image/jpeg;base64,${user.user_verification.photo_base64}`
                                    }}
                                    style={styles.avatarImage}
                                />
                            ) : profilePicture ? (
                                <Image
                                    source={{ uri: profilePicture }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Icon name="user" size={40} color={COLORS.primary} />
                            )}
                        </View>
                        {isUploading && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator color={COLORS.white} />
                            </View>
                        )}
                        {!isVerified && (
                            <TouchableOpacity
                                style={styles.cameraBadge}
                                onPress={pickImage}
                                disabled={isUploading}
                            >
                                <Icon name="camera" size={16} color={COLORS.white} />
                            </TouchableOpacity>
                        )}
                        {isVerified && (
                            <View style={[styles.cameraBadge, { backgroundColor: COLORS.success }]}>
                                <Icon name="lock" size={14} color={COLORS.white} />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Full Name</Text>
                        {isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Icon name="shield" size={12} color={COLORS.success} />
                                <Text style={styles.verifiedText}>Aadhaar Verified</Text>
                            </View>
                        )}
                    </View>
                    <TextInput
                        style={[styles.input, isVerified && styles.disabledInput]}
                        value={formData.display_name}
                        onChangeText={(text) => setFormData({ ...formData, display_name: text })}
                        placeholder="Project Name or Your Name"
                        editable={!isVerified}
                    />
                    {isVerified && (
                        <Text style={styles.helperText}>Verified names cannot be changed.</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Short Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        placeholder="Tell clients about your expertise..."
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.section, { flex: 1, marginRight: SPACING.md }]}>
                        <Text style={styles.label}>Experience (Yrs)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.experience_years}
                            onChangeText={(text) => setFormData({ ...formData, experience_years: text })}
                            keyboardType="numeric"
                            placeholder="e.g. 5"
                        />
                    </View>
                    <View style={[styles.section, { flex: 2 }]}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Service Area</Text>
                            <TouchableOpacity onPress={handleDetectLocation} disabled={detecting}>
                                {detecting ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <View style={styles.detectBtn}>
                                        <Icon name="map-pin" size={14} color={COLORS.primary} />
                                        <Text style={styles.detectText}>Detect</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={formData.service_area}
                            onChangeText={(text) => setFormData({ ...formData, service_area: text })}
                            placeholder="e.g. Downtown, Mumbai"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>WhatsApp Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.whatsapp_number}
                        onChangeText={(text) => setFormData({ ...formData, whatsapp_number: text })}
                        keyboardType="phone-pad"
                        placeholder="Enter with country code"
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
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
        justifyContent: 'space-between',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: 4,
    },
    saveHeaderButton: {
        padding: 4,
    },
    saveTabText: {
        color: COLORS.primary,
        fontWeight: '700',
        fontSize: 16,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        ...TYPOGRAPHY.bodySecondary,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detectText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: SPACING.md,
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: SPACING.xl,
        ...SHADOWS.small,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: COLORS.textSecondary,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: `${COLORS.success}10`,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: COLORS.success,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.success,
    },
    helperText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
});

export default EditProfileScreen;
