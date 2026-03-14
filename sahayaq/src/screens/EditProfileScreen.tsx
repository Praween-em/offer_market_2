// Edit Profile Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const EditProfileScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();

    const [displayName, setDisplayName] = useState(user?.display_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);


    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert(t('error'), t('fullName') + ' ' + t('required'));
            return;
        }

        setIsSaving(true);
        try {
            const response = await api.patch('/users/profile', {
                display_name: displayName,
                email: email,
            });

            if (response.data) {
                updateUser(response.data);
                Alert.alert(t('success'), t('updateSuccess'), [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error('Update profile error', error);
            Alert.alert(t('error'), 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('editProfile')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <MaterialCommunityIcons name="account" size={80} color="#B2BEC3" />
                        </View>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('fullName')}</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#B2BEC3" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder={t('fullName')}
                                placeholderTextColor="#B2BEC3"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#B2BEC3" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t('emailPlaceholder')}
                                placeholderTextColor="#B2BEC3"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('phoneNumber') || 'Phone Number'}</Text>
                        <View style={[styles.inputWrapper, styles.disabledInput]}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color="#B2BEC3" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: '#B2BEC3' }]}
                                value={user?.phone || '+91 XXXXXXXXXX'}
                                editable={false}
                            />
                            <MaterialCommunityIcons name="lock" size={16} color="#B2BEC3" />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity
                    style={[styles.saveBtn, isSaving && styles.disabledBtn]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>{t('save')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F2F6',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D3436',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F2F6',
    },
    form: {
        paddingHorizontal: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2D3436',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#F1F2F6',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3436',
        fontWeight: '600',
        paddingVertical: 0,
    },
    disabledInput: {
        backgroundColor: '#F1F2F6',
        borderColor: '#E1E2E6',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F2F6',
    },
    saveBtn: {
        backgroundColor: '#FF4757',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    saveBtnText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
});

export default EditProfileScreen;
