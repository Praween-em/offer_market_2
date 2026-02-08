
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';

const NomineeScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [nominee, setNominee] = useState({
        name: '',
        contact: '',
        relationship: ''
    });

    useEffect(() => {
        fetchNominee();
    }, []);

    const fetchNominee = async () => {
        try {
            const response = await api.get('/users/nominee');
            if (response.data) {
                setNominee({
                    name: response.data.nominee_name || '',
                    contact: response.data.nominee_contact || '',
                    relationship: response.data.relationship || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch nominee:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!nominee.name.trim() || !nominee.contact.trim() || !nominee.relationship.trim()) {
            Alert.alert('Missing Information', 'All fields are required to nominate a successor.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/nominee', nominee);
            Alert.alert('Success', 'Nominee information updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Failed to update nominee', error);
            Alert.alert('Error', 'Failed to save nominee info. Please ensure you have completed basic verification.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={TYPOGRAPHY.h2}>Manage Nominee</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.infoBox}>
                        <Icon name="info" size={20} color={COLORS.primary} />
                        <Text style={styles.infoText}>
                            As per Section 10 of DPDP Act 2026, you can nominate a person who will be responsible for managing your data rights in case of death or incapacity.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Nominee Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={nominee.name}
                            onChangeText={(text) => setNominee({ ...nominee, name: text })}
                            placeholder="Full Name of Nominee"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Nominee Contact Number</Text>
                        <TextInput
                            style={styles.input}
                            value={nominee.contact}
                            onChangeText={(text) => setNominee({ ...nominee, contact: text })}
                            keyboardType="phone-pad"
                            placeholder="Phone Number"
                            maxLength={10}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Relationship</Text>
                        <TextInput
                            style={styles.input}
                            value={nominee.relationship}
                            onChangeText={(text) => setNominee({ ...nominee, relationship: text })}
                            placeholder="e.g. Spouse, Child, Parent, Sibling"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Update Nominee</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    content: {
        padding: SPACING.lg,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: `${COLORS.primary}10`,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: `${COLORS.primary}30`,
    },
    infoText: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    label: {
        ...TYPOGRAPHY.bodySecondary,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 8,
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
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: SPACING.xl,
        ...SHADOWS.small,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default NomineeScreen;
